<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    $data = [
        "stats" => [],
        "retention" => [],
        "financial" => [],
        "grades" => []
    ];

    // --- 1. ข้อมูลนักศึกษา (สถานะการคงอยู่/พ้นสภาพ) ---
    $sql_status = "SELECT status, COUNT(*) as count FROM student GROUP BY status";
    $stmt_status = $pdo->query($sql_status);
    $student_statuses = $stmt_status->fetchAll(PDO::FETCH_ASSOC);
    
    $studying = 0; $graduated = 0; $dropped = 0;
    foreach ($student_statuses as $row) {
        if ($row['status'] === 'Studying') $studying = (int)$row['count'];
        else if ($row['status'] === 'Graduated') $graduated = (int)$row['count'];
        else $dropped += (int)$row['count']; // Resigned, Dismissed รวมเป็นออกกลางคัน
        
        // ข้อมูลกราฟ Retention
        $status_th = $row['status'] === 'Studying' ? 'กำลังศึกษา' : 
                    ($row['status'] === 'Graduated' ? 'สำเร็จการศึกษา' : 'พ้นสภาพ/ลาออก');
        
        $data['retention'][] = [
            "name" => $status_th, 
            "value" => (int)$row['count']
        ];
    }
    
    $total_students = $studying + $graduated + $dropped;
    $retention_rate = $total_students > 0 ? round(($studying + $graduated) / $total_students * 100, 1) : 0;

    // --- 2. ข้อมูลอาจารย์ ---
    $stmt_fac = $pdo->query("SELECT COUNT(*) FROM faculty");
    $total_faculty = (int)$stmt_fac->fetchColumn();

    // --- 3. ข้อมูลการเงิน/โครงการ (จากตาราง project) ---
    $sql_project = "SELECT project_name_th as name, budget FROM project ORDER BY budget DESC LIMIT 5";
    $stmt_project = $pdo->query($sql_project);
    $data['financial']['projects'] = $stmt_project->fetchAll(PDO::FETCH_ASSOC);

    $stmt_budget = $pdo->query("SELECT SUM(budget) FROM project");
    $total_budget = (float)$stmt_budget->fetchColumn();

    // --- 4. สรุป KPI กราฟเกรดเฉลี่ย (จาก assessments) ---
    $sql_grades = "SELECT grade, COUNT(*) as count FROM assessments WHERE grade IS NOT NULL AND grade != '-' GROUP BY grade ORDER BY grade ASC";
    $stmt_grades = $pdo->query($sql_grades);
    $data['grades'] = $stmt_grades->fetchAll(PDO::FETCH_ASSOC);

    // ประกอบร่าง Stats Cards
    $data['stats'] = [
        "total_students" => $studying,
        "retention_rate" => $retention_rate,
        "total_faculty" => $total_faculty,
        "total_budget" => $total_budget
    ];

    echo json_encode(["status" => "success", "data" => $data]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>