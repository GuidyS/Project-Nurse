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

    $stmt = $db->prepare("
        UPDATE approval_requests
        SET status = 'rejected',
            review_note = :review_note,
            reviewed_by = :reviewed_by,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE approval_request_id = :id
          AND status = 'pending'
    ");
    $stmt->execute([
        ':review_note' => $reviewNote,
        ':reviewed_by' => $reviewerId,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        throw new RuntimeException('Approval request not found or already reviewed');
    }

    approvalLogAction($db, 'reject', $id, $reviewerId);
    echo json_encode(['status' => 'success', 'message' => 'Approval request rejected'], JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
