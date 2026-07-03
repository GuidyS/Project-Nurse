<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // สมมติสิทธิ์เป็น Advisor ID: 1 (เปลี่ยนตามระบบ Session จริงของคุณได้เลย)
    $current_advisor_id = 1;

    // ตาราง advisor_transfer_request ยังไม่มีในฐานข้อมูล — คืนโครงสร้างว่าง (ยังมี dropdown ให้ใช้งาน)
    if ($pdo->query("SHOW TABLES LIKE 'advisor_transfer_request'")->rowCount() === 0) {
        $students = $pdo->query("SELECT student_id AS id, CONCAT(first_name_th,' ',last_name_th) AS name FROM student LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);
        $advisors = $pdo->query("SELECT faculty_id AS id, CONCAT(IFNULL(title,''),first_name_th,' ',last_name_th) AS name FROM faculty LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status"=>"success","data"=>["incoming"=>[],"outgoing"=>[],"history"=>[],"dropdowns"=>["students"=>$students,"advisors"=>$advisors]]], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 1. คำขอรับเข้า (Incoming) -> คนอื่นส่งมาให้เราพิจารณา
    $stmtIn = $pdo->prepare("SELECT request_id AS id, student_id AS studentId, student_id AS studentName, from_advisor_id AS otherAdvisor, reason, DATE(created_at) AS date, status FROM advisor_transfer_request WHERE to_advisor_id = :adv_id AND status = 'pending'");
    $stmtIn->execute([':adv_id' => $current_advisor_id]);
    $incoming = $stmtIn->fetchAll(PDO::FETCH_ASSOC);

    // 2. คำขอส่งออก (Outgoing) -> เราส่งคำขอไปหาคนอื่น
    $stmtOut = $pdo->prepare("SELECT request_id AS id, student_id AS studentId, student_id AS studentName, to_advisor_id AS otherAdvisor, reason, DATE(created_at) AS date, status FROM advisor_transfer_request WHERE from_advisor_id = :adv_id AND status = 'pending'");
    $stmtOut->execute([':adv_id' => $current_advisor_id]);
    $outgoing = $stmtOut->fetchAll(PDO::FETCH_ASSOC);

    // 3. ประวัติการทำรายการ (History) -> รายการที่ไม่อยู่ในสถานะ pending
    $stmtHist = $pdo->prepare("SELECT request_id AS id, student_id AS studentId, student_id AS studentName, request_type AS type, IF(request_type='incoming', from_advisor_id, to_advisor_id) AS otherAdvisor, DATE(created_at) AS date, status FROM advisor_transfer_request WHERE (from_advisor_id = :adv_id OR to_advisor_id = :adv_id) AND status != 'pending' ORDER BY request_id DESC");
    $stmtHist->execute([':adv_id' => $current_advisor_id]);
    $history = $stmtHist->fetchAll(PDO::FETCH_ASSOC);

    // ดึงรายชื่อนักศึกษาและอาจารย์ทั้งหมดเพื่อนำไปใช้ใน Dropdown ตอนสร้างคำขอใหม่
    $students = $pdo->query("SELECT student_id AS id, student_id AS name FROM student")->fetchAll(PDO::FETCH_ASSOC);
    $advisors = $pdo->query("SELECT faculty_id AS id, faculty_id AS name FROM faculty WHERE faculty_id != $current_advisor_id")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "incoming" => $incoming,
            "outgoing" => $outgoing,
            "history" => $history,
            "dropdowns" => [
                "students" => $students,
                "advisors" => $advisors
            ]
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>