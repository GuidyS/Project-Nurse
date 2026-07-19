<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Access-Control-Allow-Origin: http://localhost:5173");
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
 * จัดกลุ่มสถานะนักศึกษาให้สอดคล้องกับ DeanDashboard
 * NULL / Active / Studying → กำลังศึกษา
 * Graduated (+ typo Graduted) → สำเร็จการศึกษา
 * อื่นๆ → พ้นสภาพ/ลาออก
 */
function classifyStudentStatus(?string $status): string
{
    $normalized = trim((string)$status);
    if ($normalized === '' || $normalized === 'Active' || $normalized === 'Studying') {
        return 'studying';
    }
    if ($normalized === 'Graduated' || $normalized === 'Graduted') {
        return 'graduated';
    }
    return 'dropped';
}

function statusLabelTh(string $bucket, ?string $rawStatus = null): string
{
    if ($bucket === 'studying') {
        return 'กำลังศึกษา';
    }
    if ($bucket === 'graduated') {
        return 'สำเร็จการศึกษา';
    }
    $raw = trim((string)$rawStatus);
    return $raw !== '' ? $raw : 'พ้นสภาพ/ลาออก';
}

try {
    // 1) สัดส่วนสถานะ (pie chart)
    $stmtStatus = $pdo->query("
        SELECT IFNULL(NULLIF(TRIM(status), ''), 'Active') AS status, COUNT(*) AS count
        FROM student
        GROUP BY IFNULL(NULLIF(TRIM(status), ''), 'Active')
    ");
    $statusRows = $stmtStatus->fetchAll();

    $studying = 0;
    $graduated = 0;
    $dropped = 0;
    $retentionPie = [];
    $pieBuckets = [
        'studying' => 0,
        'graduated' => 0,
        'dropped' => 0,
    ];

    foreach ($statusRows as $row) {
        $bucket = classifyStudentStatus($row['status'] ?? null);
        $count = (int)$row['count'];
        $pieBuckets[$bucket] += $count;

        if ($bucket === 'studying') {
            $studying += $count;
        } elseif ($bucket === 'graduated') {
            $graduated += $count;
        } else {
            $dropped += $count;
        }
    }

    foreach (['studying' => 'กำลังศึกษา', 'graduated' => 'สำเร็จการศึกษา', 'dropped' => 'พ้นสภาพ/ลาออก'] as $key => $label) {
        if ($pieBuckets[$key] > 0) {
            $retentionPie[] = [
                "name"  => $label,
                "value" => $pieBuckets[$key],
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
        $bucket = classifyStudentStatus($row['status'] ?? null);
        $byYear[$level]['total'] += $count;
        if ($bucket === 'studying' || $bucket === 'graduated') {
            $byYear[$level]['retained'] += $count;
        }
    }

    $retentionByYearLevel = [];
    ksort($byYear);
    foreach ($byYear as $level => $agg) {
        $total = $agg['total'];
        $retained = $agg['retained'];
        $retentionByYearLevel[] = [
            "level"    => "ปี " . $level,
            "total"    => $total,
            "retained" => $retained,
            "rate"     => $total > 0 ? round($retained / $total * 100, 1) : 0.0,
        ];
    }

    // 3) รายชื่อออกกลางคันล่าสุด (สถานะที่ไม่ใช่กำลังศึกษา/สำเร็จการศึกษา)
    $stmtDropouts = $pdo->query("
        SELECT
            student_id,
            CONCAT(IFNULL(title, ''), IFNULL(first_name_th, ''), ' ', IFNULL(last_name_th, '')) AS name,
            IFNULL(year_level, '-') AS year,
            status
        FROM student
        WHERE status IS NOT NULL
          AND TRIM(status) <> ''
          AND status NOT IN ('Active', 'Studying', 'Graduated', 'Graduted')
        ORDER BY student_id DESC
        LIMIT 50
    ");

    $recentDropouts = [];
    foreach ($stmtDropouts->fetchAll() as $row) {
        $recentDropouts[] = [
            "studentId" => (string)$row['student_id'],
            "name"      => trim((string)$row['name']),
            "year"      => $row['year'],
            "reason"    => statusLabelTh('dropped', $row['status'] ?? null),
        ];
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
