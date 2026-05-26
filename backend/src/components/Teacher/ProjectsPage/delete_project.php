<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['project_id'])) {
        $sql = "DELETE FROM project WHERE project_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $input['project_id']]);

        echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing ID"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถลบได้ (อาจมีการใช้งานอยู่)"]);
}
?>