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
            'employmentRate' => rand(88, 98), // จำลองข้อมูลการมีงานทำไปก่อน (ถ้ามีระบบกรอกแบบสอบถามค่อยดึงจาก JSON)
            'avgGPA' => 0,
            'plo1' => 0, 'plo2' => 0, 'plo3' => 0, 'plo4' => 0, 'plo5' => 0,
            '_gpa_sum' => 0, '_gpa_count' => 0,
            '_plo_sums' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
            '_plo_counts' => ['PLO1'=>0, 'PLO2'=>0, 'PLO3'=>0, 'PLO4'=>0, 'PLO5'=>0],
        ];
    }

    // 2. คำนวณจำนวนบัณฑิตในแต่ละปี (ดูจากรหัสนักศึกษา 2 ตัวแรก + 4 ปีหลักสูตร)
    $stmt_grad = $pdo->query("SELECT student_code FROM student WHERE status = 'Graduated'");
    while ($row = $stmt_grad->fetch(PDO::FETCH_ASSOC)) {
        $prefix = substr($row['student_code'], 0, 2);
        if (is_numeric($prefix)) {
            $grad_year = 2500 + (int)$prefix + 4; // เช่น รหัส 62 -> 2562 + 4 = เรียนจบปี 2566
            if (isset($results[$grad_year])) {
                $results[$grad_year]['graduates']++;
            }
        }
    }

    // 3. เตรียม Mapping CLO -> PLO จากหลักสูตร
    $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    $mapping_data = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];
    
    $clo_to_plo = []; // [รหัสวิชา][รหัส CLO] = ชื่อ PLO
    if (isset($mapping_data['subject_mappings'])) {
        foreach ($mapping_data['subject_mappings'] as $sub_code => $sub_data) {
            if (isset($sub_data['clos'])) {
                foreach ($sub_data['clos'] as $clo) {
                    $clo_id = $clo['id'] ?? $clo['code'] ?? null;
                    if ($clo_id) $clo_to_plo[$sub_code][$clo_id] = $clo['plo'] ?? null;
                }
            }
        }
    }

    // 4. ดึงข้อมูลเกรดและคะแนน CLO ทั้งหมดจากตาราง assessments
    $stmt_assess = $pdo->query("SELECT a.academic_year, a.grade, a.clo_scores, s.subject_code FROM assessments a JOIN subject s ON a.subject_id = s.subject_id");
    
    // แปลงเกรดตัวอักษรเป็นตัวเลขเพื่อหาค่าเฉลี่ย
    $grade_points = ['A'=>4.0, 'B+'=>3.5, 'B'=>3.0, 'C+'=>2.5, 'C'=>2.0, 'D+'=>1.5, 'D'=>1.0, 'F'=>0];

    while ($row = $stmt_assess->fetch(PDO::FETCH_ASSOC)) {
        $y = (int)$row['academic_year'];
        if (!isset($results[$y])) continue;

        // คำนวณสะสม GPA
        $g = $row['grade'];
        if (isset($grade_points[$g])) {
            $results[$y]['_gpa_sum'] += $grade_points[$g];
            $results[$y]['_gpa_count']++;
        }

        // คำนวณคะแนน PLO จาก CLO ของเด็กแต่ละคน
        if ($row['clo_scores']) {
            $scores = json_decode($row['clo_scores'], true);
            $sub_code = $row['subject_code'];
            if (is_array($scores)) {
                foreach ($scores as $clo_id => $score) {
                    $plo = $clo_to_plo[$sub_code][$clo_id] ?? null;
                    if ($plo && isset($results[$y]['_plo_sums'][$plo])) {
                        $results[$y]['_plo_sums'][$plo] += (float)$score;
                        $results[$y]['_plo_counts'][$plo]++;
                    }
                }
            }
        }
    }

    // 5. สรุปผลหาค่าเฉลี่ย (หารจำนวนเต็ม)
    $final_data = [];
    foreach ($years as $y) {
        $r = $results[$y];
        
        // เฉลี่ย GPA
        if ($r['_gpa_count'] > 0) {
            $r['avgGPA'] = round($r['_gpa_sum'] / $r['_gpa_count'], 2);
        }

        // เฉลี่ย PLO (แปลงเป็นเปอร์เซ็นต์)
        foreach (['plo1', 'plo2', 'plo3', 'plo4', 'plo5'] as $plo_key) {
            $plo_upper = strtoupper($plo_key);
            if ($r['_plo_counts'][$plo_upper] > 0) {
                $r[$plo_key] = round($r['_plo_sums'][$plo_upper] / $r['_plo_counts'][$plo_upper], 1);
            }
        }

        // เอาตัวแปรคำนวณที่รกๆ ออกก่อนส่งให้ React
        unset($r['_gpa_sum'], $r['_gpa_count'], $r['_plo_sums'], $r['_plo_counts']);
        $final_data[] = $r;
    }

    echo json_encode(["status" => "success", "data" => $final_data]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>