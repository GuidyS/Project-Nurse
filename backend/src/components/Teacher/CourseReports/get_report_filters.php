<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงปีการศึกษาทั้งหมดที่มีการประเมินผล (ไม่ให้ซ้ำกัน)
    $sql_years = "SELECT DISTINCT academic_year FROM assessments ORDER BY academic_year DESC";
    $stmt_years = $pdo->query($sql_years);
    $years = $stmt_years->fetchAll(PDO::FETCH_COLUMN);

    // 2. ดึงรายชื่อวิชาทั้งหมดที่มีการประเมินผล
    $sql_subject = "
        SELECT DISTINCT s.subject_code, s.subject_name_th 
        FROM assessments a
        JOIN subject s ON a.subject_id = s.subject_id
        ORDER BY s.subject_code ASC
    ";
    $stmt_subject = $pdo->query($sql_subject);
    $subject = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success", 
        "data" => [
            "years" => $years,
            "courses" => $subject
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>