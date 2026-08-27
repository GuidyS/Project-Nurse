<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }

// ค้นหา config.php อัตโนมัติ ป้องกัน path mismatch
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

header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? $_SESSION['id'] ?? null;

if (!$userId) {
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
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลผู้ใช้งานในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $studentId = (string)($user['username'] ?? '');
    
    $fullName = trim(($user['first_name_th'] ?? '') . ' ' . ($user['last_name_th'] ?? ''));
    if (empty($fullName)) {
        $fullName = $user['full_name_th'] ?? $user['name'] ?? $studentId;
    }

    // 2. ดึงหลักสูตร
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

    // 3. กำหนดชั้นปี
    $yearLevel = 4;
    if (strlen($studentId) >= 2 && ctype_digit(substr($studentId, 0, 2))) {
        $entryYear = 2500 + (int)substr($studentId, 0, 2);
        $currentYear = 2569;
        $calcLevel = $currentYear - $entryYear + 1;
        if ($calcLevel >= 1 && $calcLevel <= 8) {
            $yearLevel = $calcLevel;
        }
    }

    $checkStmt = $db->prepare("SELECT COUNT(*) FROM competency_items WHERE year_level = :yl");
    $checkStmt->execute([':yl' => $yearLevel]);
    if ($checkStmt->fetchColumn() == 0) {
        $findAnyYear = $db->query("SELECT year_level FROM competency_items ORDER BY year_level DESC LIMIT 1")->fetchColumn();
        if ($findAnyYear) {
            $yearLevel = (int)$findAnyYear;
        }
    }

    // 4. ดึงรายการข้อประเมิน
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
        LEFT JOIN curriculum_plo cp ON cp.id = ci.plo_id
        LEFT JOIN student_competency_assessments sca 
               ON sca.competency_item_id = ci.id 
              AND sca.student_id = :sid
        WHERE ci.year_level = :yl
        ORDER BY ci.sequence_no ASC
    ");
    $itemStmt->execute([
        ':sid' => $studentId,
        ':yl'  => $yearLevel,
    ]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    echo json_encode([
        "status" => "success",
        "data" => [
            "student_id" => $studentId,
            "full_name" => $fullName,
            "year_level" => $yearLevel,
            "academic_year" => 2569,
            "framework" => $framework,
            "items" => $items
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}