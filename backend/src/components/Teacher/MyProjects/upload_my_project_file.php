<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../../../config/storage.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);
project_require_admin_write($auth);
$uploadedReference = null;
$uploadedObjectKey = null;

try {
    $projectId = project_request_code('post');
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

    $db->beginTransaction();
    project_u_guard($db, $projectId);
    project_u_require_root($db, $projectId);
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

    $stored = storagePutUploadedFile($db, $file, [
        'owner_type' => 'faculty', 'owner_id' => (string)$facultyId,
        'resource_type' => 'project_document', 'resource_id' => (string)$projectId,
        'access_scope' => 'project_member_admin', 'mime_type' => $detectedMime,
    ]);
    $publicPath = $stored['reference'];
    $uploadedReference = $publicPath;
    $uploadedObjectKey = $stored['object_key'];

    $projectName = trim((string) ($project['project_name_th'] ?? '')) ?: 'โครงการ #' . $projectId;
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
            'available',
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

    $documentId = (int) $db->lastInsertId();
    project_u_document_link($db, $projectId, $documentId, $_POST);
    $db->commit();
    $uploadedReference = null;
    $uploadedObjectKey = null;
    try {
        logAudit($db, $auth['user_id'], 'create', 'project_docs', "อัปโหลดไฟล์โครงการ {$projectName} (ไฟล์: {$originalName})");
    } catch (Throwable $auditError) {
        error_log('Project document audit log failed: ' . $auditError->getMessage());
    }

    project_json([
        "status" => "success",
        "message" => "อัปโหลดไฟล์โครงการสำเร็จ",
        "doc_id" => $documentId,
        "file_path" => $publicPath,
    ]);
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    if ($uploadedReference) storageDeleteObjectKey($uploadedObjectKey);

    project_json(["status" => "error", "message" => $e->getMessage()], project_error_status($e));
}
?>
