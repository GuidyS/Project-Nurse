<?php
if (session_status() === PHP_SESSION_NONE) session_start();

// 💡 แก้ไข: ทำระบบค้นหาไฟล์ config อัตโนมัติ
$possible_paths = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/../config/config.php',
    __DIR__ . '/../../config/config.php'
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

    $mapping_json_string = json_encode($links, JSON_UNESCAPED_UNICODE);

    $sql = "UPDATE project SET mapping_json = :mapping_json WHERE project_id = :project_id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':mapping_json' => $mapping_json_string,
        ':project_id' => $projectId
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>