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

// 🌟 (ทางเลือก) สามารถเพิ่มการตรวจเช็ค Role ได้ด้วย
// เช่น หน้า API นี้อนุญาตเฉพาะ อาจารย์ (Role ID = 2) และ Admin (Role ID = 1)
/*
if ($_SESSION['role_id'] != 1 && $_SESSION['role_id'] != 2) {
    http_response_code(403); // 403 Forbidden (ไม่มีสิทธิ์เข้าถึง)
    echo json_encode([
        "status" => "error",
        "message" => "Forbidden: คุณไม่มีสิทธิ์ใช้งานส่วนนี้"
    ]);
    exit();
}
*/
?>