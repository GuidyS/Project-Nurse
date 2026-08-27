<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// สร้างตารางเก็บ "ใบที่ผู้ใช้ลบออกจากรายการตัวเอง" ถ้ายังไม่มี (ครั้งแรกเท่านั้น)
require_once __DIR__ . '/notification_hidden_helper.php';
ensureNotificationHiddenTable($pdo);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT
                n.notification_id AS id,
                n.title,
                n.message,
                n.type,
                n.channel,
                CASE
                    WHEN n.sender_user_id = :current_user_id THEN 'sent'
                    ELSE 'received'
                END AS direction,
                
                -- 🔍 ลอจิกดึงชื่อผู้รับ (Recipient)
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(f_rec.title, ''), COALESCE(f_rec.first_name_th, ''), ' ', COALESCE(f_rec.last_name_th, ''))), ''),
                    IF(u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', u.username),
                    'ระบบ'
                ) AS recipient,
                
                -- 🔍 ลอจิกดึงชื่อผู้ส่ง (Sender)
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(f_sender.title, ''), COALESCE(f_sender.first_name_th, ''), ' ', COALESCE(f_sender.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(s_sender.title, ''), COALESCE(s_sender.first_name_th, ''), ' ', COALESCE(s_sender.last_name_th, ''))), ''),
                    IF(sender_u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', sender_u.username),
                    'ระบบ'
                ) AS sender,
                
                n.is_read AS isRead,
                n.created_at AS createdAt
            FROM notifications n
            
            -- JOIN สำหรับหาข้อมูลผู้รับ
            LEFT JOIN users u ON n.user_id = u.user_id
            LEFT JOIN student s ON CAST(u.username AS UNSIGNED) = s.student_id
            LEFT JOIN faculty f_rec ON CAST(u.username AS CHAR) = f_rec.faculty_id
            
            -- JOIN สำหรับหาข้อมูลผู้ส่ง
            LEFT JOIN users sender_u ON n.sender_user_id = sender_u.user_id
            LEFT JOIN faculty f_sender ON CAST(sender_u.username AS CHAR) = f_sender.faculty_id
            LEFT JOIN student s_sender ON CAST(sender_u.username AS UNSIGNED) = s_sender.student_id
            
            WHERE (n.user_id = :filter_user_id OR n.sender_user_id = :filter_user_id)
              -- ไม่แสดงใบที่ผู้ใช้คนนี้ลบออกจากรายการของตัวเองแล้ว (อีกฝ่ายยังเห็นอยู่)
              AND NOT EXISTS (
                    SELECT 1 FROM notification_hidden nh
                    WHERE nh.notification_id = n.notification_id AND nh.user_id = :hidden_user_id
              )
            ORDER BY n.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':current_user_id' => $user_id,
        ':filter_user_id' => $user_id,
        ':hidden_user_id' => $user_id,
    ]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($notifications as &$row) {
        $row['id'] = (int) $row['id'];
        $row['isRead'] = (bool) $row['isRead'];
        $row['createdAt'] = date('d/m/Y H:i', strtotime($row['createdAt']));
    }

    echo json_encode(["status" => "success", "data" => $notifications]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
