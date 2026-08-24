<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

try {
    $projectId = isset($input['project_id']) ? (int) $input['project_id'] : 0;
    if ($projectId <= 0) {
        project_json(["status" => "error", "message" => "Missing ID"], 400);
        exit;
    }

    project_require_existing_project($db, $projectId);

    $stmt = $db->prepare("DELETE FROM project WHERE project_id = :project_id");
    $stmt->execute([':project_id' => $projectId]);

    project_json(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => "ไม่สามารถลบได้: " . $e->getMessage()], 500);
}
?>
