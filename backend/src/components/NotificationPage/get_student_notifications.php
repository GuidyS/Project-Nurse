<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
}

try {
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $current_user_id = $_SESSION['user_id'];

    // 1. เช็คสิทธิ์ของผู้ที่กำลังจะส่งข้อความ
    $roleStmt = $pdo->prepare("SELECT role_id FROM users WHERE user_id = :user_id");
    $roleStmt->execute([':user_id' => $current_user_id]);
    $sender_role = (int) $roleStmt->fetchColumn();

    // ถ้านักศึกษา (Role 3) พยายามแอบยิง API เข้ามา ให้บล็อกและส่งอาร์เรย์ว่างกลับไป
    if ($sender_role === 3) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 2. คิวรีดึงรายชื่อผู้รับ โดยเช็คสิทธิ์ (Role 1 เห็นหมด, Role 2 เห็นแค่ 1 กับ 3)
    $sql = "SELECT
                u.user_id AS id,
                u.username AS identifier,
                u.role_id,
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))), ''),
                    IF(u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', u.username)
                ) AS name
            FROM users u
            LEFT JOIN faculty f ON CAST(u.username AS CHAR) = f.faculty_id
            LEFT JOIN student s ON CAST(u.username AS UNSIGNED) = s.student_id
            WHERE u.user_id != :current_user_id "; // ไม่ให้ส่งหาตัวเอง

    if ($sender_role === 2) {
        // ถ้าคนส่งเป็นอาจารย์ ให้เห็นเฉพาะ Admin (1) และ นักศึกษา (3)
        $sql .= " AND u.role_id IN (1, 3) "; 
    }

    $sql .= " ORDER BY u.role_id ASC, identifier ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':current_user_id' => $current_user_id]);
    $recipients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // จัดรูปแบบข้อมูลก่อนส่งให้หน้าบ้าน
    foreach ($recipients as &$rec) {
        $rec['id'] = (int) $rec['id'];
        $rec['role_id'] = (int) $rec['role_id'];
    }

    echo json_encode(["status" => "success", "data" => $recipients]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>