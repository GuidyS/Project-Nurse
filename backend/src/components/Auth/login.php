<?php
// ไม่ต้องประกาศ Header ซ้ำเพราะ index.php จัดการให้แล้ว
session_start();
require_once __DIR__ . '/../../config/config.php'; // ปรับ path ตามโครงสร้างจริง

try {
    $db = new Connect(); // เรียกใช้ class จาก config.php

    // 1. รับค่า Raw Input จาก axios
    $input = file_get_contents('php://input'); 

    // 2. แปลง JSON เป็น Array (ต้องเช็คว่า $input ไม่ว่าง)
    $data = json_decode($input, true); 

    // 3. ดึงค่ามาตรวจสอบ (ใช้ชื่อ Key ให้ตรงกับที่ส่งมาจาก React)
    $username = isset($data['username']) ? trim($data['username']) : ''; 
    $password = isset($data['password']) ? trim($data['password']) : '';

    // 4. ตรวจสอบเงื่อนไข
    if (empty($username) || empty($password)) {
        echo json_encode([
            "status" => "error",
            "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"
        ]);
        exit;
    }

    // ใช้ Prepared Statement เพื่อความปลอดภัย
    $sql = "SELECT users.*, 
                   up.position_id AS main_position_id, 
                   student.title AS s_title, student.first_name_th AS s_fname, student.last_name_th AS s_lname,
                   faculty.title AS f_title, faculty.first_name_th AS f_fname, faculty.last_name_th AS f_lname
            FROM users 
            LEFT JOIN user_position up ON users.user_id = up.user_id AND up.is_primary = 1
            LEFT JOIN student ON users.username = student.student_id
            LEFT JOIN faculty ON users.username = faculty.faculty_id
            WHERE users.username = :username";

    $stmt = $db->prepare($sql);
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {

        // --- ส่วนที่เพิ่มกลับเข้ามา: กำหนดค่าชื่อ ($name) ---
        $name = ($user['role_id'] == 4) 
            ? $user['s_title'] . $user['s_fname'] . ' ' . $user['s_lname']
            : $user['f_title'] . $user['f_fname'] . ' ' . $user['f_lname'];
        // ----------------------------------------------
        
        // ดึงสิทธิ์จากทั้ง Role และ Position มารวมกัน (UNION)
        $perm_sql = "SELECT p.name 
                    FROM permissions p
                    JOIN role_permission rp ON p.permissions_id = rp.permission_id
                    WHERE rp.role_id = :role_id
                    UNION
                    SELECT p.name 
                    FROM permissions p
                    JOIN position_permission pp ON p.permissions_id = pp.permission_id
                    JOIN user_position up ON pp.position_id = up.position_id
                    WHERE up.user_id = :user_id";

        $perm_stmt = $db->prepare($perm_sql);
        $perm_stmt->execute([
            ':role_id' => $user['role_id'],
            ':user_id' => $user['user_id']
        ]);
        $permissions = $perm_stmt->fetchAll(PDO::FETCH_COLUMN);

        // 2. เก็บเข้า Session
        $_SESSION['permissions'] = $permissions;

        // 3. ส่งกลับไปยัง Frontend
        echo json_encode([
            "status" => "success",
            "user" => [
                "username" => $user['username'],
                "name" => $name,
                "role_id" => (int)$user['role_id'],
                "position_id" => (int)($user['main_position_id'] ?? 0),
                "permissions" => $permissions // ส่ง Array เช่น ["manage_course_grading", "view_advisory_student_12"]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

error_reporting(0);