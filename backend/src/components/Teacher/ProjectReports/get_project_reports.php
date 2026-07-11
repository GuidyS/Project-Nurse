<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $requestedProjectId = isset($_GET['project_id']) ? $_GET['project_id'] : null;

    // ดึงชื่อโครงการจากตาราง project (ไม่มี s)
    $stmtProjects = $pdo->query("SELECT project_id AS id, project_name_th AS name FROM project ORDER BY project_id ASC");
    $projects = $stmtProjects->fetchAll(PDO::FETCH_ASSOC);

    if (!$requestedProjectId && count($projects) > 0) {
        $requestedProjectId = $projects[0]['id'];
    }

    $stats = ["totalBudget" => 0, "totalSpent" => 0, "remaining" => 0, "progress" => 0];
    $budgetData = [];
    $progressData = [];

    if ($requestedProjectId) {
        // งบประมาณจริงจากตาราง project_budget_years (รายปี) / ความคืบหน้าจาก mapping_json.meta
        $stmt = $pdo->prepare("SELECT fiscal_year, IFNULL(budget_allocated,0) AS allocated, IFNULL(budget_spent,0) AS spent
                               FROM project_budget_years WHERE project_id = :id ORDER BY fiscal_year ASC");
        $stmt->execute([':id' => $requestedProjectId]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $b) {
            $stats['totalBudget'] += (float)$b['allocated'];
            $stats['totalSpent']  += (float)$b['spent'];
            $budgetData[] = [
                "name"   => "ปี " . $b['fiscal_year'],
                "budget" => (float)$b['allocated'],
                "spent"  => (float)$b['spent'],
            ];
        }
        $stats['remaining'] = $stats['totalBudget'] - $stats['totalSpent'];

        $pm = $pdo->prepare("SELECT mapping_json FROM project WHERE project_id = :id");
        $pm->execute([':id' => $requestedProjectId]);
        $m = json_decode($pm->fetchColumn() ?: '{}', true) ?: [];
        $meta = $m['meta'] ?? [];
        $stats['progress'] = (int)($meta['progress'] ?? 0);
        $progressData = $meta['progress_chart'] ?? [];
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects"         => $projects,
            "selectedProjectId"=> $requestedProjectId,
            "stats"            => $stats,
            "budgetData"       => $budgetData,
            "progressData"     => $progressData
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>