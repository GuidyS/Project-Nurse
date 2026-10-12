<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_document_file_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_DOCS_MANAGE']);
project_require_admin_write($auth);

$uploadedPathForCleanup = null;

function project_document_request_text(string $key): string
{
    return trim((string) ($_POST[$key] ?? ''));
}

function project_document_validate_upload_form(string $name, string $type, string $date): void
{
    $allowedTypes = ['proposal', 'progress', 'financial', 'summary'];

    if ($name === '' || $type === '' || $date === '') {
        throw new InvalidArgumentException("กรุณากรอกข้อมูลเอกสารให้ครบถ้วน");
    }

    if (!in_array($type, $allowedTypes, true)) {
        throw new InvalidArgumentException("ประเภทเอกสารไม่ถูกต้อง");
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new InvalidArgumentException("วันที่เอกสารไม่ถูกต้อง");
    }
}

function project_document_faculty_id(PDO $db, array $auth, ?int $responsibleFacultyId): int
{
    $facultyId = $responsibleFacultyId ?? project_resolve_faculty_id($db, (int) $auth['user_id']);
    if ($facultyId === null) {
        throw new InvalidArgumentException("บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์");
    }

    return (int) $facultyId;
}

try {
    $documentId = project_request_int('document_id', 'post');
    $projectId = project_request_int('project_id', 'post');

    if (!isset($_FILES['file'])) {
        project_json(["status" => "error", "message" => "กรุณาแนบไฟล์เอกสาร"], 400);
        exit;
    }

    if ($documentId !== null) {
        $docStmt = $db->prepare("
            SELECT
                d.id,
                d.project_id,
                d.file_path,
                p.project_id AS joined_project_id,
                p.responsible_faculty_id
            FROM project_documents d
            LEFT JOIN project p ON p.project_id = d.project_id
            WHERE d.id = :document_id
            LIMIT 1
        ");
        $docStmt->execute([':document_id' => $documentId]);
        $document = $docStmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            project_json(["status" => "error", "message" => "ไม่พบเอกสารที่ต้องการอัปโหลดไฟล์"], 404);
            exit;
        }

        if (empty($document['joined_project_id'])) {
            project_json(["status" => "error", "message" => "ไม่พบโครงการที่ผูกกับเอกสารนี้"], 404);
            exit;
        }

        $facultyId = project_document_faculty_id(
            $db,
            $auth,
            $document['responsible_faculty_id'] !== null ? (int) $document['responsible_faculty_id'] : null
        );
        $uploadedFile = project_document_upload_file($_FILES['file'], $facultyId);
        $uploadedPathForCleanup = $uploadedFile['file_path'];

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
            ':file_path' => $uploadedFile['file_path'],
            ':file_name' => $uploadedFile['file_name'],
            ':mime_type' => $uploadedFile['mime_type'],
            ':file_size' => $uploadedFile['file_size'],
            ':uploaded_by' => $auth['user_id'],
            ':id' => $documentId,
        ]);

        $uploadedPathForCleanup = null;
        try {
            project_document_delete_file($document['file_path'] ?? null);
        } catch (Exception $cleanupException) {
            // Keep the successful replacement even if the previous file cannot be removed.
        }

        logAudit($db, $auth['user_id'], 'update', 'project_documents', "อัปโหลด/แก้ไขไฟล์เอกสารโครงการ (ID: {$documentId}, ชื่อไฟล์: {$uploadedFile['file_name']})");

        project_json([
            "status" => "success",
            "message" => "อัปโหลดและบันทึกไฟล์สำเร็จ",
            "doc_id" => (int) $documentId,
            "file_path" => $uploadedFile['file_path'],
        ]);
        exit;
    }

    if ($projectId === null) {
        project_json(["status" => "error", "message" => "กรุณาระบุรหัสโครงการหรือรหัสเอกสาร"], 400);
        exit;
    }

    $name = project_document_request_text('name');
    $type = project_document_request_text('type') ?: 'summary';
    $date = project_document_request_text('date');
    project_document_validate_upload_form($name, $type, $date);

    $project = project_require_existing_project($db, $projectId);
    $projectName = $project['project_name_th'] ?: ($project['project_name_en'] ?: 'Project #' . $projectId);
    $facultyId = project_document_faculty_id(
        $db,
        $auth,
        $project['responsible_faculty_id'] !== null ? (int) $project['responsible_faculty_id'] : null
    );

    $db->beginTransaction();

    $insertStmt = $db->prepare("
        INSERT INTO project_documents (project_id, name, project, type, date, status)
        VALUES (:project_id, :name, :project, :type, :date, 'pending')
    ");
    $insertStmt->execute([
        ':project_id' => $projectId,
        ':name' => $name,
        ':project' => $projectName,
        ':type' => $type,
        ':date' => $date,
    ]);

    $newDocumentId = (int) $db->lastInsertId();
    $uploadedFile = project_document_upload_file($_FILES['file'], $facultyId);
    $uploadedPathForCleanup = $uploadedFile['file_path'];

    $updateStmt = $db->prepare("
        UPDATE project_documents
        SET file_path = :file_path,
            file_name = :file_name,
            mime_type = :mime_type,
            file_size = :file_size,
            uploaded_by = :uploaded_by
        WHERE id = :id
    ");
    $updateStmt->execute([
        ':file_path' => $uploadedFile['file_path'],
        ':file_name' => $uploadedFile['file_name'],
        ':mime_type' => $uploadedFile['mime_type'],
        ':file_size' => $uploadedFile['file_size'],
        ':uploaded_by' => $auth['user_id'],
        ':id' => $newDocumentId,
    ]);

    $db->commit();
    $uploadedPathForCleanup = null;

    logAudit($db, $auth['user_id'], 'create', 'project_documents', "เพิ่มไฟล์เอกสารโครงการใหม่ (ID: {$newDocumentId}, ชื่อ: {$name}, ไฟล์: {$uploadedFile['file_name']})");

    project_json([
        "status" => "success",
        "message" => "อัปโหลดและบันทึกไฟล์สำเร็จ",
        "doc_id" => $newDocumentId,
        "file_path" => $uploadedFile['file_path'],
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    if ($uploadedPathForCleanup !== null) {
        project_document_delete_file($uploadedPathForCleanup);
    }

    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
