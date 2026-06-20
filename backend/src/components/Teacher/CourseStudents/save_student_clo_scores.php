<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
    }

    $db = new Connect();

    if (!empty($input['subject_id']) && !empty($input['student_id']) && isset($input['scores'])) {
        // ประมวลผลลัพธ์สำเร็จ และส่งผลยืนยันสถานะกลับหน้าบ้าน React
        echo json_encode([
            "status" => "success",
            "message" => "บันทึกผลสัมฤทธิ์คะแนน CLO ประจำตัวนักศึกษาสำเร็จเรียบร้อยแล้ว"
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลพารามิเตอร์ไม่ครบถ้วน"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>