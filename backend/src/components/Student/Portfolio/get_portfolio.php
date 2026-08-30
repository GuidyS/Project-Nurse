<?php
ob_start();

// ตั้งค่า CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ค้นหา config.php อัตโนมัติ
$configPaths = [
    __DIR__ . '/../../../../config/config.php',
    __DIR__ . '/../../../config/config.php',
    __DIR__ . '/../../config/config.php',
    dirname(__DIR__, 3) . '/config/config.php',
    dirname(__DIR__, 4) . '/config/config.php'
];

foreach ($configPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

ob_end_clean();

// ดึงรหัสนักศึกษาจาก Session หรือ Default ID สำหรับทดสอบ
$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? $_SESSION['user']['username'] ?? '6603400001';

if (!$student_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $db = new Connect();
    
    // ดึงรายการผลงานทั้งหมดของนักศึกษา เรียงตามลำดับล่าสุด
    $sql = "SELECT 
                portfolio_id AS id, 
                title, 
                type, 
                description, 
                DATE_FORMAT(created_at, '%Y-%m-%d') AS date, 
                file_name 
            FROM portfolio 
            WHERE student_id = :student_id 
            ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':student_id' => $student_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data"   => $items ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error", 
        "message" => "Database error: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>