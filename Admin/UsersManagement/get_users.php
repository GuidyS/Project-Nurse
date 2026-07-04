<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    $sql = "
        SELECT 
            u.user_id AS id,
            u.email,
            -- ดึงชื่อจากตาราง faculty หรือ student ขึ้นอยู่กับว่าเขาเป็นใคร
            COALESCE(CONCAT(f.first_name_th, ' ', f.last_name_th), CONCAT(s.first_name_th, ' ', s.last_name_th), 'ผู้ดูแลระบบ') AS fullName,
            r.role_name_en AS role,
            f.title AS teacherSubRole,
            'active' AS status, -- ฐานข้อมูลไดน่ายังไม่มีคอลัมน์ status ให้จำลองเป็น active ไปก่อน
            DATE_FORMAT(u.created_at, '%Y-%m-%d') AS createdAt
        FROM users u
        LEFT JOIN role r ON u.role_id = r.role_id
        LEFT JOIN faculty f ON u.user_id = f.user_id
        LEFT JOIN student s ON u.user_id = s.user_id
        ORDER BY u.created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>