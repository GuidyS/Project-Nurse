<?php
// ?page=performance — สรุปคะแนนสมรรถนะนักศึกษา (จากคอลัมน์คะแนนในตาราง student)
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();
    $sql = "SELECT student_id,
                   CONCAT(IFNULL(title,''), first_name_th, ' ', last_name_th) AS name,
                   year_level,
                   IFNULL(skill_score,0)     AS skill,
                   IFNULL(attitude_score,0)  AS attitude,
                   IFNULL(knowledge_score,0) AS knowledge,
                   IFNULL(comm_score,0)      AS communication,
                   IFNULL(overall_score,0)   AS overall,
                   last_eval_date
            FROM student
            ORDER BY overall_score DESC, student_id ASC
            LIMIT 100";
    $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
