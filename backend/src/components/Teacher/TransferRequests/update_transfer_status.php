<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['request_id']) || !isset($data['status'])) {
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit;
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $pdo->beginTransaction();

    // 1. อัปเดตสถานะในตารางคำขอสลับเปลี่ยนก่อน
    $stmt = $pdo->prepare("UPDATE advisor_transfer_request SET status = :status WHERE request_id = :id");
    $stmt->execute([':status' => $data['status'], ':id' => $data['request_id']]);

    // 2. ถ้าหากสถานะคือ 'approved' ให้ทำการอัปเดตตารางระบบเดิมที่มีอยู่แล้วทันที
    if ($data['status'] === 'approved') {
        // ดึงข้อมูลคำขอเพื่อดูว่าใครคือ นักศึกษา และ อาจารย์คนใหม่
        $stmtReq = $pdo->prepare("SELECT student_id, to_advisor_id FROM advisor_transfer_request WHERE request_id = :id");
        $stmtReq->execute([':id' => $data['request_id']]);
        $req = $stmtReq->fetch(PDO::FETCH_ASSOC);

        if ($req) {
            // อัปเดตตาราง student หลัก
            $stmtStud = $pdo->prepare("UPDATE student SET instructor_id = :new_adv WHERE student_id = :std_id");
            $stmtStud->execute([':new_adv' => $req['to_advisor_id'], ':std_id' => $req['student_id']]);

            // อัปเดตตาราง student_advisor_mapping 
            $stmtMap = $pdo->prepare("UPDATE student_advisor_mapping SET faculty_id = :new_adv WHERE student_id = :std_id");
            $stmtMap->execute([':new_adv' => $req['to_advisor_id'], ':std_id' => $req['student_id']]);
        }
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>