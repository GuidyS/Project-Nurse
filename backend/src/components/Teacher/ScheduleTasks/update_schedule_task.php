<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

try {
    $db = new Connect();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id']) || !isset($data['task']) || !isset($data['dueDate'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $sql = "UPDATE schedule_tasks SET task_name = :task, due_date = :dueDate, priority = :priority, description = :description WHERE task_id = :id";
    $stmt = $db->prepare($sql);
    
    $stmt->bindValue(':task', $data['task']);
    $stmt->bindValue(':dueDate', $data['dueDate']);
    $stmt->bindValue(':priority', $data['priority']);
    $stmt->bindValue(':description', $data['description'] ?? '');
    $stmt->bindValue(':id', $data['id']);

    $stmt->execute();

    logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'schedule_tasks', "แก้ไขรายละเอียดนัดหมาย/งาน: {$data['task']} (ID: {$data['id']})");

    echo json_encode(["status" => "success", "message" => "Task updated successfully"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to update task: " . $e->getMessage()]);
}
?>