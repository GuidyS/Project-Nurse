<?php
header('Content-Type: application/json');
// require_once 'auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['taskId'], $input['status'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน");
    }

    // อัปเดตสถานะของงานในระบบ
    $sql = "UPDATE schedule_tasks SET status = :status WHERE task_id = :task_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':status'  => $input['status'], // ฝั่ง React สามารถส่งคำว่า 'completed' มาได้
        ':task_id' => $input['taskId']
    ]);

    // ตรวจสอบว่ามีแถวถูกอัปเดตจริงไหม
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "status" => "success",
            "message" => "อัปเดตสถานะงานเรียบร้อยแล้ว"
        ]);
    } else {
        throw new Exception("ไม่พบงานนี้ในระบบ หรือสถานะไม่ได้เปลี่ยนแปลง");
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>