<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_document_file_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);
$input = project_payload();

try {
    $documentId = isset($input['document_id']) ? (int) $input['document_id'] : 0;
    if ($documentId <= 0) {
        project_json(["status" => "error", "message" => "รหัสเอกสารไม่ถูกต้อง"], 400);
        exit;
    }

    $stmt = $db->prepare("
        SELECT id, project_id, name, file_path
        FROM project_documents
        WHERE id = :document_id
        LIMIT 1
    ");
    $stmt->execute([':document_id' => $documentId]);
    $document = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$document) {
        project_json(["status" => "error", "message" => "ไม่พบเอกสารโครงการที่ต้องการลบ"], 404);
        exit;
    }

    $deleteStmt = $db->prepare("DELETE FROM project_documents WHERE id = :document_id");
    $deleteStmt->execute([':document_id' => $documentId]);

    project_document_delete_file($document['file_path'] ?? null);

    logAudit($db, $auth['user_id'], 'delete', 'project_documents', "ลบเอกสารโครงการ ID: {$documentId} ชื่อ: {$document['name']} (project_id: {$document['project_id']})");

    project_json([
        "status" => "success",
        "message" => "ลบเอกสารโครงการสำเร็จ",
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
