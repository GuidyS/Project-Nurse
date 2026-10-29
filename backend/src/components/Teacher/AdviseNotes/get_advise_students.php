<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
require_once __DIR__ . '/../../Admin/AssignStudents/assign_students_helpers.php';
require_once __DIR__ . '/../../../config/config.php';
$user_id = $_SESSION['user_id'];

$pdo = new Connect();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // หา faculty_id ของคนที่ล็อกอิน (username = faculty_id)
    $stmt_fac = $pdo->prepare("SELECT username, role_id FROM users WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $user = $stmt_fac->fetch(PDO::FETCH_ASSOC);
    if (!$user || !in_array((int)$user['role_id'], [1, 2, 5], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }
    $faculty_id = (string)$user['username'];

    // ดึงเฉพาะนักศึกษาในความดูแล (student_advisor_mapping) ถ้ามีการ map ไว้
    $advisorType = assignStudentsResolveType('advisor');
    [$typeSql, $typeParams] = assignStudentsTypeCondition($advisorType, 'sam');

    $sql = "SELECT DISTINCT s.student_id as id, CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name
            FROM student_advisor_mapping sam
            JOIN student s ON sam.student_id = s.student_id
            WHERE sam.faculty_id = :faculty_id
              AND $typeSql
            ORDER BY s.student_id ASC";
    if (in_array((int)$user['role_id'], [1, 5], true)) {
        $students = $pdo->query("SELECT student_id as id, CONCAT(IFNULL(title,''), first_name_th, ' ', last_name_th) as name
                                 FROM student ORDER BY student_id ASC")->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($typeParams + [':faculty_id' => $faculty_id]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(["status" => "success", "data" => $students], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('get-advise-students failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถโหลดรายชื่อนักศึกษาได้"], JSON_UNESCAPED_UNICODE);
}
