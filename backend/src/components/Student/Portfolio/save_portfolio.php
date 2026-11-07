<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 
require_once __DIR__ . '/../../../config/audit_helper.php'; 
require_once __DIR__ . '/../../../config/storage.php';

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;

if (!$student_id || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Unauthorized or Invalid Request"]);
    exit();
}

function portfolio_validate_google_drive_link(string $url): void
{
    $trimmedUrl = trim($url);
    if ($trimmedUrl === '') {
        return;
    }

    if (!filter_var($trimmedUrl, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException("ลิงก์ Google Drive ไม่ถูกต้อง");
    }

    $parts = parse_url($trimmedUrl);
    $scheme = strtolower((string)($parts['scheme'] ?? ''));
    $host = strtolower((string)($parts['host'] ?? ''));
    if ($scheme !== 'https' || !in_array($host, ['drive.google.com', 'docs.google.com'], true)) {
        throw new InvalidArgumentException("กรุณาแนบลิงก์ Google Drive ที่ถูกต้อง");
    }
}

try {
    $db = new Connect();
    $uploadedObjectKey = null;
    $transactionCommitted = false;
    $rawInput = file_get_contents('php://input');
    $jsonInput = json_decode($rawInput, true);
    if (!is_array($jsonInput)) {
        $jsonInput = [];
    }

    $input = array_merge($_POST, $jsonInput);

    $title = trim((string)($input['title'] ?? ''));
    $type = trim((string)($input['type'] ?? 'certificate'));
    $description = trim((string)($input['description'] ?? ''));
    $googleDriveLink = trim((string)($input['google_drive_link'] ?? ''));
    
    $fileName = null;
    $filePath = null;
    $mimeType = null;
    $fileCategory = 'document';
    $hasUploadedFile = isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK;

    if ($title === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุชื่อผลงาน"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($googleDriveLink === '' && !$hasUploadedFile) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาแนบลิงก์ Google Drive หรือไฟล์ผลงาน"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($googleDriveLink !== '') {
        portfolio_validate_google_drive_link($googleDriveLink);
        $fileName = $title !== '' ? $title : 'Google Drive';
        $filePath = $googleDriveLink;
        $mimeType = 'text/uri-list';
    }

    $db->beginTransaction();

    // ระบบจัดการไฟล์อัปโหลด
    if ($googleDriveLink === '' && $hasUploadedFile) {
        $file = $_FILES['file'];
        if ((int)($file['size'] ?? 0) <= 0 || (int)$file['size'] > 10 * 1024 * 1024) {
            throw new InvalidArgumentException("ไฟล์ผลงานต้องมีขนาดไม่เกิน 10 MB");
        }
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

        if (!in_array($ext, $allowed)) {
            throw new Exception("นามสกุลไฟล์ไม่รองรับ");
        }

        $mimeType = mime_content_type($file['tmp_name']) ?: null;
        $allowedMimes = [
            'application/pdf','image/jpeg','image/png','application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!$mimeType || !in_array($mimeType, $allowedMimes, true)) {
            throw new InvalidArgumentException("ชนิดไฟล์ไม่ตรงกับไฟล์ที่อนุญาต");
        }
        $fileCategory = in_array($ext, ['jpg', 'jpeg', 'png']) ? 'image' : 'document';

        $stored = storagePutUploadedFile($db, $file, [
            'owner_type' => 'student', 'owner_id' => $student_id,
            'resource_type' => 'portfolio', 'access_scope' => 'student_advisor_admin',
            'mime_type' => $mimeType,
        ]);
        $fileName = $stored['name'];
        $filePath = $stored['reference'];
        $uploadedObjectKey = $stored['object_key'];
    }

    $sql = "INSERT INTO portfolio (student_id, title, type, description, file_name, file_path, mime_type, file_category) 
            VALUES (:sid, :title, :type, :desc, :fname, :fpath, :mime_type, :file_category)";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':sid' => $student_id,
        ':title' => $title,
        ':type' => $type,
        ':desc' => $description,
        ':fname' => $fileName,
        ':fpath' => $filePath,
        ':mime_type' => $mimeType,
        ':file_category' => $fileCategory
    ]);

    // บันทึกประวัติการสร้างผลงานลง Audit Log
    $newId = $db->lastInsertId();
    if (isset($stored['id'])) {
        $db->prepare('UPDATE storage_objects SET resource_id = :resource_id WHERE storage_id = :id')
           ->execute([':resource_id' => $newId, ':id' => $stored['id']]);
    }
    $db->commit();
    $transactionCommitted = true;
    try {
        logAudit($db, $_SESSION['user_id'] ?? null, 'create', 'portfolio', "เพิ่มผลงาน: " . ($title ?: 'ไม่มีชื่อผลงาน') . ($newId ? " (ID: {$newId})" : ""));
    } catch (Throwable $auditError) {
        error_log('Portfolio audit log failed: ' . $auditError->getMessage());
    }

    echo json_encode(["status" => "success", "message" => "เพิ่มผลงานสำเร็จ"]);

} catch (InvalidArgumentException $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    if (!empty($uploadedObjectKey) && empty($transactionCommitted)) storageDeleteObjectKey($uploadedObjectKey);
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    if (!empty($uploadedObjectKey) && empty($transactionCommitted)) storageDeleteObjectKey($uploadedObjectKey);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
