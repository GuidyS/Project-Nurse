<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();

    // 1. หารหัสอาจารย์ (faculty_id) และ Role ของคนที่ล็อกอินอยู่
    $stmt_user = $db->prepare("SELECT role_id, username FROM users WHERE user_id = ? LIMIT 1");
    $stmt_user->execute([$user_id]);
    $user_data = $stmt_user->fetch(PDO::FETCH_ASSOC);
    $my_faculty_id = $user_data['username'] ?? '';
    $role_id = (int)($user_data['role_id'] ?? 0);

    // 2. เริ่มสร้างคำสั่ง SQL
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            IFNULL(s.year_level, 1) as year,
            IFNULL(s.gpa, 0.00) as gpa,
            IFNULL(s.status, 'normal') as status,
            s.email as email,
            false as needsAdvice,
            '-' as lastContact
        FROM student s
    ";

    // 3. เริ่มสร้างคำสั่ง SQL โดยดึงเฉพาะนักศึกษาที่รับผิดชอบ
    $sql .= "
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        WHERE sam.faculty_id = :faculty_id
        ORDER BY s.year_level DESC, s.student_id ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':faculty_id' => $my_faculty_id]);
    
    $advisees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. จัด Format ให้ตรงกับที่ UI หน้าบ้านรอรับ
    foreach ($advisees as &$student) {
        $student['gpa'] = (float)$student['gpa'];
        $student['needsAdvice'] = (bool)$student['needsAdvice'];
        $student['lastContact'] = $student['lastContact'] ? $student['lastContact'] : '-'; 
    }



    echo json_encode([
        "status" => "success", 
        "data" => $advisees
    ]);

} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = "ข้อผิดพลาดฐานข้อมูล: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    file_put_contents(__DIR__ . '/error.txt', $errorMsg);
    echo json_encode(["status" => "error", "message" => "ข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()]);
}
?>