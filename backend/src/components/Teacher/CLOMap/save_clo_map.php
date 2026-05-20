<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'auth_middleware.php'; // เปลี่ยน Path ให้ตรงกับที่คุณเก็บไฟล์นี้ไว้
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// รับก้อน Object cloMap จาก React
$inputCloMap = json_decode(file_get_contents("php://input"), true);

try {
    if ($inputCloMap !== null) {
        
        //  ดึง JSON เก่าจาก Database ขึ้นมาก่อน
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            // เช็คว่ามี key subject_mappings รึยัง ถ้าไม่มีให้สร้าง
            if (!isset($data['subject_mappings'])) {
                $data['subject_mappings'] = [];
            }

            //  วนลูปข้อมูลที่ React ส่งมา (วิชา => อาเรย์ของ PLO)
            foreach ($inputCloMap as $courseCode => $mappedPlos) {
                
                // ถ้ารายวิชานี้ยังไม่เคยมีโครงสร้างใน JSON เลย ให้สร้างโครงสร้างพื้นฐานรอไว้
                if (!isset($data['subject_mappings'][$courseCode])) {
                    $data['subject_mappings'][$courseCode] = ["clos" => []];
                }

                //  เก็บค่า Mapping ระดับวิชา ไว้ใน Key ชื่อ 'course_plos'
                // การทำแบบนี้จะไม่ไปก้าวก่าย/ทำลาย ข้อมูล CLO ย่อยๆ ที่ถูกสร้างจากหน้าอื่น
                $data['subject_mappings'][$courseCode]['course_plos'] = $mappedPlos;
            }

            //  แปลงร่างกลับเป็น JSON String
            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);

            // บันทึกทับลง Database
            $update_sql = "UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->execute([
                ':json' => $new_json, 
                ':id' => $row['id']
            ]);

            echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO Map สำเร็จ!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่กำลังใช้งาน"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ถูกต้อง"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>