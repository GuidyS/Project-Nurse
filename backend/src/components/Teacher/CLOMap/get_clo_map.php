<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/clo_mapping_helpers.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $sql_subjects = "SELECT subject_code as code, subject_name_th as name FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt_subjects = $pdo->prepare($sql_subjects);
    $stmt_subjects->execute();
    $courses = $stmt_subjects->fetchAll(PDO::FETCH_ASSOC);

    $frameworkId = getActiveFrameworkId($pdo);
    $plos = [];
    $cloMap = [];

    if ($frameworkId && curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
        $plos = listPloCodes($pdo, $frameworkId);
        $coursePlos = getCoursePloMap($pdo, $frameworkId);
        $allClos = listAllClosDetailed($pdo, $frameworkId);
        $closBySubject = [];
        foreach ($allClos as $clo) {
            $closBySubject[(string)$clo['subject_code']][] = cloRowToApiArray($clo);
        }
        foreach ($courses as $course) {
            $code = $course['code'];
            $subjectData = [
                'course_plos' => $coursePlos[$code] ?? [],
                'clos' => $closBySubject[$code] ?? [],
            ];
            $cloMap[$code] = mergeCourseMappedPlos($subjectData);
        }
    } else {
        $data = loadActiveMappingData($pdo);
        if (isset($data['plos']) && is_array($data['plos'])) {
            foreach ($data['plos'] as $plo) {
                $plos[] = $plo['plo_id'] ?? $plo['id'];
            }
        }
        if (isset($data['subject_mappings'])) {
            foreach ($courses as $course) {
                $code = $course['code'];
                $subjectData = $data['subject_mappings'][$code] ?? [];
                $cloMap[$code] = mergeCourseMappedPlos($subjectData);
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "courses" => $courses,
            "plos" => $plos,
            "cloMap" => empty($cloMap) ? new stdClass() : $cloMap,
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
