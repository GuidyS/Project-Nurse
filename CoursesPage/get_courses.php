<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

$sql = "SELECT s.subject_id AS id, s.subject_code AS code, s.subject_name_th AS name, s.credit AS credits,
        (SELECT COUNT(enrollment_id) FROM enrollment WHERE subject_id = s.subject_id) AS students,
        (SELECT COUNT(clo_id) FROM clo WHERE subject_id = s.subject_id) AS cloCount,
        '1/2567' AS semester, '1' AS section FROM subject s";
$stmt = $pdo->query($sql);
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($courses as &$course) {
    $course['id'] = (int)$course['id'];
    $course['credits'] = (int)$course['credits'];
    $course['students'] = (int)$course['students'];
    $course['cloCount'] = (int)$course['cloCount'];
}
echo json_encode(["status" => "success", "data" => $courses]);
?>