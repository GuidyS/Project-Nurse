<?php

function my_project_ensure_member_table(PDO $db): void
{
    $stmt = $db->query("
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'project_faculty_members'
    ");
    if ((int)$stmt->fetchColumn() === 0) {
        throw new RuntimeException('ไม่พบตาราง project_faculty_members กรุณาติดตั้ง schema ที่รองรับก่อนจัดการสมาชิกโครงการ');
    }
}

function my_project_normalize_member_faculty_ids(PDO $db, array $input, int $ownerFacultyId): array
{
    if (!array_key_exists('member_faculty_ids', $input) || $input['member_faculty_ids'] === null) {
        return [];
    }

    if (!is_array($input['member_faculty_ids'])) {
        throw new InvalidArgumentException('รายชื่อสมาชิกผู้ร่วมโครงการไม่ถูกต้อง');
    }

    $memberIds = [];
    foreach ($input['member_faculty_ids'] as $value) {
        $facultyId = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($facultyId === false) {
            throw new InvalidArgumentException('รหัสอาจารย์ผู้ร่วมโครงการไม่ถูกต้อง');
        }

        $facultyId = (int) $facultyId;
        if ($facultyId !== $ownerFacultyId) {
            $memberIds[$facultyId] = $facultyId;
        }
    }

    if (empty($memberIds)) {
        return [];
    }

    $placeholders = [];
    $params = [];
    foreach (array_values($memberIds) as $index => $facultyId) {
        $key = ':faculty_id_' . $index;
        $placeholders[] = $key;
        $params[$key] = $facultyId;
    }

    $stmt = $db->prepare("
        SELECT faculty_id
        FROM faculty
        WHERE faculty_id IN (" . implode(',', $placeholders) . ")
    ");
    $stmt->execute($params);
    $existingIds = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN) ?: []);

    if (count($existingIds) !== count($memberIds)) {
        throw new InvalidArgumentException('พบรายชื่ออาจารย์ผู้ร่วมโครงการที่ไม่มีในระบบ');
    }

    sort($existingIds);
    return $existingIds;
}

function my_project_replace_faculty_members(PDO $db, int $projectId, array $memberFacultyIds): void
{
    $deleteStmt = $db->prepare('DELETE FROM project_faculty_members WHERE project_id = :project_id');
    $deleteStmt->execute([':project_id' => $projectId]);

    if (empty($memberFacultyIds)) {
        return;
    }

    $insertStmt = $db->prepare("
        INSERT INTO project_faculty_members (project_id, faculty_id)
        VALUES (:project_id, :faculty_id)
    ");

    foreach ($memberFacultyIds as $facultyId) {
        $insertStmt->execute([
            ':project_id' => $projectId,
            ':faculty_id' => (int) $facultyId,
        ]);
    }
}

?>
