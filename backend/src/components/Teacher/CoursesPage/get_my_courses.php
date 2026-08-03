<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
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
    
    // 1. หา faculty_id ของคนที่ล็อกอินอยู่ (จากตาราง users ที่ใช้ username เก็บไอดีอาจารย์)
    $stmt_fac = $db->prepare("SELECT faculty_id, CONCAT(IFNULL(title,''), ' ', first_name_th, ' ', last_name_th) AS name FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty = $stmt_fac->fetch(PDO::FETCH_ASSOC);
    
    if (!$faculty) {
        echo json_encode(["status" => "success", "data" => []]); // ถ้าไม่ใช่อาจารย์ ก็ไม่มีวิชาสอน
        exit();
    }
    $my_faculty_id = $faculty['faculty_id'];
    $instructor_name = $faculty['name'];

    // 2. วิชาที่มอบหมายให้อาจารย์ (relational ก่อน, fallback JSON)
    $frameworkId = getActiveFrameworkId($db);
    $my_subject_codes = [];
    $cloCounts = [];
    if ($frameworkId && curriculumTablesReady($db) && curriculumHasRelationalData($db, $frameworkId)) {
        $my_subject_codes = getInstructorSubjectCodes($db, $frameworkId, (string)$my_faculty_id);
        $cloCounts = countClosBySubject($db, $frameworkId);
    } else {
        $mappingData = loadActiveMappingData($db);
        foreach ($mappingData['subject_mappings'] ?? [] as $code => $data) {
            if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                $my_subject_codes[] = $code;
                $cloCounts[$code] = count($data['clos'] ?? []);
            }
        }
    }

    if (empty($my_subject_codes)) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 3. ดึงรายละเอียดวิชา และ จำนวนนักศึกษาที่ลงทะเบียน
    $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
    $sql = "SELECT s.subject_id as id, s.subject_code as code, s.subject_name_th as name, s.credit as credits, s.semester,
            (SELECT COUNT(*) FROM enrollment e WHERE e.subject_id = s.subject_id) as students
            FROM subject s WHERE s.subject_code IN ($inQuery) AND s.is_active = 1";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($my_subject_codes);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($courses as &$course) {
        $course['cloCount'] = $cloCounts[$course['code']] ?? 0;
        $course['section'] = '01'; // Default
        $course['instructor'] = $instructor_name;
    }

    echo json_encode(["status" => "success", "data" => $courses]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>