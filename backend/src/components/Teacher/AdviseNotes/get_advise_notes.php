<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

$advisor_user_id = $_SESSION['user_id'];

try {
    $db = new Connect();

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
            WHERE a.advisor_user_id = :advisor_id
            ORDER BY a.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([':advisor_id' => $advisor_user_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $currentMonth = date('Y-m');
    $stats = [
        "total" => count($notes),
        "thisMonth" => 0,
        "warning" => 0,
        "critical" => 0,
    ];

    foreach ($notes as $note) {
        if (substr($note['date'], 0, 7) === $currentMonth) {
            $stats["thisMonth"]++;
        }
        if ($note['type'] === 'warning') {
            $stats["warning"]++;
        }
        if ($note['type'] === 'critical') {
            $stats["critical"]++;
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "notes" => $notes,
            "stats" => $stats,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
