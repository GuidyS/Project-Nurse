<?php
require_once __DIR__ . '/research_summary_helpers.php';
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../../middlewares/auth_middleware.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') researchFail(405, 'Method not allowed');
try {
    $db = new Connect();
    $access = researchAccess($db, (int)$_SESSION['user_id']);
    if (!$access['view']) researchFail(403, 'คุณไม่มีสิทธิ์ดูสรุปผลงานวิจัย');
    echo json_encode(['status' => 'success', 'data' => researchSummaryData($db, $access['manage'])], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    researchFail(500, 'ไม่สามารถโหลดข้อมูลงานวิจัยได้ กรุณาลองใหม่');
}
