<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

$user_id = $_SESSION['user_id'];

try {
    $db = new Connect();

    $stmt_std = $db->query("SELECT COUNT(*) FROM student WHERE status = 'Studying'");
    $total_students = (int)$stmt_std->fetchColumn();

    $stmt_fac = $db->query("SELECT COUNT(*) FROM faculty");
    $total_faculties = (int)$stmt_fac->fetchColumn();

    $stmt_sub = $db->query("SELECT COUNT(*) FROM subject WHERE is_active = 1");
    $total_subjects = (int)$stmt_sub->fetchColumn();

    $stmt_noti = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt_noti->execute([$user_id]);
    $unread_notis = (int)$stmt_noti->fetchColumn();

    echo json_encode([
        "status" => "success",
        "data" => [
            "total_students" => $total_students,
            "total_faculties" => $total_faculties,
            "total_subjects" => $total_subjects,
            "unread_notifications" => $unread_notis,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
