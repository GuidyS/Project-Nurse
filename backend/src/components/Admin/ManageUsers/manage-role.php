<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/admin_role_guard.php';
header("Content-Type: application/json; charset=UTF-8");

$positionIdLockAcquired = false;
try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $method = $_SERVER['REQUEST_METHOD'];
    $actorUserId = (int)$_SESSION['user_id'];
    $actorStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $actorStmt->execute([':user_id' => $actorUserId]);
    if ((int)$actorStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการ Role ได้"], JSON_UNESCAPED_UNICODE);
        exit();
    }
    if (!in_array($method, ['GET', 'POST'], true)) {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
        exit();
    }
    $positionMap = [
        'dean' => 1,
        'instructor' => 2,
        'advisor' => 3,
        'practical_instructor' => 4,
        'program_manager' => 5,
        'project_manager' => 6,
        'research' => 9
    ];
    $positionSlugMap = array_flip($positionMap);

    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? null;
        if (!$userId) throw new Exception("ไม่พบผู้ใช้");

        $targetRoleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
        $targetRoleStmt->execute([':user_id' => $userId]);
        $targetRole = $targetRoleStmt->fetchColumn();
        if ($targetRole === false) throw new Exception("ไม่พบผู้ใช้");

        $stmt = $db->prepare("SELECT position_id, is_primary FROM user_position WHERE user_id = :user_id ORDER BY is_primary DESC, position_id ASC");
        $stmt->execute([':user_id' => $userId]);
        $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $primaryPosition = "";
        $secondaryPositions = [];
        foreach ($positions as $position) {
            $slug = $positionSlugMap[(int)$position['position_id']] ?? null;
            if (!$slug) continue;

            if ((int)$targetRole !== 1 && (int)$position['is_primary'] === 1 && !$primaryPosition) {
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
    $newRole = $data['newRole'] ?? null;
    $primaryPosition = $data['primaryPosition'] ?? ($data['newSubRole'] ?? null);
    $secondaryPositions = is_array($data['secondaryPositions'] ?? null) ? $data['secondaryPositions'] : [];
    $secondaryPositions = array_values(array_unique(array_filter(
        $secondaryPositions,
        static fn($position): bool => is_string($position) && isset($positionMap[$position])
    )));

    if (!filter_var($userId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) || !in_array($newRole, ['admin', 'teacher'], true)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูล Role ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit();
    }
    $userId = (int)$userId;

    // The reference dump makes this column AUTO_INCREMENT, but some deployed
    // databases missed that clause. Use normal inserts when the schema is
    // correct and serialize explicit ID allocation only on the older schema.
    $positionIdColumn = $db->query("SHOW COLUMNS FROM user_position LIKE 'user_position_id'")->fetch(PDO::FETCH_ASSOC);
    if (!$positionIdColumn) {
        throw new RuntimeException('ไม่พบคอลัมน์รหัสตำแหน่งผู้ใช้ในฐานข้อมูล');
    }
    $needsExplicitPositionId = !str_contains(strtolower((string)($positionIdColumn['Extra'] ?? '')), 'auto_increment');
    if ($needsExplicitPositionId) {
        $positionIdLockAcquired = (int)$db->query("SELECT GET_LOCK('nurse_mis_user_position_id', 10)")->fetchColumn() === 1;
        if (!$positionIdLockAcquired) {
            throw new RuntimeException('ระบบกำลังบันทึกตำแหน่งของผู้ใช้อื่น กรุณาลองอีกครั้ง');
        }
    }
    $db->beginTransaction();

    $targetStmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :user_id FOR UPDATE");
    $targetStmt->execute([':user_id' => $userId]);
    $targetUser = $targetStmt->fetch(PDO::FETCH_ASSOC);
    if (!$targetUser) {
        throw new Exception("ไม่พบบัญชีผู้ใช้ที่ต้องการแก้ Role");
    }
    if ($userId === $actorUserId && $newRole !== 'admin') {
        throw new DomainException('ไม่สามารถถอด Role ผู้ดูแลระบบของบัญชีตัวเองได้');
    }

    $roleId = $newRole === 'admin' ? 1 : 2;
    if ((int)$targetUser['role_id'] === 1 && $roleId !== 1) {
        assertCanRemoveActiveAdmin($db, $userId, $actorUserId);
    }

    $adminPositionId = null;
    if ($newRole === 'admin') {
        $adminPositionStmt = $db->prepare("SELECT position_id FROM position WHERE position_name = :name LIMIT 1");
        $adminPositionStmt->execute([':name' => 'เลขา']);
        $adminPositionId = $adminPositionStmt->fetchColumn();
        if (!$adminPositionId) {
            throw new Exception("ไม่พบตำแหน่งผู้ดูแลระบบในฐานข้อมูล");
        }
    }

    $stmt = $db->prepare("UPDATE users SET role_id = :role_id WHERE user_id = :user_id");
    $stmt->execute([':role_id' => $roleId, ':user_id' => $userId]);

    $db->prepare("DELETE FROM user_position WHERE user_id = :id")->execute([':id' => $userId]);
    $nextPositionId = $needsExplicitPositionId
        ? (int)$db->query("SELECT COALESCE(MAX(user_position_id), 0) FROM user_position")->fetchColumn() + 1
        : null;
    $insertPosition = $db->prepare($needsExplicitPositionId
        ? "INSERT INTO user_position (user_position_id, user_id, position_id, is_primary) VALUES (:row_id, :uid, :pid, :is_primary)"
        : "INSERT INTO user_position (user_id, position_id, is_primary) VALUES (:uid, :pid, :is_primary)");
    $savePosition = static function (int $positionId, int $isPrimary) use ($insertPosition, $needsExplicitPositionId, &$nextPositionId, $userId): void {
        $params = [':uid' => $userId, ':pid' => $positionId, ':is_primary' => $isPrimary];
        if ($needsExplicitPositionId) {
            $params[':row_id'] = $nextPositionId++;
        }
        $insertPosition->execute($params);
    };

    if ($newRole === 'admin') {
        $savePosition((int)$adminPositionId, 1);
        foreach (array_values(array_unique($secondaryPositions)) as $secondaryPosition) {
            if (!isset($positionMap[$secondaryPosition]) || $positionMap[$secondaryPosition] == $adminPositionId) {
                continue;
            }
            $savePosition($positionMap[$secondaryPosition], 0);
        }
    } elseif ($newRole === 'teacher') {
        if (!$primaryPosition || !isset($positionMap[$primaryPosition])) {
            throw new Exception("กรุณาเลือกตำแหน่งหลักของอาจารย์");
        }

        $savePosition($positionMap[$primaryPosition], 1);

        foreach (array_values(array_unique($secondaryPositions)) as $secondaryPosition) {
            if ($secondaryPosition === $primaryPosition || !isset($positionMap[$secondaryPosition])) {
                continue;
            }

            $savePosition($positionMap[$secondaryPosition], 0);
        }
    }

    $roleLabel = $newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์';
    $logDetail = "เปลี่ยนบทบาทผู้ใช้ {$targetUser['username']} เป็น {$roleLabel}";
    if ($newRole === 'teacher' && $primaryPosition) {
        $logDetail .= " (ตำแหน่งหลัก: {$primaryPosition})";
    } elseif ($newRole === 'admin' && $secondaryPositions) {
        $logDetail .= ' (ตำแหน่งรอง: ' . implode(', ', array_values(array_unique($secondaryPositions))) . ')';
    }

    $db->commit();

    logAudit($db, $actorUserId, 'role_change', 'roles_management', $logDetail);

    echo json_encode(["status" => "success", "message" => "อัปเดต Role สำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
    if ($positionIdLockAcquired && isset($db)) {
        $db->query("SELECT RELEASE_LOCK('nurse_mis_user_position_id')");
    }
}
