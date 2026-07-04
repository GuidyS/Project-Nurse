<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/config.php';

try {
    $db = new Connect();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing task ID"]);
        exit;
    }

    $sql = "DELETE FROM schedule_tasks WHERE task_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $data['id']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
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
