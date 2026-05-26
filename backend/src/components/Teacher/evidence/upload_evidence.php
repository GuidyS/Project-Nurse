<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. อ่านค่าตัวแปรจาก $_POST หรือ JSON input
    $studentId = $_POST['studentId'] ?? '';
    $title = $_POST['title'] ?? '';
    $type = $_POST['type'] ?? '';

    if (empty($studentId) || empty($title) || empty($type)) {
        $input = json_decode(file_get_contents("php://input"), true);
        $studentId = $input['studentId'] ?? '';
        $title = $input['title'] ?? '';
        $type = $input['type'] ?? '';
    }

    if (!empty($studentId) && !empty($title) && !empty($type)) {
        
        // 2. หารหัส Primary Key ของนักศึกษา
        $stmt_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_std->execute([$studentId]);
        $student_id = $stmt_std->fetchColumn();

        if (!$student_id) {
            echo json_encode(["status" => "error", "message" => "ไม่พบรหัสนักศึกษาในระบบ"]);
            exit();
        }

        // 3. จัดการเรื่องอัปโหลดไฟล์จริง
        $file_path = "uploads/placeholder.jpg"; // ค่าเริ่มต้นจำลอง
        
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            
            // ตั้งชื่อไฟล์ใหม่เพื่อป้องกันชื่อซ้ำและอักขระพิเศษ
            $newFileName = "evidence_" . $student_id . "_" . time() . "." . $fileExtension;
            
            $uploadFileDir = __DIR__ . '/../../../uploads/';
            
            // สร้างโฟลเดอร์ uploads หากยังไม่มี
            if (!file_exists($uploadFileDir)) {
                mkdir($uploadFileDir, 0777, true);
            }
            
            $dest_path = $uploadFileDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $file_path = "uploads/" . $newFileName;
            } else {
                echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดในการย้ายไฟล์ไปยังเซิร์ฟเวอร์"]);
                exit();
            }
        }

        // 4. แพ็กข้อมูลเป็น JSON เพื่อยัดลงคอลัมน์ file_path
        $meta_data = [
            "url" => $file_path,
            "title" => $title,
            "type" => $type,
            "verified" => false
        ];
        $file_path_json = json_encode($meta_data, JSON_UNESCAPED_UNICODE);

        // 5. บันทึกลงตาราง portfolio
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