<?php
// ไม่ต้องประกาศ Header ซ้ำเพราะ index.php จัดการให้แล้ว
session_start();
require_once __DIR__ . '/../../config/config.php'; // ปรับ path ตามโครงสร้างจริง

try {
    $db = new Connect(); // เรียกใช้ class จาก config.php
    
    // รับข้อมูล JSON จาก Axios
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // ใช้ Prepared Statement เพื่อความปลอดภัย
    $sql = "SELECT users.*, 
                   student.title AS s_title, student.first_name AS s_fname, student.last_name AS s_lname,
                   faculty.title AS f_title, faculty.first_name_th AS f_fname, faculty.last_name_th AS f_lname
            FROM users 
            LEFT JOIN student ON users.username = student.id
            LEFT JOIN faculty ON users.username = faculty.id
            WHERE users.username = :username";

    $stmt = $db->prepare($sql);
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // กำหนดชื่อตามสิทธิ์
        $name = ($user['role_id'] == 4) 
            ? $user['s_title'] . $user['s_fname'] . ' ' . $user['s_lname']
            : $user['f_title'] . $user['f_fname'] . ' ' . $user['f_lname'];

        $_SESSION['username'] = $user['username'];
        $_SESSION['role_id'] = $user['role_id'];
        $_SESSION['name'] = $name;

        echo json_encode([
            "status" => "success",
            "role_id" => (int)$user['role_id'],
            "user" => ["username" => $user['username'], "name" => $name]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}