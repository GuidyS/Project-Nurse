<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

function update_my_project_nullable_number(mixed $value, string $label): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException($label . 'ต้องเป็นตัวเลข');
    }

    return (float) $value;
}

try {
    $projectId = project_validate_code($input['project_id'] ?? null);
    $nameTh = trim((string) ($input['project_name_th'] ?? ''));

    if ($projectId === '' || $nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณาระบุรหัสโครงการและชื่อโครงการ"], 400);
        exit;
    }

    $facultyId = project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "error", "message" => "บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์"], 400);
        exit;
    }

    $project = project_require_existing_project($db, $projectId);
    if ((int) ($project['responsible_faculty_id'] ?? 0) !== $facultyId) {
        project_json(["status" => "error", "message" => "ไม่มีสิทธิ์แก้ไขโครงการนี้"], 403);
        exit;
    }

    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, $facultyId);
    $memberCount = count($memberFacultyIds) + 1;

    if (!empty($input['start_date']) && !empty($input['end_date']) && $input['end_date'] < $input['start_date']) {
        project_json(["status" => "error", "message" => "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"], 400);
        exit;
    }

    $hasBudgetInput = array_key_exists('budget_proposed', $input) || array_key_exists('budget_spent', $input);
    $budgetProposed = $hasBudgetInput ? update_my_project_nullable_number($input['budget_proposed'] ?? null, 'งบเสนอ') : null;
    $budgetSpent = $hasBudgetInput ? update_my_project_nullable_number($input['budget_spent'] ?? null, 'งบที่ใช้จริง') : null;

    if ($budgetProposed !== null && $budgetProposed < 0) {
        project_json(["status" => "error", "message" => "งบเสนอต้องไม่ติดลบ"], 400);
        exit;
    }

    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบที่ใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $fields = [
        'project_name_th = :project_name_th',
    ];
    $params = [
        ':project_name_th' => $nameTh,
        ':project_id' => $projectId,
    ];

    if (array_key_exists('academic_year', $input)) {
        $academicYear = $input['academic_year'] !== '' && $input['academic_year'] !== null
            ? (int) $input['academic_year']
            : null;
        if ($academicYear !== null && $academicYear <= 0) {
            project_json(["status" => "error", "message" => "ปีการศึกษาต้องมากกว่า 0"], 400);
            exit;
        }

        $fields[] = 'academic_year = :academic_year';
        $params[':academic_year'] = $academicYear;
    }

    if (array_key_exists('status', $input)) {
        $fields[] = 'status = :status';
        $params[':status'] = project_normalize_status($input['status'] ?? 'active');
    }

    if (array_key_exists('start_date', $input)) {
        $fields[] = 'start_date = :start_date';
        $params[':start_date'] = !empty($input['start_date']) ? $input['start_date'] : null;
    }

    if (array_key_exists('end_date', $input)) {
        $fields[] = 'end_date = :end_date';
        $params[':end_date'] = !empty($input['end_date']) ? $input['end_date'] : null;
    }

    $fields[] = "mapping_json = JSON_SET(COALESCE(mapping_json, JSON_OBJECT()), '$.member_count', :member_count)";
    $params[':member_count'] = $memberCount;

    $db->beginTransaction();
    $currentProject = project_u_guard($db, $projectId);
    $projectId = (string)$currentProject['project_id'];
    project_u_require_root($db, $projectId);
    if (isset($input['academic_year']) && (int)$input['academic_year'] !== (int)$currentProject['academic_year']) {
        throw new ProjectConflict('โครงการของปีใหม่ต้องสร้างเป็นรายการใหม่');
    }

    $stmt = $db->prepare('UPDATE project SET ' . implode(', ', $fields) . ' WHERE project_id = :project_id');
    $stmt->execute($params);

    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

    project_u_metadata($db, $projectId, $input);
    project_u_save_flat_budget($db, $projectId, $input);

    $db->commit();

    logAudit($db, $auth['user_id'], 'update', 'my_projects', "แก้ไขข้อมูลโครงการ: {$nameTh} (ID: {$projectId})");

    project_json(["status" => "success", "message" => "บันทึกการแก้ไขโครงการสำเร็จ"]);
} catch (InvalidArgumentException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    project_json(["status" => "error", "message" => $e->getMessage()], 400);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    project_json(["status" => "error", "message" => $e->getMessage()], project_error_status($e));
}
?>