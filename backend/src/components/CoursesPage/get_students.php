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

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    //  INPUT: รับค่า course_id (คือ subject_id) มาจาก URL
    // เช่น get_students.php?course_id=1
    $course_id = isset($_GET['course_id']) ? $_GET['course_id'] : null;

    if ($course_id) {
        //  SQL JOIN: ดึงข้อมูลจาก 2 ตารางเชื่อมกัน
        // 1. enrollment (การลงทะเบียน) -> เพื่อดูเกรด และดูว่าใครลงเรียนบ้าง
        // 2. student (ข้อมูลนักศึกษา) -> เพื่อดูชื่อ, นามสกุล, รหัส นศ.
        $sql = "SELECT 
                    s.student_id AS id,
                    s.student_id AS student_code, -- รหัสประจำตัว
                    s.first_name_th, 
                    s.last_name_th, 
                    e.grade AS grade, -- เกรดปัจจุบันที่มี
                    e.subject_id
                FROM enrollment e
                JOIN student s ON e.student_id = s.student_id
                WHERE e.subject_id = :course_id
                ORDER BY s.student_id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':course_id' => $course_id]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $students]);
    } else {
        // ถ้าไม่ส่ง id วิชามา ให้ส่งกลับเป็น array ว่างๆ
        echo json_encode(["status" => "success", "data" => []]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>