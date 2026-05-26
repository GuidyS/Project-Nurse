<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// จัดการคำขอแบบพิเศษที่เรียกว่า OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

// "Database Connection String"
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ดึงข้อมูลที่ React ส่งมาแกะเป็น Array
$input = json_decode(file_get_contents("php://input"), true);

try {
    //  VALIDATION: เช็คว่ากรอกข้อมูลมาครบถ้วนหรือไม่
    if (!empty($input['name']) && !empty($input['academic_year']) && !empty($input['responsible_faculty_id'])) {
        
        $meta = [
            "name" => $input['name'],
            "type" => $input['type'] ?? 'วิจัย',
            "status" => $input['status'] ?? 'รอเริ่ม',
            "progress" => intval($input['progress'] ?? 0),
            "deadline" => $input['deadline'] ?? '-',
            "budget" => $input['budget'] ?? '0'
        ];
        $project_name_json = json_encode($meta, JSON_UNESCAPED_UNICODE);

        $sql = "INSERT INTO project (project_name, academic_year, responsible_faculty_id) 
                VALUES (:project_name, :academic_year, :responsible_faculty_id)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':project_name' => $project_name_json,
            ':academic_year' => intval($input['academic_year']),
            ':responsible_faculty_id' => $input['responsible_faculty_id']
        ]);

        echo json_encode(["status" => "success", "message" => "เพิ่มโครงการสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลโครงการให้ครบถ้วน"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>