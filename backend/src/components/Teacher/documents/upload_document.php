<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['name']) && !empty($input['course']) && !empty($input['type'])) {
        $courseCode = $input['course'];
        
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            if (!isset($data['subject_mappings'])) $data['subject_mappings'] = [];
            if (!isset($data['subject_mappings'][$courseCode])) $data['subject_mappings'][$courseCode] = [];
            if (!isset($data['subject_mappings'][$courseCode]['documents'])) $data['subject_mappings'][$courseCode]['documents'] = [];

            // สร้างเอกสารใหม่
            $new_doc = [
                "id" => "doc_" . time() . "_" . rand(100, 999),
                "name" => $input['name'],
                "type" => $input['type'],
                "uploadedAt" => date('Y-m-d'), // วันที่อัปโหลด
                "size" => "1.2 MB", // (จำลองขนาดไฟล์)
                "status" => "pending" // เอกสารใหม่ให้สถานะรอดำเนินการ
            ];

            // ดันเอกสารใหม่เข้า Array ของวิชานั้นๆ
            $data['subject_mappings'][$courseCode]['documents'][] = $new_doc;

            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);
            $update_stmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
            $update_stmt->execute([':json' => $new_json, ':id' => $row['id']]);

            echo json_encode(["status" => "success", "message" => "อัปโหลดเอกสารสำเร็จ"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "กรอกข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>