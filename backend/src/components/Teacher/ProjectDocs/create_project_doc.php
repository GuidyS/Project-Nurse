<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
project_require_auth($db, ['PROJECT_DOCS_MANAGE']);
$input = project_payload();

try {
    $name = trim((string) ($input['name'] ?? ''));
    $projectId = isset($input['project_id']) ? (int) $input['project_id'] : 0;
    $type = trim((string) ($input['type'] ?? ''));
    $date = trim((string) ($input['date'] ?? ''));

    $allowedTypes = ['proposal', 'progress', 'financial', 'summary'];
    if ($name === '' || $projectId <= 0 || $type === '' || $date === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกข้อมูลเอกสารให้ครบถ้วน"], 400);
        exit;
    }
    if (!in_array($type, $allowedTypes, true)) {
        project_json(["status" => "error", "message" => "ประเภทเอกสารไม่ถูกต้อง"], 400);
        exit;
    }

    $project = project_require_existing_project($db, $projectId);
    $projectName = $project['project_name_th'] ?: ($project['project_name_en'] ?: 'Project #' . $projectId);

    $stmt = $db->prepare("
        INSERT INTO project_documents (project_id, name, project, type, date, status)
        VALUES (:project_id, :name, :project, :type, :date, 'pending')
    ");
    $stmt->execute([
        ':project_id' => $projectId,
        ':name' => $name,
        ':project' => $projectName,
        ':type' => $type,
        ':date' => $date,
    ]);

    project_json([
        "status" => "success",
        "message" => "บันทึกเอกสารเข้าสู่ระบบสำเร็จแล้ว",
        "doc_id" => (int) $db->lastInsertId(),
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
}
?>
