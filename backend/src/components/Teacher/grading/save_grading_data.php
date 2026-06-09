<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['subject_id']) && isset($input['students'])) {
        $subject_id = $input['subject_id'];
        $academic_year = date('Y') + 543;
        $semester = 1; // เปลี่ยนตามความจริงได้

        $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
        $stmt_fac->execute([$user_id]);
        $faculty_id = $stmt_fac->fetchColumn();

        // อัปเดตข้อมูลเกรดในตาราง enrollment
        $sql = "UPDATE enrollment 
                SET grade = :grade 
                WHERE student_id = :std_id AND subject_id = :sub_id";
        
        $stmt = $pdo->prepare($sql);
        
        foreach ($input['students'] as $student) {
            $stmt->execute([
                ':std_id' => $student['id'],
                ':sub_id' => $subject_id,
                ':grade' => $student['grade']
            ]);
            
            // ถ้าเป็น mock student และยังไม่มีแถวใน enrollment ให้ทำการ INSERT อัตโนมัติ
            if ($stmt->rowCount() === 0) {
                $chk = $pdo->prepare("SELECT enrollment_id FROM enrollment WHERE student_id = ? AND subject_id = ?");
                $chk->execute([$student['id'], $subject_id]);
                if (!$chk->fetchColumn()) {
                    $insert_stmt = $pdo->prepare("
                        INSERT INTO enrollment (student_id, subject_id, grade, status, academic_year, semester, section) 
                        VALUES (?, ?, ?, 'Active', ?, ?, 1)
                    ");
                    $insert_stmt->execute([
                        $student['id'],
                        $subject_id,
                        $student['grade'],
                        $academic_year,
                        $semester
                    ]);
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "บันทึกคะแนนดิบและเกรดสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>