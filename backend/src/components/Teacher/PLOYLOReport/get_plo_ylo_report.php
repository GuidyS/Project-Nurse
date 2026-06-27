<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// เชื่อมต่อฐานข้อมูล
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // ดึงข้อมูลทั้งหมดจากตารางสถิติ
    $stmt = $pdo->query("SELECT type, code_name AS name, target_score AS target, achieved_score AS achieved, description FROM curriculum_report_stats ORDER BY code_name ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $ploData = [];
    $yloData = [];

    // วนลูปแยกข้อมูลเป็น 2 ก้อน (PLO และ YLO) ตามที่หน้าบ้านต้องการ
    foreach ($rows as $row) {
        $item = [
            'name' => $row['name'],
            'target' => (float)$row['target'],
            'achieved' => (float)$row['achieved'],
            'description' => $row['description']
        ];
        
        if ($row['type'] === 'PLO') {
            $ploData[] = $item;
        } else {
            $yloData[] = $item;
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "ploData" => $ploData,
            "yloData" => $yloData
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>