<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// ... (โค้ดเดิมที่เหลือปล่อยไว้เหมือนเดิมได้เลยครับ)
//ทำไมหน้านี้ถึงไม่ต้องมี Allow-Methods: POST, OPTIONS ? เพราะไฟล์นี้ใช้สำหรับ ดึงข้อมูล (GET) อย่างเดียว ไม่ได้ใช้ส่งข้อมูล (POST)"
//ทำไมหน้านี้ถึงไม่ต้องมี Content-Type  เพราะเราไม่ได้ส่งข้อมูลก้อน JSON "เข้าไป" ในไฟล์นี้ เราแค่ส่งเลข ID ผ่าน URL ไปเฉยๆ
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// รับค่ารหัสวิชาจาก URL เช่น get_mapping.php?subject_code=170-211
$subject_code = $_GET['subject_code'] ?? null;

try {
    // 1. ดึงก้อน JSON จากหลักสูตรที่กำลัง Active อยู่
    $sql = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // 2. แปลง JSON string เป็น PHP Associative Array
        $mapping_data = json_decode($row['mapping_json'], true);
        
        // 3. ดึงเฉพาะข้อมูลของวิชาที่ถูกส่งมา (ถ้าไม่มีให้เป็น Array ว่าง)
        if ($subject_code) {
            // วิ่งเข้าไปที่ object -> subject_mappings -> "รหัสวิชา" -> clos
            $subject_clos = $mapping_data['subject_mappings'][$subject_code]['clos'] ?? [];
            
            echo json_encode([
                "status" => "success", 
                "data" => $subject_clos // ส่ง Array ของ CLO กลับไปให้ React
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