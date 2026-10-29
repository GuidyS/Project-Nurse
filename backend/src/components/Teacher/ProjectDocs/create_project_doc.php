<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_document_file_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);
project_require_admin_write($auth);
$input = project_payload();

try {
    $name = trim((string) ($input['name'] ?? ''));
    $projectId = project_validate_code($input['project_id'] ?? null);
    $type = trim((string) ($input['type'] ?? 'summary'));
    $date = trim((string) ($input['date'] ?? ''));
    $attachmentType = trim((string) ($input['attachment_type'] ?? ''));
    $attachmentUrl = trim((string) ($input['attachment_url'] ?? ''));
    $googleDriveLink = trim((string) ($input['google_drive_link'] ?? ''));

    if ($attachmentType === '' && $googleDriveLink !== '') {
        $attachmentType = 'google_drive';
        $attachmentUrl = $googleDriveLink;
    }
    if ($attachmentType === '') {
        $attachmentType = 'file';
    }

    $allowedTypes = ['proposal', 'progress', 'financial', 'summary'];
    if ($name === '' || $projectId === '' || $type === '' || $date === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกข้อมูลเอกสารให้ครบถ้วน"], 400);
        exit;
    }
    if (!in_array($type, $allowedTypes, true)) {
        project_json(["status" => "error", "message" => "ประเภทเอกสารไม่ถูกต้อง"], 400);
        exit;
    }
    $filePath = null;
    $fileName = null;
    if ($attachmentType === 'google_drive') {
        project_document_validate_google_drive_link($attachmentUrl);
        $filePath = $attachmentUrl !== '' ? $attachmentUrl : null;
        $fileName = $attachmentUrl !== '' ? 'Google Drive' : null;
    } elseif ($attachmentType === 'website_url') {
        project_document_validate_website_url($attachmentUrl);
        $filePath = $attachmentUrl !== '' ? $attachmentUrl : null;
        $fileName = $attachmentUrl !== '' ? 'Website URL' : null;
    } elseif ($attachmentType !== 'file') {
        project_json(["status" => "error", "message" => "ประเภทเอกสารแนบไม่ถูกต้อง"], 400);
        exit;
    }

    $project = project_require_existing_project($db, $projectId);
    $projectName = trim((string) ($project['project_name_th'] ?? '')) ?: 'โครงการ #' . $projectId;

    $stmt = $db->prepare("
        INSERT INTO project_documents (project_id, name, project, type, date, status, file_path, file_name)
        VALUES (:project_id, :name, :project, :type, :date, 'available', :file_path, :file_name)
    ");
    $stmtParams = [
        ':project_id' => $projectId,
        ':name' => $name,
        ':project' => $projectName,
        ':type' => $type,
        ':date' => $date,
        ':file_path' => $filePath,
        ':file_name' => $fileName,
    ];
    $db->beginTransaction();
    project_u_guard($db, $projectId);
    $stmt->execute($stmtParams);
    $documentId = (int) $db->lastInsertId();

    project_u_document_link($db, $projectId, $documentId, $input);
    $db->commit();

    // บันทึก Log เมื่อสร้างรายการเอกสารใหม่
    logAudit($db, $auth['user_id'], 'create', 'project_documents', "เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: {$name}, โครงการ: {$projectName})");

    project_json([
        "status" => "success",
        "message" => "บันทึกเอกสารเข้าสู่ระบบสำเร็จแล้ว",
        "doc_id" => $documentId,
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    project_json(["status" => "error", "message" => $e->getMessage()], project_error_status($e));
}
?>
