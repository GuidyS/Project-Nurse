<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
$auth = project_require_auth($db, ['PROJECT_MY_VIEW']);

try {
    $currentFacultyId = project_resolve_faculty_id($db, $auth['user_id']);

    $stmt = $db->query("
        SELECT
            faculty_id,
            CONCAT_WS(' ', NULLIF(title, ''), NULLIF(first_name_th, ''), NULLIF(last_name_th, '')) AS name,
            email
        FROM faculty
        WHERE status = 'Active' OR status IS NULL
        ORDER BY first_name_th ASC, last_name_th ASC, faculty_id ASC
    ");

    $options = array_map(static function (array $faculty): array {
        $name = trim((string) ($faculty['name'] ?? ''));

        return [
            "faculty_id" => (int) $faculty['faculty_id'],
            "name" => $name !== '' ? $name : (string) $faculty['faculty_id'],
            "email" => $faculty['email'] ?? null,
        ];
    }, $stmt->fetchAll(PDO::FETCH_ASSOC));

    project_json([
        "status" => "success",
        "data" => $options,
        "current_faculty_id" => $currentFacultyId,
    ]);
} catch (Exception $e) {
    project_json(["status" => "error", "message" => "ไม่สามารถดึงรายชื่ออาจารย์ได้: " . $e->getMessage()], 500);
}
?>
