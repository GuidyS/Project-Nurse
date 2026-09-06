<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/Approvals/approval-schema.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);
    $reviewerId = approvalRequireAdmin($db);

    $requestId = isset($data['request_id']) ? (int)$data['request_id'] : 0;
    $status = (string)($data['status'] ?? '');
    $reviewNote = $data['reviewNote'] ?? null;

    if ($requestId <= 0 || !in_array($status, ['approved', 'rejected'], true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid transfer review request'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($status === 'rejected') {
        $stmt = $db->prepare("
            UPDATE approval_requests
            SET status = 'rejected',
                review_note = :review_note,
                reviewed_by = :reviewed_by,
                reviewed_at = NOW(),
                updated_at = NOW()
            WHERE approval_request_id = :id
              AND request_type = 'student_transfer'
              AND status = 'pending'
        ");
        $stmt->execute([
            ':review_note' => $reviewNote,
            ':reviewed_by' => $reviewerId,
            ':id' => $requestId,
        ]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Transfer request not found or already reviewed');
        }
        approvalLogAction($db, 'reject', $requestId, $reviewerId, 'advisor transfer');
        echo json_encode(['status' => 'success', 'message' => 'Transfer request rejected'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();
    $stmt = $db->prepare("
        SELECT *
        FROM approval_requests
        WHERE approval_request_id = :id
          AND request_type = 'student_transfer'
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([':id' => $requestId]);
    $request = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$request || ($request['status'] ?? '') !== 'pending') {
        throw new Exception('Transfer request not found or already reviewed');
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
        ':id' => $requestId,
    ]);
    approvalLogAction($db, 'approve', $requestId, $reviewerId, 'advisor transfer');
    $db->commit();

    echo json_encode(['status' => 'success', 'message' => 'Transfer request approved'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
