<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");            // อนุญาตให้ส่ง Cookie/Session 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_code = $_GET['subject_code'] ?? null;

try {
    // ดึงก้อน JSON จากหลักสูตรที่กำลัง Active อยู่
    $sql = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $mapping_data = json_decode($row['mapping_json'], true);
        
        if ($subject_code) {
            // ค้นหา CLO ใน JSON ตามรหัสวิชาที่ส่งมา
            $subject_clos = $mapping_data['subject_mappings'][$subject_code]['clos'] ?? [];
            echo json_encode([
                "status" => "success", 
                "data" => $subject_clos 
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Subject code is required"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No active curriculum framework found"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>