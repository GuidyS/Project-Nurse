<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

$targetStudentId = $_GET['student_id'] ?? null;
if (!$targetStudentId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสนักศึกษา"], JSON_UNESCAPED_UNICODE);
    exit;
}

$db = new Connect;

try {
    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // อาจารย์ที่ปรึกษา (role_id=2) ต้องเช็คว่านักศึกษาคนนี้อยู่ในความดูแลจริง (Admin role_id=1 ดูได้ทุกคน)
    if ((int)$user['role_id'] === 2) {
        $checkStmt = $db->prepare("
            SELECT 1 FROM student_advisor_mapping 
            WHERE faculty_id = :fid AND student_id = :sid
        ");
        $checkStmt->execute([':fid' => $user['username'], ':sid' => $targetStudentId]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "คุณไม่มีสิทธิ์ดูข้อมูลนักศึกษาคนนี้"], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 🔍 JOIN กับตาราง faculty เพื่อดึงชื่อ-นามสกุลอาจารย์ (advisor_name)
    $query = "
        SELECT v.*, 
               COALESCE(CONCAT(f.first_name_th, ' ', f.last_name_th), f.first_name_th, v.advisor_id, '') AS advisor_name
        FROM student_vaccinations v
        LEFT JOIN faculty f ON v.advisor_id = f.faculty_id
        WHERE v.student_id = :sid
        ORDER BY v.sequence_no ASC, v.dose_no ASC
    ";
    $stmt2 = $db->prepare($query);
    $stmt2->execute([':sid' => $targetStudentId]);
    $rows = $stmt2->fetchAll(PDO::FETCH_ASSOC) ?: [];

    echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}