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
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$subject_id) {
        echo json_encode(["status" => "error", "message" => "Missing subject_id"]); exit();
    }

    // 1. หารหัสวิชา (subject_code) จาก subject_id เพื่อเอาไปค้นหา CLO ใน JSON หลักสูตร
    $stmt_sub = $pdo->prepare("SELECT subject_code FROM subjects WHERE subject_id = ? LIMIT 1");
    $stmt_sub->execute([$subject_id]);
    $subject_code = $stmt_sub->fetchColumn();

    // 2. ดึงรายการ CLO ของวิชานี้จาก curriculum_framework
    $clo_headers = [];
    $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    if ($row_fw) {
        $mapping_data = json_decode($row_fw['mapping_json'], true);
        $subject_clos = $mapping_data['subject_mappings'][$subject_code]['clos'] ?? [];
        foreach ($subject_clos as $clo) {
            // เก็บเฉพาะรหัส CLO เช่น CLO1, CLO2 ไว้ส่งให้ React ไปสร้างหัวตาราง
            $clo_headers[] = $clo['id'] ?? $clo['code'] ?? $clo['clo_id']; 
        }
    }

    // 3. ดึงรายชื่อนักศึกษา (enrollments) และคะแนนที่เคยให้ไว้ (assessments)
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_code as studentId, 
            CONCAT(s.first_name_th, ' ', s.last_name_th) as name,
            a.clo_scores
        FROM enrollments e
        JOIN student s ON e.student_id = s.student_id
        LEFT JOIN assessments a ON e.student_id = a.student_id AND a.subject_id = e.subject_id
        WHERE e.subject_id = ?
        ORDER BY s.student_code ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        // แปลง JSON clo_scores จาก DB ให้เป็น Array
        $scores = $st['clo_scores'] ? json_decode($st['clo_scores'], true) : [];
        
        // คำนวณคะแนนรวม (Overall) เบื้องต้น
        $overall = 0;
        $count = count($clo_headers);
        if ($count > 0 && !empty($scores)) {
            $total = 0;
            foreach ($clo_headers as $h) {
                $total += (float)($scores[$h] ?? 0);
            }
            $overall = round($total / $count, 2); // หารเฉลี่ย
        }

        // สถานะเบื้องต้น (ถ้าคะแนนรวม >= 50 ให้ผ่าน)
        $status = ($overall >= 50) ? 'passed' : ($overall > 0 ? 'warning' : 'pending');

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "scores" => (object)$scores, // ส่งเป็น Object เพื่อให้เข้าถึงด้วย key ได้เช่น scores.CLO1
            "overall" => $overall,
            "status" => $status
        ];
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "headers" => $clo_headers,
            "students" => $students
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>