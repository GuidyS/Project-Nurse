<?php

use Aws\S3\S3Client;

function storageConfig(): array
{
    return [
        'endpoint' => rtrim((string)(getenv('STORAGE_ENDPOINT') ?: 'http://minio:9000'), '/'),
        'region' => (string)(getenv('STORAGE_REGION') ?: 'us-east-1'),
        'bucket' => (string)(getenv('STORAGE_BUCKET') ?: 'nurse-mis-files'),
        'access_key' => (string)getenv('STORAGE_ACCESS_KEY'),
        'secret_key' => (string)getenv('STORAGE_SECRET_KEY'),
        'path_style' => filter_var(getenv('STORAGE_PATH_STYLE') ?: 'true', FILTER_VALIDATE_BOOL),
        'legacy_fallback' => filter_var(getenv('STORAGE_LEGACY_FALLBACK') ?: 'true', FILTER_VALIDATE_BOOL),
    ];
}

function storageClient(): S3Client
{
    static $client = null;
    if ($client instanceof S3Client) return $client;

    $autoload = __DIR__ . '/../vendor/autoload.php';
    if (!is_file($autoload)) {
        throw new RuntimeException('Object Storage dependency is not installed. Run composer install.');
    }
    require_once $autoload;
    $config = storageConfig();
    if ($config['access_key'] === '' || $config['secret_key'] === '') {
        throw new RuntimeException('Object Storage credentials are not configured.');
    }
    $client = new S3Client([
        'version' => 'latest',
        'region' => $config['region'],
        'endpoint' => $config['endpoint'],
        'use_path_style_endpoint' => $config['path_style'],
        'credentials' => ['key' => $config['access_key'], 'secret' => $config['secret_key']],
    ]);
    return $client;
}

function storageEnsureBucket(): void
{
    static $ready = false;
    if ($ready) return;
    $client = storageClient();
    $bucket = storageConfig()['bucket'];
    try {
        $client->headBucket(['Bucket' => $bucket]);
    } catch (Throwable $e) {
        $client->createBucket(['Bucket' => $bucket]);
        $client->waitUntil('BucketExists', ['Bucket' => $bucket]);
    }
    $ready = true;
}

function storageUuid(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);
    return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4) . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20);
}

function storageReference(string $id): string
{
    return 'storage://' . $id;
}

function storageReferenceId(?string $reference): ?string
{
    $reference = trim((string)$reference);
    return preg_match('/^storage:\/\/([0-9a-f-]{36})$/i', $reference, $m) ? strtolower($m[1]) : null;
}

function storageSanitizeSegment(string $value): string
{
    $safe = preg_replace('/[^A-Za-z0-9._-]/', '_', $value) ?: 'unknown';
    return trim($safe, '.') ?: 'unknown';
}

function storagePutUploadedFile(PDO $db, array $file, array $meta): array
{
    $isTrustedLocalSource = !empty($meta['allow_local_source']) && is_file($file['tmp_name'] ?? '');
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || (!$isTrustedLocalSource && !is_uploaded_file($file['tmp_name'] ?? ''))) {
        throw new InvalidArgumentException('อัปโหลดไฟล์มาไม่สมบูรณ์');
    }
    $id = storageUuid();
    $name = basename((string)($file['name'] ?? 'file'));
    $mime = (string)($meta['mime_type'] ?? mime_content_type($file['tmp_name']) ?: 'application/octet-stream');
    $size = (int)($file['size'] ?? filesize($file['tmp_name']));
    $sha256 = hash_file('sha256', $file['tmp_name']);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $key = storageSanitizeSegment((string)$meta['resource_type']) . '/'
        . storageSanitizeSegment((string)$meta['owner_type']) . '/'
        . storageSanitizeSegment((string)$meta['owner_id']) . '/'
        . $id . ($ext !== '' ? '.' . storageSanitizeSegment($ext) : '');
    $config = storageConfig();

    storageEnsureBucket();
    storageClient()->putObject([
        'Bucket' => $config['bucket'],
        'Key' => $key,
        'SourceFile' => $file['tmp_name'],
        'ContentType' => $mime,
        'Metadata' => ['sha256' => $sha256],
    ]);
    $head = storageClient()->headObject(['Bucket' => $config['bucket'], 'Key' => $key]);
    $remoteSha = strtolower((string)($head['Metadata']['sha256'] ?? ''));
    if ((int)($head['ContentLength'] ?? -1) !== $size || !hash_equals($sha256, $remoteSha)) {
        storageDeleteObjectKey($key);
        throw new RuntimeException('Object Storage verification failed.');
    }

    try {
        $stmt = $db->prepare("INSERT INTO storage_objects
            (storage_id, object_key, original_name, mime_type, size_bytes, sha256, owner_type, owner_id,
             resource_type, resource_id, access_scope, legacy_source, status, created_by)
            VALUES (:id,:object_key,:name,:mime,:size,:sha,:owner_type,:owner_id,:resource_type,:resource_id,
                    :access_scope,'none','active',:created_by)");
        $stmt->execute([
            ':id' => $id, ':object_key' => $key, ':name' => mb_substr($name, 0, 255), ':mime' => $mime,
            ':size' => $size, ':sha' => $sha256, ':owner_type' => $meta['owner_type'], ':owner_id' => (string)$meta['owner_id'],
            ':resource_type' => $meta['resource_type'], ':resource_id' => isset($meta['resource_id']) ? (string)$meta['resource_id'] : null,
            ':access_scope' => $meta['access_scope'], ':created_by' => $meta['created_by'] ?? ($_SESSION['user_id'] ?? null),
        ]);
    } catch (Throwable $e) {
        try { storageClient()->deleteObject(['Bucket' => $config['bucket'], 'Key' => $key]); } catch (Throwable $ignored) {}
        throw $e;
    }
    return ['id' => $id, 'reference' => storageReference($id), 'object_key' => $key, 'name' => $name, 'mime_type' => $mime, 'size' => $size, 'sha256' => $sha256];
}

function storageDeleteObjectKey(?string $objectKey): void
{
    $objectKey = trim((string)$objectKey);
    if ($objectKey === '' || str_contains($objectKey, '..')) return;
    try { storageClient()->deleteObject(['Bucket'=>storageConfig()['bucket'], 'Key'=>$objectKey]); } catch (Throwable $ignored) {}
}

function storageObjectById(PDO $db, string $id): ?array
{
    $stmt = $db->prepare('SELECT * FROM storage_objects WHERE storage_id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function storageCurrentUser(PDO $db): ?array
{
    if (empty($_SESSION['user_id'])) return null;
    $stmt = $db->prepare('SELECT user_id, username, role_id, status FROM users WHERE user_id = :id LIMIT 1');
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user && ($user['status'] ?? 'active') === 'active' ? $user : null;
}

function storageCanAccess(PDO $db, array $object, array $user): bool
{
    $roleId = (int)($user['role_id'] ?? 0);
    $username = (string)($user['username'] ?? '');
    if ($roleId === 1) return true;
    if (($object['access_scope'] ?? '') === 'authenticated') return true;
    if (in_array($object['owner_type'], ['student', 'faculty'], true) && hash_equals((string)$object['owner_id'], $username)) return true;

    if (($object['access_scope'] ?? '') === 'student_advisor_admin' && $roleId === 2) {
        $stmt = $db->prepare('SELECT 1 FROM student_advisor_mapping WHERE student_id = :sid AND faculty_id = :fid LIMIT 1');
        $stmt->execute([':sid' => $object['owner_id'], ':fid' => $username]);
        return (bool)$stmt->fetchColumn();
    }
    if (($object['access_scope'] ?? '') === 'project_member_admin' && $roleId === 2) {
        if (hash_equals((string)$object['owner_id'], $username)) return true;
        $stmt = $db->prepare('SELECT 1 FROM project_faculty_members WHERE project_id=:project_id AND faculty_id=:faculty_id LIMIT 1');
        $stmt->execute([':project_id'=>$object['resource_id'], ':faculty_id'=>$username]);
        return (bool)$stmt->fetchColumn();
    }
    return false;
}

function storageFileUrl(?string $reference, string $disposition = 'inline'): ?string
{
    $reference = trim((string)$reference);
    if ($reference === '') return null;
    if (preg_match('/^https:\/\//i', $reference)) return $reference;
    $id = storageReferenceId($reference);
    if ($id === null) return null;
    return 'index.php?page=file-access&id=' . rawurlencode($id) . '&disposition=' . ($disposition === 'attachment' ? 'attachment' : 'inline');
}

function storageDescriptor(PDO $db, ?string $reference, ?string $fallbackName = null): array
{
    $reference = trim((string)$reference);
    if (preg_match('/^https:\/\//i', $reference)) {
        return ['id' => null, 'name' => $fallbackName, 'mime_type' => 'text/uri-list', 'size' => null, 'url' => $reference, 'available' => true, 'external' => true];
    }
    $id = storageReferenceId($reference);
    $row = $id ? storageObjectById($db, $id) : null;
    return [
        'id' => $id, 'name' => $row['original_name'] ?? $fallbackName, 'mime_type' => $row['mime_type'] ?? null,
        'size' => isset($row['size_bytes']) ? (int)$row['size_bytes'] : null,
        'url' => $row && $row['status'] === 'active' ? storageFileUrl($reference) : null,
        'available' => (bool)($row && $row['status'] === 'active'), 'external' => false,
    ];
}

function storageDeleteReference(PDO $db, ?string $reference): void
{
    $id = storageReferenceId($reference);
    if (!$id) return;
    $object = storageObjectById($db, $id);
    if (!$object || $object['status'] === 'deleted') return;
    $db->prepare("UPDATE storage_objects SET status='pending_delete' WHERE storage_id=:id")->execute([':id' => $id]);
    try {
        storageClient()->deleteObject(['Bucket' => storageConfig()['bucket'], 'Key' => $object['object_key']]);
        $db->prepare("UPDATE storage_objects SET status='deleted', deleted_at=NOW() WHERE storage_id=:id")->execute([':id' => $id]);
    } catch (Throwable $e) {
        error_log('Object Storage delete pending for ' . $id . ': ' . $e->getMessage());
    }
}

function storageLegacyAbsolutePath(?string $legacyPath): ?string
{
    $normalized = ltrim(str_replace('\\', '/', trim((string)$legacyPath)), '/');
    if ($normalized === '' || str_contains($normalized, '..') || !str_starts_with($normalized, 'uploads/')) return null;
    $root = realpath(__DIR__ . '/../uploads');
    if (!$root) return null;
    $candidate = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, substr($normalized, strlen('uploads/')));
    $real = realpath($candidate);
    return $real && str_starts_with($real, $root . DIRECTORY_SEPARATOR) && is_file($real) ? $real : null;
}

function storageLegacyFallbackAllowed(array $object): bool
{
    if (!storageConfig()['legacy_fallback'] || empty($object['migrated_at'])) return false;
    $migratedAt = strtotime((string)$object['migrated_at']);
    return $migratedAt !== false && $migratedAt >= time() - (30 * 86400);
}
