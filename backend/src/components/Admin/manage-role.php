<?php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    $data = json_decode(file_get_contents("php://input"), true);
    
    $userId = $data['userId'] ?? null;
    $newRole = $data['newRole'] ?? null; // admin, teacher, student
    $newSubRole = $data['newSubRole'] ?? null; // dean, instructor...

    if (!$userId || !$newRole) throw new Exception("ข้อมูลไม่ครบถ้วน");

    // แปลง Role
    $roleId = ($newRole == 'admin') ? 1 : (($newRole == 'teacher') ? 2 : 3);
    
    $db->beginTransaction();

    // 1. อัปเดตตาราง users
    $stmt = $db->prepare("UPDATE users SET role_id = :role_id WHERE user_id = :user_id");
    $stmt->execute([':role_id' => $roleId, ':user_id' => $userId]);

    // 2. อัปเดตตาราง user_position (ถ้าเป็น teacher)
    if ($newRole == 'teacher' && $newSubRole) {
        $subRoleMap = [
            'dean' => 1, 'instructor' => 2, 'advisor' => 3, 
            'practical_instructor' => 4, 'program_manager' => 5, 'project_manager' => 6
        ];
        $positionId = $subRoleMap[$newSubRole] ?? 2;

        // ล้างตำแหน่งเดิมที่เป็น Primary แล้วใส่ใหม่
        $db->prepare("DELETE FROM user_position WHERE user_id = :id")->execute([':id' => $userId]);
        $stmt = $db->prepare("INSERT INTO user_position (user_id, position_id, is_primary) VALUES (:uid, :pid, 1)");
        $stmt->execute([':uid' => $userId, ':pid' => $positionId]);
    }

    $db->commit();
    echo json_encode(["status" => "success", "message" => "อัปเดต Role สำเร็จ"]);
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}