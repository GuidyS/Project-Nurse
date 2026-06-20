<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงข้อมูลผลงาน JOIN กับตารางนักศึกษา
    $sql = "
        SELECT 
            p.portfolio_id as id,
            s.student_id as studentId,
            CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
            p.file_path
        FROM portfolio p
        JOIN student s ON p.student_id = s.student_id
        ORDER BY p.portfolio_id DESC
    ";
    
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $evidenceList = [];     

    foreach ($rows as $row) {
        // แกะกล่อง JSON ที่เราซ่อนไว้ในคอลัมน์ file_path
        $meta = json_decode($row['file_path'], true);
        
        if (is_array($meta)) {
            $type = $meta['type'] ?? 'document';
            $title = $meta['title'] ?? 'เอกสารแนบ';
            $verified = (bool)($meta['verified'] ?? false);
            $url = $meta['url'] ?? '';
        } else {
            // กรณีเป็นข้อมูลเก่าที่เคยเป็นแค่ Path ธรรมดา
            $type = 'document';
            $title = 'หลักฐานทั่วไป';
            $verified = false;
            $url = $row['file_path'];
        }

        $evidenceList[] = [
            "id" => $row['id'],
            "studentId" => $row['studentId'],
            "studentName" => $row['studentName'],
            "type" => $type,
            "title" => $title,
            "url" => $url,
            "date" => date('Y-m-d'),
            "verified" => $verified
        ];
    }

    // ดึงรายชื่อนักศึกษาทั้งหมดสำหรับ Dropdown
    $sql_students = "SELECT student_id as id, CONCAT(first_name_th, ' ', last_name_th) as name FROM student ORDER BY student_id ASC";
    $stmt_students = $pdo->query($sql_students);
    $studentsList = $stmt_students->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "evidence" => $evidenceList,
            "students" => $studentsList
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>