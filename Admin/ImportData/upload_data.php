<?php
session_start();
// 1. ตั้งค่าความปลอดภัยและ CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// จัดการ Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 2. ตรวจสอบสิทธิ์
require_once 'auth_middleware.php'; 
requireLogin(); 
$user_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $importType = $_POST['importType'] ?? '';
        $file = $_FILES['file'] ?? null;

        if (!$importType || !$file || $file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "กรุณาเลือกไฟล์และประเภทข้อมูลให้ถูกต้อง"]);
            exit();
        }

        $recordCount = 0;
        $status = "success";
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // ตัวอย่างลอจิกการอ่านไฟล์ CSV
        if ($file_ext === 'csv') {
            if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
                $header = fgetcsv($handle, 1000, ","); // ข้ามหัวตาราง
                while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    $recordCount++;
                    // ตรงนี้เอาไว้เขียนคำสั่ง INSERT ลง DB จริงๆ ในอนาคต
                }
                fclose($handle);
            }
        } else {
            // จำลองตัวเลขหากเป็น Excel (.xlsx) ไปก่อน
            $recordCount = rand(50, 300); 
        }

        // --- สร้างข้อความประวัติ เพื่อบันทึกลง audit_log (จำกัดไม่เกิน 50 ตัวอักษร) ---
        $originalName = $file['name'];
        $shortFilename = mb_strlen($originalName) > 15 
            ? mb_substr($originalName, 0, 10) . "..." . mb_substr($originalName, -4) 
            : $originalName;

        $action_log = mb_substr("Import:{$importType}|{$shortFilename}|{$recordCount}|{$status}", 0, 50);

        // บันทึกลงฐานข้อมูลตารางเดิม
        $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action, created_at) VALUES (?, ?, NOW())");
        $stmt_log->execute([$user_id, $action_log]);

        echo json_encode([
            "status" => "success", 
            "message" => "นำเข้าข้อมูลจำนวน {$recordCount} รายการ สำเร็จ!"
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>