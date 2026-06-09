<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

$academic_year = $_GET['year'] ?? null;
$subject_code = $_GET['subject'] ?? null;

try {
    if (!$academic_year || !$subject_code) {
        echo json_encode(["status" => "error", "message" => "ข้อมูลตัวกรองไม่ครบถ้วน"]);
        exit();
    }

    // --- กราฟที่ 1: คำนวณสัดส่วนเกรด (Grade Distribution) ---
    // เตรียมโครงสร้างเกรดพื้นฐานไว้รอ เพื่อให้กราฟสีไม่เพี้ยนแม้วิชานั้นจะไม่มีคนได้ F
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
    $stmt_grades = $pdo->prepare($sql_grades);
    $stmt_grades->execute([':year' => $academic_year, ':code' => $subject_code]);
    
    while ($row = $stmt_grades->fetch(PDO::FETCH_ASSOC)) {
        if (isset($grade_template[$row['grade']])) {
            $grade_template[$row['grade']] = (int)$row['count'];
        }
    }

    // แปลง Format ให้ตรงกับ Recharts ใน React
    $gradeDistribution = [];
    $colors = ['A'=>'#22c55e', 'B+'=>'#84cc16', 'B'=>'#eab308', 'C+'=>'#f97316', 'C'=>'#ef4444', 'D+'=>'#dc2626', 'D'=>'#b91c1c', 'F'=>'#7f1d1d'];
    foreach ($grade_template as $g => $count) {
        $gradeDistribution[] = ["grade" => $g, "count" => $count, "color" => $colors[$g]];
    }


    // --- กราฟที่ 2: คำนวณผลสัมฤทธิ์ CLO (CLO Achievement) ---
    // คืนค่าอาร์เรย์เปล่าเนื่องจากไม่มีระบบประเมินคะแนน CLO ในระบบฐานข้อมูลแล้ว
    $cloAchievement = [];

    echo json_encode([
        "status" => "success", 
        "data" => [
            "gradeDistribution" => $gradeDistribution,
            "cloAchievement" => $cloAchievement
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>