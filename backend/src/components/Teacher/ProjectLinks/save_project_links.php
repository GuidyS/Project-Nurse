<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['projectId']) || !isset($input['links'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วนสำหรับการบันทึก");
    }

    $projectId = $input['projectId'];
    $links = $input['links']; // รับ object โครงสร้าง { plos: [], ylos: [], clos: [] }

    // เริ่มทำงานแบบ Transaction ป้องกันข้อมูลพังกลางคัน
    $pdo->beginTransaction();

    // 1. ลบข้อมูลการเชื่อมโยงเดิมของโครงการนี้ออกก่อนเพื่อเตรียมอัปเดตใหม่
    $deleteSql = "DELETE FROM project_outcome_links WHERE project_id = :project_id";
    $stmtDel = $pdo->prepare($deleteSql);
    $stmtDel->execute([':project_id' => $projectId]);

    // 2. เตรียมคำสั่ง SQL สำหรับบันทึกข้อมูลใหม่เข้าไป
    $insertSql = "INSERT INTO project_outcome_links (project_id, outcome_type, outcome_code) VALUES (:project_id, :type, :code)";
    $stmtIns = $pdo->prepare($insertSql);

    // วนลูปบันทึกทีละประเภท (plos, ylos, clos)
    foreach (['plo' => 'plos', 'ylo' => 'ylos', 'clo' => 'clos'] as $dbType => $stateKey) {
        if (isset($links[$stateKey]) && is_array($links[$stateKey])) {
            foreach ($links[$stateKey] as $code) {
                $stmtIns->execute([
                    ':project_id' => $projectId,
                    ':type' => $dbType,
                    ':code' => $code
                ]);
            }
        }
    }

    // ยืนยันการบันทึกข้อมูลทั้งหมดลงในฐานข้อมูลจริง
    $pdo->commit();

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกการเชื่อมโยงข้อมูลโครงการสำเร็จเรียบร้อยแล้ว"
    ]);

} catch (Exception $e) {
    // หากมีจุดใดทำงานพลาด ให้ Rollback ยกเลิกคำสั่งทั้งหมดทันที ข้อมูลเดิมจะไม่หาย
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "status" => "error",
        "message" => "ไม่สามารถบันทึกข้อมูลได้: " . $e->getMessage()
    ]);
}
?>