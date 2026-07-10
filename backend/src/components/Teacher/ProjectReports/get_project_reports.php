<?php
// 1. จัดการเรื่อง CORS Headers สูงสุด (ต้องอยู่ก่อน Code อื่นๆ ทั้งหมด)
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// 2. ดักจับ Preflight Request (OPTIONS) ที่ Axios / Web Browser ชอบส่งมาตรวจสอบก่อน
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. กำหนดประเภทข้อมูลที่ส่งกลับเป็น JSON
header('Content-Type: application/json');

// เชื่อมต่อฐานข้อมูล (สไตล์เดียวกับไฟล์ php อื่นๆ ในระบบของคุณ)
// สังเกตว่าใช้ host=db ตาม Docker หรือ Config เดิมของคุณ
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. ดึงข้อมูลโครงการทั้งหมดที่มีในระบบ เพื่อทำ Dropdown ให้เลือก
    $stmt = $pdo->query("SELECT MAX(id) as id, project as name FROM project_documents GROUP BY project ORDER BY id DESC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // หากยังไม่มีโปรเจกต์ใดๆ ส่งค่าว่างกลับไปเพื่อไม่ให้ Frontend พัง
    if (empty($projects)) {
        echo json_encode([
            "status" => "success",
            "data" => [
                "projects" => [],
                "selectedProjectId" => null,
                "stats" => ["totalBudget" => 0, "totalSpent" => 0, "remaining" => 0, "progress" => 0],
                "budgetData" => [],
                "progressData" => []
            ]
        ]);
        exit;
    }

    // 2. รับค่า ID ของโครงการที่เลือก (ถ้าไม่ได้ส่งมา ให้ดึงโครงการแรกสุดในรายการแทน)
    $selectedProjectId = (isset($_GET['project_id']) && $_GET['project_id'] !== '') 
                         ? (int)$_GET['project_id'] 
                         : $projects[0]['id'];

    // =====================================================================
    // 3. ข้อมูลกราฟและสถิติ (Mock Data เพื่อแสดงผลกราฟในเบื้องต้น)
    // =====================================================================

    // 3.1 สถิติภาพรวม
    $stats = [
        "totalBudget" => 500000,
        "totalSpent" => 250000,
        "remaining" => 250000,
        "progress" => 65
    ];

    // 3.2 ข้อมูลกราฟแท่ง (งบประมาณรายเดือน)
    $budgetData = [
        ["month" => "ม.ค.", "budget" => 100000, "spent" => 90000],
        ["month" => "ก.พ.", "budget" => 100000, "spent" => 95000],
        ["month" => "มี.ค.", "budget" => 150000, "spent" => 65000],
        ["month" => "เม.ย.", "budget" => 150000, "spent" => 0]
    ];

    // 3.3 ข้อมูลกราฟเส้น (ความคืบหน้ารายสัปดาห์)
    $progressData = [
        ["week" => "สัปดาห์ 1", "planned" => 10, "actual" => 12],
        ["week" => "สัปดาห์ 2", "planned" => 25, "actual" => 20],
        ["week" => "สัปดาห์ 3", "planned" => 40, "actual" => 35],
        ["week" => "สัปดาห์ 4", "planned" => 60, "actual" => 65],
    ];

    // ส่งออกข้อมูลทั้งหมดในรูปแบบ JSON
    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "selectedProjectId" => $selectedProjectId,
            "stats" => $stats,
            "budgetData" => $budgetData,
            "progressData" => $progressData
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "เกิดข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()
    ]);
}
?>