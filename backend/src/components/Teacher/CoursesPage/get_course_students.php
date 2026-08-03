<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$subject_id) {
        echo json_encode(["status" => "error", "message" => "Missing subject_id"]); exit();
    }
    
    $db = new Connect();

    // ดึงเด็กที่ลงทะเบียนวิชานี้ และเกรดจริงจากตาราง enrollment
    $sql = "
        SELECT 
            e.enrollment_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            e.grade
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        WHERE e.subject_id = ?
        ORDER BY s.student_id ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$subject_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($students as &$st) {
        if ($st['grade'] === null) $st['grade'] = '-';
    }

    echo json_encode(["status" => "success", "data" => $students]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>