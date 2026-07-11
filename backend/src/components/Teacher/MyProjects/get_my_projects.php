<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอิน (users.username = faculty_id)
    $stmt_fac = $pdo->prepare("SELECT username FROM users WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    if (!$faculty_id) {
        echo json_encode(["status" => "success", "data" => []]);
        exit;
    }

    // 2. โครงการที่รับผิดชอบ (meta เก็บใน mapping_json.meta / งบจริงจาก project_budget_years)
    $sql = "SELECT p.project_id AS id, p.project_name_th AS name, p.academic_year, p.mapping_json,
                   IFNULL((SELECT SUM(budget_allocated) FROM project_budget_years b WHERE b.project_id = p.project_id), 0) AS budget,
                   IFNULL((SELECT SUM(budget_spent) FROM project_budget_years b WHERE b.project_id = p.project_id), 0) AS spent
            FROM project p
            WHERE p.responsible_faculty_id = ?
            ORDER BY p.project_id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $my_projects = [];
    foreach ($rows as $p) {
        $m = $p['mapping_json'] ? (json_decode($p['mapping_json'], true) ?: []) : [];
        $meta = $m['meta'] ?? [];

        $my_projects[] = [
            "id"       => (string)$p['id'],
            "name"     => $p['name'] ?: 'ไม่มีชื่อโครงการ',
            "type"     => $meta['type'] ?? 'ทำนุบำรุง/วิชาการ',
            "status"   => strtolower($meta['status'] ?? 'active'),
            "progress" => (int)($meta['progress'] ?? 0),
            "budget"   => (float)$p['budget'],
            "spent"    => (float)$p['spent'],
            "members"  => (int)($meta['members'] ?? 0),
            "deadline" => $meta['deadline'] ?? '-',
            "academic_year" => (int)$p['academic_year'],
        ];
    }

    echo json_encode(["status" => "success", "data" => $my_projects], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
