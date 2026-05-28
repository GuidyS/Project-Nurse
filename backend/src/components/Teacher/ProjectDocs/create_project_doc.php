<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // รับข้อมูล JSON payload จากฝั่ง React
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['name'], $input['project'], $input['type'], $input['date'])) {
        throw new Exception("กรุณากรอกข้อมูลเอกสารให้ครบถ้วน");
    }

    // บันทึกเข้าตารางจริงโดยมีค่าเริ่มต้นสถานะเป็น 'pending' (รอตรวจสอบ)
    $sql = "INSERT INTO project_documents (name, project, type, date, status) 
            VALUES (:name, :project, :type, :date, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'    => $input['name'],
        ':project' => $input['project'],
        ':type'    => $input['type'],
        ':date'    => $input['date']
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกเอกสารเข้าสู่ระบบสำเร็จแล้ว",
        "doc_id"  => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>