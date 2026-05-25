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

$user_id = $_SESSION['user_id']; //  แก้ไขจุดที่เคย Undefined เรียบร้อย

// 2. SQL Query ดึงเมนูตามระบบสิทธิ์ดิบเวอร์ชันใหม่ (ใช้แบบไม่มีชื่อซ้ำ)
$sql = "SELECT m.* FROM system_sidebar_menus m 
        WHERE m.permission_required IN (
            SELECT p.permission_name FROM permissions p
            JOIN position_permission pp ON p.permission_id = pp.permission_id
            JOIN user_position up ON pp.position_id = up.position_id
            WHERE up.user_id = :user_id
        ) OR m.permission_required IS NULL 
        ORDER BY m.menu_id ASC"; // แนะนำให้เพิ่ม ORDER BY เพื่อให้เมนูเรียงสวยงาม

// 2. Query ดึงข้อมูล (ห้าม echo $menu_items ออกมาเด็ดขาด)
$stmt = $db->prepare($sql);
$stmt->execute([':user_id' => $user_id]);
$menu_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

$sections = [];
foreach ($menu_items as $item) {
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
echo json_encode(array_values($sections));
exit;

?>