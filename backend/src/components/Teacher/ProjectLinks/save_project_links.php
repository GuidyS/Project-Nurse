<?php
if (session_status() === PHP_SESSION_NONE) session_start();

// 💡 แก้ไข: ทำระบบค้นหาไฟล์ config อัตโนมัติ
$possible_paths = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/../config/config.php',
    __DIR__ . '/../../../config/config.php',
    __DIR__ . '/../../../../config/config.php'
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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    $db = new Connect();
    
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input) || !isset($input['project_id']) || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $projectId = (int)$input['project_id'];
    $links = $input['links'];

    $projectStmt = $db->prepare("SELECT project_type FROM project WHERE project_id = :project_id LIMIT 1");
    $projectStmt->execute([':project_id' => $projectId]);
    $projectType = $projectStmt->fetchColumn();
    if ($projectType === false) {
        http_response_code(404);
        throw new Exception("ไม่พบโครงการ");
    }
    if ($projectType !== 'academic_service') {
        http_response_code(422);
        throw new Exception("เชื่อม CLO/PLO/YLO ได้เฉพาะโครงการบริการวิชาการ");
    }

    $normalizedLinks = [
        'plos' => array_values(array_unique(array_filter($links['plos'] ?? [], 'is_string'))),
        'ylos' => array_values(array_unique(array_filter($links['ylos'] ?? [], 'is_string'))),
        'clos' => array_values(array_unique(array_filter($links['clos'] ?? [], 'is_string'))),
    ];

    $desiredLinks = [];
    foreach (['plos' => 'plo', 'ylos' => 'ylo', 'clos' => 'clo'] as $payloadKey => $outcomeType) {
        foreach ($normalizedLinks[$payloadKey] as $code) {
            $desiredLinks[$outcomeType . "\0" . $code] = true;
        }
    }

    $db->beginTransaction();

    $existingStmt = $db->prepare("
        SELECT id, outcome_type, outcome_code
        FROM project_outcome_links
        WHERE project_id = :project_id
    ");
    $existingStmt->execute([':project_id' => $projectId]);
    $existingLinks = $existingStmt->fetchAll(PDO::FETCH_ASSOC);

    $deleteResultsStmt = $db->prepare("
        DELETE FROM student_project_outcome_results
        WHERE project_id = :project_id AND project_outcome_link_id = :link_id
    ");
    $deleteLinkStmt = $db->prepare("DELETE FROM project_outcome_links WHERE id = :link_id");
    foreach ($existingLinks as $existingLink) {
        $key = $existingLink['outcome_type'] . "\0" . $existingLink['outcome_code'];
        if (isset($desiredLinks[$key])) {
            unset($desiredLinks[$key]);
            continue;
        }

        $deleteResultsStmt->execute([
            ':project_id' => $projectId,
            ':link_id' => $existingLink['id'],
        ]);
        $deleteLinkStmt->execute([':link_id' => $existingLink['id']]);
    }

    $insertStmt = $db->prepare("
        INSERT INTO project_outcome_links (project_id, outcome_type, outcome_code)
        VALUES (:project_id, :outcome_type, :outcome_code)
    ");

    foreach ($desiredLinks as $key => $_unused) {
        [$outcomeType, $code] = explode("\0", $key, 2);
        $insertStmt->execute([
            ':project_id' => $projectId,
            ':outcome_type' => $outcomeType,
            ':outcome_code' => $code
        ]);
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
    if (http_response_code() < 400) {
        http_response_code(500);
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
