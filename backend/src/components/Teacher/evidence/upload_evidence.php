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
        $is_doc = in_array($fileExtension, ['pdf', 'xls', 'xlsx', 'csv', 'doc', 'docx']);

        // Insert metadata first to get portfolio_id
        $meta_data = [
            "title" => $title,
            "type" => $type,
            "verified" => false,
            "url" => "" // Will be updated to ID-based URL
        ];
        $file_path_json = json_encode($meta_data, JSON_UNESCAPED_UNICODE);

        $sql = "INSERT INTO portfolio (student_id, file_path) VALUES (:student_id, :file_path)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_id' => $student_id,
            ':file_path' => $file_path_json
        ]);
        
        $portfolio_id = $pdo->lastInsertId();
        
        // Handle file based on type
        $fileData = file_get_contents($fileTmpPath);
        
        if ($is_image) {
            $stmt = $pdo->prepare("INSERT INTO portfolio_images (portfolio_id, image_data) VALUES (?, ?)");
            $stmt->execute([$portfolio_id, $fileData]);
            
        } elseif ($is_video) {
            $stmt = $pdo->prepare("INSERT INTO portfolio_videos (portfolio_id, video_data, mime_type) VALUES (?, ?, ?)");
            $stmt->execute([$portfolio_id, $fileData, $mime_type]);
            
        } else {
            // Documents or others go to portfolio table
            $stmt = $pdo->prepare("UPDATE portfolio SET file_data = ? WHERE portfolio_id = ?");
            $stmt->execute([$fileData, $portfolio_id]);
        }
        
        // Update URL to use the new ID format
        $meta_data['url'] = "index.php?page=download-file&id=" . $portfolio_id;
        $file_path_json = json_encode($meta_data, JSON_UNESCAPED_UNICODE);
        $stmt = $pdo->prepare("UPDATE portfolio SET file_path = ? WHERE portfolio_id = ?");
        $stmt->execute([$file_path_json, $portfolio_id]);

        echo json_encode(["status" => "success", "message" => "อัปโหลดหลักฐานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>