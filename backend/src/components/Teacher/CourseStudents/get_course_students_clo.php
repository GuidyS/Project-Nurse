<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
require_once __DIR__ . '/clo_score_helpers.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
    }

    $db = new Connect();

    // ค้นหา faculty_id ของอาจารย์จากเซสชันล็อกอิน
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // [กรณีที่ 1] ไม่ได้ส่ง subject_id มา -> คืนรายวิชาทั้งหมดที่อาจารย์คนนี้รับผิดชอบ
    if (!$subject_id) {
        $frameworkId = getActiveFrameworkId($db);
        $my_subject_codes = [];
        if ($frameworkId && curriculumTablesReady($db) && curriculumHasRelationalData($db, $frameworkId)) {
            $my_subject_codes = getInstructorSubjectCodes($db, $frameworkId, (string)$my_faculty_id);
        } else {
            $mappingData = loadActiveMappingData($db);
            foreach ($mappingData['subject_mappings'] ?? [] as $code => $data) {
                if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                    $my_subject_codes[] = $code;
                }
            }
        }

        if (empty($my_subject_codes)) {
            echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => [], "clo_headers" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
        $sql_subject = "SELECT subject_id as id, subject_code as code, subject_name_th as name FROM subject WHERE subject_code IN ($inQuery) AND is_active = 1";
        $stmt_subject = $db->prepare($sql_subject);
        $stmt_subject->execute($my_subject_codes);
        $courses = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => ["courses" => $courses, "students" => [], "clo_headers" => []]], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // [กรณีที่ 2] ส่ง subject_id มา -> โหลดหัวตาราง CLO ไดนามิก + คะแนนจริงของนักศึกษา
    $subject_id = (int)$subject_id;
    $stmt_subject = $db->prepare("SELECT subject_code FROM subject WHERE subject_id = ? LIMIT 1");
    $stmt_subject->execute([$subject_id]);
    $subject_code = $stmt_subject->fetchColumn();

    if (!$subject_code) {
        echo json_encode(["status" => "error", "message" => "ไม่พบรายวิชานี้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // หัวตาราง CLO มาจากที่กำหนดไว้ในหน้า "จัดการ CLO รายวิชา"
    $clo_headers = cloScoreBuildHeaders($db, (string)$subject_code);
    $total_clos = count($clo_headers);

    // ดึงนักศึกษาที่ลงทะเบียนวิชานี้
    $sql = "
        SELECT
            s.student_id as id,
            s.student_id as studentId,
            CONCAT(IFNULL(s.title, ''), s.first_name_th, ' ', s.last_name_th) as name
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        WHERE e.subject_id = ?
        ORDER BY s.student_id ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // คะแนน Sub PLO ที่บันทึกไว้แล้วทั้งวิชา
    $savedScores = cloScoreLoadForSubject($db, $subject_id);

    $students = [];
    foreach ($students_raw as $st) {
        $studentKey = (string)$st['id'];
        $cloScores = [];   // [clo_id => คะแนน CLO]
        $subScores = [];   // [clo_id => [sub_code => คะแนนที่กรอก]]

        foreach ($clo_headers as $header) {
            $cloKey = (string)$header['clo_id'];
            $entered = $savedScores[$studentKey][$cloKey] ?? [];
            $subCodes = array_column($header['sub_plos'], 'code');

            $subScores[$cloKey] = (object)$entered;
            $cloScores[$cloKey] = cloScoreCalcClo($subCodes, $entered);
        }

        $overall = cloScoreCalcOverall($cloScores, $total_clos);

        $students[] = [
            "id" => (int)$st['id'],
            "studentId" => (string)$st['studentId'],
            "name" => $st['name'],
            "clo_scores" => (object)$cloScores,
            "sub_scores" => (object)$subScores,
            "overall" => $overall,
            // เกณฑ์ผ่านของคณะคือร้อยละ 70
            "status" => $overall === null ? 'pending' : ($overall >= 70 ? 'passed' : 'failed'),
        ];
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "courses" => [],
            "subject_code" => $subject_code,
            "clo_headers" => $clo_headers,
            "students" => $students,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
