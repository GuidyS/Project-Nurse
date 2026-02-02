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

//  DECODE: อ่านข้อมูล JSON ที่ส่งมาจาก React
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
    //  VALIDATION: ตรวจสอบข้อมูลที่จำเป็นต้องใช้
    // ต้องรู้ว่า: แก้เกรดให้ใคร (student_id), วิชาอะไร (course_id), และเกรดอะไร (grade)
    if (!empty($input['student_id']) && !empty($input['course_id']) && isset($input['grade'])) {
        
        //  SQL UPDATE: อัปเดตเกรดในตาราง enrollment
        $sql = "UPDATE enrollment 
                SET grade = :grade 
                WHERE student_id = :student_id AND subject_id = :course_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':grade' => $input['grade'],
            ':student_id' => $input['student_id'],
            ':course_id' => $input['course_id']
        ]);

        // เช็คว่ามีการแก้ไขจริงไหม (rowCount > 0) หรือเป็นค่าเดิม
        if ($stmt->rowCount() > 0) {
             echo json_encode(["status" => "success", "message" => "บันทึกเกรดเรียบร้อย"]);
        } else {
             // กรณีค่าเหมือนเดิมเป๊ะๆ ก็ถือว่า success เหมือนกัน
             echo json_encode(["status" => "success", "message" => "ค่าเกรดเหมือนเดิม (ไม่ได้เปลี่ยนแปลง)"]);
        }

    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน (Missing Data)"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>