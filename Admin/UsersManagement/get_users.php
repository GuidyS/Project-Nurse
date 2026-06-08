<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "
            SELECT 
                u.user_id as id, u.email, u.username, r.role_name,
                f.first_name_th as f_fname, f.last_name_th as f_lname, f.administrative_position as teacherSubRole,
                s.first_name_th as s_fname, s.last_name_th as s_lname,
                u.is_active, u.created_at
            FROM users u
            JOIN role r ON u.role_id = r.role_id
            LEFT JOIN faculty f ON u.user_id = f.user_id
            LEFT JOIN student s ON u.user_id = s.user_id
            ORDER BY u.created_at DESC
        ";
        
        $stmt = $pdo->query($sql);
        $users = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $fullName = $row['username']; 
            if (!empty($row['f_fname'])) $fullName = $row['f_fname'] . ' ' . $row['f_lname'];
            elseif (!empty($row['s_fname'])) $fullName = $row['s_fname'] . ' ' . $row['s_lname'];

            $role_lower = strtolower($row['role_name']);
            if (!in_array($role_lower, ['admin', 'teacher', 'student'])) $role_lower = 'student';

            $date = new DateTime($row['created_at']);
            $year_th = (int)$date->format('Y') + 543;
            $createdAtStr = $year_th . '-' . $date->format('m-d');

            $users[] = [
                "id" => (string)$row['id'],
                "email" => $row['email'] ?: ($row['username'] . "@faculty.edu"),
                "fullName" => $fullName,
                "role" => $role_lower,
                "teacherSubRole" => $row['teacherSubRole'],
                "status" => $row['is_active'] == 1 ? "active" : "inactive",
                "createdAt" => $createdAtStr
            ];
        }
        echo json_encode($users);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Method"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>