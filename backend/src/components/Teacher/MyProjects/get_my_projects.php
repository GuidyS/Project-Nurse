<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);

try {
    $facultyId = project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "success", "data" => []]);
        exit;
    }

    my_project_ensure_member_table($db);

    $stmt = $db->prepare("
        SELECT
            p.project_id AS id,
            COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), CONCAT('Project #', p.project_id)) AS name,
            p.responsible_faculty_id,
            p.academic_year,
            p.status,
            p.end_date,
            p.project_name_th,
            p.project_name_en,
            p.description,
            p.start_date,
            COALESCE(pfm.members, 0) + 1 AS members,
            COALESCE(pb.budget, 0) AS budget,
            COALESCE(pb.spent, 0) AS spent,
            COALESCE(pl.progress, 0) AS progress
        FROM project p
        LEFT JOIN (
            SELECT project_id, COUNT(DISTINCT faculty_id) AS members
            FROM project_faculty_members
            GROUP BY project_id
        ) pfm ON pfm.project_id = p.project_id
        LEFT JOIN (
            SELECT project_id,
                   SUM(COALESCE(budget_allocated, 0)) AS budget,
                   SUM(COALESCE(budget_spent, 0)) AS spent
            FROM project_budget_years
            GROUP BY project_id
        ) pb ON pb.project_id = p.project_id
        LEFT JOIN (
            SELECT project_id, MAX(actual_percent) AS progress
            FROM project_progress_logs
            GROUP BY project_id
        ) pl ON pl.project_id = p.project_id
        WHERE p.responsible_faculty_id = :owner_faculty_id
           OR EXISTS (
                SELECT 1
                FROM project_faculty_members visible_member
                WHERE visible_member.project_id = p.project_id
                  AND visible_member.faculty_id = :member_faculty_id
           )
        ORDER BY p.project_id DESC
    ");
    $stmt->execute([
        ':owner_faculty_id' => $facultyId,
        ':member_faculty_id' => $facultyId,
    ]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $documentsByProject = [];
    $membersByProject = [];
    $projectIds = array_values(array_filter(array_map(
        static fn(array $project): int => (int) $project['id'],
        $rows
    )));

    if (!empty($projectIds)) {
        $placeholders = [];
        $params = [':uploaded_by' => $auth['user_id']];
        foreach ($projectIds as $index => $projectId) {
            $key = ':project_id_' . $index;
            $placeholders[] = $key;
            $params[$key] = $projectId;
        }

        $docsStmt = $db->prepare("
            SELECT
                id,
                project_id,
                name,
                type,
                date,
                file_path,
                file_name,
                mime_type,
                file_size
            FROM project_documents
            WHERE uploaded_by = :uploaded_by
              AND project_id IN (" . implode(',', $placeholders) . ")
              AND file_path IS NOT NULL
              AND TRIM(file_path) <> ''
            ORDER BY date DESC, id DESC
        ");
        $docsStmt->execute($params);

        foreach ($docsStmt->fetchAll(PDO::FETCH_ASSOC) as $document) {
            $projectId = (string) $document['project_id'];
            $documentsByProject[$projectId][] = [
                "id" => (int) $document['id'],
                "name" => $document['name'],
                "type" => $document['type'],
                "date" => $document['date'],
                "file_path" => $document['file_path'],
                "file_name" => $document['file_name'],
                "mime_type" => $document['mime_type'],
                "file_size" => $document['file_size'] !== null ? (int) $document['file_size'] : null,
            ];
        }

        foreach ($rows as $project) {
            $projectId = (string) $project['id'];
            $responsibleFacultyId = (int) ($project['responsible_faculty_id'] ?? 0);
            if ($responsibleFacultyId <= 0) {
                continue;
            }

            $ownerStmt = $db->prepare("
                SELECT
                    faculty_id,
                    CONCAT_WS(' ', NULLIF(title, ''), NULLIF(first_name_th, ''), NULLIF(last_name_th, '')) AS name
                FROM faculty
                WHERE faculty_id = :faculty_id
                LIMIT 1
            ");
            $ownerStmt->execute([':faculty_id' => $responsibleFacultyId]);
            $owner = $ownerStmt->fetch(PDO::FETCH_ASSOC);
            $ownerName = trim((string) ($owner['name'] ?? ''));

            $membersByProject[$projectId][] = [
                "faculty_id" => $responsibleFacultyId,
                "name" => $ownerName !== '' ? $ownerName : (string) $responsibleFacultyId,
                "role" => "ผู้รับผิดชอบโครงการ",
            ];
        }

        $memberStmt = $db->prepare("
            SELECT
                pfm.project_id,
                f.faculty_id,
                CONCAT_WS(' ', NULLIF(f.title, ''), NULLIF(f.first_name_th, ''), NULLIF(f.last_name_th, '')) AS name
            FROM project_faculty_members pfm
            INNER JOIN faculty f ON f.faculty_id = pfm.faculty_id
            WHERE pfm.project_id IN (" . implode(',', $placeholders) . ")
            ORDER BY pfm.project_id ASC, f.first_name_th ASC, f.last_name_th ASC, f.faculty_id ASC
        ");
        $memberStmt->execute(array_filter(
            $params,
            static fn(string $key): bool => str_starts_with($key, ':project_id_'),
            ARRAY_FILTER_USE_KEY
        ));

        foreach ($memberStmt->fetchAll(PDO::FETCH_ASSOC) as $member) {
            $projectId = (string) $member['project_id'];
            $name = trim((string) ($member['name'] ?? ''));
            $membersByProject[$projectId][] = [
                "faculty_id" => (int) $member['faculty_id'],
                "name" => $name !== '' ? $name : (string) $member['faculty_id'],
                "role" => "ผู้ร่วมโครงการ",
            ];
        }
    }

    $projects = array_map(function (array $project) use ($documentsByProject, $membersByProject, $facultyId): array {
        $projectId = (string) $project['id'];
        $memberFaculties = $membersByProject[$projectId] ?? [];

        return [
            "id" => $projectId,
            "name" => $project['name'],
            "project_name_th" => $project['project_name_th'] ?? '',
            "project_name_en" => $project['project_name_en'] ?? '',
            "description" => $project['description'] ?? '',
            "type" => "โครงการ",
            "status" => strtolower((string) ($project['status'] ?? 'pending')),
            "progress" => (int) round((float) $project['progress']),
            "budget" => (float) $project['budget'],
            "spent" => (float) $project['spent'],
            "members" => (int) $project['members'],
            "deadline" => $project['end_date'] ?: "-",
            "start_date" => $project['start_date'] ?? null,
            "end_date" => $project['end_date'] ?? null,
            "academic_year" => $project['academic_year'] !== null ? (int) $project['academic_year'] : null,
            "documents" => $documentsByProject[$projectId] ?? [],
            "member_faculty_ids" => array_values(array_map(
                static fn(array $member): int => (int) $member['faculty_id'],
                array_filter($memberFaculties, static fn(array $member): bool => ($member['role'] ?? '') === 'ผู้ร่วมโครงการ')
            )),
            "member_faculties" => $memberFaculties,
            "can_edit" => false,
        ];
    }, $rows);

    project_json(["status" => "success", "data" => $projects]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
