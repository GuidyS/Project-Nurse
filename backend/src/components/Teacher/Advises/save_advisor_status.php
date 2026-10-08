<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    $db = new Connect();

    // หารหัสอาจารย์ (faculty_id) ของคนที่ล็อกอินอยู่
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    if (!$my_faculty_id) {
        throw new Exception("ไม่พบข้อมูลอาจารย์");
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $studentId = $input['studentId'] ?? '';
    $status = $input['status'] ?? ''; // 'ปกติ' or 'ไม่ปกติ'
    $statusDetails = $input['statusDetails'] ?? '';

    if (!$studentId || !in_array($status, ['ปกติ', 'ไม่ปกติ'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง");
    }

    // ตรวจสอบว่าเป็นนักศึกษาในความดูแลของอาจารย์คนนี้จริงหรือไม่
    $checkStmt = $db->prepare("SELECT COUNT(*) FROM student_advisor_mapping WHERE student_id = ? AND faculty_id = ?");
    $checkStmt->execute([$studentId, $my_faculty_id]);
    if ($checkStmt->fetchColumn() == 0) {
        throw new Exception("ไม่มีสิทธิ์แก้ไขข้อมูลนักศึกษาคนนี้");
    }

    $updateStmt = $db->prepare("UPDATE student SET advisor_status = ?, advisor_status_details = ? WHERE student_id = ?");
    $updateStmt->execute([$status, $statusDetails, $studentId]);

    echo json_encode(["status" => "success", "message" => "อัปเดตสถานะนักศึกษาเรียบร้อยแล้ว"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
