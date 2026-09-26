<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
 
if (file_exists(__DIR__ . '/../../../config/academic_helper.php')) {
    require_once __DIR__ . '/../../../config/academic_helper.php';
}
 
if (!function_exists('calculateRealtimeAcademicInfo')) {
    function calculateRealtimeAcademicInfo($studentId, $entryYearCandidate = null): array {
        $now = new DateTime();
        $currentYearBE = (int)$now->format('Y') + 543;
        $cutOffDate = new DateTime($now->format('Y') . '-08-10 00:00:00');
        $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);
 
        $cleanId = trim((string)$studentId);
        $entryYear = 0;
 
        if (strlen($cleanId) >= 2 && is_numeric(substr($cleanId, 0, 2))) {
            $entryYear = 2500 + (int)substr($cleanId, 0, 2);
        } elseif (!empty($entryYearCandidate) && is_numeric($entryYearCandidate) && (int)$entryYearCandidate >= 2500) {
            $entryYear = (int)$entryYearCandidate;
        } else {
            $entryYear = $academicYear;
        }
 
        $yearLevel = $academicYear - $entryYear + 1;
        if ($yearLevel < 1) $yearLevel = 1;
        if ($yearLevel > 8) $yearLevel = 8;
 
        return [
            'academic_year' => $academicYear,
            'year_level'    => $yearLevel,
            'entry_year'    => $entryYear
        ];
    }
}
 
ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");
 
$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}
 
// รองรับทุกรูปแบบชื่อพารามิเตอร์ที่หน้าบ้านอาจส่งมา
$targetStudentId = trim((string)($_GET['student_id'] ?? $_GET['studentId'] ?? $_GET['id'] ?? ''));
if ($targetStudentId === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสนักศึกษา"], JSON_UNESCAPED_UNICODE);
    exit;
}
 
try {
    $db = new Connect;
 
    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
 
    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }
 
    // ดึงข้อมูลนักศึกษา
    $sStmt = $db->prepare("SELECT student_id, first_name_th, last_name_th, year_level, admission_year FROM student WHERE student_id = :sid LIMIT 1");
    $sStmt->execute([':sid' => $targetStudentId]);
    $student = $sStmt->fetch(PDO::FETCH_ASSOC);
 
    $fullName = $student ? trim(($student['first_name_th'] ?? '') . ' ' . ($student['last_name_th'] ?? '')) : $targetStudentId;
 
    // คำนวณปีการศึกษาและชั้นปี Real-time
    $info = calculateRealtimeAcademicInfo($targetStudentId, $student['admission_year'] ?? null);
    $academicYear = $info['academic_year'];
    $yearLevel = isset($_GET['year_level']) && (int)$_GET['year_level'] > 0
        ? (int)$_GET['year_level']
        : $info['year_level'];
 
    // ดึงข้อมูลหลักสูตร (มี Fallback เผื่อไม่มีแถวที่ is_active = 1)
    $fwStmt = $db->query("SELECT id, curriculum_year, program_name FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $framework = $fwStmt ? $fwStmt->fetch(PDO::FETCH_ASSOC) : null;
    if (!$framework) {
        $fwFallback = $db->query("SELECT id, curriculum_year, program_name FROM curriculum_framework ORDER BY id DESC LIMIT 1");
        $framework = $fwFallback ? $fwFallback->fetch(PDO::FETCH_ASSOC) : null;
    }
 
    if (!$framework) {
        echo json_encode([
            "status" => "success",
            "data" => [
                "student_id"    => $targetStudentId,
                "full_name"     => $fullName,
                "year_level"    => $yearLevel,
                "academic_year" => $academicYear,
                "framework"     => null,
                "items"         => [],
                "groups"        => []
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
 
    // ดึง PLO ทั้งหมด
    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo WHERE framework_id = :fid ORDER BY sort_order ASC, plo_code ASC
    ");
    $ploStmt->execute([':fid' => $framework['id']]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
 
    // ดึงรายการประเมินสมรรถนะของชั้นปีนั้น
    $itemStmt = $db->prepare("
        SELECT ci.id, ci.plo_id, COALESCE(cp.plo_code, '') AS plo_code, COALESCE(cp.name, '') AS plo_name,
               ci.sequence_no, ci.competency_name, ci.is_scorable,
               sca.score, sca.assessed_at
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
        ':sid' => $targetStudentId,
        ':ay'  => $academicYear,
        ':fid' => $framework['id'],
        ':yl'  => $yearLevel
    ]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
 
    // 🌟 FIX: จัดกลุ่มรายการประเมินตาม PLO พร้อมระบบ "ยุบแถวซ้ำขั้นเด็ดขาด" และ "รักษาสถานะคะแนน"
    $itemsByPlo = [];
    $seenItems = []; // ใช้เก็บลำดับ (Index) ของข้อที่เคยดึงมาแล้ว
    
    foreach ($items as $item) {
        // ใช้แค่ PLO_ID + ลำดับข้อ (ห้ามมีข้อซ้ำกันใน PLO เดียวกัน)
        $uniqueKey = $item['plo_id'] . '_' . $item['sequence_no'];
        
        if (!isset($seenItems[$uniqueKey])) {
            // ยังไม่เคยเจอข้อนี้ ให้บันทึกลงไป
            $itemsByPlo[$item['plo_id']][] = $item;
            $seenItems[$uniqueKey] = count($itemsByPlo[$item['plo_id']]) - 1; // จำว่าอยู่ตำแหน่งไหน
        } else {
            // ถ้าเคยเจอ "ข้อซ้ำ" แล้ว ให้เช็กว่าตัวใหม่มี "คะแนน" ไหม?
            $idx = $seenItems[$uniqueKey];
            $existingItem = $itemsByPlo[$item['plo_id']][$idx];
            
            // ถ้าตัวเก่า (ที่โชว์อยู่) ไม่มีคะแนน แต่ตัวที่ซ้ำดันมีคะแนน 
            // ให้เอาตัวที่มีคะแนนไปทับที่เดิมทันที (ป้องกันคะแนนหาย)
            if (empty($existingItem['score']) && !empty($item['score'])) {
                $itemsByPlo[$item['plo_id']][$idx] = $item;
            }
        }
    }
 
    // ระบบตัดคำนำหน้าชื่อ PLO/YLO ที่ซ้ำซ้อน
    $stripPloCodePrefix = function (string $code, string $name): string {
        $name = trim($name);
        $stripped = preg_replace('/^[A-Za-z]+\s*\d+\s*[:\-]?\s*/', '', $name);
        return trim($stripped) !== '' ? trim($stripped) : $name;
    };
 
    $groups = array_map(function ($plo) use ($itemsByPlo, $stripPloCodePrefix) {
        $plo['plo_name'] = $stripPloCodePrefix($plo['plo_code'], $plo['plo_name']);
        $plo['items'] = $itemsByPlo[$plo['plo_id']] ?? [];
        return $plo;
    }, $plos);
 
    // ส่งคืนข้อมูล
    echo json_encode([
        "status" => "success",
        "data" => [
            "student_id"    => $targetStudentId,
            "full_name"     => $fullName,
            "year_level"    => $yearLevel,
            "academic_year" => $academicYear,
            "framework"     => $framework,
            "items"         => $items,
            "groups"        => $groups,
        ],
    ], JSON_UNESCAPED_UNICODE);
 
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>