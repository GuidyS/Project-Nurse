<?php
require_once __DIR__ . '/../../../config/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$advisor_user_id = $_SESSION['user_id'] ?? null;
if (!$advisor_user_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$pdo = new Connect();

try {
    $stmt_user = $pdo->prepare("SELECT role_id, username FROM users WHERE user_id = ? LIMIT 1");
    $stmt_user->execute([$advisor_user_id]);
    $user_data = $stmt_user->fetch(PDO::FETCH_ASSOC);
    $my_faculty_id = $user_data['username'] ?? '';
    $role_id = (int)($user_data['role_id'] ?? 0);
    if (!$my_faculty_id) $my_faculty_id = $advisor_user_id;

    $sql = "SELECT 
                a.advice_id as id, 
                s.student_id as studentId, 
                CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
                DATE_FORMAT(NOW(), '%Y-%m-%d') as date,
                'ไม่ระบุ' as topic, 
                'normal' as type, 
                a.advice_note as summary
            FROM advice_log a
            JOIN student s ON a.student_id = s.student_id";

    $sql .= " WHERE a.advisor_id = ? ORDER BY a.advice_id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$my_faculty_id]);
    
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Parse topic from summary string and calculate stats
    $currentMonth = date('Y-m');
    $stats = [
        "total" => count($notes),
        "thisMonth" => 0
    ];

    foreach ($notes as &$note) {
        // ดึงหัวข้อจากข้อความ summary
        if (preg_match('/หัวข้อ: (.*)\r?\n/', $note['summary'], $matchesTopic)) {
            $note['topic'] = trim($matchesTopic[1]);
        } else {
            $note['topic'] = 'ไม่ระบุ';
        }

        // เช็คว่าเป็นของเดือนนี้ไหม
        if (substr($note['date'], 0, 7) === $currentMonth) {
            $stats["thisMonth"]++;
        }
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