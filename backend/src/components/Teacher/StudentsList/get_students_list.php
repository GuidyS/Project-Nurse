<?php
// รายชื่อนักศึกษาทั้งหมด (สำหรับหน้า Students ฝั่งอาจารย์)
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $sql = "SELECT
                s.student_id,
                IF(s.student_code LIKE 'TEMP-%', s.student_id, s.student_code) AS studentId,
                CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) AS name,
                IFNULL(s.year_level, 1) AS year,
                IFNULL(s.gpa, 0) AS gpa,
                IFNULL(s.status, 'Active') AS status,
                s.email, s.phone
            FROM student s
            ORDER BY s.student_id ASC";
    $students = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    foreach ($students as &$st) {
        $gpa = (float)$st['gpa'];
        $st['gpa'] = $gpa;
        // สถานะจาก GPA: <2.00 วิกฤต, <2.50 ต้องติดตาม (0 = ยังไม่มีข้อมูลเกรด)
        $st['riskStatus'] = ($gpa > 0 && $gpa < 2.00) ? 'critical' : (($gpa > 0 && $gpa < 2.50) ? 'warning' : 'normal');
    }

    echo json_encode(["status" => "success", "data" => $students], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
