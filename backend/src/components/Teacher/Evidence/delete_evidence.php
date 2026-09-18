<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = $input['id'] ?? '';

    if (empty($id)) {
        echo json_encode(["status" => "error", "message" => "ไม่พบรหัสหลักฐานที่ต้องการลบ"]);
        exit();
    }

    // Check if it exists and fetch title for log
    $stmt = $pdo->prepare("SELECT portfolio_id, title FROM portfolio WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $pdo->prepare("DELETE FROM portfolio WHERE portfolio_id = ?")->execute([$id]);

        // บันทึก Log การลบหลักฐาน
        logAudit(
            $pdo, 
            $_SESSION['user_id'] ?? null, 
            'delete', 
            'evidence', 
            "ลบหลักฐาน/พอร์ตโฟลิโอ (ID: {$id}, ชื่อ: {$row['title']})"
        );

        echo json_encode(["status" => "success", "message" => "ลบหลักฐานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ไม่พบหลักฐานในระบบ"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>