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
$input = json_decode(file_get_contents("php://input"), true);

// เช็กความพร้อมก่อนอัปเดต ต้องมี ID โครงการ
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
    // VALIDATION: ต้องมี ID และชื่อโครงการ
    if (!empty($input['project_id']) && !empty($input['project_name_th'])) {
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

        $currentStmt = $pdo->prepare("SELECT project_type FROM project WHERE project_id = ? LIMIT 1");
        $currentStmt->execute([$input['project_id']]);
        $currentProjectType = $currentStmt->fetchColumn();
        if ($currentProjectType === false) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงการ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($projectType !== 'academic_service') {
            $linkStmt = $pdo->prepare("SELECT COUNT(*) FROM project_outcome_links WHERE project_id = ?");
            $linkStmt->execute([$input['project_id']]);
            if ((int)$linkStmt->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode([
                    "status" => "error",
                    "message" => "โครงการนี้มีการเชื่อม CLO/PLO/YLO อยู่ กรุณานำการเชื่อมโยงออกก่อนเปลี่ยนประเภท"
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        if ($projectType !== 'culture') {
            $satisfactionStmt = $pdo->prepare("SELECT COUNT(*) FROM project_satisfaction_responses WHERE project_id = ?");
            $satisfactionStmt->execute([$input['project_id']]);
            if ((int)$satisfactionStmt->fetchColumn() > 0) {
                http_response_code(409);
                echo json_encode([
                    "status" => "error",
                    "message" => "โครงการนี้มีข้อมูลความพึงพอใจอยู่ กรุณาลบข้อมูลก่อนเปลี่ยนประเภท"
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
        
        $sql = "UPDATE project 
                SET project_name_th = :name_th, 
                    project_name_en = :name_en, 
                    description = :desc,
                    project_type = :project_type,
                    academic_year = :academic_year,
                    status = :status,
                    start_date = :start_date,
                    end_date = :end_date
                WHERE project_id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name_th' => $input['project_name_th'],
            ':name_en' => $input['project_name_en'] ?? '',
            ':desc' => $input['description'] ?? '',
            ':project_type' => $projectType,
            ':academic_year' => $academicYear,
            ':status' => $input['status'] ?? 'active',
            ':start_date' => $input['start_date'] ?? null,
            ':end_date' => $input['end_date'] ?? null,
            ':id' => $input['project_id']
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
