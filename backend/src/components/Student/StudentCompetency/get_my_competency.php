<?php
ob_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

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

    // ดึงข้อมูลนักศึกษา
    $stmt = $db->prepare("
        SELECT u.user_id, u.username,
               s.student_id, s.first_name_th, s.last_name_th,
               s.admission_year, s.year_level
        FROM users u
        LEFT JOIN student s ON s.student_id = u.username
        WHERE u.user_id = :id
        LIMIT 1
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

    // คำนวณปีการศึกษาและชั้นปีโดยตรงจากรหัสนักศึกษา (รหัส 66 -> ปี 4)
    $now = new DateTime();
    $currentYearBE = (int)$now->format('Y') + 543;
    $cutOffDate = new DateTime($now->format('Y') . '-08-10 00:00:00');
    $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);

    $entryYear = 0;
    if (strlen($studentId) >= 2 && is_numeric(substr($studentId, 0, 2))) {
        $entryYear = 2500 + (int)substr($studentId, 0, 2);
    } else {
        $entryYear = $academicYear;
    }

    $yearLevel = $academicYear - $entryYear + 1;
    if ($yearLevel < 1) $yearLevel = 1;
    if ($yearLevel > 8) $yearLevel = 8;

    // ค้นหาหลักสูตร
    $fwStmt = $db->prepare("
        SELECT id, curriculum_year, program_name
        FROM curriculum_framework
        WHERE is_active = 1
        LIMIT 1
    ");
    $fwStmt->execute();
    $framework = $fwStmt->fetch(PDO::FETCH_ASSOC);

    if (!$framework) {
        $fwFallback = $db->query("SELECT id, curriculum_year, program_name FROM curriculum_framework ORDER BY id DESC LIMIT 1");
        $framework = $fwFallback ? $fwFallback->fetch(PDO::FETCH_ASSOC) : null;
    }

    if (!$framework) {
        echo json_encode([
            "status" => "success",
            "data" => [
                "student_id"    => $studentId,
                "full_name"     => $fullName,
                "year_level"    => $yearLevel,
                "academic_year" => $academicYear,
                "framework"     => null,
                "items"         => []
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ดึงเกณฑ์ประเมินสมรรถนะตามชั้นปีจริง (ปี 4)
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
            "student_id"    => $studentId,
            "full_name"     => $fullName,
            "year_level"    => $yearLevel,
            "academic_year" => $academicYear,
            "framework"     => $framework,
            "items"         => $items
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}