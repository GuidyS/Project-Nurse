<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/competency_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? $_SESSION['user']['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;
    competencyRequireAdmin($db, $userId);

    // ย้ายรายการประเมินชุดเดิมมาเป็น Sub PLO ครั้งแรกที่เปิดหน้านี้ (ทำครั้งเดียว)
    outcomesMigrateCompetencyItems($db);
    // นับรหัสใหม่แยกตามชั้นปี สำหรับข้อมูลที่ออกรหัสด้วยกติกาเดิม (ทำครั้งเดียว)
    outcomesRenumberIfNeeded($db);

    // หลักสูตรยึดตามหน้า "จัดการหลักสูตร" ที่เดียว ไม่ให้เลือกคนละชุดกับหน้าอื่น
    $resolved = competencyResolveCurriculum($db);
    $frameworkId = $resolved['framework_id'];

    if ($frameworkId === null) {
        echo json_encode([
            "status" => "success",
            "mode" => "items",
            "curriculum" => $resolved['curriculum'],
            "framework_id" => null,
            "data" => [],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $yearLevel = isset($_GET['year_level']) ? (int)$_GET['year_level'] : 1;
    if ($yearLevel < 1 || $yearLevel > OUTCOME_MAX_YLO) {
        $yearLevel = 1;
    }

    // 1. PLO ทั้งหมดของหลักสูตร เรียงตามลำดับ
    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo
        WHERE framework_id = :fid
        ORDER BY COALESCE(sort_order, id) ASC, id ASC
    ");
    $ploStmt->execute([':fid' => $frameworkId]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // 2. Sub PLO ของชั้นปีที่เลือก + จำนวนรวมทุกชั้นปี (ใช้กับปุ่มลบทั้งหมด)
    $itemsByPlo = [];
    foreach (outcomesSubPlos($db, $frameworkId, $yearLevel) as $sub) {
        $itemsByPlo[$sub['plo_id']][] = $sub;
    }

    $countStmt = $db->prepare("
        SELECT plo_id, COUNT(*) AS total
        FROM curriculum_sub_plo WHERE framework_id = :fid GROUP BY plo_id
    ");
    $countStmt->execute([':fid' => $frameworkId]);
    $totalByPlo = [];
    foreach ($countStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $totalByPlo[(int)$row['plo_id']] = (int)$row['total'];
    }

    $result = [];
    $seq = 1;
    foreach ($plos as $plo) {
        $ploId = (int)$plo['plo_id'];
        $items = [];
        foreach ($itemsByPlo[$ploId] ?? [] as $sub) {
            $items[] = [
                'id' => $sub['id'],
                'plo_id' => $ploId,
                'year_level' => $sub['year_level'],
                'sequence_no' => $seq++,
                'sub_plo_code' => $sub['code'],
                'competency_name' => $sub['description'],
                'is_scorable' => $sub['is_scorable'],
            ];
        }
        $plo['plo_id'] = $ploId;
        $plo['items'] = $items;
        $plo['total_all_years'] = $totalByPlo[$ploId] ?? 0;
        $result[] = $plo;
    }

    echo json_encode([
        "status" => "success",
        "mode" => "items",
        "year_level" => $yearLevel,
        "curriculum" => $resolved['curriculum'],
        "framework_id" => $frameworkId,
        "data" => $result,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
