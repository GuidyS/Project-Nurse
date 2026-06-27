<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../../config/config.php'; 

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

$user_id = $_SESSION['user_id'] ?? null;

try {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();

    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // 🛡️ ป้องกันระบบพังล่ม (Safe Check): ตรวจสอบโครงสร้างความสัมพันธ์ที่ปรึกษา
    $has_mapping = $db->query("SHOW TABLES LIKE 'student_advisor_mapping'")->rowCount() > 0;

    if (!$has_mapping) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 🔧 ปรับปรุง SQL: ดึงข้อมูลตามโครงสร้างตาราง student จริง (student_id, title, first_name_th, year_level, gpa)
    // และตัดการคิวรีเจาะลึกไปที่ตาราง advice_log ออกชั่วคราวเพื่อเลี่ยงปัญหา Unknown column 'al.created_at'
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            IFNULL(s.year_level, 1) as year,
            IFNULL(s.gpa, 0.00) as gpa,
            'normal' as status,
            false as needsAdvice,
            '-' as lastContact
        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        WHERE sam.faculty_id = :faculty_id
        ORDER BY s.year_level ASC, s.student_id ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':faculty_id' => $my_faculty_id]);
    $advises = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ประมวลผลเกณฑ์การแบ่งระดับความเสี่ยงของนักศึกษาตามระดับ GPA จริงเพื่อส่งไปขึ้น Badge สีหน้าบ้าน
    foreach ($advises as &$student) {
        $student['gpa'] = (float)$student['gpa'];
        $student['needsAdvice'] = ($student['gpa'] < 2.50); // ติดธงเหลืองต้องติดตามเมื่อเกรดต่ำกว่า 2.50
        
        if ($student['gpa'] < 2.00) {
            $student['status'] = 'critical'; // สีแดง
        } else if ($student['gpa'] < 2.50) {
            $student['status'] = 'warning';  // สีเหลือง
        } else {
            $student['status'] = 'normal';   // สีเขียว
        }
    }

    echo json_encode([
        "status" => "success", 
        "data" => $advises
    ]);

} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode(["status" => "error", "message" => "ข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()]);
}
?>