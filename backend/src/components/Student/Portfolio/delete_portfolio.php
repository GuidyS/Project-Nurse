<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php'; 

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;
$item_id = $_GET['id'] ?? null;

if (!$student_id || !$item_id) {
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit();
}

try {
    $db = new Connect();
    
    // ดึงที่อยู่ไฟล์เพื่อลบออกจาก Server ก่อน
    $stmt = $db->prepare("SELECT file_path FROM portfolio WHERE portfolio_id = :id AND student_id = :sid");
    $stmt->execute([':id' => $item_id, ':sid' => $student_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item && !empty($item['file_path'])) {
        $fullPath = '/var/www/html/' . $item['file_path'];
        if (file_exists($fullPath)) {
            unlink($fullPath); // ลบไฟล์จริงทิ้ง
        }
    }

    // ลบข้อมูลออกจากฐานข้อมูล
    $delStmt = $db->prepare("DELETE FROM portfolio WHERE portfolio_id = :id AND student_id = :sid");
    $delStmt->execute([':id' => $item_id, ':sid' => $student_id]);

    echo json_encode(["status" => "success", "message" => "ลบผลงานสำเร็จ"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>