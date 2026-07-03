<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Connect();
    
    if (!isset($input['id'])) {
        throw new Exception("Invalid input data: Missing ID");
    }

    // อัปเดตเกรดโดยอ้างอิงจาก enrollment_id ที่เราดึงมาจาก get_course_students.php
    $sql = "UPDATE enrollment SET grade = :grade, midterm = :midterm, final = :final, assignment = :assignment WHERE enrollment_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':grade' => $input['grade'],
        ':midterm' => $input['midterm'] ?? null,
        ':final' => $input['final'] ?? null,
        ':assignment' => $input['assignment'] ?? null
    ]);
    
    // ตรวจสอบว่าอัปเดตสำเร็จไหม
    if ($stmt->rowCount() > 0 || $input['grade']) {
        echo json_encode(["status" => "success", "message" => "Grade updated successfully"]);
    } else {
        throw new Exception("ไม่พบข้อมูลการลงทะเบียนนี้ในระบบ");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>