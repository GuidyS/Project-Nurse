<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

// Only Admin (1) can delete research
requireRole([1]);

try {
    $db = new Connect();
    $input = json_decode(file_get_contents("php://input"), true);
    
    $research_id = $input['research_id'] ?? null;

    if (empty($research_id)) {
        throw new Exception("Research ID is required");
    }

    $sql = "DELETE FROM faculty_research WHERE research_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $research_id]);
    
    echo json_encode(["status" => "success", "message" => "Research deleted successfully"], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
