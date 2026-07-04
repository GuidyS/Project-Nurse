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

$data = json_decode(file_get_contents("php://input"), true);
$targetUserId = $data['userId'] ?? null;
$newRole = $data['newRole'] ?? null;        // admin, teacher, student
$newSubRole = $data['newSubRole'] ?? '';    // project_manager, dean, etc.

if (!$targetUserId || !$newRole) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. แปลงชื่อ Role เป็น role_id (สมมติ 1=admin, 2=teacher, 3=student)
    $role_id = 3; 
    if ($newRole === 'admin') $role_id = 1;
    elseif ($newRole === 'teacher') $role_id = 2;

    // อัปเดต Role หลักของระบบ
    $stmt = $pdo->prepare("UPDATE users SET role_id = ? WHERE user_id = ?");
    $stmt->execute([$role_id, $targetUserId]);

    // 2. จัดการ Sub-Role (สายบังคับบัญชา)
    if ($newRole === 'teacher' && $newSubRole !== '') {
        // ถ้าไดน่ามีตาราง user_position ไว้เก็บตำแหน่ง ให้ Insert/Update ที่นี่
        // แต่เพื่อความยืดหยุ่น เราแอบใช้ตาราง faculty เก็บตำแหน่งชั่วคราวได้
        // 💡 เช็คก่อนว่าอาจารย์คนนี้อยู่ในตาราง faculty หรือยัง
        $stmt_check = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ?");
        $stmt_check->execute([$targetUserId]);
        $faculty_id = $stmt_check->fetchColumn();

        if ($faculty_id) {
            // สมมติเอา newSubRole ไปฝากไว้ใน title ก่อน (ปรับแก้ให้ตรงกับ DB ไดน่าได้ครับ)
            $stmt_fac = $pdo->prepare("UPDATE faculty SET title = ? WHERE user_id = ?");
            $stmt_fac->execute([$newSubRole, $targetUserId]);
        }
    }

    // 3. บันทึก Audit Log
    $logStr = "Changed Role user_id:{$targetUserId} to {$newRole}" . ($newSubRole ? " ({$newSubRole})" : "");
    $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt_log->execute([$admin_id, "UPDATE", "role", $logStr, $_SERVER['REMOTE_ADDR']]);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "อัปเดตสิทธิ์สำเร็จ"]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ข้อผิดพลาดระบบ: " . $e->getMessage()]);
}
?>