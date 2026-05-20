<?php
//  เริ่มต้น Session (ต้องอยู่บรรทัดแรกสุดเสมอ!)
// ถ้าขาดบรรทัดนี้ $_SESSION['user_id'] จะว่างเปล่า และระบบจะคิดว่าไม่ได้ล็อกอิน
session_start(); //  เริ่ม Session เพื่อเช็คว่าใครเป็นคนส่ง
// ตั้งค่า CORS ให้ Frontend (React) คุยกับ Backend ได้
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React Port 5173 เข้าถึงได้
header("Access-Control-Allow-Credentials: true");  // สำคัญ! อนุญาตให้ส่ง Cookie/Session มาด้วยได้
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//  เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
// รับข้อมูล JSON ที่ Frontend ส่งมา (เช่น หัวข้อ, ข้อความ, รายชื่อ นศ.)
$input = json_decode(file_get_contents("php://input"), true);

// 🔒 SECURITY CHECK: ต้องล็อกอินก่อนถึงจะส่งข้อความได้
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

// ตรวจสอบว่าส่งข้อมูลมาครบไหม (ต้องมีรายชื่อ นศ. และหัวข้อ)
if ($input && !empty($input['student_ids']) && !empty($input['title'])) {
    try {
        //  TRANSACTION START: เริ่มกระบวนการบันทึกแบบกลุ่ม
        // ถ้าการบันทึกคนใดคนหนึ่งพัง ระบบจะยกเลิกทั้งหมด (Rollback) เพื่อไม่ให้ข้อมูลขยะตกค้าง
        $pdo->beginTransaction(); 

        $sql = "INSERT INTO notifications (user_id, title, message, type, is_read) 
                VALUES (:user_id, :title, :message, 'info', 0)";
        $stmt = $pdo->prepare($sql);

        //  LOOP: วนลูปส่งแจ้งเตือนให้ นศ. ทีละคน ตามรายชื่อที่เลือกมา
        foreach ($input['student_ids'] as $student_user_id) {
            $stmt->execute([
                ':user_id' => $student_user_id,
                ':title' => $input['title'],
                ':message' => $input['message']
            ]);
        }

        //  COMMIT: บันทึกจริงเมื่อทุกอย่างเรียบร้อย
        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "ส่งแจ้งเตือนสำเร็จ"]);

    } catch (Exception $e) {
        //  ROLLBACK: ย้อนกลับถ้ามี error
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
}
?>