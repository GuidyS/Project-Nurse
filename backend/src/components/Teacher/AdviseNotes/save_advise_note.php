<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../../config/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();

$advisor_user_id = $_SESSION['user_id'] ?? null;
if (!$advisor_user_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$pdo = new Connect();
$input = json_decode(file_get_contents("php://input"), true);

try {
    // เช็คว่าส่งข้อมูลสำคัญมาครบไหม (รหัสนศ., หัวข้อ, ประเภท, รายละเอียด)
    if (!empty($input['studentId']) && !empty($input['topic']) && !empty($input['summary'])) {
        
        // 1. หา student_id (PK) จาก student_id ที่หน้าเว็บส่งมา (แก้จาก student_code)
        $stmt_find_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_find_std->execute([$input['studentId']]);
        $student = $stmt_find_std->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษารหัสนี้ในระบบ"]);
            exit();
        }

        // 2. หา faculty_id ของอาจารย์
        $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
        $stmt_fac->execute([$advisor_user_id]);
        $my_faculty_id = $stmt_fac->fetchColumn();

        // 3. บันทึกลงฐานข้อมูล (ตารางมีแค่ student_id, advisor_id, advice_note)
        $advice_note_text = "หัวข้อ: " . $input['topic'] . "\nรายละเอียด: " . $input['summary'];
        $advisor_val = $my_faculty_id ? $my_faculty_id : $advisor_user_id;

        if (!empty($input['adviceId'])) {
            // กรณีมีรหัส adviceId หมายถึงการ 'แก้ไข'
            $sql = "UPDATE advice_log SET advice_note = :summary WHERE advice_id = :advice_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':advice_id' => $input['adviceId'],
                ':summary' => $advice_note_text
            ]);
        } else {
            // กรณีไม่มีรหัส หมายถึง 'เพิ่มใหม่'
            $sql = "INSERT INTO advice_log (student_id, advisor_id, advice_note) 
                    VALUES (:student_id, :advisor_id, :summary)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':student_id' => $student['student_id'],
                ':advisor_id' => $advisor_val,
                ':summary' => $advice_note_text
            ]);
        }

        echo json_encode(["status" => "success", "message" => "บันทึกการให้คำปรึกษาเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>