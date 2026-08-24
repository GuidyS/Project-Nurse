<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/approval-schema.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($payload['id']) ? (int)$payload['id'] : 0;
    $reviewNote = $payload['reviewNote'] ?? null;

    if ($id <= 0) {
        throw new InvalidArgumentException('Missing approval request id');
    }

    $db = new Connect();
    ensureApprovalRequestsSchema($db);
    $reviewerId = approvalRequireAdmin($db);

    $db->beginTransaction();

    $stmt = $db->prepare("
        SELECT *
        FROM approval_requests
        WHERE approval_request_id = :id
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([':id' => $id]);
    $request = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        throw new RuntimeException('Approval request not found');
    }
    if (($request['status'] ?? '') !== 'pending') {
        throw new RuntimeException('Approval request has already been reviewed');
    }

    approvalApplyRequest($db, $request);

    $update = $db->prepare("
        UPDATE approval_requests
        SET status = 'approved',
            review_note = :review_note,
            reviewed_by = :reviewed_by,
            reviewed_at = NOW(),
            applied_at = NOW(),
            updated_at = NOW()
        WHERE approval_request_id = :id
          AND status = 'pending'
    ");
    $update->execute([
        ':review_note' => $reviewNote,
        ':reviewed_by' => $reviewerId,
        ':id' => $id,
    ]);

    if ($update->rowCount() === 0) {
        throw new RuntimeException('Approval request could not be updated');
    }

    approvalLogAction($db, 'approve', $id, $reviewerId);
    $db->commit();

    echo json_encode(['status' => 'success', 'message' => 'Approval request approved'], JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
