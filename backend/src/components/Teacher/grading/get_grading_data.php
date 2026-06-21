<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
    }

    $db = new Connect();

    // หา faculty_id ของอาจารย์ที่ล็อกอินอยู่ (จากตาราง users ที่ username เก็บ ID อาจารย์)
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // 1. ถ้าไม่ได้ส่ง subject_id มา -> ให้ดึงรายวิชาทั้งหมดที่อาจารย์คนนี้สอน
    if (!$subject_id) {
        $stmt_fw = $db->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
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
        $stmt_subject = $db->prepare($sql_subject);
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
            CONCAT(s.title, s.first_name_th, ' ', s.last_name_th) as name,
            e.grade
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        WHERE e.subject_id = ?
        ORDER BY s.student_id ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "grade" => $st['grade'] ?? '-'
        ];
    }

    echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => $students]]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>