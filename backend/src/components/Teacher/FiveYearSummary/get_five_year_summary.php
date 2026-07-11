<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

// เปิด/ปิดการโชว์ error message จริงตอน debug (ปิดเป็น false ตอนขึ้น production)
define('APP_DEBUG', true);

try {
    $db = new Connect();

    // 1. กำหนดช่วงปี 5 ปีล่าสุด (ปีปัจจุบันแบบ พ.ศ.)
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
        ];
    }

    // 2. คำนวณจำนวนบัณฑิตในแต่ละปี (ดูจากรหัสนักศึกษา 2 ตัวแรก + 4 ปีหลักสูตร)
    // รองรับทั้งสะกดถูกและสะกดผิด ('Graduated'/'Graduted') ที่อาจปนอยู่ในข้อมูลเก่า
    $stmt_grad = $db->query("SELECT student_id FROM student WHERE status IN ('Graduated', 'Graduted')");
    while ($row = $stmt_grad->fetch(PDO::FETCH_ASSOC)) {
        $prefix = substr((string)$row['student_id'], 0, 2);
        if (is_numeric($prefix)) {
            // หมายเหตุ: สมมติหลักสูตร 4 ปีคงที่ทุกคน ถ้ามีหลายหลักสูตรที่จำนวนปีไม่เท่ากัน
            // ควร join กับ program.total_credits หรือเก็บ entry_year จริงแทนการเดาโดยตรง
            $grad_year = 2500 + (int)$prefix + 4; // เช่น รหัส 66 -> 2566 + 4 = 2570
            if (isset($results[$grad_year])) {
                $results[$grad_year]['graduates']++;
            }
        }
    }

    //  ดึงรายวิชาที่มีในระบบทั้งหมด
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

    //  ดึงข้อมูลเกรดทั้งหมดจากตาราง enrollment
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

    //  สรุปผลสถิติรายปี
    $final_data = [];
    foreach ($years as $y) {
        $r = $results[$y];

        $r['avgGPA'] = $r['_gpa_count'] > 0
            ? round($r['_gpa_sum'] / $r['_gpa_count'], 2)
            : 0.00;

        // ไม่มีฟิลด์ employmentRate ในฐานข้อมูลปัจจุบัน ตั้งเป็น 0 ไว้ก่อน
        $r['employmentRate'] = 0;

        // ไม่มีตารางเก็บคะแนน PLO ระดับนักศึกษารายคน (มีแค่ plo/sub_plo ซึ่งเป็นแค่ "นิยาม" PLO
        // ไม่ใช่ผลคะแนนจริง) จึงยังคำนวณ PLO1-5 จริงไม่ได้ ตั้งเป็น 0 ไว้ก่อนเหมือนเดิม
        foreach (['plo1', 'plo2', 'plo3', 'plo4', 'plo5'] as $plo_key) {
            $r[$plo_key] = 0;
        }

        unset($r['_gpa_sum'], $r['_gpa_count']);
        $final_data[] = $r;
    }

    //  สรุปผลเกรดเฉลี่ยรายวิชาย้อนหลัง 5 ปี (เฉพาะวิชาที่มีข้อมูลเกรดอย่างน้อย 1 ปี — ไม่งั้นตารางจะยาว 73 วิชาแต่เป็น 0 หมด)
    $courses_data = array_filter($courses_data, function ($c) {
        foreach ($c['grades'] as $g) { if ($g['count'] > 0) return true; }
        return false;
    });

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
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // ข้อผิดพลาดจากฐานข้อมูล (SQL ผิด, connection หลุด ฯลฯ)
    error_log("[FiveYearSummary] DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล"
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    // ดักข้อผิดพลาดอื่นๆ ที่ไม่ใช่ PDOException เช่น TypeError, DivisionByZeroError
    error_log("[FiveYearSummary] Unexpected Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => APP_DEBUG ? $e->getMessage() : "เกิดข้อผิดพลาดที่ไม่คาดคิด"
    ], JSON_UNESCAPED_UNICODE);
}
