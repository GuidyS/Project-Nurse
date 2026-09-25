<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 
require_once __DIR__ . '/../../../config/audit_helper.php'; 

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

    // ระบบจัดการไฟล์อัปโหลด
    if ($googleDriveLink === '' && $hasUploadedFile) {
        $uploadDir = __DIR__ . '/../../../uploads/portfolio/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

        if (!in_array($ext, $allowed)) {
            throw new Exception("นามสกุลไฟล์ไม่รองรับ");
        }

        $mimeType = mime_content_type($file['tmp_name']) ?: null;
        $fileCategory = in_array($ext, ['jpg', 'jpeg', 'png']) ? 'image' : 'document';

        $newFileName = "PORT_" . $student_id . "_" . time() . "_" . uniqid() . "." . $ext;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            $fileName = $file['name'];
            $filePath = 'uploads/portfolio/' . $newFileName;
        } else {
            throw new Exception("ไม่สามารถอัปโหลดไฟล์ได้");
        }
    }

    $db = new Connect();
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
    logAudit($db, $_SESSION['user_id'] ?? null, 'create', 'portfolio', "เพิ่มผลงาน: " . ($title ?: 'ไม่มีชื่อผลงาน') . ($newId ? " (ID: {$newId})" : ""));

    echo json_encode(["status" => "success", "message" => "เพิ่มผลงานสำเร็จ"]);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
