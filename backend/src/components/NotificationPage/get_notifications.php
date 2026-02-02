<?php
//  เริ่มต้น Session (ต้องอยู่บรรทัดแรกสุดเสมอ!)
// ถ้าขาดบรรทัดนี้ $_SESSION['user_id'] จะว่างเปล่า และระบบจะคิดว่าไม่ได้ล็อกอิน
session_start();

// ตั้งค่า CORS ให้ Frontend (React) คุยกับ Backend ได้
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React Port 5173 เข้าถึงได้
header("Access-Control-Allow-Credentials: true");             // สำคัญ! อนุญาตให้ส่ง Cookie/Session มาด้วยได้
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ถ้า Browser ส่ง Preflight Request มาเช็ค ให้ตอบกลับ OK ไปก่อนเลย
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

//  เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    //  SECURITY CHECK: ป้องกันคนนอกเข้าใช้งาน
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401); // 401 = Unauthorized (ยังไม่ได้รับอนุญาต)
        echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบก่อน (Please Login)"]);
        exit();
    }

    //  ดึง ID ของคนที่ล็อกอินอยู่มาจาก Session 
    $user_id = $_SESSION['user_id'];
    $sql = "SELECT 
                notification_id AS id,
                title,
                message,
                type,
                channel,  
                'ระบบ' AS recipient,
                is_read AS isRead,
                created_at AS createdAt
            FROM notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

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