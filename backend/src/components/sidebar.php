<?php

// เริ่ม session หากยังไม่ได้เริ่ม เพื่อดึงค่าจากตอน Login
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/config.php';

$db = new Connect();

// 1. ตรวจสอบและดึง user_id จาก Session (ถ้าไม่มีให้เด้ง Error 401)
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: กรุณาเข้าสู่ระบบ"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// position_id → section_title ที่ต้องดันขึ้นก่อน
$positionSectionMap = [
    1 => 'การบริหารคณะ',
    2 => 'การจัดการเรียนการสอน',
    3 => 'งานที่ปรึกษา',
    4 => 'งานปฏิบัติการ',
    5 => 'งานหลักสูตร',
    6 => 'โครงการ คณะ',
    7 => 'จัดการระบบ',
    8 => 'เมนูหลัก', // student menus ที่ section_title เป็น NULL
];

// 2. SQL Query ดึงเมนูตามระบบสิทธิ์
$sql = "SELECT m.* FROM system_sidebar_menus m 
        WHERE m.permission_required IN (
            SELECT p.permission_name FROM permissions p
            JOIN position_permission pp ON p.permission_id = pp.permission_id
            JOIN user_position up ON pp.position_id = up.position_id
            WHERE up.user_id = :user_id
        ) OR m.permission_required IS NULL 
        ORDER BY m.menu_id ASC";

$stmt = $db->prepare($sql);
$stmt->execute([':user_id' => $user_id]);
$menu_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

$sections = [];
foreach ($menu_items as $item) {
    $sectionName = $item['section_title'] ?? 'เมนูหลัก';
    if ($sectionName === '' || $sectionName === null) {
        $sectionName = 'เมนูหลัก';
    }
    if (!isset($sections[$sectionName])) {
        $sections[$sectionName] = [
            'sectionTitle' => $sectionName,
            'items' => []
        ];
    }

    $sections[$sectionName]['items'][] = [
        'title' => $item['title'],
        'url'   => $item['url'],
        'icon'  => $item['icon']
    ];
}

// 3. อ่านตำแหน่งของ user (primary ก่อน) เพื่อเรียง section
$posStmt = $db->prepare("
    SELECT position_id, is_primary
    FROM user_position
    WHERE user_id = :user_id
    ORDER BY is_primary DESC, user_position_id ASC
");
$posStmt->execute([':user_id' => $user_id]);
$userPositions = $posStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

$prioritySections = [];
foreach ($userPositions as $row) {
    $pid = (int)($row['position_id'] ?? 0);
    if (!isset($positionSectionMap[$pid])) {
        continue;
    }
    $sectionTitle = $positionSectionMap[$pid];
    if (!in_array($sectionTitle, $prioritySections, true)) {
        $prioritySections[] = $sectionTitle;
    }
}

// Admin ที่ไม่มี user_position → ดัน "จัดการระบบ" ขึ้นก่อน
if (empty($prioritySections)) {
    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $roleStmt->execute([':user_id' => $user_id]);
    $roleId = (int)($roleStmt->fetchColumn() ?: 0);
    if ($roleId === 1) {
        $prioritySections[] = 'จัดการระบบ';
    }
}

// 4. เรียง section: priority ก่อน → อื่นๆ ตามลำดับเดิม → ระบบทั่วไป ท้ายสุด
$ordered = [];
foreach ($prioritySections as $title) {
    if (isset($sections[$title])) {
        $ordered[$title] = $sections[$title];
        unset($sections[$title]);
    }
}

$generalKey = 'ระบบทั่วไป';
$generalSection = $sections[$generalKey] ?? null;
unset($sections[$generalKey]);

foreach ($sections as $title => $section) {
    $ordered[$title] = $section;
}

if ($generalSection !== null) {
    $ordered[$generalKey] = $generalSection;
}

echo json_encode(array_values($ordered), JSON_UNESCAPED_UNICODE);
exit;
