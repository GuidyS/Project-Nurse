<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Connect();
    
    if (!isset($input['id'])) {
        throw new Exception("Invalid input data: Missing ID");
    }

    // ดึงข้อมูลก่อนอัปเดตเพื่อใช้สำหรับลงบันทึก Log
    $infoStmt = $db->prepare("
        SELECT e.subject_id, s.subject_code, std.student_id 
        FROM enrollment e 
        JOIN subject s ON e.subject_id = s.subject_id 
        JOIN student std ON e.student_id = std.student_id 
        WHERE e.enrollment_id = :id LIMIT 1
    ");
    $infoStmt->execute([':id' => $input['id']]);
    $enrollmentInfo = $infoStmt->fetch(PDO::FETCH_ASSOC);

    // อัปเดตเกรดโดยอ้างอิงจาก enrollment_id ที่เราดึงมาจาก get_course_students.php
    $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':grade' => $input['grade']
    ]);
    
    // ตรวจสอบว่าอัปเดตสำเร็จไหม
    if ($stmt->rowCount() > 0 || $input['grade']) {
        
        // บันทึก Log เมื่อมีการแก้ไขเกรดสำเร็จ
        if ($enrollmentInfo) {
            $studentId = $enrollmentInfo['student_id'];
            $subjectCode = $enrollmentInfo['subject_code'];
            $gradeAssigned = $input['grade'] ?: 'ลบเกรด';
            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'grades', "บันทึก/แก้ไขเกรดรายวิชา {$subjectCode} (นักศึกษา: {$studentId} เกรด: {$gradeAssigned})");
        }

        echo json_encode(["status" => "success", "message" => "Grade updated successfully"]);
    } else {
        throw new Exception("ไม่พบข้อมูลการลงทะเบียนนี้ในระบบ");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>