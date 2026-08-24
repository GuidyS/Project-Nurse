<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // หา faculty_id ของคนที่ล็อกอิน (username = faculty_id)
    $stmt_fac = $pdo->prepare("SELECT username FROM users WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    // ดึงเฉพาะนักศึกษาในความดูแล (student_advisor_mapping) ถ้ามีการ map ไว้
    $sql = "SELECT s.student_id as id, CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name
            FROM student_advisor_mapping sam
            JOIN student s ON sam.student_id = s.student_id
            WHERE sam.faculty_id = ?
            ORDER BY s.student_id ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ถ้ายังไม่มีการ map ที่ปรึกษา ให้เลือกจากนักศึกษาทั้งหมดไปก่อน (ระบบยังใช้งานได้)
    if (empty($students)) {
        $students = $pdo->query("SELECT student_id as id, CONCAT(IFNULL(title,''), first_name_th, ' ', last_name_th) as name
                                 FROM student ORDER BY student_id ASC LIMIT 200")->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(["status" => "success", "data" => $students], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
