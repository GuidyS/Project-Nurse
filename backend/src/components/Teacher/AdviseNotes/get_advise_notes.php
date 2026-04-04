<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
$userData = requireLogin(); // รับข้อมูล User ที่ล็อกอินอยู่มาใช้งาน
$advisor_user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงประวัติการให้คำปรึกษา โดย JOIN กับตารางนักศึกษาเพื่อเอาชื่อมาโชว์
    // ดึงเฉพาะของอาจารย์คนที่ล็อกอินอยู่ (WHERE a.advisor_user_id = ?)
    $sql = "SELECT 
                a.advice_id as id, 
                s.student_code as studentId, 
                CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
                DATE_FORMAT(a.created_at, '%Y-%m-%d') as date,
                a.topic, 
                a.log_type as type, 
                a.advice_note as summary
            FROM advice_log a
            JOIN student s ON a.student_id = s.student_id
            WHERE a.advisor_user_id = ?
            ORDER BY a.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$advisor_user_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. คำนวณ Stats สำหรับ Card 4 ใบด้านบน
    $currentMonth = date('Y-m');
    $stats = [
        "total" => count($notes),
        "thisMonth" => 0,
        "warning" => 0,
        "critical" => 0
    ];

    foreach ($notes as $note) {
        // เช็คว่าเป็นของเดือนนี้ไหม
        if (substr($note['date'], 0, 7) === $currentMonth) {
            $stats["thisMonth"]++;
        }
        // นับจำนวนเตือนและวิกฤต
        if ($note['type'] === 'warning') $stats["warning"]++;
        if ($note['type'] === 'critical') $stats["critical"]++;
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "notes" => $notes,
            "stats" => $stats
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>