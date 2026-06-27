<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึง Log 100 รายการล่าสุด พร้อมเชื่อมตาราง Users หาชื่อคนทำ
    $sql = "
        SELECT 
            a.log_id AS id,
            DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i') AS timestamp,
            COALESCE(u.email, 'Unknown User') AS user,
            COALESCE(r.role_name_en, 'System') AS userRole,
            LOWER(a.action_type) AS action,
            a.resource,
            a.details,
            a.ip_address AS ipAddress
        FROM audit_log a
        LEFT JOIN users u ON a.user_id = u.user_id
        LEFT JOIN role r ON u.role_id = r.role_id
        ORDER BY a.created_at DESC
        LIMIT 100
    ";

    $stmt = $pdo->query($sql);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ปรับรูปแบบ action_type ให้ตรงกับที่ Frontend React คาดหวัง
    foreach ($logs as &$log) {
        if (in_array($log['action'], ['import', 'export', 'login'])) {
            $log['action'] = strtolower($log['action']);
        } elseif ($log['action'] === 'update') {
            $log['action'] = 'update';
        } elseif ($log['action'] === 'delete') {
            $log['action'] = 'delete';
        } else {
            $log['action'] = 'update'; // Default fallback
        }
    }

    echo json_encode($logs);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>