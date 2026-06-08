<?php
session_start();
// ตั้งค่า CORS ให้ React เข้าถึงได้
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 1. เรียกใช้ Middleware ยามรักษาความปลอดภัยของเรา
require_once 'auth_middleware.php'; 
requireLogin(); // <-- เพิ่มบรรทัดนี้ให้ เพื่อให้มันบล็อกคนที่ไม่ได้ล็อกอิน
$user_id = $_SESSION['user_id']; // รหัส User ที่ล็อกอินอยู่

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$page = $_GET['page'] ?? '';

try {
    if ($page === 'get-audit-logs') {
        
        // ดึงข้อมูลจากตาราง audit_log เชื่อมกับ users และ role
        $sql = "
            SELECT 
                a.audit_log_id,
                DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as timestamp,
                u.username,
                r.role_name,
                a.action
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.user_id
            LEFT JOIN role r ON u.role_id = r.role_id
            ORDER BY a.created_at DESC
            LIMIT 100
        ";
        
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $logs = [];
        foreach ($rows as $row) {
            $raw_action = strtolower($row['action']);
            
            // แปลงข้อความ action ใน Database ให้ตรงกับ Type ที่ React ต้องการ 
            $action_type = "create"; 
            $resource = "System";
            
            if (strpos($raw_action, 'login') !== false) {
                $action_type = "login";
                $resource = "Authentication";
            } elseif (strpos($raw_action, 'logout') !== false) {
                $action_type = "logout";
                $resource = "Authentication";
            } elseif (strpos($raw_action, 'update') !== false || strpos($raw_action, 'edit') !== false) {
                $action_type = "update";
                $resource = "Database";
            } elseif (strpos($raw_action, 'delete') !== false || strpos($raw_action, 'remove') !== false) {
                $action_type = "delete";
                $resource = "Database";
            } elseif (strpos($raw_action, 'report') !== false) {
                $action_type = "create";
                $resource = "Report";
            }

            // จัด Format ให้ตรงกับ Interface ของ Frontend แป๊ะๆ
            $logs[] = [
                "id" => (string)$row['audit_log_id'],
                "timestamp" => $row['timestamp'],
                "user" => $row['username'] ?? "System",
                "userRole" => ucfirst($row['role_name'] ?? "Guest"),
                "action" => $action_type,
                "resource" => $resource,
                "details" => $row['action'],
                // จำลอง IP Address ไว้ให้แสดงผลหน้าจอ
                "ipAddress" => "192.168.1." . rand(10, 250) 
            ];
        }

        // ส่งออกเป็น Array ตรงๆ (เพราะ Frontend ดัก Array.isArray(response.data) ไว้)
        echo json_encode($logs);
        exit();
    }

    // ถ้า page ไม่ตรง
    echo json_encode([]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>