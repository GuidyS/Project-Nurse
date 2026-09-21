<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_document_file_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);
$input = project_payload();

try {
    $name = trim((string) ($input['name'] ?? ''));
    $projectId = isset($input['project_id']) ? (int) $input['project_id'] : 0;
    $type = trim((string) ($input['type'] ?? 'summary'));
    $date = trim((string) ($input['date'] ?? ''));
    $googleDriveLink = trim((string) ($input['google_drive_link'] ?? ''));

    $allowedTypes = ['proposal', 'progress', 'financial', 'summary'];
    if ($name === '' || $projectId <= 0 || $type === '' || $date === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกข้อมูลเอกสารให้ครบถ้วน"], 400);
        exit;
    }
    if (!in_array($type, $allowedTypes, true)) {
        project_json(["status" => "error", "message" => "ประเภทเอกสารไม่ถูกต้อง"], 400);
        exit;
    }
    project_document_validate_google_drive_link($googleDriveLink);

    $project = project_require_existing_project($db, $projectId);
    $projectName = $project['project_name_th'] ?: ($project['project_name_en'] ?: 'Project #' . $projectId);

    $stmt = $db->prepare("
        INSERT INTO project_documents (project_id, name, project, type, date, status, file_path, file_name)
        VALUES (:project_id, :name, :project, :type, :date, 'pending', :file_path, :file_name)
    ");
    $stmtParams = [
        ':project_id' => $projectId,
        ':name' => $name,
        ':project' => $projectName,
        ':type' => $type,
        ':date' => $date,
        ':file_path' => $googleDriveLink !== '' ? $googleDriveLink : null,
        ':file_name' => $googleDriveLink !== '' ? 'Google Drive' : null,
    ];
    $stmt->execute($stmtParams);

    // บันทึก Log เมื่อสร้างรายการเอกสารใหม่
    logAudit($db, $auth['user_id'], 'create', 'project_documents', "เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: {$name}, โครงการ: {$projectName})");

    project_json([
        "status" => "success",
        "message" => "บันทึกเอกสารเข้าสู่ระบบสำเร็จแล้ว",
        "doc_id" => (int) $db->lastInsertId(),
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
