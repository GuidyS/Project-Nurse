<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "รูปแบบข้อมูลไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id = !empty($input['id']) ? (int)$input['id'] : null;
    $rawPloId = (int)($input['plo_id'] ?? 0);
    $ploId = ($rawPloId > 0) ? $rawPloId : null; // ถ้าเป็น 0 แปลงเป็น NULL ทันที
    $yearLevel = (int)($input['year_level'] ?? 0);
    $sequenceNo = (int)($input['sequence_no'] ?? 0);
    $competencyName = trim((string)($input['competency_name'] ?? ''));
    $isScorable = !empty($input['is_scorable']) ? 1 : 0;

    if ($yearLevel <= 0 || $sequenceNo <= 0 || $competencyName === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน (ชั้นปี, ลำดับ, รายการประเมิน)"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $competencyName = mb_substr($competencyName, 0, 1000);

    if ($id) {
        $stmt = $db->prepare("
            UPDATE competency_items
            SET plo_id = :plo_id, year_level = :year_level, sequence_no = :seq, 
                competency_name = :name, is_scorable = :scorable
            WHERE id = :id
        ");
        $stmt->execute([
            ':plo_id' => $ploId, ':year_level' => $yearLevel, ':seq' => $sequenceNo,
            ':name' => $competencyName, ':scorable' => $isScorable, ':id' => $id,
        ]);
        echo json_encode(["status" => "success", "message" => "แก้ไขรายการเรียบร้อยแล้ว", "id" => $id], JSON_UNESCAPED_UNICODE);
    } else {
        $stmt = $db->prepare("
            INSERT INTO competency_items (plo_id, year_level, sequence_no, competency_name, is_scorable)
            VALUES (:plo_id, :year_level, :seq, :name, :scorable)
        ");
        $stmt->execute([
            ':plo_id' => $ploId, ':year_level' => $yearLevel, ':seq' => $sequenceNo,
            ':name' => $competencyName, ':scorable' => $isScorable,
        ]);
        echo json_encode(["status" => "success", "message" => "เพิ่มรายการเรียบร้อยแล้ว", "id" => (int)$db->lastInsertId()], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}