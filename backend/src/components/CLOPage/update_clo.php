<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// ... (โค้ดเดิมที่เหลือปล่อยไว้เหมือนเดิมได้เลยครับ)

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);
//เช็กความพร้อมก่อนอัปเดต (isset($input['id']))  เช็กว่าจะมี $input['id'] ส่งมาหรือไม่?
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
   
    if (!empty($input['clo_id']) && !empty($input['description'])) {
        
        //  SQL Update: แก้ไข description และ ylo_id
        $sql = "UPDATE clo 
                SET description = :description, 
                    ylo_id = :ylo_id
                WHERE clo_id = :clo_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':description' => $input['description'],
            ':ylo_id' => $input['ylo_id'] ?? null, 
            ':clo_id' => $input['clo_id']
        ]);

        echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>