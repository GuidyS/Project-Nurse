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

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['id'])) {
        $portfolio_id = $input['id'];

        // 1. ดึง file_path เก่าขึ้นมาแกะดูก่อน
        $stmt_get = $pdo->prepare("SELECT file_path FROM portfolio WHERE portfolio_id = ?");
        $stmt_get->execute([$portfolio_id]);
        $current_file_path = $stmt_get->fetchColumn();

        if ($current_file_path) {
            $meta = json_decode($current_file_path, true);
            
            // ถ้าดึงมาแล้วไม่ใช่ JSON (เป็นไฟล์แบบเก่า) ให้สร้างโครงสร้างมารองรับเลย
            if (!is_array($meta)) {
                $meta = ["url" => $current_file_path, "title" => "หลักฐาน", "type" => "document"];
            }

            // 2. ปรับสถานะเป็น ตรวจสอบแล้ว (true)
            $meta['verified'] = true;
            $new_file_path_json = json_encode($meta, JSON_UNESCAPED_UNICODE);

            // 3. เซฟทับกลับลงไป
            $stmt_update = $pdo->prepare("UPDATE portfolio SET file_path = :new_path WHERE portfolio_id = :id");
            $stmt_update->execute([
                ':new_path' => $new_file_path_json,
                ':id' => $portfolio_id
            ]);

            echo json_encode(["status" => "success", "message" => "ยืนยันการตรวจสอบเรียบร้อย"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลหลักฐาน"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>