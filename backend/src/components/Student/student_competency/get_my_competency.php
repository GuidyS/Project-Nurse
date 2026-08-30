<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }

$configPaths = [
    __DIR__ . '/../../../../config/config.php',
    __DIR__ . '/../../../config/config.php',
    __DIR__ . '/../../config/config.php',
    dirname(__DIR__, 3) . '/config/config.php',
    dirname(__DIR__, 4) . '/config/config.php'
];

foreach ($configPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

// โหลด Helper
$helperPath = __DIR__ . '/../../../config/academic_helper.php';
if (file_exists($helperPath)) {
    require_once $helperPath;
}

if (!function_exists('calculateRealtimeAcademicInfo')) {
    function calculateRealtimeAcademicInfo($studentId, $entryYearCandidate = null): array {
        $now = new DateTime();
        $currentYearBE = (int)$now->format('Y') + 543;
        $cutOffDate = new DateTime($now->format('Y') . '-08-10 00:00:00');
        $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);
        $cleanId = trim((string)$studentId);
        $entryYear = (strlen($cleanId) >= 2 && ctype_digit(substr($cleanId, 0, 2))) ? 2500 + (int)substr($cleanId, 0, 2) : $academicYear;
        $yearLevel = max(1, min(8, $academicYear - $entryYear + 1));
        return ['academic_year' => $academicYear, 'year_level' => $yearLevel, 'entry_year' => $entryYear];
    }
}

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? $_SESSION['id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบก่อนใช้งาน"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    // 1. ดึงข้อมูลนักศึกษา
    $stmt = $db->prepare("SELECT * FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลผู้ใช้งานในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $studentId = (string)($user['username'] ?? '');
    $fullName = trim(($user['first_name_th'] ?? '') . ' ' . ($user['last_name_th'] ?? ''));
    if (empty($fullName)) {
        $fullName = $user['full_name_th'] ?? $user['name'] ?? $studentId;
    }

    // 2. คำนวณปีการศึกษาและชั้นปี Real-time จากรหัสนักศึกษา
    $academicInfo = calculateRealtimeAcademicInfo($studentId, $user['entry_year'] ?? null);
    $currentAcademicYear = $academicInfo['academic_year'];
    $yearLevel = $academicInfo['year_level'];

    // 3. ดึงหลักสูตรปัจจุบัน
    $fwStmt = $db->prepare("
        SELECT id, curriculum_year, program_name 
        FROM curriculum_framework 
        ORDER BY is_active DESC, curriculum_year DESC 
        LIMIT 1
    ");
    $fwStmt->execute();
    $framework = $fwStmt->fetch(PDO::FETCH_ASSOC);

    if (!$framework) {
        $framework = [
            "id" => 1,
            "curriculum_year" => 2564,
            "program_name" => "หลักสูตรพยาบาลศาสตรบัณฑิต"
        ];
    }
    $frameworkId = (int)$framework['id'];

    // 4. ดึงข้อประเมินตามชั้นปีจริงของนักศึกษา (INNER JOIN ตัดข้อลอยออก)
    $itemStmt = $db->prepare("
        SELECT 
            ci.id, 
            ci.plo_id, 
            cp.plo_code, 
            cp.name AS plo_name, 
            ci.sequence_no, 
            ci.competency_name, 
            ci.is_scorable,
            sca.score, 
            sca.assessed_at
        FROM competency_items ci
        INNER JOIN curriculum_plo cp ON cp.id = ci.plo_id
        LEFT JOIN student_competency_assessments sca 
               ON sca.competency_item_id = ci.id 
              AND sca.student_id = :sid
              AND (sca.academic_year = :ay OR sca.academic_year IS NULL)
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY COALESCE(cp.sort_order, cp.id) ASC, ci.sequence_no ASC, ci.id ASC
    ");
    $itemStmt->execute([
        ':sid' => $studentId,
        ':ay'  => $currentAcademicYear,
        ':fid' => $frameworkId,
        ':yl'  => $yearLevel,
    ]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    echo json_encode([
        "status" => "success",
        "data" => [
            "student_id" => $studentId,
            "full_name" => $fullName,
            "year_level" => $yearLevel,
            "academic_year" => $currentAcademicYear,
            "entry_year" => $academicInfo['entry_year'],
            "framework" => $framework,
            "items" => $items
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}