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

// Helper คำนวณชั้นปีและปีการศึกษา Real-time ตัดรอบวันที่ 10 สิงหาคม (เฉพาะ Student)
function calculateRealtimeAcademicInfo($studentId, $entryYearCandidate = null): array {
    $now = new DateTime();
    $currentYearBE = (int)$now->format('Y') + 543;
    $cutOffDate = new DateTime($now->format('Y') . '-08-10 00:00:00');
    $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);
    
    $cleanId = trim((string)$studentId);
    $entryYear = 0;
    
    if (strlen($cleanId) >= 2 && is_numeric(substr($cleanId, 0, 2))) {
        $entryYear = 2500 + (int)substr($cleanId, 0, 2);
    } elseif (!empty($entryYearCandidate) && is_numeric($entryYearCandidate) && (int)$entryYearCandidate >= 2500) {
        $entryYear = (int)$entryYearCandidate;
    } else {
        $entryYear = $academicYear;
    }

    $yearLevel = $academicYear - $entryYear + 1;
    if ($yearLevel < 1) $yearLevel = 1;
    if ($yearLevel > 8) $yearLevel = 8;

    return [
        'academic_year' => $academicYear,
        'year_level'    => $yearLevel,
        'entry_year'    => $entryYear
    ];
}

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

        // ==========================================
        // เฉพาะ Role Student (role_id = 3)
        // ==========================================
        if ((int)$u_info['role_id'] === 3) {
            $stmt = $db->prepare("SELECT * FROM student WHERE student_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            // คำนวณปีการศึกษาและชั้นปี Real-time ตัดรอบ 10 สิงหาคม
            $academicInfo = calculateRealtimeAcademicInfo(
                $u_info['username'],
                $profile['admission_year'] ?? null
            );

            // บังคับอัปเดตข้อมูลปีและชั้นปีเป็นค่า Real-time
            $profile['admission_year'] = (string)$academicInfo['entry_year'];
            $profile['year_level']     = $academicInfo['year_level'];
            $profile['academic_year']  = $academicInfo['academic_year'];

            // แมปฟิลด์ที่อยู่และรหัสประจำตัวประชาชน
            $profile['id_card_number'] = $profile['id_card_number'] ?? null;
            $profile['parent_address'] = $profile['father_address'] ?? $profile['mother_address'] ?? null;
            $profile['home_address']   = $profile['home_address'] ?? $profile['address'] ?? null;

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
            // โค้ดเดิมของ Teacher / Other Roles ไม่แตะต้อง[cite: 15]
            $stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            $profile['pdf_documents'] = buildFacultyDocuments($db, $profile);

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
        $input = json_decode(file_get_contents("php://input"), true) ?: [];
        $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $u_info = $stmt->fetch(PDO::FETCH_ASSOC);

        // ==========================================
        // เฉพาะ Role Student (role_id = 3)
        // ==========================================
        if ((int)$u_info['role_id'] === 3) {
            $parentAddress = !empty($input['parent_address']) ? trim((string)$input['parent_address']) : (!empty($input['father_address']) ? trim((string)$input['father_address']) : null);
            
            // ดักจับและแปลงตัวเลขให้ถูกต้อง ป้องกัน Database Type Error
            $rawHeight = isset($input['height']) ? trim((string)$input['height']) : '';
            $height    = ($rawHeight !== '' && is_numeric($rawHeight)) ? floatval($rawHeight) : null;

            $rawWeight = isset($input['weight']) ? trim((string)$input['weight']) : '';
            $weight    = ($rawWeight !== '' && is_numeric($rawWeight)) ? floatval($rawWeight) : null;

            $rawGpa    = isset($input['gpa']) ? trim((string)$input['gpa']) : '';
            $gpa       = ($rawGpa !== '' && is_numeric($rawGpa)) ? floatval($rawGpa) : null;

            $bmi = null;
            if ($height && $weight && $height > 0) {
                $hMeter = $height / 100.0;
                $bmi = round($weight / ($hMeter * $hMeter), 1);
            }

            // กรองรหัสประจำตัวประชาชนให้เหลือเฉพาะตัวเลขความยาวสูงสุด 13 หลัก
            $rawIdCard = !empty($input['id_card_number']) ? trim((string)$input['id_card_number']) : '';
            $idCardNumber = $rawIdCard !== '' ? substr(preg_replace('/\D/', '', $rawIdCard), 0, 13) : null;
            if ($idCardNumber === '') {
                $idCardNumber = null;
            }

            $homeAddress = !empty($input['home_address']) ? trim((string)$input['home_address']) : (!empty($input['address']) ? trim((string)$input['address']) : null);

            // กรองเบอร์โทรศัพท์ให้เหลือเฉพาะตัวเลข
            $phone = !empty($input['phone']) ? substr(preg_replace('/\D/', '', (string)$input['phone']), 0, 15) : null;
            $fatherPhone = !empty($input['father_phone']) ? substr(preg_replace('/\D/', '', (string)$input['father_phone']), 0, 15) : null;
            $motherPhone = !empty($input['mother_phone']) ? substr(preg_replace('/\D/', '', (string)$input['mother_phone']), 0, 15) : null;

            $sql = "UPDATE student SET 
                        first_name_en = :first_name_en, 
                        last_name_en = :last_name_en, 
                        gender = :gender, 
                        birth_date = :birth_date, 
                        email = :email, 
                        phone = :phone, 
                        id_card_number = :id_card_number,
                        gpa = :gpa,
                        height = :height,
                        weight = :weight,
                        bmi = :bmi,
                        home_address = :home_address, 
                        father_first_name = :father_first_name,
                        father_last_name = :father_last_name,
                        father_phone = :father_phone,
                        father_address = :father_address,
                        mother_first_name = :mother_first_name,
                        mother_last_name = :mother_last_name,
                        mother_phone = :mother_phone,
                        mother_address = :mother_address
                    WHERE student_id = :student_id";
            
            $stmtUpdate = $db->prepare($sql);
            $stmtUpdate->execute([
                ':first_name_en'    => !empty($input['first_name_en']) ? trim((string)$input['first_name_en']) : null,
                ':last_name_en'     => !empty($input['last_name_en']) ? trim((string)$input['last_name_en']) : null,
                ':gender'           => !empty($input['gender']) ? trim((string)$input['gender']) : null,
                ':birth_date'       => !empty($input['birth_date']) ? trim((string)$input['birth_date']) : null,
                ':email'            => !empty($input['email']) ? trim((string)$input['email']) : null,
                ':phone'            => $phone,
                ':id_card_number'   => $idCardNumber,
                ':gpa'              => $gpa,
                ':height'           => $height,
                ':weight'           => $weight,
                ':bmi'              => $bmi,
                ':home_address'     => $homeAddress,
                ':father_first_name'=> !empty($input['father_first_name']) ? trim((string)$input['father_first_name']) : null,
                ':father_last_name' => !empty($input['father_last_name']) ? trim((string)$input['father_last_name']) : null,
                ':father_phone'     => $fatherPhone,
                ':father_address'   => $parentAddress,
                ':mother_first_name'=> !empty($input['mother_first_name']) ? trim((string)$input['mother_first_name']) : null,
                ':mother_last_name' => !empty($input['mother_last_name']) ? trim((string)$input['mother_last_name']) : null,
                ':mother_phone'     => $motherPhone,
                ':mother_address'   => $parentAddress,
                ':student_id'       => $u_info['username']
            ]);
        } else {
            // โค้ดเดิมของ Teacher / Other Roles ไม่แตะต้อง[cite: 15]
            $sql = "UPDATE faculty SET first_name_en = ?, last_name_en = ?, gender = ?, birth_date = ?, email = ?, phone = ?, current_address = ?, nursing_council_no = ? WHERE faculty_id = ?";
            $db->prepare($sql)->execute([
                $input['first_name_en'] ?? null,
                $input['last_name_en'] ?? null,
                $input['gender'] ?? null,
                $input['birth_date'] ?? null,
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['current_address'] ?? null,
                $input['nursing_council_no'] ?? null,
                $u_info['username']
            ]);
        }
        echo json_encode(["status" => "success"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}