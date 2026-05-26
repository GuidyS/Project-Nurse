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
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$subject_id) {
        echo json_encode(["status" => "error", "message" => "Missing subject_id"]); exit();
    }

    // ดึงเด็กที่ลงทะเบียนวิชานี้ (enrollments) และ Left Join ดูเกรดจากตาราง assessments
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_code as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            a.grade
        FROM enrollments e
        JOIN student s ON e.student_id = s.student_id
        LEFT JOIN assessments a ON e.student_id = a.student_id AND a.subject_id = e.subject_id
        WHERE e.subject_id = ?
        ORDER BY s.student_code ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ถ้ายังไม่มีเกรดในระบบ ให้ใส่เป็นค่าว่าง
    foreach ($students as &$st) {
        if ($st['grade'] === null) $st['grade'] = '-';
    }

    echo json_encode(["status" => "success", "data" => $students]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>