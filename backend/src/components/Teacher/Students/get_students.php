<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}
$user_id = $_SESSION['user_id'];

try {
    $db = new Connect();
    
    // 1. หา faculty_id
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();
    
    if (!$faculty_id) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 2. หา subject_codes จาก curriculum relational / fallback JSON
    $frameworkId = getActiveFrameworkId($db);
    $my_subject_codes = [];
    if ($frameworkId && curriculumTablesReady($db) && curriculumHasRelationalData($db, $frameworkId)) {
        $my_subject_codes = getInstructorSubjectCodes($db, $frameworkId, (string)$faculty_id);
    } else {
        $mappingData = loadActiveMappingData($db);
        foreach ($mappingData['subject_mappings'] ?? [] as $code => $data) {
            if (isset($data['instructor_id']) && $data['instructor_id'] == $faculty_id) {
                $my_subject_codes[] = $code;
            }
        }
    }

    if (empty($my_subject_codes)) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 3. หานักศึกษาที่ลงทะเบียนในวิชาเหล่านี้ และ group by student_id เพื่อรวมชื่อวิชา
    $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
    $sql = "
        SELECT 
            s.student_id as id,
            s.student_id as studentId,
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            IFNULL(s.year_level, 1) as year,
            IFNULL(s.gpa, 0.00) as gpa,
            IFNULL(s.status, 'active') as status,
            GROUP_CONCAT(DISTINCT sb.subject_code SEPARATOR ', ') as course
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        JOIN subject sb ON e.subject_id = sb.subject_id
        WHERE sb.subject_code IN ($inQuery) AND sb.is_active = 1
        GROUP BY s.student_id
        ORDER BY s.year_level DESC, s.student_id ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($my_subject_codes);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // format data
    foreach ($students as &$student) {
        $student['gpa'] = (float)$student['gpa'];
        // map status from db if necessary
        if ($student['status'] == 'normal') {
            $student['status'] = 'active';
        }
    }

    echo json_encode(["status" => "success", "data" => $students]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>