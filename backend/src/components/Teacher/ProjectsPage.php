<?php
// เริ่มต้น Session สำหรับเช็ค Login
session_start();

// ตั้งค่า CORS Header ให้ React (Vite: localhost:5173) เข้าถึงได้
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");             
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// จัดการคำขอแบบ OPTIONS (Preflight request จากเบราว์เซอร์)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// 🔒 SECURITY CHECK (เอาคอมเมนต์ออกถ้าต้องการบังคับ Login ทุกครั้งที่เรียก API)
/*
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}
*/

// เชื่อมต่อ Database
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec("CREATE TABLE IF NOT EXISTS project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name_th VARCHAR(255) NOT NULL,
    project_name_en VARCHAR(255) DEFAULT '',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// ดึงข้อมูล HTTP Method และ Request Body
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

try {
    switch ($method) {
        // [GET] ดึงข้อมูลโครงการทั้งหมด (เทียบเท่า get_projects.php)
        case 'GET':
            $search = $_GET['search'] ?? '';
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
                $stmt = $pdo->query($sql);
            }
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $projects]);
            break;

        // [POST] เพิ่มโครงการใหม่ (เทียบเท่า add_project.php)
        case 'POST':
            if (!empty($input['project_name_th'])) {
                $sql = "INSERT INTO project (project_name_th, project_name_en, description) 
                        VALUES (:name_th, :name_en, :desc)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':name_th' => $input['project_name_th'],
                    ':name_en' => $input['project_name_en'] ?? '',
                    ':desc' => $input['description'] ?? ''
                ]);
                echo json_encode(["status" => "success", "message" => "เพิ่มโครงการสำเร็จ"]);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"]);
            }
            break;

        // [PUT] อัปเดตข้อมูลโครงการ (เทียบเท่า update_project.php)
        case 'PUT':
            if (!empty($input['project_id']) && !empty($input['project_name_th'])) {
                $sql = "UPDATE project 
                        SET project_name_th = :name_th, project_name_en = :name_en, description = :desc 
                        WHERE project_id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':name_th' => $input['project_name_th'],
                    ':name_en' => $input['project_name_en'] ?? '',
                    ':desc' => $input['description'] ?? '',
                    ':id' => $input['project_id']
                ]);
                echo json_encode(["status" => "success", "message" => "แก้ไขข้อมูลสำเร็จ"]);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
            }
            break;

        // [DELETE] ลบโครงการ (เทียบเท่า delete_project.php)
        case 'DELETE':
            if (!empty($input['project_id'])) {
                $sql = "DELETE FROM project WHERE project_id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':id' => $input['project_id']]);
                echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing ID"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
