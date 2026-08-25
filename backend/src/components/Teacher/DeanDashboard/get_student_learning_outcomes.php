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
        echo json_encode(['status' => 'error', 'message' => 'ไม่มีสิทธิ์เข้าถึงผลลัพธ์การเรียนรู้ระดับคณะ'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $years = array_map('intval', $db->query(
        'SELECT DISTINCT academic_year FROM enrollment
         WHERE academic_year IS NOT NULL ORDER BY academic_year DESC'
    )->fetchAll(PDO::FETCH_COLUMN));
    $defaultYear = $years[0] ?? ((int)date('Y') + 543);
    $academicYear = isset($_GET['year']) ? (int)$_GET['year'] : $defaultYear;
    if (!in_array($academicYear, $years, true) && !empty($years)) {
        $academicYear = $defaultYear;
    }

    $studentStmt = $db->prepare(
        "SELECT s.student_id, s.student_code, s.title, s.first_name_th, s.last_name_th,
                s.year_level, s.status, COUNT(DISTINCT e.subject_id) AS enrolled_courses
         FROM enrollment e
         INNER JOIN student s ON s.student_id = e.student_id
         WHERE e.academic_year = :academic_year
           AND e.status = 'Active'
         GROUP BY s.student_id, s.student_code, s.title, s.first_name_th, s.last_name_th,
                  s.year_level, s.status
         ORDER BY s.student_id ASC"
    );
    $studentStmt->execute([':academic_year' => $academicYear]);
    $studentRows = $studentStmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($studentRows as $row) {
        $studentId = (string)$row['student_id'];
        $students[$studentId] = [
            'student_id' => $studentId,
            'student_code' => (string)($row['student_code'] ?? $studentId),
            'name' => trim(implode(' ', array_filter([
                $row['title'] ?? '',
                $row['first_name_th'] ?? '',
                $row['last_name_th'] ?? '',
            ]))),
            'year_level' => (int)($row['year_level'] ?? 0),
            'student_status' => (string)$row['status'],
            'enrolled_courses' => (int)$row['enrolled_courses'],
            'ylo' => ['assessed' => 0, 'passed' => 0, 'rate' => 0, 'codes' => []],
            'plo' => ['assessed' => 0, 'passed' => 0, 'rate' => 0, 'codes' => []],
            'clo' => ['defined' => 0, 'assessed' => 0, 'passed' => 0, 'rate' => 0],
            'outcome_status' => 'pending',
        ];
    }

    if (!empty($students)) {
        $studentIds = array_keys($students);
        $placeholders = implode(',', array_fill(0, count($studentIds), '?'));

        $cloStmt = $db->prepare(
            "SELECT e.student_id, COUNT(DISTINCT c.id) AS defined_clo
             FROM enrollment e
             INNER JOIN subject s ON s.subject_id = e.subject_id
             INNER JOIN curriculum_clo c ON c.subject_code = s.subject_code
             WHERE e.academic_year = ? AND e.status = 'Active'
               AND e.student_id IN ($placeholders)
             GROUP BY e.student_id"
        );
        $cloStmt->execute(array_merge([$academicYear], $studentIds));
        $definedClo = [];
        foreach ($cloStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $definedClo[(string)$row['student_id']] = (int)$row['defined_clo'];
        }

        $cloResultStmt = $db->prepare(
            "SELECT r.student_id, r.subject_id, r.clo_id, r.semester,
                    r.score_percent, r.pass_status, c.clo_code, c.framework_id,
                    s.subject_code, p.plo_code, cp.weight AS plo_weight
             FROM student_clo_results r
             INNER JOIN curriculum_clo c ON c.id = r.clo_id
             INNER JOIN subject s ON s.subject_id = r.subject_id
             LEFT JOIN curriculum_clo_plo cp ON cp.clo_id = c.id
             LEFT JOIN curriculum_plo p ON p.id = cp.plo_id
             WHERE r.academic_year = ?
               AND r.student_id IN ($placeholders)"
        );
        $cloResultStmt->execute(array_merge([$academicYear], $studentIds));

        $cloResultSets = [];
        $passedCloResultSets = [];
        $cloCodeSets = [];
        $cloItems = [];
        $ploScoreAggregates = [];
        foreach ($cloResultStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $studentId = (string)$row['student_id'];
            if (!isset($students[$studentId])) continue;

            $isAssessed = $row['score_percent'] !== null || $row['pass_status'] !== null;
            if (!$isAssessed) continue;

            $resultKey = implode(':', [
                (string)$row['subject_id'],
                (string)$row['clo_id'],
                (string)$row['semester'],
            ]);
            $cloResultSets[$studentId][$resultKey] = true;

            $isPassed = $row['pass_status'] !== null
                ? (int)$row['pass_status'] === 1
                : (float)$row['score_percent'] >= 70;
            if ($isPassed) {
                $passedCloResultSets[$studentId][$resultKey] = true;
            }

            $cloCode = trim((string)($row['clo_code'] ?? ''));
            if ($cloCode !== '') {
                $cloCodeSets[$studentId][$cloCode] = true;
            }
            $cloItems[$studentId][$resultKey] = [
                'code' => $cloCode,
                'subject_code' => (string)$row['subject_code'],
                'score' => $row['score_percent'] !== null ? (float)$row['score_percent'] : null,
                'passed' => $isPassed,
            ];

            $ploCode = trim((string)($row['plo_code'] ?? ''));
            $ploWeight = (float)($row['plo_weight'] ?? 0);
            if ($row['score_percent'] !== null && $ploCode !== '' && $ploWeight > 0) {
                $frameworkId = (string)$row['framework_id'];
                if (!isset($ploScoreAggregates[$studentId][$frameworkId][$ploCode])) {
                    $ploScoreAggregates[$studentId][$frameworkId][$ploCode] = [
                        'weighted_score' => 0.0,
                        'weight' => 0.0,
                    ];
                }
                $ploScoreAggregates[$studentId][$frameworkId][$ploCode]['weighted_score'] +=
                    (float)$row['score_percent'] * $ploWeight;
                $ploScoreAggregates[$studentId][$frameworkId][$ploCode]['weight'] += $ploWeight;
            }
        }

        $yloMapStmt = $db->query(
            "SELECT y.framework_id, y.ylo_code, p.plo_code
             FROM curriculum_ylo_plo y
             INNER JOIN curriculum_plo p ON p.id = y.plo_id
             WHERE y.is_active = 1"
        );
        $yloPloMap = [];
        foreach ($yloMapStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $yloPloMap[(string)$row['framework_id']][(string)$row['ylo_code']][] =
                (string)$row['plo_code'];
        }

        foreach ($students as $studentId => &$student) {
            $ploScoresByFramework = [];
            $ploScoresByCode = [];
            foreach ($ploScoreAggregates[$studentId] ?? [] as $frameworkId => $frameworkPlos) {
                foreach ($frameworkPlos as $ploCode => $aggregate) {
                    if ($aggregate['weight'] <= 0) continue;

                    $score = round($aggregate['weighted_score'] / $aggregate['weight'], 2);
                    $ploScoresByFramework[$frameworkId][$ploCode] = $score;
                    $ploScoresByCode[$ploCode][] = $score;
                }
            }

            $ploScores = [];
            foreach ($ploScoresByCode as $ploCode => $scores) {
                $ploScores[$ploCode] = round(array_sum($scores) / count($scores), 2);
            }
            uksort($ploScores, 'strnatcmp');
            $ploCodes = array_keys($ploScores);
            $passedPloCodes = array_keys(array_filter($ploScores, fn($score) => $score >= 70));
            $ploItems = [];
            foreach ($ploScores as $ploCode => $score) {
                $ploItems[] = [
                    'code' => $ploCode,
                    'score' => $score,
                    'passed' => $score >= 70,
                ];
            }

            $yloScoresByCode = [];
            foreach ($ploScoresByFramework as $frameworkId => $frameworkPloScores) {
                foreach ($yloPloMap[$frameworkId] ?? [] as $yloCode => $linkedPloCodes) {
                    $linkedScores = [];
                    foreach ($linkedPloCodes as $ploCode) {
                        if (isset($frameworkPloScores[$ploCode])) {
                            $linkedScores[] = $frameworkPloScores[$ploCode];
                        }
                    }
                    if (!empty($linkedScores)) {
                        $yloScoresByCode[$yloCode][] = array_sum($linkedScores) / count($linkedScores);
                    }
                }
            }

            $yloScores = [];
            foreach ($yloScoresByCode as $yloCode => $scores) {
                $yloScores[$yloCode] = round(array_sum($scores) / count($scores), 2);
            }
            uksort($yloScores, 'strnatcmp');
            $yloCodes = array_keys($yloScores);
            $passedYloCodes = array_keys(array_filter($yloScores, fn($score) => $score >= 70));
            $yloItems = [];
            foreach ($yloScores as $yloCode => $score) {
                $yloItems[] = [
                    'code' => $yloCode,
                    'score' => $score,
                    'passed' => $score >= 70,
                ];
            }

            $student['ylo'] = [
                'assessed' => count($yloCodes),
                'passed' => count($passedYloCodes),
                'rate' => count($yloCodes) > 0 ? round(count($passedYloCodes) / count($yloCodes) * 100, 1) : 0,
                'codes' => $yloCodes,
                'scores' => $yloScores,
                'items' => $yloItems,
            ];
            $student['plo'] = [
                'assessed' => count($ploCodes),
                'passed' => count($passedPloCodes),
                'rate' => count($ploCodes) > 0 ? round(count($passedPloCodes) / count($ploCodes) * 100, 1) : 0,
                'codes' => $ploCodes,
                'scores' => $ploScores,
                'items' => $ploItems,
            ];
            $student['clo']['defined'] = $definedClo[$studentId] ?? 0;

            $assessedCloResults = array_keys($cloResultSets[$studentId] ?? []);
            $passedCloResults = array_keys($passedCloResultSets[$studentId] ?? []);
            $student['clo']['assessed'] = count($assessedCloResults);
            $student['clo']['passed'] = count($passedCloResults);
            $student['clo']['rate'] = count($assessedCloResults) > 0
                ? round(count($passedCloResults) / count($assessedCloResults) * 100, 1)
                : 0;
            $student['clo']['codes'] = array_keys($cloCodeSets[$studentId] ?? []);
            $student['clo']['items'] = array_values($cloItems[$studentId] ?? []);

            $assessedOutcomes = array_filter(
                [$student['ylo'], $student['plo'], $student['clo']],
                fn($outcome) => $outcome['assessed'] > 0
            );
            if (empty($assessedOutcomes)) {
                $student['outcome_status'] = 'pending';
            } elseif (count(array_filter($assessedOutcomes, fn($outcome) => $outcome['rate'] >= 70)) === count($assessedOutcomes)) {
                $student['outcome_status'] = 'passed';
            } else {
                $student['outcome_status'] = 'at_risk';
            }
        }
        unset($student);
    }

    $studentList = array_values($students);
    $courseStmt = $db->prepare(
        "SELECT COUNT(DISTINCT subject_id) FROM enrollment
         WHERE academic_year = :academic_year AND status = 'Active'"
    );
    $courseStmt->execute([':academic_year' => $academicYear]);
    $totalCourses = (int)$courseStmt->fetchColumn();

    $studentsAssessed = count(array_filter($studentList, fn($student) => $student['outcome_status'] !== 'pending'));
    $studentsPassed = count(array_filter($studentList, fn($student) => $student['outcome_status'] === 'passed'));
    $totalYloAssessed = array_sum(array_column(array_column($studentList, 'ylo'), 'assessed'));
    $totalPloAssessed = array_sum(array_column(array_column($studentList, 'plo'), 'assessed'));
    $totalCloAssessed = array_sum(array_column(array_column($studentList, 'clo'), 'assessed'));
    $totalCloDefined = array_sum(array_column(array_column($studentList, 'clo'), 'defined'));

    echo json_encode([
        'status' => 'success',
        'data' => [
            'academic_year' => $academicYear,
            'available_years' => $years,
            'summary' => [
                'students' => count($studentList),
                'courses' => $totalCourses,
                'students_assessed' => $studentsAssessed,
                'students_passed' => $studentsPassed,
                'ylo_assessed' => $totalYloAssessed,
                'plo_assessed' => $totalPloAssessed,
                'clo_assessed' => $totalCloAssessed,
                'clo_defined' => $totalCloDefined,
            ],
            'students' => $studentList,
            'meta' => [
                'assessment_scope' => 'academic_year',
                'clo_scores_persisted' => true,
                'plo_ylo_derived_from_clo' => true,
            ],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    error_log('[StudentLearningOutcomes] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => defined('APP_DEBUG') && APP_DEBUG ? $e->getMessage() : 'ไม่สามารถโหลดผลลัพธ์การเรียนรู้ของนักศึกษาได้',
    ], JSON_UNESCAPED_UNICODE);
}
