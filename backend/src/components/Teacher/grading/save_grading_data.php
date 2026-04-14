<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin();
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

        // บันทึกแบบ Upsert (มีแล้วอัปเดต ไม่มีให้เพิ่ม)
        $sql = "INSERT INTO assessments (student_id, subject_id, faculty_id, academic_year, semester, grade, raw_scores) 
                VALUES (:std_id, :sub_id, :fac_id, :year, :sem, :grade, :raw_scores)
                ON DUPLICATE KEY UPDATE grade = VALUES(grade), raw_scores = VALUES(raw_scores), updated_at = CURRENT_TIMESTAMP";
        
        $stmt = $pdo->prepare($sql);
        
        foreach ($input['students'] as $student) {
            $raw_json = json_encode($student['scores'], JSON_UNESCAPED_UNICODE);
            $stmt->execute([
                ':std_id' => $student['id'],
                ':sub_id' => $subject_id,
                ':fac_id' => $faculty_id,
                ':year' => $academic_year,
                ':sem' => $semester,
                ':grade' => $student['grade'],
                ':raw_scores' => $raw_json
            ]);
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