<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// ถ้าเป็น Preflight Request ให้ตอบ OK กลับไปเลย
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

//  เชื่อมต่อฐานข้อมูล (Database Connection)
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    //  SECURITY: ตรวจสอบว่าผู้ใช้ Login หรือยัง?
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized (กรุณาเข้าสู่ระบบ)"]);
        exit();
    }

    //  SQL: ดึงรายวิชา (subject) ทั้งหมด
    // ดึง id, รหัสวิชา, ชื่อไทย, ชื่ออังกฤษ เพื่อเอาไปแสดงใน Dropdown
    $sql = "SELECT subject_id AS id, subject_code, subject_name_th, subject_name_en 
            FROM subject 
            ORDER BY subject_code ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(); // สั่งรันคำสั่ง SQL (ไม่มีตัวแปรให้ใส่ ก็ปล่อยว่าง)
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ส่งข้อมูลกลับไปเป็น JSON
    echo json_encode(["status" => "success", "data" => $courses]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>