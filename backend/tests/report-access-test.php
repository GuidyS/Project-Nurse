<?php
// Exercise the existing admin guard with synthetic sessions and a PDO stub: no database connection.
$root = getenv('NURSE_BACKEND_SRC') ?: dirname(__DIR__) . '/src';
$helper = $root . '/components/Admin/Approvals/approval-schema.php';
$cases = [
    ['anonymous', [], 401],
    ['admin', ['user_id' => 999999, 'role_id' => 1, 'position_id' => 0], 200],
    ['superadmin', ['user_id' => 999999, 'role_id' => 1, 'position_id' => 1], 200],
    ['teacher', ['user_id' => 999999, 'role_id' => 2, 'position_id' => 2], 403],
    ['student', ['user_id' => 999999, 'role_id' => 3, 'position_id' => 0], 403],
    ['dean-existing-policy', ['user_id' => 999999, 'role_id' => 2, 'position_id' => 1], 200],
];
foreach ($cases as [$name, $session, $expected]) {
    $code = '$_SESSION = ' . var_export($session, true) . '; require ' . var_export($helper, true) . ';'
        . 'class NoDatabase extends PDO { public function __construct() {} }'
        . 'register_shutdown_function(function () { echo "\nHTTP_STATUS=" . (http_response_code() ?: 200); });'
        . 'approvalRequireAdmin(new NoDatabase());';
    $process = proc_open([PHP_BINARY, '-r', $code], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    $output = stream_get_contents($pipes[1]);
    $errors = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exit = proc_close($process);
    if ($exit !== 0 || $errors !== '' || !str_contains($output, 'HTTP_STATUS=' . $expected)) {
        throw new RuntimeException('Guard failed for synthetic role: ' . $name);
    }
    echo 'PASS: ' . $name . ' => ' . $expected . "\n";
}
