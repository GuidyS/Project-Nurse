<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
    exit;
}

function workloadContains(string $haystack, string $needle): bool
{
    if ($needle === '') {
        return false;
    }

    if (function_exists('mb_strpos')) {
        return mb_strpos($haystack, $needle, 0, 'UTF-8') !== false;
    }

    return strpos($haystack, $needle) !== false;
}

function classifyWorkloadProject(array $row): ?string
{
    $strategy = (string)($row['strategy'] ?? '');
    $text = implode(' ', [
        $strategy,
        (string)($row['project_name'] ?? ''),
        (string)($row['activity_name'] ?? ''),
    ]);

    if (
        workloadContains($strategy, 'ทำนุบำรุงศิลปวัฒนธรรม') ||
        workloadContains($text, 'ศิลปวัฒนธรรม') ||
        workloadContains($text, 'ศิลปะและวัฒนธรรม')
    ) {
        return 'culture';
    }

    if (
        workloadContains($text, 'บริการวิชาการ') ||
        workloadContains($text, 'บริการแก่สังคม') ||
        workloadContains($text, 'บริการสังคม')
    ) {
        return 'academic_service';
    }

    return null;
}

function uniqueCount(array $values): int
{
    return count(array_unique(array_filter(array_map('strval', $values), fn($value) => $value !== '')));
}

function summarizeProjectRecords(array $records): array
{
    return [
        'projects' => uniqueCount(array_column($records, 'project_name')),
        'activities' => count(array_filter($records, fn($record) => ($record['row_type'] ?? '') === 'activity')),
        'items' => count($records),
        'records' => array_values($records),
    ];
}

try {
    $db = new Connect();

    $roleStmt = $db->prepare('SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1');
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    $roleId = (int)($roleStmt->fetchColumn() ?: 0);

    $isDean = false;
    if ($roleId === 2) {
        $positionStmt = $db->prepare(
            'SELECT COUNT(*) FROM user_position WHERE user_id = :user_id AND position_id = 1'
        );
        $positionStmt->execute([':user_id' => $_SESSION['user_id']]);
        $isDean = (int)$positionStmt->fetchColumn() > 0;
    }

    if ($roleId !== 1 && !$isDean) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'ไม่มีสิทธิ์เข้าถึงข้อมูลภาระงานระดับคณะ'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $years = array_map('intval', $db->query(
        'SELECT DISTINCT academic_year FROM annual_project_report_items ORDER BY academic_year DESC'
    )->fetchAll(PDO::FETCH_COLUMN));

    $defaultYear = $years[0] ?? ((int)date('Y') + 543);
    $academicYear = isset($_GET['year']) ? (int)$_GET['year'] : $defaultYear;
    if ($academicYear < 2500 || $academicYear > 2700) {
        $academicYear = $defaultYear;
    }

    $researchTarget = isset($_GET['research_target']) ? (int)$_GET['research_target'] : 1;
    $researchTarget = max(1, min(10, $researchTarget));
    $gregorianYear = $academicYear - 543;

    $facultyRows = $db->query(
        "SELECT faculty_id, title, first_name_th, last_name_th, profile_picture
         FROM faculty
         WHERE status = 'Active' OR status IS NULL
         ORDER BY first_name_th ASC, last_name_th ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    $faculty = [];
    foreach ($facultyRows as $row) {
        $facultyId = (string)$row['faculty_id'];
        $name = trim(implode(' ', array_filter([
            $row['title'] ?? '',
            $row['first_name_th'] ?? '',
            $row['last_name_th'] ?? '',
        ])));

        $faculty[$facultyId] = [
            'faculty_id' => $facultyId,
            'name' => $name !== '' ? $name : ('อาจารย์ ' . $facultyId),
            'first_name' => (string)($row['first_name_th'] ?? ''),
            'profile_picture' => $row['profile_picture'] ?: null,
            'teaching' => [
                'courses' => 0,
                'clo' => 0,
                'plo' => 0,
                'ylo' => 0,
                'subjects' => [],
            ],
            'research' => [
                'count' => 0,
                'meets_criterion' => false,
                'records' => [],
            ],
            'academic_service' => [],
            'culture' => [],
        ];
    }

    $subjectStmt = $db->query(
        "SELECT m.instructor_id, m.subject_code,
                COALESCE(NULLIF(s.subject_name_th, ''), m.subject_code) AS subject_name
         FROM curriculum_subject_meta m
         LEFT JOIN subject s ON s.subject_code = m.subject_code
         WHERE m.instructor_id IS NOT NULL AND m.instructor_id <> ''
         ORDER BY m.subject_code ASC"
    );

    $subjectSets = [];
    foreach ($subjectStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $facultyId = (string)$row['instructor_id'];
        if (!isset($faculty[$facultyId])) {
            continue;
        }

        $code = (string)$row['subject_code'];
        $subjectSets[$facultyId][$code] = [
            'code' => $code,
            'name' => (string)$row['subject_name'],
            'clo_codes' => [],
            'plo_codes' => [],
            'ylo_codes' => [],
        ];
    }

    $cloStmt = $db->query(
        "SELECT m.instructor_id, m.subject_code, c.clo_code, c.ylo_code
         FROM curriculum_subject_meta m
         INNER JOIN curriculum_clo c
            ON c.framework_id = m.framework_id AND c.subject_code = m.subject_code
         WHERE m.instructor_id IS NOT NULL AND m.instructor_id <> ''"
    );
    foreach ($cloStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $facultyId = (string)$row['instructor_id'];
        $code = (string)$row['subject_code'];
        if (!isset($subjectSets[$facultyId][$code])) {
            continue;
        }
        if (!empty($row['clo_code'])) {
            $subjectSets[$facultyId][$code]['clo_codes'][] = (string)$row['clo_code'];
        }
        if (!empty($row['ylo_code'])) {
            $subjectSets[$facultyId][$code]['ylo_codes'][] = (string)$row['ylo_code'];
        }
    }

    $ploStmt = $db->query(
        "SELECT m.instructor_id, m.subject_code, p.plo_code
         FROM curriculum_subject_meta m
         INNER JOIN curriculum_subject_plo sp ON sp.subject_meta_id = m.id
         INNER JOIN curriculum_plo p ON p.id = sp.plo_id
         WHERE m.instructor_id IS NOT NULL AND m.instructor_id <> ''
         UNION
         SELECT m.instructor_id, m.subject_code, p.plo_code
         FROM curriculum_subject_meta m
         INNER JOIN curriculum_clo c
            ON c.framework_id = m.framework_id AND c.subject_code = m.subject_code
         INNER JOIN curriculum_clo_plo cp ON cp.clo_id = c.id
         INNER JOIN curriculum_plo p ON p.id = cp.plo_id
         WHERE m.instructor_id IS NOT NULL AND m.instructor_id <> ''"
    );
    foreach ($ploStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $facultyId = (string)$row['instructor_id'];
        $code = (string)$row['subject_code'];
        if (isset($subjectSets[$facultyId][$code]) && !empty($row['plo_code'])) {
            $subjectSets[$facultyId][$code]['plo_codes'][] = (string)$row['plo_code'];
        }
    }

    foreach ($subjectSets as $facultyId => $subjects) {
        $allClo = [];
        $allPlo = [];
        $allYlo = [];
        $subjectDetails = [];

        foreach ($subjects as $subject) {
            $cloCodes = array_values(array_unique($subject['clo_codes']));
            $ploCodes = array_values(array_unique($subject['plo_codes']));
            $yloCodes = array_values(array_unique($subject['ylo_codes']));
            $allClo = array_merge($allClo, $cloCodes);
            $allPlo = array_merge($allPlo, $ploCodes);
            $allYlo = array_merge($allYlo, $yloCodes);
            $subjectDetails[] = [
                'code' => $subject['code'],
                'name' => $subject['name'],
                'clo' => count($cloCodes),
                'plo' => count($ploCodes),
                'ylo' => count($yloCodes),
            ];
        }

        $faculty[$facultyId]['teaching'] = [
            'courses' => count($subjectDetails),
            'clo' => uniqueCount($allClo),
            'plo' => uniqueCount($allPlo),
            'ylo' => uniqueCount($allYlo),
            'subjects' => $subjectDetails,
        ];
    }

    $researchStmt = $db->prepare(
        'SELECT research_id, faculty_id, title, publication_year, category
         FROM faculty_research
         WHERE publication_year IN (:academic_year, :gregorian_year)
         ORDER BY publication_year DESC, research_id DESC'
    );
    $researchStmt->execute([
        ':academic_year' => $academicYear,
        ':gregorian_year' => $gregorianYear,
    ]);
    foreach ($researchStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $facultyId = (string)$row['faculty_id'];
        if (!isset($faculty[$facultyId])) {
            continue;
        }
        $faculty[$facultyId]['research']['records'][] = [
            'id' => (string)$row['research_id'],
            'title' => (string)$row['title'],
            'year' => (int)$row['publication_year'],
            'category' => (string)($row['category'] ?? 'ไม่ระบุประเภท'),
        ];
    }

    $reportStmt = $db->prepare(
        'SELECT id, strategy, project_code, project_name, activity_name, row_type,
                parent_item_id, responsible_person
         FROM annual_project_report_items
         WHERE academic_year = :academic_year
         ORDER BY sort_order ASC, id ASC'
    );
    $reportStmt->execute([':academic_year' => $academicYear]);

    foreach ($reportStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $category = classifyWorkloadProject($row);
        $responsible = trim((string)($row['responsible_person'] ?? ''));
        if ($category === null || $responsible === '') {
            continue;
        }

        $record = [
            'id' => (string)$row['id'],
            'project_code' => (string)($row['project_code'] ?? ''),
            'project_name' => (string)$row['project_name'],
            'activity_name' => $row['activity_name'] ?: null,
            'row_type' => (string)$row['row_type'],
            'strategy' => (string)($row['strategy'] ?? ''),
            'responsible_person' => $responsible,
        ];

        foreach ($faculty as $facultyId => $person) {
            if (workloadContains($responsible, (string)$person['first_name'])) {
                $faculty[$facultyId][$category][] = $record;
            }
        }
    }

    $totalCourses = 0;
    $totalClo = 0;
    $totalPlo = 0;
    $totalYlo = 0;
    $teachingFaculty = 0;
    $totalResearch = 0;
    $researchFaculty = 0;
    $meetingTarget = 0;
    $serviceFaculty = 0;
    $cultureFaculty = 0;
    $serviceRecordIds = [];
    $cultureRecordIds = [];
    $serviceProjectNames = [];
    $cultureProjectNames = [];

    foreach ($faculty as &$person) {
        $researchCount = count($person['research']['records']);
        $person['research']['count'] = $researchCount;
        $person['research']['meets_criterion'] = $researchCount >= $researchTarget;

        $person['academic_service'] = summarizeProjectRecords($person['academic_service']);
        $person['culture'] = summarizeProjectRecords($person['culture']);

        $activeDimensions = 0;
        if ($person['teaching']['courses'] > 0) $activeDimensions++;
        if ($researchCount > 0) $activeDimensions++;
        if ($person['academic_service']['items'] > 0) $activeDimensions++;
        if ($person['culture']['items'] > 0) $activeDimensions++;
        $person['active_dimensions'] = $activeDimensions;

        $totalCourses += $person['teaching']['courses'];
        $totalClo += $person['teaching']['clo'];
        $totalPlo += $person['teaching']['plo'];
        $totalYlo += $person['teaching']['ylo'];
        if ($person['teaching']['courses'] > 0) $teachingFaculty++;

        $totalResearch += $researchCount;
        if ($researchCount > 0) $researchFaculty++;
        if ($person['research']['meets_criterion']) $meetingTarget++;
        if ($person['academic_service']['items'] > 0) $serviceFaculty++;
        if ($person['culture']['items'] > 0) $cultureFaculty++;

        foreach ($person['academic_service']['records'] as $record) {
            $serviceRecordIds[$record['id']] = true;
            $serviceProjectNames[$record['project_name']] = true;
        }
        foreach ($person['culture']['records'] as $record) {
            $cultureRecordIds[$record['id']] = true;
            $cultureProjectNames[$record['project_name']] = true;
        }

        unset($person['first_name']);
    }
    unset($person);

    $totalFaculty = count($faculty);
    $researchRatio = $totalFaculty > 0 ? round($totalResearch / $totalFaculty, 2) : 0;

    echo json_encode([
        'status' => 'success',
        'data' => [
            'academic_year' => $academicYear,
            'available_years' => $years,
            'research_target_per_faculty' => $researchTarget,
            'summary' => [
                'total_faculty' => $totalFaculty,
                'teaching' => [
                    'faculty' => $teachingFaculty,
                    'courses' => $totalCourses,
                    'clo' => $totalClo,
                    'plo' => $totalPlo,
                    'ylo' => $totalYlo,
                ],
                'research' => [
                    'outputs' => $totalResearch,
                    'faculty' => $researchFaculty,
                    'ratio' => $researchRatio,
                    'meeting_target' => $meetingTarget,
                    'below_target' => max(0, $totalFaculty - $meetingTarget),
                ],
                'academic_service' => [
                    'projects' => count($serviceProjectNames),
                    'items' => count($serviceRecordIds),
                    'faculty' => $serviceFaculty,
                ],
                'culture' => [
                    'projects' => count($cultureProjectNames),
                    'items' => count($cultureRecordIds),
                    'faculty' => $cultureFaculty,
                ],
            ],
            'faculty' => array_values($faculty),
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    error_log('[FacultyWorkloadDashboard] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => defined('APP_DEBUG') && APP_DEBUG ? $e->getMessage() : 'ไม่สามารถโหลดข้อมูลภาระงานได้',
    ], JSON_UNESCAPED_UNICODE);
}
