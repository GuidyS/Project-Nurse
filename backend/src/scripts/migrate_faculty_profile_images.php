<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/storage.php';
require_once __DIR__ . '/../components/ProfilePage/faculty_profile_helpers.php';

$apply = in_array('--apply', $argv, true);
$cleanupLocalCache = in_array('--cleanup-local-cache', $argv, true);
$limit = null;
foreach ($argv as $argument) {
    if (str_starts_with($argument, '--limit=')) {
        $limit = filter_var(substr($argument, 8), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($limit === false) {
            fwrite(STDERR, "--limit must be a positive integer.\n");
            exit(2);
        }
    }
}

$db = new Connect();
$stats = [
    'candidate' => 0,
    'migrated' => 0,
    'skipped' => 0,
    'rate_limited' => 0,
    'invalid' => 0,
    'cleaned' => 0,
    'errors' => 0,
];

function profileMigrationOutput(array $stats, bool $apply, string $mode): void
{
    echo json_encode([
        'mode' => $mode,
        'apply' => $apply,
        'summary' => $stats,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
}

/**
 * Download at most the configured image limit. HTTP 429 is retried with
 * truncated exponential backoff and jitter. No URL or person identifier is logged.
 */
function downloadDriveProfileImage(string $driveId): array
{
    if (!function_exists('curl_init')) {
        return ['status' => 'error'];
    }

    $urls = [
        'https://drive.google.com/uc?export=download&id=' . rawurlencode($driveId),
        'https://drive.google.com/thumbnail?id=' . rawurlencode($driveId) . '&sz=w256',
    ];
    $sawRateLimit = false;

    foreach ($urls as $url) {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $bytes = '';
            $tooLarge = false;
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_USERAGENT => 'Nurse-MIS-Profile-Migration/1.0',
                CURLOPT_HTTPHEADER => ['Accept: image/jpeg,image/png,image/webp,image/*;q=0.8'],
                CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$bytes, &$tooLarge): int {
                    if (strlen($bytes) + strlen($chunk) > FACULTY_PROFILE_IMAGE_MAX_BYTES) {
                        $tooLarge = true;
                        return 0;
                    }
                    $bytes .= $chunk;
                    return strlen($chunk);
                },
            ]);

            $ok = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            $curlError = curl_errno($ch);
            curl_close($ch);

            if ($httpCode === 429) {
                $sawRateLimit = true;
                if ($attempt < 4) {
                    $seconds = min(16, 2 ** $attempt);
                    usleep(($seconds * 1_000_000) + random_int(0, 500_000));
                }
                continue;
            }

            if ($tooLarge) {
                return ['status' => 'invalid'];
            }
            if ($ok !== false && $curlError === 0 && $httpCode >= 200 && $httpCode < 300 && $bytes !== '') {
                return ['status' => 'ok', 'bytes' => $bytes, 'content_type' => $contentType];
            }
            break;
        }
    }

    return ['status' => $sawRateLimit ? 'rate_limited' : 'error'];
}

function validateDownloadedProfileImage(string $bytes, string $contentType): ?array
{
    $mime = detectProfileImageMime($bytes, $contentType);
    $imageInfo = @getimagesizefromstring($bytes);
    if ($mime === null || !is_array($imageInfo)) {
        return null;
    }
    $width = (int)($imageInfo[0] ?? 0);
    $height = (int)($imageInfo[1] ?? 0);
    if ($width <= 0 || $height <= 0 || $width > 4096 || $height > 4096) {
        return null;
    }
    return ['mime' => $mime, 'extension' => FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS[$mime]];
}

function cleanupLegacyProfileCache(PDO $db, bool $apply, array &$stats): void
{
    $root = realpath(__DIR__ . '/../uploads/user-documents');
    if ($root === false) {
        return;
    }

    $rows = $db->query("SELECT f.faculty_id, f.profile_picture
        FROM faculty f
        INNER JOIN storage_objects so
          ON BINARY so.storage_id = BINARY REPLACE(f.profile_picture, 'storage://', '')
         AND so.status = 'active'
         AND so.resource_type = 'faculty_profile_picture'
        WHERE f.profile_picture LIKE 'storage://%'")
        ->fetchAll(PDO::FETCH_ASSOC);
    $eligibleDirectories = [];
    foreach ($rows as $row) {
        if (!storageReferenceId((string)$row['profile_picture'])) {
            continue;
        }
        $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', (string)$row['faculty_id']);
        if ($safeOwner !== '') {
            $eligibleDirectories[$safeOwner] = true;
        }
    }

    foreach (array_keys($eligibleDirectories) as $safeOwner) {
        $directory = realpath($root . DIRECTORY_SEPARATOR . $safeOwner);
        if ($directory === false || !str_starts_with($directory, $root . DIRECTORY_SEPARATOR)) {
            continue;
        }
        foreach (glob($directory . DIRECTORY_SEPARATOR . 'profile_picture_*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [] as $path) {
            $realPath = realpath($path);
            if ($realPath === false || !str_starts_with($realPath, $directory . DIRECTORY_SEPARATOR) || !is_file($realPath)) {
                continue;
            }
            $stats['candidate']++;
            if (!$apply) {
                continue;
            }
            if (@unlink($realPath)) {
                $stats['cleaned']++;
            } else {
                $stats['errors']++;
            }
        }
    }
}

if ($cleanupLocalCache) {
    cleanupLegacyProfileCache($db, $apply, $stats);
    profileMigrationOutput($stats, $apply, 'cleanup-local-cache');
    exit($stats['errors'] > 0 ? 1 : 0);
}

$sql = "SELECT faculty_id, profile_picture
        FROM faculty
        WHERE profile_picture IS NOT NULL
          AND profile_picture <> ''
          AND (profile_picture LIKE '%drive.google.com%' OR profile_picture LIKE '%docs.google.com%')
        ORDER BY faculty_id";
if ($limit !== null) {
    $sql .= ' LIMIT ' . (int)$limit;
}

foreach ($db->query($sql)->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $stats['candidate']++;
    if (!$apply) {
        continue;
    }

    $oldReference = (string)$row['profile_picture'];
    $driveId = extractGoogleDriveId($oldReference);
    if ($driveId === null) {
        $stats['skipped']++;
        continue;
    }

    $download = downloadDriveProfileImage($driveId);
    if ($download['status'] === 'rate_limited') {
        $stats['rate_limited']++;
        continue;
    }
    if ($download['status'] === 'invalid') {
        $stats['invalid']++;
        continue;
    }
    if ($download['status'] !== 'ok') {
        $stats['errors']++;
        continue;
    }

    $validImage = validateDownloadedProfileImage((string)$download['bytes'], (string)($download['content_type'] ?? ''));
    if ($validImage === null) {
        $stats['invalid']++;
        continue;
    }

    $tempPath = tempnam(sys_get_temp_dir(), 'nurse-profile-');
    $stored = null;
    try {
        if ($tempPath === false || file_put_contents($tempPath, $download['bytes'], LOCK_EX) === false) {
            throw new RuntimeException('Temporary file could not be created.');
        }
        $file = [
            'name' => 'profile-picture.' . $validImage['extension'],
            'type' => $validImage['mime'],
            'tmp_name' => $tempPath,
            'error' => UPLOAD_ERR_OK,
            'size' => filesize($tempPath),
        ];

        $db->beginTransaction();
        $stored = storagePutUploadedFile($db, $file, [
            'owner_type' => 'faculty',
            'owner_id' => (string)$row['faculty_id'],
            'resource_type' => 'faculty_profile_picture',
            'resource_id' => (string)$row['faculty_id'],
            'access_scope' => 'faculty_profile_directory',
            'mime_type' => $validImage['mime'],
            'allow_local_source' => true,
        ]);
        $update = $db->prepare('UPDATE faculty SET profile_picture = :new_reference WHERE faculty_id = :faculty_id AND profile_picture = :old_reference');
        $update->execute([
            ':new_reference' => $stored['reference'],
            ':faculty_id' => $row['faculty_id'],
            ':old_reference' => $oldReference,
        ]);
        if ($update->rowCount() !== 1) {
            throw new RuntimeException('Profile changed during migration.');
        }
        $db->commit();
        $stats['migrated']++;
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        if (is_array($stored) && !empty($stored['object_key'])) {
            storageDeleteObjectKey((string)$stored['object_key']);
        }
        $stats['errors']++;
    } finally {
        if (is_string($tempPath) && is_file($tempPath)) {
            @unlink($tempPath);
        }
    }
}

profileMigrationOutput($stats, $apply, 'google-drive-profile-migration');
exit($stats['errors'] > 0 ? 1 : 0);
