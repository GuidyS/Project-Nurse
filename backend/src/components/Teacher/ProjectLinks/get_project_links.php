<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // เปลี่ยนมาดึงจากตาราง project (ไม่มี s)
    $stmt = $pdo->query("SELECT project_id AS id, project_name AS name FROM project ORDER BY project_id ASC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtPlo = $pdo->query("SELECT plo_name FROM plo ORDER BY plo_id ASC");
    $plos = $stmtPlo->fetchAll(PDO::FETCH_COLUMN);

    $stmtYlo = $pdo->query("SELECT ylo_id FROM ylo ORDER BY ylo_id ASC");
    $ylos = array_map(fn($id) => "YLO" . $id, $stmtYlo->fetchAll(PDO::FETCH_COLUMN));

    $clos = ['CLO1', 'CLO2', 'CLO3', 'CLO4']; 

    $stmtLinks = $pdo->query("SELECT project_id, outcome_type, outcome_code FROM project_outcome_links");
    $rawLinks = $stmtLinks->fetchAll(PDO::FETCH_ASSOC);

    $matrix = [];
    foreach ($projects as $p) {
        $matrix[$p['id']] = ['plos' => [], 'ylos' => [], 'clos' => []];
    }

    foreach ($rawLinks as $link) {
        $pid = $link['project_id'];
        $type = $link['outcome_type'] . 's'; 
        if (isset($matrix[$pid])) {
            $matrix[$pid][$type][] = $link['outcome_code'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "plos" => !empty($plos) ? $plos : ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'],
            "ylos" => !empty($ylos) ? $ylos : ['YLO1', 'YLO2', 'YLO3', 'YLO4'],
            "clos" => $clos,
            "links" => empty($matrix) ? new stdClass() : $matrix
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>