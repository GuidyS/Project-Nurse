<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();

    // เช็คระบบโครงสร้างความปลอดภัยก่อนว่ารันตารางแจ้งเตือนไว้หรือยัง
    $table_check = $db->query("SHOW TABLES LIKE 'avisor_notifications'")->rowCount();
    if ($table_check === 0) {
        echo json_encode([
            "status" => "success",
            "data" => ["notifications" => [], "unreadCount" => 0]
        ]);
        exit();
    }

    // ดึงข้อมูลการแจ้งเตือนรายบุคคล แยกส่วนวัน/เวลา ออกมาด้วยฟังก์ชัน DATE_FORMAT
    $sql = "SELECT 
                notification_id as id,
                type,
                title,
                message,
                student_id as studentId,
                is_read,
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                DATE_FORMAT(created_at, '%H:%i') as time
            FROM avisor_notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $raw_notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $notifications = [];
    $unreadCount = 0;

    foreach ($raw_notifications as $noti) {
        $is_read_bool = (bool)$noti['is_read'];
        if (!$is_read_bool) {
            $unreadCount++;
        }

        $notifications[] = [
            "id" => (int)$noti['id'],
            "type" => $noti['type'],
            "title" => $noti['title'],
            "message" => $noti['message'],
            "date" => $noti['date'],
            "time" => $noti['time'],
            "read" => $is_read_bool,
            "studentId" => $noti['studentId']
        ];
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "notifications" => $notifications,
            "unreadCount" => $unreadCount
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>