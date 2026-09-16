<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../MyProjects/my_project_member_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

function update_project_page_nullable_number(mixed $value, string $label): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException($label . 'ต้องเป็นตัวเลข');
    }

    return (float) $value;
}

function update_project_page_budget_result(array $input): ?string
{
    $source = trim((string)($input['budget_source'] ?? ''));
    $note = trim((string)($input['budget_note'] ?? ''));
    $parts = [];

    if ($source !== '') {
        $parts[] = 'แหล่งงบ: ' . $source;
    }

    if ($note !== '') {
        $parts[] = $note;
    }

    return empty($parts) ? null : implode(' | ', $parts);
}

function update_project_page_responsible_faculty_id(PDO $db, array $input): int
{
    $facultyId = filter_var($input['responsible_faculty_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($facultyId === false) {
        throw new InvalidArgumentException('กรุณาเลือกผู้ดำเนินโครงการ');
    }

    $stmt = $db->prepare('SELECT faculty_id FROM faculty WHERE faculty_id = :faculty_id LIMIT 1');
    $stmt->execute([':faculty_id' => (int)$facultyId]);
    if ($stmt->fetchColumn() === false) {
        throw new InvalidArgumentException('ไม่พบอาจารย์ผู้ดำเนินโครงการในระบบ');
    }

    return (int)$facultyId;
}

try {
    $projectId = isset($input['project_id']) ? (int)$input['project_id'] : 0;
    $nameTh = trim((string)($input['project_name_th'] ?? ''));

    if ($projectId <= 0 || $nameTh === '') {
        project_json(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], 400);
        exit;
    }

    $allowedProjectTypes = ['academic_service', 'culture', 'other'];
    $projectType = $input['project_type'] ?? 'other';
    if (!in_array($projectType, $allowedProjectTypes, true)) {
        project_json(["status" => "error", "message" => "ประเภทโครงการไม่ถูกต้อง"], 422);
        exit;
    }

    $academicYear = (int)($input['academic_year'] ?? 0);
    if ($academicYear < 2500 || $academicYear > 2700) {
        project_json(["status" => "error", "message" => "ปีการศึกษาต้องอยู่ระหว่าง พ.ศ. 2500-2700"], 422);
        exit;
    }

    $startDate = !empty($input['start_date']) ? (string)$input['start_date'] : null;
    $endDate = !empty($input['end_date']) ? (string)$input['end_date'] : null;
    if ($startDate !== null && $endDate !== null && $endDate < $startDate) {
        project_json(["status" => "error", "message" => "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"], 400);
        exit;
    }

    $budgetAllocated = update_project_page_nullable_number($input['budget_allocated'] ?? null, 'งบเสนอ');
    $budgetSpent = update_project_page_nullable_number($input['budget_spent'] ?? null, 'งบใช้จริง');
    if ($budgetAllocated !== null && $budgetAllocated < 0) {
        project_json(["status" => "error", "message" => "งบเสนอต้องไม่ติดลบ"], 400);
        exit;
    }
    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $status = project_normalize_status($input['status'] ?? 'active');
    $responsibleFacultyId = update_project_page_responsible_faculty_id($db, $input);
    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, $responsibleFacultyId);
    $memberCount = count($memberFacultyIds) + 1;

    $currentStmt = $db->prepare("SELECT project_type FROM project WHERE project_id = :project_id LIMIT 1");
    $currentStmt->execute([':project_id' => $projectId]);
    $currentProjectType = $currentStmt->fetchColumn();
    if ($currentProjectType === false) {
        project_json(["status" => "error", "message" => "ไม่พบโครงการ"], 404);
        exit;
    }

    if ($projectType !== 'academic_service') {
        $linkStmt = $db->prepare("SELECT COUNT(*) FROM project_outcome_links WHERE project_id = :project_id");
        $linkStmt->execute([':project_id' => $projectId]);
        if ((int)$linkStmt->fetchColumn() > 0) {
            project_json([
                "status" => "error",
                "message" => "โครงการนี้มีการเชื่อม CLO/PLO/YLO อยู่ กรุณานำการเชื่อมโยงออกก่อนเปลี่ยนประเภท",
            ], 409);
            exit;
        }
    }

    if ($status === 'completed') {
        $progressStmt = $db->prepare("SELECT COALESCE(MAX(actual_percent), 0) FROM project_progress_logs WHERE project_id = :project_id");
        $progressStmt->execute([':project_id' => $projectId]);
        if ((float)$progressStmt->fetchColumn() < 100) {
            project_json(["status" => "error", "message" => "ต้องมีความคืบหน้า 100% ก่อนเปลี่ยนเป็นเสร็จสิ้น"], 400);
            exit;
        }
    }

    if ($projectType !== 'culture') {
        $satisfactionStmt = $db->prepare("SELECT COUNT(*) FROM project_satisfaction_responses WHERE project_id = :project_id");
        $satisfactionStmt->execute([':project_id' => $projectId]);
        if ((int)$satisfactionStmt->fetchColumn() > 0) {
            project_json([
                "status" => "error",
                "message" => "โครงการนี้มีข้อมูลความพึงพอใจอยู่ กรุณาลบข้อมูลก่อนเปลี่ยนประเภท",
            ], 409);
            exit;
        }
    }

    $db->beginTransaction();

    $stmt = $db->prepare("
        UPDATE project
        SET project_name_th = :name_th,
            project_name_en = :name_en,
            description = :description,
            project_type = :project_type,
            responsible_faculty_id = :responsible_faculty_id,
            academic_year = :academic_year,
            status = :status,
            start_date = :start_date,
            end_date = :end_date,
            mapping_json = JSON_SET(COALESCE(mapping_json, JSON_OBJECT()), '$.member_count', :member_count)
        WHERE project_id = :project_id
    ");
    $stmt->execute([
        ':name_th' => $nameTh,
        ':name_en' => trim((string)($input['project_name_en'] ?? '')),
        ':description' => trim((string)($input['description'] ?? '')),
        ':project_type' => $projectType,
        ':responsible_faculty_id' => $responsibleFacultyId,
        ':academic_year' => $academicYear,
        ':status' => $status,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':member_count' => $memberCount,
        ':project_id' => $projectId,
    ]);

    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

    $budgetResult = update_project_page_budget_result($input);
    $deleteBudgetStmt = $db->prepare('DELETE FROM project_budget_years WHERE project_id = :project_id');
    $deleteBudgetStmt->execute([':project_id' => $projectId]);

    if ($budgetAllocated !== null || $budgetSpent !== null || $budgetResult !== null) {
        $budgetStmt = $db->prepare("
            INSERT INTO project_budget_years (
                project_id,
                fiscal_year,
                budget_allocated,
                budget_spent,
                result
            ) VALUES (
                :project_id,
                :fiscal_year,
                :budget_allocated,
                :budget_spent,
                :result
            )
        ");
        $budgetStmt->execute([
            ':project_id' => $projectId,
            ':fiscal_year' => $academicYear,
            ':budget_allocated' => $budgetAllocated ?? 0,
            ':budget_spent' => $budgetSpent ?? 0,
            ':result' => $budgetResult,
        ]);
    }

    $db->commit();

    project_json(["status" => "success", "message" => "แก้ไขข้อมูลสำเร็จ"]);
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
