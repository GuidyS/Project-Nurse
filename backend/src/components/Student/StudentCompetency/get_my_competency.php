<?php
/**
 * ผลการประเมินสมรรถนะหลักของนักศึกษาที่ล็อกอินอยู่
 *
 * ใช้ตัวคำนวณชุดเดียวกับหน้าของอาจารย์ที่ปรึกษา (competency_result_helpers.php)
 * เพื่อให้ทั้งสองหน้าแสดงผลตรงกันเสมอ
 */
ob_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Teacher/StudentCompetency/competency_result_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบก่อนใช้งาน"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลผู้ใช้งานในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // หน้านี้ของนักศึกษาเท่านั้น และดูได้เฉพาะผลของตัวเอง
    if ((int)($user['role_id'] ?? 0) !== 3) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "หน้านี้สำหรับนักศึกษาเท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $studentId = (string)($user['username'] ?? '');
    if ($studentId === '') {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบรหัสนักศึกษาของผู้ใช้งานนี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "data" => competencyResultPayload($db, $studentId),
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
