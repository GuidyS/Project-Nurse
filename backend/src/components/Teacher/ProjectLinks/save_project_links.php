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

    $projectId = $input['projectId'] ?? $input['project_id'] ?? null;
    if (!$projectId || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $links = $input['links']; // { plos: [...], ylos: [...], clos: [...] }

    // อ่าน mapping_json เดิมมาก่อน แล้วบันทึกใต้ key 'links' เพื่อไม่ทับข้อมูล meta อื่นของโครงการ
    $cur = $db->prepare("SELECT mapping_json FROM project WHERE project_id = ?");
    $cur->execute([$projectId]);
    $existing = json_decode($cur->fetchColumn() ?: '{}', true) ?: [];
    $existing['links'] = [
        'plos' => array_values($links['plos'] ?? []),
        'ylos' => array_values($links['ylos'] ?? []),
        'clos' => array_values($links['clos'] ?? []),
    ];

    $sql = "UPDATE project SET mapping_json = :mapping_json WHERE project_id = :project_id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':mapping_json' => json_encode($existing, JSON_UNESCAPED_UNICODE),
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