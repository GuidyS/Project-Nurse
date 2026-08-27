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

    if (empty($_GET['framework_id'])) {
        $stmt2 = $db->prepare("SELECT id, curriculum_year, program_name FROM curriculum_framework ORDER BY curriculum_year DESC");
        $stmt2->execute();
        $frameworks = $stmt2->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode(["status" => "success", "mode" => "frameworks", "data" => $frameworks], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $frameworkId = (int)$_GET['framework_id'];
    $yearLevel = isset($_GET['year_level']) ? (int)$_GET['year_level'] : 1;

    if ($yearLevel < 1 || $yearLevel > 8) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ชั้นปีไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 1. ดึง PLO ทั้งหมดของหลักสูตรนี้
    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo
        WHERE framework_id = :fid
        ORDER BY sort_order ASC, plo_code ASC
    ");
    $ploStmt->execute([':fid' => $frameworkId]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // 2. ดึง Item ทั้งที่มี PLO (ในหลักสูตรนี้) และที่ไม่มี PLO (plo_id IS NULL)
    $itemStmt = $db->prepare("
        SELECT ci.id, ci.plo_id, ci.year_level, ci.sequence_no, ci.competency_name, ci.is_scorable
        FROM competency_items ci
        LEFT JOIN curriculum_plo cp ON cp.id = ci.plo_id
        WHERE (cp.framework_id = :fid OR ci.plo_id IS NULL) 
          AND ci.year_level = :yl
        ORDER BY ci.sequence_no ASC
    ");
    $itemStmt->execute([':fid' => $frameworkId, ':yl' => $yearLevel]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $itemsByPlo = [];
    $unassignedItems = [];

    foreach ($items as $item) {
        if ($item['plo_id'] !== null) {
            $itemsByPlo[$item['plo_id']][] = $item;
        } else {
            $unassignedItems[] = $item;
        }
    }

    $result = array_map(function ($plo) use ($itemsByPlo) {
        $plo['items'] = $itemsByPlo[$plo['plo_id']] ?? [];
        return $plo;
    }, $plos);

    // เพิ่มหมวดรายการทั่วไป (plo_id = null) ไว้เป็นกลุ่มแรกหรือกลุ่มท้าย
    array_unshift($result, [
        "plo_id" => 0,
        "plo_code" => "รายการทั่วไป",
        "plo_name" => "(ข้อประเมินที่ไม่ต้องผูกกับ PLO)",
        "items" => $unassignedItems
    ]);

    echo json_encode(["status" => "success", "mode" => "items", "data" => $result], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}