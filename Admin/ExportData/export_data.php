<?php
session_start();
// ตั้งค่า CORS ให้ React เข้าถึงได้ (อนุญาต POST สำหรับรับข้อมูล และ OPTIONS สำหรับ Preflight)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// เรียกใช้ Middleware
require_once 'auth_middleware.php'; 
requireLogin();
$user_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // อ่าน JSON Request ที่ส่งมาจาก Axios
    $input = json_decode(file_get_contents("php://input"), true);
    
    $category = $input['category'] ?? '';
    $fields = $input['fields'] ?? [];
    $format = $input['format'] ?? 'csv';
    $academicYear = $input['academicYear'] ?? date('Y') + 543;
    
    if (!$category || empty($fields)) {
        http_response_code(400);
        echo json_encode(["error" => "ข้อมูลไม่ครบถ้วน"]);
        exit();
    }

    $data = [];
    $headers = $fields; 

    // ดึงข้อมูลตาม Category
    if ($category === 'students') {
        $stmt = $pdo->query("SELECT * FROM student WHERE academic_year = " . (int)$academicYear);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row_data = [];
            if (in_array("รหัสนักศึกษา", $fields)) $row_data[] = $row['student_code'];
            if (in_array("ชื่อ-นามสกุล", $fields)) $row_data[] = $row['first_name_th'] . " " . $row['last_name_th'];
            if (in_array("คณะ", $fields)) $row_data[] = "พยาบาลศาสตร์"; 
            if (in_array("สาขา", $fields)) $row_data[] = "พยาบาลศาสตร์บัณฑิต"; 
            if (in_array("ชั้นปี", $fields)) $row_data[] = $row['class_year'];
            if (in_array("GPA", $fields)) $row_data[] = $row['gpa'];
            if (in_array("สถานะ", $fields)) $row_data[] = $row['status'];
            if (in_array("อาจารย์ที่ปรึกษา", $fields)) $row_data[] = $row['advisor_id']; 
            $data[] = $row_data;
        }
    } 
    elseif ($category === 'teachers') {
        $stmt = $pdo->query("SELECT * FROM faculty");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row_data = [];
            if (in_array("รหัสอาจารย์", $fields)) $row_data[] = $row['employee_id'];
            if (in_array("ชื่อ-นามสกุล", $fields)) $row_data[] = $row['academic_position'] . " " . $row['first_name_th'] . " " . $row['last_name_th'];
            if (in_array("ตำแหน่งวิชาการ", $fields)) $row_data[] = $row['academic_position'];
            if (in_array("สาขา", $fields)) $row_data[] = "พยาบาลศาสตร์";
            if (in_array("อีเมล", $fields)) $row_data[] = $row['email'];
            if (in_array("เบอร์โทร", $fields)) $row_data[] = $row['phone_number'];
            if (in_array("ตำแหน่งบริหาร", $fields)) $row_data[] = $row['administrative_position'];
            $data[] = $row_data;
        }
    }
    elseif ($category === 'courses') {
        $stmt = $pdo->query("SELECT * FROM subjects");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row_data = [];
            if (in_array("รหัสวิชา", $fields)) $row_data[] = $row['subject_code'];
            if (in_array("ชื่อวิชา", $fields)) $row_data[] = $row['subject_name_th'];
            if (in_array("หน่วยกิต", $fields)) $row_data[] = $row['credit'];
            if (in_array("ผู้สอน", $fields)) $row_data[] = "อาจารย์ประจำวิชา";
            if (in_array("หลักสูตร", $fields)) $row_data[] = "ปรับปรุง 2565"; 
            if (in_array("จำนวนนักศึกษา", $fields)) $row_data[] = "-"; 
            if (in_array("CLO", $fields)) $row_data[] = "-"; 
            $data[] = $row_data;
        }
    }
    elseif ($category === 'projects') {
        $stmt = $pdo->query("SELECT * FROM project");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row_data = [];
            if (in_array("รหัสโครงการ", $fields)) $row_data[] = $row['project_id'];
            if (in_array("ชื่อโครงการ", $fields)) $row_data[] = $row['project_name_th'];
            if (in_array("ผู้รับผิดชอบ", $fields)) $row_data[] = $row['head_faculty_id'];
            if (in_array("งบประมาณ", $fields)) $row_data[] = $row['budget'];
            if (in_array("สถานะ", $fields)) $row_data[] = $row['status'];
            if (in_array("PLO/YLO", $fields)) $row_data[] = "-";
            $data[] = $row_data;
        }
    }

    // บันทึกประวัติการ Export ลง Audit Log 
    $log_action = "Export Data: " . $category;
    $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action, created_at) VALUES (?, ?, NOW())");
    $stmt_log->execute([$user_id, $log_action]);

    // สร้างไฟล์ CSV ส่งกลับไปให้เบราว์เซอร์ดาวน์โหลด
    $filename = "export_" . $category . "_" . date('YmdHis') . ".csv";
    
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '";');
    
    $output = fopen('php://output', 'w');
    
    // ใส่ BOM ป้องกันภาษาไทยเพี้ยนใน Excel
    fputs($output, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));
    
    fputcsv($output, $headers);
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit();
}
?>