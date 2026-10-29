<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
project_require_auth($db, ['PROJECT_REPORTS_VIEW']);

try {
    $requestedProjectId = project_request_int('project_id');
    if (isset($_GET['project_id']) && $_GET['project_id'] !== '' && $requestedProjectId === null) {
        project_json(["status" => "error", "message" => "รหัสโครงการไม่ถูกต้อง"], 400);
        exit;
    }

    $stmt = $db->query("
        SELECT
            project_id AS id,
            COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS name,
            COALESCE(project_type, 'other') AS project_type,
            description, responsible_faculty_id, academic_year, start_date, end_date, status
        FROM project
        ORDER BY project_id DESC
    ");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($projects)) {
        project_json([
            "status" => "success",
            "data" => [
                "projects" => [],
                "selectedProjectId" => null,
                "stats" => ["totalBudget" => 0, "totalSpent" => 0, "remaining" => 0],
                "budgetData" => [],
                "source" => "project_budget_years",
                "schema_version" => "2026-08-11.db-completeness-v1",
            ],
        ]);
        exit;
    }

    $validProjectIds = array_map(fn($project) => (int) $project['id'], $projects);
    if ($requestedProjectId !== null && !in_array($requestedProjectId, $validProjectIds, true)) {
        project_json(["status" => "error", "message" => "ไม่พบโครงการที่เลือก"], 404);
        exit;
    }

    $selectedProjectId = $requestedProjectId ?? (int) $projects[0]['id'];

    $budgetStmt = $db->prepare("
        SELECT
            COALESCE(fiscal_year, 0) AS fiscal_year,
            COALESCE(budget_allocated, 0) AS budget,
            COALESCE(budget_spent, 0) AS spent
        FROM project_budget_years
        WHERE project_id = :project_id
        ORDER BY fiscal_year ASC, project_budget_years_id ASC
    ");
    $budgetStmt->execute([':project_id' => $selectedProjectId]);
    $budgetRows = $budgetStmt->fetchAll(PDO::FETCH_ASSOC);

    $budgetData = array_map(function (array $row): array {
        return [
            "month" => $row['fiscal_year'] ? (string) $row['fiscal_year'] : "-",
            "budget" => (float) $row['budget'],
            "spent" => (float) $row['spent'],
        ];
    }, $budgetRows);

    $totalBudget = array_reduce($budgetData, fn($sum, $row) => $sum + $row['budget'], 0);
    $totalSpent = array_reduce($budgetData, fn($sum, $row) => $sum + $row['spent'], 0);

    project_json([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "selectedProjectId" => $selectedProjectId,
            "stats" => [
                "totalBudget" => $totalBudget,
                "totalSpent" => $totalSpent,
                "remaining" => $totalBudget - $totalSpent,
            ],
            "budgetData" => $budgetData,
            "source" => "project_budget_years",
            "schema_version" => "2026-08-11.db-completeness-v1",
        ],
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => "เกิดข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()], 500);
}
?>
