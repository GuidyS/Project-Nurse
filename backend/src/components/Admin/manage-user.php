<?php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'DELETE') {
        $admin_id = $_SESSION['user_id'] ?? 1; // สมมติ 1 ไว้ก่อนถ้าหาไม่เจอ
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) throw new Exception("ไม่พบ ID ผู้ใช้");

        $stmt = $db->prepare("DELETE FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);

        // ==========================================
        // 🔴 เพิ่มโค้ดบันทึก Audit Log ตรงนี้
        // ==========================================
        $log_sql = "INSERT INTO audit_log (user_id, action_type, resource, details, ip_address) 
                    VALUES (:uid, 'delete', 'ผู้ใช้', :details, :ip)";
        $db->prepare($log_sql)->execute([
            ':uid' => $admin_id,
            ':details' => "ลบบัญชีผู้ใช้ ID: " . $id,
            ':ip' => $ip_address
        ]);
        // ==========================================

        echo json_encode(["status" => "success", "message" => "ลบผู้ใช้สำเร็จ"]);
    } else {
        throw new Exception("Method ไม่รองรับ");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}