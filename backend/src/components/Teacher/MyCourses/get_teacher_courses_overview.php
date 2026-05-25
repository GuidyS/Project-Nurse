<?php

require_once '/middlewares/auth_middleware.php'; 
$user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. หา faculty_id ของอาจารย์ที่ล็อกอิน
    $stmt_fac = $pdo->prepare("SELECT faculty_id FROM faculty WHERE user_id = ? LIMIT 1");
    $stmt_fac->execute([$user_id]);
    $my_faculty_id = $stmt_fac->fetchColumn();

    if (!$my_faculty_id) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 2. ดึง JSON หลักสูตรเพื่อหาวิชาที่ตนเองสอน และจำนวน CLO
    $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

    $my_courses_data = []; // เก็บ รหัสวิชา => จำนวน CLO
    if (isset($mappingData['subject_mappings'])) {
        foreach ($mappingData['subject_mappings'] as $code => $data) {
            if (isset($data['instructor_id']) && $data['instructor_id'] == $my_faculty_id) {
                $my_courses_data[$code] = count($data['clos'] ?? []);
            }
        }
    }

    if (empty($my_courses_data)) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 3. ดึงข้อมูลวิชา และคำนวณ Progress
    $course_codes = array_keys($my_courses_data);
    $inQuery = implode(',', array_fill(0, count($course_codes), '?'));
    $sql = "SELECT subject_id as id, subject_code as code, subject_name_th as name, credit as credits, semester 
            FROM subject WHERE subject_code IN ($inQuery) AND is_active = 1";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($course_codes);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [];
    foreach ($courses as $c) {
        $sub_id = $c['id'];
        $sub_code = $c['code'];
        $clo_count = $my_courses_data[$sub_code]; // จำนวน CLO ของวิชานี้

        // นับจำนวนเด็ก
        $stmt_std = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE subject_id = ?");
        $stmt_std->execute([$sub_id]);
        $student_count = (int)$stmt_std->fetchColumn();

        // คำนวณ Progress
        $expected_total = $student_count * $clo_count;
        $actual_graded = 0;

        if ($expected_total > 0) {
            // ดึงก้อน JSON ที่อาจารย์เคยให้คะแนนไว้มานับ
            $stmt_scores = $pdo->prepare("SELECT clo_scores FROM assessments WHERE subject_id = ? AND clo_scores IS NOT NULL");
            $stmt_scores->execute([$sub_id]);
            
            while ($row = $stmt_scores->fetch(PDO::FETCH_ASSOC)) {
                $scores = json_decode($row['clo_scores'], true);
                if (is_array($scores)) {
                    $actual_graded += count($scores); // นับว่าให้คะแนนไปกี่ช่องแล้ว
                }
            }
        }

        $progress = $expected_total > 0 ? round(($actual_graded / $expected_total) * 100) : 0;
        if ($progress > 100) $progress = 100; // กันเกิน 100%

        $results[] = [
            "id" => $sub_id,
            "code" => $sub_code,
            "name" => $c['name'],
            "students" => $student_count,
            "credits" => (int)$c['credits'],
            "semester" => (string)$c['semester'],
            "cloProgress" => $progress,
            "status" => 'active'
        ];
    }

    echo json_encode(["status" => "success", "data" => $results]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>