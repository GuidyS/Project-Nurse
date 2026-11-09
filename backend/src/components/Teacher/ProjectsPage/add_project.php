<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../MyProjects/my_project_member_helpers.php';
require_once __DIR__ . '/../ProjectReminder/project_reminder_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW']);
project_require_admin_write($auth);
$input = project_payload();

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
    $projectId = project_validate_code($input['project_id'] ?? null);
    $nameTh = trim((string)($input['project_name_th'] ?? ''));
    if ($nameTh === '') {
        project_json(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"], 400);
        exit;
    }

    $allowedProjectTypes = ['academic_service', 'culture', 'research', 'teaching', 'quality_assurance', 'other'];
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

    $status = project_normalize_status($input['status'] ?? 'active');

    $totalBudget = project_u_total_budget($input['total_budget'] ?? null);

    $responsibleFacultyId = project_page_responsible_faculty_id($db, $input);
    my_project_ensure_member_table($db);
    $memberFacultyIds = my_project_normalize_member_faculty_ids($db, $input, $responsibleFacultyId);

    $db->beginTransaction();
    project_u_lock_year($db, project_u_year($academicYear));

    $stmt = $db->prepare("
        INSERT INTO project (
            project_id,
            project_name_th,
            project_type,
            responsible_faculty_id,
            academic_year,
            status,
            start_date,
            end_date
        ) VALUES (
            :project_id,
            :name_th,
            :project_type,
            :responsible_faculty_id,
            :academic_year,
            :status,
            :start_date,
            :end_date
        )
    ");
    $stmt->execute([
        ':project_id' => $projectId,
        ':name_th' => $nameTh,
        ':project_type' => $projectType,
        ':responsible_faculty_id' => $responsibleFacultyId,
        ':academic_year' => $academicYear,
        ':status' => $status,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
    ]);

    $id = (int) $db->lastInsertId();
    my_project_replace_faculty_members($db, $projectId, $memberFacultyIds);

    project_u_link_new($db, $projectId);
    project_u_metadata($db, $projectId, $input);
    project_u_save_total_budget($db, $projectId, ['total_budget' => $totalBudget]);
    project_u_save_activities($db, $projectId, $input);

    $db->commit();

    logAudit($db, $auth['user_id'], 'create', 'projects', "เพิ่มโครงการใหม่: {$nameTh} (ID: {$projectId})");

    // วันสิ้นสุดอาจอยู่ในช่วงแจ้งเตือนแล้ว → เช็กโครงการนี้ทันที (พังก็ไม่กระทบการบันทึก)
    try {
        session_write_close();
        projectReminderProcess($db, $projectId);
    } catch (Throwable $e) {
        error_log('project reminder: ' . $e->getMessage());
    }

    project_json([
        "status" => "success",
        "message" => "เพิ่มโครงการสำเร็จ",
        "data" => ["id" => $id, "project_id" => $projectId],
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
