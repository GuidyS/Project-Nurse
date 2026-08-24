<?php
require_once __DIR__ . '/../../../config/config.php';

function schema_audit_table_exists(PDO $db, string $table): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table
    ");
    $stmt->execute([':table' => $table]);

    return (int) $stmt->fetchColumn() > 0;
}

function schema_audit_column_exists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column
    ");
    $stmt->execute([':table' => $table, ':column' => $column]);

    return (int) $stmt->fetchColumn() > 0;
}

function schema_audit_fk_exists(PDO $db, string $table, string $constraint): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table
          AND CONSTRAINT_NAME = :constraint_name
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ");
    $stmt->execute([':table' => $table, ':constraint_name' => $constraint]);

    return (int) $stmt->fetchColumn() > 0;
}

function schema_audit_column_type(PDO $db, string $table, string $column): ?string
{
    $stmt = $db->prepare("
        SELECT COLUMN_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column
        LIMIT 1
    ");
    $stmt->execute([':table' => $table, ':column' => $column]);
    $value = $stmt->fetchColumn();

    return $value !== false ? (string) $value : null;
}

function schema_audit_identifier(string $identifier): string
{
    if (!preg_match('/^[A-Za-z0-9_]+$/', $identifier)) {
        throw new InvalidArgumentException("Unsafe identifier: {$identifier}");
    }

    return "`{$identifier}`";
}

function schema_audit_orphan_count(PDO $db, string $fromTable, string $fromColumn, string $toTable, string $toColumn): ?int
{
    if (
        !schema_audit_table_exists($db, $fromTable) ||
        !schema_audit_table_exists($db, $toTable) ||
        !schema_audit_column_exists($db, $fromTable, $fromColumn) ||
        !schema_audit_column_exists($db, $toTable, $toColumn)
    ) {
        return null;
    }

    $sql = sprintf(
        "SELECT COUNT(*) FROM %s child LEFT JOIN %s parent ON child.%s = parent.%s WHERE child.%s IS NOT NULL AND parent.%s IS NULL",
        schema_audit_identifier($fromTable),
        schema_audit_identifier($toTable),
        schema_audit_identifier($fromColumn),
        schema_audit_identifier($toColumn),
        schema_audit_identifier($fromColumn),
        schema_audit_identifier($toColumn)
    );

    return (int) $db->query($sql)->fetchColumn();
}

function schema_audit_count(PDO $db, string $sql): int
{
    return (int) $db->query($sql)->fetchColumn();
}

function schema_audit_run(PDO $db): array
{
    $requiredTables = [
        'users',
        'role',
        'permissions',
        'position_permission',
        'student',
        'faculty',
        'program',
        'subject',
        'enrollment',
        'project',
        'project_documents',
        'project_outcome_links',
        'project_budget_years',
        'project_participants',
        'project_progress_logs',
        'curriculum_framework',
        'curriculum_documents',
        'curriculum_plo',
        'curriculum_sub_plo',
        'curriculum_clo',
        'advisor_transfer_request',
        'schema_migrations',
    ];

    $missingTables = [];
    foreach ($requiredTables as $table) {
        if (!schema_audit_table_exists($db, $table)) {
            $missingTables[] = $table;
        }
    }

    $relationSpecs = [
        ['users', 'role_id', 'role', 'role_id', 'fk_users_role'],
        ['faculty', 'user_id', 'users', 'user_id', 'fk_faculty_user'],
        ['student', 'user_id', 'users', 'user_id', 'fk_student_user'],
        ['student', 'program_id', 'program', 'program_id', 'fk_student_program'],
        ['subject', 'program_id', 'program', 'program_id', 'fk_subject_program'],
        ['enrollment', 'student_id', 'student', 'student_id', 'fk_enrollment_student'],
        ['enrollment', 'subject_id', 'subject', 'subject_id', 'fk_enrollment_subject'],
        ['project', 'responsible_faculty_id', 'faculty', 'faculty_id', 'fk_project_responsible_faculty'],
        ['project_documents', 'uploaded_by', 'users', 'user_id', 'fk_project_documents_uploaded_by'],
        ['curriculum_documents', 'framework_id', 'curriculum_framework', 'id', 'fk_curriculum_documents_framework'],
        ['curriculum_documents', 'created_by', 'users', 'user_id', 'fk_curriculum_documents_created_by'],
        ['advisor_transfer_request', 'student_id', 'student', 'student_id', 'fk_transfer_student'],
        ['advisor_transfer_request', 'from_advisor_id', 'faculty', 'faculty_id', 'fk_transfer_from_advisor'],
        ['advisor_transfer_request', 'to_advisor_id', 'faculty', 'faculty_id', 'fk_transfer_to_advisor'],
    ];

    $relations = [];
    foreach ($relationSpecs as [$table, $column, $refTable, $refColumn, $constraint]) {
        $fromType = schema_audit_column_type($db, $table, $column);
        $toType = schema_audit_column_type($db, $refTable, $refColumn);
        $orphans = schema_audit_orphan_count($db, $table, $column, $refTable, $refColumn);
        $relations[] = [
            'table' => $table,
            'column' => $column,
            'references' => "{$refTable}.{$refColumn}",
            'constraint' => $constraint,
            'exists' => schema_audit_fk_exists($db, $table, $constraint),
            'compatible_types' => $fromType !== null && $fromType === $toType,
            'orphan_count' => $orphans,
            'ready_for_fk' => $orphans === 0 && $fromType !== null && $fromType === $toType,
        ];
    }

    $legacy = [];
    foreach (['grades', 'plo', 'ylo', 'sub_plo'] as $table) {
        $legacy[] = [
            'table' => $table,
            'exists' => schema_audit_table_exists($db, $table),
            'status' => 'legacy_review',
        ];
    }

    $metrics = [];
    if (schema_audit_table_exists($db, 'project_documents')) {
        $metrics['project_documents_unlinked'] = schema_audit_count($db, "SELECT COUNT(*) FROM project_documents WHERE project_id IS NULL");
    }
    if (schema_audit_table_exists($db, 'curriculum_framework')) {
        $metrics['curriculum_framework_with_mapping_json'] = schema_audit_count($db, "SELECT COUNT(*) FROM curriculum_framework WHERE mapping_json IS NOT NULL AND mapping_json <> ''");
    }
    if (schema_audit_table_exists($db, 'curriculum_documents')) {
        $metrics['curriculum_documents_rows'] = schema_audit_count($db, "SELECT COUNT(*) FROM curriculum_documents");
    }
    if (schema_audit_table_exists($db, 'student')) {
        $metrics['student_rows_with_score_columns'] = schema_audit_count($db, "
            SELECT COUNT(*)
            FROM student
            WHERE COALESCE(skill_score, 0) <> 0
               OR COALESCE(attitude_score, 0) <> 0
               OR COALESCE(knowledge_score, 0) <> 0
               OR COALESCE(comm_score, 0) <> 0
               OR COALESCE(overall_score, 0) <> 0
               OR last_eval_date IS NOT NULL
        ");
    }

    $issueCount = count($missingTables);
    foreach ($relations as $relation) {
        if (!$relation['exists'] || !$relation['ready_for_fk']) {
            $issueCount++;
        }
    }
    foreach ($legacy as $legacyTable) {
        if ($legacyTable['exists']) {
            $issueCount++;
        }
    }
    foreach ($metrics as $key => $count) {
        if ($key === 'curriculum_documents_rows') {
            continue;
        }
        if ($key === 'curriculum_framework_with_mapping_json' && schema_audit_table_exists($db, 'curriculum_documents')) {
            continue;
        }
        if ($count > 0) {
            $issueCount++;
        }
    }

    return [
        'schema_version' => '2026-08-14.curriculum-documents-v1',
        'generated_at' => date('c'),
        'issue_count' => $issueCount,
        'missing_tables' => $missingTables,
        'relations' => $relations,
        'legacy' => $legacy,
        'metrics' => $metrics,
        'redaction' => 'Counts and schema names only; no personal rows, credentials, file contents, or hashes are returned.',
    ];
}

function schema_audit_require_admin(PDO $db): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => (int) $_SESSION['user_id']]);
    $roleId = (int) $stmt->fetchColumn();

    if ($roleId !== 1) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (php_sapi_name() !== 'cli') {
    $db = new Connect();
    schema_audit_require_admin($db);
    echo json_encode([
        'status' => 'success',
        'data' => schema_audit_run($db),
    ], JSON_UNESCAPED_UNICODE);
}

?>
