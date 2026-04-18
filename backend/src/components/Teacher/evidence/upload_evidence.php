<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['studentId']) && !empty($input['title']) && !empty($input['type'])) {
        
        // 1. หารหัส Primary Key ของนักศึกษา
        $stmt_std = $pdo->prepare("SELECT student_id FROM student WHERE student_code = ? LIMIT 1");
        $stmt_std->execute([$input['studentId']]);
        $student_id = $stmt_std->fetchColumn();

        if (!$student_id) {
            echo json_encode(["status" => "error", "message" => "ไม่พบรหัสนักศึกษาในระบบ"]);
            exit();
        }

        // 2. แพ็กข้อมูลเป็น JSON เพื่อยัดลงคอลัมน์ file_path
        $meta_data = [
            "url" => "uploads/new_file_" . time() . ".pdf", // ชื่อไฟล์จำลอง
            "title" => $input['title'],
            "type" => $input['type'],
            "verified" => false
        ];
        $file_path_json = json_encode($meta_data, JSON_UNESCAPED_UNICODE);

        // 3. บันทึกลงตาราง portfolio ปกติเลย
        $sql = "INSERT INTO portfolio (student_id, file_path) VALUES (:student_id, :file_path)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_id' => $student_id,
            ':file_path' => $file_path_json
        ]);

        echo json_encode(["status" => "success", "message" => "อัปโหลดหลักฐานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>