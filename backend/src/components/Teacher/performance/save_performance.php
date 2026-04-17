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

try {
    // ⚠️ ใช้ $_POST และ $_FILES เพราะ React ส่งมาเป็น FormData (ไม่ใช่ JSON raw body)
    $studentId = $_POST['studentId'] ?? null;
    $scores_raw = $_POST['scores'] ?? null;

    if ($studentId && $scores_raw) {
        $academic_year = date('Y') + 543;
        $semester = 1;

        // 1. หา faculty_id ของอาจารย์ผู้ประเมิน
        $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
        $stmt_fac->execute([$user_id]);
        $faculty_id = $stmt_fac->fetchColumn();

        // 2. แปลงคะแนนและหาค่าเฉลี่ย (Overall)
        $scores = json_decode($scores_raw, true);
        $overall = ($scores['skill'] + $scores['attitude'] + $scores['knowledge'] + $scores['communication']) / 4;
        
        // 3. ระบบจัดการไฟล์อัปโหลด (หลักฐาน)
        $evidence_path = null;
        if (isset($_FILES['evidence_file']) && $_FILES['evidence_file']['error'] === UPLOAD_ERR_OK) {
            
            // ตรวจสอบนามสกุลไฟล์
            $file_extension = strtolower(pathinfo($_FILES['evidence_file']['name'], PATHINFO_EXTENSION));
            $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
            
            if (!in_array($file_extension, $allowed_extensions)) {
                echo json_encode(["status" => "error", "message" => "ไม่อนุญาตให้อัปโหลดไฟล์ประเภทนี้ รองรับเฉพาะ JPG, PNG, PDF เท่านั้น"]);
                exit();
            }

            // สร้างโฟลเดอร์ถ้ายังไม่มี
            $upload_dir = 'uploads/evaluations/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true); 
            
            // ตั้งชื่อไฟล์ใหม่ป้องกันการซ้ำ
            $new_filename = "eval_" . time() . "_" . rand(100,999) . "." . $file_extension;
            $target_file = $upload_dir . $new_filename;

            // ย้ายไฟล์เข้าโฟลเดอร์
            if (move_uploaded_file($_FILES['evidence_file']['tmp_name'], $target_file)) {
                $evidence_path = $target_file; 
            }
        }

        // 4. บันทึกลงตาราง student_performance
        $sql = "INSERT INTO student_performance (student_id, faculty_id, academic_year, semester, scores_json, overall_score, evidence_path) 
                VALUES (:std_id, :fac_id, :year, :sem, :scores, :overall, :evidence)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':std_id' => $studentId,
            ':fac_id' => $faculty_id,
            ':year' => $academic_year,
            ':sem' => $semester,
            ':scores' => $scores_raw, // บันทึก JSON String กลับลงไป
            ':overall' => $overall,
            ':evidence' => $evidence_path // ถ้าไม่อัปโหลดมา จะเป็น null
        ]);

        echo json_encode(["status" => "success", "message" => "บันทึกการประเมินและอัปโหลดหลักฐานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>