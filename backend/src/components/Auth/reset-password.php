<?php
/**
 * Public password reset is disabled.
 * Unauthenticated reset by username alone is unsafe.
 * Users should change password from Settings while logged in,
 * or contact an administrator.
 */
require_once __DIR__ . '/password_helpers.php';

$rate = checkAuthRateLimit('reset', authClientIp(), 10, 900);
if (!$rate['allowed']) {
    http_response_code(429);
    echo json_encode([
        "status" => "error",
        "message" => "คำขอถี่เกินไป กรุณาลองใหม่ภายหลัง",
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
recordAuthRateLimitFailure('reset', authClientIp(), 900);

http_response_code(403);
echo json_encode([
    "status" => "error",
    "message" => "การรีเซ็ตรหัสผ่านผ่านหน้า Login ถูกปิดชั่วคราวเพื่อความปลอดภัย กรุณาเข้าสู่ระบบแล้วเปลี่ยนรหัสผ่านที่เมนูตั้งค่า หรือติดต่อผู้ดูแลระบบ",
], JSON_UNESCAPED_UNICODE);
