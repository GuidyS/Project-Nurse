<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

try {
    $projectId = isset($input['project_id']) ? (int)$input['project_id'] : 0;
    if ($projectId <= 0) {
        project_json(["status" => "error", "message" => "Missing ID"], 400);
        exit;
    }

    $db->beginTransaction();

    $stmt = $db->prepare("DELETE FROM student_project_outcome_results WHERE project_id = :id");
    $stmt->execute([':id' => $projectId]);
    $stmt = $db->prepare("DELETE FROM project_satisfaction_responses WHERE project_id = :id");
    $stmt->execute([':id' => $projectId]);
    $stmt = $db->prepare("DELETE FROM project WHERE project_id = :id");
    $stmt->execute([':id' => $projectId]);

    $db->commit();

    logAudit($db, $auth['user_id'], 'delete', 'projects', "ลบข้อมูลโครงการ (ID: {$projectId})");

    project_json(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    project_json(["status" => "error", "message" => "ไม่สามารถลบได้ (อาจมีการใช้งานอยู่)"], 500);
}
?>