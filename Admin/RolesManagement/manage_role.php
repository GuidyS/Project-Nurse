<?php
session_start();
// 1. ตั้งค่าความปลอดภัยและ CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 2. ตรวจสอบสิทธิ์
require_once 'auth_middleware.php'; 
requireLogin(); 
$admin_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $input = json_decode(file_get_contents("php://input"), true);
        $targetUserId = $input['userId'] ?? '';
        $newRole = $input['newRole'] ?? '';
        $newSubRole = $input['newSubRole'] ?? '';

        if (!$targetUserId || !$newRole) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
            exit();
        }

        // 1. หา Role ID 
        $stmtRole = $pdo->prepare("SELECT role_id FROM role WHERE LOWER(role_name) = ? LIMIT 1");
        $stmtRole->execute([strtolower($newRole)]);
        $role_id = $stmtRole->fetchColumn();

        if (!$role_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบ Role นี้ในระบบฐานข้อมูล"]);
            exit();
        }

        // 2. อัปเดตสิทธิ์หลัก
        $stmtUpdate = $pdo->prepare("UPDATE users SET role_id = ? WHERE user_id = ?");
        $stmtUpdate->execute([$role_id, $targetUserId]);

        // 3. จัดการตำแหน่งย่อย (teacherSubRole)
        if (strtolower($newRole) === 'teacher' && $newSubRole !== '') {
            $stmtFac = $pdo->prepare("UPDATE faculty SET administrative_position = ? WHERE user_id = ?");
            $stmtFac->execute([$newSubRole, $targetUserId]);
        } else {
            $stmtFac = $pdo->prepare("UPDATE faculty SET administrative_position = NULL WHERE user_id = ?");
            $stmtFac->execute([$targetUserId]);
        }

        // 4. บันทึกประวัติลง Audit Log
        $log_action = "Role_Change: User {$targetUserId} to {$newRole}";
        if ($newSubRole !== '') {
            $log_action .= "({$newSubRole})";
        }
        $log_action = mb_substr($log_action, 0, 50); 
        
        $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action, created_at) VALUES (?, ?, NOW())");
        $stmt_log->execute([$admin_id, $log_action]);

        echo json_encode(["status" => "success", "message" => "อัปเดตสิทธิ์การใช้งานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>