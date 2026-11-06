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

/**
 * ลบ Sub PLO ตาม id ที่กำหนด พร้อมเก็บกวาดคะแนนที่ผูกไว้
 * curriculum_clo_sub_plo มี FK แบบ CASCADE อยู่แล้ว เหลือแค่คะแนนนักศึกษาที่อ้างด้วยรหัสข้อความ
 */
function competencyDeleteSubPlos(PDO $db, array $ids): int
{
    if (empty($ids)) {
        return 0;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // ลบคะแนนเฉพาะของ CLO ที่ผูกกับ Sub PLO เหล่านี้จริง ๆ
    // (รหัสอย่าง "1.1" ซ้ำกันได้ระหว่างชั้นปี จึงลบด้วยรหัสอย่างเดียวไม่ได้)
    if (outcomesTableExists($db, 'student_clo_sub_scores')) {
        $db->prepare("
            DELETE sc FROM student_clo_sub_scores sc
            INNER JOIN curriculum_clo_sub_plo cs ON cs.clo_id = sc.clo_id
            INNER JOIN curriculum_sub_plo s ON s.id = cs.sub_plo_id
            WHERE cs.sub_plo_id IN ($placeholders)
              AND sc.sub_plo_code COLLATE utf8mb4_general_ci = s.code COLLATE utf8mb4_general_ci
        ")->execute($ids);
    }

    $del = $db->prepare("DELETE FROM curriculum_sub_plo WHERE id IN ($placeholders)");
    $del->execute($ids);
    return $del->rowCount();
}

try {
    $db = new Connect;
    competencyRequireAdmin($db, $userId);
    outcomesEnsureSchema($db);

    $scope = (string)($_GET['scope'] ?? 'item'); // item | plo | all
    $frameworkId = isset($_GET['framework_id']) ? (int)$_GET['framework_id'] : 0;
    $ploId = isset($_GET['plo_id']) ? (int)$_GET['plo_id'] : 0;
    $itemId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    // ชั้นปี (YLO) ที่กำลังเปิดอยู่ — ลบเฉพาะชั้นปีนี้ ไม่ไปแตะชั้นปีอื่น
    $yearLevel = isset($_GET['year_level']) ? (int)$_GET['year_level'] : 0;

    // ลบทั้งหมดของ PLO เดียว หรือทุก PLO — เฉพาะชั้นปีที่ระบุ
    if ($scope === 'plo' || $scope === 'all') {
        if ($frameworkId <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบหลักสูตรที่ระบุ"], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if ($yearLevel < 1 || $yearLevel > OUTCOME_MAX_YLO) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบชั้นปี (YLO) ที่ต้องการลบ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $params = [':fid' => $frameworkId, ':yl' => $yearLevel];
        $sql = "SELECT id FROM curriculum_sub_plo WHERE framework_id = :fid AND year_level = :yl";

        if ($scope === 'plo') {
            if ($ploId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ไม่พบหัวข้อ PLO ที่ระบุ"], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $sql .= " AND plo_id = :pid";
            $params[':pid'] = $ploId;
        }

        $idStmt = $db->prepare($sql);
        $idStmt->execute($params);

        $ids = array_map('intval', $idStmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
        if (empty($ids)) {
            echo json_encode(["status" => "success", "deleted" => 0, "message" => "ไม่มีรายการให้ลบ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $db->beginTransaction();
        $deleted = competencyDeleteSubPlos($db, $ids);
        $db->commit();

        $label = $scope === 'plo' ? "PLO (plo_id {$ploId})" : "ทุก PLO ของหลักสูตร";
        logAudit(
            $db,
            $userId,
            'delete',
            'curriculum_sub_plo',
            "ลบ Sub PLO ทั้งหมดใน {$label} ชั้นปีที่ {$yearLevel} จำนวน {$deleted} รายการ"
        );

        echo json_encode([
            "status" => "success",
            "deleted" => $deleted,
            "message" => "ลบรายการเรียบร้อยแล้ว {$deleted} รายการ",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ลบรายการเดียว
    if ($itemId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบรหัสรายการที่ต้องการลบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $infoStmt = $db->prepare("
        SELECT s.code, s.description, s.year_level, s.framework_id, s.plo_id, p.plo_code
        FROM curriculum_sub_plo s
        INNER JOIN curriculum_plo p ON p.id = s.plo_id
        WHERE s.id = :id LIMIT 1
    ");
    $infoStmt->execute([':id' => $itemId]);
    $info = $infoStmt->fetch(PDO::FETCH_ASSOC);

    if (!$info) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบรายการที่ต้องการลบในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();
    competencyDeleteSubPlos($db, [$itemId]);
    competencyResequenceSubCodes($db, (int)$info['framework_id'], (int)$info['plo_id'], (int)$info['year_level']);
    $db->commit();

    logAudit(
        $db,
        $userId,
        'delete',
        'curriculum_sub_plo',
        "ลบ Sub PLO {$info['code']}: {$info['description']} (ชั้นปีที่ {$info['year_level']}, {$info['plo_code']})"
    );

    echo json_encode([
        "status" => "success",
        "deleted" => 1,
        "message" => "ลบรายการเรียบร้อยแล้ว",
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
