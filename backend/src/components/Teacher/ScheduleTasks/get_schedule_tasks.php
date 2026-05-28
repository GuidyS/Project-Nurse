<?php
header('Content-Type: application/json');
// require_once 'auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. ดึงข้อมูลงาน (Tasks) พร้อม Join ชื่อนักศึกษาจากตาราง student
    $sqlTasks = "
        SELECT 
            t.task_id AS id, 
            t.student_id AS studentId, 
            CONCAT(s.first_name, ' ', s.last_name) AS studentName, 
            t.task_name AS task, 
            t.due_date AS dueDate, 
            t.status, 
            t.priority 
        FROM schedule_tasks t
        JOIN student s ON t.student_id = s.student_id
        ORDER BY t.due_date ASC
    ";
    $stmtTasks = $pdo->prepare($sqlTasks);
    $stmtTasks->execute();
    $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);

    // 2. ดึงข้อมูลรายชื่อนักศึกษาสำหรับ Dropdown ใน Modal สร้างงานใหม่
    $sqlStudents = "
        SELECT 
            student_id AS id, 
            CONCAT(first_name, ' ', last_name) AS name 
        FROM student
    ";
    $stmtStudents = $pdo->prepare($sqlStudents);
    $stmtStudents->execute();
    $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

    // ส่งข้อมูลกลับไปให้ React
    echo json_encode([
        "status" => "success", 
        "data" => [
            "tasks" => $tasks,
            "students" => $students
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "ไม่สามารถดึงข้อมูลได้: " . $e->getMessage()
    ]);
}
?>