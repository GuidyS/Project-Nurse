<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
    }

    $db = new Connect();

    if (!empty($input['subject_id']) && isset($input['students'])) {
        $subject_id = $input['subject_id'];
        $academic_year = date('Y') + 543;
        $semester = 1;

        // อัปเดตข้อมูลเกรดในตาราง enrollment (ลูปเซฟเฉพาะคนที่มีการเลือกเกรดใหม่)
        $sql = "UPDATE enrollment 
                SET grade = :grade 
                WHERE student_id = :std_id AND subject_id = :sub_id";
        
        $stmt = $db->prepare($sql);
        $stmt_gpa = $db->prepare("UPDATE student SET gpa = :gpa WHERE student_id = :std_id");
        
        foreach ($input['students'] as $student) {
            $grade_to_save = ($student['grade'] === '-') ? null : $student['grade'];
            $gpa_to_save = null;

            if (array_key_exists('gpa', $student) && $student['gpa'] !== '' && $student['gpa'] !== null) {
                if (!is_numeric($student['gpa'])) {
                    throw new Exception("รูปแบบ GPA ไม่ถูกต้อง");
                }

                $gpa_to_save = round((float)$student['gpa'], 2);
                if ($gpa_to_save < 0 || $gpa_to_save > 4) {
                    throw new Exception("GPA ต้องอยู่ระหว่าง 0.00 ถึง 4.00");
                }
            }
            
            $stmt->execute([
                ':std_id' => $student['id'],
                ':sub_id' => $subject_id,
                ':grade' => $grade_to_save
            ]);

            if (array_key_exists('gpa', $student)) {
                $stmt_gpa->execute([
                    ':std_id' => $student['id'],
                    ':gpa' => $gpa_to_save
                ]);
            }
            
            // ถ้าไม่เจอให้ INSERT เข้าไป
            if ($stmt->rowCount() === 0) {
                $chk = $db->prepare("SELECT enrollment_id FROM enrollment WHERE student_id = ? AND subject_id = ?");
                $chk->execute([$student['id'], $subject_id]);
                if (!$chk->fetchColumn()) {
                    $insert_stmt = $db->prepare("
                        INSERT INTO enrollment (student_id, subject_id, grade, status, academic_year, semester, section) 
                        VALUES (?, ?, ?, 'Active', ?, ?, 1)
                    ");
                    $insert_stmt->execute([
                        $student['id'],
                        $subject_id,
                        $grade_to_save,
                        $academic_year,
                        $semester
                    ]);
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "บันทึกเกรดสำเร็จเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>