<?php

//require_once __DIR__ . '/../../../middlewares/auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงรหัสและชื่อวิชาจากตาราง subjects ตรงๆ
    $sql = "SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success", 
        "data" => $subjects
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>