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

// ข้อมูล role / ตำแหน่งหลัก ใช้กำหนดเมนู "หน้าแรก" และ fallback
$infoStmt = $db->prepare(
    "SELECT u.role_id, (
        SELECT up.position_id FROM user_position up
        WHERE up.user_id = u.user_id
        ORDER BY up.is_primary DESC, up.position_id ASC LIMIT 1
     ) AS position_id
     FROM users u WHERE u.user_id = :user_id LIMIT 1"
);
$infoStmt->execute([':user_id' => $user_id]);
$userInfo = $infoStmt->fetch(PDO::FETCH_ASSOC) ?: [];
$roleId = (int)($userInfo['role_id'] ?? 0);
$positionId = (int)($userInfo['position_id'] ?? 0);

// 2. ดึงเมนูตามสิทธิ์ของตำแหน่งที่ผู้ใช้ถืออยู่
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

// 2.1 Fallback: ผู้ใช้ที่ยังไม่ถูกกำหนดตำแหน่ง (ไม่มีแถวใน user_position)
// จะไม่เหลือเมนูเลย -> ใช้สิทธิ์ของตำแหน่งที่ตรงกับ role แทน เพื่อไม่ให้ sidebar ว่าง
if (empty($menu_items)) {
    $roleToPosition = [3 => 'นักศึกษา', 2 => 'อาจารย์ประจำ', 1 => 'เลขา'];
    if (isset($roleToPosition[$roleId])) {
        $fallbackSql = "SELECT m.* FROM system_sidebar_menus m
                        WHERE m.permission_required IN (
                            SELECT p.permission_name FROM permissions p
                            JOIN position_permission pp ON p.permission_id = pp.permission_id
                            JOIN position pos ON pos.position_id = pp.position_id
                            WHERE pos.position_name = :position_name
                        )
                        ORDER BY m.menu_id ASC";
        $fallbackStmt = $db->prepare($fallbackSql);
        $fallbackStmt->execute([':position_name' => $roleToPosition[$roleId]]);
        $menu_items = $fallbackStmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// 2.2 กันกรณีสุดท้าย: อย่างน้อยต้องมีเมนูพื้นฐานให้ใช้งานเสมอ
if (empty($menu_items)) {
    $baseStmt = $db->query(
        "SELECT * FROM system_sidebar_menus WHERE url IN ('profile','notifications','settings') ORDER BY menu_id ASC"
    );
    $menu_items = $baseStmt->fetchAll(PDO::FETCH_ASSOC);
}

// 3. เมนู "หน้าแรก" — บาง role มีเมนูน้อยจนไม่มีทางกลับหน้าเริ่มต้น จึงใส่ให้เสมอ
function resolveHomeUrl(int $roleId, int $positionId): string
{
    if ($roleId === 1) {
        return 'users-management';
    }
    if ($roleId === 2) {
        if ($positionId === 1) return 'dean-dashboard';
        if ($positionId === 2) return 'my-courses';
        if ($positionId === 3) return 'advises';
        return 'plo-ylo-report';
    }
    if ($roleId === 3) {
        return 'transcript';
    }
    return 'profile';
}

$homeUrl = resolveHomeUrl($roleId, $positionId);

// ใช้ชื่อหมวด 'เมนูหลัก' เพื่อให้เมนูอื่นในหมวดเดียวกันมารวมกัน (ไม่ขึ้นหัวข้อซ้ำ)
$sections = [];
$sections['เมนูหลัก'] = [
    'sectionTitle' => 'เมนูหลัก',
    'items' => [[
        'title' => 'หน้าแรก',
        'url'   => $homeUrl,
        'icon'  => 'Home',
    ]],
];

foreach ($menu_items as $item) {
    if (($item['url'] ?? '') === $homeUrl) {
        continue; // กันเมนูซ้ำกับ "หน้าแรก"
    }

    $sectionName = $item['section_title'] ?? 'เมนูหลัก';
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

// ส่งกลับเป็น Array ของ Sections (Re-index ให้เป็นตัวเลข)
echo json_encode(array_values($sections), JSON_UNESCAPED_UNICODE);
exit;

?>
