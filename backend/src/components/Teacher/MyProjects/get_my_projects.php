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
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอินอยู่ (users.username = faculty_id ไม่ใช่ user_id)
    // ใช้ username ตรง ๆ — ไม่บังคับให้มีแถวในตาราง faculty (ข้อมูลอาจารย์บางคนอาจยังไม่ถูกนำเข้า)
    $stmt_fac = $pdo->prepare("SELECT username FROM users WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    if (!$faculty_id) {
        echo json_encode(["status" => "success", "data" => []]);
        exit;
    }

    // 2. ดึงข้อมูลโครงการที่รับผิดชอบตาม faculty_id
    // หมายเหตุ: DB ปัจจุบันยังไม่มีคอลัมน์ project.status/end_date และตาราง project_progress_logs
    // จึงอ่าน status/progress/deadline จาก mapping_json.meta แทน (เขียนไว้ตอน seed)
    $has_progress_logs = $pdo->query("SHOW TABLES LIKE 'project_progress_logs'")->rowCount() > 0;
    $progress_join = $has_progress_logs
        ? "LEFT JOIN (SELECT project_id, MAX(actual_percent) AS progress FROM project_progress_logs GROUP BY project_id) pl ON pl.project_id = p.project_id"
        : "";
    $progress_col = $has_progress_logs ? "COALESCE(pl.progress, 0)" : "0";

    $sql = "
        SELECT
            p.project_id as id,
            COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), CONCAT('Project #', p.project_id)) AS name,
            p.academic_year,
            p.mapping_json,
            COALESCE(pp.members, 0) AS members,
            COALESCE(pb.budget, 0) AS budget,
            COALESCE(pb.spent, 0) AS spent,
            $progress_col AS progress
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
        $progress_join
        WHERE p.responsible_faculty_id = ?
        ORDER BY p.project_id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $my_projects = [];
    foreach ($projects_raw as $p) {
        $m = $p['mapping_json'] ? (json_decode($p['mapping_json'], true) ?: []) : [];
        $meta = $m['meta'] ?? [];

        $my_projects[] = [
            "id" => (string)$p['id'],
            "name" => $p['name'],
            "type" => $meta['type'] ?? "โครงการ",
            "status" => strtolower($meta['status'] ?? 'pending'),
            "progress" => (int)round((float)$p['progress'] ?: (float)($meta['progress'] ?? 0)),
            "budget" => (float)$p['budget'],
            "spent" => (float)$p['spent'],
            "members" => (int)$p['members'] ?: (int)($meta['members'] ?? 0),
            "deadline" => $meta['deadline'] ?? "-",
            "academic_year" => $p['academic_year'] !== null ? (int)$p['academic_year'] : null
        ];
    }

    echo json_encode(["status" => "success", "data" => $my_projects]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>