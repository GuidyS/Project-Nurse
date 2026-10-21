<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header('Content-Type: application/json; charset=UTF-8');

function fiveYearSummaryRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/** แปลงวัน/เวลา ค.ศ. เป็นปีการศึกษา พ.ศ. ตามวันเปิดภาคเรียนที่ 1 ของระบบ */
function fiveYearSummaryAcademicYear($value, array $boundary): ?int
{
    $raw = trim((string)$value);
    if ($raw === '') {
        return null;
    }

    try {
        $date = new DateTimeImmutable($raw, new DateTimeZone('Asia/Bangkok'));
    } catch (Throwable $e) {
        return null;
    }

    $monthDay = ((int)$date->format('n') * 100) + (int)$date->format('j');
    $boundaryValue = ((int)$boundary['month'] * 100) + (int)$boundary['day'];

    return (int)$date->format('Y') + 543 - ($monthDay < $boundaryValue ? 1 : 0);
}

function fiveYearSummaryIsGraduated($status): bool
{
    return in_array(strtolower(trim((string)$status)), ['graduated', 'graduted'], true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fiveYearSummaryRespond(405, [
        'status' => 'error',
        'message' => 'Method not allowed',
    ]);
}

try {
    $db = new Connect();

    // ตรวจบทบาทจากฐานข้อมูล: Admin และ Teacher อ่านรายงานได้เท่านั้น
    $roleStmt = $db->prepare('SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1');
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    $roleId = (int)$roleStmt->fetchColumn();
    if (!in_array($roleId, [1, 2], true)) {
        fiveYearSummaryRespond(403, [
            'status' => 'error',
            'message' => 'ไม่มีสิทธิ์ดูรายงานผลสรุป 5 ปี',
        ]);
    }

    $programRows = $db->query("
        SELECT program_id, program_code, name_th, name_en
        FROM program
        ORDER BY program_id
    ")->fetchAll(PDO::FETCH_ASSOC);

    $programs = array_map(static function (array $row): array {
        $name = trim((string)($row['name_th'] ?? ''));
        if ($name === '') {
            $name = trim((string)($row['name_en'] ?? ''));
        }
        if ($name === '') {
            $name = trim((string)($row['program_code'] ?? ''));
        }

        return [
            'id' => (int)$row['program_id'],
            'code' => (string)($row['program_code'] ?? ''),
            'name' => $name !== '' ? $name : ('หลักสูตร #' . $row['program_id']),
        ];
    }, $programRows ?: []);

    $programParam = trim((string)($_GET['program'] ?? 'all'));
    $selectedProgramId = null;
    if ($programParam !== '' && $programParam !== 'all') {
        if (!ctype_digit($programParam) || (int)$programParam < 1) {
            fiveYearSummaryRespond(400, [
                'status' => 'error',
                'message' => 'รหัสหลักสูตรไม่ถูกต้อง',
            ]);
        }
        $selectedProgramId = (int)$programParam;
        $validProgram = array_filter(
            $programs,
            static fn(array $program): bool => $program['id'] === $selectedProgramId
        );
        if (!$validProgram) {
            fiveYearSummaryRespond(404, [
                'status' => 'error',
                'message' => 'ไม่พบหลักสูตรที่เลือก',
            ]);
        }
    }

    $currentYear = currentAcademicYear(null, $db);
    $years = range($currentYear - 4, $currentYear);
    $yearly = [];
    foreach ($years as $year) {
        $yearly[$year] = [
            'year' => (string)$year,
            'graduates' => 0,
            'employmentRespondents' => 0,
            'employedCount' => 0,
            'employmentRate' => 0.0,
            'licenseFirstAttemptPassed' => 0,
            'licenseWithinOneYearPassed' => 0,
        ];
    }

    $sql = "
        SELECT
            program_id,
            status,
            graduation_date,
            advisor_status,
            advisor_is_employed,
            license_first_attempt_passed,
            license_first_attempt_passed_at,
            license_within_one_year_passed,
            license_within_one_year_passed_at
        FROM student
    ";
    $params = [];
    if ($selectedProgramId !== null) {
        $sql .= ' WHERE program_id = :program_id';
        $params[':program_id'] = $selectedProgramId;
    }

    $studentStmt = $db->prepare($sql);
    $studentStmt->execute($params);
    $students = $studentStmt->fetchAll(PDO::FETCH_ASSOC);
    $boundary = academicYearBoundary($db);

    $unassigned = [
        'graduates' => 0,
        'employmentRespondents' => 0,
        'employedCount' => 0,
        'licenseFirstAttemptPassed' => 0,
        'licenseWithinOneYearPassed' => 0,
    ];
    $recordsWithoutProgram = 0;

    foreach ($students as $student) {
        $isGraduated = fiveYearSummaryIsGraduated($student['status'] ?? null);
        $isEmploymentRespondent = trim((string)($student['advisor_status'] ?? '')) === 'จบการศึกษา';
        $isEmployed = $isEmploymentRespondent && (int)($student['advisor_is_employed'] ?? 0) === 1;
        $firstAttemptPassed = (int)($student['license_first_attempt_passed'] ?? 0) === 1;
        $withinOneYearPassed = (int)($student['license_within_one_year_passed'] ?? 0) === 1;

        if (($student['program_id'] ?? null) === null
            && ($isGraduated || $isEmploymentRespondent || $firstAttemptPassed || $withinOneYearPassed)) {
            $recordsWithoutProgram++;
        }

        $graduationYear = fiveYearSummaryAcademicYear($student['graduation_date'] ?? null, $boundary);
        if ($isGraduated) {
            if ($graduationYear !== null && isset($yearly[$graduationYear])) {
                $yearly[$graduationYear]['graduates']++;
            } elseif ($graduationYear === null) {
                $unassigned['graduates']++;
            }
        }

        // สถานะการมีงานทำเป็นข้อมูลของบัณฑิต จึงจัดปีตาม graduation_date เท่านั้น
        if ($isEmploymentRespondent) {
            if ($graduationYear !== null && isset($yearly[$graduationYear])) {
                $yearly[$graduationYear]['employmentRespondents']++;
                if ($isEmployed) {
                    $yearly[$graduationYear]['employedCount']++;
                }
            } elseif ($graduationYear === null) {
                $unassigned['employmentRespondents']++;
                if ($isEmployed) {
                    $unassigned['employedCount']++;
                }
            }
        }

        // ฐานข้อมูลปัจจุบันมีเฉพาะวันที่บันทึกสถานะผ่าน จึงใช้เป็นปีอ้างอิงของกราฟผลสอบ
        if ($firstAttemptPassed) {
            $firstAttemptYear = fiveYearSummaryAcademicYear(
                $student['license_first_attempt_passed_at'] ?? null,
                $boundary
            );
            if ($firstAttemptYear !== null && isset($yearly[$firstAttemptYear])) {
                $yearly[$firstAttemptYear]['licenseFirstAttemptPassed']++;
            } elseif ($firstAttemptYear === null) {
                $unassigned['licenseFirstAttemptPassed']++;
            }
        }

        if ($withinOneYearPassed) {
            $withinOneYear = fiveYearSummaryAcademicYear(
                $student['license_within_one_year_passed_at'] ?? null,
                $boundary
            );
            if ($withinOneYear !== null && isset($yearly[$withinOneYear])) {
                $yearly[$withinOneYear]['licenseWithinOneYearPassed']++;
            } elseif ($withinOneYear === null) {
                $unassigned['licenseWithinOneYearPassed']++;
            }
        }
    }

    foreach ($yearly as &$row) {
        $row['employmentRate'] = $row['employmentRespondents'] > 0
            ? round($row['employedCount'] / $row['employmentRespondents'] * 100, 1)
            : 0.0;
    }
    unset($row);

    fiveYearSummaryRespond(200, [
        'status' => 'success',
        'data' => [
            'yearlyData' => array_values($yearly),
            'programs' => $programs,
            'coverage' => [
                'unassigned' => $unassigned,
                'recordsWithoutProgram' => $selectedProgramId === null ? $recordsWithoutProgram : 0,
            ],
            'sourceNotes' => [
                'graduateAndEmploymentYear' => 'จัดกลุ่มตามวันที่จบการศึกษา',
                'licenseYear' => 'จัดกลุ่มตามวันที่ระบบบันทึกสถานะผ่าน',
            ],
        ],
    ]);
} catch (Throwable $e) {
    error_log('[FiveYearSummary] ' . $e->getMessage());
    fiveYearSummaryRespond(500, [
        'status' => 'error',
        'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป 5 ปี',
    ]);
}
