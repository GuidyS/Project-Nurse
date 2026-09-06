<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
 
if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
 
header("Content-Type: application/json; charset=UTF-8");
 
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}
 
$db = new Connect;
 
try {
    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
 
    // เฉพาะ Admin (role_id=1) และ อาจารย์ (role_id=2) เท่านั้น
    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }
 
    if ((int)$user['role_id'] === 1) {
        // Admin: เห็นนักศึกษาทุกคน
        $stmt2 = $db->prepare("
            SELECT student_id, CONCAT(first_name_th, ' ', last_name_th) AS full_name, status
            FROM student
            ORDER BY student_id
        ");
        $stmt2->execute();
    } else {
        // อาจารย์ที่ปรึกษา: เห็นเฉพาะนักศึกษาในความดูแลของตัวเอง
        $stmt2 = $db->prepare("
            SELECT s.student_id, CONCAT(s.first_name_th, ' ', s.last_name_th) AS full_name, s.status
            FROM student_advisor_mapping sam
            JOIN student s ON s.student_id = sam.student_id
            WHERE sam.faculty_id = :fid
            ORDER BY s.student_id
        ");
        $stmt2->execute([':fid' => $user['username']]);
    }
 
    $students = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $students], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
 