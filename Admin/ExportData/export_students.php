<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin();
$user_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $fields = $input['fields'] ?? [];
    $academicYear = $input['academicYear'] ?? date('Y') + 543;
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["error" => "กรุณาเลือกฟิลด์ที่ต้องการส่งออก"]);
        exit();
    }

    $data = [];
    $headers = $fields; 

    $stmt = $pdo->prepare("SELECT * FROM student WHERE academic_year = ?");
    $stmt->execute([(int)$academicYear]);
    
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

    // บันทึกประวัติลง Audit Log 
    $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action, created_at) VALUES (?, 'Export Data: students', NOW())");
    $stmt_log->execute([$user_id]);

    // สร้างและส่งไฟล์ CSV
    $filename = "export_students_" . date('YmdHis') . ".csv";
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '";');
    
    $output = fopen('php://output', 'w');
    fputs($output, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM ป้องกันภาษาไทยเพี้ยน
    fputcsv($output, $headers);
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}
?>