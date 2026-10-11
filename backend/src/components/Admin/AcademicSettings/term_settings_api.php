<?php
/**
 * ตั้งค่าช่วงวันที่ของภาคเรียน (หน้า "จัดการหลักสูตร")
 *
 * วันเปิดภาคการศึกษาที่ 1 คือเส้นแบ่งปีการศึกษาของทั้งระบบด้วย
 * เปลี่ยนค่านี้แล้วทุกหน้าที่อ้างปีการศึกษาจะขยับตามทันที
 */
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

/** คืนค่าช่วงวันที่ทั้งหมดพร้อมข้อมูลปีการศึกษาปัจจุบัน */
function termSettingsPayload(PDO $db): array
{
    $boundary = academicYearBoundary($db);
    return [
        "terms" => array_values(academicTermRanges($db)),
        "boundary" => $boundary,
        "current_year" => currentAcademicYear(null, $db),
        "current_term" => academicCurrentTerm($db),
        "defaults" => array_map(
            static fn(int $term): array => [
                'term' => $term,
                'start' => ACADEMIC_TERM_DEFAULTS[$term]['start'],
                'end' => ACADEMIC_TERM_DEFAULTS[$term]['end'],
                'label' => ACADEMIC_TERM_DEFAULTS[$term]['label'],
            ],
            array_keys(ACADEMIC_TERM_DEFAULTS)
        ),
    ];
}

try {
    $db = new Connect;

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $roleStmt->execute([':id' => $userId]);
    $user = $roleStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: เฉพาะผู้ดูแลระบบเท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $page = $_GET['page'] ?? '';

    if ($page === 'get-term-settings') {
        echo json_encode(["status" => "success", "data" => termSettingsPayload($db)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method Not Allowed"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['terms']) || !is_array($input['terms'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Payload JSON ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ตรวจรูปแบบวันที่ก่อน แล้วค่อยบันทึกทีเดียว
    $clean = [];
    foreach ($input['terms'] as $row) {
        if (!is_array($row)) {
            continue;
        }
        $term = (int)($row['term'] ?? 0);
        if (!isset(ACADEMIC_TERM_DEFAULTS[$term])) {
            continue;
        }
        $start = trim((string)($row['start'] ?? ''));
        $end = trim((string)($row['end'] ?? ''));
        $label = ACADEMIC_TERM_DEFAULTS[$term]['label'];

        if (academicMonthDayValue($start) === null || academicMonthDayValue($end) === null) {
            http_response_code(422);
            echo json_encode([
                "status" => "error",
                "message" => "{$label}: วันที่ไม่ถูกต้อง ต้องเป็นรูปแบบ เดือน-วัน เช่น 08-15",
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $clean[$term] = ['start' => $start, 'end' => $end, 'label' => $label];
    }

    if (count($clean) !== count(ACADEMIC_TERM_DEFAULTS)) {
        http_response_code(422);
        echo json_encode([
            "status" => "error",
            "message" => "กรุณาระบุช่วงวันที่ให้ครบทุกภาคเรียน",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ทุกวันในปีต้องตกอยู่ในภาคเรียนใดภาคเรียนหนึ่งพอดี ห้ามซ้อนทับหรือมีช่องว่าง
    $covered = [];
    foreach ($clean as $term => $range) {
        $start = academicMonthDayValue($range['start']);
        $end = academicMonthDayValue($range['end']);
        for ($month = 1; $month <= 12; $month++) {
            for ($day = 1; $day <= 31; $day++) {
                if (!checkdate($month, $day, 2024)) { // 2024 เป็นปีอธิกสุรทิน ครอบคลุม 29 ก.พ. ด้วย
                    continue;
                }
                $value = $month * 100 + $day;
                $inRange = $start <= $end
                    ? ($value >= $start && $value <= $end)
                    : ($value >= $start || $value <= $end);
                if ($inRange) {
                    $covered[$value][] = $term;
                }
            }
        }
    }

    $overlap = null;
    $gap = null;
    for ($month = 1; $month <= 12; $month++) {
        for ($day = 1; $day <= 31; $day++) {
            if (!checkdate($month, $day, 2024)) {
                continue;
            }
            $value = $month * 100 + $day;
            $count = count($covered[$value] ?? []);
            if ($count > 1 && $overlap === null) {
                $overlap = sprintf('%02d-%02d', $month, $day);
            }
            if ($count === 0 && $gap === null) {
                $gap = sprintf('%02d-%02d', $month, $day);
            }
        }
    }

    if ($overlap !== null) {
        http_response_code(422);
        echo json_encode([
            "status" => "error",
            "message" => "ช่วงวันที่ซ้อนทับกัน (เช่นวันที่ {$overlap} อยู่ในหลายภาคเรียน) กรุณาตรวจสอบอีกครั้ง",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($gap !== null) {
        http_response_code(422);
        echo json_encode([
            "status" => "error",
            "message" => "มีวันที่ไม่อยู่ในภาคเรียนใดเลย (เช่นวันที่ {$gap}) กรุณาระบุช่วงให้ต่อเนื่องตลอดปี",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $before = academicTermRanges($db);
    foreach ($clean as $term => $range) {
        academicSetSetting($db, academicTermSettingKey($term, 'start'), $range['start']);
        academicSetSetting($db, academicTermSettingKey($term, 'end'), $range['end']);
    }

    $summary = implode(', ', array_map(
        static fn(int $t): string => ACADEMIC_TERM_DEFAULTS[$t]['label'] . ' ' . $clean[$t]['start'] . ' ถึง ' . $clean[$t]['end'],
        array_keys($clean)
    ));
    logAudit($db, $userId, 'update', 'system_settings', "แก้ไขช่วงวันที่ภาคเรียน: {$summary}");

    $boundaryChanged = ($before[1]['start'] ?? null) !== $clean[1]['start'];

    echo json_encode([
        "status" => "success",
        "message" => $boundaryChanged
            ? "บันทึกช่วงวันที่ภาคเรียนแล้ว — วันเริ่มปีการศึกษาเปลี่ยนเป็น " . $clean[1]['start']
            : "บันทึกช่วงวันที่ภาคเรียนเรียบร้อยแล้ว",
        "data" => termSettingsPayload($db),
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
