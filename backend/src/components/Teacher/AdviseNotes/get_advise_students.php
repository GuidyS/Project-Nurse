<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงรหัสนักศึกษา ชื่อ และนามสกุล จากตาราง student (เฉพาะคนที่ยังเรียนอยู่)
    // *ถ้าอนาคตอยากให้ดึงเฉพาะเด็กในที่ปรึกษา ต้อง JOIN กับตาราง student_advisor_mapping ครับ
    $sql = "SELECT student_id, student_code as id, CONCAT(first_name_th, ' ', last_name_th) as name 
            FROM student 
            WHERE status = 'Studying' 
            ORDER BY student_code ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $students]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>