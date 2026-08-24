<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';

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

function update_my_project_nullable_percent(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException('ความคืบหน้าต้องเป็นตัวเลข');
    }

    return max(0, min(100, (float) $value));
}

try {
    $projectId = isset($input['project_id']) ? (int) $input['project_id'] : 0;
    $nameTh = trim((string) ($input['project_name_th'] ?? ''));

    if ($projectId <= 0 || $nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณาระบุรหัสโครงการและชื่อโครงการภาษาไทย"], 400);
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

    $hasBudgetInput = array_key_exists('budget_allocated', $input) || array_key_exists('budget_spent', $input);
    $hasProgressInput = array_key_exists('progress_percent', $input);
    $budgetAllocated = $hasBudgetInput ? update_my_project_nullable_number($input['budget_allocated'] ?? null, 'งบประมาณที่ได้รับ') : null;
    $budgetSpent = $hasBudgetInput ? update_my_project_nullable_number($input['budget_spent'] ?? null, 'งบที่ใช้จริง') : null;
    $progressPercent = $hasProgressInput ? update_my_project_nullable_percent($input['progress_percent'] ?? null) : null;

    if ($budgetAllocated !== null && $budgetAllocated < 0) {
        project_json(["status" => "error", "message" => "งบประมาณที่ได้รับต้องไม่ติดลบ"], 400);
        exit;
    }

    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบที่ใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $fields = [
        'project_name_th = :project_name_th',
        'project_name_en = :project_name_en',
        'description = :description',
    ];
    $params = [
        ':project_name_th' => $nameTh,
        ':project_name_en' => trim((string) ($input['project_name_en'] ?? '')),
        ':description' => trim((string) ($input['description'] ?? '')),
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

    $stmt = $db->prepare('UPDATE project SET ' . implode(', ', $fields) . ' WHERE project_id = :project_id');
    $stmt->execute($params);

    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

    if ($hasBudgetInput) {
        $deleteBudgetStmt = $db->prepare('DELETE FROM project_budget_years WHERE project_id = :project_id');
        $deleteBudgetStmt->execute([':project_id' => $projectId]);

        if ($budgetAllocated !== null || $budgetSpent !== null) {
            $fiscalYear = isset($input['academic_year']) && $input['academic_year'] !== '' && $input['academic_year'] !== null
                ? (int) $input['academic_year']
                : (int) date('Y') + 543;
            $budgetStmt = $db->prepare("
                INSERT INTO project_budget_years (
                    project_id,
                    fiscal_year,
                    budget_allocated,
                    budget_spent
                ) VALUES (
                    :project_id,
                    :fiscal_year,
                    :budget_allocated,
                    :budget_spent
                )
            ");
            $budgetStmt->execute([
                ':project_id' => $projectId,
                ':fiscal_year' => $fiscalYear,
                ':budget_allocated' => $budgetAllocated ?? 0,
                ':budget_spent' => $budgetSpent ?? 0,
            ]);
        }
    }

    if ($hasProgressInput) {
        $deleteProgressStmt = $db->prepare('DELETE FROM project_progress_logs WHERE project_id = :project_id');
        $deleteProgressStmt->execute([':project_id' => $projectId]);

        if ($progressPercent !== null) {
            $progressStmt = $db->prepare("
                INSERT INTO project_progress_logs (
                    project_id,
                    period_label,
                    planned_percent,
                    actual_percent,
                    logged_at
                ) VALUES (
                    :project_id,
                    :period_label,
                    :planned_percent,
                    :actual_percent,
                    :logged_at
                )
            ");
            $progressStmt->execute([
                ':project_id' => $projectId,
                ':period_label' => 'อัปเดตความคืบหน้า',
                ':planned_percent' => 100,
                ':actual_percent' => $progressPercent,
                ':logged_at' => !empty($input['start_date']) ? $input['start_date'] : date('Y-m-d'),
            ]);
        }
    }

    $db->commit();

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

    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
