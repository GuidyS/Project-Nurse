<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';

header('Content-Type: application/json; charset=UTF-8');

function deanDashboardRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function deanDashboardTableExists(PDO $db, string $table): bool
{
    $stmt = $db->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name'
    );
    $stmt->execute([':table_name' => $table]);
    return (int)$stmt->fetchColumn() > 0;
}

function deanDashboardColumnExists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table_name
           AND COLUMN_NAME = :column_name'
    );
    $stmt->execute([':table_name' => $table, ':column_name' => $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function deanDashboardPercent(float $part, float $total): float
{
    return $total > 0 ? round(($part / $total) * 100, 1) : 0.0;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    deanDashboardRespond(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

if (!isset($_SESSION['user_id'])) {
    deanDashboardRespond(401, ['status' => 'error', 'message' => 'Unauthorized']);
}

try {
    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Admin หรือ Teacher ที่มีตำแหน่งคณบดีเท่านั้น การซ่อนเมนูฝั่งหน้าเว็บไม่ถือเป็นการตรวจสิทธิ์
    $accessStmt = $db->prepare(
        'SELECT u.role_id,
                EXISTS(
                    SELECT 1 FROM user_position up
                    WHERE up.user_id = u.user_id AND up.position_id = 1
                ) AS is_dean
         FROM users u
         WHERE u.user_id = :user_id
         LIMIT 1'
    );
    $accessStmt->execute([':user_id' => $_SESSION['user_id']]);
    $access = $accessStmt->fetch();
    $roleId = (int)($access['role_id'] ?? 0);
    $isDean = (int)($access['is_dean'] ?? 0) === 1;

    if ($roleId !== 1 && !($roleId === 2 && $isDean)) {
        deanDashboardRespond(403, [
            'status' => 'error',
            'message' => 'ไม่มีสิทธิ์เข้าถึงแดชบอร์ดคณบดี',
        ]);
    }

    $currentYear = currentAcademicYear(null, $db);
    $requestedYear = isset($_GET['year']) ? (int)$_GET['year'] : $currentYear;
    $academicYear = ($requestedYear >= 2500 && $requestedYear <= 2700) ? $requestedYear : $currentYear;

    $availableYears = [$currentYear, $academicYear];
    foreach (['enrollment', 'project', 'tqf_documents', 'student_advisor_mapping'] as $yearTable) {
        if (!deanDashboardTableExists($db, $yearTable)
            || !deanDashboardColumnExists($db, $yearTable, 'academic_year')) {
            continue;
        }
        $years = $db->query(
            "SELECT DISTINCT academic_year FROM {$yearTable}
             WHERE academic_year BETWEEN 2500 AND 2700"
        )->fetchAll(PDO::FETCH_COLUMN);
        $availableYears = array_merge($availableYears, array_map('intval', $years));
    }
    $availableYears = array_values(array_unique(array_filter($availableYears)));
    rsort($availableYears, SORT_NUMERIC);

    // 1) นักศึกษาและการคงอยู่
    $studentRows = $db->query(
        "SELECT COALESCE(year_level, 1) AS year_level,
                COALESCE(NULLIF(TRIM(status), ''), 'Active') AS status,
                COUNT(*) AS total
         FROM student
         GROUP BY COALESCE(year_level, 1), COALESCE(NULLIF(TRIM(status), ''), 'Active')
         ORDER BY year_level"
    )->fetchAll();

    $studentBuckets = ['studying' => 0, 'graduated' => 0, 'dropped' => 0];
    $studentsByYear = [];
    for ($level = 1; $level <= 4; $level++) {
        $studentsByYear[$level] = [
            'name' => 'ปี ' . $level,
            'total' => 0,
            'studying' => 0,
            'graduated' => 0,
            'dropped' => 0,
        ];
    }
    foreach ($studentRows as $row) {
        $status = strtolower(trim((string)$row['status']));
        $bucket = in_array($status, ['', 'active', 'studying'], true)
            ? 'studying'
            : (in_array($status, ['graduated', 'graduted'], true) ? 'graduated' : 'dropped');
        $count = (int)$row['total'];
        $level = max(1, (int)$row['year_level']);
        $studentBuckets[$bucket] += $count;
        if (!isset($studentsByYear[$level])) {
            $studentsByYear[$level] = [
                'name' => 'ปี ' . $level,
                'total' => 0,
                'studying' => 0,
                'graduated' => 0,
                'dropped' => 0,
            ];
        }
        $studentsByYear[$level]['total'] += $count;
        $studentsByYear[$level][$bucket] += $count;
    }
    ksort($studentsByYear);

    $totalStudentRecords = array_sum($studentBuckets);
    $retainedStudents = $studentBuckets['studying'] + $studentBuckets['graduated'];
    $retentionRate = deanDashboardPercent($retainedStudents, $totalStudentRecords);
    $graduationRate = deanDashboardPercent($studentBuckets['graduated'], $totalStudentRecords);
    $studentAttention = (int)$db->query(
        "SELECT COUNT(*) FROM student WHERE TRIM(COALESCE(advisor_status, '')) = 'ไม่ปกติ'"
    )->fetchColumn();

    $retention = [
        ['name' => 'กำลังศึกษา', 'value' => $studentBuckets['studying']],
        ['name' => 'สำเร็จการศึกษา', 'value' => $studentBuckets['graduated']],
        ['name' => 'พ้นสภาพ/ลาออก', 'value' => $studentBuckets['dropped']],
    ];

    // 2) อาจารย์ ตำแหน่งวิชาการ และใบอนุญาตประกอบวิชาชีพ
    $totalFaculty = (int)$db->query(
        "SELECT COUNT(*) FROM faculty WHERE status = 'Active' OR status IS NULL"
    )->fetchColumn();

    $facultyByPosition = [];
    $positionStmt = $db->query(
        "SELECT CASE
                    WHEN TRIM(COALESCE(title, '')) REGEXP '^(ศ[.]|ศาสตราจารย์)' THEN 'ศาสตราจารย์'
                    WHEN TRIM(COALESCE(title, '')) REGEXP '^(รศ[.]|รองศาสตราจารย์)' THEN 'รองศาสตราจารย์'
                    WHEN TRIM(COALESCE(title, '')) REGEXP '^(ผศ[.]|ผู้ช่วยศาสตราจารย์)' THEN 'ผู้ช่วยศาสตราจารย์'
                    WHEN TRIM(COALESCE(title, '')) LIKE '%ดร%' THEN 'อาจารย์ ดร.'
                    ELSE 'อาจารย์'
                END AS name,
                COUNT(*) AS total
         FROM faculty
         WHERE status = 'Active' OR status IS NULL
         GROUP BY name
         ORDER BY total DESC"
    );
    foreach ($positionStmt->fetchAll() as $row) {
        $facultyByPosition[] = ['name' => (string)$row['name'], 'total' => (int)$row['total']];
    }

    $facultyLicense = [
        'registered' => 0,
        'valid' => 0,
        'expiring_within_6_months' => 0,
        'expired' => 0,
        'coverage_rate' => 0.0,
    ];
    if (deanDashboardColumnExists($db, 'faculty', 'nursing_council_no')
        && deanDashboardColumnExists($db, 'faculty', 'license_expiry')) {
        $licenseRow = $db->query(
            "SELECT
                SUM(CASE WHEN TRIM(COALESCE(nursing_council_no, '')) <> '' THEN 1 ELSE 0 END) AS registered,
                SUM(CASE WHEN license_expiry >= CURDATE() THEN 1 ELSE 0 END) AS valid_count,
                SUM(CASE WHEN license_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 MONTH) THEN 1 ELSE 0 END) AS expiring,
                SUM(CASE WHEN license_expiry < CURDATE() THEN 1 ELSE 0 END) AS expired
             FROM faculty
             WHERE status = 'Active' OR status IS NULL"
        )->fetch() ?: [];
        $facultyLicense = [
            'registered' => (int)($licenseRow['registered'] ?? 0),
            'valid' => (int)($licenseRow['valid_count'] ?? 0),
            'expiring_within_6_months' => (int)($licenseRow['expiring'] ?? 0),
            'expired' => (int)($licenseRow['expired'] ?? 0),
            'coverage_rate' => deanDashboardPercent((int)($licenseRow['registered'] ?? 0), $totalFaculty),
        ];
    }

    // 3) ความพร้อมขึ้นฝึก: ใช้สถานะวัคซีนหลักอย่างน้อย 3 กลุ่มที่มีข้อมูลภูมิ/วันที่รับวัคซีน
    $practicalByYear = [];
    if (deanDashboardTableExists($db, 'student_vaccinations')) {
        $practicalRows = $db->query(
            "SELECT COALESCE(s.year_level, 1) AS year_level,
                    COUNT(*) AS total_students,
                    SUM(COALESCE(v.ready, 0)) AS ready_students
             FROM student s
             LEFT JOIN (
                 SELECT student_id,
                        CASE WHEN COUNT(DISTINCT CASE
                            WHEN received_date IS NOT NULL
                              OR TRIM(COALESCE(immunity_status, '')) <> ''
                            THEN sequence_no END) >= 3
                        THEN 1 ELSE 0 END AS ready
                 FROM student_vaccinations
                 GROUP BY student_id
             ) v ON v.student_id = s.student_id
             WHERE LOWER(TRIM(COALESCE(s.status, ''))) IN ('', 'active', 'studying')
             GROUP BY COALESCE(s.year_level, 1)
             ORDER BY year_level"
        )->fetchAll();
        foreach ($practicalRows as $row) {
            $total = (int)$row['total_students'];
            $ready = (int)$row['ready_students'];
            $practicalByYear[] = [
                'year' => 'ปี ' . max(1, (int)$row['year_level']),
                'total' => $total,
                'ready' => $ready,
                'rate' => deanDashboardPercent($ready, $total),
            ];
        }
    }

    $practicalAssignments = [
        'students' => 0,
        'faculty' => 0,
        'average_students_per_faculty' => 0.0,
        'over_capacity_faculty' => 0,
        'task_completion_rate' => 0.0,
    ];
    if (deanDashboardTableExists($db, 'student_advisor_mapping')) {
        $practicalMap = $db->query(
            "SELECT COUNT(DISTINCT student_id) AS students,
                    COUNT(DISTINCT faculty_id) AS faculty
             FROM student_advisor_mapping
             WHERE advisor_type = 'practical'"
        )->fetch() ?: [];
        $practicalStudents = (int)($practicalMap['students'] ?? 0);
        $practicalFaculty = (int)($practicalMap['faculty'] ?? 0);
        $overPractical = (int)$db->query(
            "SELECT COUNT(*) FROM (
                SELECT faculty_id
                FROM student_advisor_mapping
                WHERE advisor_type = 'practical'
                GROUP BY faculty_id
                HAVING COUNT(DISTINCT student_id) > 8
             ) overloaded"
        )->fetchColumn();

        $taskCompletionRate = 0.0;
        if (deanDashboardTableExists($db, 'schedule_tasks')) {
            $taskRow = $db->query(
                "SELECT COUNT(*) AS total_tasks,
                        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
                 FROM schedule_tasks t
                 INNER JOIN (
                     SELECT DISTINCT student_id
                     FROM student_advisor_mapping
                     WHERE advisor_type = 'practical'
                 ) pm ON pm.student_id = t.student_id"
            )->fetch() ?: [];
            $taskCompletionRate = deanDashboardPercent(
                (int)($taskRow['completed_tasks'] ?? 0),
                (int)($taskRow['total_tasks'] ?? 0)
            );
        }

        $practicalAssignments = [
            'students' => $practicalStudents,
            'faculty' => $practicalFaculty,
            'average_students_per_faculty' => $practicalFaculty > 0
                ? round($practicalStudents / $practicalFaculty, 1)
                : 0.0,
            'over_capacity_faculty' => $overPractical,
            'task_completion_rate' => $taskCompletionRate,
        ];
    }

    // 4) งานอาจารย์ที่ปรึกษา
    $advising = [
        'students' => 0,
        'faculty' => 0,
        'average_students_per_faculty' => 0.0,
        'over_capacity_faculty' => 0,
        'capacity' => 12,
    ];
    if (deanDashboardTableExists($db, 'student_advisor_mapping')) {
        $advisorMap = $db->query(
            "SELECT COUNT(DISTINCT student_id) AS students,
                    COUNT(DISTINCT faculty_id) AS faculty
             FROM student_advisor_mapping
             WHERE advisor_type IN ('advisor', 'หลัก')"
        )->fetch() ?: [];
        $advisorStudents = (int)($advisorMap['students'] ?? 0);
        $advisorFaculty = (int)($advisorMap['faculty'] ?? 0);
        $advisorOverload = (int)$db->query(
            "SELECT COUNT(*) FROM (
                SELECT faculty_id
                FROM student_advisor_mapping
                WHERE advisor_type IN ('advisor', 'หลัก')
                GROUP BY faculty_id
                HAVING COUNT(DISTINCT student_id) > 12
             ) overloaded"
        )->fetchColumn();
        $advising = [
            'students' => $advisorStudents,
            'faculty' => $advisorFaculty,
            'average_students_per_faculty' => $advisorFaculty > 0
                ? round($advisorStudents / $advisorFaculty, 1)
                : 0.0,
            'over_capacity_faculty' => $advisorOverload,
            'capacity' => 12,
        ];
    }

    // 5) งานวิจัย แยกฐานข้อมูล/ระดับผลงานจาก category เดิม
    $research = [
        'outputs' => 0,
        'faculty' => 0,
        'ratio_per_faculty' => 0.0,
        'scopus' => 0,
        'tci' => 0,
        'by_database' => [],
    ];
    if (deanDashboardTableExists($db, 'faculty_research')) {
        $gregorianYear = $academicYear - 543;
        $researchStmt = $db->prepare(
            "SELECT COALESCE(NULLIF(TRIM(category), ''), 'ไม่ระบุฐาน') AS name,
                    COUNT(*) AS total
             FROM faculty_research
             WHERE publication_year IN (:academic_year, :gregorian_year)
             GROUP BY name
             ORDER BY total DESC"
        );
        $researchStmt->execute([
            ':academic_year' => $academicYear,
            ':gregorian_year' => $gregorianYear,
        ]);
        $researchRows = $researchStmt->fetchAll();
        $outputs = 0;
        $scopus = 0;
        $tci = 0;
        foreach ($researchRows as $row) {
            $name = (string)$row['name'];
            $count = (int)$row['total'];
            $outputs += $count;
            if (stripos($name, 'scopus') !== false) $scopus += $count;
            if (stripos($name, 'tci') !== false) $tci += $count;
            $research['by_database'][] = ['name' => $name, 'total' => $count];
        }
        $researchFacultyStmt = $db->prepare(
            'SELECT COUNT(DISTINCT faculty_id) FROM faculty_research
             WHERE publication_year IN (:academic_year, :gregorian_year)'
        );
        $researchFacultyStmt->execute([
            ':academic_year' => $academicYear,
            ':gregorian_year' => $gregorianYear,
        ]);
        $researchFaculty = (int)$researchFacultyStmt->fetchColumn();
        $research = array_merge($research, [
            'outputs' => $outputs,
            'faculty' => $researchFaculty,
            'ratio_per_faculty' => $totalFaculty > 0 ? round($outputs / $totalFaculty, 2) : 0.0,
            'scopus' => $scopus,
            'tci' => $tci,
        ]);
    }

    // 6) โครงการ งบประมาณ การเบิกจ่าย และความคืบหน้า (S-Curve Actual ล่าสุด)
    $projects = [
        'total' => 0,
        'active' => 0,
        'completed' => 0,
        'budget' => 0.0,
        'spent' => 0.0,
        'burn_rate' => 0.0,
        'average_progress' => 0.0,
        'over_budget' => 0,
        'top_projects' => [],
    ];
    if (deanDashboardTableExists($db, 'project')) {
        $hasBudgets = deanDashboardTableExists($db, 'project_budget_years');
        $hasProgress = deanDashboardTableExists($db, 'project_progress_logs');
        $budgetJoin = $hasBudgets
            ? "LEFT JOIN (
                    SELECT project_id,
                           SUM(COALESCE(budget_allocated, 0)) AS budget,
                           SUM(COALESCE(budget_spent, 0)) AS spent
                    FROM project_budget_years
                    GROUP BY project_id
               ) pb ON pb.project_id = p.project_id"
            : '';
        $progressJoin = $hasProgress
            ? "LEFT JOIN (
                    SELECT project_id, MAX(COALESCE(actual_percent, 0)) AS progress
                    FROM project_progress_logs
                    GROUP BY project_id
               ) pl ON pl.project_id = p.project_id"
            : '';
        $budgetSelect = $hasBudgets ? 'COALESCE(pb.budget, 0)' : '0';
        $spentSelect = $hasBudgets ? 'COALESCE(pb.spent, 0)' : '0';
        $progressSelect = $hasProgress ? 'COALESCE(pl.progress, 0)' : '0';
        $projectStmt = $db->prepare(
            "SELECT p.project_id,
                    COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), CONCAT('Project #', p.project_id)) AS name,
                    COALESCE(NULLIF(TRIM(p.status), ''), 'pending') AS status,
                    {$budgetSelect} AS budget,
                    {$spentSelect} AS spent,
                    {$progressSelect} AS progress
             FROM project p
             {$budgetJoin}
             {$progressJoin}
             WHERE p.academic_year = :academic_year
             ORDER BY budget DESC, p.project_id DESC"
        );
        $projectStmt->execute([':academic_year' => $academicYear]);
        $projectRows = $projectStmt->fetchAll();
        $progressTotal = 0.0;
        foreach ($projectRows as $index => $row) {
            $status = strtolower((string)$row['status']);
            $budget = (float)$row['budget'];
            $spent = (float)$row['spent'];
            $progress = (float)$row['progress'];
            $projects['total']++;
            if ($status === 'completed') $projects['completed']++;
            if (in_array($status, ['active', 'in_progress', 'approved'], true)) $projects['active']++;
            if ($spent > $budget && $budget > 0) $projects['over_budget']++;
            $projects['budget'] += $budget;
            $projects['spent'] += $spent;
            $progressTotal += $progress;
            if ($index < 6) {
                $projects['top_projects'][] = [
                    'name' => (string)$row['name'],
                    'budget' => $budget,
                    'spent' => $spent,
                    'progress' => round($progress, 1),
                ];
            }
        }
        $projects['budget'] = round($projects['budget'], 2);
        $projects['spent'] = round($projects['spent'], 2);
        $projects['burn_rate'] = deanDashboardPercent($projects['spent'], $projects['budget']);
        $projects['average_progress'] = count($projectRows) > 0
            ? round($progressTotal / count($projectRows), 1)
            : 0.0;
    }

    // 7) หลักสูตรและเอกสาร QA: นับความครอบคลุมรายวิชาที่มีเอกสาร มคอ.
    $curriculumQa = [
        'active_cycle' => null,
        'subjects' => 0,
        'tqf_documents' => 0,
        'documented_subjects' => 0,
        'tqf_coverage_rate' => 0.0,
    ];
    if (deanDashboardTableExists($db, 'curriculum_cycle')) {
        $hasActiveFlag = deanDashboardColumnExists($db, 'curriculum_cycle', 'is_active');
        $orderBy = $hasActiveFlag ? 'is_active DESC, start_year DESC, id DESC' : 'start_year DESC, id DESC';
        $cycle = $db->query(
            "SELECT id, start_year, end_year
             FROM curriculum_cycle
             ORDER BY {$orderBy}
             LIMIT 1"
        )->fetch();
        if ($cycle) {
            $curriculumQa['active_cycle'] = [
                'id' => (int)$cycle['id'],
                'start_year' => (int)$cycle['start_year'],
                'end_year' => (int)$cycle['end_year'],
            ];
            if (deanDashboardTableExists($db, 'curriculum_cycle_subject')) {
                $subjectStmt = $db->prepare(
                    'SELECT COUNT(*) FROM curriculum_cycle_subject WHERE cycle_id = :cycle_id'
                );
                $subjectStmt->execute([':cycle_id' => $cycle['id']]);
                $curriculumQa['subjects'] = (int)$subjectStmt->fetchColumn();
            }
        }
    }
    if (deanDashboardTableExists($db, 'tqf_documents')) {
        $tqfSql = 'SELECT COUNT(*) AS documents, COUNT(DISTINCT subject_code) AS subjects FROM tqf_documents';
        $tqfParams = [];
        if (deanDashboardColumnExists($db, 'tqf_documents', 'academic_year')) {
            $tqfSql .= ' WHERE academic_year = :academic_year';
            $tqfParams[':academic_year'] = $academicYear;
        }
        $tqfStmt = $db->prepare($tqfSql);
        $tqfStmt->execute($tqfParams);
        $tqfRow = $tqfStmt->fetch() ?: [];
        $curriculumQa['tqf_documents'] = (int)($tqfRow['documents'] ?? 0);
        $curriculumQa['documented_subjects'] = (int)($tqfRow['subjects'] ?? 0);
        $curriculumQa['tqf_coverage_rate'] = deanDashboardPercent(
            $curriculumQa['documented_subjects'],
            $curriculumQa['subjects']
        );
    }

    $alerts = [];
    if ($studentAttention > 0) {
        $alerts[] = ['tone' => 'danger', 'label' => "นักศึกษาที่ต้องติดตาม {$studentAttention} คน"];
    }
    if ($facultyLicense['expired'] > 0) {
        $alerts[] = ['tone' => 'danger', 'label' => "ใบอนุญาตอาจารย์หมดอายุ {$facultyLicense['expired']} คน"];
    }
    if ($facultyLicense['expiring_within_6_months'] > 0) {
        $alerts[] = ['tone' => 'warning', 'label' => "ใบอนุญาตใกล้หมดอายุ {$facultyLicense['expiring_within_6_months']} คน"];
    }
    if ($practicalAssignments['over_capacity_faculty'] > 0) {
        $alerts[] = ['tone' => 'warning', 'label' => "อาจารย์ปฏิบัติเกินสัดส่วน 1:8 จำนวน {$practicalAssignments['over_capacity_faculty']} คน"];
    }
    if ($advising['over_capacity_faculty'] > 0) {
        $alerts[] = ['tone' => 'warning', 'label' => "อาจารย์ที่ปรึกษาเกินสัดส่วน 1:12 จำนวน {$advising['over_capacity_faculty']} คน"];
    }
    if ($projects['over_budget'] > 0) {
        $alerts[] = ['tone' => 'warning', 'label' => "โครงการใช้งบเกินกรอบ {$projects['over_budget']} โครงการ"];
    }

    deanDashboardRespond(200, [
        'status' => 'success',
        'data' => [
            'academic_year' => $academicYear,
            'available_years' => $availableYears,
            'stats' => [
                'total_students' => $studentBuckets['studying'],
                'total_student_records' => $totalStudentRecords,
                'retention_rate' => $retentionRate,
                'graduation_rate' => $graduationRate,
                'total_faculty' => $totalFaculty,
                'total_budget' => $projects['budget'],
                'student_attention' => $studentAttention,
                'alerts' => count($alerts),
            ],
            'alerts' => $alerts,
            'students' => [
                'studying' => $studentBuckets['studying'],
                'graduated' => $studentBuckets['graduated'],
                'dropped' => $studentBuckets['dropped'],
                'retention_rate' => $retentionRate,
                'graduation_rate' => $graduationRate,
                'on_time_graduation_rate' => null,
                'on_time_note' => 'ยังไม่มีวันที่เข้าศึกษาที่เชื่อถือได้สำหรับคำนวณการจบตรงเวลา',
                'funnel' => [
                    ['name' => 'ข้อมูลนักศึกษาทั้งหมด', 'value' => $totalStudentRecords],
                    ['name' => 'คงอยู่หรือสำเร็จการศึกษา', 'value' => $retainedStudents],
                    ['name' => 'กำลังศึกษา', 'value' => $studentBuckets['studying']],
                    ['name' => 'สำเร็จการศึกษา', 'value' => $studentBuckets['graduated']],
                ],
            ],
            'retention' => $retention,
            'students_by_year' => array_values($studentsByYear),
            'faculty_by_position' => $facultyByPosition,
            'faculty_license' => $facultyLicense,
            'practical' => [
                'vaccination_by_year' => $practicalByYear,
                'assignments' => $practicalAssignments,
            ],
            'advising' => $advising,
            'research' => $research,
            'projects' => $projects,
            'financial' => ['projects' => $projects['top_projects']],
            'curriculum_qa' => $curriculumQa,
            'meta' => [
                'read_only' => true,
                'uses_existing_tables_only' => true,
                'grade_flow_included' => false,
            ],
        ],
    ]);
} catch (Throwable $e) {
    error_log('[DeanDashboard] ' . $e->getMessage());
    deanDashboardRespond(500, [
        'status' => 'error',
        'message' => 'ไม่สามารถโหลดข้อมูลแดชบอร์ดคณบดีได้ กรุณาลองใหม่อีกครั้ง',
    ]);
}
