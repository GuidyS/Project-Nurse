<?php
//  เริ่มต้น Session (ต้องอยู่บรรทัดแรกสุดเสมอ!)
// ถ้าขาดบรรทัดนี้ $_SESSION['user_id'] จะว่างเปล่า และระบบจะคิดว่าไม่ได้ล็อกอิน
session_start();
// ตั้งค่า CORS ให้ Frontend (React) คุยกับ Backend ได้
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");             // สำคัญ! อนุญาตให้ส่ง Cookie/Session มาด้วยได้
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//  เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);
 //  SECURITY CHECK: ป้องกันคนนอกเข้าใช้งาน
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

require_once __DIR__ . '/notification_hidden_helper.php';

if (isset($input['id'])) {
    try {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        ensureNotificationHiddenTable($pdo);

        $userId = (int)$_SESSION['user_id'];
        $notifId = (int)$input['id'];

        // ต้องเป็นผู้รับหรือผู้ส่งของการแจ้งเตือนใบนี้เท่านั้น
        $own = $pdo->prepare(
            "SELECT user_id, sender_user_id FROM notifications
             WHERE notification_id = :id AND (user_id = :uid OR sender_user_id = :uid2) LIMIT 1"
        );
        $own->execute([':id' => $notifId, ':uid' => $userId, ':uid2' => $userId]);
        $row = $own->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบการแจ้งเตือนนี้"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // ซ่อนเฉพาะฝั่งของผู้ใช้คนนี้ (อีกฝ่ายยังเห็นอยู่)
        $hide = $pdo->prepare(
            "INSERT IGNORE INTO notification_hidden (notification_id, user_id) VALUES (:id, :uid)"
        );
        $hide->execute([':id' => $notifId, ':uid' => $userId]);

        // ถ้าทั้งผู้รับและผู้ส่งซ่อนแล้ว (หรือไม่มีผู้ส่ง) ค่อยลบแถวจริงเพื่อไม่ให้ข้อมูลค้าง
        $receiverId = (int)$row['user_id'];
        $senderId = $row['sender_user_id'] !== null ? (int)$row['sender_user_id'] : null;

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM notification_hidden WHERE notification_id = :id");
        $countStmt->execute([':id' => $notifId]);
        $hiddenCount = (int)$countStmt->fetchColumn();

        $sidesNeeded = ($senderId !== null && $senderId !== $receiverId) ? 2 : 1;
        if ($hiddenCount >= $sidesNeeded) {
            $pdo->prepare("DELETE FROM notifications WHERE notification_id = :id")->execute([':id' => $notifId]);
            $pdo->prepare("DELETE FROM notification_hidden WHERE notification_id = :id")->execute([':id' => $notifId]);
        }

        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>