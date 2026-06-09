<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_id = $_GET['subject_id'] ?? null;

try {
    // หา faculty_id ของอาจารย์ที่ล็อกอินอยู่
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // 1. ถ้าไม่ได้ส่ง subject_id มา -> ให้ดึงรายวิชาทั้งหมดที่อาจารย์คนนี้สอนไปทำ Dropdown
    if (!$subject_id) {
        // ดึงจาก JSON หลักสูตรว่าอาจารย์ถูกมอบหมายวิชาไหนบ้าง
        $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
        $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
        $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

        $my_subject_codes = [];
        if (isset($mappingData['subject_mappings'])) {
            foreach ($mappingData['subject_mappings'] as $code => $data) {
                if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                    $my_subject_codes[] = $code;
                }
            }
        }

        if (empty($my_subject_codes)) {
            echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => []]]);
            exit();
        }

        $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
        $sql_subject = "SELECT subject_id as id, subject_code as code, subject_name_th as name FROM subject WHERE subject_code IN ($inQuery) AND is_active = 1";
        $stmt_subject = $pdo->prepare($sql_subject);
        $stmt_subject->execute($my_subject_codes);
        $courses = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => ["courses" => $courses, "students" => []]]);
        exit();
    }

    // 2. ถ้าส่ง subject_id มา -> ให้ดึงรายชื่อเด็กที่ลงทะเบียนวิชานั้น
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            e.grade
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
        $scores = ["midterm" => "", "final" => "", "assignment" => ""];
        $total = 0;

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "scores" => $scores,
            "total" => $total,
            "grade" => $st['grade'] ?? '-'
        ];
    }

    echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => $students]]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>