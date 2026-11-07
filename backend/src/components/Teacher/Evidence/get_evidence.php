<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../../config/storage.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status"=>"error","message"=>"Unauthorized"]);
        exit;
    }
    $userStmt = $pdo->prepare('SELECT username,role_id FROM users WHERE user_id=? LIMIT 1');
    $userStmt->execute([$_SESSION['user_id']]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);
    if (!$currentUser || !in_array((int)$currentUser['role_id'], [1,2], true)) {
        http_response_code(403);
        echo json_encode(["status"=>"error","message"=>"Forbidden"]);
        exit;
    }
    // ดึงข้อมูลผลงาน JOIN กับตารางนักศึกษา
    $sql = "
        SELECT 
            p.portfolio_id as id,
            s.student_id as studentId,
            CONCAT(s.first_name_th, ' ', s.last_name_th) as studentName,
            p.title,
            p.type,
            p.file_path,
            p.file_name,
            p.mime_type,
            (p.file_data IS NOT NULL) AS has_blob,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_date
        FROM portfolio p
        JOIN student s ON p.student_id = s.student_id
        WHERE (:is_admin = 1 OR EXISTS (
            SELECT 1 FROM student_advisor_mapping sam
            WHERE sam.student_id=p.student_id AND sam.faculty_id=:faculty_id
        ))
        ORDER BY p.portfolio_id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':is_admin'=>(int)$currentUser['role_id'] === 1 ? 1 : 0, ':faculty_id'=>$currentUser['username']]);
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

        // รองรับข้อมูลเก่าที่เคยเก็บ metadata เป็น JSON ใน file_path
        if (is_array($meta)) {
            $type = $row['type'] ?: ($meta['type'] ?? $type);
            $title = $row['title'] ?: ($meta['title'] ?? $title);
        }
        $file = storageDescriptor($pdo, $row['file_path'] ?? null, $row['file_name'] ?? null);
        $legacyAvailable = !empty($row['has_blob']) || storageLegacyAbsolutePath($row['file_path'] ?? null) !== null;
        if (!$file['available'] && $legacyAvailable) {
            $file['url'] = "index.php?page=download-file&id=" . rawurlencode((string)$row['id']);
            $file['available'] = true;
            $file['name'] = $file['name'] ?: ($row['file_name'] ?? null);
            $file['mime_type'] = $file['mime_type'] ?: ($row['mime_type'] ?? null);
        }

        $evidenceList[] = [
            "id" => $row['id'],
            "studentId" => $row['studentId'],
            "studentName" => $row['studentName'],
            "type" => $type,
            "title" => $title,
            "url" => $file['url'],
            "available" => $file['available'],
            "file" => $file,
            "date" => $row['created_date'] ?: date('Y-m-d')
        ];
    }

    // ดึงรายชื่อนักศึกษาทั้งหมดสำหรับ Dropdown
    $sql_students = "SELECT s.student_id as id, CONCAT(s.first_name_th, ' ', s.last_name_th) as name
        FROM student s
        WHERE (:is_admin = 1 OR EXISTS (
            SELECT 1 FROM student_advisor_mapping sam
            WHERE sam.student_id=s.student_id AND sam.faculty_id=:faculty_id
        ))
        ORDER BY s.student_id ASC";
    $stmt_students = $pdo->prepare($sql_students);
    $stmt_students->execute([':is_admin'=>(int)$currentUser['role_id'] === 1 ? 1 : 0, ':faculty_id'=>$currentUser['username']]);
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
