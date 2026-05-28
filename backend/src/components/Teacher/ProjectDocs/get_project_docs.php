<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // เผื่อกรณีติด CORS ระหว่างพัฒนา
header('Access-Control-Allow-Methods: GET');

// เชื่อมต่อฐานข้อมูลด้วย PDO สไตล์เดิมของคุณ
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // ดึงข้อมูลเอกสารทั้งหมดที่มีอยู่ในฐานข้อมูล เรียงตามวันที่ล่าสุด
    $sql = "SELECT id, name, project, type, date, status, file_path FROM project_documents ORDER BY date DESC, id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ส่งข้อมูลที่เป็น Array ของจริงกลับไปให้ React
    echo json_encode([
        "status" => "success",
        "data" => $docs
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "ไม่สามารถดึงข้อมูลเอกสารจากระบบได้: " . $e->getMessage()
    ]);
}
?>