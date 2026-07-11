<?php
// รายละเอียดนักศึกษารายบุคคล (สำหรับหน้า StudentsInfo ฝั่งอาจารย์)
if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$sid = $_GET['student_id'] ?? null;

try {
    if (!$sid) {
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสนักศึกษา"]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM student WHERE student_id = ? OR student_code = ? LIMIT 1");
    $stmt->execute([$sid, $sid]);
    $s = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$s) {
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษา"]);
        exit();
    }

    // วิชาที่ลงทะเบียน + เกรด
    $en = $pdo->prepare("SELECT sub.subject_code, sub.subject_name_th, e.academic_year, e.semester, e.grade
                         FROM enrollment e JOIN subject sub ON e.subject_id = sub.subject_id
                         WHERE e.student_id = ? ORDER BY e.academic_year DESC, e.semester DESC");
    $en->execute([$s['student_id']]);
    $enrollments = $en->fetchAll(PDO::FETCH_ASSOC);

    // อาจารย์ที่ปรึกษา
    $ad = $pdo->prepare("SELECT CONCAT(IFNULL(f.title,''), f.first_name_th, ' ', f.last_name_th) AS advisor_name
                         FROM student_advisor_mapping sam JOIN faculty f ON sam.faculty_id = f.faculty_id
                         WHERE sam.student_id = ? LIMIT 1");
    $ad->execute([$s['student_id']]);
    $advisor = $ad->fetchColumn();

    $detail = [
        "studentId"   => (strpos((string)$s['student_code'], 'TEMP-') === 0) ? (string)$s['student_id'] : $s['student_code'],
        "name"        => trim(($s['title'] ?? '') . $s['first_name_th'] . ' ' . $s['last_name_th']),
        "nameEn"      => trim(($s['first_name_en'] ?? '') . ' ' . ($s['last_name_en'] ?? '')),
        "nickname"    => $s['nickname'],
        "gender"      => $s['gender'],
        "birthDate"   => $s['birth_date'],
        "yearLevel"   => (int)($s['year_level'] ?? 1),
        "admissionYear" => (int)$s['admission_year'],
        "gpa"         => (float)($s['gpa'] ?? 0),
        "status"      => $s['status'] ?? 'กำลังศึกษา',
        "email"       => $s['email'],
        "phone"       => $s['phone'],
        "homeAddress" => $s['home_address'],
        "hometown"    => $s['hometown_province'],
        "height"      => $s['height'] ? (float)$s['height'] : null,
        "weight"      => $s['weight'] ? (float)$s['weight'] : null,
        "bmi"         => $s['bmi'] ? (float)$s['bmi'] : null,
        "advisor"     => $advisor ?: '-',
        "scores"      => [
            "skill"         => (float)($s['skill_score'] ?? 0),
            "attitude"      => (float)($s['attitude_score'] ?? 0),
            "knowledge"     => (float)($s['knowledge_score'] ?? 0),
            "communication" => (float)($s['comm_score'] ?? 0),
            "overall"       => (float)($s['overall_score'] ?? 0),
        ],
        "enrollments" => $enrollments,
    ];

    echo json_encode(["status" => "success", "data" => $detail], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
