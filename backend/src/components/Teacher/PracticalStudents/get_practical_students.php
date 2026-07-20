<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();

    // 1. หา faculty_id ของอาจารย์
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // เช็คว่ามีตาราง schedule_tasks ไหม ป้องกัน Error
    $has_tasks_table = $db->query("SHOW TABLES LIKE 'schedule_tasks'")->rowCount() > 0;

    // 2. ดึงนักศึกษาที่อยู่ในความดูแล (ดึงจากตาราง mapping)
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name
        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        WHERE sam.faculty_id = :faculty_id
        ORDER BY s.student_id ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':faculty_id' => $my_faculty_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        $tasksCompleted = 0;
        $tasksPending = 0;
        
        // 3. ไปนับจำนวนงานของนักศึกษาแต่ละคนจากตาราง schedule_tasks
        if ($has_tasks_table) {
            $stmt_task = $db->prepare("SELECT status FROM schedule_tasks WHERE student_id = ?");
            $stmt_task->execute([$st['studentId']]);
            $tasks = $stmt_task->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($tasks as $t) {
                if ($t['status'] === 'completed') {
                    $tasksCompleted++;
                } else {
                    $tasksPending++;
                }
            }
        }

        $total = $tasksCompleted + $tasksPending;
        $progress = $total > 0 ? round(($tasksCompleted / $total) * 100) : 0;
        
        $status = 'active';
        if ($total > 0 && $progress == 100) {
            $status = 'completed';
        } else if ($tasksPending > 0 && $progress < 30) {
            // สมมติเกณฑ์ว่า ถ้างานค้างเยอะแล้วเปอร์เซ็นต์ต่ำ ให้ขึ้นเตือนว่า 'issue' (มีปัญหา)
            $status = 'issue'; 
        }

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            // สถานที่ฝึกปฏิบัติ ปัจจุบันยังไม่มีตารางเก็บ จึงใส่ค่า Default ไว้ก่อน
            "workplace" => "โรงพยาบาลเครือข่ายฝึกปฏิบัติ", 
            "progress" => $progress,
            "tasksCompleted" => $tasksCompleted,
            "tasksPending" => $tasksPending,
            "status" => $status
        ];
    }

    echo json_encode(["status" => "success", "data" => $students]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>