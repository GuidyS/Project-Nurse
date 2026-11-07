<?php
require_once __DIR__ . '/../../config/storage.php';
/**
 * ฟังก์ชันช่วยเหลือเกี่ยวกับไฟล์และเอกสารของอาจารย์
 *
 * แยกออกมาจาก get_profile.php เพื่อให้หน้า "บุคลากรภายในคณะ" ของคณบดี
 * เรียกใช้ตัวเดียวกันได้ ข้อมูลที่แสดงจะได้ตรงกับหน้า "ข้อมูลส่วนตัว" เป๊ะ ๆ
 * ไม่ต้องเขียนตรรกะซ้ำแล้วเพี้ยนกันทีหลัง
 *
 * ต้อง require config.php มาก่อนไฟล์นี้ (ใช้คลาส Connect)
 */

const FACULTY_PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

function normalizeStoredFilePaths($value): array
{
    if ($value === null) {
        return [];
    }

    if (is_array($value)) {
        return array_values(array_filter(array_map('strval', $value), static fn($path) => trim($path) !== ''));
    }

    $raw = trim((string)$value);
    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return array_values(array_filter($decoded, static fn($path) => is_string($path) && trim($path) !== ''));
    }

    return [$raw];
}

function extractGoogleDriveId(string $value): ?string
{
    if (preg_match('~drive\.google\.com/file/d/([a-zA-Z0-9_-]+)~', $value, $m)) {
        return $m[1];
    }
    if (preg_match('~[?&]id=([a-zA-Z0-9_-]+)~', $value, $m)) {
        return $m[1];
    }
    return null;
}

function facultyProfilePictureCachePaths(string $facultyId, string $driveId): array
{
    $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', $facultyId);
    $relativeDir = 'uploads/user-documents/' . $safeOwner;
    $absoluteDir = __DIR__ . '/../../' . $relativeDir;
    $hash = substr(hash('sha256', $driveId), 0, 16);

    return [
        'relative_dir' => $relativeDir,
        'absolute_dir' => $absoluteDir,
        'file_prefix' => 'profile_picture_' . $hash,
    ];
}

function findCachedFacultyProfilePicture(string $facultyId, string $driveId): ?string
{
    $paths = facultyProfilePictureCachePaths($facultyId, $driveId);
    foreach (array_values(FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS) as $ext) {
        $fileName = $paths['file_prefix'] . '.' . $ext;
        $absolutePath = $paths['absolute_dir'] . DIRECTORY_SEPARATOR . $fileName;
        if (is_file($absolutePath) && filesize($absolutePath) > 0) {
            return $paths['relative_dir'] . '/' . $fileName;
        }
    }

    return null;
}

function fetchRemoteBytesLimited(string $url, int $maxBytes): ?array
{
    if (function_exists('curl_init')) {
        $bytes = '';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_USERAGENT => 'Nurse-MIS/1.0',
            CURLOPT_HTTPHEADER => ['Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8'],
            CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk) use (&$bytes, $maxBytes): int {
                if (strlen($bytes) + strlen($chunk) > $maxBytes) {
                    return 0;
                }
                $bytes .= $chunk;
                return strlen($chunk);
            },
        ]);

        $ok = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $errorNo = curl_errno($ch);
        curl_close($ch);

        if ($ok === false || $errorNo !== 0 || $httpCode < 200 || $httpCode >= 300 || $bytes === '') {
            return null;
        }

        return ['bytes' => $bytes, 'content_type' => $contentType];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'follow_location' => 1,
            'max_redirects' => 5,
            'timeout' => 12,
            'ignore_errors' => true,
            'header' => "User-Agent: Nurse-MIS/1.0\r\nAccept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8\r\n",
        ],
    ]);
    $handle = @fopen($url, 'rb', false, $context);
    if (!$handle) {
        return null;
    }

    $bytes = stream_get_contents($handle, $maxBytes + 1);
    fclose($handle);
    if (!is_string($bytes) || $bytes === '' || strlen($bytes) > $maxBytes) {
        return null;
    }

    $headers = $http_response_header ?? [];
    $httpCode = 0;
    $contentType = '';
    foreach ($headers as $header) {
        if (preg_match('~^HTTP/\S+\s+(\d{3})~i', $header, $m)) {
            $httpCode = (int)$m[1];
        } elseif (stripos($header, 'Content-Type:') === 0) {
            $contentType = trim(substr($header, 13));
        }
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        return null;
    }

    return ['bytes' => $bytes, 'content_type' => $contentType];
}

function detectProfileImageMime(string $bytes, string $reportedContentType = ''): ?string
{
    $mime = null;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_buffer($finfo, $bytes);
            finfo_close($finfo);
            $mime = is_string($detected) ? strtolower($detected) : null;
        }
    }

    if (!$mime && function_exists('getimagesizefromstring')) {
        $imageInfo = @getimagesizefromstring($bytes);
        $mime = is_array($imageInfo) && isset($imageInfo['mime']) ? strtolower((string)$imageInfo['mime']) : null;
    }

    if ($mime && array_key_exists($mime, FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS)) {
        return $mime;
    }

    $reportedMime = strtolower(trim(explode(';', $reportedContentType)[0]));
    return array_key_exists($reportedMime, FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS) ? $reportedMime : null;
}

function cacheGoogleDriveProfilePicture(string $facultyId, string $driveId): ?string
{
    if ($facultyId === '') {
        return null;
    }

    $cached = findCachedFacultyProfilePicture($facultyId, $driveId);
    if ($cached !== null) {
        return $cached;
    }

    $paths = facultyProfilePictureCachePaths($facultyId, $driveId);
    if (!is_dir($paths['absolute_dir']) && !mkdir($paths['absolute_dir'], 0775, true)) {
        return null;
    }

    $urls = [
        'https://drive.google.com/thumbnail?id=' . rawurlencode($driveId) . '&sz=w256',
        'https://drive.google.com/uc?export=download&id=' . rawurlencode($driveId),
    ];

    foreach ($urls as $url) {
        $response = fetchRemoteBytesLimited($url, FACULTY_PROFILE_IMAGE_MAX_BYTES);
        if (!$response) {
            continue;
        }

        $mime = detectProfileImageMime($response['bytes'], (string)($response['content_type'] ?? ''));
        if ($mime === null) {
            continue;
        }

        $extension = FACULTY_PROFILE_IMAGE_MIME_EXTENSIONS[$mime];
        $fileName = $paths['file_prefix'] . '.' . $extension;
        $absolutePath = $paths['absolute_dir'] . DIRECTORY_SEPARATOR . $fileName;
        $tempPath = $absolutePath . '.tmp';

        if (file_put_contents($tempPath, $response['bytes'], LOCK_EX) === false) {
            @unlink($tempPath);
            continue;
        }
        if (!rename($tempPath, $absolutePath)) {
            @unlink($tempPath);
            continue;
        }
        @chmod($absolutePath, 0664);

        $currentBaseName = basename($absolutePath);
        foreach (glob($paths['absolute_dir'] . DIRECTORY_SEPARATOR . 'profile_picture_*') ?: [] as $oldPath) {
            if (basename($oldPath) !== $currentBaseName && is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        return $paths['relative_dir'] . '/' . $fileName;
    }

    return null;
}

function resolveFacultyProfilePictureUrl(string $rawPath, string $facultyId): ?string
{
    $path = trim($rawPath);
    if ($path === '' || isLegacyExcelImagePath($path)) {
        return null;
    }

    $driveId = extractGoogleDriveId($path);
    if ($driveId) {
        return 'https://drive.google.com/thumbnail?id=' . rawurlencode($driveId) . '&sz=w256';
    }

    $picture = resolveFacultyFileUrl($path, true);
    return $picture['available'] ? $picture['file_url'] : null;
}

/**
 * Build a browser-openable URL from DB-stored faculty document paths.
 */
function resolveFacultyFileUrl(string $rawPath, bool $preferDirectImage = false): array
{
    $path = trim($rawPath);
    $storageId = storageReferenceId($path);
    if ($storageId) {
        static $storageDb = null;
        $storageDb = $storageDb instanceof PDO ? $storageDb : new Connect();
        $file = storageDescriptor($storageDb, $path);
        return [
            'file_path' => $path,
            'file_url' => $file['url'],
            'source' => 'object_storage',
            'available' => $file['available'],
        ];
    }
    $driveId = extractGoogleDriveId($path);

    if ($driveId) {
        $viewUrl = 'https://drive.google.com/file/d/' . $driveId . '/view';
        $thumbnailUrl = 'https://drive.google.com/thumbnail?id=' . $driveId . '&sz=w256';
        return [
            'file_path' => $path,
            'file_url' => $preferDirectImage ? $thumbnailUrl : $viewUrl,
            'source' => 'google_drive',
            'available' => true,
        ];
    }

    if (preg_match('~^https?://~i', $path)) {
        return [
            'file_path' => $path,
            'file_url' => $path,
            'source' => 'external',
            'available' => true,
        ];
    }

    $webRoot = realpath(__DIR__ . '/../../') ?: (__DIR__ . '/../../');
    $normalizedRelative = ltrim(str_replace('\\', '/', $path), '/');
    $baseName = basename($normalizedRelative);

    // Accepted physical locations (Apache serves /var/www/html/*)
    $localCandidates = [
        $normalizedRelative,
        'uploads/' . $normalizedRelative,
        'uploads/faculty-documents/' . $baseName,
        'uploads/user-documents/' . $normalizedRelative,
    ];

    foreach ($localCandidates as $relative) {
        $absolute = $webRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (is_file($absolute)) {
            $publicPath = str_replace('\\', '/', $relative);
            return [
                'file_path' => $publicPath,
                'file_url' => $publicPath,
                'source' => 'local',
                'available' => true,
            ];
        }
    }

    return [
        'file_path' => $normalizedRelative,
        'file_url' => null,
        'source' => 'missing',
        'available' => false,
    ];
}

function detectFileKind(string $pathOrUrl): string
{
    $path = parse_url($pathOrUrl, PHP_URL_PATH) ?: $pathOrUrl;
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'], true)) {
        return 'image';
    }
    if ($ext === 'pdf') {
        return 'pdf';
    }
    if (extractGoogleDriveId($pathOrUrl)) {
        return 'drive';
    }
    return 'file';
}

function isLegacyExcelImagePath(string $path): bool
{
    $normalized = str_replace('\\', '/', $path);
    return str_contains($normalized, 'test_Images') || str_contains($normalized, 'ข้อมูลบุคลากร');
}

function isStoredDocumentReference(string $value): bool
{
    $trimmed = trim($value);
    if ($trimmed === '') {
        return false;
    }
    if (preg_match('~^https?://~i', $trimmed) || extractGoogleDriveId($trimmed)) {
        return true;
    }

    $normalized = ltrim(str_replace('\\', '/', $trimmed), '/');
    return str_starts_with($normalized, 'uploads/');
}

function shouldExposeFacultyDocument(string $rawPath, array $resolved): bool
{
    if (isLegacyExcelImagePath($rawPath) || isLegacyExcelImagePath((string)($resolved['file_path'] ?? ''))) {
        return false;
    }

    if (in_array($resolved['source'], ['google_drive', 'external'], true)) {
        return true;
    }

    $path = ltrim(str_replace('\\', '/', $resolved['file_path'] ?: $rawPath), '/');
    if (str_starts_with($path, 'uploads/user-documents/')) {
        return true;
    }

    return $resolved['available'] && detectFileKind($resolved['file_path'] ?: $rawPath) === 'pdf';
}

function facultyDocumentFieldLabels(): array
{
    return [
        'description' => 'ประวัติ/Resume (PDF)',
        'nursing_council_file' => 'สำเนาบัตรสมาชิกสภาการพยาบาล',
        'license_file' => 'สำเนาใบอนุญาตประกอบวิชาชีพ',
        'teaching_cert_file' => 'เอกสารรับรองหลักสูตรการสอนทางพยาบาล',
    ];
}

function appendDegreeDocuments(Connect $db, array $documents, string $facultyId): array
{
    if ($facultyId === '') {
        return $documents;
    }

    $seen = [];
    foreach ($documents as $doc) {
        $key = basename((string)($doc['file_path'] ?? $doc['file_name'] ?? ''));
        if ($key !== '') {
            $seen[$key] = true;
        }
    }

    try {
        $stmt = $db->prepare("
            SELECT degree_id, degree_level, field_group, degree_name_th, file_path
            FROM degree
            WHERE faculty_id = :fid
              AND file_path IS NOT NULL
              AND TRIM(file_path) <> ''
            ORDER BY
              CASE
                WHEN degree_level = 'Doctoral' AND field_group = 'nursing' THEN 1
                WHEN degree_level = 'Doctoral' THEN 2
                WHEN degree_level = 'Master' AND field_group = 'nursing' THEN 3
                WHEN degree_level = 'Master' THEN 4
                ELSE 5
              END,
              degree_id
        ");
        $stmt->execute([':fid' => $facultyId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (Throwable $e) {
        return $documents;
    }

    $docIndex = 0;
    $baseTitle = 'ใบคุณวุฒิการศึกษา';
    foreach ($rows as $row) {
        foreach (normalizeStoredFilePaths($row['file_path'] ?? null) as $rawPath) {
            if (!isStoredDocumentReference($rawPath)) {
                continue;
            }
            $resolved = resolveFacultyFileUrl($rawPath);
            if (!shouldExposeFacultyDocument($rawPath, $resolved)) {
                continue;
            }

            $fileName = basename(parse_url($resolved['file_path'] ?: $rawPath, PHP_URL_PATH) ?: ($resolved['file_path'] ?: $rawPath));
            if ($fileName !== '' && isset($seen[$fileName])) {
                continue;
            }
            if ($fileName !== '') {
                $seen[$fileName] = true;
            }

            $docIndex++;
            $documents[] = [
                'title' => $docIndex === 1 ? $baseTitle : ($baseTitle . ' #' . $docIndex),
                'type' => 'teaching_degree_file',
                'kind' => detectFileKind($resolved['file_path'] ?: $rawPath),
                'file_name' => $fileName !== '' ? $fileName : $baseTitle,
                'file_path' => $resolved['file_path'],
                'file_url' => $resolved['file_url'],
                'source' => $resolved['source'],
                'available' => (bool)$resolved['available'],
                'degree_id' => (int)($row['degree_id'] ?? 0),
                'degree_level' => $row['degree_level'] ?? null,
                'field_group' => $row['field_group'] ?? null,
            ];
        }
    }

    return $documents;
}

function appendUploadedDocumentsFromDisk(array $documents, string $facultyId): array
{
    $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', $facultyId);
    $uploadDir = realpath(__DIR__ . '/../../uploads/user-documents/' . $safeOwner);
    if ($uploadDir === false || !is_dir($uploadDir)) {
        return $documents;
    }

    $seen = [];
    foreach ($documents as $doc) {
        $key = basename((string)($doc['file_path'] ?? $doc['file_name'] ?? ''));
        if ($key !== '') {
            $seen[$key] = true;
        }
    }

    $labels = array_merge(facultyDocumentFieldLabels(), [
        'teaching_degree_file' => 'ใบคุณวุฒิการศึกษา',
    ]);
    $fieldCounts = [];

    foreach (glob($uploadDir . DIRECTORY_SEPARATOR . '*.pdf') ?: [] as $absolutePath) {
        $fileName = basename($absolutePath);
        if (isset($seen[$fileName])) {
            continue;
        }

        $field = 'document';
        $title = 'เอกสารที่อัปโหลด';
        foreach ($labels as $fieldName => $label) {
            if ($fieldName === 'description') {
                continue;
            }
            if (str_starts_with($fileName, $fieldName . '_')) {
                $field = $fieldName;
                $title = $label;
                break;
            }
        }

        $fieldCounts[$field] = ($fieldCounts[$field] ?? 0) + 1;
        $publicPath = 'uploads/user-documents/' . $safeOwner . '/' . $fileName;

        $documents[] = [
            'title' => $fieldCounts[$field] === 1 ? $title : ($title . ' #' . $fieldCounts[$field]),
            'type' => $field,
            'kind' => 'pdf',
            'file_name' => $fileName,
            'file_path' => $publicPath,
            'file_url' => $publicPath,
            'source' => 'local',
            'available' => true,
        ];
        $seen[$fileName] = true;
    }

    return $documents;
}

function buildFacultyDocuments(Connect $db, array $profile): array
{
    $facultyDocs = facultyDocumentFieldLabels();
    $documents = [];

    foreach ($facultyDocs as $field => $title) {
        foreach (normalizeStoredFilePaths($profile[$field] ?? null) as $index => $rawPath) {
            if (!isStoredDocumentReference($rawPath)) {
                continue;
            }

            $resolved = resolveFacultyFileUrl($rawPath);
            if (!shouldExposeFacultyDocument($rawPath, $resolved)) {
                continue;
            }

            $kind = detectFileKind($resolved['file_path'] ?: $rawPath);
            if ($field === 'description' && in_array($kind, ['drive', 'file'], true)) {
                $kind = 'pdf';
            }

            $fileName = basename(parse_url($resolved['file_path'] ?: $rawPath, PHP_URL_PATH) ?: ($resolved['file_path'] ?: $rawPath));

            $documents[] = [
                'title' => $index === 0 ? $title : ($title . ' #' . ($index + 1)),
                'type' => $field,
                'kind' => $kind,
                'file_name' => $fileName !== '' ? $fileName : $title,
                'file_path' => $resolved['file_path'],
                'file_url' => $resolved['file_url'],
                'source' => $resolved['source'],
                'available' => (bool)$resolved['available'],
            ];
        }
    }

    $facultyId = (string)($profile['faculty_id'] ?? '');
    if ($facultyId !== '') {
        $documents = appendDegreeDocuments($db, $documents, $facultyId);
        $documents = appendUploadedDocumentsFromDisk($documents, $facultyId);
    }

    return $documents;
}
