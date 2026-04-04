<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 1. เรียกใช้ Middleware ตรวจสอบสิทธิ์
require_once 'auth_middleware.php'; 
$userData = requireLogin();
$user_id = $_SESSION['user_id']; // รหัส user ปัจจุบัน

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 2. ดึงจำนวนนักศึกษาทั้งหมดที่กำลังศึกษาอยู่ (สถานะ = 'Studying')
    $stmt_std = $pdo->query("SELECT COUNT(*) FROM student WHERE status = 'Studying'");
    $total_students = $stmt_std->fetchColumn();

    // 3. ดึงจำนวนอาจารย์/บุคลากรทั้งหมด 
    // (เช็คจากตาราง faculty)
    $stmt_fac = $pdo->query("SELECT COUNT(*) FROM faculty");
    $total_faculties = $stmt_fac->fetchColumn();

    // 4. ดึงจำนวนรายวิชาที่กำลังเปิดสอน (ตาราง subject ที่ is_active = 1)
    $stmt_sub = $pdo->query("SELECT COUNT(*) FROM subject WHERE is_active = 1");
    $total_subjects = $stmt_sub->fetchColumn();

    // 5. ดึงจำนวนการแจ้งเตือนที่ "ยังไม่ได้อ่าน" ของคนที่กำลังล็อกอินอยู่
    $stmt_noti = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt_noti->execute([$user_id]);
    $unread_notis = $stmt_noti->fetchColumn();

    // 6. ส่งข้อมูลทั้งหมดกลับไปให้ React
    echo json_encode([
        "status" => "success", 
        "data" => [
            "total_students" => (int)$total_students,
            "total_faculties" => (int)$total_faculties,
            "total_subjects" => (int)$total_subjects,
            "unread_notifications" => (int)$unread_notis
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>