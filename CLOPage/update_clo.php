<?php

// === เปลี่ยน Header ชุดนี้ให้เหมือนกันทุกไฟล์ ===
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// ... (โค้ดเดิมที่เหลือปล่อยไว้เหมือนเดิมได้เลยครับ)

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);
//เช็กความพร้อมก่อนอัปเดต (isset($input['id']))  เช็กว่าจะมี $input['id'] ส่งมาหรือไม่?
if ($input && isset($input['id'])) {
    try {
        // อัปเดตคำอธิบาย หรือเปลี่ยนการจับคู่กับ YLO ใหม่
        $sql = "UPDATE clo SET description = :description, ylo_id = :ylo_id WHERE clo_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $input['id'],
            ':description' => $input['description'],
            ':ylo_id' => $input['ylo_id'] ?? null
        ]);

        echo json_encode(["status" => "success", "message" => "CLO updated successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing CLO ID"]);
}
?>