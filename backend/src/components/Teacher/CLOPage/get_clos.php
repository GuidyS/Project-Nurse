<?php

//require_once __DIR__ . '/../../../middlewares/auth_middleware.php';

//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
//รับค่ารหัสวิชาจาก URL ที่ React ส่งมา
$subject_id = $_GET['subject_id'] ?? 0;

try {
    //  SECURITY: เช็คว่า Login หรือยัง (ถ้ายัง ให้หยุดทำงาน)
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }
//  INPUT: รับค่า subject_id จาก URL (เช่น get_clos.php?subject_id=1)
    $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;

    if ($subject_id) {
    //  SQL: ดึงรหัสวิชาและชื่อวิชา (เฉพาะ Active หรือทั้งหมดตามต้องการ)
    // เรียงตามรหัสวิชา
    $sql = "SELECT clo_id, description, ylo_id 
                FROM clo 
                WHERE subject_id = :subject_id 
                ORDER BY clo_id ASC"; // เรียงตาม ID แทน เพราะไม่มี code แล้ว
     //ดึงข้อมูลและส่งกลับ       
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':subject_id' => $subject_id]);
    } else {
        // กรณีไม่ระบุ: (อาจจะส่งกลับเป็นค่าว่าง หรือดึงทั้งหมด ขึ้นอยู่กับ Logic)
        $sql = "SELECT clo_id, clo_code, clo_description, created_at FROM clo ORDER BY clo_code ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    //fetchAll(...) คือการกวาดข้อมูลทุกแถวที่หาเจอ มาเก็บไว้ในตัวแปร $clos
    $clos = $stmt->fetchAll(PDO::FETCH_ASSOC);
//แปลงข้อมูลทั้งหมดเป็น JSON ส่งกลับไปให้ React แสดงผลบนตาราง
    echo json_encode(["status" => "success", "data" => $clos]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>