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

    $db = new Connect();
    $userId = approvalRequireAuth($db);
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    $roleId = approvalCurrentRoleId($db);

    if ($roleId === 3) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Students cannot create admin approval requests'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $requestId = approvalCreateRequest($db, [
        'request_type' => $payload['request_type'] ?? '',
        'requester_user_id' => $userId,
        'target_ref_type' => $payload['target_ref_type'] ?? null,
        'target_ref_id' => $payload['target_ref_id'] ?? null,
        'title' => $payload['title'] ?? '',
        'description' => $payload['description'] ?? null,
        'payload_json' => $payload['payload'] ?? [],
        'before_json' => $payload['before'] ?? null,
        'after_json' => $payload['after'] ?? null,
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Approval request created',
        'id' => $requestId,
    ], JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
