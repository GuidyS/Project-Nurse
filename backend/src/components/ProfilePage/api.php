<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

$id = $_SESSION['user_id'];
$db = new Connect;

/**
 * Expand stored faculty file values (plain path, Drive URL, or JSON array of paths).
 */
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

/**
 * Build a browser-openable URL from DB-stored faculty document paths.
 */
function resolveFacultyFileUrl(string $rawPath, bool $preferDirectImage = false): array
{
    $path = trim($rawPath);
    $driveId = extractGoogleDriveId($path);

    if ($driveId) {
        $viewUrl = 'https://drive.google.com/file/d/' . $driveId . '/view';
        $directUrl = 'https://drive.google.com/uc?export=view&id=' . $driveId;
        return [
            'file_path' => $path,
            'file_url' => $preferDirectImage ? $directUrl : $viewUrl,
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

    // Do not invent a clickable localhost URL for missing files (causes Apache 404)
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
        // teaching_degree_file moved to degree.file_path
    ];
}

/**
 * Append degree credential PDFs from degree.file_path for this faculty.
 */
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

try {
    $method = $_SERVER['REQUEST_METHOD'];

    // 🔍 [GET] ดึงข้อมูลมาโชว์ที่หน้า Profile
    if ($method === 'GET') {
        $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $u_info = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$u_info) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบผู้ใช้"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ((int)$u_info['role_id'] === 3) {
            $stmt = $db->prepare("SELECT * FROM student WHERE student_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            $docStmt = $db->prepare("
                SELECT title, type, file_name, file_path, mime_type
                FROM portfolio
                WHERE student_id = :id
                  AND (
                    mime_type = 'application/pdf'
                    OR mime_type LIKE 'image/%'
                    OR LOWER(file_name) LIKE '%.pdf'
                    OR LOWER(file_name) LIKE '%.jpg'
                    OR LOWER(file_name) LIKE '%.jpeg'
                    OR LOWER(file_name) LIKE '%.png'
                    OR LOWER(file_path) LIKE '%.pdf'
                    OR LOWER(file_path) LIKE '%.jpg'
                    OR LOWER(file_path) LIKE '%.jpeg'
                    OR LOWER(file_path) LIKE '%.png'
                  )
                ORDER BY created_at DESC
            ");
            $docStmt->execute(['id' => $u_info['username']]);
            $portfolioDocs = $docStmt->fetchAll(PDO::FETCH_ASSOC);
            $profile['pdf_documents'] = array_map(static function (array $doc) {
                $path = (string)($doc['file_path'] ?? '');
                $mime = (string)($doc['mime_type'] ?? '');
                $kind = str_starts_with($mime, 'image/') ? 'image' : (str_contains($mime, 'pdf') || str_ends_with(strtolower($path), '.pdf') ? 'pdf' : 'file');
                return [
                    'title' => $doc['title'] ?: 'เอกสารใน Portfolio',
                    'type' => $doc['type'] ?? 'document',
                    'kind' => $kind,
                    'file_name' => $doc['file_name'] ?? basename($path),
                    'file_path' => $path,
                    'file_url' => $path,
                    'source' => 'local',
                    'available' => $path !== '',
                ];
            }, $portfolioDocs);

            echo json_encode(["status" => "success", "role" => "student", "data" => $profile], JSON_UNESCAPED_UNICODE);
        } else {
            $stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            $profile['pdf_documents'] = buildFacultyDocuments($db, $profile);

            // Resolve profile picture for avatar display
            if (!empty($profile['profile_picture']) && !isLegacyExcelImagePath((string)$profile['profile_picture'])) {
                $picture = resolveFacultyFileUrl((string)$profile['profile_picture'], true);
                $profile['profile_picture_url'] = $picture['available'] ? $picture['file_url'] : null;
            } else {
                $profile['profile_picture_url'] = null;
            }

            echo json_encode(["status" => "success", "role" => "teacher", "data" => $profile], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    // 📝 [POST] อัปเดตข้อมูลของตัวเองผ่านหน้า Profile
    if ($method === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $u_info = $stmt->fetch(PDO::FETCH_ASSOC);

        if ((int)$u_info['role_id'] === 3) {
            $sql = "UPDATE student SET first_name_en = ?, last_name_en = ?, gender = ?, birth_date = ?, email = ?, phone = ?, home_phone = ?, home_address = ?, hometown_province = ?, health_conditions = ?, vaccine_history = ? WHERE student_id = ?";
            $db->prepare($sql)->execute([$input['first_name_en']??null, $input['last_name_en']??null, $input['gender']??null, $input['birth_date']??null, $input['email']??null, $input['phone']??null, $input['home_phone']??null, $input['home_address']??null, $input['hometown_province']??null, $input['health_conditions']??null, $input['vaccine_history']??null, $u_info['username']]);
        } else {
            $sql = "UPDATE faculty SET first_name_en = ?, last_name_en = ?, gender = ?, birth_date = ?, email = ?, phone = ?, current_address = ?, nursing_council_no = ? WHERE faculty_id = ?";
            $db->prepare($sql)->execute([$input['first_name_en']??null, $input['last_name_en']??null, $input['gender']??null, $input['birth_date']??null, $input['email']??null, $input['phone']??null, $input['current_address']??null, $input['nursing_council_no']??null, $u_info['username']]);
        }
        echo json_encode(["status" => "success"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
