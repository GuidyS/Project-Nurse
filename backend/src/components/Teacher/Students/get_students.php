<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// บังคับวิ่งหาจากพาร์ทเริ่มต้นของ Docker Server ตรงๆ ป้องกันปัญหาเรื่องพาร์ทโฟลเดอร์
require_once __DIR__ . '/../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;

try {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $db = new Connect();

    // 🔧 ดึงข้อมูลนักศึกษาทั้งหมดสอดคล้องตามโครงสร้างจริง (student_id, title, first_name_th, last_name_th, year_level, gpa)
    // สำหรับพาร์ทวิชาที่ลงทะเบียน (course) หากคุณยังทำระบบลงทะเบียนไม่เสร็จ ระบบจะ Fallback เป็นสัญลักษณ์ '-' ให้ก่อนครับ เพื่อป้องกันหน้าจอพัง
    $sql = "
        SELECT 
            s.student_id as id,
            s.student_id as studentId,
            CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) as name,
            IFNULL(s.year_level, 1) as year,
            IFNULL(s.gpa, 0.00) as gpa,
            'active' as status,
            '-' as course
        FROM student s
        ORDER BY s.year_level ASC, s.student_id ASC
    ";
    
    $stmt = $db->query($sql);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ตัวแปรนับสถิติเพื่อนำไปทำสถิติกล่อง Summary หน้าจอ
    $total_students = count($students);
    $active_count = 0;
    $warning_count = 0;

    foreach ($students as &$student) {
        $student['gpa'] = (float)$student['gpa'];
        $student['year'] = (int)$student['year'];

        // ลอจิกจำแนกกลุ่มสถานะ: ถ้านักศึกษาเกรดเฉลี่ยสะสมต่ำกว่า 2.50 ให้สลับสถานะเป็น 'warning' เพื่อเตือนให้อาจารย์ติดตาม
        if ($student['gpa'] > 0 && $student['gpa'] < 2.50) {
            $student['status'] = 'warning';
            $warning_count++;
        } else {
            $student['status'] = 'active';
            $active_count++;
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "students" => $students,
            "stats" => [
                "total" => $total_students,
                "active" => $active_count,
                "warning" => $warning_count
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา: " . $e->getMessage()]);
}
?>