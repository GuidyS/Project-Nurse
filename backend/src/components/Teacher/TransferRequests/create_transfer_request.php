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

if (empty($data['student_id']) || empty($data['to_advisor_id']) || !isset($data['reason'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing transfer request fields'], JSON_UNESCAPED_UNICODE);
    exit;
}

function resolveAdvisor(PDO $db, string $advisorRef): array
{
    $stmt = $db->prepare("
        SELECT u.user_id, u.username AS faculty_id
        FROM users u
        WHERE CAST(u.username AS CHAR) = :advisor_ref
           OR CAST(u.user_id AS CHAR) = :advisor_user_ref
        LIMIT 1
    ");
    $stmt->execute([
        ':advisor_ref' => $advisorRef,
        ':advisor_user_ref' => $advisorRef,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        return [
            'user_id' => (int)$row['user_id'],
            'faculty_id' => (string)$row['faculty_id'],
        ];
    }

    return [
        'user_id' => null,
        'faculty_id' => $advisorRef,
    ];
}

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);
    approvalRequireAuth($db);

    if (approvalCurrentRoleId($db) !== 2 && approvalCurrentRoleId($db) !== 1) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Only teachers can request advisor transfer'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $fromAdvisorRef = (string)($data['from_advisor_id'] ?? $_SESSION['username'] ?? $_SESSION['user_id'] ?? '');
    $toAdvisorRef = (string)$data['to_advisor_id'];
    $studentId = (string)$data['student_id'];
    $reason = trim((string)$data['reason']);

    $fromAdvisor = resolveAdvisor($db, $fromAdvisorRef);
    $toAdvisor = resolveAdvisor($db, $toAdvisorRef);

    if (!$fromAdvisor['user_id']) {
        throw new Exception('Requester advisor not found');
    }

    $payload = [
        'student_id' => $studentId,
        'from_advisor_id' => $fromAdvisor['faculty_id'],
        'to_advisor_id' => $toAdvisor['faculty_id'],
        'from_advisor_user_id' => $fromAdvisor['user_id'],
        'to_advisor_user_id' => $toAdvisor['user_id'],
        'reason' => $reason,
    ];

    $requestId = approvalCreateRequest($db, [
        'request_type' => 'student_transfer',
        'requester_user_id' => $fromAdvisor['user_id'],
        'target_ref_type' => 'student',
        'target_ref_id' => $studentId,
        'title' => 'Advisor transfer request',
        'description' => $reason,
        'payload_json' => $payload,
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Transfer request created and sent to Admin',
        'id' => $requestId,
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
