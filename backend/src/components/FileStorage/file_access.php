<?php

if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/storage.php';
require_once __DIR__ . '/../../config/audit_helper.php';

function fileAccessError(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

$id = strtolower(trim((string)($_GET['id'] ?? '')));
if (!preg_match('/^[0-9a-f-]{36}$/', $id)) fileAccessError(404, 'File not found');

$db = new Connect();
$user = storageCurrentUser($db);
if (!$user) fileAccessError(401, 'Unauthorized');
$object = storageObjectById($db, $id);
if (!$object || $object['status'] !== 'active') fileAccessError(404, 'File not found');
if (!storageCanAccess($db, $object, $user)) fileAccessError(403, 'Forbidden');

$requested = ($_GET['disposition'] ?? 'inline') === 'attachment' ? 'attachment' : 'inline';
$safeInline = in_array((string)$object['mime_type'], [
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
], true);
$disposition = $requested === 'inline' && $safeInline ? 'inline' : 'attachment';
$name = str_replace(["\r", "\n", '"'], '_', basename((string)$object['original_name']));

try {
    $result = storageClient()->getObject(['Bucket' => storageConfig()['bucket'], 'Key' => $object['object_key']]);
    header_remove('Content-Type');
    header('Content-Type: ' . $object['mime_type']);
    header('Content-Length: ' . (int)$object['size_bytes']);
    header('Content-Disposition: ' . $disposition . '; filename="' . $name . '"; filename*=UTF-8\'\'' . rawurlencode($name));
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: private, no-store');
    if ($disposition === 'inline') header("Content-Security-Policy: sandbox");
    $body = $result['Body'];
    while (!$body->eof()) echo $body->read(8192);
    exit;
} catch (Throwable $e) {
    $legacyFallbackAllowed = storageLegacyFallbackAllowed($object);
    $legacy = $legacyFallbackAllowed ? storageLegacyAbsolutePath($object['legacy_path'] ?? null) : null;
    if ($legacy) {
        error_log('Object Storage fallback used for ' . $id);
        logAudit($db, $user['user_id'] ?? null, 'read_fallback', 'storage_objects', 'ใช้ไฟล์สำรองระหว่างช่วงย้าย Object Storage (ID: ' . $id . ')');
        header_remove('Content-Type');
        header('Content-Type: ' . $object['mime_type']);
        header('Content-Length: ' . filesize($legacy));
        header('Content-Disposition: ' . $disposition . '; filename="' . $name . '"');
        header('X-Content-Type-Options: nosniff');
        readfile($legacy);
        exit;
    }
    if ($legacyFallbackAllowed && ($object['legacy_source'] ?? '') === 'blob' && $object['resource_type'] === 'portfolio') {
        $stmt = $db->prepare('SELECT file_data FROM portfolio WHERE portfolio_id = :id LIMIT 1');
        $stmt->execute([':id' => $object['resource_id']]);
        $blob = $stmt->fetchColumn();
        if ($blob !== false && $blob !== null) {
            logAudit($db, $user['user_id'] ?? null, 'read_fallback', 'storage_objects', 'ใช้ BLOB สำรองระหว่างช่วงย้าย Object Storage (ID: ' . $id . ')');
            header_remove('Content-Type');
            header('Content-Type: ' . $object['mime_type']);
            header('Content-Disposition: ' . $disposition . '; filename="' . $name . '"');
            header('X-Content-Type-Options: nosniff');
            echo $blob;
            exit;
        }
    }
    $storageMissing = $e instanceof Aws\S3\Exception\S3Exception
        && ($e->getStatusCode() === 404 || in_array($e->getAwsErrorCode(), ['NoSuchKey', 'NotFound'], true));
    if ($storageMissing) {
        $db->prepare("UPDATE storage_objects SET status='missing' WHERE storage_id=:id AND status='active'")
            ->execute([':id'=>$id]);
        fileAccessError(404, 'File not found');
    }
    fileAccessError(503, 'Object Storage is temporarily unavailable');
}
