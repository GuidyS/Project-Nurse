<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/my_project_member_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_VIEW', 'PROJECT_MY_VIEW']);

function my_project_type_label(string $projectType): string
{
    return match ($projectType) {
        'academic_service' => 'บริการวิชาการ',
        'culture' => 'ทำนุบำรุงศิลปวัฒนธรรม',
        default => 'โครงการอื่น',
    };
}

function my_project_faculty_display_name(array $faculty): string
{
    $name = trim((string) ($faculty['name'] ?? ''));
    return $name !== '' ? $name : (string) ($faculty['faculty_id'] ?? '');
}

try {
    my_project_ensure_member_table($db);

    $facultyId = project_resolve_faculty_id($db, $auth['user_id']);
    if ($facultyId === null) {
        project_json(["status" => "success", "data" => []]);
        exit;
    }

    $stmt = $db->prepare("
        SELECT
            p.project_id AS id,
            p.project_name_th,
            p.project_name_en,
            p.description,
            COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), CONCAT('Project #', p.project_id)) AS name,
            COALESCE(p.project_type, 'other') AS project_type,
            p.responsible_faculty_id,
            p.academic_year,
            p.status,
            p.start_date,
            p.end_date,
            CASE
                WHEN p.responsible_faculty_id IS NULL THEN COALESCE(pfm.members, 0)
                ELSE COALESCE(pfm.members, 0) + 1
            END AS members,
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
            SELECT
                project_id,
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
        WHERE p.responsible_faculty_id = :responsible_faculty_id
           OR EXISTS (
                SELECT 1
                FROM project_faculty_members pfm_filter
                WHERE pfm_filter.project_id = p.project_id
                  AND pfm_filter.faculty_id = :member_faculty_id
           )
        ORDER BY p.project_id DESC
    ");
    $stmt->execute([
        ':responsible_faculty_id' => $facultyId,
        ':member_faculty_id' => $facultyId,
    ]);
    $projectsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($projectsRaw)) {
        project_json(["status" => "success", "data" => []]);
        exit;
    }

    $projectIds = array_values(array_map(
        static fn(array $project): int => (int) $project['id'],
        $projectsRaw
    ));
    $placeholders = [];
    $params = [];
    foreach ($projectIds as $index => $projectId) {
        $key = ':project_id_' . $index;
        $placeholders[] = $key;
        $params[$key] = $projectId;
    }
    $projectIdSql = implode(',', $placeholders);

    $documentsByProject = [];
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
        WHERE project_id IN ({$projectIdSql})
          AND file_path IS NOT NULL
          AND TRIM(file_path) <> ''
        ORDER BY date DESC, id DESC
    ");
    $docsStmt->execute($params);
    foreach ($docsStmt->fetchAll(PDO::FETCH_ASSOC) as $document) {
        $projectKey = (string) $document['project_id'];
        $documentsByProject[$projectKey][] = [
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

    $membersByProject = [];
    $responsibleStmt = $db->prepare("
        SELECT
            p.project_id,
            f.faculty_id,
            CONCAT_WS(' ', NULLIF(f.title, ''), NULLIF(f.first_name_th, ''), NULLIF(f.last_name_th, '')) AS name
        FROM project p
        INNER JOIN faculty f ON f.faculty_id = p.responsible_faculty_id
        WHERE p.project_id IN ({$projectIdSql})
        ORDER BY p.project_id ASC
    ");
    $responsibleStmt->execute($params);
    foreach ($responsibleStmt->fetchAll(PDO::FETCH_ASSOC) as $member) {
        $projectKey = (string) $member['project_id'];
        $membersByProject[$projectKey][] = [
            "faculty_id" => (int) $member['faculty_id'],
            "id" => (int) $member['faculty_id'],
            "name" => my_project_faculty_display_name($member),
            "type" => "faculty",
            "role" => "ผู้ดำเนินโครงการ",
        ];
    }

    $facultyMemberStmt = $db->prepare("
        SELECT
            pfm.project_id,
            f.faculty_id,
            CONCAT_WS(' ', NULLIF(f.title, ''), NULLIF(f.first_name_th, ''), NULLIF(f.last_name_th, '')) AS name
        FROM project_faculty_members pfm
        INNER JOIN faculty f ON f.faculty_id = pfm.faculty_id
        WHERE pfm.project_id IN ({$projectIdSql})
        ORDER BY pfm.project_id ASC, f.faculty_id ASC
    ");
    $facultyMemberStmt->execute($params);
    foreach ($facultyMemberStmt->fetchAll(PDO::FETCH_ASSOC) as $member) {
        $projectKey = (string) $member['project_id'];
        $facultyMemberId = (int) $member['faculty_id'];
        $alreadyExists = false;

        foreach ($membersByProject[$projectKey] ?? [] as $existingMember) {
            if ((int) ($existingMember['faculty_id'] ?? 0) === $facultyMemberId) {
                $alreadyExists = true;
                break;
            }
        }

        if ($alreadyExists) {
            continue;
        }

        $membersByProject[$projectKey][] = [
            "faculty_id" => $facultyMemberId,
            "id" => $facultyMemberId,
            "name" => my_project_faculty_display_name($member),
            "type" => "faculty",
            "role" => "ผู้ร่วมโครงการ",
        ];
    }

    $myProjects = [];
    foreach ($projectsRaw as $project) {
        $projectId = (int) $project['id'];
        $projectKey = (string) $projectId;
        $projectType = (string) ($project['project_type'] ?? 'other');
        $responsibleFacultyId = (int) ($project['responsible_faculty_id'] ?? 0);
        $members = $membersByProject[$projectKey] ?? [];
        $memberFacultyIds = array_values(array_map(
            static fn(array $member): int => (int) $member['faculty_id'],
            array_filter(
                $members,
                static fn(array $member): bool => (int) ($member['faculty_id'] ?? 0) > 0
                    && (int) ($member['faculty_id'] ?? 0) !== $responsibleFacultyId
            )
        ));

        $myProjects[] = [
            "id" => (string) $projectId,
            "name" => $project['name'],
            "project_name_th" => $project['project_name_th'] ?? '',
            "project_name_en" => $project['project_name_en'] ?? '',
            "description" => $project['description'] ?? '',
            "project_type" => $projectType,
            "type" => my_project_type_label($projectType),
            "status" => strtolower((string) ($project['status'] ?? 'pending')),
            "progress" => (int) round((float) ($project['progress'] ?? 0)),
            "budget" => (float) ($project['budget'] ?? 0),
            "spent" => (float) ($project['spent'] ?? 0),
            "members" => count($members),
            "deadline" => $project['end_date'] ?: "-",
            "academic_year" => $project['academic_year'] !== null ? (int) $project['academic_year'] : null,
            "start_date" => $project['start_date'] ?? null,
            "end_date" => $project['end_date'] ?? null,
            "documents" => $documentsByProject[$projectKey] ?? [],
            "member_faculty_ids" => $memberFacultyIds,
            "member_faculties" => $members,
            "member_details" => $members,
            "can_edit" => $responsibleFacultyId > 0 && $responsibleFacultyId === $facultyId,
        ];
    }

    project_json(["status" => "success", "data" => $myProjects]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
