<?php
session_start();
// ตั้งค่า CORS ให้ React เข้าถึงได้
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// 1. เรียกใช้ Middleware ยามรักษาความปลอดภัยของเรา
require_once 'auth_middleware.php'; 
$user_id = $_SESSION['user_id']; // รหัส User ที่ล็อกอินอยู่

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 2. เขียน SQL Query ขั้นเทพ
    // - JOIN ตารางนักศึกษา (student) กับตารางที่ปรึกษา (student_advisor_mapping) และ อาจารย์ (faculty)
    // - ใช้ CASE WHEN คำนวณสถานะจาก GPA (เช่น < 2.0 = วิกฤต, < 2.5 = ต้องติดตาม)
    // - ใช้ Subquery (SELECT MAX) เพื่อหาวันที่ให้คำปรึกษาล่าสุดจากตาราง advice_log
    
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_code as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            s.year_level as year,
            IFNULL(s.gpa, 0) as gpa,
            
            -- คำนวณสถานะความเสี่ยงจากเกรด (ปรับเกณฑ์ตามคู่มือนักศึกษาของคณะได้เลย)
            CASE 
                WHEN s.gpa < 2.00 THEN 'critical'
                WHEN s.gpa < 2.50 THEN 'warning'
                ELSE 'normal'
            END as status,
            
            -- คำนวณว่าต้องการคำปรึกษาด่วนไหม (ถ้าเกรดต่ำกว่า 2.5 ให้ถือว่า Needs Advice = true)
            IF(s.gpa < 2.50, true, false) as needsAdvice,
            
            -- ดึงวันที่คุยกันล่าสุดจากตาราง advice_log
            (
                SELECT DATE_FORMAT(MAX(created_at), '%Y-%m-%d') 
                FROM advice_log al 
                WHERE al.student_id = s.student_id AND al.advisor_user_id = :user_id
            ) as lastContact

        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        JOIN faculty f ON sam.faculty_id = f.faculty_id
        WHERE f.user_id = :user_id 
          AND s.status = 'Studying' -- เอาเฉพาะคนที่ยังมีสภาพเป็นนักศึกษา
        ORDER BY s.year_level ASC, s.student_code ASC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $user_id]);
    $advisees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. แปลงชนิดข้อมูลให้ตรงกับที่ React ต้องการ (เช่น boolean, float)
    foreach ($advisees as &$student) {
        $student['gpa'] = (float)$student['gpa'];
        $student['needsAdvice'] = (bool)$student['needsAdvice'];
        $student['lastContact'] = $student['lastContact'] ? $student['lastContact'] : '-'; // ถ้าไม่เคยคุยเลยให้ใส่ขีด
    }

    // 4. ส่งข้อมูลกลับไปให้ Frontend
    echo json_encode([
        "status" => "success", 
        "data" => $advisees
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>