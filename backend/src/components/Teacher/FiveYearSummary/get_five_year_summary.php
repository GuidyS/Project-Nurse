<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();

    // 1. กำหนดช่วงปี 5 ปีล่าสุด (สมมติปีปัจจุบัน)
    $current_year = date('Y') + 543;
    $years = [$current_year-4, $current_year-3, $current_year-2, $current_year-1, $current_year];

    // โครงสร้างสำหรับเก็บผลลัพธ์
    $results = [];
    foreach ($years as $y) {
        $results[$y] = [
            'year' => (string)$y,
            'graduates' => 0,
            'employmentRate' => 0, 
            'avgGPA' => 0,
            'plo1' => 0, 'plo2' => 0, 'plo3' => 0, 'plo4' => 0, 'plo5' => 0,
            '_gpa_sum' => 0, '_gpa_count' => 0,
            '_plo_sums' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
            '_plo_counts' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
        ];
    }

    // 2. คำนวณจำนวนบัณฑิตในแต่ละปี (ดูจากรหัสนักศึกษา 2 ตัวแรก + 4 ปีหลักสูตร)
    $stmt_grad = $db->query("SELECT student_id FROM student WHERE status = 'Graduated'");
    while ($row = $stmt_grad->fetch(PDO::FETCH_ASSOC)) {
        $prefix = substr((string)$row['student_id'], 0, 2);
        if (is_numeric($prefix)) {
            $grad_year = 2500 + (int)$prefix + 4; // เช่น รหัส 66 -> 2566 + 4 = 2570
            if (isset($results[$grad_year])) {
                $results[$grad_year]['graduates']++;
            }
        }
    }

    // 3. ดึงรายวิชาที่มีในระบบทั้งหมด
    $stmt_subs = $db->query("SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1");
    $subjects = $stmt_subs->fetchAll(PDO::FETCH_ASSOC);

    $courses_data = [];
    foreach ($subjects as $sub) {
        $code = $sub['subject_code'];
        $courses_data[$code] = [
            'code' => $code,
            'name' => $sub['subject_name_th'],
            'grades' => []
        ];
        foreach ($years as $y) {
            $courses_data[$code]['grades'][$y] = [
                'sum' => 0,
                'count' => 0
            ];
        }
    }

    // 4. ดึงข้อมูลเกรดทั้งหมดจากตาราง enrollment 
    $stmt_assess = $db->query("
        SELECT 
            e.academic_year, 
            e.grade, 
            s.subject_code 
        FROM enrollment e 
        JOIN subject s ON e.subject_id = s.subject_id
    ");
    
    // แปลงเกรดตัวอักษรเป็นตัวเลข
    $grade_points = ['A'=>4.0, 'B+'=>3.5, 'B'=>3.0, 'C+'=>2.5, 'C'=>2.0, 'D+'=>1.5, 'D'=>1.0, 'F'=>0];

    while ($row = $stmt_assess->fetch(PDO::FETCH_ASSOC)) {
        $y = (int)$row['academic_year'];
        
        if (isset($results[$y])) {
            $g = $row['grade'];
            if (isset($grade_points[$g])) {
                $results[$y]['_gpa_sum'] += $grade_points[$g];
                $results[$y]['_gpa_count']++;
            }
        }

        $code = $row['subject_code'];
        if (isset($courses_data[$code]) && in_array($y, $years)) {
            $g = $row['grade'];
            if (isset($grade_points[$g])) {
                $courses_data[$code]['grades'][$y]['sum'] += $grade_points[$g];
                $courses_data[$code]['grades'][$y]['count']++;
            }
        }
    }

    // 5. สรุปผลสถิติรายปี
    $final_data = [];
    foreach ($years as $y) {
        $r = $results[$y];
        
        if ($r['_gpa_count'] > 0) {
            $r['avgGPA'] = round($r['_gpa_sum'] / $r['_gpa_count'], 2);
        } else {
            $r['avgGPA'] = 0.00;
        }

        $r['employmentRate'] = 0; // ไม่มีฟิลด์นี้ในระบบให้ตั้งเป็น 0

        foreach (['plo1', 'plo2', 'plo3', 'plo4', 'plo5'] as $plo_key) {
            $r[$plo_key] = 0; // ตัดการคำนวณ PLO เพราะตารางถูกลบไปแล้ว
        }

        unset($r['_gpa_sum'], $r['_gpa_count'], $r['_plo_sums'], $r['_plo_counts']);
        $final_data[] = $r;
    }

    // 6. สรุปผลเกรดเฉลี่ยรายวิชาย้อนหลัง 5 ปี
    $final_courses = [];
    foreach ($courses_data as $code => $c) {
        $formatted = [
            'code' => $c['code'],
            'name' => $c['name']
        ];
        
        $prev_avg = null;
        $trend = 'stable';
        
        foreach ($years as $y) {
            $sum = $c['grades'][$y]['sum'];
            $count = $c['grades'][$y]['count'];
            
            $avg = ($count > 0) ? round($sum / $count, 2) : 0.00;
            $formatted['y' . $y] = $avg;
            
            if ($prev_avg !== null && $prev_avg > 0) {
                if ($avg > $prev_avg) $trend = 'up';
                else if ($avg < $prev_avg) $trend = 'down';
                else $trend = 'stable';
            }
            $prev_avg = $avg;
        }
        $formatted['trend'] = $trend;
        $final_courses[] = $formatted;
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "yearlyData" => $final_data,
            "courseData" => $final_courses
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>