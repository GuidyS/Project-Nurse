<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

$advisor_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// Get faculty_id
$stmt_fac = $pdo->prepare("SELECT username FROM users WHERE user_id = ?");
$stmt_fac->execute([$advisor_user_id]);
$fac_row = $stmt_fac->fetch(PDO::FETCH_ASSOC);
$faculty_id = $fac_row ? $fac_row['username'] : '41172008';

$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['studentId']) && !empty($input['topic']) && !empty($input['summary'])) {
        
        $stmt_find_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_find_std->execute([$input['studentId']]);
        $student = $stmt_find_std->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษารหัสนี้ในระบบ"]);
            exit();
        }

        // เก็บข้อมูลทั้งหมดลงรูปแบบ JSON ลงคอลัมน์ advice_note ตัวเดียว ตามที่ตกลงกันไว้ (ไม่เพิ่มคอลัมน์)
        $note_data = [
            "topic" => $input['topic'],
            "type" => $input['type'],
            "summary" => $input['summary'],
            "date" => date('Y-m-d')
        ];
        $json_note = json_encode($note_data, JSON_UNESCAPED_UNICODE);

        if (isset($input['id']) && $input['id'] !== '') {
            // Update existing
            $sql = "UPDATE advice_log 
                    SET student_id = :student_id, advice_note = :advice_note
                    WHERE advice_id = :advice_id AND advisor_id = :advisor_id";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':student_id' => $student['student_id'],
                ':advice_note' => $json_note,
                ':advice_id' => $input['id'],
                ':advisor_id' => $faculty_id
            ]);
            echo json_encode(["status" => "success", "message" => "แก้ไขข้อมูลสำเร็จ"]);
        } else {
            // Insert new
            $sql = "INSERT INTO advice_log (student_id, advisor_id, advice_note) 
                    VALUES (:student_id, :advisor_id, :advice_note)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':student_id' => $student['student_id'],
                ':advisor_id' => $faculty_id,
                ':advice_note' => $json_note
            ]);
            echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"]);
        }

    } else {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>