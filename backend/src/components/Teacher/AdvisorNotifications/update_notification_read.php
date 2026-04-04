<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
$userData = requireLogin();
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    // เช็คว่า React ส่งข้อมูลอะไรมาทำเครื่องหมายว่าอ่านแล้ว (เฉพาะ ID หรือ ทั้งหมด)
    $action_type = $input['action'] ?? ''; // 'single' หรือ 'all'
    $notification_id = $input['notification_id'] ?? null;

    if ($action_type === 'all') {
        // กรณีคลิก "อ่านทั้งหมด"
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id AND is_read = 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
        
        echo json_encode(["status" => "success", "message" => "ทำเครื่องหมายอ่านแล้วทั้งหมดสำเร็จ"]);

    } else if ($action_type === 'single' && $notification_id) {
        // กรณีคลิก "อ่านแล้ว" แค่รายการเดียว
        $sql = "UPDATE notifications SET is_read = 1 WHERE notification_id = :noti_id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':noti_id' => $notification_id,
            ':user_id' => $user_id
        ]);

        echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลนำเข้าไม่ถูกต้อง"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>