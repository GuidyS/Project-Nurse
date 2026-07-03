<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();

    $sql = "SELECT student_code as id, CONCAT(first_name_th, ' ', last_name_th) as name
            FROM student
            WHERE status = 'Studying'
            ORDER BY student_code ASC";

    $students = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $students]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
