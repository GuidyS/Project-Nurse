<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin();
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอินอยู่
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    // 2. ดึงข้อมูลโครงการ และนับจำนวนนักศึกษาจาก project_participants
    $sql = "
        SELECT 
            p.project_id as id, 
            p.project_name_th as name, 
            p.status, 
            p.budget, 
            p.result, 
            DATE_FORMAT(p.end_date, '%Y-%m-%d') as deadline,
            (SELECT COUNT(*) FROM project_participants pp WHERE pp.project_id = p.project_id) as members
        FROM project p
        ORDER BY p.created_at DESC
    ";
    $stmt = $pdo->query($sql);
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $my_projects = [];
    foreach ($projects_raw as $p) {
        // 3. แกะกล่อง JSON จากคอลัมน์ result เพื่อเอาค่า progress และ spent
        $result_data = json_decode($p['result'], true);
        if (!is_array($result_data)) {
            $result_data = ["progress" => 0, "spent" => 0, "manager_id" => null];
        }

        // จัดรูปแบบส่งให้ React
        $my_projects[] = [
            "id" => (string)$p['id'],
            "name" => $p['name'],
            "status" => strtolower($p['status']),
            "progress" => (int)($result_data['progress'] ?? 0),
            "budget" => (float)$p['budget'],
            "spent" => (float)($result_data['spent'] ?? 0),
            "members" => (int)$p['members'],
            "deadline" => $p['deadline'] ?? '-'
        ];
    }

    echo json_encode(["status" => "success", "data" => $my_projects]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>