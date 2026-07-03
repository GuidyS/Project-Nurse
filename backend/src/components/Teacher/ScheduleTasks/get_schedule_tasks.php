<?php
header('Content-Type: application/json');

// ใช้ไฟล์ Config กลางของโปรเจกต์คุณ (แก้ปัญหาเรื่องการประกาศ PDO ดิบๆ)
require_once __DIR__ . '/../../../config/config.php';

try {
    $db = new Connect();

    // 1. ดึงข้อมูลงาน (Tasks) พร้อม Join ชื่อนักศึกษา (แก้ไข first_name เป็น first_name_th)
    $sqlTasks = "
        SELECT 
            t.task_id AS id, 
            t.student_id AS studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) AS studentName, 
            t.task_name AS task, 
            t.due_date AS dueDate, 
            t.status, 
            t.priority 
        FROM schedule_tasks t
        JOIN student s ON t.student_id = s.student_id
        ORDER BY t.due_date ASC
    ";
    $stmtTasks = $db->prepare($sqlTasks);
    $stmtTasks->execute();
    $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);

    // 2. ดึงข้อมูลรายชื่อนักศึกษาสำหรับ Dropdown ใน Modal
    $sqlStudents = "
        SELECT 
            student_id AS id, 
            CONCAT(first_name_th, ' ', last_name_th) AS name 
        FROM student
    ";
    $stmtStudents = $db->prepare($sqlStudents);
    $stmtStudents->execute();
    $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success", 
        "data" => [
            "tasks" => $tasks,
            "students" => $students
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "ไม่สามารถดึงข้อมูลได้: " . $e->getMessage()
    ]);
}
?>