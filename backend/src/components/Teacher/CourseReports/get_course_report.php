<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$academic_year = $_GET['year'] ?? null;
$subject_code = $_GET['subject'] ?? null;

try {
    if (!$academic_year || !$subject_code) {
        echo json_encode(["status" => "error", "message" => "ข้อมูลตัวกรองไม่ครบถ้วน"]);
        exit();
    }

    $db = new Connect();

    // กราฟที่ 1: สัดส่วนเกรด (Grade Distribution)
    $grade_template = ['A' => 0, 'B+' => 0, 'B' => 0, 'C+' => 0, 'C' => 0, 'D+' => 0, 'D' => 0, 'F' => 0];
    
    $sql_grades = "
        SELECT e.grade, COUNT(*) as count 
        FROM enrollment e
        JOIN subject s ON e.subject_id = s.subject_id
        WHERE e.academic_year = :year 
          AND s.subject_code = :code 
          AND e.grade IS NOT NULL AND e.grade != ''
        GROUP BY e.grade
    ";
    $stmt_grades = $db->prepare($sql_grades);
    $stmt_grades->execute([':year' => $academic_year, ':code' => $subject_code]);
    
    while ($row = $stmt_grades->fetch(PDO::FETCH_ASSOC)) {
        if (isset($grade_template[$row['grade']])) {
            $grade_template[$row['grade']] = (int)$row['count'];
        }
    }

    $gradeDistribution = [];
    $colors = ['A'=>'#22c55e', 'B+'=>'#84cc16', 'B'=>'#eab308', 'C+'=>'#f97316', 'C'=>'#ef4444', 'D+'=>'#dc2626', 'D'=>'#b91c1c', 'F'=>'#7f1d1d'];
    foreach ($grade_template as $g => $count) {
        $gradeDistribution[] = ["grade" => $g, "count" => $count, "color" => $colors[$g]];
    }

    // กราฟที่ 2 (CLO Achievement) ว่างไว้ก่อนเนื่องจากตัดระบบประเมินนี้ออก
    $cloAchievement = [];

    echo json_encode([
        "status" => "success", 
        "data" => [
            "gradeDistribution" => $gradeDistribution,
            "cloAchievement" => $cloAchievement
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>