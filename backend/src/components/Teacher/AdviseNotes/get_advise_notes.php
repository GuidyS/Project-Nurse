<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}
$advisor_user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // ประวัติการให้คำปรึกษาของอาจารย์ที่ล็อกอิน (advisor_id เก็บ users.user_id)
    $sql = "SELECT
                a.advice_id as id,
                IF(s.student_code LIKE 'TEMP-%', s.student_id, s.student_code) as studentId,
                CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as studentName,
                DATE_FORMAT(a.created_at, '%Y-%m-%d') as date,
                a.topic,
                a.log_type as type,
                a.advice_note as summary
            FROM advice_log a
            JOIN student s ON a.student_id = s.student_id
            WHERE a.advisor_id = ?
            ORDER BY a.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$advisor_user_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $currentMonth = date('Y-m');
    $stats = ["total" => count($notes), "thisMonth" => 0, "warning" => 0, "critical" => 0];
    foreach ($notes as $note) {
        if (substr((string)$note['date'], 0, 7) === $currentMonth) $stats["thisMonth"]++;
        if ($note['type'] === 'warning') $stats["warning"]++;
        if ($note['type'] === 'critical') $stats["critical"]++;
    }

    echo json_encode(["status" => "success", "data" => ["notes" => $notes, "stats" => $stats]], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
