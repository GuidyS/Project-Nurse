<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$subject_id) {
        echo json_encode(["status" => "error", "message" => "Missing subject_id"]); exit();
    }

    // 1. หารหัสวิชา (subject_code) จาก subject_id เพื่อเอาไปค้นหา CLO ใน JSON หลักสูตร
    $stmt_subject = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = ? LIMIT 1");
    $stmt_subject->execute([$subject_id]);
    $subject_code = $stmt_subject->fetchColumn();

    // 2. ดึงรายการ CLO ของวิชานี้จาก curriculum_framework
    $clo_headers = [];
    $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    if ($row_fw) {
        $mapping_data = json_decode($row_fw['mapping_json'], true);
        $subject_clos = $mapping_data['subject_mappings'][$subject_code]['clos'] ?? [];
        foreach ($subject_clos as $clo) {
            // เก็บเฉพาะรหัส CLO เช่น CLO1, CLO2 ไว้ส่งให้ React ไปสร้างหัวตาราง
            $clo_headers[] = $clo['id'] ?? $clo['code'] ?? $clo['clo_id']; 
        }
    }

    // 3. ดึงรายชื่อนักศึกษา (ตาราง enrollment)
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        WHERE e.subject_id = ?
        ORDER BY s.student_id ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        $scores = [];
        $overall = 0;
        $status = 'pending';

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "scores" => (object)$scores, // ส่งเป็น Object เพื่อให้เข้าถึงด้วย key ได้เช่น scores.CLO1
            "overall" => $overall,
            "status" => $status
        ];
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "headers" => $clo_headers,
            "students" => $students
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>