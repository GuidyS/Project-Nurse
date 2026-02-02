<?php
//   เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();

//   ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ถ้าเป็น Preflight Request (การเช็คสิทธิ์ก่อนส่งจริง) ให้ตอบ OK กลับไปเลย
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

//   เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    //  SECURITY: เช็คว่า Login หรือยัง (ถ้ายัง ให้หยุดทำงาน)
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    // SQL: ดึงรหัสวิชาและชื่อวิชา (เฉพาะ Active หรือทั้งหมดตามต้องการ)
    // เรียงตามรหัสวิชา
    $sql = "SELECT subject_id, subject_code, subject_name_th, subject_name_en 
            FROM subject 
            ORDER BY subject_code ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $subjects]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>