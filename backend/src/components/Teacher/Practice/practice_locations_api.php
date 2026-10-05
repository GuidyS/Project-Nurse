<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;
    $userId = $_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    // [GET] ดึงข้อมูลทั้งหมดไปแสดงผลและทำสรุป
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM practice_locations ORDER BY id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // [POST] รับข้อมูลจาก Excel มาบันทึกลงฐานข้อมูล
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $locations = $input['locations'] ?? [];

        if (!is_array($locations)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "รูปแบบข้อมูลไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $db->beginTransaction();
        try {
            $db->exec("DELETE FROM practice_locations");

            if (!empty($locations)) {
                $insertSql = "INSERT INTO practice_locations 
                    (hospital_name, sub_district_hospital, health_center, mou_status, subject_name, uploaded_by) 
                    VALUES (:hospital, :sub_district, :health, :mou, :subject, :uid)";
                $stmt = $db->prepare($insertSql);

                foreach ($locations as $loc) {
                    if (empty($loc['hospital_name']) && empty($loc['sub_district_hospital']) && empty($loc['health_center'])) {
                        continue; 
                    }
                    $stmt->execute([
                        ':hospital'     => $loc['hospital_name'] ?? null,
                        ':sub_district' => $loc['sub_district_hospital'] ?? null,
                        ':health'       => $loc['health_center'] ?? null,
                        ':mou'          => $loc['mou_status'] ?? null,
                        ':subject'      => $loc['subject_name'] ?? null,
                        ':uid'          => $userId
                    ]);
                }
            }
            
            logAudit($db, $userId, 'update', 'practice_locations', "อัปโหลดอัปเดตข้อมูลแหล่งฝึกภาคปฏิบัติด้วยไฟล์ Excel");
            $db->commit();

        } catch (Throwable $e) {
            if ($db->inTransaction()) { $db->rollBack(); }
            throw $e;
        }

        echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลแหล่งฝึกเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // [DELETE] สำหรับลบข้อมูล
    if ($method === 'DELETE') {
        $action = $_GET['action'] ?? '';

        //  กรณีลบข้อมูลทั้งหมด
        if ($action === 'delete_all') {
            $db->beginTransaction();
            try {
                $db->exec("DELETE FROM practice_locations");
                
                // เก็บลง Audit Log
                logAudit($db, $userId, 'delete', 'practice_locations', "ลบข้อมูลแหล่งฝึกภาคปฏิบัติทั้งหมดในระบบ");
                
                $db->commit();
                echo json_encode(["status" => "success", "message" => "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
                exit;
            } catch (Throwable $e) {
                if ($db->inTransaction()) { $db->rollBack(); }
                throw $e;
            }
        }

        //  กรณีลบทีละรายการ
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบรหัสข้อมูลที่ต้องการลบ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare("SELECT hospital_name, sub_district_hospital, health_center FROM practice_locations WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $locationName = $row['hospital_name'] ?: ($row['sub_district_hospital'] ?: $row['health_center']);
            
            $db->beginTransaction();
            try {
                $delStmt = $db->prepare("DELETE FROM practice_locations WHERE id = :id");
                $delStmt->execute([':id' => $id]);
                
                logAudit($db, $userId, 'delete', 'practice_locations', "ลบแหล่งฝึกภาคปฏิบัติ: " . $locationName);
                
                $db->commit();
            } catch (Throwable $e) {
                if ($db->inTransaction()) { $db->rollBack(); }
                throw $e;
            }
        }

        echo json_encode(["status" => "success", "message" => "ลบข้อมูลแหล่งฝึกเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>