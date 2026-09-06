<?php
require_once __DIR__ . '/../../../config/config.php';

const PROJECT_UPLOAD_MAX_BYTES = 10485760; // 10 MB

function project_json(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

function project_db(): Connect
{
    $db = new Connect();
    project_ensure_schema($db);

    return $db;
}

/**
 * เติมคอลัมน์ที่โค้ดโครงการต้องใช้ให้ตาราง project ถ้ายังไม่มี (รันซ้ำได้)
 * ฐานข้อมูลบางชุดยังเป็น schema เก่ากว่าโค้ด เช่น dump 3-8-2569 ที่ไม่มีคอลัมน์ strategy
 */
function project_ensure_schema(PDO $db): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $columns = [
        'strategy' => "ALTER TABLE project ADD COLUMN strategy VARCHAR(255) NULL DEFAULT NULL AFTER description",
    ];

    foreach ($columns as $column => $alterSql) {
        $stmt = $db->prepare("
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'project'
              AND COLUMN_NAME = :column_name
        ");
        $stmt->execute([':column_name' => $column]);

        if ((int) $stmt->fetchColumn() === 0) {
            $db->exec($alterSql);
        }
    }
}

function project_require_auth(PDO $db, array $requiredPermissions = []): array
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        project_json(["status" => "error", "message" => "Unauthorized"], 401);
        exit;
    }

    $userId = (int) $_SESSION['user_id'];
    $userStmt = $db->prepare("SELECT user_id, username, role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $userStmt->execute([':user_id' => $userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        project_json(["status" => "error", "message" => "Unauthorized"], 401);
        exit;
    }

    $permissions = $_SESSION['permissions'] ?? null;
    if (!is_array($permissions)) {
        $permStmt = $db->prepare("
            SELECT DISTINCT p.permission_name
            FROM permissions p
            JOIN position_permission pp ON p.permission_id = pp.permission_id
            JOIN user_position up ON pp.position_id = up.position_id
            WHERE up.user_id = :user_id
        ");
        $permStmt->execute([':user_id' => $userId]);
        $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        $_SESSION['permissions'] = $permissions;
    }

    $roleId = (int) ($user['role_id'] ?? 0);
    if ($roleId !== 1 && !empty($requiredPermissions)) {
        $hasPermission = false;
        foreach ($requiredPermissions as $permission) {
            if (in_array($permission, $permissions, true)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            project_json(["status" => "error", "message" => "Forbidden"], 403);
            exit;
        }
    }

    return [
        'user_id' => $userId,
        'username' => (string) ($user['username'] ?? ''),
        'role_id' => $roleId,
        'permissions' => $permissions,
    ];
}

function project_require_admin_write(array $auth): void
{
    if ((int)($auth['role_id'] ?? 0) !== 1) {
        project_json([
            "status" => "error",
            "message" => "Project master data is Admin-only. Teachers can view their projects but cannot create, edit, delete, or upload project files.",
        ], 403);
        exit;
    }
}

function project_resolve_faculty_id(PDO $db, int $userId): ?int
{
    $columnStmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'faculty'
          AND COLUMN_NAME = 'user_id'
    ");
    $columnStmt->execute();

    if ((int) $columnStmt->fetchColumn() > 0) {
        $stmt = $db->prepare("
            SELECT faculty_id
            FROM faculty
            WHERE user_id = :user_id
            LIMIT 1
        ");
        $stmt->execute([':user_id' => $userId]);
        $facultyId = $stmt->fetchColumn();

        if ($facultyId !== false) {
            return (int) $facultyId;
        }
    }

    $stmt = $db->prepare("
        SELECT f.faculty_id
        FROM users u
        INNER JOIN faculty f ON CAST(u.username AS CHAR) = CAST(f.faculty_id AS CHAR)
        WHERE u.user_id = :user_id
        LIMIT 1
    ");
    $stmt->execute([':user_id' => $userId]);
    $facultyId = $stmt->fetchColumn();

    return $facultyId !== false ? (int) $facultyId : null;
}

function project_request_int(string $key, string $source = 'get'): ?int
{
    $value = $source === 'post' ? ($_POST[$key] ?? null) : ($_GET[$key] ?? null);
    if ($value === null || $value === '') {
        return null;
    }

    $intValue = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    return $intValue === false ? null : (int) $intValue;
}

function project_payload(): array
{
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function project_require_existing_project(PDO $db, int $projectId): array
{
    $stmt = $db->prepare("
        SELECT project_id, project_name_th, project_name_en, responsible_faculty_id, mapping_json
        FROM project
        WHERE project_id = :project_id
        LIMIT 1
    ");
    $stmt->execute([':project_id' => $projectId]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        project_json(["status" => "error", "message" => "ไม่พบโครงการที่เลือก"], 404);
        exit;
    }

    return $project;
}

function project_normalize_status(?string $status): string
{
    $allowed = ['pending', 'active', 'completed', 'cancelled'];
    return in_array($status, $allowed, true) ? $status : 'active';
}

function project_has_permission(array $auth, string $permission): bool
{
    return (int) ($auth['role_id'] ?? 0) === 1 || in_array($permission, $auth['permissions'] ?? [], true);
}

function project_nullable_non_negative_int(array $input, string $key, string $label): ?int
{
    if (!array_key_exists($key, $input) || $input[$key] === null || $input[$key] === '') {
        return null;
    }

    $value = filter_var($input[$key], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    if ($value === false) {
        throw new InvalidArgumentException($label . "ต้องเป็นจำนวนเต็มไม่ติดลบ");
    }

    return (int) $value;
}
?>
