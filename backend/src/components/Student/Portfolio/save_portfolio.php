<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;

if (!$student_id || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Unauthorized or Invalid Request"]);
    exit();
}

try {
    $title = $_POST['title'] ?? '';
    $type = $_POST['type'] ?? 'certificate';
    $description = $_POST['description'] ?? '';
    
    $fileName = null;
    $filePath = null;
    $mimeType = null;
    $fileCategory = 'document';

    // ระบบจัดการไฟล์อัปโหลด
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '/var/www/html/uploads/portfolio/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true); // สร้างโฟลเดอร์ถ้ายังไม่มี
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
            $fileName = $file['name']; // ชื่อไฟล์ต้นฉบับ
            $filePath = 'uploads/portfolio/' . $newFileName; // พาร์ทที่เก็บใน Server
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

    echo json_encode(["status" => "success", "message" => "เพิ่มผลงานสำเร็จ"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>