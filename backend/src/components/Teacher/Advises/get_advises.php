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

    // 1. หารหัสอาจารย์ (faculty_id) ของคนที่ล็อกอินอยู่
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // 2. เช็คก่อนว่าในฐานข้อมูลมีการสร้างตาราง advice_log ไว้หรือยัง
    $has_advice_log = $db->query("SHOW TABLES LIKE 'advice_log'")->rowCount() > 0;

    // 3. เริ่มสร้างคำสั่ง SQL
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            IFNULL(s.year, 1) as year,
            0.00 as gpa,
            'normal' as status,
            false as needsAdvice
    ";

    // 💡 ถ้ามีตารางประวัติคำปรึกษา ให้เชื่อมข้อมูลมา (ใช้ al. นำหน้าป้องกันการยืมคอลัมน์)
    if ($has_advice_log) {
        $sql .= ", (
            SELECT DATE_FORMAT(MAX(al.created_at), '%Y-%m-%d') 
            FROM advice_log al 
            WHERE al.student_id = s.student_id AND al.advisor_id = :faculty_id
        ) as lastContact ";
    } else {
        // ถ้ายังไม่มีตารางนี้ ให้ส่งเครื่องหมายขีด (-) กลับไปโชว์ที่หน้าจอ React ก่อน
        $sql .= ", '-' as lastContact ";
    }

    $sql .= "
        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        WHERE sam.faculty_id = :faculty_id
        ORDER BY s.year DESC, s.student_id ASC
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
    echo json_encode(["status" => "error", "message" => "ข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()]);
}
?>