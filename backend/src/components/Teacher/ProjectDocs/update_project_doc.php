<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_document_file_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);

try {
    $documentId = project_request_int('document_id', 'post');
    $name = trim((string) ($_POST['name'] ?? ''));
    $type = trim((string) ($_POST['type'] ?? 'summary'));
    $date = trim((string) ($_POST['date'] ?? ''));
    $googleDriveLink = trim((string) ($_POST['google_drive_link'] ?? ''));

    $allowedTypes = ['proposal', 'progress', 'financial', 'summary'];
    if ($documentId === null || $name === '' || $type === '' || $date === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกข้อมูลเอกสารให้ครบถ้วน"], 400);
        exit;
    }
    if (!in_array($type, $allowedTypes, true)) {
        project_json(["status" => "error", "message" => "ประเภทเอกสารไม่ถูกต้อง"], 400);
        exit;
    }
    project_document_validate_google_drive_link($googleDriveLink);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || strtotime($date) === false) {
        project_json(["status" => "error", "message" => "วันที่เอกสารไม่ถูกต้อง"], 400);
        exit;
    }

    $docStmt = $db->prepare("
        SELECT
            d.id,
            d.project_id,
            d.name,
            d.project,
            d.file_path,
            d.file_name,
            d.mime_type,
            d.file_size,
            p.responsible_faculty_id
        FROM project_documents d
        INNER JOIN project p ON p.project_id = d.project_id
        WHERE d.id = :document_id
        LIMIT 1
    ");
    $docStmt->execute([':document_id' => $documentId]);
    $document = $docStmt->fetch(PDO::FETCH_ASSOC);
    if (!$document) {
        project_json(["status" => "error", "message" => "ไม่พบเอกสารโครงการที่ต้องการแก้ไข"], 404);
        exit;
    }

    $uploadedFile = null;
    if (isset($_FILES['file']) && ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        $facultyId = $document['responsible_faculty_id'] !== null
            ? (int) $document['responsible_faculty_id']
            : project_resolve_faculty_id($db, $auth['user_id']);
        if ($facultyId === null) {
            project_json(["status" => "error", "message" => "บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์"], 400);
            exit;
        }

        $uploadedFile = project_document_upload_file($_FILES['file'], $facultyId);
    }

    $params = [
        ':id' => $documentId,
        ':name' => $name,
        ':type' => $type,
        ':date' => $date,
    ];
    $setFileSql = ",
            file_path = :file_path,
            file_name = :file_name,
            mime_type = :mime_type,
            file_size = :file_size";
    $params[':file_path'] = $googleDriveLink !== '' ? $googleDriveLink : ($document['file_path'] ?? null);
    $params[':file_name'] = $googleDriveLink !== '' ? 'Google Drive' : ($document['file_name'] ?? null);
    $params[':mime_type'] = $googleDriveLink !== '' ? null : ($document['mime_type'] ?? null);
    $params[':file_size'] = $googleDriveLink !== '' ? null : ($document['file_size'] ?? null);

    if ($uploadedFile !== null) {
        $setFileSql = ",
            file_path = :file_path,
            file_name = :file_name,
            mime_type = :mime_type,
            file_size = :file_size,
            uploaded_by = :uploaded_by";
        $params[':file_path'] = $uploadedFile['file_path'];
        $params[':file_name'] = $uploadedFile['file_name'];
        $params[':mime_type'] = $uploadedFile['mime_type'];
        $params[':file_size'] = $uploadedFile['file_size'];
        $params[':uploaded_by'] = $auth['user_id'];
    }

    $stmt = $db->prepare("
        UPDATE project_documents
        SET name = :name,
            type = :type,
            date = :date
            {$setFileSql}
        WHERE id = :id
    ");
    $stmt->execute($params);

    if ($uploadedFile !== null || $googleDriveLink !== '') {
        project_document_delete_file($document['file_path'] ?? null);
    }

    $fileAction = $uploadedFile !== null ? ', อัปโหลดไฟล์ใหม่' : ($googleDriveLink !== '' ? ', เปลี่ยนเป็น Google Drive link' : '');
    logAudit($db, $auth['user_id'], 'update', 'project_documents', "แก้ไขเอกสารโครงการ ID: {$documentId} ชื่อ: {$name} (project_id: {$document['project_id']}{$fileAction})");

    project_json([
        "status" => "success",
        "message" => "บันทึกการแก้ไขเอกสารสำเร็จ",
        "file_path" => $uploadedFile['file_path'] ?? ($googleDriveLink !== '' ? $googleDriveLink : ($document['file_path'] ?? null)),
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
