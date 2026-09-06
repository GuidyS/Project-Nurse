<?php
require_once __DIR__ . '/../../../config/config.php';

function curriculum_documents_json(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

function curriculum_documents_db(): Connect
{
    return new Connect();
}

function curriculum_documents_require_auth(): array
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        curriculum_documents_json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        exit;
    }

    return [
        'user_id' => (int) $_SESSION['user_id'],
        'role_id' => (int) ($_SESSION['role_id'] ?? 0),
        'permissions' => $_SESSION['permissions'] ?? [],
    ];
}

function curriculum_documents_table_exists(PDO $db): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'curriculum_documents'
    ");
    $stmt->execute();

    return (int) $stmt->fetchColumn() > 0;
}

function curriculum_documents_active_framework_id(PDO $db): ?int
{
    $id = $db->query('SELECT id FROM curriculum_framework WHERE is_active = 1 LIMIT 1')->fetchColumn();
    return $id !== false ? (int) $id : null;
}

function curriculum_documents_list_courses(PDO $db): array
{
    $stmt = $db->query("
        SELECT subject_code, subject_name_th
        FROM subject
        WHERE is_active = 1
        ORDER BY subject_code ASC
    ");

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function curriculum_documents_subject_exists(PDO $db, string $subjectCode): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM subject
        WHERE subject_code = :subject_code AND is_active = 1
    ");
    $stmt->execute([':subject_code' => $subjectCode]);

    return (int) $stmt->fetchColumn() > 0;
}

function curriculum_documents_row_to_api(array $row): array
{
    return [
        'id' => (string) $row['document_uid'],
        'name' => (string) $row['name'],
        'type' => (string) $row['document_type'],
        'course' => (string) $row['subject_code'],
        'uploadedAt' => (string) $row['uploaded_at'],
        'size' => (string) ($row['file_size_label'] ?? ''),
        'status' => (string) ($row['status'] ?? 'pending'),
        'linked' => true,
        'legacy' => ($row['source'] ?? '') === 'mapping_json_backfill',
        'source' => 'curriculum_documents',
    ];
}

function curriculum_documents_list(PDO $db, int $frameworkId): array
{
    $stmt = $db->prepare("
        SELECT document_uid, name, document_type, subject_code, uploaded_at, file_size_label, status, source
        FROM curriculum_documents
        WHERE framework_id = :framework_id
        ORDER BY uploaded_at DESC, id DESC
    ");
    $stmt->execute([':framework_id' => $frameworkId]);

    return array_map('curriculum_documents_row_to_api', $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
}

function curriculum_documents_create(PDO $db, int $frameworkId, array $payload, int $userId): string
{
    $name = trim((string) ($payload['name'] ?? ''));
    $type = trim((string) ($payload['type'] ?? ''));
    $course = trim((string) ($payload['course'] ?? ''));

    if ($name === '' || $type === '' || $course === '') {
        throw new InvalidArgumentException('Missing required document fields');
    }

    if (!curriculum_documents_subject_exists($db, $course)) {
        throw new InvalidArgumentException('Unknown or inactive subject');
    }

    $documentUid = 'doc_' . date('YmdHis') . '_' . random_int(1000, 9999);
    $stmt = $db->prepare("
        INSERT INTO curriculum_documents
            (framework_id, subject_code, document_uid, name, document_type, uploaded_at, file_size_label, status, source, created_by)
        VALUES
            (:framework_id, :subject_code, :document_uid, :name, :document_type, :uploaded_at, :file_size_label, :status, 'relational', :created_by)
    ");
    $stmt->execute([
        ':framework_id' => $frameworkId,
        ':subject_code' => $course,
        ':document_uid' => $documentUid,
        ':name' => $name,
        ':document_type' => $type,
        ':uploaded_at' => date('Y-m-d'),
        ':file_size_label' => trim((string) ($payload['size'] ?? '1.2 MB')),
        ':status' => 'pending',
        ':created_by' => $userId,
    ]);

    return $documentUid;
}

function curriculum_documents_delete(PDO $db, int $frameworkId, string $documentUid): bool
{
    $stmt = $db->prepare("
        DELETE FROM curriculum_documents
        WHERE framework_id = :framework_id AND document_uid = :document_uid
    ");
    $stmt->execute([
        ':framework_id' => $frameworkId,
        ':document_uid' => $documentUid,
    ]);

    return $stmt->rowCount() > 0;
}

?>
