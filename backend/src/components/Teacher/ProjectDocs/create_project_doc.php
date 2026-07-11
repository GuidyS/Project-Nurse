<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    // รับข้อมูล JSON payload จากฝั่ง React
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['name'], $input['project_id'], $input['type'], $input['date'])) {
        throw new Exception("กรุณากรอกข้อมูลเอกสารให้ครบถ้วน");
    }

    $projectStmt = $pdo->prepare("
        SELECT COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS project_name
        FROM project
        WHERE project_id = :project_id
        LIMIT 1
    ");
    $projectStmt->execute([':project_id' => $input['project_id']]);
    $projectName = $projectStmt->fetchColumn();

    if (!$projectName) {
        throw new Exception("ไม่พบโครงการที่เลือก");
    }

    // บันทึกเข้าตารางจริงโดยมีค่าเริ่มต้นสถานะเป็น 'pending' (รอตรวจสอบ)
    $sql = "INSERT INTO project_documents (project_id, name, project, type, date, status) 
            VALUES (:project_id, :name, :project, :type, :date, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':project_id' => $input['project_id'],
        ':name'    => $input['name'],
        ':project' => $projectName,
        ':type'    => $input['type'],
        ':date'    => $input['date']
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกเอกสารเข้าสู่ระบบสำเร็จแล้ว",
        "doc_id"  => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>