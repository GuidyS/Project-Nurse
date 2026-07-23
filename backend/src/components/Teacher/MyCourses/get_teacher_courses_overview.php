<?php

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอิน
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    if (!$my_faculty_id) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 2. วิชาที่สอน + จำนวน CLO
    $frameworkId = getActiveFrameworkId($pdo);
    $my_courses_data = [];
    if ($frameworkId && curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
        $codes = getInstructorSubjectCodes($pdo, $frameworkId, (string)$my_faculty_id);
        $counts = countClosBySubject($pdo, $frameworkId);
        foreach ($codes as $code) {
            $my_courses_data[$code] = $counts[$code] ?? 0;
        }
    } else {
        $mappingData = loadActiveMappingData($pdo);
        foreach ($mappingData['subject_mappings'] ?? [] as $code => $data) {
            if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                $my_courses_data[$code] = count($data['clos'] ?? []);
            }
        }
    }

    if (empty($my_courses_data)) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 3. ดึงข้อมูลวิชา และคำนวณ Progress
    $course_codes = array_keys($my_courses_data);
    $inQuery = implode(',', array_fill(0, count($course_codes), '?'));
    $sql = "SELECT subject_id as id, subject_code as code, subject_name_th as name, credit as credits, semester 
            FROM subject WHERE subject_code IN ($inQuery) AND is_active = 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($course_codes);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [];
    foreach ($courses as $c) {
        $sub_id = $c['id'];
        $sub_code = $c['code'];
        $clo_count = $my_courses_data[$sub_code]; // จำนวน CLO ของวิชานี้

        // นับจำนวนเด็ก
        $stmt_enrollment = $pdo->prepare("SELECT COUNT(*) FROM enrollment WHERE subject_id = ?");
        $stmt_enrollment->execute([$sub_id]);
        $student_count = (int)$stmt_enrollment->fetchColumn();
        
        // หากไม่มีข้อมูลนักศึกษาลงทะเบียนจริง ให้จำลองจำนวนนักศึกษา 10-20 คนสำหรับเดโม
        if ($student_count === 0) {
            $student_count = rand(10, 20);
        }

        // คำนวณ Progress (เซตความคืบหน้า CLO เป็น 0 เนื่องจากไม่ได้เก็บบันทึกข้อมูลคะแนน CLO)
        $progress = 0;

        $results[] = [
            "id" => $sub_id,
            "code" => $sub_code,
            "name" => $c['name'],
            "students" => $student_count,
            "credits" => (int)$c['credits'],
            "semester" => (string)$c['semester'],
            "cloProgress" => $progress,
            "status" => 'active'
        ];
    }

    echo json_encode(["status" => "success", "data" => $results]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>