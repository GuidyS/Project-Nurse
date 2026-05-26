<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. หา faculty_id ของคนที่ล็อกอินอยู่
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $faculty = $stmt_fac->fetch(PDO::FETCH_ASSOC);
    
    if (!$faculty) {
        echo json_encode(["status" => "success", "data" => []]); // ถ้าไม่ใช่ faculty ก็ไม่มีวิชาสอน
        exit();
    }
    $my_faculty_id = $faculty['faculty_id'];

    // 2. ดึงโครงสร้างหลักสูตร (JSON) มาหาว่าสอนวิชาไหนบ้าง
    $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

    $my_subject_codes = [];
    if (isset($mappingData['subject_mappings'])) {
        foreach ($mappingData['subject_mappings'] as $code => $data) {
            if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                $my_subject_codes[] = $code;
            }
        }
    }

    if (empty($my_subject_codes)) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }

    // 3. ดึงรายละเอียดวิชา และ จำนวนนักศึกษาที่ลงทะเบียน (ตาราง enrollments)
    $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
    $sql = "SELECT s.subject_id as id, s.subject_code as code, s.subject_name_th as name, s.credit as credits, s.semester,
            (SELECT COUNT(*) FROM enrollments e WHERE e.subject_id = s.subject_id) as students
            FROM subjects s WHERE s.subject_code IN ($inQuery) AND s.is_active = 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($my_subject_codes);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ใส่จำนวน CLO เข้าไป
    foreach ($courses as &$course) {
        $course['cloCount'] = count($mappingData['subject_mappings'][$course['code']]['clos'] ?? []);
        $course['section'] = '01'; // Default
    }

    echo json_encode(["status" => "success", "data" => $courses]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>