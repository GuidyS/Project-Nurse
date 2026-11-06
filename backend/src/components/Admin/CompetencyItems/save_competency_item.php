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
    outcomesEnsureSchema($db);

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

    $ploData = competencyFetchPlo($db, $ploId);
    if (!$ploData) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบหัวข้อ PLO ที่ระบุ"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $frameworkId = (int)$ploData['framework_id'];
    $ploCode = (string)($ploData['plo_code'] ?? '');

    if ($yearLevel < 1 || $yearLevel > OUTCOME_MAX_YLO || $competencyName === '') {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "กรุณาระบุข้อความรายการประเมิน และเลือกชั้นปีที่ 1-" . OUTCOME_MAX_YLO,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $competencyName = mb_substr($competencyName, 0, 1000);

    if ($id) {
        $check = $db->prepare("SELECT id, code FROM curriculum_sub_plo WHERE id = :id AND framework_id = :fid LIMIT 1");
        $check->execute([':id' => $id, ':fid' => $frameworkId]);
        $existing = $check->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบรายการที่ต้องการแก้ไข"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $db->prepare("
            UPDATE curriculum_sub_plo
            SET plo_id = :plo, description = :desc, year_level = :year, is_scorable = :scorable
            WHERE id = :id
        ")->execute([
            ':plo' => $ploId,
            ':desc' => $competencyName,
            ':year' => $yearLevel,
            ':scorable' => $isScorable,
            ':id' => $id,
        ]);

        // ย้ายข้าม PLO หรือข้ามชั้นปี ต้องออกรหัสใหม่ให้ตรงกับกลุ่มปลายทาง
        competencyResequenceSubCodes($db, $frameworkId, $ploId, $yearLevel);

        logAudit($db, $userId, 'update', 'curriculum_sub_plo', "แก้ไข Sub PLO: {$competencyName} (ID: {$id}, ชั้นปีที่ {$yearLevel}, {$ploCode})");
        $savedCode = $existing['code'];
    } else {
        $code = outcomesNextSubCode($db, $frameworkId, $ploId, $ploCode, $yearLevel);

        $sortStmt = $db->prepare("
            SELECT COALESCE(MAX(sort_order), 0) + 1 FROM curriculum_sub_plo
            WHERE framework_id = :fid AND plo_id = :pid AND year_level = :yl
        ");
        $sortStmt->execute([':fid' => $frameworkId, ':pid' => $ploId, ':yl' => $yearLevel]);

        $db->prepare("
            INSERT INTO curriculum_sub_plo (framework_id, plo_id, code, description, year_level, is_scorable, sort_order)
            VALUES (:fid, :plo, :code, :desc, :year, :scorable, :sort)
        ")->execute([
            ':fid' => $frameworkId,
            ':plo' => $ploId,
            ':code' => $code,
            ':desc' => $competencyName,
            ':year' => $yearLevel,
            ':scorable' => $isScorable,
            ':sort' => (int)$sortStmt->fetchColumn(),
        ]);

        $newId = (int)$db->lastInsertId();
        logAudit($db, $userId, 'create', 'curriculum_sub_plo', "เพิ่ม Sub PLO {$code}: {$competencyName} (ID: {$newId}, ชั้นปีที่ {$yearLevel}, {$ploCode})");
        $savedCode = $code;
    }

    echo json_encode([
        "status" => "success",
        "sub_plo_code" => $savedCode,
        "message" => $id ? "แก้ไขรายการเรียบร้อยแล้ว" : "เพิ่มรายการเรียบร้อยแล้ว",
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
