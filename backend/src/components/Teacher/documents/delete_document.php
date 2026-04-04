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
    if (!empty($input['document_id'])) {
        $doc_id = $input['document_id'];
        
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            $found = false;

            // วนหาเอกสารในทุกวิชาเพื่อลบออก
            if (isset($data['subject_mappings'])) {
                foreach ($data['subject_mappings'] as $courseCode => &$subjectData) {
                    if (isset($subjectData['documents'])) {
                        foreach ($subjectData['documents'] as $key => $doc) {
                            if ($doc['id'] === $doc_id) {
                                array_splice($subjectData['documents'], $key, 1);
                                $found = true;
                                break 2; // เจอแล้วลบและหยุดลูปทั้งหมดทันที
                            }
                        }
                    }
                }
            }

            if ($found) {
                $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);
                $update_stmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
                $update_stmt->execute([':json' => $new_json, ':id' => $row['id']]);
                echo json_encode(["status" => "success", "message" => "ลบเอกสารสำเร็จ"]);
            } else {
                echo json_encode(["status" => "error", "message" => "ไม่พบเอกสารที่ต้องการลบ"]);
            }
        }
    } else {
        echo json_encode(["status" => "error", "message" => "รหัสเอกสารไม่ถูกต้อง"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>