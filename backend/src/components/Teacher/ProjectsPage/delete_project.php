<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

try {
    $projectId = project_validate_code($input['project_id'] ?? null);
    if ($projectId === '') {
        project_json(["status" => "error", "message" => "Missing ID"], 400);
        exit;
    }

    $exists = project_u_query($db,'SELECT project_id FROM project WHERE project_id=?',[$projectId])->fetchColumn();
    if ($exists === false) {project_json(['status'=>'error','message'=>'ไม่พบโครงการ'],404);exit;}
    $db->beginTransaction();

    project_u_guard($db, $projectId);
    if (project_u_code_pending($db, $projectId)) throw new ProjectConflict('ต้องตรวจข้อมูลเดิมก่อนลบโครงการ');
    $root = project_u_root($db, $projectId);
    if ($root !== null) {
        project_u_query($db, 'DELETE FROM project_report_links WHERE project_id=?', [$projectId]);
        project_u_query($db, 'DELETE FROM annual_project_report_items WHERE parent_item_id=?', [$root]);
        project_u_query($db, 'DELETE FROM annual_project_report_items WHERE id=?', [$root]);
    }
    // Cascading children are removed by MySQL; faculty members intentionally RESTRICT deletion.
    $stmt = $db->prepare("DELETE FROM project WHERE project_id = :id");
    $stmt->execute([':id' => $projectId]);

    if ($stmt->rowCount() === 0) {
        $db->rollBack();
        project_json(["status" => "error", "message" => "ไม่พบโครงการที่ต้องการลบ"], 404);
        exit;
    }

    $db->commit();

    logAudit($db, $auth['user_id'], 'delete', 'projects', "ลบข้อมูลโครงการ (ID: {$projectId})");

    project_json(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
} catch (InvalidArgumentException $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 400);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    if ($e instanceof ProjectConflict) { project_json(['status'=>'error','message'=>$e->getMessage()],409); return; }
    if ($e instanceof PDOException && (int) ($e->errorInfo[1] ?? 0) === 1451) {
        project_json(["status" => "error", "message" => "ไม่สามารถลบโครงการได้ เนื่องจากมีข้อมูลอื่นอ้างอิงอยู่"], 409);
    } else {
        project_json(["status" => "error", "message" => "เกิดข้อผิดพลาดในการลบโครงการ กรุณาลองใหม่อีกครั้ง"], 500);
    }
}
?>
