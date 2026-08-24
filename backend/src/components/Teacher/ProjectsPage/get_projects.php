<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/../MyProjects/my_project_member_helpers.php';

$db = project_db();
project_require_auth($db, ['PROJECT_VIEW']);

try {
    my_project_ensure_member_table($db);

    $search = trim((string) ($_GET['search'] ?? ''));
    $projectId = project_request_int('project_id');

    $where = [];
    $params = [];

    if ($projectId !== null) {
        $where[] = 'p.project_id = :project_id';
        $params[':project_id'] = $projectId;
    }

    if ($search !== '') {
        $where[] = '(p.project_name_th LIKE :search OR p.project_name_en LIKE :search)';
        $params[':search'] = "%{$search}%";
    }

    $sql = "
        SELECT
            p.project_id,
            p.project_name_th,
            p.project_name_en,
            p.description,
            p.strategy,
            p.responsible_faculty_id,
            CONCAT_WS(' ', NULLIF(f.title, ''), NULLIF(f.first_name_th, ''), NULLIF(f.last_name_th, '')) AS responsible_name,
            p.academic_year,
            p.status,
            p.start_date,
            p.end_date,
            CASE
                WHEN COALESCE(pp.members, 0) + COALESCE(pfm.members, 0) > 0 THEN COALESCE(pp.members, 0) + COALESCE(pfm.members, 0)
                ELSE COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(p.mapping_json, '$.member_count')) AS UNSIGNED), 0)
            END AS members,
            COALESCE(pb.budget, 0) AS budget,
            COALESCE(pb.spent, 0) AS spent,
            COALESCE(pl.progress, 0) AS progress
        FROM project p
        LEFT JOIN faculty f ON f.faculty_id = p.responsible_faculty_id
        LEFT JOIN (
            SELECT project_id, COUNT(*) AS members
            FROM project_participants
            GROUP BY project_id
        ) pp ON pp.project_id = p.project_id
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
    ";

    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY p.project_id DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $documentsByProject = [];
    $membersByProject = [];
    $projectIds = array_values(array_filter(array_map(
        static fn(array $project): int => (int) $project['project_id'],
        $projects
    )));

    if (!empty($projectIds)) {
        $placeholders = [];
        $docParams = [];
        foreach ($projectIds as $index => $id) {
            $key = ':project_id_' . $index;
            $placeholders[] = $key;
            $docParams[$key] = $id;
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
            WHERE project_id IN (" . implode(',', $placeholders) . ")
              AND file_path IS NOT NULL
              AND TRIM(file_path) <> ''
            ORDER BY date DESC, id DESC
        ");
        $docsStmt->execute($docParams);

        foreach ($docsStmt->fetchAll(PDO::FETCH_ASSOC) as $document) {
            $id = (string) $document['project_id'];
            $documentsByProject[$id][] = [
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

        foreach ($projects as $project) {
            $id = (string) $project['project_id'];
            $responsibleName = trim((string) ($project['responsible_name'] ?? ''));
            if ($responsibleName !== '') {
                $membersByProject[$id][] = [
                    "id" => (int) ($project['responsible_faculty_id'] ?? 0),
                    "name" => $responsibleName,
                    "type" => "faculty",
                    "role" => "ผู้รับผิดชอบโครงการ",
                ];
            }
        }

        $studentStmt = $db->prepare("
            SELECT
                pp.project_id,
                s.student_id,
                CONCAT_WS(' ', NULLIF(s.title, ''), NULLIF(s.first_name_th, ''), NULLIF(s.last_name_th, '')) AS name
            FROM project_participants pp
            INNER JOIN student s ON s.student_id = pp.student_id
            WHERE pp.project_id IN (" . implode(',', $placeholders) . ")
            ORDER BY pp.project_id ASC, s.student_id ASC
        ");
        $studentStmt->execute($docParams);

        foreach ($studentStmt->fetchAll(PDO::FETCH_ASSOC) as $member) {
            $id = (string) $member['project_id'];
            $name = trim((string) ($member['name'] ?? ''));
            $membersByProject[$id][] = [
                "id" => (int) $member['student_id'],
                "name" => $name !== '' ? $name : (string) $member['student_id'],
                "type" => "student",
                "role" => "สมาชิกโครงการ",
            ];
        }

        $memberTableStmt = $db->prepare("
            SELECT COUNT(*)
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'project_faculty_members'
        ");
        $memberTableStmt->execute();
        if ((int) $memberTableStmt->fetchColumn() > 0) {
            $facultyMemberStmt = $db->prepare("
                SELECT
                    pfm.project_id,
                    f.faculty_id,
                    CONCAT_WS(' ', NULLIF(f.title, ''), NULLIF(f.first_name_th, ''), NULLIF(f.last_name_th, '')) AS name
                FROM project_faculty_members pfm
                INNER JOIN faculty f ON f.faculty_id = pfm.faculty_id
                WHERE pfm.project_id IN (" . implode(',', $placeholders) . ")
                ORDER BY pfm.project_id ASC, f.faculty_id ASC
            ");
            $facultyMemberStmt->execute($docParams);

            foreach ($facultyMemberStmt->fetchAll(PDO::FETCH_ASSOC) as $member) {
                $id = (string) $member['project_id'];
                $facultyId = (int) $member['faculty_id'];
                $name = trim((string) ($member['name'] ?? ''));
                $alreadyExists = false;

                foreach ($membersByProject[$id] ?? [] as $existingMember) {
                    if (($existingMember['type'] ?? '') === 'faculty' && (int) ($existingMember['id'] ?? 0) === $facultyId) {
                        $alreadyExists = true;
                        break;
                    }
                }

                if (!$alreadyExists) {
                    $membersByProject[$id][] = [
                        "id" => $facultyId,
                        "name" => $name !== '' ? $name : (string) $facultyId,
                        "type" => "faculty",
                        "role" => "ผู้ร่วมโครงการ",
                    ];
                }
            }
        }
    }

    foreach ($projects as &$project) {
        $id = (string) $project['project_id'];
        $project['documents'] = $documentsByProject[$id] ?? [];
        $project['member_details'] = $membersByProject[$id] ?? [];
        $project['member_names'] = array_map(
            static fn(array $member): string => (string) $member['name'],
            $project['member_details']
        );
    }
    unset($project);

    project_json(["status" => "success", "data" => $projects]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
