<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");  // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");    // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'auth_middleware.php'; // เปลี่ยน Path ให้ตรงกับที่คุณเก็บไฟล์นี้ไว้
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// รับก้อน JSON ที่ React ส่งมา (ผ่าน Axios หรือ Fetch POST)
$input = json_decode(file_get_contents("php://input"), true);

try {
    // เช็คว่ามีส่ง subject_code และ clos มาหรือไม่
    if (!empty($input['subject_code']) && isset($input['clos'])) {
        
        $subject_code = $input['subject_code'];
        $new_clos = $input['clos']; // Array ก้อนใหม่ของ CLO จาก React

        // ดึง JSON เก่าจากฐานข้อมูลขึ้นมาก่อน
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            //  ป้องกันกรณี JSON เดิมไม่มีโครงสร้าง subject_mappings ให้สร้างใหม่
            if (!isset($data['subject_mappings'])) {
                $data['subject_mappings'] = [];
            }
            if (!isset($data['subject_mappings'][$subject_code])) {
                $data['subject_mappings'][$subject_code] = ["clos" => []];
            }

            // นำข้อมูลที่ React ส่งมา ยัด "ทับ" ข้อมูลเดิมไปเลย!
            // ไม่ต้องสนใจว่าอันไหนเพิ่ม ลบ หรือแก้ แค่ทับของเดิมให้เหมือนหน้าจอเป๊ะๆ
            $data['subject_mappings'][$subject_code]['clos'] = $new_clos;

            //  แปลง PHP Array กลับเป็น JSON String (ต้องมี UNESCAPED_UNICODE ป้องกันภาษาไทยเพี้ยน)
            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);

            //  บันทึก JSON ก้อนใหม่กลับลง Database
            $update_sql = "UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->execute([
                ':json' => $new_json, 
                ':id' => $row['id']
            ]);

            echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO เรียบร้อยแล้ว!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบหลักสูตรที่เปิดใช้งาน"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลที่ส่งมาไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>