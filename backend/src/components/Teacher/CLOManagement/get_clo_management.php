<?php

// require_once 'auth_middleware.php'; // นำกลับมาใช้เมื่อเชื่อมระบบ Login แล้ว

// 🔧 เปลี่ยนข้อมูลเชื่อมต่อให้ตรงกับโปรเจกต์ของคุณ
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$subject_code = $_GET['subject_code'] ?? null;

try {
    if (!$subject_code) {
        echo json_encode(["status" => "error", "message" => "กรุณาระบุรหัสวิชา"]);
        exit();
    }

    // ดึงข้อมูลหลักสูตรที่กำลังใช้งานอยู่
    $sql = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $data = json_decode($row['mapping_json'], true);
        
        // 1. ดึงข้อมูล CLO ของวิชานั้นๆ จากคีย์ "course_clos" (ถ้าไม่มีให้คืนค่า Array ว่าง)
        $clos = $data['course_clos'][$subject_code] ?? [];

        // 2. ดึงรายชื่อ PLO หลักสูตรทั้งหมดมาสร้างเป็นตัวเลือกให้ React
        $plos = [];
        if (isset($data['plos'])) {
            foreach ($data['plos'] as $plo) {
                $plos[] = [
                    "id" => $plo['plo_id'], 
                    "name" => $plo['plo_id'] . " - " . mb_substr($plo['plo_name'], 0, 50) . "..." // ตัดชื่อให้สั้นลงสำหรับ Dropdown
                ]; 
            }
        }

        echo json_encode([
            "status" => "success", 
            "data" => [
                "clos" => $clos,
                "plos" => $plos
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่ใช้งานอยู่"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>