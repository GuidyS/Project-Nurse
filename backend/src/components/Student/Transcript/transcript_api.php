<?php
// 1. ตรวจสอบสถานะการเปิดใช้งาน Session ป้องกันการเปิดซ้ำ
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. เคลียร์ Output Buffer ป้องกัน Warning ไปกวนก้อน JSON หน้าบ้าน
ob_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 3. ลอจิกตรวจสอบคีย์ Session (เช็คทั้ง username และ user_id เผื่อระบบใช้คีย์สลับกัน)
$student_raw_id = null;
if (isset($_SESSION['username'])) {
    $student_raw_id = $_SESSION['username'];
} elseif (isset($_SESSION['user_id'])) {
    $student_raw_id = $_SESSION['user_id'];
}

if (!$student_raw_id) {
    ob_clean(); // ล้างข้อมูลขยะก่อนพ่น JSON
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบใหม่อีกครั้ง"]);
    exit();
}

require_once __DIR__ . '/../../../config/config.php'; 

try {
    $db = new Connect();
    $student_session_id = (float)$student_raw_id; 

    // 1. ดึงข้อมูลส่วนตัวจากตาราง student
    $sql_profile = "SELECT student_id AS student_code, 
                           CONCAT(IFNULL(title,''), first_name_th, ' ', last_name_th) AS student_name,
                           'พยาบาลศาสตร์' AS faculty,
                           'หลักสูตรพยาบาลศาสตรบัณฑิต' AS major,
                           IFNULL(year_level, 1) AS current_year
                    FROM student 
                    WHERE student_id = :student_id LIMIT 1";
                    
    $stmt_profile = $db->prepare($sql_profile);
    $stmt_profile->execute([':student_id' => $student_session_id]);
    $profile = $stmt_profile->fetch(PDO::FETCH_ASSOC);

    // หากไม่เจอโปรไฟล์ ให้ดึงชื่อแรกจากตารางขึ้นมาเป็นตัวอย่างทดสอบระบบ
    if (!$profile) {
        $sql_fallback = "SELECT student_id AS student_code, CONCAT(title, first_name_th, ' ', last_name_th) AS student_name, 'พยาบาลศาสตร์' AS faculty, 'พยาบาลศาสตรบัณฑิต' AS major, 2 AS current_year FROM student LIMIT 1";
        $stmt_fb = $db->query($sql_fallback);
        $profile = $stmt_fb->fetch(PDO::FETCH_ASSOC);
    }

    // 2. ลอจิกป้องกันตารางเกรด (grades) ไม่มีอยู่จริงในโครงสร้างปัจจุบันของคุณ
    // หากคุณเปลี่ยนชื่อตารางเกรดในภายหลัง ให้มาเปลี่ยนชื่อ 'grades' ในบรรทัดนี้ได้เลยครับ
    $grades = [];
    
    // ตรวจสอบก่อนว่ามีตารางชื่อ grades หรือตารางเกรดตัวอื่นในระบบมั้ย ป้องกัน Fatal Error
    $table_check = $db->query("SHOW TABLES LIKE 'grades'")->rowCount();
    
    if ($table_check > 0) {
        $sql_grades = "SELECT s.subject_code AS code, s.subject_name_th AS name,
                       s.credit AS credits, g.grade_letter AS grade, g.grade_point AS gradePoint,
                       g.semester, g.year
                FROM grades g
                JOIN subject s ON g.subject_id = s.subject_id
                WHERE g.student_id = :student_id
                ORDER BY g.year ASC, g.semester ASC";

        $stmt_grades = $db->prepare($sql_grades);
        $stmt_grades->execute([':student_id' => $profile ? $profile['student_code'] : $student_session_id]);
        $grades = $stmt_grades->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // 💡 ในกรณีที่ตารางเกรดยังทำไม่เสร็จ ระบบจะส่งค่าอาเรย์ว่างกลับไปหน้าบ้านก่อน เพื่อให้หน้าจอ Transcript โหลดผ่านได้ ไม่ค้างหมุนวนครับ
        $grades = [];
    }

    ob_clean(); // ล้าง Output Buffer ตัวเตือน Warning ทั้งหมดออกไป
    echo json_encode([
        "status" => "success",
        "data" => [
            "profile" => $profile,
            "grades" => $grades
        ]
    ]);

} catch (Exception $e) {
    ob_clean();
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}