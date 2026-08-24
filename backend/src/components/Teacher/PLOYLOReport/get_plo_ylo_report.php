<?php
// รายงาน PLO/YLO — อ่านจากตาราง curriculum_report_stats (target vs achieved)
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $rows = $pdo->query("SELECT type, code_name, description, target_score, achieved_score, updated_at
                         FROM curriculum_report_stats
                         ORDER BY type, code_name")->fetchAll(PDO::FETCH_ASSOC);

    $plos = []; $ylos = [];
    foreach ($rows as $r) {
        $item = [
            "name"        => $r['code_name'],
            "description" => $r['description'],
            "target"      => (float)$r['target_score'],
            "achieved"    => (float)$r['achieved_score'],
        ];
        if ($r['type'] === 'PLO') $plos[] = $item; else $ylos[] = $item;
    }

    echo json_encode(["status" => "success", "data" => ["plos" => $plos, "ylos" => $ylos]], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}