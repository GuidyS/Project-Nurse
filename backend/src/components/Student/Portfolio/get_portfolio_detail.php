<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// อ้างอิงพาร์ทรากหลักของเซิร์ฟเวอร์ Docker อย่างปลอดภัย ป้องกันปัญหาหาไฟล์ไม่เจอ
require_once __DIR__ . '/../../../config/config.php'; 

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// 🔐 ดึงรหัสนักศึกษาจาก Session เพื่อความปลอดภัย ป้องกันการแอบดูข้ามไอดีกัน
$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;
$item_id = $_GET['id'] ?? null;

if (!$student_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: กรุณาเข้าสู่ระบบใหม่อีกครั้ง"]);
    exit();
}

if (!$item_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Bad Request: ไม่พบรหัสผลงานที่ต้องการตรวจสอบ"]);
    exit();
}

try {
    $db = new Connect();
    
    // คิวรีดึงข้อมูลเฉพาะชิ้น โดยดักเงื่อนไข student_id ควบคู่ไปด้วยเสมอเพื่อความปลอดภัยสูงสุด
    $sql = "SELECT 
                portfolio_id AS id, 
                title, 
                type, 
                description, 
                file_name as fileName, 
                file_path as filePath,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as date 
            FROM portfolio 
            WHERE portfolio_id = :id AND student_id = :student_id 
            LIMIT 1";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id' => $item_id,
        ':student_id' => $student_id
    ]);
    
    $portfolio_detail = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($portfolio_detail) {
        // เสริม URL สัมบูรณ์ (Absolute URL) ให้กับไฟล์แนบ เพื่อให้หน้าบ้านสามารถส่งเปิดดูไฟล์ (Preview) ได้ทันที
        if (!empty($portfolio_detail['filePath'])) {
            $portfolio_detail['fileUrl'] = "http://localhost:8080/" . $portfolio_detail['filePath']; 
        } else {
            $portfolio_detail['fileUrl'] = null;
        }

        echo json_encode([
            "status" => "success",
            "data" => $portfolio_detail
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลผลงานชิ้นนี้ในระบบ หรือคุณไม่มีสิทธิ์เข้าถึง"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ข้อผิดพลาดระบบฐานข้อมูล: " . $e->getMessage()]);
}
?>