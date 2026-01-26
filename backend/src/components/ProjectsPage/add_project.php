<?php
// เป็นการบอกกฎเกณฑ์การเข้าใช้งาน API นี้
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// จัดการคำขอแบบพิเศษที่เรียกว่า OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// "Database Connection String"
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// ดึงข้อมูลที่ React ส่งมาแกะเป็น Array
$input = json_decode(file_get_contents("php://input"), true);

// เช็กว่าส่งข้อมูลสำคัญมาครบไหม (ชื่อโครงการ และ ปีการศึกษา)
if ($input && isset($input['project_name']) && isset($input['academic_year'])) {
    try {
        // เริ่ม Transaction เพื่อความปลอดภัย
        $pdo->beginTransaction();

        // 1. เพิ่มข้อมูลลงตาราง project หลัก
        $sql1 = "INSERT INTO project (project_name, academic_year, responsible_faculty_id) 
                 VALUES (:project_name, :academic_year, :faculty_id)";
        $stmt1 = $pdo->prepare($sql1);
        $stmt1->execute([
            ':project_name' => $input['project_name'],
            ':academic_year' => $input['academic_year'],
            ':faculty_id' => $input['faculty_id'] ?? null
        ]);
        
        // ดึง ID ของโครงการที่เพิ่งสร้าง
        $new_project_id = $pdo->lastInsertId();

        // 2. เพิ่มข้อมูลงบประมาณในตาราง project_budget_years (ถ้ามีการส่งงบมา)
        if(isset($input['budget'])) {
            $sql2 = "INSERT INTO project_budget_years (project_id, fiscal_year, budget_allocated, result) 
                     VALUES (:project_id, :fiscal_year, :budget, 'กำลังดำเนินการ')";
            $stmt2 = $pdo->prepare($sql2);
            $stmt2->execute([
                ':project_id' => $new_project_id,
                ':fiscal_year' => $input['academic_year'],
                ':budget' => $input['budget']
            ]);
        }

        // กดบันทึกข้อมูล
        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "Project added successfully", "new_id" => $new_project_id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
}
?>