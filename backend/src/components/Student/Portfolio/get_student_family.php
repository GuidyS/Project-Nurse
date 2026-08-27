<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;

if (!$student_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    $db = new Connect();
    $sql = "SELECT 
                father_first_name, father_last_name, father_age, father_phone, father_address,
                mother_first_name, mother_last_name, mother_age, mother_phone, mother_address
            FROM student
            WHERE student_id = :student_id
            LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([':student_id' => $student_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษา"]);
        exit();
    }

    echo json_encode(["status" => "success", "data" => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>