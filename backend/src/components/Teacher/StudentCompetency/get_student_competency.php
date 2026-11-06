<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/competency_result_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

// รองรับทุกรูปแบบชื่อพารามิเตอร์ที่หน้าบ้านอาจส่งมา
$targetStudentId = trim((string)($_GET['student_id'] ?? $_GET['studentId'] ?? $_GET['id'] ?? ''));
if ($targetStudentId === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสนักศึกษา"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $yearLevel = isset($_GET['year_level']) && (int)$_GET['year_level'] > 0
        ? (int)$_GET['year_level']
        : null;

    echo json_encode([
        "status" => "success",
        "data" => competencyResultPayload($db, $targetStudentId, $yearLevel),
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
