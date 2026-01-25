<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_id = $_GET['subject_id'] ?? 0;

try {
    // 1. CONCAT('CLO', c.clo_id) คือการเอาคำว่า CLO แปะหน้าเลข ID
    // 2. JOIN ylo และ plo เพื่อดึงชื่อ PLO/YLO มาแสดงผล
    // LEFT JOIN ทะลุจาก clo -> ylo -> plo ตาม ER
    $sql = "SELECT 
                c.clo_id AS id, 
                CONCAT('CLO', c.clo_id) AS code, 
                c.description,
                COALESCE(p.plo_no, '-') AS plo,
                COALESCE(CONCAT('YLO', y.year), '-') AS ylo,
                c.ylo_id /* ส่งไปด้วยเผื่อใช้ตอน Edit */
            FROM clo c
            LEFT JOIN ylo y ON c.ylo_id = y.ylo_id
            LEFT JOIN plo p ON y.plo_id = p.plo_id
            WHERE c.subject_id = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    $clos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $clos]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>