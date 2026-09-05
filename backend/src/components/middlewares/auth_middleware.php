<?php
// 1. ตรวจสอบว่ามีการเปิด Session หรือยัง ถ้ายังให้เปิด
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. ตรวจสอบว่ามีข้อมูลผู้ใช้ใน Session หรือไม่ (ตั้งค่าไว้ตอนที่ Login สำเร็จ)
if (!isset($_SESSION['user_id'])) {
    
    // ถ้าไม่มี แปลว่ายังไม่ได้ล็อกอิน หรือ Session หมดอายุ
    http_response_code(401); // 401 Unauthorized
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized: กรุณาล็อกอินเข้าสู่ระบบ"
    ]);
    
    exit(); // 🚨 หยุดการทำงานของสคริปต์ทันที ห้ามลบคำสั่งนี้เด็ดขาด!
}

// 🌟 ฟังก์ชันสำหรับตรวจสอบ Role (ใช้งานในไฟล์ API ที่ต้องการดักสิทธิ์)
if (!function_exists('requireRole')) {
    function requireRole($allowedRoleIds) {
        if (!isset($_SESSION['role_id']) || !in_array($_SESSION['role_id'], $allowedRoleIds)) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Forbidden: คุณไม่มีสิทธิ์ใช้งานส่วนนี้"
            ]);
            exit();
        }
    }
}
?>