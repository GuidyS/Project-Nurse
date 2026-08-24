<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);
project_require_admin_write($auth);
$targetPath = null;

try {
    $projectId = project_request_int('project_id', 'post');
    if ($projectId === null || !isset($_FILES['file'])) {
        project_json(["status" => "error", "message" => "กรุณาระบุรหัสโครงการและแนบไฟล์"], 400);
        exit;
    }

    $facultyId = project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "error", "message" => "บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์"], 400);
        exit;
    }

    $project = project_require_existing_project($db, $projectId);
    if ((int) ($project['responsible_faculty_id'] ?? 0) !== $facultyId) {
        project_json(["status" => "error", "message" => "ไม่มีสิทธิ์อัปโหลดไฟล์ในโครงการนี้"], 403);
        exit;
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        project_json(["status" => "error", "message" => "เกิดข้อผิดพลาดระหว่างการอัปโหลดไฟล์"], 400);
        exit;
    }

    if (($file['size'] ?? 0) <= 0 || (int) $file['size'] > PROJECT_UPLOAD_MAX_BYTES) {
        project_json(["status" => "error", "message" => "ไฟล์ต้องมีขนาดไม่เกิน 10 MB"], 400);
        exit;
    }

    $originalName = basename((string) $file['name']);
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'];
    if (!in_array($extension, $allowedExtensions, true)) {
        project_json(["status" => "error", "message" => "ชนิดไฟล์ไม่รองรับ"], 400);
        exit;
    }

    $allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
    ];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo ? finfo_file($finfo, $file['tmp_name']) : ($file['type'] ?? '');
    if ($finfo) {
        finfo_close($finfo);
    }
    if (!in_array($detectedMime, $allowedMimes, true)) {
        project_json(["status" => "error", "message" => "ชนิดไฟล์ไม่ตรงกับไฟล์ที่อนุญาต"], 400);
        exit;
    }

    $baseProjectDocsDir = __DIR__ . '/../../../uploads/project_docs/';
    if (!is_dir($baseProjectDocsDir) && !mkdir($baseProjectDocsDir, 0755, true)) {
        project_json(["status" => "error", "message" => "ไม่สามารถสร้างโฟลเดอร์อัปโหลดได้"], 500);
        exit;
    }

    $baseUploadDir = realpath($baseProjectDocsDir);
    if (!$baseUploadDir) {
        project_json(["status" => "error", "message" => "โฟลเดอร์อัปโหลดไม่ถูกต้อง"], 500);
        exit;
    }

    $facultyDirName = (string) $facultyId;
    $uploadDir = $baseUploadDir . DIRECTORY_SEPARATOR . $facultyDirName;
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        project_json(["status" => "error", "message" => "ไม่สามารถสร้างโฟลเดอร์อัปโหลดของอาจารย์ได้"], 500);
        exit;
    }

    $realUploadDir = realpath($uploadDir);
    if (
        !$realUploadDir ||
        strpos($realUploadDir . DIRECTORY_SEPARATOR, $baseUploadDir . DIRECTORY_SEPARATOR) !== 0
    ) {
        project_json(["status" => "error", "message" => "ตำแหน่งจัดเก็บไฟล์ไม่ถูกต้อง"], 500);
        exit;
    }

    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName) ?: 'project_file';
    $fileName = date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '_' . $safeName;
    $targetPath = $realUploadDir . DIRECTORY_SEPARATOR . $fileName;
    $publicPath = 'uploads/project_docs/' . $facultyDirName . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        project_json(["status" => "error", "message" => "ไม่สามารถย้ายไฟล์ไปยังโฟลเดอร์เซิร์ฟเวอร์ได้"], 500);
        exit;
    }

    $projectName = $project['project_name_th'] ?: ($project['project_name_en'] ?: 'Project #' . $projectId);
    $stmt = $db->prepare("
        INSERT INTO project_documents (
            project_id,
            name,
            project,
            type,
            date,
            status,
            file_path,
            file_name,
            mime_type,
            file_size,
            uploaded_by
        ) VALUES (
            :project_id,
            :name,
            :project,
            'proposal',
            :date,
            'pending',
            :file_path,
            :file_name,
            :mime_type,
            :file_size,
            :uploaded_by
        )
    ");
    $stmt->execute([
        ':project_id' => $projectId,
        ':name' => $originalName,
        ':project' => $projectName,
        ':date' => date('Y-m-d'),
        ':file_path' => $publicPath,
        ':file_name' => $originalName,
        ':mime_type' => $detectedMime,
        ':file_size' => (int) $file['size'],
        ':uploaded_by' => $auth['user_id'],
    ]);

    project_json([
        "status" => "success",
        "message" => "อัปโหลดไฟล์โครงการสำเร็จ",
        "doc_id" => (int) $db->lastInsertId(),
        "file_path" => $publicPath,
    ]);
} catch (Exception $e) {
    if ($targetPath && is_file($targetPath)) {
        @unlink($targetPath);
    }

    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
