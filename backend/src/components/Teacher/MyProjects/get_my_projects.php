<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอินอยู่
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    if (!$faculty_id) {
        echo json_encode(["status" => "success", "data" => []]);
        exit;
    }

    // 2. ดึงข้อมูลโครงการที่รับผิดชอบตาม faculty_id โดยใช้ schema จริงของ project
    $sql = "
        SELECT 
            p.project_id as id, 
            COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), CONCAT('Project #', p.project_id)) AS name,
            p.academic_year,
            p.status,
            p.end_date,
            COALESCE(pp.members, 0) AS members,
            COALESCE(pb.budget, 0) AS budget,
            COALESCE(pb.spent, 0) AS spent,
            COALESCE(pl.progress, 0) AS progress
        FROM project p
        LEFT JOIN (
            SELECT project_id, COUNT(*) AS members
            FROM project_participants
            GROUP BY project_id
        ) pp ON pp.project_id = p.project_id
        LEFT JOIN (
            SELECT project_id, SUM(COALESCE(budget_allocated, 0)) AS budget, SUM(COALESCE(budget_spent, 0)) AS spent
            FROM project_budget_years
            GROUP BY project_id
        ) pb ON pb.project_id = p.project_id
        LEFT JOIN (
            SELECT project_id, MAX(actual_percent) AS progress
            FROM project_progress_logs
            GROUP BY project_id
        ) pl ON pl.project_id = p.project_id
        WHERE p.responsible_faculty_id = ?
        ORDER BY p.project_id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $my_projects = [];
    foreach ($projects_raw as $p) {
        $my_projects[] = [
            "id" => (string)$p['id'],
            "name" => $p['name'],
            "type" => "โครงการ",
            "status" => strtolower($p['status'] ?? 'pending'),
            "progress" => (int)round((float)$p['progress']),
            "budget" => (float)$p['budget'],
            "spent" => (float)$p['spent'],
            "members" => (int)$p['members'],
            "deadline" => $p['end_date'] ?: "-",
            "academic_year" => $p['academic_year'] !== null ? (int)$p['academic_year'] : null
        ];
    }

    echo json_encode(["status" => "success", "data" => $my_projects]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>