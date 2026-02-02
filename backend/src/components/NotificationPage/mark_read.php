<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$database = new Database();
$db = $database->getConnection();
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (isset($input['id'])) {
        // อ่านทีละอัน
        $sql = "UPDATE notifications SET is_read = 1 WHERE notification_id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $input['id']]);
    } else {
        // อ่านทั้งหมด (ของ User คนนี้)
        $user_id = 1; // แก้เป็น Session ในอนาคต
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
    }

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>