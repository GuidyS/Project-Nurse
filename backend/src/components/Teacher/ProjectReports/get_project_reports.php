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
    $stmt = $pdo->query("
        SELECT
            project_id AS id,
            COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS name
        FROM project
        ORDER BY project_id DESC
    ");
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

    // 3. ดึงงบประมาณและความคืบหน้าจากตารางจริง
    $budgetStmt = $pdo->prepare("
        SELECT
            COALESCE(fiscal_year, 0) AS fiscal_year,
            COALESCE(budget_allocated, 0) AS budget,
            COALESCE(budget_spent, 0) AS spent
        FROM project_budget_years
        WHERE project_id = :project_id
        ORDER BY fiscal_year ASC, project_budget_years_id ASC
    ");
    $budgetStmt->execute([':project_id' => $selectedProjectId]);
    $budgetRows = $budgetStmt->fetchAll(PDO::FETCH_ASSOC);

    $budgetData = array_map(function ($row) {
        return [
            "month" => $row['fiscal_year'] ? (string)$row['fiscal_year'] : "-",
            "budget" => (float)$row['budget'],
            "spent" => (float)$row['spent']
        ];
    }, $budgetRows);

    $progressStmt = $pdo->prepare("
        SELECT
            period_label,
            planned_percent,
            actual_percent
        FROM project_progress_logs
        WHERE project_id = :project_id
        ORDER BY COALESCE(logged_at, created_at) ASC, id ASC
    ");
    $progressStmt->execute([':project_id' => $selectedProjectId]);
    $progressRows = $progressStmt->fetchAll(PDO::FETCH_ASSOC);

    $progressData = array_map(function ($row) {
        return [
            "week" => $row['period_label'],
            "planned" => (float)$row['planned_percent'],
            "actual" => (float)$row['actual_percent']
        ];
    }, $progressRows);

    $totalBudget = array_reduce($budgetData, fn($sum, $row) => $sum + $row['budget'], 0);
    $totalSpent = array_reduce($budgetData, fn($sum, $row) => $sum + $row['spent'], 0);
    $progress = empty($progressData) ? 0 : max(array_map(fn($row) => $row['actual'], $progressData));

    $stats = [
        "totalBudget" => $totalBudget,
        "totalSpent" => $totalSpent,
        "remaining" => $totalBudget - $totalSpent,
        "progress" => (int)round($progress)
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