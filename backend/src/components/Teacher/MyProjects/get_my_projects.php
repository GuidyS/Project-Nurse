<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอินอยู่
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty_id = $stmt_fac->fetchColumn();

    if (!$faculty_id) {
        echo json_encode(["status" => "success", "data" => []]);
        exit;
    }

    // 2. ดึงข้อมูลโครงการที่รับผิดชอบตาม faculty_id
    $sql = "
        SELECT 
            p.project_id as id, 
            p.project_name as name, 
            p.academic_year as academic_year
        FROM project p
        WHERE p.responsible_faculty_id = ?
        ORDER BY p.project_id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$faculty_id]);
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $my_projects = [];
    foreach ($projects_raw as $p) {
        // แกะกล่อง JSON จากคอลัมน์ project_name เพื่อเอาข้อมูลที่บันทึกไว้
        $meta = json_decode($p['name'], true);

        if (is_array($meta)) {
            $name = $meta['name'] ?? 'ไม่มีชื่อโครงการ';
            $type = $meta['type'] ?? 'วิจัย';
            $status = $meta['status'] ?? 'pending';
            $progress = intval($meta['progress'] ?? 0);
            $deadline = $meta['deadline'] ?? '-';
            $budget = floatval($meta['budget'] ?? 0);
            $spent = floatval($meta['spent'] ?? 0);
        } else {
            // รองรับข้อมูลเก่าที่เป็น Plain Text
            $name = $p['name'] ?? 'ไม่มีชื่อโครงการ';
            $type = 'วิจัย';
            $status = 'pending';
            $progress = 0;
            $deadline = '-';
            $budget = 0.0;
            $spent = 0.0;
        }

        // จัดรูปแบบส่งให้ React
        $my_projects[] = [
            "id" => (string)$p['id'],
            "name" => $name,
            "type" => $type,
            "status" => strtolower($status),
            "progress" => $progress,
            "budget" => $budget,
            "spent" => $spent,
            "members" => 0, // ค่าจำลองสำหรับสมาชิกเนื่องจากไม่มีตาราง project_participants ในฐานข้อมูล
            "deadline" => $deadline,
            "academic_year" => intval($p['academic_year'])
        ];
    }

    echo json_encode(["status" => "success", "data" => $my_projects]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>