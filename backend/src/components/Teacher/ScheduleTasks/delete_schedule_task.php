<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

try {
    $db = new Connect();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing task ID"]);
        exit;
    }

    // ดึงชื่องานมาเก็บไว้ก่อนลบเพื่อลง Log
    $infoStmt = $db->prepare("SELECT task_name FROM schedule_tasks WHERE task_id = :id LIMIT 1");
    $infoStmt->execute([':id' => $data['id']]);
    $taskName = $infoStmt->fetchColumn() ?: "ID: {$data['id']}";

    $sql = "DELETE FROM schedule_tasks WHERE task_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $data['id']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'schedule_tasks', "ลบนัดหมาย/งาน: {$taskName}");

        echo json_encode(["status" => "success", "message" => "Task deleted successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Task not found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to delete task: " . $e->getMessage()]);
}
?>