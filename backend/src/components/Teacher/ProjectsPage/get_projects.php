<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    //  รับค่าค้นหา (Search)
    $search = $_GET['search'] ?? '';

    // SQL: ดึงข้อมูลจากตาราง project ร่วมกับตาราง faculty
    if ($search) {
        $sql = "SELECT 
                    p.project_id as id, 
                    p.project_name as name, 
                    p.academic_year as academic_year,
                    p.responsible_faculty_id as responsible_faculty_id,
                    CONCAT(f.title, f.first_name_th, ' ', f.last_name_th) as responsible_faculty_name
                FROM project p
                LEFT JOIN faculty f ON p.responsible_faculty_id = f.faculty_id
                WHERE p.project_name LIKE :search
                ORDER BY p.project_id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':search' => "%$search%"]);
    } else {
        $sql = "SELECT 
                    p.project_id as id, 
                    p.project_name as name, 
                    p.academic_year as academic_year,
                    p.responsible_faculty_id as responsible_faculty_id,
                    CONCAT(f.title, f.first_name_th, ' ', f.last_name_th) as responsible_faculty_name
                FROM project p
                LEFT JOIN faculty f ON p.responsible_faculty_id = f.faculty_id
                ORDER BY p.project_id DESC";
        $stmt = $pdo->query($sql);
    }

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $projects = [];

    foreach ($rows as $row) {
        $meta = json_decode($row['name'], true);

        if (is_array($meta)) {
            $name = $meta['name'] ?? 'ไม่มีชื่อโครงการ';
            $type = $meta['type'] ?? 'วิจัย';
            $status = $meta['status'] ?? 'รอเริ่ม';
            $progress = intval($meta['progress'] ?? 0);
            $deadline = $meta['deadline'] ?? '-';
            $budget = $meta['budget'] ?? '0';
        } else {
            // รองรับข้อมูลเก่าที่เป็น Plain Text
            $name = $row['name'] ?? 'ไม่มีชื่อโครงการ';
            $type = 'วิจัย';
            $status = 'รอเริ่ม';
            $progress = 0;
            $deadline = '-';
            $budget = '0';
        }

        $projects[] = [
            "id" => $row['id'],
            "name" => $name,
            "type" => $type,
            "status" => $status,
            "progress" => $progress,
            "deadline" => $deadline,
            "budget" => $budget,
            "academic_year" => intval($row['academic_year']),
            "responsible_faculty_id" => $row['responsible_faculty_id'],
            "responsible_faculty_name" => $row['responsible_faculty_name']
        ];
    }

    // ดึงรายชื่ออาจารย์ทั้งหมดสำหรับใช้ในตัวเลือก (Dropdown) ตอนสร้างหรือแก้ไขโครงการ
    $sql_faculties = "SELECT faculty_id as id, CONCAT(title, first_name_th, ' ', last_name_th) as name FROM faculty ORDER BY first_name_th ASC";
    $stmt_faculties = $pdo->query($sql_faculties);
    $faculties = $stmt_faculties->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "faculties" => $faculties
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>