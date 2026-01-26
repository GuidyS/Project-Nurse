<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

if ($input && isset($input['id'])) {
    try {
        //ขียนคำสั่งลบข้อมูล (DELETE) จากตาราง clo ตรงจุดที่ clo_id มีค่าเท่ากับ :id
        $sql = "DELETE FROM clo WHERE clo_id = :id";
        //(prepare): สั่งให้ฐานข้อมูลเตรียมตัวรับคำสั่งนี้
        $stmt = $pdo->prepare($sql);
        //(execute): สั่งยิงคำสั่ง! โดยเอาค่า ID จริงๆ ที่รับมาจากหน้าเว็บไปใส่แทนที่คำว่า :id
        $stmt->execute([':id' => $input['id']]);

        echo json_encode(["status" => "success", "message" => "CLO deleted successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing CLO ID"]);
}
?>