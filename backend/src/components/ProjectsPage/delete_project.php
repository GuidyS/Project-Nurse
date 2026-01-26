<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

if ($input && isset($input['id'])) {
    try {
        // เขียนคำสั่งลบข้อมูล (DELETE) จากตาราง project
        // หมายเหตุ: เนื่องจากใน ER คุณตั้งค่า ON DELETE CASCADE ไว้ ตารางงบประมาณจะถูกลบไปด้วยอัตโนมัติ
        $sql = "DELETE FROM project WHERE project_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $input['id']]);

        echo json_encode(["status" => "success", "message" => "Project deleted successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing Project ID"]);
}
?>