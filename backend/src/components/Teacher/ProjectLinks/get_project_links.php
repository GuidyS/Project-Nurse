<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$db = project_db();
project_require_auth($db, ['PROJECT_LINKS_MANAGE']);

try {
    $requestedProjectId = project_request_int('project_id');
    if (isset($_GET['project_id']) && $_GET['project_id'] !== '' && $requestedProjectId === null) {
        project_json(["status" => "error", "message" => "รหัสโครงการไม่ถูกต้อง"], 400);
        exit;
    }

    $stmt = $db->query("
        SELECT
            project_id AS id,
            COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS name
        FROM project
        ORDER BY project_id ASC
    ");
    $projectsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = [];
    $matrix = [];
    $projectIds = [];
    foreach ($projectsRaw as $row) {
        $pid = (int) $row['id'];
        $projects[] = ['id' => $pid, 'name' => $row['name']];
        $matrix[$pid] = ['plos' => [], 'ylos' => [], 'clos' => []];
        $projectIds[] = $pid;
    }

    if ($requestedProjectId !== null && !in_array($requestedProjectId, $projectIds, true)) {
        project_json(["status" => "error", "message" => "ไม่พบโครงการที่เลือก"], 404);
        exit;
    }

    $linkStmt = $db->query("
        SELECT project_id, outcome_type, outcome_code
        FROM project_outcome_links
        ORDER BY project_id, outcome_type, outcome_code
    ");
    foreach ($linkStmt->fetchAll(PDO::FETCH_ASSOC) as $link) {
        $projectId = (int) $link['project_id'];
        if (!isset($matrix[$projectId])) {
            continue;
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

    foreach (($mappingData['plos'] ?? []) as $plo) {
        $code = $plo['plo_id'] ?? null;
        if ($code) {
            $plos[] = ['code' => $code, 'description' => $plo['plo_name'] ?? $code];
        }

        foreach (($plo['ylo_descriptions'] ?? []) as $yearKey => $description) {
            $code = strtoupper(str_replace('YEAR_', 'YLO', strtoupper($yearKey)));
            $ylosByCode[$code] = ['code' => $code, 'description' => $code . ': ' . $description];
        }
    }

    foreach (($mappingData['clos'] ?? []) as $clo) {
        $code = $clo['subject_code'] ?? null;
        if ($code) {
            $closByCode[$code] = ['code' => $code, 'description' => $code . ': ' . ($clo['subject_name'] ?? $code)];
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

    project_json([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "plos" => $plos,
            "ylos" => $ylos,
            "clos" => $clos,
            "links" => empty($matrix) ? new stdClass() : $matrix,
            "selectedProjectId" => $requestedProjectId,
            "source" => "project_outcome_links",
            "schema_version" => "2026-08-11.db-completeness-v1",
        ],
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
