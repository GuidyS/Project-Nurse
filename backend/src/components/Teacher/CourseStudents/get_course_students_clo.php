<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
$subject_id = $_GET['subject_id'] ?? null;

try {
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
    }

    $db = new Connect();

    // ค้นหา faculty_id ของอาจารย์จากเซสชันล็อกอิน
    $stmt_fac = $db->prepare("SELECT faculty_id FROM faculty WHERE faculty_id = (SELECT username FROM users WHERE user_id = ?) LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    // 💡 [กรณีที่ 1] ไม่ได้ส่ง subject_id มา -> ให้คิวรีรายวิชาทั้งหมดที่อาจารย์คนนี้รับผิดชอบก่อน
    if (!$subject_id) {
        $stmt_fw = $db->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
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
            echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => [], "clo_headers" => []]]);
            exit();
        }

        $inQuery = implode(',', array_fill(0, count($my_subject_codes), '?'));
        $sql_subject = "SELECT subject_id as id, subject_code as code, subject_name_th as name FROM subject WHERE subject_code IN ($inQuery) AND is_active = 1";
        $stmt_subject = $db->prepare($sql_subject);
        $stmt_subject->execute($my_subject_codes);
        $courses = $stmt_subject->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => ["courses" => $courses, "students" => [], "clo_headers" => []]]);
        exit();
    }

    // 💡 [กรณีที่ 2] ส่ง subject_id มา -> โหลดหัวตาราง CLO ไดนามิก และรายชื่อนักศึกษา
    $stmt_subject = $db->prepare("SELECT subject_code FROM subject WHERE subject_id = ? LIMIT 1");
    $stmt_subject->execute([$subject_id]);
    $subject_code = $stmt_subject->fetchColumn();

    $clo_headers = [];
    $stmt_fw = $db->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    if ($row_fw && !empty($row_fw['mapping_json'])) {
        $data = json_decode($row_fw['mapping_json'], true);
        $subject_clos = $data['subject_mappings'][$subject_code]['clos'] ?? [];
        foreach ($subject_clos as $clo) {
            $clo_headers[] = $clo['id'] ?? $clo['code'] ?? $clo['clo_id']; 
        }
    }

    // หากวิชานั้นไม่มี CLO ระบุไว้ในแผนการสอนหลักสูตร ให้มีค่า Default เป็นสากล
    if (empty($clo_headers)) {
        $clo_headers = ['CLO1', 'CLO2', 'CLO3', 'CLO4'];
    }

    // ดึงเด็กที่ลงทะเบียนวิชานี้จริงจากตารางลงทะเบียน
    $sql = "
        SELECT 
            s.student_id as id, 
            s.student_id as studentId, 
            CONCAT(s.title, s.first_name_th, ' ', s.last_name_th) as name
        FROM enrollment e
        JOIN student s ON e.student_id = s.student_id
        WHERE e.subject_id = ?
        ORDER BY s.student_id ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$subject_id]);
    $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($students_raw as $st) {
        // อ่านคะแนน CLO จริงจากตาราง student_clo_scores (ค่าเริ่มต้น 0 ถ้ายังไม่เคยให้คะแนน)
        $scores = [];
        foreach ($clo_headers as $h) { $scores[$h] = 0; }

        $sc = $db->prepare("SELECT clo_key, score FROM student_clo_scores WHERE subject_id = ? AND student_id = ?");
        $sc->execute([$subject_id, $st['id']]);
        foreach ($sc->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $scores[$row['clo_key']] = (int)$row['score'];
        }

        $vals = array_values($scores);
        $overall = count($vals) > 0 ? round(array_sum($vals) / count($vals)) : 0;
        // ยังไม่เคยให้คะแนนเลย = รอดำเนินการ / เกณฑ์ผ่านที่ร้อยละ 70
        $status = (count(array_filter($vals)) === 0) ? 'pending' : (($overall >= 70) ? 'passed' : 'failed');

        $students[] = [
            "id" => $st['id'],
            "studentId" => $st['studentId'],
            "name" => $st['name'],
            "scores" => (object)$scores, 
            "overall" => $overall,
            "status" => $status
        ];
    }

    echo json_encode(["status" => "success", "data" => ["courses" => [], "students" => $students, "clo_headers" => $clo_headers]]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>