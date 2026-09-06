<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../MyProjects/my_project_member_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

function project_page_nullable_number(mixed $value, string $label): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value)) {
        throw new InvalidArgumentException($label . 'ต้องเป็นตัวเลข');
    }

    return (float) $value;
}

function project_page_budget_result(array $input): ?string
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

function project_page_responsible_faculty_id(PDO $db, array $input): int
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
    $nameTh = trim((string)($input['project_name_th'] ?? ''));
    if ($nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"], 400);
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

    $status = project_normalize_status($input['status'] ?? 'pending');
    if ($status === 'completed') {
        project_json(["status" => "error", "message" => "โครงการใหม่ยังตั้งสถานะเสร็จสิ้นไม่ได้"], 400);
        exit;
    }

    $budgetAllocated = project_page_nullable_number($input['budget_allocated'] ?? null, 'งบเสนอ');
    $budgetSpent = project_page_nullable_number($input['budget_spent'] ?? null, 'งบใช้จริง');
    if ($budgetAllocated !== null && $budgetAllocated < 0) {
        project_json(["status" => "error", "message" => "งบเสนอต้องไม่ติดลบ"], 400);
        exit;
    }
    if ($budgetSpent !== null && $budgetSpent < 0) {
        project_json(["status" => "error", "message" => "งบใช้จริงต้องไม่ติดลบ"], 400);
        exit;
    }

    $responsibleFacultyId = project_page_responsible_faculty_id($db, $input);
    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, $responsibleFacultyId);
    $memberCount = count($memberFacultyIds) + 1;

    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO project (
            project_name_th,
            project_name_en,
            description,
            project_type,
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
            :project_type,
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
        ':name_en' => trim((string)($input['project_name_en'] ?? '')),
        ':description' => trim((string)($input['description'] ?? '')),
        ':project_type' => $projectType,
        ':mapping_json' => json_encode(['member_count' => $memberCount], JSON_UNESCAPED_UNICODE),
        ':responsible_faculty_id' => $responsibleFacultyId,
        ':academic_year' => $academicYear,
        ':status' => $status,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
    ]);

    $projectId = (int)$db->lastInsertId();
    $budgetResult = project_page_budget_result($input);
    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

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

    project_json([
        "status" => "success",
        "message" => "เพิ่มโครงการสำเร็จ",
        "data" => ["project_id" => $projectId],
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
