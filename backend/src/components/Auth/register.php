<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/password_helpers.php';

configureAuthSessionCookie();
session_start();

try {
    $db = new Connect();

    $data = json_decode(file_get_contents("php://input"), true);

    $username = $data['username'] ?? '';
    $password_raw = $data['password'] ?? '';
    $role_input = $data['role'] ?? '';

    if (empty($username) || empty($password_raw) || empty($role_input)) {
        throw new Exception("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    $policyError = validatePasswordPolicy((string)$password_raw);
    if ($policyError !== null) {
        throw new Exception($policyError);
    }

    $rate = checkAuthRateLimit('register', $username, 8, 900);
    if (!$rate['allowed']) {
        http_response_code(429);
        throw new Exception("พยายามลงทะเบียนหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง");
    }

    $role_map = [
        'admin'   => 1,
        'teacher' => 2,
        'student' => 3,
    ];
    $role = $role_map[$role_input] ?? 0;

    if ($role == 0) {
        throw new Exception("Role ไม่ถูกต้อง");
    }

    $stmt = $db->prepare("SELECT username FROM users WHERE username = :username");
    $stmt->execute([':username' => $username]);
    if ($stmt->fetch()) {
        recordAuthRateLimitFailure('register', $username, 900);
        throw new Exception("Username นี้ถูกใช้งานแล้ว");
    }

    if ($role === 3) {
        $table = "student";
        $id_column = "student_id";
    } else {
        $table = "faculty";
        $id_column = "faculty_id";
    }

    if (empty($id_column) || empty($table)) {
        throw new Exception("Role ไม่ถูกต้อง ไม่สามารถระบุตารางข้อมูลได้");
    }

    $stmt = $db->prepare("SELECT $id_column FROM $table WHERE $id_column = :id");
    $stmt->execute([':id' => $username]);

    if (!$stmt->fetch()) {
        recordAuthRateLimitFailure('register', $username, 900);
        throw new Exception("ไม่พบรายชื่อรหัส $username ในฐานข้อมูลของ $table");
    }

    $password_hash = hashAuthPassword((string)$password_raw);

    $sql_insert = "INSERT INTO users (username, password_hash, role_id) VALUES (:username, :password, :role)";
    $stmt_insert = $db->prepare($sql_insert);
    $stmt_insert->execute([
        ':username' => $username,
        ':password' => $password_hash,
        ':role'     => $role,
    ]);

    $new_user_id = $db->lastInsertId();
    $actor_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : $new_user_id;
    $ip_address = authClientIp();

    $log_sql = "INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
                VALUES (:uid, 'create', 'ผู้ใช้', :details, :ip)";
    $db->prepare($log_sql)->execute([
        ':uid' => $actor_id,
        ':details' => "สร้างบัญชีผู้ใช้ใหม่ (Username: " . $username . ")",
        ':ip' => $ip_address,
    ]);

    clearAuthRateLimit('register', $username);
    echo json_encode(["status" => "success", "message" => "ลงทะเบียนสำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
