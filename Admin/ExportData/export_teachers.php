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
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["error" => "กรุณาเลือกฟิลด์ที่ต้องการส่งออก"]);
        exit();
    }

    $data = [];
    $headers = $fields; 

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

    // บันทึกประวัติลง Audit Log 
 $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
$stmt_log->execute([$user_id, "EXPORT", "faculty", "Export Data: teachers", $_SERVER['REMOTE_ADDR']]);

    // สร้างและส่งไฟล์ CSV
    $filename = "export_teachers_" . date('YmdHis') . ".csv";
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '";');
    
    $output = fopen('php://output', 'w');
    fputs($output, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM
    fputcsv($output, $headers);
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}
?>