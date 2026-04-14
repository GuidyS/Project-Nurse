<?php
// ไฟล์: login.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/vendor/autoload.php'; 
use \Firebase\JWT\JWT;

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['username']) && !empty($input['password'])) {
        // 1. หาผู้ใช้จาก Database (ตาราง users)
        $stmt = $pdo->prepare("SELECT user_id, username, password_hash, role_id, is_active FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$input['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. เช็คว่าเจอผู้ใช้ และ รหัสผ่านถูกต้องไหม
        // (หมายเหตุ: ในระบบจริงควรใช้ password_verify() แต่ถ้าใน DB คุณเก็บเป็น Text ธรรมดา ให้ใช้ == เช็คได้เลย)
        if ($user && $input['password'] === $user['password_hash']) {
            
            if ($user['is_active'] == 0) {
                echo json_encode(["status" => "error", "message" => "บัญชีนี้ถูกระงับการใช้งาน"]);
                exit();
            }

            // 3. สร้าง JWT Token
            $secret_key = "NURSING_SYSTEM_SUPER_SECRET_KEY_2026";
            $payload = array(
                "iss" => "http://localhost",
                "iat" => time(),
                "exp" => time() + (86400), // หมดอายุใน 1 วัน
                "data" => array(
                    "user_id" => $user['user_id'],
                    "role_id" => $user['role_id'],
                    "username" => $user['username']
                )
            );
            $token = JWT::encode($payload, $secret_key, 'HS256');

            // 4. สร้าง HttpOnly Cookie ส่งกลับไป
            setcookie("access_token", $token, time() + 86400, "/", "", false, true);

            echo json_encode([
                "status" => "success", 
                "message" => "เข้าสู่ระบบสำเร็จ",
                "role_id" => $user['role_id'] // ส่ง role_id กลับไปให้ React รู้ว่าจะต้องพาไปหน้าไหน
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบ"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>