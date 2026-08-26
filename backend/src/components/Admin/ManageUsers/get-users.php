<?php
require_once __DIR__ . '/../../../config/config.php';
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    $db = new Connect();

    // เฉพาะ admin (role_id = 1) เท่านั้น — กันข้อมูลผู้ใช้รั่วไป role อื่น
    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้"], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // ดึงข้อมูลผู้ใช้ พร้อมชื่อจากตาราง faculty หรือ student และตำแหน่งปัจจุบัน
    $sql = "SELECT u.user_id as id, u.username, u.role_id, u.created_at,
                   COALESCE(u.status, 'active') as status,
                   s.first_name_th as s_fname, s.last_name_th as s_lname,
                   f.first_name_th as f_fname, f.last_name_th as f_lname,
                   up.position_id
            FROM users u
            LEFT JOIN student s ON u.username = s.student_id
            LEFT JOIN faculty f ON u.username = f.faculty_id
            LEFT JOIN user_position up ON u.user_id = up.user_id AND up.is_primary = 1
            ORDER BY u.created_at DESC";
            
    $stmt = $db->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach($users as $u) {
        $roleId = $u['role_id'];

        // แมป Role ID ให้ตรงกับหน้าเว็บ (null = รอจัดบทบาท)
        $roleStr = 'unassigned';
        if ($roleId !== null && $roleId !== '') {
            if ((int)$roleId === 1) $roleStr = 'admin';
            elseif ((int)$roleId === 2) $roleStr = 'teacher';
            elseif ((int)$roleId === 3) $roleStr = 'student';
        }

        // ชื่อจาก faculty หรือ student โดยไม่ผูกกับ role
        $studentName = trim(($u['s_fname'] ?? '') . ' ' . ($u['s_lname'] ?? ''));
        $facultyName = trim(($u['f_fname'] ?? '') . ' ' . ($u['f_lname'] ?? ''));
        $fullName = $studentName !== '' ? $studentName : $facultyName;

        // แมป SubRole สำหรับหน้า RolesManagement
        $subRoleMap = [
            1 => 'dean', 2 => 'instructor', 3 => 'advisor', 
            4 => 'practical_instructor', 5 => 'program_manager', 6 => 'project_manager', 9 => 'research'
        ];
        $teacherSubRole = isset($subRoleMap[$u['position_id']]) ? $subRoleMap[$u['position_id']] : null;

        $result[] = [
            'id' => (string)$u['id'],
            'email' => $u['username'], // ใช้ username แทนอีเมลชั่วคราว
            'fullName' => $fullName !== '' ? $fullName : 'ไม่ระบุชื่อ',
            'role' => $roleStr,
            'teacherSubRole' => $teacherSubRole,
            'status' => ($u['status'] === 'inactive') ? 'inactive' : 'active',
            'createdAt' => date('Y-m-d', strtotime($u['created_at']))
        ];
    }

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
