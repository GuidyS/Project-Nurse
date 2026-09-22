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
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['id'])) {
        $portfolio_id = $input['id'];

        $stmt_get = $pdo->prepare("SELECT portfolio_id, title FROM portfolio WHERE portfolio_id = ?");
        $stmt_get->execute([$portfolio_id]);
        $evidence = $stmt_get->fetch(PDO::FETCH_ASSOC);

        if ($evidence) {
            $stmt_update = $pdo->prepare("UPDATE portfolio SET verified = 1 WHERE portfolio_id = :id");
            $stmt_update->execute([
                ':id' => $portfolio_id
            ]);

            // บันทึก Log การอนุมัติ/ตรวจสอบหลักฐาน
            logAudit(
                $pdo, 
                $_SESSION['user_id'] ?? null, 
                'update', 
                'evidence', 
                "ยืนยันตรวจสอบหลักฐาน (ID: {$portfolio_id}, ชื่อ: {$evidence['title']})"
            );

            echo json_encode(["status" => "success", "message" => "ยืนยันการตรวจสอบเรียบร้อย"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลหลักฐาน"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>