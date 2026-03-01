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
        'admin'       => 1,
        'teacher'     => 2,
        'student'     => 3
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
    if ($role === 3) {
            $table = "student";
            $id_column = "student_id"; // จาก student (1).sql
        } else {
            $table = "faculty";
            $id_column = "faculty_id"; // จาก faculty (2).sql
        }

        // 2. ตรวจสอบว่าตัวแปรมีค่าแน่นอนก่อนสร้าง Query
        if (empty($id_column) || empty($table)) {
            throw new Exception("Role ไม่ถูกต้อง ไม่สามารถระบุตารางข้อมูลได้");
        }

        // 3. เช็ครายชื่อในคณะ (จุดที่เกิด Error เดิม)
        // ใช้ Variable Interpolation ($id_column) สำหรับชื่อคอลัมน์
        $stmt = $db->prepare("SELECT $id_column FROM $table WHERE $id_column = :id");
        $stmt->execute([':id' => $username]);

        if (!$stmt->fetch()) {
            throw new Exception("ไม่พบรายชื่อรหัส $username ในฐานข้อมูลของ $table");
        }

        // 4. บันทึกลงตาราง users (เชื่อมโยงผ่าน username)
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $sql_insert = "INSERT INTO users (username, password_hash, role_id) VALUES (:username, :password, :role)";
        $stmt_insert = $db->prepare($sql_insert);
        $stmt_insert->execute([
            ':username' => $username, // เก็บ ID นักศึกษา/อาจารย์ ลงในช่อง username
            ':password' => $password_hash,
            ':role'     => $role
        ]);

    echo json_encode(["status" => "success", "message" => "ลงทะเบียนสำเร็จ"]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

