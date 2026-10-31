<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/academic_calendar.php';

define('APP_DEBUG', true);

/** กราฟอัตราคงอยู่แสดงแค่ชั้นปีที่ 1-4 ชั้นปีที่เกินจากนี้ไม่นำมาแสดง */
const RETENTION_MAX_YEAR_LEVEL = 4;

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $pdo = new PDO(
        "mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4",
        "MYSQL_USER",
        "MYSQL_PASSWORD",
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log("[Retention] DB Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? ("เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()) : "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * แปลงค่า student.status ให้เป็นคีย์มาตรฐานชุดเดียว
 *
 * ฐานข้อมูลมีค่าสถานะอยู่ 2 ชุด จึงต้องรองรับทั้งคู่
 *   ชุดอังกฤษ (เดิม) : Active, Graduted, Dropout, Retired, OnLeave, Resigned
 *   ชุดไทย (ใหม่)    : คงอยู่, จบการศึกษา, พักการเรียน, ลาออก
 */
function retentionStatusKey(?string $status): string
{
    $raw = trim((string)$status);
    if ($raw === '') {
        return 'active';
    }

    $map = [
        'active'        => 'active',
        'studying'      => 'active',
        'คงอยู่'         => 'active',
        'กำลังศึกษา'     => 'active',
        'graduated'     => 'graduated',
        'graduted'      => 'graduated', // สะกดผิดที่ค้างมาจากข้อมูลเดิม
        'จบการศึกษา'    => 'graduated',
        'สำเร็จการศึกษา' => 'graduated',
        'onleave'       => 'onleave',
        'พักการเรียน'    => 'onleave',
        'resigned'      => 'resigned',
        'ลาออก'         => 'resigned',
        'dropout'       => 'dropped',
        'retired'       => 'dropped',
        'พ้นสภาพ'       => 'dropped',
    ];

    return $map[mb_strtolower($raw, 'UTF-8')] ?? 'other';
}

/** ป้ายภาษาไทยของแต่ละสถานะ — ใช้คำชุดเดียวกันทั้งตาราง กราฟโดนัท และหน้าจัดการผู้ใช้ */
function retentionStatusLabel(string $key, ?string $rawStatus = null): string
{
    $labels = [
        'active'    => 'คงอยู่',
        'graduated' => 'จบการศึกษา',
        'onleave'   => 'พักการเรียน',
        'resigned'  => 'ลาออก',
        'dropped'   => 'พ้นสภาพ',
    ];

    if (isset($labels[$key])) {
        return $labels[$key];
    }

    // ค่าที่ไม่รู้จัก แสดงค่าดิบไปตรง ๆ จะได้เห็นว่าข้อมูลผิดปกติตรงไหน
    $raw = trim((string)$rawStatus);
    return $raw !== '' ? $raw : 'ไม่ระบุ';
}

/** สถานะที่ถือว่ายังคงอยู่ในระบบ (ใช้คำนวณอัตราคงอยู่ — คงพฤติกรรมเดิมไว้) */
function retentionIsRetained(string $key): bool
{
    return $key === 'active' || $key === 'graduated';
}

try {
    // 1) สัดส่วนสถานะ (pie chart)
    $stmtStatus = $pdo->query("
        SELECT IFNULL(NULLIF(TRIM(status), ''), 'Active') AS status, COUNT(*) AS count
        FROM student
        GROUP BY IFNULL(NULLIF(TRIM(status), ''), 'Active')
    ");
    $statusRows = $stmtStatus->fetchAll();

    // แยกกราฟโดนัทตามสถานะจริง ไม่รวบเป็นกลุ่มใหญ่ จะได้ใช้คำเดียวกับคอลัมน์ "สถานะ"
    $studying = 0;
    $graduated = 0;
    $dropped = 0;
    $byStatus = [];

    foreach ($statusRows as $row) {
        $key = retentionStatusKey($row['status'] ?? null);
        $count = (int)$row['count'];
        $label = retentionStatusLabel($key, $row['status'] ?? null);

        if (!isset($byStatus[$label])) {
            $byStatus[$label] = ['key' => $key, 'value' => 0];
        }
        $byStatus[$label]['value'] += $count;

        if ($key === 'active') {
            $studying += $count;
        } elseif ($key === 'graduated') {
            $graduated += $count;
        } else {
            $dropped += $count;
        }
    }

    // เรียงให้คงที่ทุกครั้ง หน้าเว็บจะได้ล็อกสีตามสถานะได้
    $statusOrder = ['active' => 1, 'graduated' => 2, 'onleave' => 3, 'resigned' => 4, 'dropped' => 5, 'other' => 6];
    uasort($byStatus, static function (array $a, array $b) use ($statusOrder): int {
        return ($statusOrder[$a['key']] ?? 99) <=> ($statusOrder[$b['key']] ?? 99);
    });

    $retentionPie = [];
    foreach ($byStatus as $label => $info) {
        if ($info['value'] > 0) {
            $retentionPie[] = [
                "name"       => $label,
                "statusKey"  => $info['key'],
                "value"      => $info['value'],
            ];
        }
    }

    $totalEnrolled = $studying + $graduated + $dropped;
    $retentionRate = $totalEnrolled > 0
        ? round(($studying + $graduated) / $totalEnrolled * 100, 1)
        : 0.0;
    $graduationRate = $totalEnrolled > 0
        ? round($graduated / $totalEnrolled * 100, 1)
        : 0.0;

    // 2) อัตราคงอยู่ตามชั้นปี
    $stmtByYear = $pdo->query("
        SELECT
            IFNULL(year_level, 1) AS year_level,
            IFNULL(NULLIF(TRIM(status), ''), 'Active') AS status,
            COUNT(*) AS count
        FROM student
        GROUP BY IFNULL(year_level, 1), IFNULL(NULLIF(TRIM(status), ''), 'Active')
        ORDER BY year_level
    ");

    $byYear = [];
    foreach ($stmtByYear->fetchAll() as $row) {
        $level = (int)$row['year_level'];
        if (!isset($byYear[$level])) {
            $byYear[$level] = ['total' => 0, 'retained' => 0];
        }
        $count = (int)$row['count'];
        $byYear[$level]['total'] += $count;
        if (retentionIsRetained(retentionStatusKey($row['status'] ?? null))) {
            $byYear[$level]['retained'] += $count;
        }
    }

    // ปีการศึกษาปัจจุบันมาจากการตั้งค่าของผู้ดูแลระบบ (หน้า "ตั้งค่าปีการศึกษา")
    // พอระบบเลื่อนชั้นปี ป้ายรหัสรุ่นบนแกน X จะขยับตามเองโดยไม่ต้องแก้โค้ด
    $currentAcademicYear = currentAcademicYear(null, $pdo);

    // แสดงเฉพาะชั้นปีที่ 1-4 เสมอ (ชั้นปีเกิน 4 ไม่นำมาแสดงในกราฟ)
    $retentionByYearLevel = [];
    for ($level = 1; $level <= RETENTION_MAX_YEAR_LEVEL; $level++) {
        $agg = $byYear[$level] ?? ['total' => 0, 'retained' => 0];
        $admissionYear = $currentAcademicYear - ($level - 1);

        $retentionByYearLevel[] = [
            "level"         => "ปี " . $level,
            "label"         => sprintf("ปี %d (รหัส %s)", $level, substr((string)$admissionYear, -2)),
            "admissionYear" => $admissionYear,
            "total"         => $agg['total'],
            "retained"      => $agg['retained'],
            "rate"          => $agg['total'] > 0 ? round($agg['retained'] / $agg['total'] * 100, 1) : 0.0,
        ];
    }

    // 3) รายชื่อออกกลางคันล่าสุด — คัดสถานะในฝั่ง PHP เพราะค่าสถานะมีทั้งชุดอังกฤษและชุดไทย
    //    สถานะและสาเหตุแยกคนละคอลัมน์ ให้ตรงกับหน้า "จัดการผู้ใช้" ของผู้ดูแลระบบ
    $stmtDropouts = $pdo->query("
        SELECT
            student_id,
            CONCAT(IFNULL(title, ''), IFNULL(first_name_th, ''), ' ', IFNULL(last_name_th, '')) AS name,
            IFNULL(year_level, '-') AS year,
            status,
            dropout_reason
        FROM student
        WHERE status IS NOT NULL AND TRIM(status) <> ''
        ORDER BY student_id DESC
    ");

    $recentDropouts = [];
    foreach ($stmtDropouts->fetchAll() as $row) {
        $key = retentionStatusKey($row['status'] ?? null);
        if (retentionIsRetained($key)) {
            continue; // ยังคงอยู่หรือจบการศึกษาแล้ว ไม่ใช่รายการออกกลางคัน
        }

        $reason = trim((string)($row['dropout_reason'] ?? ''));
        $recentDropouts[] = [
            "studentId"   => (string)$row['student_id'],
            "name"        => trim((string)$row['name']),
            "year"        => $row['year'],
            "statusKey"   => $key,
            "statusLabel" => retentionStatusLabel($key, $row['status'] ?? null),
            "reason"      => $reason !== '' ? $reason : null,
        ];

        if (count($recentDropouts) >= 50) {
            break;
        }
    }

    echo json_encode([
        "status" => "success",
        "data"   => [
            "stats" => [
                // total_students = กำลังศึกษา (หน้า Retention คำนวณคงอยู่ = studying + graduated)
                "total_students"   => $studying,
                "total_enrolled"   => $totalEnrolled,
                "retention_rate"   => $retentionRate,
                "graduation_rate"  => $graduationRate,
                "dropped"          => $dropped,
                "graduated"        => $graduated,
            ],
            "academicYear"          => $currentAcademicYear,
            "retention"             => $retentionPie,
            "retentionByYearLevel"  => $retentionByYearLevel,
            "recentDropouts"        => $recentDropouts,
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log("[Retention] Query Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log("[Retention] Unexpected Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    ], JSON_UNESCAPED_UNICODE);
}
