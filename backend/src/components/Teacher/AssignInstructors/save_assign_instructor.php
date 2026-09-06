<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
require_once __DIR__ . '/subject_term_helpers.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Connect();

    if (empty($input['subject_code']) || !isset($input['faculty_id'])) {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
        exit();
    }

    $subject_code = $input['subject_code'];
    $faculty_id = $input['faculty_id'];

    $frameworkId = getActiveFrameworkId($db);
    if (!$frameworkId) {
        echo json_encode(["status" => "error", "message" => "ไม่พบหลักสูตรที่เปิดใช้งาน"]);
        exit();
    }

    if (!curriculumTablesReady($db) || !curriculumHasRelationalData($db, $frameworkId)) {
        http_response_code(503);
        echo json_encode([
            "status" => "error",
            "message" => "ยังไม่ได้ migrate ข้อมูลหลักสูตรไปตาราง relational",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ตรวจค่าภาคเรียน/ปีการศึกษาให้ผ่านก่อน แล้วค่อยเขียนอะไรลงฐานข้อมูล
    // (ไม่งั้นกรอกปีผิดแล้วอาจารย์จะถูกมอบหมายไปแล้วทั้งที่ขึ้น error)
    $semester = array_key_exists('semester', $input) ? subjectTermNormalizeSemester($input['semester']) : null;
    $academicYear = array_key_exists('academic_year', $input) ? subjectTermNormalizeYear($input['academic_year']) : null;

    $msg = empty($faculty_id) ? "ยกเลิกการมอบหมายอาจารย์สำเร็จ" : "มอบหมายอาจารย์สำเร็จ";
    setSubjectInstructor($db, $frameworkId, (string)$subject_code, empty($faculty_id) ? null : (string)$faculty_id);

    if (array_key_exists('semester', $input) || array_key_exists('academic_year', $input)) {
        // ส่งคีย์มาแล้วแต่ค่าว่าง = ตั้งใจล้างค่า จึงเขียนทับด้วย NULL
        subjectTermSave($db, (string)$subject_code, $semester, $academicYear, true);
        $msg .= ' (ภาคเรียน ' . subjectTermLabel($semester, $academicYear) . ')';
    }

    echo json_encode([
        "status" => "success",
        "message" => $msg,
        "data" => [
            "semester" => $semester,
            "academic_year" => $academicYear,
            "term_label" => subjectTermLabel($semester, $academicYear),
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>