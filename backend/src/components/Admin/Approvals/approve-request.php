<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/approval-schema.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($payload['id']) ? (int)$payload['id'] : 0;
    $reviewNote = $payload['reviewNote'] ?? null;

    if ($id <= 0) {
        throw new Exception('ไม่พบรหัสคำขออนุมัติ');
    }

    $db = new Connect();
    ensureApprovalRequestsSchema($db);

    $reviewerId = $_SESSION['user_id'] ?? 1;
    $stmt = $db->prepare("
        UPDATE approval_requests
        SET status = 'approved',
            review_note = :review_note,
            reviewed_by = :reviewed_by,
            reviewed_at = NOW()
        WHERE approval_request_id = :id
    ");
    $stmt->execute([
        ':review_note' => $reviewNote,
        ':reviewed_by' => $reviewerId,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('ไม่พบคำขออนุมัติที่ต้องการอัปเดต');
    }

    $requestStmt = $db->prepare("
        SELECT request_type, target_ref_type, target_ref_id
        FROM approval_requests
        WHERE approval_request_id = :id
        LIMIT 1
    ");
    $requestStmt->execute([':id' => $id]);
    $request = $requestStmt->fetch(PDO::FETCH_ASSOC);

    if ($request && $request['request_type'] === 'project_request' && $request['target_ref_type'] === 'project') {
        $projectId = (int)$request['target_ref_id'];
        if ($projectId > 0) {
            $projectStmt = $db->prepare("
                UPDATE project
                SET status = 'active'
                WHERE project_id = :project_id
            ");
            $projectStmt->execute([':project_id' => $projectId]);
        }
    }

    logApprovalAction($db, 'อนุมัติ', $id, (int)$reviewerId);
    echo json_encode(['status' => 'success', 'message' => 'อนุมัติคำขอสำเร็จ'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
