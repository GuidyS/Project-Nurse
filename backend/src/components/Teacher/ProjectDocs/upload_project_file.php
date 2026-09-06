<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);

try {
    $documentId = project_request_int('document_id', 'post');
    if ($documentId === null || !isset($_FILES['file'])) {
        project_json(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน กรุณาแนบไฟล์และรหัสเอกสาร"], 400);
        exit;
    }

    $docStmt = $db->prepare("
        SELECT d.id, d.project_id, p.responsible_faculty_id
        FROM project_documents d
        INNER JOIN project p ON p.project_id = d.project_id
        WHERE d.id = :document_id
        LIMIT 1
    ");
    $docStmt->execute([':document_id' => $documentId]);
    $document = $docStmt->fetch(PDO::FETCH_ASSOC);
    if (!$document) {
        project_json(["status" => "error", "message" => "ไม่พบเอกสารที่ผูกกับโครงการที่ถูกต้อง"], 404);
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

    $facultyId = $document['responsible_faculty_id'] !== null
        ? (int) $document['responsible_faculty_id']
        : project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "error", "message" => "บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์"], 400);
        exit;
    }

    $facultyDirName = (string) $facultyId;
    $uploadDir = $baseProjectDocsDir . $facultyDirName . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        project_json(["status" => "error", "message" => "เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเนเธเธฅเน€เธ”เธญเธฃเนเธญเธฑเธเนเธซเธฅเธ”เนเธ”เน"], 500);
        exit;
    }

    $baseUploadDir = realpath($baseProjectDocsDir);
    $realUploadDir = realpath($uploadDir);
    if (
        !$baseUploadDir ||
        !$realUploadDir ||
        strpos($realUploadDir . DIRECTORY_SEPARATOR, $baseUploadDir . DIRECTORY_SEPARATOR) !== 0
    ) {
        project_json(["status" => "error", "message" => "ตำแหน่งจัดเก็บไฟล์ไม่ถูกต้อง"], 500);
        exit;
    }

    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
    $fileName = date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '_' . $safeName;
    $targetPath = $realUploadDir . DIRECTORY_SEPARATOR . $fileName;
    $publicPath = 'uploads/project_docs/' . $facultyDirName . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        project_json(["status" => "error", "message" => "ไม่สามารถย้ายไฟล์ไปยังโฟลเดอร์เซิร์ฟเวอร์ได้"], 500);
        exit;
    }

    $stmt = $db->prepare("
        UPDATE project_documents
        SET file_path = :file_path,
            file_name = :file_name,
            mime_type = :mime_type,
            file_size = :file_size,
            uploaded_by = :uploaded_by
        WHERE id = :id
    ");
    $stmt->execute([
        ':file_path' => $publicPath,
        ':file_name' => $originalName,
        ':mime_type' => $detectedMime,
        ':file_size' => (int) $file['size'],
        ':uploaded_by' => $auth['user_id'],
        ':id' => $documentId,
    ]);

    project_json([
        "status" => "success",
        "message" => "อัปโหลดและบันทึกไฟล์สำเร็จ",
        "file_path" => $publicPath,
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
