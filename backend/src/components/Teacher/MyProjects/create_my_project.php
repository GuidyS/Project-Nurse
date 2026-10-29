<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

function my_project_nullable_number(mixed $value, string $label): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException($label . "ต้องเป็นตัวเลข");
    }

    return (float) $value;
}

try {
    $projectId = project_validate_code($input['project_id'] ?? null);
    $nameTh = trim((string) ($input['project_name_th'] ?? ''));
    if ($nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"], 400);
        exit;
    }

    $facultyId = project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "error", "message" => "บัญชีผู้ใช้นี้ยังไม่ได้เชื่อมกับข้อมูลอาจารย์"], 400);
        exit;
    }

    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, $facultyId);
    $memberCount = count($memberFacultyIds) + 1;

    $academicYear = isset($input['academic_year']) && $input['academic_year'] !== ''
        ? (int) $input['academic_year']
        : null;
    if ($academicYear !== null && $academicYear <= 0) {
        project_json(["status" => "error", "message" => "ปีการศึกษาต้องมากกว่า 0"], 400);
        exit;
    }

    $budgetProposed = my_project_nullable_number($input['budget_proposed'] ?? null, 'งบเสนอ');
    $budgetSpent = my_project_nullable_number($input['budget_spent'] ?? null, 'งบที่ใช้จริง');
    if ($budgetProposed !== null && $budgetProposed < 0) {
        project_json(["status" => "error", "message" => "งบเสนอต้องไม่ติดลบ"], 400);
        exit;
    }
    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบที่ใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $startDate = !empty($input['start_date']) ? (string) $input['start_date'] : null;
    $endDate = !empty($input['end_date']) ? (string) $input['end_date'] : null;
    if ($startDate !== null && $endDate !== null && $endDate < $startDate) {
        project_json(["status" => "error", "message" => "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"], 400);
        exit;
    }

    $db->beginTransaction();
    project_u_lock_year($db, project_u_year($academicYear));

    $stmt = $db->prepare("
        INSERT INTO project (
            project_id,
            project_name_th,
            mapping_json,
            responsible_faculty_id,
            academic_year,
            status,
            start_date,
            end_date
        ) VALUES (
            :project_id,
            :project_name_th,
            :mapping_json,
            :responsible_faculty_id,
            :academic_year,
            :status,
            :start_date,
            :end_date
        )
    ");
    $stmt->execute([
        ':project_id' => $projectId,
        ':project_name_th' => $nameTh,
        ':mapping_json' => json_encode(['member_count' => $memberCount], JSON_UNESCAPED_UNICODE),
        ':responsible_faculty_id' => $facultyId,
        ':academic_year' => $academicYear,
        ':status' => project_normalize_status($input['status'] ?? 'active'),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
    ]);

    $id = (int) $db->lastInsertId();
    $fiscalYear = $academicYear ?: ((int) date('Y') + 543);

    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

    project_u_link_new($db, $projectId);
    project_u_metadata($db, $projectId, $input);
    project_u_save_flat_budget($db, $projectId, $input);

    $db->commit();

    logAudit($db, $auth['user_id'], 'create', 'my_projects', "สร้างโครงการใหม่: {$nameTh} (ID: {$projectId})");

    project_json([
        "status" => "success",
        "message" => "สร้างโครงการสำเร็จ",
        "project_id" => $projectId,
        "id" => $id,
    ]);
} catch (InvalidArgumentException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    project_json(["status" => "error", "message" => $e->getMessage()], 400);
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    $duplicateCode = (int) ($e->errorInfo[1] ?? 0) === 1062;
    project_json([
        "status" => "error",
        "message" => $duplicateCode ? "รหัสโครงการนี้มีอยู่แล้ว" : "ไม่สามารถสร้างโครงการได้",
    ], $duplicateCode ? 409 : 500);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    project_json(["status" => "error", "message" => $e->getMessage()], project_error_status($e));
}
?>