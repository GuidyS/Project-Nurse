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

require_once __DIR__ . '/../../Admin/Approvals/approval-schema.php';

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
        ensureApprovalRequestsSchema($pdo);
        $pdo->beginTransaction();

        $facultyStmt = $pdo->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = ? LIMIT 1");
        $facultyStmt->execute([$_SESSION['user_id']]);
        $facultyId = $facultyStmt->fetchColumn() ?: null;
        
        $sql = "INSERT INTO project (
                    project_name_th, project_name_en, description,
                    responsible_faculty_id, academic_year, status, start_date, end_date
                ) VALUES (
                    :name_th, :name_en, :desc,
                    :responsible_faculty_id, :academic_year, :status, :start_date, :end_date
                )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name_th' => $input['project_name_th'],
            ':name_en' => $input['project_name_en'] ?? '',
            ':desc' => $input['description'] ?? '',
            ':responsible_faculty_id' => $facultyId,
            ':academic_year' => $input['academic_year'] ?? null,
            ':status' => 'pending',
            ':start_date' => $input['start_date'] ?? null,
            ':end_date' => $input['end_date'] ?? null
        ]);

        $projectId = (int)$pdo->lastInsertId();
        $budgetAllocated = isset($input['budget_allocated']) ? (float)$input['budget_allocated'] : 0;
        $budgetSpent = isset($input['budget_spent']) ? (float)$input['budget_spent'] : 0;
        $budgetSource = trim((string)($input['budget_source'] ?? ''));
        $budgetNote = trim((string)($input['budget_note'] ?? ''));
        $budgetResult = trim(implode(' | ', array_filter([
            $budgetSource !== '' ? 'แหล่งงบ: ' . $budgetSource : '',
            $budgetNote,
        ])));

        if ($budgetAllocated > 0 || $budgetSpent > 0 || $budgetResult !== '') {
            $budgetStmt = $pdo->prepare("
                INSERT INTO project_budget_years
                    (project_id, fiscal_year, budget_allocated, budget_spent, result)
                VALUES
                    (:project_id, :fiscal_year, :budget_allocated, :budget_spent, :result)
            ");
            $budgetStmt->execute([
                ':project_id' => $projectId,
                ':fiscal_year' => $input['academic_year'] ?? null,
                ':budget_allocated' => $budgetAllocated,
                ':budget_spent' => $budgetSpent,
                ':result' => $budgetResult !== '' ? $budgetResult : null,
            ]);
        }

        $approvalPayload = [
            'project_id' => $projectId,
            'project_name' => $input['project_name_th'],
            'academic_year' => $input['academic_year'] ?? null,
            'budget_requested' => $budgetAllocated,
            'budget_spent' => $budgetSpent,
            'budget_source' => $budgetSource,
            'reason' => 'ขออนุมัติสร้างโครงการใหม่',
        ];
        $approvalStmt = $pdo->prepare("
            INSERT INTO approval_requests
                (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, payload_json, status)
            VALUES
                ('project_request', :requester_user_id, 'project', :target_ref_id, :title, :description, :payload_json, 'pending')
        ");
        $approvalStmt->execute([
            ':requester_user_id' => $_SESSION['user_id'],
            ':target_ref_id' => (string)$projectId,
            ':title' => 'ขออนุมัติโครงการ',
            ':description' => 'ขออนุมัติโครงการ: ' . $input['project_name_th'],
            ':payload_json' => json_encode($approvalPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "เพิ่มโครงการสำเร็จและส่งคำขออนุมัติแล้ว"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อโครงการ"]);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
