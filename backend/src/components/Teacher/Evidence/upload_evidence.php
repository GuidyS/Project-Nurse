<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

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
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $error_code = $_FILES['file']['error'] ?? 'unknown';
            echo json_encode(["status" => "error", "message" => "อัปโหลดไฟล์ไม่สำเร็จ (Error Code: $error_code). ไฟล์อาจมีขนาดใหญ่เกินไป"]);
            exit();
        }
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mime_type = mime_content_type($fileTmpPath);
        
        $is_image = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif']);
        $is_video = in_array($fileExtension, ['mp4', 'mov', 'avi']);
        $file_category = $is_image ? 'image' : ($is_video ? 'video' : 'document');

        $fileData = file_get_contents($fileTmpPath);
        $sql = "INSERT INTO portfolio (
                    student_id,
                    title,
                    type,
                    file_name,
                    file_data,
                    mime_type,
                    file_category,
                    verified
                ) VALUES (
                    :student_id,
                    :title,
                    :type,
                    :file_name,
                    :file_data,
                    :mime_type,
                    :file_category,
                    0
                )";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_id' => $student_id,
            ':title' => $title,
            ':type' => $type,
            ':file_name' => $fileName,
            ':file_data' => $fileData,
            ':mime_type' => $mime_type ?: null,
            ':file_category' => $file_category
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