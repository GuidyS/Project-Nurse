<?php
// ไฟล์: auth_middleware.php

// ดึง Library JWT เข้ามาใช้งาน (ตรวจสอบ Path ให้ตรงกับโฟลเดอร์ vendor ของคุณ)
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
    
    // 🔑 รหัสลับ (Secret Key) สำหรับแกะกล่อง JWT 
    // (รหัสนี้ต้องตรงกับตอนที่คุณสร้าง Token ในไฟล์ login.php)
    $secret_key = "NURSING_SYSTEM_SUPER_SECRET_KEY_2026"; 

    try {
        // 2. ถอดรหัส Token และตรวจสอบความถูกต้อง (ลายเซ็น & วันหมดอายุ)
        $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));

        // 3. เมื่อ Token ถูกต้อง ดึงข้อมูล User ออกมา
        $userData = $decoded->data;

        // 4. นำข้อมูลจากตาราง users (ที่ฝังมาใน Token) มาใส่ใน $_SESSION
        // เพื่อให้ไฟล์ API อื่นๆ (เช่น get_my_courses.php) ดึงตัวแปรเหล่านี้ไปใช้ต่อได้ทันที
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // อิงตามคอลัมน์ในตาราง users และ role ของคุณ
        $_SESSION['user_id'] = $userData->user_id; 
        $_SESSION['role_id'] = $userData->role_id; 
        
        // ถ้าต้องการเก็บค่าอื่นๆ เช่น username ก็เก็บได้
        // $_SESSION['username'] = $userData->username;

        // คืนค่าก้อนข้อมูลกลับไป เผื่อบาง API ต้องการเรียกใช้ทันที
        return $userData;

    } catch (ExpiredException $e) {
        // 🔴 กรณี Token หมดอายุ (ต้องให้ User ล็อกอินใหม่)
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Token expired - เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"]);
        exit();

    } catch (SignatureInvalidException $e) {
        // 🔴 กรณีมีคนพยายามปลอมแปลง Token หรือคีย์ไม่ตรงกัน
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