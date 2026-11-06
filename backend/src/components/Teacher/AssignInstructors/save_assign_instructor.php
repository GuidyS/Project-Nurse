<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper
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
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $subject_code = $input['subject_code'];
    $faculty_id = $input['faculty_id'];

    $frameworkId = getActiveFrameworkId($db);
    if (!$frameworkId) {
        echo json_encode(["status" => "error", "message" => "ไม่พบหลักสูตรที่เปิดใช้งาน"], JSON_UNESCAPED_UNICODE);
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

    // ระบบไม่ผูกรายวิชากับภาคเรียน/ปีการศึกษาแล้ว หน้านี้จึงบันทึกเฉพาะอาจารย์ผู้รับผิดชอบ
    $msg = empty($faculty_id) ? "ยกเลิกการมอบหมายอาจารย์สำเร็จ" : "มอบหมายอาจารย์สำเร็จ";
    setSubjectInstructor($db, $frameworkId, (string)$subject_code, empty($faculty_id) ? null : (string)$faculty_id);

    $actionDesc = empty($faculty_id)
        ? "ยกเลิกมอบหมายอาจารย์ผู้สอน รายวิชา: {$subject_code}"
        : "มอบหมายอาจารย์ผู้สอน (ID: {$faculty_id}) รายวิชา: {$subject_code}";

    logAudit(
        $db,
        $_SESSION['user_id'] ?? null,
        'update',
        'assign_instructors',
        $actionDesc
    );

    echo json_encode([
        "status" => "success",
        "message" => $msg,
    ], JSON_UNESCAPED_UNICODE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>