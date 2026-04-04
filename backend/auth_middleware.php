<?php
// ไฟล์: auth_middleware.php

// ดึง Library JWT เข้ามาใช้งาน (ตรวจสอบ Path vendor/autoload.php ของคุณให้ถูกต้อง)
require_once __DIR__ . '/vendor/autoload.php'; 

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;
use \Firebase\JWT\ExpiredException;
use \Firebase\JWT\SignatureInvalidException;

function requireLogin() {
    // 1. ตรวจสอบว่า Browser ส่ง Cookie ที่ชื่อ 'access_token' มาให้หรือไม่
    if (!isset($_COOKIE['access_token']) || empty($_COOKIE['access_token'])) {
        http_response_code(401); // 401 Unauthorized
        echo json_encode(["status" => "error", "message" => "Unauthorized - ไม่พบสิทธิ์การเข้าถึง (No Token)"]);
        exit();
    }

    $token = $_COOKIE['access_token'];
    
    // 🔑 รหัสลับ (Secret Key) สำหรับแกะกล่อง JWT (ต้องตั้งให้ตรงกับตอนที่สร้าง Token ในหน้า Login)
    // คำแนะนำ: ในระบบจริงควรดึงจากไฟล์ Config หรือ Environment Variables (.env)
    $secret_key = "NURSING_SYSTEM_SUPER_SECRET_KEY_2026"; 

    try {
        // 2. ถอดรหัส Token และตรวจสอบความถูกต้อง (ลายเซ็น & วันหมดอายุ)
        // ถ้า Token หมดอายุ หรือถูกดัดแปลง โค้ดจะกระโดดไปทำงานที่บล็อก catch ทันที
        $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));

        // 3. เมื่อ Token ถูกต้อง ดึงข้อมูล User ออกมาใช้งาน
        $userData = $decoded->data;

        // 4. นำข้อมูล User ไปเก็บไว้ใน $_SESSION หรือตัวแปร Global เพื่อให้ไฟล์ API อื่นๆ ดึงไปใช้ต่อได้ง่ายๆ
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $userData->user_id;
        // คุณสามารถเอา role_id หรือ position_id มาใส่ไว้ตรงนี้ด้วยก็ได้ ถ้าได้ฝังไว้ใน Token

        return $userData;

    } catch (ExpiredException $e) {
        // 🔴 กรณี Token หมดอายุ (เวลาปัจจุุบัน > เวลา exp ใน Token)
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Token expired - เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"]);
        exit();

    } catch (SignatureInvalidException $e) {
        // 🔴 กรณีมีคนพยายามปลอมแปลง Token (แฮกเกอร์แก้ตัวอักษร)
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid Signature - สิทธิ์การเข้าถึงไม่ถูกต้อง"]);
        exit();

    } catch (Exception $e) {
        // 🔴 กรณีเกิดข้อผิดพลาดอื่นๆ ที่เกี่ยวกับ Token
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized - " . $e->getMessage()]);
        exit();
    }
}
?>