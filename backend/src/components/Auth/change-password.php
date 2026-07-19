<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/password_helpers.php';

configureAuthSessionCookie();
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];

    $currentPassword = isset($data['current_password']) ? (string)$data['current_password'] : '';
    $newPassword = isset($data['new_password']) ? (string)$data['new_password'] : '';
    $confirmPassword = isset($data['confirm_password']) ? (string)$data['confirm_password'] : '';

    if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "กรุณากรอกรหัสผ่านให้ครบถ้วน",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($newPassword !== $confirmPassword) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($currentPassword === $newPassword) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "รหัสผ่านใหม่ต้องต่างจากรหัสผ่านปัจจุบัน",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $policyError = validatePasswordPolicy($newPassword);
    if ($policyError !== null) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $policyError,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $userId = (int)$_SESSION['user_id'];
    $rate = checkAuthRateLimit('change-password', (string)$userId, 5, 900);
    if (!$rate['allowed']) {
        http_response_code(429);
        echo json_encode([
            "status" => "error",
            "message" => "พยายามเปลี่ยนรหัสผ่านหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $db->prepare("SELECT user_id, password_hash FROM users WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([':user_id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "ไม่พบผู้ใช้งานในระบบ",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if (!password_verify($currentPassword, $user['password_hash'])) {
        recordAuthRateLimitFailure('change-password', (string)$userId, 900);
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "รหัสผ่านปัจจุบันไม่ถูกต้อง",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $passwordHash = hashAuthPassword($newPassword);
    $update = $db->prepare("UPDATE users SET password_hash = :password WHERE user_id = :user_id");
    $update->execute([
        ':password' => $passwordHash,
        ':user_id' => $userId,
    ]);

    $ip = authClientIp();
    $log = $db->prepare(
        "INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
         VALUES (:uid, 'update', 'ความปลอดภัย', 'เปลี่ยนรหัสผ่านสำเร็จ', :ip)"
    );
    $log->execute([
        ':uid' => $userId,
        ':ip' => $ip,
    ]);

    clearAuthRateLimit('change-password', (string)$userId);

    echo json_encode([
        "status" => "success",
        "message" => "เปลี่ยนรหัสผ่านสำเร็จ",
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
