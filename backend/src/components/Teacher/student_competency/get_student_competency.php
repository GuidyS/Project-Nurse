<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_helper.php';

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

$targetStudentId = $_GET['student_id'] ?? null;
if (!$targetStudentId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสนักศึกษา"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ((int)$user['role_id'] === 2) {
        $checkStmt = $db->prepare("
            SELECT 1 FROM student_advisor_mapping WHERE faculty_id = :fid AND student_id = :sid
        ");
        $checkStmt->execute([':fid' => $user['username'], ':sid' => $targetStudentId]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "คุณไม่มีสิทธิ์ประเมินนักศึกษาคนนี้"], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $info = calculateRealtimeAcademicInfo($targetStudentId);
    $academicYear = $info['academic_year'];
    $yearLevel = $info['year_level'];

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

    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo WHERE framework_id = :fid ORDER BY sort_order ASC, plo_code ASC
    ");
    $ploStmt->execute([':fid' => $framework['id']]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $itemStmt = $db->prepare("
        SELECT ci.id, ci.plo_id, ci.sequence_no, ci.competency_name, ci.is_scorable,
               sca.score
        FROM competency_items ci
        JOIN curriculum_plo cp ON cp.id = ci.plo_id
        LEFT JOIN student_competency_assessments sca 
               ON sca.competency_item_id = ci.id 
              AND sca.student_id = :sid 
              AND sca.academic_year = :ay
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY ci.sequence_no ASC
    ");
    $itemStmt->execute([':sid' => $targetStudentId, ':ay' => $academicYear, ':fid' => $framework['id'], ':yl' => $yearLevel]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $itemsByPlo = [];
    foreach ($items as $item) {
        $itemsByPlo[$item['plo_id']][] = $item;
    }

    $groups = array_map(function ($plo) use ($itemsByPlo) {
        $plo['items'] = $itemsByPlo[$plo['plo_id']] ?? [];
        return $plo;
    }, $plos);

    echo json_encode([
        "status" => "success",
        "data" => [
            "framework" => $framework,
            "year_level" => $yearLevel,
            "academic_year" => $academicYear,
            "groups" => $groups,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}