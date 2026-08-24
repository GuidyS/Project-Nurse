<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // ดึงข้อมูลผลงาน JOIN กับตารางนักศึกษา
    $sql = "
        SELECT 
            p.portfolio_id as id,
            s.student_id as studentId,
            CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
            p.title,
            p.type,
            p.file_path,
            p.verified,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_date
        FROM portfolio p
        JOIN student s ON p.student_id = s.student_id
        ORDER BY p.portfolio_id DESC
    ";
    
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $evidenceList = [];     

    foreach ($rows as $row) {
        // แกะกล่อง JSON ที่เราซ่อนไว้ในคอลัมน์ file_path
        $meta = null;
        if (is_string($row['file_path']) && trim($row['file_path']) !== '') {
            $decoded = json_decode($row['file_path'], true);
            $meta = is_array($decoded) ? $decoded : null;
        }
        
        $type = $row['type'] ?: 'document';
        $title = $row['title'] ?: 'หลักฐานทั่วไป';
        $verified = (bool)$row['verified'];

        // รองรับข้อมูลเก่าที่เคยเก็บ metadata เป็น JSON ใน file_path
        if (is_array($meta)) {
            $type = $row['type'] ?: ($meta['type'] ?? $type);
            $title = $row['title'] ?: ($meta['title'] ?? $title);
            $verified = (bool)($row['verified'] ?: ($meta['verified'] ?? false));
        }
        $url = "index.php?page=download-file&id=" . $row['id'];

        $evidenceList[] = [
            "id" => $row['id'],
            "studentId" => $row['studentId'],
            "studentName" => $row['studentName'],
            "type" => $type,
            "title" => $title,
            "url" => $url,
            "date" => $row['created_date'] ?: date('Y-m-d'),
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
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
?>