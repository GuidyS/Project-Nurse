<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงรายชื่ออาจารย์ทั้งหมดมาทำ Lookup (จับคู่ ID กับ ชื่อ)
    $sql_faculty = "SELECT faculty_id as id, CONCAT(IFNULL(prefix,''), first_name_th, ' ', last_name_th) as name FROM faculty";
    $stmt_faculty = $pdo->query($sql_faculty);
    $faculties = $stmt_faculty->fetchAll(PDO::FETCH_ASSOC);
    
    $facultyMap = [];
    foreach ($faculties as $f) {
        $facultyMap[$f['id']] = $f['name'];
    }

    // 2. ดึงจำนวนนักศึกษาที่ลงทะเบียนแต่ละวิชา (จากตาราง enrollments)
    $sql_enroll = "SELECT subject_id, COUNT(*) as std_count FROM enrollments GROUP BY subject_id";
    $stmt_enroll = $pdo->query($sql_enroll);
    $enrollments = [];
    while ($row = $stmt_enroll->fetch(PDO::FETCH_ASSOC)) {
        $enrollments[$row['subject_id']] = $row['std_count'];
    }

    // 3. ดึงก้อน JSON กลาง เพื่อดูว่าใครสอนวิชาไหนบ้าง
    $sql_framework = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt_fw = $pdo->query($sql_framework);
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

    // นับว่าอาจารย์แต่ละคนสอนกี่วิชา (เพื่อนับยอดใน Dropdown)
    $instructorCourseCounts = [];
    if (isset($mappingData['subject_mappings'])) {
        foreach ($mappingData['subject_mappings'] as $subjCode => $data) {
            if (!empty($data['instructor_id'])) {
                $fid = $data['instructor_id'];
                $instructorCourseCounts[$fid] = ($instructorCourseCounts[$fid] ?? 0) + 1;
            }
        }
    }

    // 4. ดึงรายวิชาทั้งหมดมาประกอบร่างกับข้อมูลด้านบน
    // หมายเหตุ: อิงตาม SQL Dump ตารางชื่อ `subject` (ไม่มี s)
    $sql_subject = "SELECT subject_id, subject_code, subject_name_th, credit, semester FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt_subject = $pdo->query($sql_subject);
    $subjects = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

    $courseList = [];
    foreach ($subjects as $s) {
        $code = $s['subject_code'];
        // ไปดูใน JSON ว่าวิชานี้ใครสอน
        $instructorId = $mappingData['subject_mappings'][$code]['instructor_id'] ?? null;
        $instructorName = $instructorId ? ($facultyMap[$instructorId] ?? 'ไม่ทราบชื่ออาจารย์') : null;

        $courseList[] = [
            "id" => $code, // ใช้รหัสวิชาเป็น ID สะดวกกว่าเวลาบันทึกลง JSON
            "code" => $code,
            "name" => $s['subject_name_th'],
            "credits" => (int)$s['credit'],
            "students" => $enrollments[$s['subject_id']] ?? 0,
            "semester" => (string)$s['semester'],
            "instructor_id" => (string)$instructorId,
            "instructor" => $instructorName
        ];
    }

    // จัด Format รายชื่ออาจารย์ส่งให้ Frontend
    $instructorList = [];
    foreach ($faculties as $f) {
        $instructorList[] = [
            "id" => (string)$f['id'],
            "name" => $f['name'],
            "courses_count" => $instructorCourseCounts[$f['id']] ?? 0
        ];
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "courses" => $courseList,
            "instructors" => $instructorList
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>