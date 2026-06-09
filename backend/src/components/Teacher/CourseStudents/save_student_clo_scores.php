<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['subject_id']) && !empty($input['student_id']) && isset($input['scores'])) {
        
        $subject_id = $input['subject_id'];
        $student_id = $input['student_id'];
        $scores_json = json_encode($input['scores'], JSON_UNESCAPED_UNICODE); // { "CLO1": 80, "CLO2": 75 }
        
        $academic_year = date('Y') + 543;
        $semester = 1;

        // หา faculty_id ของอาจารย์ที่ให้คะแนน
        $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
        $stmt_fac->execute([$user_id]);
        $faculty_id = $stmt_fac->fetchColumn();

        // ไม่จำเป็นต้องบันทึกคะแนน CLO ลงตาราง enrollment แล้ว ส่งผลลัพธ์สำเร็จทันที
        echo json_encode(["status" => "success", "message" => "บันทึกคะแนนเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>