<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

// Fallback to 1 if no session for testing
$advisor_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// Get faculty_id (username in users table)
$stmt_fac = $pdo->prepare("SELECT username FROM users WHERE user_id = ?");
$stmt_fac->execute([$advisor_user_id]);
$fac_row = $stmt_fac->fetch(PDO::FETCH_ASSOC);
$faculty_id = $fac_row ? $fac_row['username'] : '41172008';


try {
    $sql = "SELECT 
                a.advice_id as id, 
                s.student_id as studentId, 
                CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
                a.advice_note as raw_note
            FROM advice_log a
            JOIN student s ON a.student_id = s.student_id
            WHERE a.advisor_id = ?
            ORDER BY a.advice_id DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $raw_notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $notes = [];
    $currentMonth = date('Y-m');
    $stats = [
        "total" => count($raw_notes),
        "thisMonth" => 0,
        "warning" => 0,
        "critical" => 0
    ];

    foreach ($raw_notes as $raw) {
        $json_data = json_decode($raw['raw_note'], true);
        
        $note = [
            "id" => (string)$raw['id'],
            "studentId" => (string)$raw['studentId'],
            "studentName" => $raw['studentName'],
        ];

        if ($json_data && is_array($json_data)) {
            $note['topic'] = $json_data['topic'] ?? 'N/A';
            $note['type'] = $json_data['type'] ?? 'academic';
            $note['summary'] = $json_data['summary'] ?? '';
            $note['date'] = $json_data['date'] ?? date('Y-m-d');
        } else {
            // Fallback for old data not in JSON format
            $note['topic'] = 'N/A';
            $note['type'] = 'academic';
            $note['summary'] = $raw['raw_note'];
            $note['date'] = date('Y-m-d');
        }
        
        $notes[] = $note;

        // Stats calculation
        if (substr($note['date'], 0, 7) === $currentMonth) {
            $stats["thisMonth"]++;
        }
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