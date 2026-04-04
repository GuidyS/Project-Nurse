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
    if (!empty($input['subject_code']) && isset($input['clos'])) {
        $subject_code = $input['subject_code'];
        $new_clos = $input['clos']; // รับก้อน CLO ที่แก้ไขแล้วจาก React
        
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            // ตรวจสอบและสร้าง Object โครงสร้างให้พร้อมก่อนยัดข้อมูล
            if (!isset($data['subject_mappings'])) $data['subject_mappings'] = [];
            if (!isset($data['subject_mappings'][$subject_code])) $data['subject_mappings'][$subject_code] = [];

            // 💥 นำ Array CLO ก้อนใหม่ ยัดเขียนทับของเก่าไปเลย!
            $data['subject_mappings'][$subject_code]['clos'] = $new_clos;

            // แปลงกลับเป็น JSON String 
            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);
            
            // อัปเดตลง Database
            $update_sql = "UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->execute([
                ':json' => $new_json,
                ':id' => $row['id']
            ]);

            echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO สำเร็จ!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตร"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลที่ส่งมาไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>