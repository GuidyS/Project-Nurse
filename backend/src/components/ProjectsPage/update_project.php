<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

// เช็กความพร้อมก่อนอัปเดต ต้องมี ID โครงการ
if ($input && isset($input['project_id'])) {
    try {
        // อัปเดตข้อมูลในตาราง project
        $sql = "UPDATE project 
                SET project_name = :project_name, 
                    academic_year = :academic_year, 
                    responsible_faculty_id = :faculty_id 
                WHERE project_id = :project_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':project_id' => $input['project_id'],
            ':project_name' => $input['project_name'],
            ':academic_year' => $input['academic_year'],
            ':faculty_id' => $input['faculty_id'] ?? null
        ]);

        echo json_encode(["status" => "success", "message" => "Project updated successfully"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing Project ID"]);
}
?>