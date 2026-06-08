<?php
session_start();
// 1. ตั้งค่าความปลอดภัยและ CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// จัดการ Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 2. ตรวจสอบสิทธิ์
require_once 'auth_middleware.php'; 
requireLogin(); 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        // ดึงจาก audit_log เฉพาะ action ที่ขึ้นต้นด้วย 'Import:'
        $stmt = $pdo->query("
            SELECT audit_log_id, action, created_at 
            FROM audit_log 
            WHERE action LIKE 'Import:%' 
            ORDER BY created_at DESC 
            LIMIT 20
        ");
        
        $history = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // แยกข้อความด้วย | เช่น Import:students|data.csv|150|success
            $clean_action = str_replace('Import:', '', $row['action']);
            $parts = explode('|', $clean_action);
            
            if (count($parts) >= 4) {
                $history[] = [
                    "id" => (string)$row['audit_log_id'],
                    "type" => $parts[0],
                    "fileName" => $parts[1],
                    "recordCount" => (int)$parts[2],
                    "status" => $parts[3],
                    "date" => $row['created_at']
                ];
            }
        }
        
        echo json_encode($history);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>