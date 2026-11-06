<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 
require_once __DIR__ . '/../../../config/audit_helper.php'; 

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;
$item_id = $_GET['id'] ?? null;

if (!$student_id || !$item_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $db = new Connect();
    
    // 1. ตรวจสอบว่าผลงานมีอยู่จริงและเป็นของนักศึกษาคนนี้หรือไม่
    $stmt = $db->prepare("SELECT title, file_path FROM portfolio WHERE portfolio_id = :id AND student_id = :sid");
    $stmt->execute([':id' => $item_id, ':sid' => $student_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบผลงานนี้ หรือคุณไม่มีสิทธิ์ลบ"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 2. ลบไฟล์จริงบนเซิร์ฟเวอร์
    if (!empty($item['file_path'])) {
        $fullPath = '/var/www/html/' . $item['file_path'];
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    // 3. ลบแถวข้อมูลออกจากฐานข้อมูล
    $delStmt = $db->prepare("DELETE FROM portfolio WHERE portfolio_id = :id AND student_id = :sid");
    $delStmt->execute([':id' => $item_id, ':sid' => $student_id]);

    // 4. บันทึก Audit Log เฉพาะเมื่อมีรายการถูกลบจริง
    $itemTitle = !empty($item['title']) ? ": " . $item['title'] : "";
    logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'portfolio', "ลบผลงาน (ID: {$item_id}){$itemTitle}");

    echo json_encode(["status" => "success", "message" => "ลบผลงานสำเร็จ"], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}