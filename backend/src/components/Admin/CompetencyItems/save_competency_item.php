<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

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

// ฟังก์ชันจัดเรียงลำดับใหม่ 1..N ทั้งชั้นปี เรียงตามลำดับ PLO
function reindexCompetencyItems(PDO $db, int $frameworkId, int $yearLevel) {
    $stmt = $db->prepare("
        SELECT ci.id 
        FROM competency_items ci
        JOIN curriculum_plo cp ON cp.id = ci.plo_id
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY COALESCE(cp.sort_order, cp.id) ASC, ci.sequence_no ASC, ci.id ASC
    ");
    $stmt->execute([':fid' => $frameworkId, ':yl' => $yearLevel]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $updateStmt = $db->prepare("UPDATE competency_items SET sequence_no = :seq WHERE id = :id");
    $seq = 1;
    foreach ($items as $row) {
        $updateStmt->execute([':seq' => $seq++, ':id' => $row['id']]);
    }
}

try {
    $db = new Connect;

    // ตรวจสอบสิทธิ์ Admin
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: คุณไม่มีสิทธิ์จัดการส่วนนี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Payload JSON ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id = !empty($input['id']) ? (int)$input['id'] : null;
    $ploId = (int)($input['plo_id'] ?? 0);
    $yearLevel = (int)($input['year_level'] ?? 0);
    $competencyName = trim((string)($input['competency_name'] ?? ''));
    $isScorable = !empty($input['is_scorable']) ? 1 : 0;

    if ($ploId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาเลือกหมวด PLO ที่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ตรวจสอบว่า PLO มีอยู่จริง
    $checkPlo = $db->prepare("SELECT framework_id FROM curriculum_plo WHERE id = :pid");
    $checkPlo->execute([':pid' => $ploId]);
    $ploData = $checkPlo->fetch(PDO::FETCH_ASSOC);
    if (!$ploData) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบหัวข้อ PLO ที่ระบุ"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $frameworkId = (int)$ploData['framework_id'];

    if ($yearLevel < 1 || $yearLevel > 8 || $competencyName === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุข้อความรายการประเมิน"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $competencyName = mb_substr($competencyName, 0, 1000);

    if ($id) {
        // แก้ไขรายการเดิม
        $updateStmt = $db->prepare("
            UPDATE competency_items
            SET plo_id = :plo_id, year_level = :year_level, 
                competency_name = :name, is_scorable = :scorable
            WHERE id = :id
        ");
        $updateStmt->execute([
            ':plo_id' => $ploId,
            ':year_level' => $yearLevel,
            ':name' => $competencyName,
            ':scorable' => $isScorable,
            ':id' => $id,
        ]);
    } else {
        // เพิ่มรายการใหม่: หาตำแหน่งลำดับข้อสุดท้ายของ PLO นี้เพื่อแทรกลงไป
        $posStmt = $db->prepare("
            SELECT COALESCE(MAX(sequence_no), 0) 
            FROM competency_items 
            WHERE plo_id = :pid AND year_level = :yl
        ");
        $posStmt->execute([':pid' => $ploId, ':yl' => $yearLevel]);
        $targetSeq = (int)$posStmt->fetchColumn() + 1;

        $insertStmt = $db->prepare("
            INSERT INTO competency_items (plo_id, year_level, sequence_no, competency_name, is_scorable)
            VALUES (:plo_id, :year_level, :seq, :name, :scorable)
        ");
        $insertStmt->execute([
            ':plo_id' => $ploId,
            ':year_level' => $yearLevel,
            ':seq' => $targetSeq,
            ':name' => $competencyName,
            ':scorable' => $isScorable,
        ]);
    }

    // จัดเรียง Sequence Number 1..N ใหม่ทันที
    reindexCompetencyItems($db, $frameworkId, $yearLevel);

    echo json_encode([
        "status" => "success", 
        "message" => $id ? "แก้ไขรายการเรียบร้อยแล้ว" : "เพิ่มรายการเรียบร้อยแล้ว"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}