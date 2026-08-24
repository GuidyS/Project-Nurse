<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';

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

function my_project_nullable_percent(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException("ความคืบหน้าต้องเป็นตัวเลข");
    }

    return max(0, min(100, (float) $value));
}

try {
    $nameTh = trim((string) ($input['project_name_th'] ?? ''));
    if ($nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกชื่อโครงการภาษาไทย"], 400);
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

    $budgetAllocated = my_project_nullable_number($input['budget_allocated'] ?? null, 'งบประมาณที่ได้รับ');
    $budgetSpent = my_project_nullable_number($input['budget_spent'] ?? null, 'งบที่ใช้จริง');
    if ($budgetAllocated !== null && $budgetAllocated < 0) {
        project_json(["status" => "error", "message" => "งบประมาณที่ได้รับต้องไม่ติดลบ"], 400);
        exit;
    }
    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบที่ใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $progressPercent = my_project_nullable_percent($input['progress_percent'] ?? null);
    $startDate = !empty($input['start_date']) ? (string) $input['start_date'] : null;
    $endDate = !empty($input['end_date']) ? (string) $input['end_date'] : null;
    if ($startDate !== null && $endDate !== null && $endDate < $startDate) {
        project_json(["status" => "error", "message" => "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"], 400);
        exit;
    }

    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO project (
            project_name_th,
            project_name_en,
            description,
            mapping_json,
            responsible_faculty_id,
            academic_year,
            status,
            start_date,
            end_date
        ) VALUES (
            :project_name_th,
            :project_name_en,
            :description,
            :mapping_json,
            :responsible_faculty_id,
            :academic_year,
            :status,
            :start_date,
            :end_date
        )
    ");
    $stmt->execute([
        ':project_name_th' => $nameTh,
        ':project_name_en' => trim((string) ($input['project_name_en'] ?? '')),
        ':description' => trim((string) ($input['description'] ?? '')),
        ':mapping_json' => json_encode(['member_count' => $memberCount], JSON_UNESCAPED_UNICODE),
        ':responsible_faculty_id' => $facultyId,
        ':academic_year' => $academicYear,
        ':status' => project_normalize_status($input['status'] ?? 'active'),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
    ]);

    $projectId = (int) $db->lastInsertId();
    $fiscalYear = $academicYear ?: ((int) date('Y') + 543);

    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

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
            ':logged_at' => $startDate ?: date('Y-m-d'),
        ]);
    }

    $db->commit();

    project_json([
        "status" => "success",
        "message" => "สร้างโครงการสำเร็จ",
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
