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

    // 1. ตรวจสอบสิทธิ์ Admin (role_id = 1)
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: คุณไม่มีสิทธิ์จัดการส่วนนี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $itemId = (int)($_GET['id'] ?? 0);
    if ($itemId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสรายการที่ต้องการลบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. ดึงข้อมูลก่อนลบ เพื่อนำ framework_id และ year_level มาจัดเรียงลำดับใหม่
    $itemInfoStmt = $db->prepare("
        SELECT ci.year_level, cp.framework_id 
        FROM competency_items ci
        JOIN curriculum_plo cp ON cp.id = ci.plo_id
        WHERE ci.id = :id
    ");
    $itemInfoStmt->execute([':id' => $itemId]);
    $itemInfo = $itemInfoStmt->fetch(PDO::FETCH_ASSOC);

    if (!$itemInfo) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบรายการที่ต้องการลบในระบบ"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 3. เริ่ม Transaction ลบทั้งผลประเมินที่เกี่ยวข้องและตัวรายการข้อประเมิน
    $db->beginTransaction();

    // ลบคะแนนประเมินที่เคยลงไว้สำหรับข้อนี้
    $delAssessStmt = $db->prepare("DELETE FROM student_competency_assessments WHERE competency_item_id = :id");
    $delAssessStmt->execute([':id' => $itemId]);

    // ลบตัวข้อประเมิน
    $delStmt = $db->prepare("DELETE FROM competency_items WHERE id = :id");
    $delStmt->execute([':id' => $itemId]);

    // 4. Re-index จัดเรียง sequence_no ของข้อที่เหลือทั้งหมดใหม่ 1..N ตามลำดับ PLO
    $reorderStmt = $db->prepare("
        SELECT ci.id 
        FROM competency_items ci
        JOIN curriculum_plo cp ON cp.id = ci.plo_id
        WHERE cp.framework_id = :fid AND ci.year_level = :yl
        ORDER BY COALESCE(cp.sort_order, cp.id) ASC, ci.sequence_no ASC, ci.id ASC
    ");
    $reorderStmt->execute([
        ':fid' => $itemInfo['framework_id'],
        ':yl' => $itemInfo['year_level']
    ]);
    $remainingItems = $reorderStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $updateSeq = $db->prepare("UPDATE competency_items SET sequence_no = :seq WHERE id = :id");
    $seq = 1;
    foreach ($remainingItems as $row) {
        $updateSeq->execute([':seq' => $seq++, ':id' => $row['id']]);
    }

    $db->commit();

    echo json_encode(["status" => "success", "message" => "ลบรายการและผลประเมินที่เกี่ยวข้องเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}