<?php
// Run with PHP + PDO MySQL from the repository: php backend/tests/research-summary-smoke.php
// Creates only synthetic fixtures in a unique database; never copies production rows.
require_once __DIR__ . '/../src/config/config.php';
$db = new Connect();
$database = getenv('RESEARCH_TEST_DATABASE') ?: 'test_research_' . bin2hex(random_bytes(6));
if (!preg_match('/^test_research_[a-f0-9]{12}$/D', $database)) throw new RuntimeException('Invalid test database name');
$created = false;
$dir = sys_get_temp_dir() . '/' . $database;
$server = null;
$checks = 0;
function check(bool $ok, string $label): void {
    global $checks;
    if (!$ok) throw new RuntimeException($label);
    $checks++;
}
function requestApi(string $page, ?int $user = null, ?array $body = null, string $contentType = 'application/json'): array {
    global $port, $sessions;
    $headers = "Content-Type: $contentType\r\n";
    if ($user !== null) $headers .= 'Cookie: PHPSESSID=' . $sessions[$user] . "\r\n";
    $options = ['method' => $body === null ? 'GET' : 'POST', 'header' => $headers, 'ignore_errors' => true, 'timeout' => 5];
    if ($body !== null) $options['content'] = json_encode($body);
    $raw = file_get_contents("http://127.0.0.1:$port/index.php?page=$page", false, stream_context_create(['http' => $options]));
    preg_match('/\s(\d{3})\s/', $http_response_header[0] ?? '', $match);
    return [(int)($match[1] ?? 0), json_decode($raw, true)];
}
try {
    $db->exec("CREATE DATABASE `$database` CHARACTER SET utf8mb4");
    $created = true;
    $source = $db->query('SELECT DATABASE()')->fetchColumn();
    foreach (['faculty', 'faculty_research', 'users', 'user_position', 'permissions', 'position_permission', 'audit_log'] as $table) {
        $db->exec("CREATE TABLE `$database`.`$table` LIKE `$source`.`$table`");
    }
    $db->exec("USE `$database`");
    $db->exec("INSERT INTO users (user_id, username, password_hash, role_id, status) VALUES
        (1, 'test-manager', 'unused', 2, 'active'), (2, 'test-dean', 'unused', 2, 'active'),
        (3, 'test-teacher', 'unused', 2, 'active'), (4, 'test-student', 'unused', 3, 'active'),
        (5, 'test-admin', 'unused', 1, 'active'), (6, 'test-superadmin', 'unused', 4, 'active')");
    $db->exec('INSERT INTO user_position (user_id, position_id) VALUES (1, 9), (2, 1)');
    $db->exec("INSERT INTO faculty (faculty_id, first_name_th, last_name_th) VALUES (101, 'Test', 'One'), (102, 'Test', 'Two')");
    $db->exec("UPDATE faculty SET title = 'ผศ.ดร.', user_id = 1 WHERE faculty_id = 101");
    $db->exec("UPDATE faculty SET title = 'อาจารย์', user_id = 2 WHERE faculty_id = 102");
    $db->exec("INSERT INTO faculty (faculty_id, title, first_name_th, last_name_th) VALUES
        (103, 'ศ.ดร.', 'Z', 'Test'), (104, 'รศ.ดร.', 'A', 'Test'),
        (105, 'ผู้ช่วยศาสตราจารย์', 'A', 'Test'), (106, 'ศาสตราจารย์', 'A', 'Test'),
        (107, 'รองศาสตราจารย์', 'Z', 'Test')");
    mkdir($dir);
    mkdir($dir . '/sessions');
    $sessions = [];
    for ($user = 1; $user <= 6; $user++) {
        $sessions[$user] = bin2hex(random_bytes(16));
        file_put_contents($dir . '/sessions/sess_' . $sessions[$user], 'user_id|i:' . $user . ';');
    }
    $feature = realpath(__DIR__ . '/../src/components/Teacher/ResearchSummary');
    $config = realpath(__DIR__ . '/../src/config/config.php');
    $calendar = realpath(__DIR__ . '/../src/config/academic_calendar.php');
    $middleware = realpath(__DIR__ . '/../src/components/middlewares/auth_middleware.php');
    file_put_contents($dir . '/config.php', '<?php require_once ' . var_export($config, true) . '; class ResearchTestConnect extends Connect { public function __construct() { parent::__construct(); $this->exec("USE ' . $database . '"); } }');
    foreach (['research_summary_helpers.php', 'get_research_summary.php', 'save_research_summary.php'] as $file) {
        $code = file_get_contents($feature . '/' . $file);
        $code = str_replace("__DIR__ . '/../../../config/config.php'", "__DIR__ . '/config.php'", $code);
        $code = str_replace("__DIR__ . '/../../../config/academic_calendar.php'", var_export($calendar, true), $code);
        $code = str_replace("__DIR__ . '/../../middlewares/auth_middleware.php'", var_export($middleware, true), $code);
        $code = str_replace('new Connect()', 'new ResearchTestConnect()', $code);
        file_put_contents($dir . '/' . $file, $code);
    }
    file_put_contents($dir . '/index.php', '<?php $page = $_GET["page"] ?? ""; if ($page === "get-research-summary") require __DIR__ . "/get_research_summary.php"; elseif ($page === "save-research-summary") require __DIR__ . "/save_research_summary.php"; else http_response_code(404);');
    $socket = stream_socket_server('tcp://127.0.0.1:0');
    $port = (int)substr(strrchr(stream_socket_get_name($socket, false), ':'), 1);
    fclose($socket);
    $server = proc_open([PHP_BINARY, '-d', 'session.save_path=' . $dir . '/sessions', '-S', '127.0.0.1:' . $port, '-t', $dir], [['pipe', 'r'], ['file', '/dev/null', 'a'], ['file', '/dev/null', 'a']], $pipes);
    for ($i = 0; $i < 50; $i++) {
        $socket = @fsockopen('127.0.0.1', $port);
        if ($socket) { fclose($socket); break; }
        usleep(50000);
    }
    $add = ['action' => 'add', 'faculty_id' => 101, 'year' => 2569, 'year_mode' => 'calendar', 'kind' => 'kpi'];
    check(requestApi('get-research-summary')[0] === 401, 'GET requires session');
    check(requestApi('save-research-summary', null, $add)[0] === 401, 'POST requires session');
    foreach ([3, 4, 5, 6] as $user) {
        check(requestApi('get-research-summary', $user)[0] === 403, 'Restricted summary access');
        check(requestApi('save-research-summary', $user, $add)[0] === 403, 'Restricted write access');
    }
    [$status, $result] = requestApi('get-research-summary', 2);
    check($status === 200 && $result['data']['can_manage'] === false, 'Dean read-only');
    check(array_column($result['data']['faculty'], 'faculty_id') === [106, 103, 104, 107, 105, 101, 102], 'Academic rank then name; dean position does not override rank');
    check(requestApi('save-research-summary', 2, $add)[0] === 403, 'Dean cannot write');
    check(requestApi('save-research-summary', 1, $add, 'application/x-www-form-urlencoded')[0] === 415, 'Reject form submission');
    check(requestApi('save-research-summary', 1, array_replace($add, ['year' => 9999]))[0] === 422, 'Validate year');
    check(requestApi('save-research-summary', 1, array_replace($add, ['faculty_id' => 999]))[0] === 422, 'Validate faculty');
    foreach (['kpi', 'co_author', 'academic'] as $kind) {
        [$status, $result] = requestApi('save-research-summary', 1, array_replace($add, ['kind' => $kind, 'year_mode' => 'academic']));
        check($status === 200, 'Add category');
        $publication = $result['data']['publications'][0];
        check($publication['publication_date'] === '2026-04-01', 'Academic year date');
        [$status, $loaded] = requestApi('get-research-summary', 1);
        check($loaded['data']['publications'][0]['id'] === $publication['id'], 'Persists across requests');
        $remove = ['action' => 'remove', 'faculty_id' => 101, 'publication_id' => $publication['id']];
        check(requestApi('save-research-summary', 1, $remove)[0] === 200, 'Remove saved category');
        check(requestApi('save-research-summary', 1, $remove)[0] === 409, 'Stale deletion rejected');
    }
    $db->exec("INSERT INTO faculty_research (faculty_id, title, publication_year, first_author_id, corresponding_author_id, co_author_ids) VALUES (101, 'Test shared', 2569, 101, 101, '[102]')");
    $id = (int)$db->lastInsertId();
    [$status, $result] = requestApi('save-research-summary', 1, ['action' => 'remove', 'faculty_id' => 101, 'publication_id' => $id]);
    check($status === 200 && count($result['data']['publications'][0]['authors']) === 1 && $result['data']['publications'][0]['authors'][0]['faculty_id'] === 102, 'Preserve coauthor');
    check((int)$db->query('SELECT COUNT(*) FROM audit_log')->fetchColumn() === 7, 'Audit each successful mutation');
    $publication = $result['data']['publications'][0];
    $edit = ['action' => 'update', 'faculty_id' => 102, 'publication_id' => $id, 'revision' => $publication['revision'],
        'title' => 'Updated synthetic publication', 'publication_date' => '2025-03-31', 'publication_type' => 'textbook',
        'journal' => 'Test journal', 'database_level' => 'Test category'];
    check(requestApi('save-research-summary', 2, $edit)[0] === 403, 'Read-only user cannot edit');
    foreach (['title' => '   ', 'publication_date' => '2025-02-30', 'publication_type' => 'invalid', 'journal' => str_repeat('ก', 256)] as $field => $value) {
        check(requestApi('save-research-summary', 1, array_replace($edit, [$field => $value]))[0] === 422, 'Validate edited field');
    }
    [$status, $edited] = requestApi('save-research-summary', 1, $edit);
    check($status === 200 && $edited['data']['publications'][0]['title'] === $edit['title'], 'Edit saved');
    [$status, $loaded] = requestApi('get-research-summary', 1);
    $saved = $loaded['data']['publications'][0];
    check($saved['publication_type'] === 'textbook' && $saved['publication_date'] === '2025-03-31' && $saved['buddhist_year'] === 2568, 'Edited category and year persist');
    check($saved['authors'] === $publication['authors'] && $saved['journal'] === 'Test journal', 'Editing preserves authors');
    check(requestApi('save-research-summary', 1, $edit)[0] === 409, 'Reject stale edit');
    check($db->query('SELECT action_type FROM audit_log ORDER BY audit_log_id DESC LIMIT 1')->fetchColumn() === 'update', 'Audit edit');
    $db->exec('DROP TABLE audit_log');
    $before = (int)$db->query('SELECT COUNT(*) FROM faculty_research')->fetchColumn();
    check(requestApi('save-research-summary', 1, $add)[0] === 500, 'Audit failure rejects save');
    check((int)$db->query('SELECT COUNT(*) FROM faculty_research')->fetchColumn() === $before, 'Failed save rolled back');
    echo "PASS: $checks research summary API checks (synthetic isolated database)\n";
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    if ($created) $db->exec("DROP DATABASE IF EXISTS `$database`");
    if (is_dir($dir)) {
        foreach (glob($dir . '/sessions/*') as $file) unlink($file);
        rmdir($dir . '/sessions');
        foreach (glob($dir . '/*') as $file) unlink($file);
        rmdir($dir);
    }
}
