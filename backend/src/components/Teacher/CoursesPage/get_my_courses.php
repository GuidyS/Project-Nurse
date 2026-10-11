<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
require_once __DIR__ . '/../AssignInstructors/subject_term_helpers.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';

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

    // เฉพาะวิชาในหลักสูตรที่ใช้งานในระบบ (หน้า "จัดการหลักสูตร")
    $my_subject_codes = activeCurriculumFilterCodes($db, $my_subject_codes);

    if (empty($my_subject_codes)) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 3. รายละเอียดวิชา + จำนวนนักศึกษาที่ลงทะเบียน
    //    ใช้รายวิชาของหลักสูตรเป็นหลัก เพื่อให้วิชาที่มีเฉพาะในหน้า "จัดการหลักสูตร"
    //    (ยังไม่มีแถวในตาราง subject) แสดงให้อาจารย์เห็นด้วย ไม่หายไปจากรายการ
    subjectTermEnsureColumn($db);

    $wanted = array_flip($my_subject_codes);
    $curriculumSubjects = activeCurriculumSubjects($db);
    $courses = [];

    if ($curriculumSubjects !== null) {
        foreach ($curriculumSubjects as $subject) {
            if (!isset($wanted[$subject['subject_code']])) {
                continue;
            }
            $courses[] = [
                'id' => $subject['subject_id'],
                'code' => $subject['subject_code'],
                'name' => $subject['subject_name'],
                'credits' => $subject['credit'],
                'semester' => $subject['semester'],
                'academic_year' => $subject['academic_year'],
                'students' => 0,
                'pass_score' => $subject['pass_score'],
            ];
        }
    } else {
        $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
        $stmt = $db->prepare("
            SELECT s.subject_id as id, s.subject_code as code, s.subject_name_th as name, s.credit as credits,
                   s.semester, s.academic_year
            FROM subject s WHERE s.subject_code IN ($inQuery) AND s.is_active = 1
        ");
        $stmt->execute($my_subject_codes);
        $courses = activeCurriculumApplyNames($db, $stmt->fetchAll(PDO::FETCH_ASSOC), 'code', 'name');
        $courses = activeCurriculumApplyPassScore($db, $courses, 'code');
    }

    // จำนวนนักศึกษาที่ลงทะเบียน (เฉพาะวิชาที่มีอยู่ในตาราง subject)
    $subjectIds = array_values(array_filter(array_column($courses, 'id'), static fn($id) => $id !== null));
    $enrolled = [];
    if (!empty($subjectIds)) {
        $ph = implode(',', array_fill(0, count($subjectIds), '?'));
        $enrollStmt = $db->prepare("SELECT subject_id, COUNT(*) AS total FROM enrollment WHERE subject_id IN ($ph) GROUP BY subject_id");
        $enrollStmt->execute($subjectIds);
        foreach ($enrollStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $enrolled[(int)$row['subject_id']] = (int)$row['total'];
        }
    }

    foreach ($courses as &$course) {
        $course['students'] = $course['id'] === null ? 0 : ($enrolled[(int)$course['id']] ?? 0);
        $course['cloCount'] = $cloCounts[$course['code']] ?? 0;
        $course['section'] = '01'; // Default
        $course['instructor'] = $instructor_name;
        // ข้อความภาคเรียนคำนวณจากข้อมูลจริงที่เดียว ไม่ให้หน้าเว็บเดาค่าเอง
        $course['term_label'] = subjectTermLabel($course['semester'], $course['academic_year']);
    }
    unset($course);

    echo json_encode(["status" => "success", "data" => $courses]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>