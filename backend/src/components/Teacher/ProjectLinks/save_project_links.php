<?php
if (session_status() === PHP_SESSION_NONE) session_start();

// 💡 แก้ไข: ทำระบบค้นหาไฟล์ config อัตโนมัติ
$possible_paths = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/../config/config.php',
    __DIR__ . '/../../config/config.php',
    __DIR__ . '/../../../config/config.php'
];
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();
    
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input) || !isset($input['project_id']) || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $projectId = $input['project_id'];
    $links = $input['links'];

    $normalizedLinks = [
        'plos' => array_values(array_unique(array_filter($links['plos'] ?? [], 'is_string'))),
        'ylos' => array_values(array_unique(array_filter($links['ylos'] ?? [], 'is_string'))),
        'clos' => array_values(array_unique(array_filter($links['clos'] ?? [], 'is_string'))),
    ];

    $db->beginTransaction();

    $deleteStmt = $db->prepare("DELETE FROM project_outcome_links WHERE project_id = :project_id");
    $deleteStmt->execute([':project_id' => $projectId]);

    $insertStmt = $db->prepare("
        INSERT INTO project_outcome_links (project_id, outcome_type, outcome_code)
        VALUES (:project_id, :outcome_type, :outcome_code)
    ");

    foreach (['plos' => 'plo', 'ylos' => 'ylo', 'clos' => 'clo'] as $payloadKey => $outcomeType) {
        foreach ($normalizedLinks[$payloadKey] as $code) {
            $insertStmt->execute([
                ':project_id' => $projectId,
                ':outcome_type' => $outcomeType,
                ':outcome_code' => $code
            ]);
        }
    }

    $mappingJsonString = json_encode($normalizedLinks, JSON_UNESCAPED_UNICODE);
    $updateStmt = $db->prepare("UPDATE project SET mapping_json = :mapping_json WHERE project_id = :project_id");
    $updateStmt->execute([
        ':mapping_json' => $mappingJsonString,
        ':project_id' => $projectId
    ]);

    $db->commit();

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>