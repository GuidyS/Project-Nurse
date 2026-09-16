<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/AssignStudents/assign_students_helpers.php';

// หน้านี้แสดงเฉพาะนักศึกษาของ "อาจารย์ปฏิบัติ"
// (นักศึกษาในที่ปรึกษาอยู่ที่หน้า นักศึกษาในความดูแล แยกกันคนละหน้า)
[$typeSql, $typeParams] = assignStudentsTypeCondition(assignStudentsResolveType('practical'), 'sam');

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
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

    // เช็คว่ามีตาราง schedule_tasks / approval_requests ไหม
    $has_tasks_table = $db->query("SHOW TABLES LIKE 'schedule_tasks'")->rowCount() > 0;
    $has_approval_table = $db->query("SHOW TABLES LIKE 'approval_requests'")->rowCount() > 0;

    // 2. ดึงนักศึกษาที่อยู่ในความดูแล (ดึงจากตาราง mapping)
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name
        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        WHERE sam.faculty_id = :faculty_id
          AND $typeSql
        GROUP BY s.student_id
        ORDER BY s.student_id ASC
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute([':faculty_id' => $my_faculty_id] + $typeParams);
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
            $status = 'issue'; 
        }

        // 4. คะแนน performance ล่าสุดจาก approval_requests (ถ้ามี)
        $performance = null;
        $hasPerformanceEval = false;
        $performanceComment = "";
        if ($has_approval_table) {
            $stmt_perf = $db->prepare("
                SELECT description
                FROM approval_requests
                WHERE request_type = 'performance_eval'
                  AND target_ref_type = 'student'
                  AND target_ref_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt_perf->execute([(string)$st['studentId']]);
            $scoreRaw = $stmt_perf->fetchColumn();
            if ($scoreRaw) {
                $scores = json_decode($scoreRaw, true) ?: [];
                if (isset($scores['overall'])) {
                    $overall = (float)$scores['overall'];
                    // รองรับทั้งสเกล 0-5 (หน้า Performance) และ 0-100 (หน้าประเมินเร็ว)
                    $performance = $overall <= 5 ? (int)round(($overall / 5) * 100) : (int)round($overall);
                    $hasPerformanceEval = true;
                } elseif (isset($scores['score'])) {
                    $performance = (int)round((float)$scores['score']);
                    $hasPerformanceEval = true;
                }
                $performanceComment = isset($scores['comment']) ? (string)$scores['comment'] : "";
            }
        }

        // สถานที่ฝึก / หอผู้ป่วย — ยังไม่มีตารางเก็บจริง ใช้ค่า default
        $workplace = "โรงพยาบาลเครือข่ายฝึกปฏิบัติ";
        $ward = "—";

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "workplace" => $workplace,
            "hospital" => $workplace,
            "ward" => $ward,
            "progress" => $progress,
            "performance" => $performance,
            "hasPerformanceEval" => $hasPerformanceEval,
            "performanceComment" => $performanceComment,
            "tasksCompleted" => $tasksCompleted,
            "tasksPending" => $tasksPending,
            "totalTasks" => $total,
            "status" => $status
        ];
    }

    echo json_encode(["status" => "success", "data" => $students]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>