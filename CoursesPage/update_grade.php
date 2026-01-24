<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

if ($input && isset($input['id'])) {
    $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $input['id'], ':grade' => $input['grade'] === "-" ? null : $input['grade']]);
    echo json_encode(["status" => "success", "message" => "Grade updated"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
}
?>