<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
project_require_auth($db, ['PROJECT_DOCS_MANAGE']);

try {
    $projectId = project_request_code();
    if (isset($_GET['project_id']) && $_GET['project_id'] !== '' && $projectId === null) {
        project_json(["status" => "error", "message" => "รหัสโครงการไม่ถูกต้อง"], 400);
        exit;
    }

    if ($projectId !== null) {
        project_require_existing_project($db, $projectId);
    }

    $docsSql = "
        SELECT
            d.id,
            d.project_id,
            d.name,
            d.report_item_id,
            d.report_document_type,
            COALESCE(NULLIF(TRIM(p.project_name_th), ''), CASE WHEN d.project_id IS NOT NULL THEN CONCAT('โครงการ #', d.project_id) ELSE d.project END) AS project,
            d.project AS legacy_project_name,
            d.type,
            d.date,
            d.file_path,
            d.file_name,
            d.mime_type,
            d.file_size,
            CASE WHEN d.project_id IS NULL THEN 0 ELSE 1 END AS linked,
            CASE WHEN d.project_id IS NULL THEN 1 ELSE 0 END AS legacy
        FROM project_documents d
        LEFT JOIN project p ON p.project_id = d.project_id
    ";
    $params = [];
    if ($projectId !== null) {
        $docsSql .= " WHERE d.project_id = :project_id";
        $params[':project_id'] = $projectId;
    }
    $docsSql .= " ORDER BY d.date DESC, d.id DESC";

    $docsStmt = $db->prepare($docsSql);
    $docsStmt->execute($params);
    $docs = project_u_documents($docsStmt->fetchAll(PDO::FETCH_ASSOC));

    $projects = $db->query("
        SELECT
            id,
            project_id,
            COALESCE(NULLIF(TRIM(project_name_th), ''), CONCAT('โครงการ #', project_id)) AS name
        FROM project
        ORDER BY project_id DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    project_json([
        "status" => "success",
        "data" => [
            "docs" => $docs,
            "projects" => $projects,
            "selectedProjectId" => $projectId,
            "source" => "project_documents",
            "schema_version" => "2026-08-11.db-completeness-v1",
        ],
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => "ไม่สามารถดึงข้อมูลเอกสารจากระบบได้: " . $e->getMessage()], project_error_status($e));
}
?>
