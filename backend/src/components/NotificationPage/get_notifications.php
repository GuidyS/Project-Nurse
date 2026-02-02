<?php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ดักจับ Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }


// 2. ส่วนเชื่อมต่อ Database (แบบ direct เหมือนไฟล์อื่น)
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // กำหนด User ID = 1 (อาจารย์) ไปก่อน
    $user_id = 1; 

    // SQL ดึงข้อมูล
    $sql = "SELECT 
                notification_id AS id,
                title,
                message,
                type,
                'in-app' AS channel,
                'ระบบ' AS recipient,
                is_read AS isRead,
                created_at AS createdAt
            FROM notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // แปลงข้อมูลให้สวยงาม
    foreach ($notifications as &$row) {
        $row['id'] = (int)$row['id'];
        $row['isRead'] = (bool)$row['isRead'];
        $row['createdAt'] = date('d/m/Y H:i', strtotime($row['createdAt'])); 
    }

    echo json_encode(["status" => "success", "data" => $notifications]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>