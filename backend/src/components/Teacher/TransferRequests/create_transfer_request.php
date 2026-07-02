<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['student_id']) || !isset($data['to_advisor_id']) || !isset($data['reason'])) {
    echo json_encode(["status" => "error", "message" => "กรอกข้อมูลไม่ครบ"]);
    exit;
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $current_advisor_id = 1; // สมมติสิทธิ์ปัจจุบัน

    $stmt = $pdo->prepare("INSERT INTO advisor_transfer_request (student_id, from_advisor_id, to_advisor_id, reason, status, request_type) VALUES (:student_id, :from_id, :to_id, :reason, 'pending', 'outgoing')");
    $stmt->execute([
        ':student_id' => $data['student_id'],
        ':from_id' => $current_advisor_id,
        ':to_id' => $data['to_advisor_id'],
        ':reason' => $data['reason']
    ]);

    echo json_encode(["status" => "success", "message" => "ส่งคำขอสำเร็จ"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>