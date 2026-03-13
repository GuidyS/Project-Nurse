<?php
//  เริ่มต้น Session (ต้องอยู่บรรทัดแรกสุดเสมอ!)
// ถ้าขาดบรรทัดนี้ $_SESSION['user_id'] จะว่างเปล่า และระบบจะคิดว่าไม่ได้ล็อกอิน
session_start();
// ตั้งค่า CORS ให้ Frontend (React) คุยกับ Backend ได้
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React Port 5173 เข้าถึงได้
header("Access-Control-Allow-Credentials: true");  // สำคัญ! อนุญาตให้ส่ง Cookie/Session มาด้วยได้
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//  เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

//  SECURITY CHECK
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
    //  LOGIC: แยกกรณี "อ่านอันเดียว" กับ "อ่านทั้งหมด"
    if (isset($input['id'])) {
        // CASE 1: กดอ่านทีละรายการ (ส่ง ID มา)
        $sql = "UPDATE notifications SET is_read = 1 WHERE notification_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $input['id']]);
    } else {
        // CASE 2: กดปุ่ม "อ่านทั้งหมด" (ไม่ได้ส่ง ID มา)
        // จะอัปเดตเฉพาะแจ้งเตือนของ User คนนี้เท่านั้น (ปลอดภัย ไม่ไปกระทบคนอื่น)
        $user_id = $_SESSION['user_id'];
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
    }

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>