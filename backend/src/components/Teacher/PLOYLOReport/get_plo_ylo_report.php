<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();

    $stmt = $db->query("SELECT type, code_name AS name, target_score AS target, achieved_score AS achieved, description FROM curriculum_report_stats ORDER BY code_name ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $ploData = [];
    $yloData = [];

    foreach ($rows as $row) {
        $item = [
            'name' => $row['name'],
            'target' => (float)$row['target'],
            'achieved' => (float)$row['achieved'],
            'description' => $row['description'],
        ];

        if ($row['type'] === 'PLO') {
            $ploData[] = $item;
        } else {
            $yloData[] = $item;
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "ploData" => $ploData,
            "yloData" => $yloData,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
