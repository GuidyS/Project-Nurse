<?php
// Shared access checks for administrative data tools.
function adminCurrentUserId(): ?int
{
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function adminCurrentRoleId(PDO $db): int
{
    $userId = adminCurrentUserId();
    if (!$userId) {
        return 0;
    }

    if (isset($_SESSION['role_id'])) {
        return (int)$_SESSION['role_id'];
    }

    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $userId]);
    $roleId = (int)$stmt->fetchColumn();
    $_SESSION['role_id'] = $roleId;
    return $roleId;
}

function adminRequireAuth(PDO $db): int
{
    $userId = adminCurrentUserId();
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    adminCurrentRoleId($db);
    return $userId;
}

function adminRequireAccess(PDO $db): int
{
    $userId = adminRequireAuth($db);
    $roleId = adminCurrentRoleId($db);
    $positionId = (int)($_SESSION['position_id'] ?? 0);

    if ($roleId !== 1 && !($roleId === 2 && $positionId === 1)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Admin permission required'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $userId;
}

