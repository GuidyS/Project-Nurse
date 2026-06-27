<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 
$admin_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $target_id = $input['id'] ?? '';
        $new_status = $input['status'] ?? ''; 

        if (!$target_id || !$new_status) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
            exit();
        }

        $is_active_val = ($new_status === 'active') ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE user_id = ?");
        $stmt->execute([$is_active_val, $target_id]);

       $log_details = "Toggle Status User ID {$target_id} to {$new_status}";
$stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
$stmt_log->execute([$admin_id, "UPDATE", "users", $log_details, $_SERVER['REMOTE_ADDR']]);

        echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>