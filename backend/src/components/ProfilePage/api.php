<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: No session found"]);
    exit;
}

$id = $_SESSION['user_id'];
$username = $_SESSION['username'] ?? null;
$db = new Connect;

try {
    // 🧑‍🎓 [ขั้นตอนที่ 1] ลองตรวจสอบก่อนว่าผู้ใช้งานคนนี้มีประวัติต่อยู่ในตาราง student หรือไม่
    // โดยเช็คจากรหัสนักศึกษา (username) หรือ user_id 
    $sql_student = "SELECT student_id, title, first_name_th, last_name_th, email, phone, year_level AS year
                    FROM student 
                    WHERE student_id = :student_id_1 OR student_id = :student_id_2 LIMIT 1";
    $stmt_student = $db->prepare($sql_student);
    $stmt_student->execute([
        'student_id_1' => (float)$username,
        'student_id_2' => (float)$id
    ]);
    $student = $stmt_student->fetch(PDO::FETCH_ASSOC);

    // 🎯 ถ้าเจอข้อมูลในตารางนักศึกษา ให้ส่งก้อน JSON นักศึกษากลับไปทันที
    if ($student) {
        echo json_encode([
            "status" => "success",
            "data" => [
                "id" => $student['student_id'],
                "title" => $student['title'],
                "first_name" => $student['first_name_th'], // แมปตัวแปรให้ตรงกับ ProfilePage.tsx
                "last_name" => $student['last_name_th'],
                "email" => !empty($student['email']) ? $student['email'] : $student['student_id'] . "@siam.edu",
                "phone" => !empty($student['phone']) ? $student['phone'] : "-",
                "position" => "นักศึกษา ชั้นปีที่ " . ($student['year'] ?? "1"),
                "program" => "หลักสูตรพยาบาลศาสตรบัณฑิต",
                "faculty" => "พยาบาลศาสตร์"
            ]
        ]);
        exit;
    }

    // 🧑‍🏫 [ขั้นตอนที่ 2] ถ้าไม่พบในตารางนักศึกษา แปลว่าเป็น "อาจารย์/บุคลากร" ให้ดึงข้อมูลฝั่งอาจารย์ตามปกติ
    $sql_faculty = "SELECT f.*, u.username 
                    FROM users u
                    JOIN faculty f ON u.username = f.faculty_id
                    WHERE u.user_id = :id";

    $stmt_fac = $db->prepare($sql_faculty);
    $stmt_fac->execute(['id' => $id]);
    $result = $stmt_fac->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // เช็คตำแหน่งวิชาการจากตาราง user_position
        $sql_pos = "SELECT position_id FROM user_position WHERE user_id = :id AND is_primary = 1 LIMIT 1";
        $stmt_pos = $db->prepare($sql_pos);
        $stmt_pos->execute(['id' => $id]);
        $pos_row = $stmt_pos->fetch(PDO::FETCH_ASSOC);
        $position_id = $pos_row ? (int)$pos_row['position_id'] : null;

        $pos_names = [
            1 => 'คณบดี', 
            2 => 'อาจารย์ประจำหลักสูตร', 
            3 => 'อาจารย์ที่ปรึกษา', 
            4 => 'อาจารย์ปฏิบัติ', 
            5 => 'อาจารย์ผู้รับผิดชอบหลักสูตร', 
            6 => 'อาจารย์ผู้รับผิดชอบโครงการ'
        ];
        $display_position = $pos_names[$position_id] ?? "อาจารย์พยาบาล";

        echo json_encode([
            "status" => "success",
            "data" => [
                "id" => $result['faculty_id'],
                "title" => $result['title'],
                "first_name" => $result['first_name_th'],
                "last_name" => $result['last_name_th'],
                "email" => $result['username'] . "@siam.edu",
                "phone" => $result['phone_number'] ?? "-",
                "position" => $display_position,
                "program" => "-",
                "faculty" => "พยาบาลศาสตร์"
            ]
        ]);
    } else {
        // 💡 [Fallback สุดท้าย] ถ้าไม่เจอข้อมูลจากทั้งสองตารางเลย ให้ส่งค่าจำลองของรหัสที่ล็อกอินอยู่ เพื่อป้องกันหน้าจอขาวค้าง
        echo json_encode([
            "status" => "success",
            "data" => [
                "id" => $username ?? $id,
                "title" => "นักศึกษา",
                "first_name" => "ทดสอบระบบ",
                "last_name" => "พยาบาลศาสตร์",
                "email" => ($username ?? $id) . "@siam.edu",
                "phone" => "-",
                "position" => "ผู้ใช้งานระบบจำลอง",
                "program" => "หลักสูตรพยาบาลศาสตรบัณฑิต",
                "faculty" => "พยาบาลศาสตร์"
            ]
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
exit;