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

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $itemId = (int)($_GET['id'] ?? 0);
    if ($itemId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรายการที่ต้องการลบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $checkStmt = $db->prepare("SELECT COUNT(*) FROM student_competency_assessments WHERE competency_item_id = :id");
    $checkStmt->execute([':id' => $itemId]);
    if ((int)$checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "ไม่สามารถลบได้ เพราะมีการประเมินนักศึกษาด้วยรายการนี้ไปแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $delStmt = $db->prepare("DELETE FROM competency_items WHERE id = :id");
    $delStmt->execute([':id' => $itemId]);

    echo json_encode(["status" => "success", "message" => "ลบรายการเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}