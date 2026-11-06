<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/registration_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $studentId = registrationStudentId($db, $userId);
    if ($studentId === null) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "หน้านี้สำหรับนักศึกษาเท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Payload JSON ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $action = (string)($input['action'] ?? 'enroll'); // enroll | withdraw
    $subjectCode = trim((string)($input['subject_code'] ?? ''));
    if ($subjectCode === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาเลือกรายวิชา"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ลงได้เฉพาะรายวิชาของหลักสูตรที่ใช้งานในระบบเท่านั้น
    $curriculumSubjects = activeCurriculumSubjects($db);
    if ($curriculumSubjects === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ยังไม่มีหลักสูตรที่ใช้งานในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $target = null;
    foreach ($curriculumSubjects as $subject) {
        if ($subject['subject_code'] === $subjectCode) {
            $target = $subject;
            break;
        }
    }
    if ($target === null) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "รายวิชา {$subjectCode} ไม่ได้อยู่ในหลักสูตรที่ใช้งานในระบบ",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ลงทะเบียนได้เฉพาะวิชาที่มีอาจารย์ผู้รับผิดชอบแล้ว (ตรวจที่ฝั่ง server ด้วย ไม่พึ่งแค่หน้าเว็บ)
    // การถอนไม่ต้องตรวจ เพราะวิชาที่ลงไว้แล้วอาจถูกถอนอาจารย์ออกภายหลัง
    if ($action !== 'withdraw') {
        $frameworkId = getActiveFrameworkId($db);
        $instructorByCode = $frameworkId ? getSubjectInstructorMap($db, $frameworkId) : [];
        if (empty($instructorByCode[$subjectCode])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "รายวิชา {$subjectCode} ยังไม่มีอาจารย์ผู้รับผิดชอบ จึงยังไม่เปิดให้ลงทะเบียน",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // เตรียมคอลัมน์/ตารางตั้งค่าให้ครบก่อนเปิด transaction
    // (ALTER TABLE และ CREATE TABLE ทำให้ MySQL commit transaction ที่เปิดค้างไว้ทันที)
    subjectTermEnsureColumn($db);
    $term = academicCurrentTerm($db);

    $db->beginTransaction();
    $subjectId = registrationEnsureSubjectRow($db, $target);

    $existsStmt = $db->prepare("
        SELECT enrollment_id FROM enrollment WHERE student_id = :sid AND subject_id = :subject LIMIT 1
    ");
    $existsStmt->execute([':sid' => $studentId, ':subject' => $subjectId]);
    $existingId = $existsStmt->fetchColumn();

    if ($action === 'withdraw') {
        if ($existingId === false) {
            $db->rollBack();
            echo json_encode(["status" => "success", "message" => "ยังไม่ได้ลงทะเบียนวิชานี้"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // มีคะแนนแล้วถอนไม่ได้ ไม่งั้นผลประเมินสมรรถนะจะหายไปด้วย
        $scoreStmt = $db->prepare("
            SELECT COUNT(*) FROM student_clo_sub_scores
            WHERE student_id = :sid AND subject_id = :subject AND score IS NOT NULL
        ");
        $scoreStmt->execute([':sid' => $studentId, ':subject' => $subjectId]);
        if ((int)$scoreStmt->fetchColumn() > 0) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "วิชา {$subjectCode} มีคะแนนที่อาจารย์บันทึกไว้แล้ว จึงถอนรายวิชาเองไม่ได้ กรุณาติดต่ออาจารย์ที่ปรึกษา",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $db->prepare("DELETE FROM enrollment WHERE enrollment_id = :id")->execute([':id' => $existingId]);
        $db->commit();

        logAudit($db, $userId, 'delete', 'enrollment', "นักศึกษา {$studentId} ถอนรายวิชา {$subjectCode}");
        echo json_encode(["status" => "success", "message" => "ถอนรายวิชา {$subjectCode} แล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($existingId !== false) {
        $db->rollBack();
        echo json_encode([
            "status" => "success",
            "message" => "ลงทะเบียนวิชา {$subjectCode} ไว้อยู่แล้ว",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ภาคเรียน/ปีการศึกษา: ใช้ของรายวิชาก่อน ถ้าไม่ได้กำหนดจึงใช้ภาคเรียนปัจจุบันตามวันที่
    $semester = $target['semester'] ?? $term['semester'];
    $academicYear = $target['academic_year'] ?? $term['academic_year'];

    $db->prepare("
        INSERT INTO enrollment (student_id, subject_id, academic_year, semester, section, status)
        VALUES (:sid, :subject, :year, :semester, 1, 'Active')
    ")->execute([
        ':sid' => $studentId,
        ':subject' => $subjectId,
        ':year' => $academicYear,
        ':semester' => $semester,
    ]);
    $db->commit();

    logAudit($db, $userId, 'create', 'enrollment', "นักศึกษา {$studentId} ลงทะเบียนรายวิชา {$subjectCode}");

    echo json_encode([
        "status" => "success",
        "message" => "ลงทะเบียนวิชา {$subjectCode} เรียบร้อยแล้ว",
        "data" => ['semester' => $semester, 'academic_year' => $academicYear],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
