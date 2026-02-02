<?php
// แก้ไขไฟล์รหัสผ่านในฐานข้อมูล
session_start();
require_once __DIR__ . '/../../config/config.php';

try {
    $db = new Connect(); //
    $data = json_decode(file_get_contents("php://input"), true);
    
    $username = $data['username'] ?? '';
    $new_password = $data['new_password'] ?? '';

    if (empty($username) || empty($new_password)) {
        throw new Exception("ข้อมูลไม่ครบถ้วน");
    }

    // เข้ารหัสก่อนบันทึก
    $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

    $sql = "UPDATE users SET password_hash = :password WHERE username = :username";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':password' => $password_hash,
        ':username' => $username
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "อัปเดตรหัสผ่านแล้ว"]);
    } else {
        throw new Exception("ไม่พบผู้ใช้งานนี้ในระบบ");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}