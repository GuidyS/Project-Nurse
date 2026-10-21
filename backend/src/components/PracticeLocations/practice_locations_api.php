<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/audit_helper.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;
    $userId = $_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :uid");
    $roleStmt->execute([':uid' => $userId]);
    $roleId = (int)$roleStmt->fetchColumn();

    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM practice_locations ORDER BY id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (in_array($method, ['POST', 'DELETE']) && $roleId !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "ปฏิเสธการเข้าถึง: เฉพาะผู้ดูแลระบบเท่านั้นที่มีสิทธิ์จัดการข้อมูลนี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // [POST] สำหรับบันทึกข้อมูล (นำเข้า Excel หรือ เพิ่มข้อมูลด้วยมือ)
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $locations = $input['locations'] ?? [];

        if (!is_array($locations) || empty($locations)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลสำหรับบันทึก"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $db->beginTransaction();
        try {
            // ✅ 1. ดึงข้อมูลสถานที่เดิมที่มีอยู่แล้วขึ้นมา เพื่อเอามาเช็กซ้ำ
            $stmtExist = $db->query("SELECT hospital_name, sub_district_hospital, health_center FROM practice_locations");
            $existingRecords = $stmtExist->fetchAll(PDO::FETCH_ASSOC);

            $existingHospitals = [];
            $existingSubDistricts = [];
            $existingHealthCenters = [];

            foreach ($existingRecords as $row) {
                if (!empty($row['hospital_name'])) $existingHospitals[] = trim($row['hospital_name']);
                if (!empty($row['sub_district_hospital'])) $existingSubDistricts[] = trim($row['sub_district_hospital']);
                if (!empty($row['health_center'])) $existingHealthCenters[] = trim($row['health_center']);
            }

            $insertSql = "INSERT INTO practice_locations 
                (hospital_name, sub_district_hospital, health_center, mou_status, subject_name, uploaded_by) 
                VALUES (:hospital, :sub_district, :health, :mou, :subject, :uid)";
            $stmt = $db->prepare($insertSql);

            $addedCount = 0;
            $skippedCount = 0;

            foreach ($locations as $loc) {
                $hName = isset($loc['hospital_name']) ? trim($loc['hospital_name']) : '';
                $sName = isset($loc['sub_district_hospital']) ? trim($loc['sub_district_hospital']) : '';
                $hcName = isset($loc['health_center']) ? trim($loc['health_center']) : '';

                if (empty($hName) && empty($sName) && empty($hcName)) {
                    continue; 
                }

                // ✅ 2. เช็กว่าชื่อสถานที่ซ้ำกับที่มีอยู่แล้วหรือไม่
                $isDuplicate = false;
                if ($hName !== '' && in_array($hName, $existingHospitals)) $isDuplicate = true;
                if ($sName !== '' && in_array($sName, $existingSubDistricts)) $isDuplicate = true;
                if ($hcName !== '' && in_array($hcName, $existingHealthCenters)) $isDuplicate = true;

                if ($isDuplicate) {
                    $skippedCount++;
                    continue; // 🚨 ข้ามการทำงาน (ไม่บันทึกลงฐานข้อมูล)
                }

                // ✅ 3. ถ้าเป็นข้อมูลใหม่ (ไม่ซ้ำ) ให้บันทึกลงฐานข้อมูล
                $stmt->execute([
                    ':hospital'     => $hName ?: null,
                    ':sub_district' => $sName ?: null,
                    ':health'       => $hcName ?: null,
                    ':mou'          => $loc['mou_status'] ?? null,
                    ':subject'      => $loc['subject_name'] ?? null,
                    ':uid'          => $userId
                ]);
                $addedCount++;

                // เอาชื่อที่เพิ่งเพิ่มเข้าไป ใส่ในอาเรย์กันเหนียวไว้เช็กแถวถัดไป (กรณีไฟล์ Excel มีชื่อซ้ำกันเอง)
                if ($hName !== '') $existingHospitals[] = $hName;
                if ($sName !== '') $existingSubDistricts[] = $sName;
                if ($hcName !== '') $existingHealthCenters[] = $hcName;
            }
            
            if ($addedCount > 0) {
                logAudit($db, $userId, 'add', 'practice_locations', "เพิ่มข้อมูลแหล่งฝึกภาคปฏิบัติจำนวน {$addedCount} รายการ");
            }
            $db->commit();

            // ✅ 4. ส่งข้อความแจ้งเตือนกลับไปยังหน้าบ้าน
            if (count($locations) === 1) {
                // กรณีเพิ่มข้อมูลทีละรายการ (แบบ Manual)
                if ($skippedCount > 0) {
                    echo json_encode(["status" => "error", "message" => "ชื่อสถานที่นี้มีอยู่ในระบบแล้ว (ข้อมูลซ้ำ)"], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(["status" => "success", "message" => "เพิ่มข้อมูลแหล่งฝึกใหม่เรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // กรณีนำเข้าผ่านไฟล์ Excel
                $msg = "นำเข้าข้อมูลสำเร็จ! เพิ่มใหม่ {$addedCount} รายการ";
                if ($skippedCount > 0) {
                    $msg .= ", ข้ามข้อมูลที่ซ้ำ {$skippedCount} รายการ";
                }
                echo json_encode(["status" => "success", "message" => $msg], JSON_UNESCAPED_UNICODE);
            }
            exit;

        } catch (Throwable $e) {
            if ($db->inTransaction()) { $db->rollBack(); }
            throw $e;
        }
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (($_GET['action'] ?? '') === 'delete_all') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "ไม่รองรับการลบข้อมูลทั้งหมด"], JSON_UNESCAPED_UNICODE);
            exit;
        }

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
