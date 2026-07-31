<?php
// ไม่ต้องประกาศ Header ซ้ำเพราะ index.php จัดการให้แล้ว
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/password_helpers.php';

configureAuthSessionCookie();
session_start();

try {
    $db = new Connect();

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $username = isset($data['username']) ? trim($data['username']) : '';
    $password = isset($data['password']) ? (string)$data['password'] : '';

    if ($username === '' || $password === '') {
        echo json_encode([
            "status" => "error",
            "message" => "กรุณากรอกข้อมูลให้ครบถ้วน",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $rate = checkAuthRateLimit('login', $username, 5, 900);
    if (!$rate['allowed']) {
        http_response_code(429);
        echo json_encode([
            "status" => "error",
            "message" => "พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ในอีก " . ceil($rate['retry_after'] / 60) . " นาที",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

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
        clearAuthRateLimit('login', $username);

        // Upgrade legacy bcrypt (or weaker) hashes to Argon2id after successful login
        if (authPasswordNeedsRehash($user['password_hash'])) {
            $newHash = hashAuthPassword($password);
            $rehash = $db->prepare("UPDATE users SET password_hash = :hash WHERE user_id = :uid");
            $rehash->execute([
                ':hash' => $newHash,
                ':uid' => $user['user_id'],
            ]);
            $user['password_hash'] = $newHash;
        }

        $nameParts = ($user['role_id'] == 3)
            ? [$user['s_title'] ?? '', $user['s_fname'] ?? '', $user['s_lname'] ?? '']
            : [$user['f_title'] ?? '', $user['f_fname'] ?? '', $user['f_lname'] ?? ''];
        $name = trim(implode(' ', array_filter($nameParts, fn($part) => trim((string)$part) !== '')));
        if ($name === '') {
            $name = $user['username'];
        }

        $perm_sql = "SELECT DISTINCT p.permission_name
                    FROM permissions p
                    JOIN position_permission pp ON p.permission_id = pp.permission_id
                    JOIN user_position up ON pp.position_id = up.position_id
                    WHERE up.user_id = :user_id";

        $perm_stmt = $db->prepare($perm_sql);
        $perm_stmt->execute([
            ':user_id' => $user['user_id'],
        ]);

        $permissions = $perm_stmt->fetchAll(PDO::FETCH_COLUMN);

        // Fallback: ผู้ใช้ที่ยังไม่ถูกกำหนดตำแหน่งใน user_position จะได้สิทธิ์ว่าง
        // ทำให้เมนู/ปุ่มหายทั้งหมด -> ใช้สิทธิ์ของตำแหน่งที่ตรงกับ role แทน (อ่านอย่างเดียว ไม่แก้ข้อมูล)
        if (empty($permissions)) {
            $roleToPosition = [3 => 'นักศึกษา', 2 => 'อาจารย์ประจำ', 1 => 'เลขา'];
            $roleId = (int)$user['role_id'];
            if (isset($roleToPosition[$roleId])) {
                $fallback_stmt = $db->prepare(
                    "SELECT DISTINCT p.permission_name
                     FROM permissions p
                     JOIN position_permission pp ON p.permission_id = pp.permission_id
                     JOIN position pos ON pos.position_id = pp.position_id
                     WHERE pos.position_name = :position_name"
                );
                $fallback_stmt->execute([':position_name' => $roleToPosition[$roleId]]);
                $permissions = $fallback_stmt->fetchAll(PDO::FETCH_COLUMN);
            }
        }

        session_regenerate_id(true);
        $_SESSION['permissions'] = $permissions;
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];

        $ip_address = authClientIp();
        $log_sql = "INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
                    VALUES (:uid, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', :ip)";
        $db->prepare($log_sql)->execute([
            ':uid' => $user['user_id'],
            ':ip' => $ip_address,
        ]);

        echo json_encode([
            "status" => "success",
            "user" => [
                "user_id" => (int)$user['user_id'],
                "username" => $user['username'],
                "name" => $name,
                "title" => ($user['role_id'] == 3) ? ($user['s_title'] ?? '') : ($user['f_title'] ?? ''),
                "first_name_th" => ($user['role_id'] == 3) ? ($user['s_fname'] ?? '') : ($user['f_fname'] ?? ''),
                "last_name_th" => ($user['role_id'] == 3) ? ($user['s_lname'] ?? '') : ($user['f_lname'] ?? ''),
                "role_id" => (int)$user['role_id'],
                "position_id" => (int)($user['main_position_id'] ?? 0),
                "permissions" => $permissions,
            ],
        ], JSON_UNESCAPED_UNICODE);
    } else {
        recordAuthRateLimitFailure('login', $username, 900);
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
