<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';

function researchFail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function researchAccess(PDO $db, int $userId): array
{
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$userId]);
    $role = (int)$stmt->fetchColumn();
    $stmt = $db->prepare('SELECT position_id FROM user_position WHERE user_id = ?');
    $stmt->execute([$userId]);
    $positions = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    $stmt = $db->prepare('SELECT p.permission_name FROM permissions p JOIN position_permission pp ON pp.permission_id = p.permission_id JOIN user_position up ON up.position_id = pp.position_id WHERE up.user_id = ?');
    $stmt->execute([$userId]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $manage = $role === 2 && !in_array(1, $positions, true)
        && (in_array(9, $positions, true) || in_array('RESEARCH_RECORD_MANAGE', $permissions, true));
    $view = $role === 2 && ($manage || in_array(1, $positions, true)
        || in_array('RESEARCH_SUMMARY_VIEW', $permissions, true));
    return ['view' => $view, 'manage' => $manage];
}

function researchAuthorRoles(array $row): array
{
    $roles = [];
    $coAuthors = json_decode($row['co_author_ids'] ?? '[]', true);
    if (!is_array($coAuthors)) {
        $coAuthors = preg_split('/\s*,\s*/', $row['co_author_ids'] ?? '', -1, PREG_SPLIT_NO_EMPTY);
    }
    foreach ($coAuthors as $id) {
        if (is_scalar($id) && ctype_digit((string)$id) && (int)$id > 0) $roles[(int)$id] = 'co_author';
    }
    if (!empty($row['corresponding_author_id'])) $roles[(int)$row['corresponding_author_id']] = 'corresponding';
    if (!empty($row['first_author_id'])) $roles[(int)$row['first_author_id']] = 'first_author';
    if (!$roles) $roles[(int)$row['faculty_id']] = 'co_author';
    return $roles;
}

function researchRevision(array $row): string
{
    $values = [];
    foreach (['title', 'publication_date', 'publication_year', 'article_type', 'journal_name', 'category', 'first_author_id', 'corresponding_author_id', 'co_author_ids'] as $key) {
        $values[$key] = $row[$key] ?? null;
    }
    return hash('sha256', json_encode($values, JSON_UNESCAPED_UNICODE));
}

function researchSummaryData(PDO $db, bool $canManage): array
{
    // Academic rank only; administrative position and system permissions do not affect order.
    $faculty = $db->query("SELECT faculty_id,
        TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) AS name,
        COALESCE(title, '') AS note
        FROM faculty
        ORDER BY CASE
            WHEN TRIM(title) REGEXP '^(ศ[.]|ศาสตราจารย์)' THEN 1
            WHEN TRIM(title) REGEXP '^(รศ[.]|รองศาสตราจารย์)' THEN 2
            WHEN TRIM(title) REGEXP '^(ผศ[.]|ผู้ช่วยศาสตราจารย์)' THEN 3
            ELSE 4 END,
        first_name_th, last_name_th, faculty_id")->fetchAll(PDO::FETCH_ASSOC);
    $names = [];
    foreach ($faculty as &$person) {
        $person['faculty_id'] = (int)$person['faculty_id'];
        $names[$person['faculty_id']] = $person['name'];
    }
    unset($person);
    $publications = [];
    $rows = $db->query('SELECT research_id, faculty_id, title, publication_year, publication_date, article_type, journal_name, category, first_author_id, corresponding_author_id, co_author_ids FROM faculty_research ORDER BY research_id DESC')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $authors = [];
        foreach (researchAuthorRoles($row) as $id => $role) {
            if (isset($names[$id])) $authors[] = ['faculty_id' => $id, 'name' => $names[$id], 'role' => $role];
        }
        $year = (int)$row['publication_year'];
        if ($year > 0 && $year < 2400) $year += 543;
        $date = $row['publication_date'] ?: ($year >= 2500 && $year <= 2700 ? ($year - 543) . '-01-01' : '');
        $type = match ($row['article_type']) {
            'academic', 'บทความวิชาการ' => 'academic',
            'textbook', 'ตำรา' => 'textbook',
            default => 'research',
        };
        $publications[] = [
            'id' => (int)$row['research_id'], 'title' => $row['title'], 'revision' => researchRevision($row),
            'journal' => $row['journal_name'] ?? '', 'publication_date' => $date,
            'buddhist_year' => $date ? (int)substr($date, 0, 4) + 543 : $year,
            'publication_type' => $type, 'database_level' => $row['category'] ?? '', 'authors' => $authors,
        ];
    }
    return ['years' => range(currentAcademicYear() - 4, currentAcademicYear()), 'faculty' => $faculty,
        'publications' => $publications, 'can_manage' => $canManage];
}
