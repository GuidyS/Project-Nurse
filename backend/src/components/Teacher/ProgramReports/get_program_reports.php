<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
require_once __DIR__ . '/../../../config/config.php';

try {
    $db = new Connect();

    // 1. ดึงข้อมูลภาพรวม PLO สำหรับ Radar Chart และ Card สรุป
    // สมมติว่ามีตาราง assessments ที่เก็บคะแนน และเชื่อมกับ plo_id
    $sqlRadar = "
        SELECT 
            CONCAT('PLO', p.plo_id) AS subject, 
            AVG(a.pass_status) * 100 AS average_score
        FROM plo p
        LEFT JOIN ylo y ON p.plo_id = y.plo_id
        LEFT JOIN assessments a ON y.ylo_id = a.ylo_id
        GROUP BY p.plo_id
        ORDER BY p.plo_id ASC
    ";
    $stmtRadar = $db->query($sqlRadar);
    $radarRaw = $stmtRadar->fetchAll(PDO::FETCH_ASSOC);

    $radarData = [];
    foreach ($radarRaw as $row) {
        $radarData[] = [
            'subject' => $row['subject'],
            'A' => round((float)$row['average_score'], 2),
            'fullMark' => 100
        ];
    }

    // 2. ดึงข้อมูลแบ่งตามชั้นปี สำหรับ Bar Chart (สมมติชั้นปี 1-4)
    // ตรงนี้ขึ้นอยู่กับว่าคุณเก็บ "ชั้นปี" ในตาราง student หรืออิงจากปีที่ลงทะเบียน
    $sqlYearly = "
        SELECT 
            s.year_level AS year,
            p.plo_id,
            AVG(a.pass_status) * 100 AS avg_score
        FROM assessments a
        JOIN student s ON a.student_id = s.student_id
        JOIN ylo y ON a.ylo_id = y.ylo_id
        JOIN plo p ON y.plo_id = p.plo_id
        WHERE s.year_level IN (1, 2, 3, 4)
        GROUP BY s.year_level, p.plo_id
        ORDER BY s.year_level ASC, p.plo_id ASC
    ";
    $stmtYearly = $db->query($sqlYearly);
    $yearlyRaw = $stmtYearly->fetchAll(PDO::FETCH_ASSOC);

    // จัดกลุ่มข้อมูลให้อยู่ในรูปแบบที่ Recharts ต้องการ
    $yearlyDataMap = [];
    foreach ($yearlyRaw as $row) {
        $yearKey = 'ปี ' . $row['year'];
        if (!isset($yearlyDataMap[$yearKey])) {
            $yearlyDataMap[$yearKey] = ['year' => $yearKey];
        }
        $ploKey = 'plo' . $row['plo_id'];
        $yearlyDataMap[$yearKey][$ploKey] = round((float)$row['avg_score'], 2);
    }
    
    $yearlyData = array_values($yearlyDataMap);

    // ส่ง JSON กลับไป
    echo json_encode([
        'status' => 'success',
        'data' => [
            'radarData' => $radarData,
            'yearlyData' => $yearlyData
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>