<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}
$advisor_user_id = $_SESSION['user_id'];

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/AssignStudents/assign_students_helpers.php';
$pdo = new Connect();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. ดึง role ของผู้ใช้
    $roleStmt = $pdo->prepare("SELECT role_id, username FROM users WHERE user_id = ?");
    $roleStmt->execute([$advisor_user_id]);
    $user = $roleStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || !in_array((int)$user['role_id'], [1, 2, 5], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }
    $roleId = (int)$user['role_id'];
    $facultyId = $user['username']; // faculty_id

    // 2. ถ้าเป็น Dean (5) หรือ Admin (1) ดูได้ทั้งหมด
    // ถ้าเป็น Teacher (2) ดูได้เฉพาะนักศึกษาที่ตนเองเป็นอาจารย์ที่ปรึกษา
    if ($roleId === 1 || $roleId === 5) {
        $sql = "SELECT
                    a.advice_id as id,
                    s.student_id as studentId,
                    CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as studentName,
                    DATE_FORMAT(a.created_at, '%Y-%m-%d') as date,
                    a.topic,
                    a.log_type as type,
                    a.advice_note as summary
                FROM advice_log a
                JOIN student s ON a.student_id = s.student_id
                ORDER BY a.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    } else {
        $advisorType = assignStudentsResolveType('advisor');
        [$typeSql, $typeParams] = assignStudentsTypeCondition($advisorType, 'sam');
        $sql = "SELECT
                    a.advice_id as id,
                    s.student_id as studentId,
                    CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as studentName,
                    DATE_FORMAT(a.created_at, '%Y-%m-%d') as date,
                    a.topic,
                    a.log_type as type,
                    a.advice_note as summary
                FROM advice_log a
                JOIN student s ON a.student_id = s.student_id
                WHERE a.student_id IN (
                    SELECT student_id FROM student_advisor_mapping sam
                    WHERE sam.faculty_id = :faculty_id AND $typeSql
                )
                ORDER BY a.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($typeParams + [':faculty_id' => $facultyId]);
    }
    
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $currentMonth = date('Y-m');
    $stats = ["total" => count($notes), "thisMonth" => 0, "warning" => 0, "critical" => 0];
    
    foreach ($notes as &$note) {
        if (substr((string)$note['date'], 0, 7) === $currentMonth) $stats["thisMonth"]++;
        if ($note['type'] === 'warning') $stats["warning"]++;
        if ($note['type'] === 'critical') $stats["critical"]++;
        
        // ถ้าระดับสิทธิ์เป็น Admin (1) ให้เซ็นเซอร์ข้อมูลส่วนตัว/วิกฤต
        if ($roleId === 1 && in_array($note['type'], ['critical', 'personal'])) {
            $note['topic'] = '*** ข้อมูลถูกปกปิด ***';
            $note['summary'] = 'ข้อมูลถูกปกปิด (เข้าถึงได้เฉพาะอาจารย์ที่ปรึกษาปัจจุบันและคณบดีเท่านั้น)';
        }
    }

    echo json_encode(["status" => "success", "data" => ["notes" => $notes, "stats" => $stats]], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('get-advise-notes failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถโหลดบันทึกคำปรึกษาได้"], JSON_UNESCAPED_UNICODE);
}
