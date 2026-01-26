<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// "Database Connection String"
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// รับค่าคำค้นหา (ถ้า React มีช่อง Search)
$search = $_GET['search'] ?? '';

try {
    // 1. ดึงข้อมูลจากตาราง project 
    // 2. LEFT JOIN กับ faculty เพื่อเอาชื่ออาจารย์ผู้รับผิดชอบ
    // 3. LEFT JOIN กับ project_budget_years เพื่อเอางบประมาณ
    $sql = "SELECT 
                p.project_id AS id,
                p.project_name AS name,
                p.academic_year,
                'โครงการทั่วไป' AS type, /* ใส่ค่าจำลองไปก่อน หรือสร้างคอลัมน์เพิ่มใน DB */
                COALESCE(b.result, 'รอเริ่ม') AS status,
                COALESCE(b.budget_allocated, 0) AS budget,
                COALESCE(CONCAT(f.first_name_th, ' ', f.last_name_th), '-') AS faculty_name
            FROM project p
            LEFT JOIN faculty f ON p.responsible_faculty_id = f.faculty_id
            LEFT JOIN project_budget_years b ON p.project_id = b.project_id
            WHERE p.project_name LIKE :search
            ORDER BY p.project_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':search' => '%' . $search . '%']);
    
    // กวาดข้อมูลทุกแถวที่หาเจอ มาเก็บไว้ในตัวแปร $projects
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // แปลงข้อมูลทั้งหมดเป็น JSON ส่งกลับไปให้ React แสดงผล
    echo json_encode(["status" => "success", "data" => $projects]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>