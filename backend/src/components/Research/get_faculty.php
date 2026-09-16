<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

requireRole([1, 2, 5]);

try {
    $db = new Connect();
    $stmt = $db->query("
        SELECT
            faculty_id,
            CONCAT_WS(' ', NULLIF(title, ''), NULLIF(first_name_th, ''), NULLIF(last_name_th, '')) AS name
        FROM faculty
        WHERE status = 'Active' OR status IS NULL
        ORDER BY first_name_th ASC
    ");
    $options = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $options], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
