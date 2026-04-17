<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin();

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงข้อมูลนักศึกษาพร้อมคะแนนประเมิน "ล่าสุด" ของแต่ละคน
    $sql = "
        SELECT 
            s.student_id as id,
            s.student_code as studentId,
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            sp.scores_json,
            sp.overall_score,
            DATE_FORMAT(sp.created_at, '%Y-%m-%d') as lastEval
        FROM student s
        LEFT JOIN student_performance sp ON s.student_id = sp.student_id 
            AND sp.eval_id = (
                SELECT MAX(eval_id) FROM student_performance WHERE student_id = s.student_id
            )
        WHERE s.status = 'Studying'
        ORDER BY s.student_code ASC
    ";
    
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $performances = [];
    $avg_sums = ['skill' => 0, 'attitude' => 0, 'knowledge' => 0, 'communication' => 0];
    $eval_count = 0;

    foreach ($rows as $row) {
        $scores = $row['scores_json'] ? json_decode($row['scores_json'], true) : null;
        
        $skill = $scores['skill'] ?? 0;
        $attitude = $scores['attitude'] ?? 0;
        $knowledge = $scores['knowledge'] ?? 0;
        $communication = $scores['communication'] ?? 0;
        $overall = $row['overall_score'] ?? 0;

        $performances[] = [
            "id" => $row['id'],
            "studentId" => $row['studentId'],
            "name" => $row['name'],
            "skill" => (float)$skill,
            "attitude" => (float)$attitude,
            "knowledge" => (float)$knowledge,
            "communication" => (float)$communication,
            "overall" => (float)$overall,
            "lastEval" => $row['lastEval'] ?? '-'
        ];

        // เก็บผลรวมไว้หาค่าเฉลี่ยคณะ (นับเฉพาะคนที่มีการประเมินแล้ว)
        if ($overall > 0) {
            $avg_sums['skill'] += $skill;
            $avg_sums['attitude'] += $attitude;
            $avg_sums['knowledge'] += $knowledge;
            $avg_sums['communication'] += $communication;
            $eval_count++;
        }
    }

    // 2. เตรียมข้อมูลสำหรับ Radar Chart (ค่าเฉลี่ยของคณะ)
    $faculty_average = [
        "skill" => $eval_count > 0 ? round($avg_sums['skill'] / $eval_count, 1) : 0,
        "attitude" => $eval_count > 0 ? round($avg_sums['attitude'] / $eval_count, 1) : 0,
        "knowledge" => $eval_count > 0 ? round($avg_sums['knowledge'] / $eval_count, 1) : 0,
        "communication" => $eval_count > 0 ? round($avg_sums['communication'] / $eval_count, 1) : 0,
    ];

    echo json_encode([
        "status" => "success", 
        "data" => [
            "performances" => $performances,
            "faculty_average" => $faculty_average
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>