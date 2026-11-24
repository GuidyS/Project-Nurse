<?php
require_once __DIR__ . '/../../../config/config.php';

function tqfDocumentRequireDb(bool $adminOnly = false): Connect
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $db = new Connect();
    $stmt = $db->prepare('SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1');
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $roleId = (int)$stmt->fetchColumn();
    if ($roleId !== 1 && ($adminOnly || $roleId !== 2)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    return $db;
}
