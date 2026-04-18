<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_code = $_GET['subject_code'] ?? null;

try {
    if (!$subject_code) {
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสวิชา"]);
        exit();
    }

    $sql = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $data = json_decode($row['mapping_json'], true);
        
        // 1. ดึงข้อมูล CLO ของวิชานั้นๆ (ถ้าไม่มีให้คืนค่าเป็น Array ว่าง)
        $clos = $data['subject_mappings'][$subject_code]['clos'] ?? [];

        // 2. ดึงรายชื่อ PLO หลักสูตรทั้งหมด เพื่อเอาไปทำ Dropdown ใน Modal ของ React
        $plos = [];
        if (isset($data['plos'])) {
            foreach ($data['plos'] as $plo) {
                $plos[] = ["id" => $plo['id'], "name" => $plo['id']]; // ปรับเพิ่ม description ได้ถ้าต้องการ
            }
        }

        echo json_encode([
            "status" => "success", 
            "data" => [
                "clos" => $clos,
                "plos" => $plos
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่ใช้งานอยู่"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>