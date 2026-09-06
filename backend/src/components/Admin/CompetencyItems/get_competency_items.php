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

try {
    $db = new Connect;

    // ตรวจสอบสิทธิ์ Admin
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($_GET['framework_id'])) {
        $stmt2 = $db->prepare("SELECT id, curriculum_year, program_name, is_active FROM curriculum_framework ORDER BY is_active DESC, curriculum_year DESC");
        $stmt2->execute();
        $frameworks = $stmt2->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode(["status" => "success", "mode" => "frameworks", "data" => $frameworks], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $frameworkId = (int)$_GET['framework_id'];
    $yearLevel = isset($_GET['year_level']) ? (int)$_GET['year_level'] : 1;

    // 1. ดึง PLO ทั้งหมดของหลักสูตร เรียงตามลำดับ PLO
    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo
        WHERE framework_id = :fid
        ORDER BY COALESCE(sort_order, id) ASC, id ASC
    ");
    $ploStmt->execute([':fid' => $frameworkId]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // 2. ดึงข้อประเมินทั้งหมดในหลักสูตรและชั้นปีนั้น
    $itemStmt = $db->prepare("
        SELECT ci.id, ci.plo_id, ci.year_level, ci.sequence_no, ci.competency_name, ci.is_scorable
        FROM competency_items ci
        INNER JOIN curriculum_plo cp ON cp.id = ci.plo_id
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY COALESCE(cp.sort_order, cp.id) ASC, ci.sequence_no ASC, ci.id ASC
    ");
    $itemStmt->execute([':fid' => $frameworkId, ':yl' => $yearLevel]);
    $allItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Auto Fix: ซ่อมแซมลำดับข้อใน Database ให้เรียง 1..N ต่อเนื่องอัตโนมัติหากพบเลขกระโดด
    $updateSeq = $db->prepare("UPDATE competency_items SET sequence_no = :seq WHERE id = :id");
    $currentRunningSeq = 1;
    $itemsByPlo = [];

    foreach ($allItems as $item) {
        if ((int)$item['sequence_no'] !== $currentRunningSeq) {
            $updateSeq->execute([':seq' => $currentRunningSeq, ':id' => $item['id']]);
            $item['sequence_no'] = $currentRunningSeq;
        }
        $itemsByPlo[(int)$item['plo_id']][] = $item;
        $currentRunningSeq++;
    }

    // รวม items เข้ากลุ่ม PLO
    $result = array_map(function ($plo) use ($itemsByPlo) {
        $plo['items'] = $itemsByPlo[(int)$plo['plo_id']] ?? [];
        return $plo;
    }, $plos);

    echo json_encode(["status" => "success", "mode" => "items", "data" => $result], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}