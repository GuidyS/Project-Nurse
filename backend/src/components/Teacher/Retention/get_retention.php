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

define('APP_DEBUG', true);

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
    $pdo->exec("SET NAMES utf8mb4");
} catch (PDOException $e) {
    error_log("[Retention] DB Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? ("เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()) : "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once __DIR__ . '/../../../config/academic_calendar.php';

/**
 * แก้ไขปัญหาฟอนต์อ่านไม่ออก (Mojibake / Double UTF-8 encoding)
 */
function fixMojibake(?string $str): string
{
    if ($str === null || $str === '') {
        return '';
    }
    // หากพบตัวอักขระ Latin-1 ที่เกิดจาก UTF-8 ถูก double encode (เช่น à¸ หรือ à¹)
    if (strpos($str, 'à¸') !== false || strpos($str, 'à¹') !== false) {
        $decoded = @mb_convert_encoding($str, 'ISO-8859-1', 'UTF-8');
        if ($decoded !== false && mb_check_encoding($decoded, 'UTF-8')) {
            return $decoded;
        }
    }
    return $str;
}

/**
 * แปลงสถานะเป็นภาษาไทยให้ตรงกับ Role Admin (UsersManagement.tsx)
 * และรองรับทั้งค่าภาษาอังกฤษและภาษาไทยที่อาจมีอยู่ในฐานข้อมูล
 */
function getStudentStatusLabel(?string $status): string
{
    $normalized = fixMojibake(trim((string)$status));
    return match ($normalized) {
        'Active', 'Studying', 'คงอยู่', 'กำลังศึกษา', 'ปกติ', '' => 'คงอยู่',
        'Graduated', 'Graduted', 'สำเร็จการศึกษา', 'จบการศึกษา' => 'สำเร็จการศึกษา',
        'OnLeave', 'พักการเรียน' => 'พักการเรียน',
        'Resigned', 'ลาออก' => 'ลาออก',
        'Retired', 'Dropout', 'พ้นสภาพ' => 'พ้นสภาพ',
        default => $normalized
    };
}

/**
 * จัดกลุ่มสถานะนักศึกษาสำหรับสถิติคงอยู่
 * 'Active' / 'Studying' / 'คงอยู่' / 'กำลังศึกษา' / 'ปกติ' / NULL / '' → studying (คงอยู่)
 * 'Graduated' / 'Graduted' / 'สำเร็จการศึกษา' / 'จบการศึกษา' → graduated (สำเร็จการศึกษา)
 * อื่นๆ (OnLeave, Resigned, Retired, Dropout, พ้นสภาพ, ลาออก, พักการเรียน) → dropped (ออกกลางคัน)
 */
function classifyStudentStatus(?string $status): string
{
    $normalized = fixMojibake(trim((string)$status));
    if (in_array($normalized, ['', 'Active', 'Studying', 'คงอยู่', 'กำลังศึกษา', 'ปกติ'], true)) {
        return 'studying';
    }
    if (in_array($normalized, ['Graduated', 'Graduted', 'สำเร็จการศึกษา', 'จบการศึกษา'], true)) {
        return 'graduated';
    }
    return 'dropped';
}

try {
    $academicYear = currentAcademicYear(null, $pdo);

    // 1) สัดส่วนสถานะ (pie chart) - ใช้ชื่อภาษาไทยตรงกับ Role Admin
    $stmtStatus = $pdo->query("
        SELECT IFNULL(NULLIF(TRIM(status), ''), 'Active') AS status, COUNT(*) AS count
        FROM student
        GROUP BY IFNULL(NULLIF(TRIM(status), ''), 'Active')
    ");
    $statusRows = $stmtStatus->fetchAll();

    $studying = 0;
    $graduated = 0;
    $dropped = 0;
    $statusCounts = [];

    foreach ($statusRows as $row) {
        $raw = $row['status'] ?? '';
        $label = getStudentStatusLabel($raw);
        $count = (int)$row['count'];
        
        $statusCounts[$label] = ($statusCounts[$label] ?? 0) + $count;

        $bucket = classifyStudentStatus($raw);
        if ($bucket === 'studying') {
            $studying += $count;
        } elseif ($bucket === 'graduated') {
            $graduated += $count;
        } else {
            $dropped += $count;
        }
    }

    $retentionPie = [];
    $desiredOrder = ['คงอยู่', 'สำเร็จการศึกษา', 'พ้นสภาพ', 'ลาออก', 'พักการเรียน'];
    foreach ($desiredOrder as $lbl) {
        if (!empty($statusCounts[$lbl])) {
            $retentionPie[] = [
                "name"  => $lbl,
                "value" => $statusCounts[$lbl],
            ];
            unset($statusCounts[$lbl]);
        }
    }
    foreach ($statusCounts as $lbl => $val) {
        if ($val > 0) {
            $retentionPie[] = [
                "name"  => $lbl,
                "value" => $val,
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

    // 2) อัตราคงอยู่ตามชั้นปี (เฉพาะปี 1 - 4 ตามคำสั่ง: เกิน ปี4 ไม่ต้องดึงมา)
    $stmtByYear = $pdo->query("
        SELECT
            year_level,
            IFNULL(NULLIF(TRIM(status), ''), 'Active') AS status,
            COUNT(*) AS count
        FROM student
        WHERE year_level BETWEEN 1 AND 4
        GROUP BY year_level, IFNULL(NULLIF(TRIM(status), ''), 'Active')
        ORDER BY year_level ASC
    ");

    $byYear = [];
    foreach ($stmtByYear->fetchAll() as $row) {
        $level = (int)$row['year_level'];
        if (!isset($byYear[$level])) {
            $byYear[$level] = ['total' => 0, 'retained' => 0];
        }
        $count = (int)$row['count'];
        $bucket = classifyStudentStatus($row['status'] ?? null);
        $byYear[$level]['total'] += $count;
        if ($bucket === 'studying' || $bucket === 'graduated') {
            $byYear[$level]['retained'] += $count;
        }
    }

    // สร้างข้อมูลชั้นปี 1 ถึง 4 ให้ครบตามลำดับเสมอ
    $retentionByYearLevel = [];
    for ($level = 1; $level <= 4; $level++) {
        $agg = $byYear[$level] ?? ['total' => 0, 'retained' => 0];
        $total = (int)$agg['total'];
        $retained = (int)$agg['retained'];
        $cohortYearBE = $academicYear - $level + 1;
        $cohortCode = substr((string)$cohortYearBE, -2);
        $retentionByYearLevel[] = [
            "level"       => "ปี " . $level,
            "year"        => $level,
            "cohortYear"  => $cohortYearBE,
            "cohortCode"  => $cohortCode,
            "cohortLabel" => "รหัส " . $cohortCode,
            "total"       => $total,
            "retained"    => $retained,
            "rate"        => $total > 0 ? round($retained / $total * 100, 1) : 0.0,
        ];
    }

    // 3) รายชื่อออกกลางคันล่าสุด (เฉพาะสถานะที่ไม่ใช่ คงอยู่ หรือ สำเร็จการศึกษา)
    $stmtDropouts = $pdo->query("
        SELECT
            student_id,
            CONCAT(IFNULL(title, ''), IFNULL(first_name_th, ''), ' ', IFNULL(last_name_th, '')) AS name,
            IFNULL(year_level, '-') AS year,
            status,
            dropout_reason,
            dropout_date
        FROM student
        WHERE status IS NOT NULL
          AND TRIM(status) <> ''
          AND status NOT IN (
              'Active', 'Studying', 'Graduated', 'Graduted',
              'คงอยู่', 'กำลังศึกษา', 'ปกติ',
              'สำเร็จการศึกษา', 'จบการศึกษา'
          )
        ORDER BY student_id DESC
        LIMIT 100
    ");

    $recentDropouts = [];
    foreach ($stmtDropouts->fetchAll() as $row) {
        $rawStatus = (string)($row['status'] ?? '');
        $thStatus = getStudentStatusLabel($rawStatus);
        $reason = fixMojibake(trim((string)($row['dropout_reason'] ?? '')));
        if ($reason === '') {
            $reason = '-';
        }
        $yearVal = $row['year'];
        if ($yearVal !== '-' && is_numeric($yearVal)) {
            $yNum = (int)$yearVal;
            $yearVal = ($yNum >= 1 && $yNum <= 4) ? $yNum : $yearVal;
        }
        $recentDropouts[] = [
            "studentId"     => (string)$row['student_id'],
            "name"          => trim((string)$row['name']),
            "year"          => $yearVal,
            "status"        => $thStatus,
            "rawStatus"     => $rawStatus,
            "reason"        => $reason,
            "dropout_date"  => $row['dropout_date'] ?? null,
        ];
    }

    echo json_encode([
        "status" => "success",
        "data"   => [
            "academic_year"        => $academicYear,
            "stats" => [
                "total_students"   => $studying,
                "total_enrolled"   => $totalEnrolled,
                "retention_rate"   => $retentionRate,
                "graduation_rate"  => $graduationRate,
                "dropped"          => $dropped,
                "graduated"        => $graduated,
            ],
            "retention"            => $retentionPie,
            "retentionByYearLevel" => $retentionByYearLevel,
            "recentDropouts"       => $recentDropouts,
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
