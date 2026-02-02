<?php
session_start();
require_once __DIR__ . '/../../config/config.php';

try {
    $db = new Connect();

    // รับข้อมูล json จาก axios
    $data = json_decode(file_get_contents("php://input"), true);

    $username = $data['username'] ?? '';
    $password_raw = $data['password'] ?? '';
    $role_input = $data['role'] ?? '';

    if(empty($username) || empty($password_raw) || empty($role_input)) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // 2. แปลง Role เป็นตัวเลข
    $role_map = [
        'super-admin' => 1,
        'admin'       => 2,
        'teacher'     => 3,
        'student'     => 4
    ];
    $role = $role_map[$role_input] ?? 0;

    if ($role == 0) {
        throw new Exception("Role ไม่ถูกต้อง");
    }

    // 3. เช็คว่ามี Username นี้หรือยัง (ใช้ Prepared Statement)
    $stmt = $db->prepare("SELECT username FROM users WHERE username = :username");
    $stmt->execute([':username' => $username]);
    if ($stmt->fetch()) {
        throw new Exception("Username นี้ถูกใช้งานแล้ว");
    }

    // 4. เช็คว่ามีรายชื่อในระบบจริงไหม (Student / Faculty)
    $table = ($role == 4) ? "student" : "faculty";
    $stmt = $db->prepare("SELECT id FROM $table WHERE id = :id");
    $stmt->execute([':id' => $username]);
    
    if (!$stmt->fetch()) {
        throw new Exception("ไม่พบรายชื่อรหัส $username ในฐานข้อมูลฝ่าย $table");
    }

    // 5. บันทึกข้อมูล (Password Hash)
    $password_hash = password_hash($password_raw, PASSWORD_DEFAULT);
    $sql_insert = "INSERT INTO users (username, password_hash, role_id) VALUES (:username, :password, :role)";
    $stmt = $db->prepare($sql_insert);
    
    if ($stmt->execute([
        ':username' => $username,
        ':password' => $password_hash,
        ':role'     => $role
    ])) {
        echo json_encode([
            "status" => "success",
            "message" => "สมัครสมาชิกสำเร็จ"
        ]);
    } else {
        throw new Exception("ไม่สามารถบันทึกข้อมูลได้");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}