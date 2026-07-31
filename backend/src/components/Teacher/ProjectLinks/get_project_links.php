<?php
if (session_status() === PHP_SESSION_NONE) session_start();

// ค้นหาไฟล์ config อัตโนมัติ
$possible_paths = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/../config/config.php',
    __DIR__ . '/../../../config/config.php',
    __DIR__ . '/../../../../config/config.php'
];
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();

    $stmt = $db->query("
        SELECT
            project_id AS id,
            COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS name
        FROM project
        ORDER BY project_id ASC
    ");
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = [];
    $matrix = [];

    foreach ($projects_raw as $row) {
        $pid = $row['id'];
        $projects[] = ['id' => $pid, 'name' => $row['name']];

        $matrix[$pid] = ['plos' => [], 'ylos' => [], 'clos' => []];
    }

    $linkStmt = $db->query("SELECT project_id, outcome_type, outcome_code FROM project_outcome_links ORDER BY project_id, outcome_type, outcome_code");
    foreach ($linkStmt->fetchAll(PDO::FETCH_ASSOC) as $link) {
        $projectId = $link['project_id'];
        if (!isset($matrix[$projectId])) {
            $matrix[$projectId] = ['plos' => [], 'ylos' => [], 'clos' => []];
        }

        $key = $link['outcome_type'] . 's';
        if (isset($matrix[$projectId][$key])) {
            $matrix[$projectId][$key][] = $link['outcome_code'];
        }
    }

    $plos = [];
    $ylosByCode = [];
    $closByCode = [];

    $mappingData = loadActiveMappingData($db);
    // Keep legacy clos list from raw JSON backup (subject catalog for project links)
    $fwRow = getActiveFrameworkRow($db);
    if ($fwRow && !empty($fwRow['mapping_json'])) {
        $rawJson = json_decode($fwRow['mapping_json'], true);
        if (is_array($rawJson) && !empty($rawJson['clos'])) {
            $mappingData['clos'] = $rawJson['clos'];
        }
    }

    foreach (($mappingData['plos'] ?? []) as $plo) {
        $code = $plo['plo_id'] ?? null;
        if ($code) {
            $plos[] = [
                'code' => $code,
                'description' => $plo['plo_name'] ?? $code
            ];
        }

        foreach (($plo['ylo_descriptions'] ?? []) as $yearKey => $description) {
            $code = strtoupper(str_replace('YEAR_', 'YLO', strtoupper($yearKey)));
            $ylosByCode[$code] = [
                'code' => $code,
                'description' => $code . ': ' . $description
            ];
        }
    }

    foreach (($mappingData['clos'] ?? []) as $clo) {
        $code = $clo['subject_code'] ?? null;
        if ($code) {
            $closByCode[$code] = [
                'code' => $code,
                'description' => $code . ': ' . ($clo['subject_name'] ?? $code)
            ];
        }
    }

    $ylos = array_values($ylosByCode);
    $clos = array_values($closByCode);

    $ploCodes = array_column($plos, 'code');
    $yloCodes = array_column($ylos, 'code');
    $cloCodes = array_column($clos, 'code');

    foreach ($matrix as $projectLinks) {
        foreach ($projectLinks['plos'] as $code) {
            if (!in_array($code, $ploCodes, true)) {
                $plos[] = ['code' => $code, 'description' => $code . ' (legacy mapping)'];
                $ploCodes[] = $code;
            }
        }
        foreach ($projectLinks['ylos'] as $code) {
            if (!in_array($code, $yloCodes, true)) {
                $ylos[] = ['code' => $code, 'description' => $code . ' (legacy mapping)'];
                $yloCodes[] = $code;
            }
        }
        foreach ($projectLinks['clos'] as $code) {
            if (!in_array($code, $cloCodes, true)) {
                $clos[] = ['code' => $code, 'description' => $code . ' (legacy mapping)'];
                $cloCodes[] = $code;
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "plos" => $plos,
            "ylos" => $ylos,
            "clos" => $clos,
            "links" => empty($matrix) ? new stdClass() : $matrix
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>