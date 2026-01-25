<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงรหัสและชื่อวิชา
    $sql = "SELECT subject_id AS id, subject_code AS code, subject_name_th AS name FROM subject";
    $stmt = $pdo->query($sql);
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // แปลง ID เป็นตัวเลข
    foreach ($subjects as &$subject) {
        $subject['id'] = (int)$subject['id'];
    }

    echo json_encode(["status" => "success", "data" => $subjects]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>