<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 🔒 SECURITY CHECK
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    //  รับค่าค้นหา (Search)
    $search = $_GET['search'] ?? '';

    // SQL: ดึงข้อมูลจากตาราง project
    if ($search) {
        $sql = "SELECT project_id, project_name_th, project_name_en, description 
                FROM project 
                WHERE project_name_th LIKE :search OR project_name_en LIKE :search 
                ORDER BY project_id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':search' => "%$search%"]);
    } else {
        $sql = "SELECT project_id, project_name_th, project_name_en, description 
                FROM project 
                ORDER BY project_id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }

    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $projects]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>