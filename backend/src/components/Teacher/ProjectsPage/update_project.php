<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$input = json_decode(file_get_contents("php://input"), true);

try {
    // VALIDATION: ต้องมี ID, ชื่อโครงการ, ปีการศึกษา และผู้รับผิดชอบ
    if (!empty($input['project_id']) && !empty($input['name']) && !empty($input['academic_year']) && !empty($input['responsible_faculty_id'])) {
        
        $meta = [
            "name" => $input['name'],
            "type" => $input['type'] ?? 'วิจัย',
            "status" => $input['status'] ?? 'รอเริ่ม',
            "progress" => intval($input['progress'] ?? 0),
            "deadline" => $input['deadline'] ?? '-',
            "budget" => $input['budget'] ?? '0'
        ];
        $project_name_json = json_encode($meta, JSON_UNESCAPED_UNICODE);

        $sql = "UPDATE project 
                SET project_name = :project_name, 
                    academic_year = :academic_year, 
                    responsible_faculty_id = :responsible_faculty_id 
                WHERE project_id = :project_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':project_name' => $project_name_json,
            ':academic_year' => intval($input['academic_year']),
            ':responsible_faculty_id' => $input['responsible_faculty_id'],
            ':project_id' => $input['project_id']
        ]);

        echo json_encode(["status" => "success", "message" => "แก้ไขข้อมูลสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>