<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$subject_code = $_GET['subject_code'] ?? $_GET['subject-code'] ?? null;

function normalizeCloForManagement(array $clo, int $fallbackIndex = 0): array
{
    $ploWeights = [];
    if (!empty($clo['plo_weights']) && is_array($clo['plo_weights'])) {
        foreach ($clo['plo_weights'] as $ploId => $weight) {
            if (is_string($ploId) && $ploId !== '') {
                $ploWeights[$ploId] = (int)$weight;
            }
        }
    }

    $mappedPlos = [];
    if (!empty($clo['mapped_plos']) && is_array($clo['mapped_plos'])) {
        $mappedPlos = array_values(array_filter($clo['mapped_plos'], 'is_string'));
    }

    $legacyPlo = trim((string)($clo['plo'] ?? ''));
    if ($legacyPlo !== '' && !isset($ploWeights[$legacyPlo])) {
        $ploWeights[$legacyPlo] = (int)($clo['weight'] ?? 0);
    }

    $id = $clo['clo_id'] ?? $clo['id'] ?? ($fallbackIndex + 1);

    return [
        'id' => (string)$id,
        'code' => $clo['clo_code'] ?? $clo['code'] ?? '',
        'description' => $clo['description'] ?? ($clo['clo_description'] ?? ''),
        'mapped_plos' => $mappedPlos,
        'plo_weights' => $ploWeights,
        'weight' => array_sum($ploWeights),
        'status' => $clo['status'] ?? 'active',
    ];
}

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    if (!$subject_code) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสวิชา"]);
        exit();
    }

    $frameworkId = getActiveFrameworkId($pdo);
    if (!$frameworkId) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่ใช้งานอยู่"]);
        exit();
    }

    if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
        $rawClos = listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code);
        $coursePlosMap = getCoursePloMap($pdo, $frameworkId);
        $coursePlos = array_values($coursePlosMap[(string)$subject_code] ?? []);
        $plos = [];
        foreach (getPloCatalogFromTables($pdo, $frameworkId) as $plo) {
            $plos[] = [
                'id' => $plo['id'],
                'name' => $plo['id'] . ' - ' . mb_substr($plo['name'], 0, 50) . '...',
            ];
        }
        $clos = [];
        foreach ($rawClos as $index => $clo) {
            $clos[] = normalizeCloForManagement($clo, $index);
        }
        echo json_encode([
            'status' => 'success',
            'data' => [
                'clos' => $clos,
                'plos' => $plos,
                'course_plos' => $coursePlos,
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $data = loadActiveMappingData($pdo);
    $rawClos = $data['subject_mappings'][$subject_code]['clos'] ?? [];
    if (empty($rawClos) && !empty($data['course_clos'][$subject_code])) {
        $rawClos = $data['course_clos'][$subject_code];
    }

    $coursePlos = $data['subject_mappings'][$subject_code]['course_plos'] ?? [];
    if (!is_array($coursePlos)) {
        $coursePlos = [];
    }
    $coursePlos = array_values(array_unique(array_filter($coursePlos, 'is_string')));

    $clos = [];
    foreach ($rawClos as $index => $clo) {
        if (!is_array($clo)) {
            continue;
        }
        $clos[] = normalizeCloForManagement($clo, $index);
    }

    $plos = [];
    if (isset($data['plos']) && is_array($data['plos'])) {
        foreach ($data['plos'] as $plo) {
            $ploId = $plo['plo_id'] ?? $plo['id'] ?? '';
            $ploName = $plo['plo_name'] ?? $plo['name'] ?? '';
            $plos[] = [
                'id' => $ploId,
                'name' => $ploId . ' - ' . mb_substr($ploName, 0, 50) . '...',
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'clos' => $clos,
            'plos' => $plos,
            'course_plos' => $coursePlos,
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
