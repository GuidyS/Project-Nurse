<?php
if (session_status() === PHP_SESSION_NONE) session_start();

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
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
require_once __DIR__ . '/project_outcome_link_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

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
    $db = project_db();
    $auth = project_require_auth($db, ['PROJECT_VIEW']);
    project_require_admin_write($auth);
    
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input) || !isset($input['project_id']) || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $projectId = project_validate_code($input['project_id']);
    $links = $input['links'];
    if (!is_array($links)) {
        throw new InvalidArgumentException('ข้อมูลการเชื่อมโยงไม่ถูกต้อง');
    }

    $projectStmt = $db->prepare("SELECT project_type FROM project WHERE project_id = :project_id LIMIT 1");
    $projectStmt->execute([':project_id' => $projectId]);
    $projectType = $projectStmt->fetchColumn();
    if ($projectType === false) {
        http_response_code(404);
        throw new Exception("ไม่พบโครงการ");
    }
    if ($projectType !== 'academic_service') {
        http_response_code(422);
        throw new Exception("เชื่อม PLO/CLO ได้เฉพาะโครงการบริการวิชาการ");
    }

    $normalizedLinks = [
        'plos' => project_outcome_normalize_codes($links['plos'] ?? [], 'PLO '),
        'clos' => project_outcome_normalize_codes($links['clos'] ?? [], 'CLO '),
    ];

    $db->beginTransaction();
    $projectId = project_u_guard($db, $projectId)['project_id'];
    project_u_require_root($db, $projectId);

    project_outcome_replace_links($db, $projectId, [
        'plo' => $normalizedLinks['plos'],
        'clo' => $normalizedLinks['clos'],
    ]);

    $db->commit();

    logAudit($db, $_SESSION['user_id'], 'update', 'project_links', "บันทึกการเชื่อมโยง CLO/PLO ของโครงการ ID: {$projectId}");

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if (http_response_code() < 400) {
        http_response_code(project_error_status($e));
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
