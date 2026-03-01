<?php

    require_once __DIR__ . '/../../config/config.php';

    
    // Headers (สำคัญมากสำหรับการทำ API)
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, POST");
    header("Access-Control-Allow-Credentials: true"); // อนุญาตให้ส่ง Cookie/Session

// 1. เริ่ม Session (สำคัญมากเพื่อให้รู้ว่าใคร Login)
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 2. เรียกไฟล์เชื่อมต่อฐานข้อมูล (ตรวจสอบ Path ให้ถูกต้องตามโครงสร้างเครื่องคุณ)
require_once __DIR__ . '/../../config/config.php';

// 3. หาว่าเรามี ID ของผู้ใช้หรือไม่
// ขอรับค่าจาก Query string (สำหรับ Admin ดูคนอื่น) หรือจาก Session (username หรือ user_id)
$id = null;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
} elseif (isset($_SESSION['username'])) {
    $id = $_SESSION['username'];
} elseif (isset($_SESSION['user_id'])) {
    $id = $_SESSION['user_id'];
}

if (!$id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: No ID provided"]);
    exit;
}

$db = new Connect;

// 4. ดึงข้อมูลจากทั้งฐาน student และ faculty พร้อมตำแหน่ง
$sql = "SELECT u.username AS id,
               CASE WHEN f.faculty_id IS NOT NULL THEN 'faculty' ELSE 'student' END AS role,
               COALESCE(s.title, f.title) AS title,
               COALESCE(s.first_name_th, f.first_name_th) AS first_name,
               COALESCE(s.last_name_th, f.last_name_th) AS last_name,
               COALESCE(s.email, f.email) AS email,
               COALESCE(s.phone, f.phone) AS phone,
               p.position_name AS position
        FROM users u
        LEFT JOIN student s ON u.username = s.student_id
        LEFT JOIN faculty f ON u.username = f.faculty_id
        LEFT JOIN user_position up ON u.user_id = up.user_id AND up.is_primary = 1
        LEFT JOIN position p ON up.position_id = p.position_id
        WHERE u.username = :id OR u.user_id = :id2
        LIMIT 1";

$stmt = $db->prepare($sql);
$stmt->execute(['id' => $id, 'id2' => $id]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    // choose some defaults based on role
    $facultyName = null;
    $programName = null;
    if (isset($result['role']) && $result['role'] === 'faculty') {
        $facultyName = 'คณะพยาบาลศาสตร์'; // or fetch from another table if available
    }
    // if you want to derive program for students, add another query here

    // assemble response; add placeholders
    echo json_encode([
        "status" => "success",
        "data" => [
            "id" => $result['id'],
            "title" => $result['title'],
            "first_name" => $result['first_name'],
            "last_name" => $result['last_name'],
            "email" => $result['email'],
            "phone" => $result['phone'],
            "position" => $result['position'],
            "faculty" => $facultyName,
            "programe" => $programName
        ]
    ]);
} else {
    // ถ้าหาไม่เจอ ให้บอกเลข ID ที่หาไม่เจอเพื่อใช้ Debug
    echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลสำหรับ ID: " . $id]);
}
exit; // จบการทำงานเพื่อไม่ให้มีข้อความอื่นหลุดออกไป