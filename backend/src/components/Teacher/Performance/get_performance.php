<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();

    $sql = "SELECT
                a.approval_request_id as id,
                s.student_id as studentId,
                CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
                a.description as score_data,
                DATE_FORMAT(a.created_at, '%Y-%m-%d') as lastEval
            FROM approval_requests a
            JOIN student s ON a.target_ref_id = CAST(s.student_id AS CHAR)
            WHERE a.request_type = 'performance_eval'
            ORDER BY a.created_at DESC";

    $raw_performances = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    $performances = [];
    $sum_skill = 0;
    $sum_attitude = 0;
    $sum_knowledge = 0;
    $sum_comm = 0;
    $count = count($raw_performances);

    foreach ($raw_performances as $row) {
        $scores = json_decode($row['score_data'], true) ?: [];

        $skill = isset($scores['skill']) ? (float)$scores['skill'] : 0;
        $attitude = isset($scores['attitude']) ? (float)$scores['attitude'] : 0;
        $knowledge = isset($scores['knowledge']) ? (float)$scores['knowledge'] : 0;
        $comm = isset($scores['communication']) ? (float)$scores['communication'] : 0;
        $overall = isset($scores['overall']) ? (float)$scores['overall'] : 0;

        $sum_skill += $skill;
        $sum_attitude += $attitude;
        $sum_knowledge += $knowledge;
        $sum_comm += $comm;

        $performances[] = [
            "id" => $row['id'],
            "studentId" => $row['studentId'],
            "name" => $row['name'],
            "skill" => $skill,
            "attitude" => $attitude,
            "knowledge" => $knowledge,
            "communication" => $comm,
            "overall" => $overall,
            "lastEval" => $row['lastEval'],
        ];
    }

    $avg_skill = $count > 0 ? round($sum_skill / $count, 1) : 0;
    $avg_attitude = $count > 0 ? round($sum_attitude / $count, 1) : 0;
    $avg_knowledge = $count > 0 ? round($sum_knowledge / $count, 1) : 0;
    $avg_comm = $count > 0 ? round($sum_comm / $count, 1) : 0;

    $chartData = [
        ["name" => "ทักษะปฏิบัติ", "avg" => $avg_skill],
        ["name" => "ทัศนคติ", "avg" => $avg_attitude],
        ["name" => "ความรู้", "avg" => $avg_knowledge],
        ["name" => "สื่อสาร", "avg" => $avg_comm],
    ];

    $radarData = [
        ["subject" => "ทักษะปฏิบัติ", "A" => $avg_skill, "fullMark" => 5],
        ["subject" => "ทัศนคติ", "A" => $avg_attitude, "fullMark" => 5],
        ["subject" => "ความรู้", "A" => $avg_knowledge, "fullMark" => 5],
        ["subject" => "การสื่อสาร", "A" => $avg_comm, "fullMark" => 5],
    ];

    $sql_students = "SELECT student_id, CONCAT(student_id, ' - ', first_name_th, ' ', last_name_th) as display_name
                     FROM student WHERE status = 'Active' ORDER BY student_id ASC";
    $studentList = $db->query($sql_students)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "performances" => $performances,
            "chartData" => $chartData,
            "radarData" => $radarData,
            "studentList" => $studentList,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
