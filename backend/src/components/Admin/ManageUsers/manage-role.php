<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../../config/config.php';
header("Content-Type: application/json");

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $method = $_SERVER['REQUEST_METHOD'];
    $actorUserId = (int)$_SESSION['user_id'];
    $positionMap = [
        'dean' => 1,
        'instructor' => 2,
        'advisor' => 3,
        'practical_instructor' => 4,
        'program_manager' => 5,
        'project_manager' => 6
    ];
    $positionSlugMap = array_flip($positionMap);

    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? null;
        if (!$userId) throw new Exception("ไม่พบผู้ใช้");

        $stmt = $db->prepare("SELECT position_id, is_primary FROM user_position WHERE user_id = :user_id ORDER BY is_primary DESC, position_id ASC");
        $stmt->execute([':user_id' => $userId]);
        $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $primaryPosition = "";
        $secondaryPositions = [];
        foreach ($positions as $position) {
            $slug = $positionSlugMap[(int)$position['position_id']] ?? null;
            if (!$slug) continue;

            if ((int)$position['is_primary'] === 1 && !$primaryPosition) {
                $primaryPosition = $slug;
            } else {
                $secondaryPositions[] = $slug;
            }
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "primaryPosition" => $primaryPosition,
                "secondaryPositions" => array_values(array_unique($secondaryPositions))
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true) ?: [];

    $userId = $data['userId'] ?? null;
    $newRole = $data['newRole'] ?? null; // admin, teacher, student
    $primaryPosition = $data['primaryPosition'] ?? ($data['newSubRole'] ?? null);
    $secondaryPositions = is_array($data['secondaryPositions'] ?? null) ? $data['secondaryPositions'] : [];

    if (!$userId || !$newRole) throw new Exception("ข้อมูลไม่ครบถ้วน");

    // กันผู้ดูแลแก้ role/position ของตัวเอง
    if ((int)$userId === $actorUserId) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "ไม่สามารถเปลี่ยน Role หรือตำแหน่งของบัญชีตัวเองได้ กรุณาให้ผู้ดูแลระบบคนอื่นดำเนินการแทน",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // แปลง Role
    $roleId = ($newRole == 'admin') ? 1 : (($newRole == 'teacher') ? 2 : 3);

    $db->beginTransaction();

    // 1. อัปเดตตาราง users
    $stmt = $db->prepare("UPDATE users SET role_id = :role_id WHERE user_id = :user_id");
    $stmt->execute([':role_id' => $roleId, ':user_id' => $userId]);

    // 2. อัปเดตตาราง user_position
    $db->prepare("DELETE FROM user_position WHERE user_id = :id")->execute([':id' => $userId]);

    if ($newRole == 'teacher') {
        if (!$primaryPosition || !isset($positionMap[$primaryPosition])) {
            throw new Exception("กรุณาเลือกตำแหน่งหลักของอาจารย์");
        }

        $insertStmt = $db->prepare("INSERT INTO user_position (user_id, position_id, is_primary) VALUES (:uid, :pid, :is_primary)");
        $insertStmt->execute([
            ':uid' => $userId,
            ':pid' => $positionMap[$primaryPosition],
            ':is_primary' => 1
        ]);

        foreach (array_values(array_unique($secondaryPositions)) as $secondaryPosition) {
            if ($secondaryPosition === $primaryPosition || !isset($positionMap[$secondaryPosition])) {
                continue;
            }

            $insertStmt->execute([
                ':uid' => $userId,
                ':pid' => $positionMap[$secondaryPosition],
                ':is_primary' => 0
            ]);
        }
    }

    $db->commit();
    echo json_encode(["status" => "success", "message" => "อัปเดต Role สำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
