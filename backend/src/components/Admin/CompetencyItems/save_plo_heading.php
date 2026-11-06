<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/competency_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;
    competencyRequireAdmin($db, $userId);

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Payload JSON ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $ploId = (int)($input['plo_id'] ?? 0);
    $name = trim((string)($input['plo_name'] ?? ''));

    if ($ploId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบหัวข้อ PLO ที่ระบุ"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($name === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุข้อความหัวข้อ PLO"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $plo = competencyFetchPlo($db, $ploId);
    if (!$plo) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบหัวข้อ PLO ที่ระบุ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $name = mb_substr($name, 0, 1000);
    $db->prepare("UPDATE curriculum_plo SET name = :name WHERE id = :id")
        ->execute([':name' => $name, ':id' => $ploId]);

    logAudit($db, $userId, 'update', 'curriculum_plo', "แก้ไขหัวข้อ {$plo['plo_code']}: {$name}");

    echo json_encode([
        "status" => "success",
        "message" => "แก้ไขหัวข้อ {$plo['plo_code']} เรียบร้อยแล้ว",
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
