<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

// เปิด/ปิดการโชว์ error message จริงตอน debug (ปิดเป็น false ตอนขึ้น production)
define('APP_DEBUG', true);

// --- เชื่อมต่อฐานข้อมูล พร้อมตั้งค่าให้ PDO โยน Exception เมื่อ query ผิดพลาด ---
try {
    $pdo = new PDO(
        "mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4",
        "MYSQL_USER",
        "MYSQL_PASSWORD",
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log("[DeanDashboard] DB Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? ("เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()) : "เชื่อมต่อฐานข้อมูลไม่สำเร็จ"
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $data = [
        "stats"     => [],
        "retention" => [],
        "financial" => [],
        "grades"    => []
    ];

    // 1. ข้อมูลนักศึกษา (สถานะการคงอยู่/พ้นสภาพ)
    // หมายเหตุ: ข้อมูลจริง status เป็น NULL ทั้งหมด → ตีความว่า "กำลังศึกษา"
    $sql_status = "SELECT IFNULL(status, 'Active') AS status, COUNT(*) as count FROM student GROUP BY IFNULL(status, 'Active')";
    $stmt_status = $pdo->query($sql_status);
    $student_statuses = $stmt_status->fetchAll();

    $studying = 0; $graduated = 0; $dropped = 0;
    foreach ($student_statuses as $row) {
        $status = $row['status'];
        $count  = (int)$row['count'];

        if ($status === 'Active' || $status === 'Studying') {
            $studying += $count;
            $status_th = 'กำลังศึกษา';
        } elseif ($status === 'Graduated' || $status === 'Graduted') { // เผื่อสะกดผิดในข้อมูลเก่า
            $graduated += $count;
            $status_th = 'สำเร็จการศึกษา';
        } else {
            // Dropout, Retired ฯลฯ
            $dropped += $count;
            $status_th = 'พ้นสภาพ/ลาออก';
        }

        $data['retention'][] = [
            "name"  => $status_th,
            "value" => $count
        ];
    }

    $total_students = $studying + $graduated + $dropped;
    $retention_rate = $total_students > 0
        ? round(($studying + $graduated) / $total_students * 100, 1)
        : 0;

    // 1.1 จำนวนนักศึกษาแยกตามชั้นปี (สำหรับกราฟสถิตินักศึกษา)
    $data['students_by_year'] = [];
    $stmt_year = $pdo->query("SELECT IFNULL(year_level, 1) AS y, COUNT(*) AS total FROM student GROUP BY IFNULL(year_level, 1) ORDER BY y");
    foreach ($stmt_year->fetchAll() as $row) {
        $data['students_by_year'][] = ["name" => "ปี " . $row['y'], "total" => (int)$row['total']];
    }

    // 2. ข้อมูลอาจารย์
    $stmt_fac = $pdo->query("SELECT COUNT(*) FROM faculty WHERE status = 'Active' OR status IS NULL");
    $total_faculty = (int)$stmt_fac->fetchColumn();

    // 2.1 อาจารย์แยกตามตำแหน่งวิชาการ (จากคำนำหน้า)
    $data['faculty_by_position'] = [];
    $stmt_pos = $pdo->query("SELECT
            CASE
                WHEN title LIKE '%ศาสตราจารย์%' THEN 'ผศ./รศ./ศ.'
                WHEN title LIKE '%ดร%' THEN 'อาจารย์ ดร.'
                ELSE 'อาจารย์'
            END AS pos, COUNT(*) AS total
        FROM faculty GROUP BY pos ORDER BY total DESC");
    foreach ($stmt_pos->fetchAll() as $row) {
        $data['faculty_by_position'][] = ["name" => $row['pos'], "total" => (int)$row['total']];
    }

    // 3. ข้อมูลการเงิน/โครงการ (Top 5 ตามงบประมาณ)
    $sql_project = "
        SELECT p.project_name_th AS name,
               SUM(pby.budget_allocated) AS budget
        FROM project p
        INNER JOIN project_budget_years pby ON pby.project_id = p.project_id
        GROUP BY p.project_id, p.project_name_th
        ORDER BY budget DESC
        LIMIT 5
    ";
    $stmt_project = $pdo->query($sql_project);
    $data['financial']['projects'] = $stmt_project->fetchAll();

    $stmt_budget = $pdo->query("SELECT SUM(budget_allocated) FROM project_budget_years");
    $total_budget = (float)($stmt_budget->fetchColumn() ?: 0);

    // 4. สรุป KPI กราฟเกรด (เกรดตัวอักษรจริงอยู่ในตาราง grades คอลัมน์ grade_letter)
    $sql_grades = "
        SELECT grade_letter AS grade, COUNT(*) as count
        FROM grades
        WHERE grade_letter IS NOT NULL AND grade_letter != '-'
        GROUP BY grade_letter
        ORDER BY FIELD(grade_letter, 'A','B+','B','C+','C','D+','D','F')
    ";
    $stmt_grades = $pdo->query($sql_grades);
    $data['grades'] = $stmt_grades->fetchAll();

    // ประกอบร่าง Stats Cards
    $data['stats'] = [
        "total_students" => $studying,
        "retention_rate" => $retention_rate,
        "total_faculty"  => $total_faculty,
        "total_budget"   => $total_budget
    ];

    echo json_encode(["status" => "success", "data" => $data], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("[DeanDashboard] Query Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง"
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log("[DeanDashboard] Unexpected Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดที่ไม่คาดคิด"
    ], JSON_UNESCAPED_UNICODE);
}
