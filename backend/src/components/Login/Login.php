<?php
session_start();
$max_attempts = 5;
$lockout_time = 60; // วินาที

if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['last_attempt_time'] = time();
}

if ($_SESSION['login_attempts'] >= $max_attempts && (time() - $_SESSION['last_attempt_time']) < $lockout_time) {
    http_response_code(429);
    echo json_encode(["error" => "กรุณารอสักครู่ก่อนลองใหม่"]);
    exit();
}

// ...ตรวจสอบ username/password...

if ($login_failed) {
    $_SESSION['login_attempts'] += 1;
    $_SESSION['last_attempt_time'] = time();
    echo json_encode(["error" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"]);
    exit();
} else {
    $_SESSION['login_attempts'] = 0; // reset เมื่อ login สำเร็จ
    // ...login success...
}
