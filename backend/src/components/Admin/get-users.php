<?php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    
    // ดึงข้อมูลผู้ใช้ พร้อมชื่อจากตาราง faculty หรือ student และตำแหน่งปัจจุบัน
    $sql = "SELECT u.user_id as id, u.username, u.role_id, u.created_at,
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
        // แมป Role ID ให้ตรงกับหน้าเว็บ
        $roleStr = 'student';
        if ($u['role_id'] == 1) $roleStr = 'admin';
        if ($u['role_id'] == 2) $roleStr = 'teacher';

        // กำหนดชื่อ
        $fullName = ($u['role_id'] == 3) 
            ? trim($u['s_fname'].' '.$u['s_lname']) 
            : trim($u['f_fname'].' '.$u['f_lname']);

        // แมป SubRole สำหรับหน้า RolesManagement
        $subRoleMap = [
            1 => 'dean', 2 => 'instructor', 3 => 'advisor', 
            4 => 'practical_instructor', 5 => 'program_manager', 6 => 'project_manager'
        ];
        $teacherSubRole = isset($subRoleMap[$u['position_id']]) ? $subRoleMap[$u['position_id']] : null;

        $result[] = [
            'id' => (string)$u['id'],
            'email' => $u['username'], // ใช้ username แทนอีเมลชั่วคราว
            'fullName' => $fullName ?: 'ไม่ระบุชื่อ',
            'role' => $roleStr,
            'teacherSubRole' => $teacherSubRole,
            'status' => 'active', // ค่าเริ่มต้น เพราะใน DB ยังไม่มีคอลัมน์ status ในตาราง users
            'createdAt' => date('Y-m-d', strtotime($u['created_at']))
        ];
    }

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}