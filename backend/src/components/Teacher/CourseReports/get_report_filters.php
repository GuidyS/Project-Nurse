<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();

    // 1. ดึงปีการศึกษาทั้งหมดที่มีการลงทะเบียน (ใช้ตาราง enrollment)
    $sql_years = "SELECT DISTINCT academic_year FROM enrollment ORDER BY academic_year DESC";
    $stmt_years = $db->query($sql_years);
    $years = $stmt_years->fetchAll(PDO::FETCH_COLUMN);

    // 2. ดึงรายชื่อวิชาทั้งหมดที่มีการลงทะเบียน
    $sql_subject = "
        SELECT DISTINCT s.subject_code, s.subject_name_th 
        FROM enrollment e
        JOIN subject s ON e.subject_id = s.subject_id
        ORDER BY s.subject_code ASC
    ";
    $stmt_subject = $db->query($sql_subject);
    $subject = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success", 
        "data" => [
            "years" => $years,
            "courses" => $subject
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>