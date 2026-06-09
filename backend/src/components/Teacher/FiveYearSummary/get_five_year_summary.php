<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. กำหนดช่วงปี 5 ปีล่าสุด (สมมติปีปัจจุบันคือ 2566)
    $current_year = date('Y') + 543;
    // ถ้าอยากดึงย้อนหลัง 5 ปีจาก 2566 ก็จะเป็น 2562 - 2566
    $years = [$current_year-4, $current_year-3, $current_year-2, $current_year-1, $current_year];

    // โครงสร้างสำหรับเก็บผลลัพธ์
    $results = [];
    foreach ($years as $y) {
        $results[$y] = [
            'year' => (string)$y,
            'graduates' => 0,
            'employmentRate' => 0, // ตั้งค่าเริ่มต้นเป็น 0 (ไม่มีการสุ่มสถิติการมีงานทำย้อนหลัง)
            'avgGPA' => 0,
            'plo1' => 0, 'plo2' => 0, 'plo3' => 0, 'plo4' => 0, 'plo5' => 0,
            '_gpa_sum' => 0, '_gpa_count' => 0,
            '_plo_sums' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
            '_plo_counts' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
        ];
    }

    // 2. คำนวณจำนวนบัณฑิตในแต่ละปี (ดูจากรหัสนักศึกษา 2 ตัวแรก + 4 ปีหลักสูตร)
    $stmt_grad = $pdo->query("SELECT student_id FROM student WHERE status = 'Graduated'");
    while ($row = $stmt_grad->fetch(PDO::FETCH_ASSOC)) {
        $prefix = substr((string)$row['student_id'], 0, 2);
        if (is_numeric($prefix)) {
            $grad_year = 2500 + (int)$prefix + 4; // เช่น รหัส 62 -> 2562 + 4 = เรียนจบปี 2566
            if (isset($results[$grad_year])) {
                $results[$grad_year]['graduates']++;
            }
        }
    }

    // 3. ดึงรายวิชาที่มีในระบบทั้งหมดก่อน
    $stmt_subs = $pdo->query("SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1");
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
    $stmt_assess = $pdo->query("
        SELECT 
            e.academic_year, 
            e.grade, 
            s.subject_code 
        FROM enrollment e 
        JOIN subject s ON e.subject_id = s.subject_id
    ");
    
    // แปลงเกรดตัวอักษรเป็นตัวเลขเพื่อหาค่าเฉลี่ย
    $grade_points = ['A'=>4.0, 'B+'=>3.5, 'B'=>3.0, 'C+'=>2.5, 'C'=>2.0, 'D+'=>1.5, 'D'=>1.0, 'F'=>0];

    while ($row = $stmt_assess->fetch(PDO::FETCH_ASSOC)) {
        $y = (int)$row['academic_year'];
        
        // คำนวณสะสมระดับหลักสูตรรายปี
        if (isset($results[$y])) {
            $g = $row['grade'];
            if (isset($grade_points[$g])) {
                $results[$y]['_gpa_sum'] += $grade_points[$g];
                $results[$y]['_gpa_count']++;
            }
        }

        // คำนวณสะสมระดับรายวิชา
        $code = $row['subject_code'];
        if (isset($courses_data[$code]) && in_array($y, $years)) {
            $g = $row['grade'];
            if (isset($grade_points[$g])) {
                $courses_data[$code]['grades'][$y]['sum'] += $grade_points[$g];
                $courses_data[$code]['grades'][$y]['count']++;
            }
        }
    }

    // 5. สรุปผลสถิติรายปีจากข้อมูลจริงในระบบ (แสดงผลเป็น 0 หากยังไม่มีการบันทึก)
    $final_data = [];
    foreach ($years as $y) {
        $r = $results[$y];
        
        // เกรดเฉลี่ยสะสม
        if ($r['_gpa_count'] > 0) {
            $r['avgGPA'] = round($r['_gpa_sum'] / $r['_gpa_count'], 2);
        } else {
            $r['avgGPA'] = 0.00;
        }

        // ยอดจำนวนบัณฑิต
        // จะรักษายอดจริงจากฐานข้อมูล (เริ่มต้นเป็น 0)

        // สถิติมีงานทำสะสมย้อนหลัง
        $r['employmentRate'] = 0;

        // ผลสัมฤทธิ์ทางการเรียนรู้ PLO
        foreach (['plo1', 'plo2', 'plo3', 'plo4', 'plo5'] as $plo_key) {
            $plo_upper = strtoupper($plo_key);
            if ($r['_plo_counts'][$plo_upper] > 0) {
                $r[$plo_key] = round($r['_plo_sums'][$plo_upper] / $r['_plo_counts'][$plo_upper], 1);
            } else {
                $r[$plo_key] = 0;
            }
        }

        // เอาตัวแปรคำนวณที่รกๆ ออก
        unset($r['_gpa_sum'], $r['_gpa_count'], $r['_plo_sums'], $r['_plo_counts']);
        $final_data[] = $r;
    }

    // 6. สรุปผลเกรดเฉลี่ยรายวิชาย้อนหลัง 5 ปีจากตารางข้อมูลจริง
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
            
            if ($count > 0) {
                $avg = round($sum / $count, 2);
            } else {
                $avg = 0.00;
            }
            $formatted['y' . $y] = $avg;
            
            // เปรียบเทียบแนวโน้มกับปีการศึกษาก่อนหน้า
            if ($prev_avg !== null && $prev_avg > 0) {
                if ($avg > $prev_avg) {
                    $trend = 'up';
                } else if ($avg < $prev_avg) {
                    $trend = 'down';
                } else {
                    $trend = 'stable';
                }
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

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>