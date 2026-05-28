<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $requestedProjectId = isset($_GET['project_id']) ? $_GET['project_id'] : null;

    // ดึงชื่อโครงการจากตาราง project (ไม่มี s)
    $stmtProjects = $pdo->query("SELECT project_id AS id, project_name AS name FROM project ORDER BY project_id ASC");
    $projects = $stmtProjects->fetchAll(PDO::FETCH_ASSOC);

    if (!$requestedProjectId && count($projects) > 0) {
        $requestedProjectId = $projects[0]['id'];
    }

    $stats = ["totalBudget" => 0, "totalSpent" => 0, "remaining" => 0, "progress" => 0];
    $budgetData = [];
    $progressData = [];

    if ($requestedProjectId) {
        // ดึงข้อมูล JSON กราฟจากตาราง project
        $stmt = $pdo->prepare("SELECT total_budget, total_spent, overall_progress, budget_chart_json, progress_chart_json FROM project WHERE project_id = :id");
        $stmt->execute([':id' => $requestedProjectId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($project) {
            $stats['totalBudget'] = (float)$project['total_budget'];
            $stats['totalSpent']  = (float)$project['total_spent'];
            $stats['remaining']   = $stats['totalBudget'] - $stats['totalSpent'];
            $stats['progress']    = (int)$project['overall_progress'];

            // แกะ JSON ออกมาเป็น Array ให้ React ใช้ได้ทันที
            $budgetData = $project['budget_chart_json'] ? json_decode($project['budget_chart_json'], true) : [];
            $progressData = $project['progress_chart_json'] ? json_decode($project['progress_chart_json'], true) : [];
        }
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