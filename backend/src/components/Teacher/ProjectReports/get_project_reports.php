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
        // ตาราง project ปัจจุบันยังไม่มีคอลัมน์งบประมาณ/ความคืบหน้า — อ่านจาก mapping_json ถ้ามี ไม่งั้นคืน 0
        $stmt = $pdo->prepare("SELECT mapping_json FROM project WHERE project_id = :id");
        $stmt->execute([':id' => $requestedProjectId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($project && !empty($project['mapping_json'])) {
            $m = json_decode($project['mapping_json'], true) ?: [];
            $stats['totalBudget'] = (float)($m['total_budget'] ?? 0);
            $stats['totalSpent']  = (float)($m['total_spent'] ?? 0);
            $stats['remaining']   = $stats['totalBudget'] - $stats['totalSpent'];
            $stats['progress']    = (int)($m['overall_progress'] ?? 0);
            $budgetData   = $m['budget_chart'] ?? [];
            $progressData = $m['progress_chart'] ?? [];
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