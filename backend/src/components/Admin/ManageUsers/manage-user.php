<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = new Connect();
    $method = $_SERVER['REQUEST_METHOD'];

    if (!isset($_SESSION['user_id'])) throw new Exception("Unauthorized: กรุณาล็อกอินใหม่");

    function hasUploadedFileInput(string $fieldName): bool {
        if (!isset($_FILES[$fieldName])) {
            return false;
        }

        $fileInput = $_FILES[$fieldName];
        if (is_array($fileInput['name'])) {
            foreach ($fileInput['error'] as $error) {
                if ($error !== UPLOAD_ERR_NO_FILE) {
                    return true;
                }
            }
            return false;
        }

        return ($fileInput['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    }

    function savePdfUploads(string $fieldName, string $ownerCode): array {
        if (!isset($_FILES[$fieldName])) {
            return [];
        }

        $fileInput = $_FILES[$fieldName];
        $files = [];
        $isMultiple = is_array($fileInput['name']);

        if ($isMultiple) {
            foreach ($fileInput['name'] as $index => $name) {
                $files[] = [
                    'name' => $name,
                    'type' => $fileInput['type'][$index] ?? '',
                    'tmp_name' => $fileInput['tmp_name'][$index] ?? '',
                    'error' => $fileInput['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                    'size' => $fileInput['size'][$index] ?? 0,
                ];
            }
        } else {
            $files[] = $fileInput;
        }

        $savedPaths = [];
        $uploadErrors = [
            UPLOAD_ERR_INI_SIZE => "ไฟล์ใหญ่เกิน upload_max_filesize ของ PHP",
            UPLOAD_ERR_FORM_SIZE => "ไฟล์ใหญ่เกินขนาดที่ฟอร์มกำหนด",
            UPLOAD_ERR_PARTIAL => "ไฟล์อัปโหลดมาไม่ครบ",
            UPLOAD_ERR_NO_TMP_DIR => "ไม่พบ temporary upload directory",
            UPLOAD_ERR_CANT_WRITE => "ไม่สามารถเขียนไฟล์ลง disk ได้",
            UPLOAD_ERR_EXTENSION => "PHP extension หยุดการอัปโหลด",
        ];

        foreach ($files as $file) {
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            if ($file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception($uploadErrors[$file['error']] ?? "อัปโหลดไฟล์ไม่สำเร็จ: " . $fieldName);
            }

            if ($file['size'] > 50 * 1024 * 1024) {
                throw new Exception("ไฟล์ PDF ต้องมีขนาดไม่เกิน 50MB ต่อไฟล์");
            }

            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $mime = mime_content_type($file['tmp_name']);
            $allowedMimes = ['application/pdf', 'application/x-pdf', 'application/octet-stream'];
            if ($extension !== 'pdf' || !in_array($mime, $allowedMimes, true)) {
                throw new Exception("รองรับเฉพาะไฟล์ PDF เท่านั้น");
            }

            $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', $ownerCode);
            $uploadDir = __DIR__ . "/../../../uploads/user-documents/" . $safeOwner;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $filename = $fieldName . "_" . date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . ".pdf";
            $targetPath = $uploadDir . "/" . $filename;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                throw new Exception("ไม่สามารถบันทึกไฟล์ PDF ได้");
            }

            $savedPaths[] = "uploads/user-documents/" . $safeOwner . "/" . $filename;
        }

        return $savedPaths;
    }

    function parseRequestDetails($rawDetails): array {
        if (is_array($rawDetails)) {
            return $rawDetails;
        }

        if (!is_string($rawDetails) || trim($rawDetails) === '') {
            return [];
        }

        $decoded = json_decode($rawDetails, true);
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }

        return is_array($decoded) ? $decoded : [];
    }

    function normalizeSavedPdfPaths($value): array {
        if (empty($value)) {
            return [];
        }

        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_values(array_filter($decoded, fn($path) => is_string($path) && trim($path) !== ''));
        }

        return is_string($value) && trim($value) !== '' ? [trim($value)] : [];
    }

    function facultyPdfFieldLabels(): array {
        return [
            'nursing_council_file' => 'ไฟล์บัตรสภาการพยาบาล',
            'license_file' => 'ไฟล์ใบอนุญาต',
            'teaching_cert_file' => 'ไฟล์ใบรับรองการสอน',
            'teaching_degree_file' => 'ไฟล์ใบคุณวุฒิการศึกษา', // stored on degree.file_path
        ];
    }

    function facultyColumnPdfFields(): array {
        return ['nursing_council_file', 'license_file', 'teaching_cert_file'];
    }

    /** Pick best degree row for attaching credential PDFs (Doctoral nursing first). */
    function findDegreeIdForFacultyFile(PDO $db, string $facultyId): ?int {
        $stmt = $db->prepare("
            SELECT degree_id
            FROM degree
            WHERE faculty_id = :fid
            ORDER BY
              CASE
                WHEN degree_level = 'Doctoral' AND field_group = 'nursing' THEN 1
                WHEN degree_level = 'Doctoral' THEN 2
                WHEN degree_level = 'Master' AND field_group = 'nursing' THEN 3
                WHEN degree_level = 'Master' THEN 4
                ELSE 5
              END,
              degree_id
            LIMIT 1
        ");
        $stmt->execute([':fid' => $facultyId]);
        $id = $stmt->fetchColumn();
        return $id !== false ? (int)$id : null;
    }

    function getDegreeFilePaths(PDO $db, string $facultyId): array {
        $degreeId = findDegreeIdForFacultyFile($db, $facultyId);
        if ($degreeId === null) {
            return [];
        }
        $stmt = $db->prepare("SELECT file_path FROM degree WHERE degree_id = :id LIMIT 1");
        $stmt->execute([':id' => $degreeId]);
        return normalizeSavedPdfPaths($stmt->fetchColumn());
    }

    function saveDegreeFilePaths(PDO $db, string $facultyId, array $paths): int {
        $encoded = empty($paths) ? null : json_encode(array_values($paths), JSON_UNESCAPED_UNICODE);
        $degreeId = findDegreeIdForFacultyFile($db, $facultyId);
        if ($degreeId === null) {
            $ins = $db->prepare("INSERT INTO degree (faculty_id, file_path) VALUES (:fid, :path)");
            $ins->execute([':fid' => $facultyId, ':path' => $encoded]);
            return (int)$db->lastInsertId();
        }
        $upd = $db->prepare("UPDATE degree SET file_path = :path WHERE degree_id = :id");
        $upd->execute([':path' => $encoded, ':id' => $degreeId]);
        return $degreeId;
    }

    function mergeDegreeFileUploads(PDO $db, string $facultyId, array $uploadedPaths): array {
        $existing = getDegreeFilePaths($db, $facultyId);
        $merged = array_values(array_unique(array_merge($existing, $uploadedPaths)));
        saveDegreeFilePaths($db, $facultyId, $merged);
        return $uploadedPaths;
    }

    function removeDegreeFilePath(PDO $db, string $facultyId, string $filePath): void {
        $normalizedTarget = ltrim(str_replace('\\', '/', $filePath), '/');
        $stmt = $db->prepare("
            SELECT degree_id, file_path
            FROM degree
            WHERE faculty_id = :fid
              AND file_path IS NOT NULL
              AND TRIM(file_path) <> ''
        ");
        $stmt->execute([':fid' => $facultyId]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
            $remaining = array_values(array_filter(
                normalizeSavedPdfPaths($row['file_path'] ?? null),
                static fn($path) => ltrim(str_replace('\\', '/', $path), '/') !== $normalizedTarget
            ));
            $before = normalizeSavedPdfPaths($row['file_path'] ?? null);
            if (count($remaining) === count($before)) {
                continue;
            }
            $newValue = empty($remaining) ? null : json_encode($remaining, JSON_UNESCAPED_UNICODE);
            $upd = $db->prepare("UPDATE degree SET file_path = :val WHERE degree_id = :id");
            $upd->execute([':val' => $newValue, ':id' => $row['degree_id']]);
        }
    }

    function listDegreeUploadedDocuments(PDO $db, string $facultyId): array {
        $documents = [];
        $seen = [];
        $label = facultyPdfFieldLabels()['teaching_degree_file'];
        $stmt = $db->prepare("
            SELECT degree_id, file_path
            FROM degree
            WHERE faculty_id = :fid
              AND file_path IS NOT NULL
              AND TRIM(file_path) <> ''
            ORDER BY degree_id
        ");
        $stmt->execute([':fid' => $facultyId]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
            foreach (normalizeSavedPdfPaths($row['file_path'] ?? null) as $path) {
                $normalized = ltrim(str_replace('\\', '/', $path), '/');
                if ($normalized === '' || isset($seen[$normalized])) {
                    continue;
                }
                $seen[$normalized] = true;
                $absolute = resolveUploadAbsolutePath($normalized);
                $documents[] = [
                    'field' => 'teaching_degree_file',
                    'title' => $label,
                    'file_name' => basename($normalized),
                    'file_path' => $normalized,
                    'available' => $absolute !== null && is_file($absolute),
                    'portfolio_id' => null,
                    'degree_id' => (int)$row['degree_id'],
                ];
            }
        }
        return $documents;
    }

    function studentPdfFieldLabels(): array {
        return [
            'student_id_card_file' => 'ไฟล์สำเนาบัตรประชาชน',
            'student_record_file' => 'ไฟล์ระเบียนนักศึกษา',
            'student_certificate_file' => 'ไฟล์ประกาศนียบัตร/ใบรับรอง',
        ];
    }

    function resolveUploadAbsolutePath(string $relativePath): ?string {
        $normalized = ltrim(str_replace('\\', '/', $relativePath), '/');
        if ($normalized === '' || str_contains($normalized, '..')) {
            return null;
        }
        if (!str_starts_with($normalized, 'uploads/user-documents/')) {
            return null;
        }
        $webRoot = realpath(__DIR__ . '/../../../') ?: (__DIR__ . '/../../../');
        $absolute = $webRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
        $uploadsRoot = realpath($webRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'user-documents');
        $realFile = realpath($absolute);
        if ($uploadsRoot === false || $realFile === false) {
            return is_file($absolute) ? $absolute : null;
        }
        if (!str_starts_with($realFile, $uploadsRoot)) {
            return null;
        }
        return $realFile;
    }

    function deleteLocalUploadFile(string $relativePath): bool {
        $absolute = resolveUploadAbsolutePath($relativePath);
        if ($absolute && is_file($absolute)) {
            return @unlink($absolute);
        }
        return false;
    }

    function listFacultyUploadedDocuments(PDO $db, array $details, string $facultyId): array {
        $labels = facultyPdfFieldLabels();
        $documents = [];
        $seen = [];

        foreach (facultyColumnPdfFields() as $field) {
            $label = $labels[$field] ?? $field;
            foreach (normalizeSavedPdfPaths($details[$field] ?? null) as $path) {
                $normalized = ltrim(str_replace('\\', '/', $path), '/');
                if ($normalized === '' || isset($seen[$normalized])) {
                    continue;
                }
                $seen[$normalized] = true;
                $absolute = resolveUploadAbsolutePath($normalized);
                $documents[] = [
                    'field' => $field,
                    'title' => $label,
                    'file_name' => basename($normalized),
                    'file_path' => $normalized,
                    'available' => $absolute !== null && is_file($absolute),
                    'portfolio_id' => null,
                ];
            }
        }

        foreach (listDegreeUploadedDocuments($db, $facultyId) as $doc) {
            $normalized = $doc['file_path'];
            if (isset($seen[$normalized])) {
                continue;
            }
            $seen[$normalized] = true;
            $documents[] = $doc;
        }

        $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', $facultyId);
        $uploadDir = realpath(__DIR__ . '/../../../uploads/user-documents/' . $safeOwner);
        if ($uploadDir !== false && is_dir($uploadDir)) {
            foreach (glob($uploadDir . DIRECTORY_SEPARATOR . '*.pdf') ?: [] as $absolutePath) {
                $fileName = basename($absolutePath);
                $publicPath = 'uploads/user-documents/' . $safeOwner . '/' . $fileName;
                if (isset($seen[$publicPath])) {
                    continue;
                }
                $field = 'document';
                $title = 'เอกสารที่อัปโหลด';
                foreach ($labels as $fieldName => $label) {
                    if (str_starts_with($fileName, $fieldName . '_')) {
                        $field = $fieldName;
                        $title = $label;
                        break;
                    }
                }
                $seen[$publicPath] = true;
                $documents[] = [
                    'field' => $field,
                    'title' => $title,
                    'file_name' => $fileName,
                    'file_path' => $publicPath,
                    'available' => true,
                    'portfolio_id' => null,
                ];
            }
        }

        return $documents;
    }

    function listStudentUploadedDocuments($db, string $studentId): array {
        $labels = studentPdfFieldLabels();
        $stmt = $db->prepare("
            SELECT portfolio_id, title, type, file_name, file_path
            FROM portfolio
            WHERE student_id = :sid
              AND (
                file_path LIKE 'uploads/user-documents/%'
                OR description LIKE '%จัดการผู้ใช้%'
              )
            ORDER BY created_at DESC
        ");
        $stmt->execute([':sid' => $studentId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        $documents = [];

        foreach ($rows as $row) {
            $path = ltrim(str_replace('\\', '/', (string)($row['file_path'] ?? '')), '/');
            $fileName = (string)($row['file_name'] ?? basename($path));
            $field = 'document';
            foreach ($labels as $fieldName => $label) {
                if (str_starts_with($fileName, $fieldName . '_')) {
                    $field = $fieldName;
                    break;
                }
            }
            $absolute = $path !== '' ? resolveUploadAbsolutePath($path) : null;
            $documents[] = [
                'field' => $field,
                'title' => $row['title'] ?: ($labels[$field] ?? 'เอกสาร Portfolio'),
                'file_name' => $fileName,
                'file_path' => $path,
                'available' => $absolute !== null && is_file($absolute),
                'portfolio_id' => isset($row['portfolio_id']) ? (int)$row['portfolio_id'] : null,
            ];
        }

        return $documents;
    }

    // 🔍 1. [GET] ดึงรายละเอียดเชิงลึกของผู้ใช้เพื่อนำไปแสดงในฟอร์มแก้ไข
    if ($method === 'GET') {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) throw new Exception("ไม่พบ ID ผู้ใช้");

        $u_stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $u_stmt->execute([':id' => $id]);
        $u_info = $u_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$u_info) throw new Exception("ไม่พบผู้ใช้งานในระบบ");

        $data = ["user_id" => $id, "username" => $u_info['username'], "role_id" => $u_info['role_id']];

        if ($u_info['role_id'] == 3) {
            $s_stmt = $db->prepare("SELECT * FROM student WHERE student_id = :sid");
            $s_stmt->execute([':sid' => $u_info['username']]);
            $data['details'] = $s_stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            $data['uploaded_documents'] = listStudentUploadedDocuments($db, (string)$u_info['username']);
        } else {
            $f_stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :fid");
            $f_stmt->execute([':fid' => $u_info['username']]);
            $data['details'] = $f_stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            $data['uploaded_documents'] = listFacultyUploadedDocuments($db, $data['details'], (string)$u_info['username']);
        }

        echo json_encode(["status" => "success", "data" => $data], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 📝 2. [POST] บันทึกข้อมูลที่แก้ไข / ลบเอกสาร
    if ($method === 'POST') {
        $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;
        if ($isMultipart) {
            $input = [
                'user_id' => $_POST['user_id'] ?? null,
                'action' => $_POST['action'] ?? null,
                'details' => parseRequestDetails($_POST['details'] ?? [])
            ];
        } else {
            $input = json_decode(file_get_contents("php://input"), true) ?: [];
            $input['details'] = parseRequestDetails($input['details'] ?? []);
        }
        $id = $input['user_id'] ?? null;
        if (!$id) throw new Exception("ข้อมูลไม่ครบถ้วน");

        // ลบไฟล์ PDF ที่อัปโหลดไว้ (ไม่ลบบัญชีผู้ใช้)
        if (($input['action'] ?? '') === 'delete_document') {
            $u_stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
            $u_stmt->execute([':id' => $id]);
            $u_info = $u_stmt->fetch(PDO::FETCH_ASSOC);
            if (!$u_info) throw new Exception("ไม่พบผู้ใช้งานในระบบ");

            $filePath = ltrim(str_replace('\\', '/', trim((string)($input['file_path'] ?? ''))), '/');
            $field = trim((string)($input['field'] ?? ''));
            $portfolioId = isset($input['portfolio_id']) ? (int)$input['portfolio_id'] : null;
            if ($filePath === '' && !$portfolioId) {
                throw new Exception("ไม่พบพาธไฟล์ที่ต้องการลบ");
            }

            $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', (string)$u_info['username']);
            if ($filePath !== '' && !str_starts_with($filePath, 'uploads/user-documents/' . $safeOwner . '/')) {
                throw new Exception("พาธไฟล์ไม่ถูกต้องสำหรับผู้ใช้นี้");
            }

            if ((int)$u_info['role_id'] === 3) {
                if ($portfolioId) {
                    $del = $db->prepare("DELETE FROM portfolio WHERE portfolio_id = :pid AND student_id = :sid");
                    $del->execute([':pid' => $portfolioId, ':sid' => $u_info['username']]);
                } elseif ($filePath !== '') {
                    $del = $db->prepare("DELETE FROM portfolio WHERE student_id = :sid AND file_path = :path");
                    $del->execute([':sid' => $u_info['username'], ':path' => $filePath]);
                }
            } else {
                $labels = facultyPdfFieldLabels();
                $targetField = isset($labels[$field]) ? $field : null;
                if (!$targetField) {
                    foreach ($labels as $fieldName => $_label) {
                        if (str_starts_with(basename($filePath), $fieldName . '_')) {
                            $targetField = $fieldName;
                            break;
                        }
                    }
                }
                if (!$targetField) {
                    throw new Exception("ไม่ทราบประเภทเอกสารที่จะลบ");
                }

                if ($targetField === 'teaching_degree_file') {
                    removeDegreeFilePath($db, (string)$u_info['username'], $filePath);
                } else {
                    $currentStmt = $db->prepare("SELECT {$targetField} FROM faculty WHERE faculty_id = :fid");
                    $currentStmt->execute([':fid' => $u_info['username']]);
                    $currentValue = $currentStmt->fetchColumn();
                    $remaining = array_values(array_filter(
                        normalizeSavedPdfPaths($currentValue),
                        static fn($path) => ltrim(str_replace('\\', '/', $path), '/') !== $filePath
                    ));
                    $newValue = empty($remaining) ? null : json_encode($remaining, JSON_UNESCAPED_UNICODE);
                    $upd = $db->prepare("UPDATE faculty SET {$targetField} = :val WHERE faculty_id = :fid");
                    $upd->execute([':val' => $newValue, ':fid' => $u_info['username']]);
                }
            }

            if ($filePath !== '') {
                deleteLocalUploadFile($filePath);
            }

            $db->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address) VALUES (?, 'delete', 'ผู้ใช้', ?, ?)")
               ->execute([
                   $_SESSION['user_id'],
                   "ลบเอกสารผู้ใช้ {$u_info['username']}: " . ($filePath !== '' ? $filePath : "portfolio_id={$portfolioId}"),
                   $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
               ]);

            $remainingDocs = [];
            if ((int)$u_info['role_id'] === 3) {
                $remainingDocs = listStudentUploadedDocuments($db, (string)$u_info['username']);
            } else {
                $facultyStmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :fid");
                $facultyStmt->execute([':fid' => $u_info['username']]);
                $remainingDocs = listFacultyUploadedDocuments(
                    $db,
                    $facultyStmt->fetch(PDO::FETCH_ASSOC) ?: [],
                    (string)$u_info['username']
                );
            }

            echo json_encode([
                "status" => "success",
                "message" => "ลบเอกสารสำเร็จ",
                "uploaded_documents" => $remainingDocs,
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $uploadedDocuments = [];

        $u_stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $u_stmt->execute([':id' => $id]);
        $u_info = $u_stmt->fetch(PDO::FETCH_ASSOC);
        if (!$u_info) throw new Exception("ไม่พบผู้ใช้งานในระบบ");
        
        $details = $input['details'] ?? [];

        if ($u_info['role_id'] == 3) {
            $currentStmt = $db->prepare("SELECT * FROM student WHERE student_id = :sid");
            $currentStmt->execute([':sid' => $u_info['username']]);
            $currentDetails = $currentStmt->fetch(PDO::FETCH_ASSOC);
            if (!$currentDetails) throw new Exception("ไม่พบข้อมูลนักศึกษา");
            $details = array_merge($currentDetails, $details);

            $studentPdfFields = [
                'student_id_card_file' => ['title' => 'สำเนาบัตรประชาชน', 'type' => 'document'],
                'student_record_file' => ['title' => 'ระเบียนนักศึกษา', 'type' => 'document'],
                'student_certificate_file' => ['title' => 'ประกาศนียบัตร/ใบรับรอง', 'type' => 'certificate'],
            ];

            foreach ($studentPdfFields as $fileField => $meta) {
                $uploadedPaths = savePdfUploads($fileField, $u_info['username']);
                if (!empty($uploadedPaths)) {
                    $uploadedDocuments[$fileField] = $uploadedPaths;
                }

                foreach ($uploadedPaths as $uploadedPath) {
                    $portfolioStmt = $db->prepare("
                        INSERT INTO portfolio (student_id, title, type, description, file_name, file_path, mime_type, file_category)
                        VALUES (:student_id, :title, :type, :description, :file_name, :file_path, :mime_type, :file_category)
                    ");
                    $portfolioStmt->execute([
                        ':student_id' => $u_info['username'],
                        ':title' => $meta['title'],
                        ':type' => $meta['type'],
                        ':description' => 'อัปโหลดโดยผู้ดูแลระบบจากหน้าจัดการผู้ใช้',
                        ':file_name' => basename($uploadedPath),
                        ':file_path' => $uploadedPath,
                        ':mime_type' => 'application/pdf',
                        ':file_category' => 'document'
                    ]);
                }
            }

            $sql = "UPDATE student SET 
                        title = :title, first_name_th = :first_name_th, last_name_th = :last_name_th,
                        first_name_en = :first_name_en, last_name_en = :last_name_en, gender = :gender, 
                        birth_date = :birth_date, email = :email, phone = :phone, year_level = :year_level, 
                        gpa = :gpa, hometown_province = :hometown_province, height = :height, 
                        weight = :weight, bmi = :bmi, home_phone = :home_phone, home_address = :home_address,
                        status = :status, graduation_date = :graduation_date, dropout_date = :dropout_date,
                        dropout_reason = :dropout_reason, id_card_number = :id_card_number, admission_year = :admission_year
                    WHERE student_id = :sid";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':title' => $details['title'] ?? null, ':first_name_th' => $details['first_name_th'] ?? null, 
                ':last_name_th' => $details['last_name_th'] ?? null, ':first_name_en' => $details['first_name_en'] ?? null, 
                ':last_name_en' => $details['last_name_en'] ?? null, ':gender' => $details['gender'] ?? null, 
                ':birth_date' => !empty($details['birth_date']) ? $details['birth_date'] : null, 
                ':email' => $details['email'] ?? null, ':phone' => $details['phone'] ?? null, 
                ':year_level' => $details['year_level'] ?? null, ':gpa' => $details['gpa'] ?? null, 
                ':hometown_province' => $details['hometown_province'] ?? null, ':height' => $details['height'] ?? null, 
                ':weight' => $details['weight'] ?? null, ':bmi' => $details['bmi'] ?? null, 
                ':home_phone' => $details['home_phone'] ?? null, ':home_address' => $details['home_address'] ?? null,
                ':status' => $details['status'] ?? null, ':graduation_date' => !empty($details['graduation_date']) ? $details['graduation_date'] : null, 
                ':dropout_date' => !empty($details['dropout_date']) ? $details['dropout_date'] : null, 
                ':dropout_reason' => $details['dropout_reason'] ?? null, ':id_card_number' => $details['id_card_number'] ?? null, 
                ':admission_year' => $details['admission_year'] ?? null, ':sid' => $u_info['username']
            ]);
        } else {
            $currentStmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :fid");
            $currentStmt->execute([':fid' => $u_info['username']]);
            $currentDetails = $currentStmt->fetch(PDO::FETCH_ASSOC);
            if (!$currentDetails) throw new Exception("ไม่พบข้อมูลอาจารย์/บุคลากร");
            $details = array_merge($currentDetails, $details);

            foreach (facultyColumnPdfFields() as $fileField) {
                $uploadedPaths = savePdfUploads($fileField, $u_info['username']);
                if (!empty($uploadedPaths)) {
                    $existingPaths = normalizeSavedPdfPaths($currentDetails[$fileField] ?? null);
                    $mergedPaths = array_values(array_unique(array_merge($existingPaths, $uploadedPaths)));
                    $uploadedDocuments[$fileField] = $uploadedPaths;
                    $details[$fileField] = json_encode($mergedPaths, JSON_UNESCAPED_UNICODE);
                }
            }

            $degreeUploads = savePdfUploads('teaching_degree_file', $u_info['username']);
            if (!empty($degreeUploads)) {
                $uploadedDocuments['teaching_degree_file'] = mergeDegreeFileUploads(
                    $db,
                    (string)$u_info['username'],
                    $degreeUploads
                );
            }

            $sql = "UPDATE faculty SET 
                        title = :title, first_name_th = :first_name_th, last_name_th = :last_name_th,
                        first_name_en = :first_name_en, last_name_en = :last_name_en, gender = :gender, 
                        birth_date = :birth_date, email = :email, phone = :phone, current_address = :current_address,
                        nursing_council_no = :nursing_council_no, license_expiry = :license_expiry,
                        start_work_date = :start_work_date, academic_position_date = :academic_position_date,
                        profile_picture = :profile_picture, nursing_council_file = :nursing_council_file,
                        license_file = :license_file, teaching_cert_file = :teaching_cert_file,
                        status = :status
                    WHERE faculty_id = :fid";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':title' => $details['title'] ?? null, ':first_name_th' => $details['first_name_th'] ?? null, 
                ':last_name_th' => $details['last_name_th'] ?? null, ':first_name_en' => $details['first_name_en'] ?? null, 
                ':last_name_en' => $details['last_name_en'] ?? null, ':gender' => $details['gender'] ?? null, 
                ':birth_date' => !empty($details['birth_date']) ? $details['birth_date'] : null, 
                ':email' => $details['email'] ?? null, ':phone' => $details['phone'] ?? null, 
                ':current_address' => $details['current_address'] ?? null, ':nursing_council_no' => $details['nursing_council_no'] ?? null, 
                ':license_expiry' => !empty($details['license_expiry']) ? $details['license_expiry'] : null, 
                ':start_work_date' => !empty($details['start_work_date']) ? $details['start_work_date'] : null, 
                ':academic_position_date' => !empty($details['academic_position_date']) ? $details['academic_position_date'] : null, 
                ':profile_picture' => $details['profile_picture'] ?? null, ':nursing_council_file' => $details['nursing_council_file'] ?? null,
                ':license_file' => $details['license_file'] ?? null, ':teaching_cert_file' => $details['teaching_cert_file'] ?? null,
                ':status' => $details['status'] ?? null, ':fid' => $u_info['username']
            ]);
        }

        if ($isMultipart && empty($uploadedDocuments)) {
            $receivedFields = implode(', ', array_keys($_FILES));
            throw new Exception("ไม่พบไฟล์ PDF ในคำขออัปโหลด" . ($receivedFields ? " (received: {$receivedFields})" : ""));
        }
        
        $db->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address) VALUES (?, 'update', 'ผู้ใช้', ?, ?)")
           ->execute([$_SESSION['user_id'], "แก้ไขข้อมูลบัญชี: " . $u_info['username'], $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);

        echo json_encode(["status" => "success", "uploaded_documents" => $uploadedDocuments]);
        exit();
    }

    // 🗑️ 3. [DELETE] ลบข้อมูล
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ไม่พบ ID");
        $stmt = $db->prepare("DELETE FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["status" => "success"]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>