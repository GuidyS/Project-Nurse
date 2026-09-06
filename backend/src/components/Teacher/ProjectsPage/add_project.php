<?php
//  เริ่มต้น Session (ใส่บรรทัดแรกเสมอ เพื่อให้เช็ค Login ได้)
session_start();
//  ตั้งค่า Header (สำคัญมากสำหรับการเชื่อมต่อกับ Frontend)
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตให้ React เข้าถึง
header("Access-Control-Allow-Credentials: true");             // อนุญาตให้ส่ง Cookie/Session
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// จัดการคำขอแบบพิเศษที่เรียกว่า OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// "Database Connection String"
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// ดึงข้อมูลที่ React ส่งมาแกะเป็น Array
$input = json_decode(file_get_contents("php://input"), true);

// เช็กว่าส่งข้อมูลสำคัญมาครบไหม (ชื่อโครงการ และ ปีการศึกษา)
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
    //  VALIDATION: เช็คว่ากรอกชื่อโครงการมาไหม
    if (!empty($input['project_name_th'])) {
        $allowedProjectTypes = ['academic_service', 'culture', 'other'];
        $projectType = $input['project_type'] ?? 'other';
        if (!in_array($projectType, $allowedProjectTypes, true)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "ประเภทโครงการไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $academicYear = (int)($input['academic_year'] ?? 0);
        if ($academicYear < 2500 || $academicYear > 2700) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "ปีการศึกษาต้องอยู่ระหว่าง พ.ศ. 2500–2700"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $facultyStmt = $pdo->prepare("
            SELECT f.faculty_id
            FROM users u
            INNER JOIN faculty f ON CAST(f.faculty_id AS CHAR) = CAST(u.username AS CHAR)
            WHERE u.user_id = ?
            LIMIT 1
        ");
        $facultyStmt->execute([$_SESSION['user_id']]);
        $facultyId = $facultyStmt->fetchColumn() ?: null;
        
        $sql = "INSERT INTO project (
                    project_name_th, project_name_en, description, project_type,
                    responsible_faculty_id, academic_year, status, start_date, end_date
                ) VALUES (
                    :name_th, :name_en, :desc, :project_type,
                    :responsible_faculty_id, :academic_year, :status, :start_date, :end_date
                )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name_th' => $input['project_name_th'],
            ':name_en' => $input['project_name_en'] ?? '',
            ':desc' => $input['description'] ?? '',
            ':project_type' => $projectType,
            ':responsible_faculty_id' => $facultyId,
            ':academic_year' => $academicYear,
            ':status' => $input['status'] ?? 'active',
            ':start_date' => $input['start_date'] ?? null,
            ':end_date' => $input['end_date'] ?? null
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "เพิ่มโครงการสำเร็จ",
            "data" => ["project_id" => (int)$pdo->lastInsertId()]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
