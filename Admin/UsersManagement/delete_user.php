<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 
$admin_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $target_id = $_GET['id'] ?? '';
        
        if (!$target_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่ได้ระบุ ID ผู้ใช้"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$target_id]);

        $log_action = "Delete User ID: " . $target_id;
        $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action, created_at) VALUES (?, ?, NOW())");
        $stmt_log->execute([$admin_id, $log_action]);

        echo json_encode(["status" => "success", "message" => "ลบผู้ใช้สำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>