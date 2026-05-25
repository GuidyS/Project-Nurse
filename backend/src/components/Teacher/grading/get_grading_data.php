<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
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
        $sql_courses = "SELECT subject_id as id, subject_code as code, subject_name_th as name FROM subjects WHERE subject_code IN ($inQuery)";
        $stmt_c = $pdo->prepare($sql_courses);
        $stmt_c->execute($my_subject_codes);
        $courses = $stmt_c->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => ["courses" => $courses, "students" => []]]);
        exit();
    }

    // 2. ถ้าส่ง subject_id มา -> ให้ดึงรายชื่อเด็กที่ลงทะเบียนวิชานั้น พร้อมคะแนนดิบ
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_code as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            a.grade,
            a.raw_scores
        FROM enrollments e
        JOIN student s ON e.student_id = s.student_id
        LEFT JOIN assessments a ON e.student_id = a.student_id AND a.subject_id = e.subject_id
        WHERE e.subject_id = ?
        ORDER BY s.student_code ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        // แกะ JSON raw_scores 
        $scores = $st['raw_scores'] ? json_decode($st['raw_scores'], true) : ["midterm" => "", "final" => "", "assignment" => ""];
        
        // คำนวณ Total แบบ Auto 
        $total = (float)($scores['midterm'] ?? 0) + (float)($scores['final'] ?? 0) + (float)($scores['assignment'] ?? 0);

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