<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// ดึงรหัสนักศึกษาจาก Session
$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;

if (!$student_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    $db = new Connect();
    $sql = "SELECT portfolio_id AS id, title, type, description, DATE_FORMAT(created_at, '%Y-%m-%d') as date, file_name 
            FROM portfolio 
            WHERE student_id = :student_id 
            ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':student_id' => $student_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $items
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>