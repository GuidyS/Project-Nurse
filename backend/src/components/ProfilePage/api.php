<?php
// เอา Header CORS ออกไปเลย เพราะ index.php จัดการให้แล้ว

// 1. เริ่ม Session (สำคัญมากเพื่อให้รู้ว่าใคร Login)
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 2. เรียกไฟล์เชื่อมต่อฐานข้อมูล (ลบที่เรียกซ้ำซ้อนออกเหลืออันเดียว)
require_once __DIR__ . '/../../config/config.php';

// 3. ตรวจสอบว่า Login หรือยัง
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: No session found"]);
    exit;
}

$id = $_SESSION['user_id'];
$db = new Connect;

// 4. Query ข้อมูลอาจารย์ที่เชื่อมกับ user_id นี้
$sql = "SELECT f.*, u.username 
        FROM users u
        JOIN faculty f ON u.username = f.faculty_id
        WHERE u.user_id = :id";

$stmt = $db->prepare($sql);
$stmt->execute(['id' => $id]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    echo json_encode([
        "status" => "success",
        "data" => [
            "id" => $result['faculty_id'],
            "title" => $result['title'],
            "first_name" => $result['first_name_th'],
            "last_name" => $result['last_name_th'],
            "email" => $result['username'] . "@siam.edu",
            "phone" => $result['phone_number'] ?? "-",
            "position" => "อาจารย์พยาบาล",
            "program" => "-",
            "faculty" => "พยาบาลศาสตร์"
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลอาจารย์สำหรับ User ID: " . $id]);
}
exit;