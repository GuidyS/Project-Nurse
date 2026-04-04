<?php
session_start();
// ตั้งค่า Header สำหรับให้ React เรียกใช้ข้ามโดเมนได้ (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// ถ้าเป็น Preflight Request จากเบราว์เซอร์ให้ตอบกลับ 200 ทันที
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// นำเข้า Middleware ตรวจสอบสิทธิ์ (Cookie/JWT)
require_once 'auth_middleware.php'; 
$userData = requireLogin();
$user_id = $_SESSION['user_id']; // รหัสของอาจารย์ที่กำลังใช้งานระบบ

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงข้อมูลการแจ้งเตือนของ user_id นึ้ เรียงจากใหม่ไปเก่า
    // DATE_FORMAT ใช้แยกวันที่และเวลาออกจาก created_at เพื่อส่งให้ React
    $sql = "SELECT 
                notification_id as id,
                type,
                title,
                message,
                student_id as studentId,
                is_read,
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                DATE_FORMAT(created_at, '%H:%i') as time
            FROM notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $raw_notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $notifications = [];
    $unreadCount = 0;

    // วนลูปเพื่อแปลงค่า is_read จาก 0/1 เป็น boolean (false/true) ตามที่ React คาดหวัง
    foreach ($raw_notifications as $noti) {
        $is_read_bool = (bool)$noti['is_read'];
        if (!$is_read_bool) {
            $unreadCount++;
        }

        $notifications[] = [
            "id" => $noti['id'],
            "type" => $noti['type'],
            "title" => $noti['title'],
            "message" => $noti['message'],
            "date" => $noti['date'],
            "time" => $noti['time'],
            "read" => $is_read_bool, // แปลงเป็น true/false
            "studentId" => $noti['studentId']
        ];
    }

    // ส่งข้อมูลกลับไปพร้อมจำนวนที่ยังไม่อ่าน จะได้ไม่ต้องไปคำนวณซ้ำที่หน้าเว็บ
    echo json_encode([
        "status" => "success", 
        "data" => [
            "notifications" => $notifications,
            "unreadCount" => $unreadCount
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>