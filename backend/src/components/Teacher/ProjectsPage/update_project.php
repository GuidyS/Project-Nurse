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
        if (($input['status'] ?? '') === 'completed') {
            $progressStmt = $pdo->prepare("
                SELECT COALESCE(MAX(actual_percent), 0)
                FROM project_progress_logs
                WHERE project_id = :project_id
            ");
            $progressStmt->execute([':project_id' => $input['project_id']]);
            $currentProgress = (float)$progressStmt->fetchColumn();

            if ($currentProgress < 100) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "ไม่สามารถเปลี่ยนสถานะเป็นเสร็จสิ้นได้จนกว่าความคืบหน้าจะครบ 100%"
                ]);
                exit();
            }
        }

        $pdo->beginTransaction();
        
        $sql = "UPDATE project 
                SET project_name_th = :name_th, 
                    project_name_en = :name_en, 
                    description = :desc,
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
            ':academic_year' => $input['academic_year'] ?? null,
            ':status' => $input['status'] ?? 'pending',
            ':start_date' => $input['start_date'] ?? null,
            ':end_date' => $input['end_date'] ?? null,
            ':id' => $input['project_id']
        ]);

        $budgetAllocated = isset($input['budget_allocated']) ? (float)$input['budget_allocated'] : 0;
        $budgetSpent = isset($input['budget_spent']) ? (float)$input['budget_spent'] : 0;
        $budgetSource = trim((string)($input['budget_source'] ?? ''));
        $budgetNote = trim((string)($input['budget_note'] ?? ''));
        $budgetResult = trim(implode(' | ', array_filter([
            $budgetSource !== '' ? 'แหล่งงบ: ' . $budgetSource : '',
            $budgetNote,
        ])));

        $budgetId = isset($input['project_budget_years_id']) ? (int)$input['project_budget_years_id'] : 0;
        if ($budgetId > 0) {
            $budgetStmt = $pdo->prepare("
                UPDATE project_budget_years
                SET fiscal_year = :fiscal_year,
                    budget_allocated = :budget_allocated,
                    budget_spent = :budget_spent,
                    result = :result
                WHERE project_budget_years_id = :budget_id
            ");
            $budgetStmt->execute([
                ':fiscal_year' => $input['academic_year'] ?? null,
                ':budget_allocated' => $budgetAllocated,
                ':budget_spent' => $budgetSpent,
                ':result' => $budgetResult !== '' ? $budgetResult : null,
                ':budget_id' => $budgetId,
            ]);
        } elseif ($budgetAllocated > 0 || $budgetSpent > 0 || $budgetResult !== '') {
            $budgetStmt = $pdo->prepare("
                INSERT INTO project_budget_years
                    (project_id, fiscal_year, budget_allocated, budget_spent, result)
                VALUES
                    (:project_id, :fiscal_year, :budget_allocated, :budget_spent, :result)
            ");
            $budgetStmt->execute([
                ':project_id' => $input['project_id'],
                ':fiscal_year' => $input['academic_year'] ?? null,
                ':budget_allocated' => $budgetAllocated,
                ':budget_spent' => $budgetSpent,
                ':result' => $budgetResult !== '' ? $budgetResult : null,
            ]);
        }

        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "แก้ไขข้อมูลสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
