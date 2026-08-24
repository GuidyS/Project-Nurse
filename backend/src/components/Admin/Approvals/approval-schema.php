<?php

function ensureApprovalRequestsSchema(PDO $db): void
{
    $db->exec("
        CREATE TABLE IF NOT EXISTS approval_requests (
            approval_request_id BIGINT NOT NULL AUTO_INCREMENT,
            request_type VARCHAR(50) NOT NULL,
            requester_user_id BIGINT DEFAULT NULL,
            target_ref_type VARCHAR(50) DEFAULT NULL,
            target_ref_id VARCHAR(100) DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            payload_json JSON DEFAULT NULL,
            before_json JSON DEFAULT NULL,
            after_json JSON DEFAULT NULL,
            status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
            review_note TEXT DEFAULT NULL,
            reviewed_by BIGINT DEFAULT NULL,
            reviewed_at TIMESTAMP NULL DEFAULT NULL,
            applied_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (approval_request_id),
            KEY idx_approval_requests_status (status),
            KEY idx_approval_requests_type (request_type),
            KEY idx_approval_requests_requester (requester_user_id),
            KEY idx_approval_requests_reviewer (reviewed_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    approvalEnsureColumn($db, 'payload_json', "ALTER TABLE approval_requests ADD COLUMN payload_json JSON DEFAULT NULL AFTER description");
    approvalEnsureColumn($db, 'before_json', "ALTER TABLE approval_requests ADD COLUMN before_json JSON DEFAULT NULL AFTER payload_json");
    approvalEnsureColumn($db, 'after_json', "ALTER TABLE approval_requests ADD COLUMN after_json JSON DEFAULT NULL AFTER before_json");
    approvalEnsureColumn($db, 'applied_at', "ALTER TABLE approval_requests ADD COLUMN applied_at TIMESTAMP NULL DEFAULT NULL AFTER reviewed_at");
    approvalEnsureResearchPermissions($db);
}

function approvalEnsureColumn(PDO $db, string $columnName, string $alterSql): void
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'approval_requests'
          AND COLUMN_NAME = :column_name
    ");
    $stmt->execute([':column_name' => $columnName]);

    if ((int)$stmt->fetchColumn() === 0) {
        $db->exec($alterSql);
    }
}

function approvalEnsureResearchPermissions(PDO $db): void
{
    $tableStmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'permissions'
    ");
    $tableStmt->execute();
    if ((int)$tableStmt->fetchColumn() === 0) {
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO permissions (permission_name, module_group, description_th)
        SELECT :permission_name, 'RESEARCH', :description
        WHERE NOT EXISTS (
            SELECT 1 FROM permissions WHERE permission_name = :permission_name_check
        )
    ");

    foreach ([
        'RESEARCH_VIEW' => 'View research and innovation records',
        'RESEARCH_MANAGE' => 'Create and update research and innovation records',
    ] as $permission => $description) {
        $stmt->execute([
            ':permission_name' => $permission,
            ':permission_name_check' => $permission,
            ':description' => $description,
        ]);
    }
}

function approvalCurrentUserId(): ?int
{
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function approvalCurrentRoleId(PDO $db): int
{
    $userId = approvalCurrentUserId();
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

function approvalRequireAuth(PDO $db): int
{
    $userId = approvalCurrentUserId();
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    approvalCurrentRoleId($db);
    return $userId;
}

function approvalRequireAdmin(PDO $db): int
{
    $userId = approvalRequireAuth($db);
    if (approvalCurrentRoleId($db) !== 1) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Admin permission required'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $userId;
}

function approvalEncodeJson($value): ?string
{
    if ($value === null) {
        return null;
    }

    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function approvalCreateRequest(PDO $db, array $request): int
{
    ensureApprovalRequestsSchema($db);

    $requesterUserId = (int)($request['requester_user_id'] ?? approvalCurrentUserId() ?? 0);
    $requestType = (string)($request['request_type'] ?? '');
    $title = trim((string)($request['title'] ?? ''));
    $allowedTypes = [
        'permission_change',
        'student_transfer',
        'document_link_approval',
        'sensitive_change',
    ];

    if (!in_array($requestType, $allowedTypes, true)) {
        throw new InvalidArgumentException('Unsupported approval request type');
    }
    if ($requesterUserId <= 0 || $title === '') {
        throw new InvalidArgumentException('Missing requester or title');
    }

    $stmt = $db->prepare("
        INSERT INTO approval_requests
            (request_type, requester_user_id, target_ref_type, target_ref_id, title, description,
             payload_json, before_json, after_json, status, created_at, updated_at)
        VALUES
            (:request_type, :requester_user_id, :target_ref_type, :target_ref_id, :title, :description,
             :payload_json, :before_json, :after_json, 'pending', NOW(), NOW())
    ");
    $stmt->execute([
        ':request_type' => $requestType,
        ':requester_user_id' => $requesterUserId,
        ':target_ref_type' => $request['target_ref_type'] ?? null,
        ':target_ref_id' => isset($request['target_ref_id']) ? (string)$request['target_ref_id'] : null,
        ':title' => $title,
        ':description' => $request['description'] ?? null,
        ':payload_json' => approvalEncodeJson($request['payload_json'] ?? []),
        ':before_json' => approvalEncodeJson($request['before_json'] ?? null),
        ':after_json' => approvalEncodeJson($request['after_json'] ?? null),
    ]);

    $requestId = (int)$db->lastInsertId();
    approvalLogAction($db, 'create', $requestId, $requesterUserId, 'Created approval request: ' . $requestType);
    return $requestId;
}

function approvalDecodePayload(?string $json): array
{
    if (!$json) {
        return [];
    }

    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : [];
}

function approvalApplyRequest(PDO $db, array $request): void
{
    $type = (string)$request['request_type'];
    $targetType = (string)($request['target_ref_type'] ?? '');
    $targetId = (string)($request['target_ref_id'] ?? '');
    $payload = approvalDecodePayload($request['payload_json'] ?? null);

    if ($type === 'student_transfer') {
        approvalApplyStudentTransfer($db, $payload);
        return;
    }

    if ($type === 'document_link_approval') {
        approvalApplyDocumentLink($db, $targetType, $targetId);
        return;
    }

    if ($type === 'permission_change') {
        approvalApplyPermissionChange($db, $payload);
        return;
    }

    if ($type === 'sensitive_change') {
        return;
    }

    throw new RuntimeException('Unsupported approval apply handler');
}

function approvalApplyStudentTransfer(PDO $db, array $payload): void
{
    $studentId = (string)($payload['student_id'] ?? '');
    $toAdvisorId = (string)($payload['to_advisor_id'] ?? '');

    if ($studentId === '' || $toAdvisorId === '') {
        throw new InvalidArgumentException('Student transfer payload is incomplete');
    }

    $stmtCheck = $db->prepare("SELECT mapping_id FROM student_advisor_mapping WHERE student_id = :student_id LIMIT 1");
    $stmtCheck->execute([':student_id' => $studentId]);
    $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $stmt = $db->prepare("
            UPDATE student_advisor_mapping
            SET faculty_id = :faculty_id
            WHERE student_id = :student_id
        ");
        $stmt->execute([
            ':faculty_id' => $toAdvisorId,
            ':student_id' => $studentId,
        ]);
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO student_advisor_mapping (student_id, faculty_id, advisor_type, academic_year)
        VALUES (:student_id, :faculty_id, 'General', YEAR(CURRENT_DATE))
    ");
    $stmt->execute([
        ':student_id' => $studentId,
        ':faculty_id' => $toAdvisorId,
    ]);
}

function approvalApplyDocumentLink(PDO $db, string $targetType, string $targetId): void
{
    if ($targetType === 'tqf_document' && $targetId !== '') {
        $stmt = $db->prepare("UPDATE tqf_documents SET approval_status = 'ส่งและถูกต้อง' WHERE id = :id");
        $stmt->execute([':id' => $targetId]);
        return;
    }

    if ($targetType === 'curriculum_document' && $targetId !== '') {
        $stmt = $db->prepare("UPDATE curriculum_documents SET status = 'approved' WHERE document_uid = :id OR id = :numeric_id");
        $stmt->execute([
            ':id' => $targetId,
            ':numeric_id' => ctype_digit($targetId) ? (int)$targetId : 0,
        ]);
    }
}

function approvalApplyPermissionChange(PDO $db, array $payload): void
{
    $targetUserId = isset($payload['target_user_id']) ? (int)$payload['target_user_id'] : 0;
    if ($targetUserId <= 0) {
        throw new InvalidArgumentException('Permission change target user is missing');
    }

    if (isset($payload['role_id']) && in_array((int)$payload['role_id'], [1, 2, 3], true)) {
        $stmt = $db->prepare("UPDATE users SET role_id = :role_id WHERE user_id = :user_id");
        $stmt->execute([
            ':role_id' => (int)$payload['role_id'],
            ':user_id' => $targetUserId,
        ]);
    }

    if (isset($payload['position_ids']) && is_array($payload['position_ids'])) {
        $positionIds = array_values(array_unique(array_filter(array_map('intval', $payload['position_ids']), fn($id) => $id > 0)));
        $db->prepare("DELETE FROM user_position WHERE user_id = :user_id")->execute([':user_id' => $targetUserId]);
        $insert = $db->prepare("INSERT INTO user_position (user_id, position_id, is_primary) VALUES (:user_id, :position_id, :is_primary)");
        foreach ($positionIds as $index => $positionId) {
            $insert->execute([
                ':user_id' => $targetUserId,
                ':position_id' => $positionId,
                ':is_primary' => $index === 0 ? 1 : 0,
            ]);
        }
    }
}

function approvalLogAction(PDO $db, string $action, int $requestId, ?int $userId, string $details = ''): void
{
    $tableStmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'audit_log'
    ");
    $tableStmt->execute();
    if ((int)$tableStmt->fetchColumn() === 0) {
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
        VALUES (:user_id, 'update', 'approval_request', :details, :ip_address)
    ");
    $stmt->execute([
        ':user_id' => $userId ?: 1,
        ':details' => trim($action . ' approval request ID: ' . $requestId . ($details ? ' - ' . $details : '')),
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    ]);
}

function logApprovalAction(PDO $db, string $action, int $requestId, ?int $userId): void
{
    approvalLogAction($db, $action, $requestId, $userId);
}

?>
