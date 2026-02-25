<?php

require_once __DIR__ . '/../config/config.php';

$db = new Connect();

// ดึงเมนูที่ User มีสิทธิ์เข้าถึง
$sql = "SELECT m.* FROM system_sidebar_menus m 
        WHERE m.permission_required IN (
            SELECT p.name FROM permissions p
            JOIN position_permission pp ON p.permissions_id = pp.permission_id
            JOIN user_position up ON pp.position_id = up.position_id
            WHERE up.user_id = :user_id
        ) OR m.permission_required IS NULL"; // NULL คือเมนูที่เห็นได้ทุกคน

// 1. รับค่า user_id จากที่ส่งมาจาก index.php
$user_id = $user_id; // ตัวแปรนี้ถูกส่งต่อมาจาก switch case

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

?>