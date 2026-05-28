<?php
header('Content-Type: application/json');
// require_once 'auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // รับ Request Body ที่เป็น JSON จาก React
    $input = json_decode(file_get_contents('php://input'), true);

    // ตรวจสอบว่าส่งข้อมูลสำคัญมาครบหรือไม่
    if (!isset($input['studentId'], $input['task'], $input['dueDate'], $input['priority'])) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // เตรียม SQL สำหรับบันทึกงานใหม่ โดยให้ค่าเริ่มต้นสถานะเป็น 'pending' (รอดำเนินการ)
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

    echo json_encode([
        "status" => "success",
        "message" => "สร้างงานใหม่เรียบร้อยแล้ว",
        "data" => [
            "taskId" => $pdo->lastInsertId()
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>