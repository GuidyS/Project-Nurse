<?php
ob_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_helper.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบก่อนใช้งาน"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("
        SELECT u.user_id, u.username, 
               s.student_id, s.first_name_th, s.last_name_th
        FROM users u
        LEFT JOIN student s ON s.user_id = u.user_id
        WHERE u.user_id = :id
    ");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลผู้ใช้งานในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $studentId = (string)($user['student_id'] ?? $user['username'] ?? '');
    $fullName = trim(($user['first_name_th'] ?? '') . ' ' . ($user['last_name_th'] ?? ''));
    if ($fullName === '') {
        $fullName = $studentId;
    }

    if ($studentId === '') {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "บัญชีนี้ไม่ได้ผูกกับข้อมูลนักศึกษา"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $fwStmt = $db->prepare("
        SELECT id, curriculum_year, program_name 
        FROM curriculum_framework 
        WHERE is_active = 1
        LIMIT 1
    ");
    $fwStmt->execute();
    $framework = $fwStmt->fetch(PDO::FETCH_ASSOC);

    if (!$framework) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "ไม่พบหลักสูตรที่เปิดใช้งานอยู่ในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $info = calculateRealtimeAcademicInfo($studentId);
    $academicYear = $info['academic_year'];
    $yearLevel = $info['year_level'];

    $itemStmt = $db->prepare("
        SELECT 
            ci.id, 
            ci.plo_id, 
            COALESCE(cp.plo_code, '') AS plo_code, 
            COALESCE(cp.name, '') AS plo_name, 
            ci.sequence_no, 
            ci.competency_name, 
            ci.is_scorable,
            sca.score, 
            sca.assessed_at
        FROM competency_items ci
        JOIN curriculum_plo cp ON cp.id = ci.plo_id
        LEFT JOIN student_competency_assessments sca 
               ON sca.competency_item_id = ci.id 
              AND sca.student_id = :sid
              AND sca.academic_year = :ay
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY ci.sequence_no ASC
    ");
    $itemStmt->execute([
        ':sid' => $studentId,
        ':ay'  => $academicYear,
        ':fid' => $framework['id'],
        ':yl'  => $yearLevel,
    ]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    echo json_encode([
        "status" => "success",
        "data" => [
            "student_id" => $studentId,
            "full_name" => $fullName,
            "year_level" => $yearLevel,
            "academic_year" => $academicYear,
            "framework" => $framework,
            "items" => $items
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}