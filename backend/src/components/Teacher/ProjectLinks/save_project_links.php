<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();
    
    // รับข้อมูล JSON จาก React
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['projectId']) && isset($input['project_id'])) {
        $input['projectId'] = $input['project_id'];
    }

    if (!isset($input['projectId']) || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $projectId = $input['projectId'];
    $links = $input['links']; // หน้าตาที่รับมาคือ: { plos: [...], ylos: [...], clos: [...] }

    // แปลงข้อมูล Array เป็น JSON String (รองรับภาษาไทย)
    $mapping_json_string = json_encode($links, JSON_UNESCAPED_UNICODE);

    // ทำการอัปเดตข้อมูล JSON ลงในคอลัมน์ mapping_json
    $sql = "UPDATE project SET mapping_json = :mapping_json WHERE project_id = :project_id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':mapping_json' => $mapping_json_string,
        ':project_id' => $projectId
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกการเชื่อมโยงข้อมูลโครงการสำเร็จเรียบร้อยแล้ว"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "ไม่สามารถบันทึกข้อมูลได้: " . $e->getMessage()
    ]);
}
?>