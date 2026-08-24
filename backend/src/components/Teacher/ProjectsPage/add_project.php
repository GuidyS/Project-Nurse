<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../MyProjects/my_project_member_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW', 'PROJECT_MY_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

function project_nullable_number(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    return is_numeric($value) ? (float) $value : null;
}

function project_clamp_percent(mixed $value): ?float
{
    if ($value === null || $value === '' || !is_numeric($value)) {
        return null;
    }

    return max(0, min(100, (float) $value));
}

try {
    $nameTh = trim((string) ($input['project_name_th'] ?? ''));
    if ($nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"], 400);
        exit;
    }

    $isPersonalProject = ($input['project_scope'] ?? '') === 'my' || !project_has_permission($auth, 'PROJECT_VIEW');
    $facultyId = $isPersonalProject ? project_resolve_faculty_id($db, $auth['user_id']) : null;
    if ($isPersonalProject && $facultyId === null) {
        project_json(["status" => "error", "message" => "ไม่พบข้อมูลอาจารย์ผู้รับผิดชอบของบัญชีนี้"], 400);
        exit;
    }

    $status = project_normalize_status($input['status'] ?? 'active');
    $academicYear = isset($input['academic_year']) && $input['academic_year'] !== '' ? (int) $input['academic_year'] : null;
    $budgetAllocated = project_nullable_number($input['budget_allocated'] ?? null);
    $budgetSpent = project_nullable_number($input['budget_spent'] ?? null);
    $progressPercent = project_clamp_percent($input['progress_percent'] ?? null);
    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, 0);
    $memberCount = array_key_exists('member_faculty_ids', $input)
        ? count($memberFacultyIds)
        : project_nullable_non_negative_int($input, 'member_count', 'จำนวนสมาชิก');

    if ($academicYear !== null && $academicYear <= 0) {
        project_json(["status" => "error", "message" => "ปีการศึกษาต้องเป็นตัวเลขมากกว่า 0"], 400);
        exit;
    }

    if ($budgetAllocated !== null && $budgetAllocated < 0) {
        project_json(["status" => "error", "message" => "งบประมาณที่ได้รับต้องไม่ติดลบ"], 400);
        exit;
    }

    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบที่ใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    if (!empty($input['start_date']) && !empty($input['end_date']) && $input['end_date'] < $input['start_date']) {
        project_json(["status" => "error", "message" => "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"], 400);
        exit;
    }

    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO project (
            project_name_th,
            project_name_en,
            description,
            strategy,
            mapping_json,
            responsible_faculty_id,
            academic_year,
            status,
            start_date,
            end_date
        ) VALUES (
            :name_th,
            :name_en,
            :description,
            :strategy,
            :mapping_json,
            :responsible_faculty_id,
            :academic_year,
            :status,
            :start_date,
            :end_date
        )
    ");
    $stmt->execute([
        ':name_th' => $nameTh,
        ':name_en' => trim((string) ($input['project_name_en'] ?? '')),
        ':description' => trim((string) ($input['description'] ?? '')),
        ':strategy' => trim((string) ($input['strategy'] ?? '')) ?: null,
        ':mapping_json' => $memberCount !== null ? json_encode(['member_count' => $memberCount], JSON_UNESCAPED_UNICODE) : null,
        ':responsible_faculty_id' => $facultyId,
        ':academic_year' => $academicYear,
        ':status' => $status,
        ':start_date' => !empty($input['start_date']) ? $input['start_date'] : null,
        ':end_date' => !empty($input['end_date']) ? $input['end_date'] : null,
    ]);

    $projectId = (int) $db->lastInsertId();
    $fiscalYear = $academicYear ?: (int) date('Y') + 543;

    if (array_key_exists('member_faculty_ids', $input)) {
        my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);
    }

    if ($budgetAllocated !== null || $budgetSpent !== null) {
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
            ':period_label' => 'เริ่มต้นโครงการ',
            ':planned_percent' => 100,
            ':actual_percent' => $progressPercent,
            ':logged_at' => !empty($input['start_date']) ? $input['start_date'] : date('Y-m-d'),
        ]);
    }

    $db->commit();

    project_json([
        "status" => "success",
        "message" => "เพิ่มโครงการสำเร็จ",
        "project_id" => $projectId,
    ]);
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
