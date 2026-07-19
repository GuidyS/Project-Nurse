<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();
    $action_type = $input['action'] ?? '';
    $notification_id = $input['notification_id'] ?? null;

    if ($action_type === 'all') {
        // 1. กรณีคลิกอ่านทั้งหมด
        $sql = "UPDATE notifications
                SET is_read = 1
                WHERE user_id = :user_id
                  AND is_read = 0
                  AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.module')) = 'advisor'";
        $stmt = $db->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
        echo json_encode(["status" => "success", "message" => "ทำเครื่องหมายอ่านทั้งหมดสำเร็จ"]);
        exit();
    } else if ($action_type === 'single' && $notification_id) {
        // 2. กรณีคลิกอ่านเฉพาะรายการเดียว
        $sql = "UPDATE notifications
                SET is_read = 1
                WHERE notification_id = :noti_id
                  AND user_id = :user_id
                  AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.module')) = 'advisor'";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':noti_id' => $notification_id,
            ':user_id' => $user_id
        ]);
        echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"]);
        exit();
    } else {
        throw new Exception("ข้อมูลการทำรายการไม่ถูกต้อง");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>