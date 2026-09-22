<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['studentId'], $input['task'], $input['dueDate'], $input['priority'])) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    $sql = "INSERT INTO schedule_tasks (student_id, task_name, description, due_date, priority, status) 
            VALUES (:student_id, :task_name, :description, :due_date, :priority, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':student_id' => $input['studentId'],
        ':task_name'  => $input['task'],
        ':description'=> isset($input['description']) ? $input['description'] : null,
        ':due_date'   => $input['dueDate'],
        ':priority'   => $input['priority']
    ]);

    $taskId = $pdo->lastInsertId();

    logAudit($pdo, $_SESSION['user_id'] ?? null, 'create', 'schedule_tasks', "สร้างนัดหมาย/งานใหม่: {$input['task']} ให้นักศึกษารหัส {$input['studentId']}");

    echo json_encode([
        "status" => "success",
        "message" => "สร้างงานใหม่เรียบร้อยแล้ว",
        "data" => [
            "taskId" => $taskId
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>