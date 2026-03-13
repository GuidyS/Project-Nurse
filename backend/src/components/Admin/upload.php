<?php
// upload.php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

/**
 * ฟังก์ชันหลักในการอ่านไฟล์และบันทึกลงฐานข้อมูล
 */
function processExcelToDatabase($filePath, $importType, $db) {
    $rowCount = 0;
    // ปัจจุบันรองรับ CSV เป็นหลักตาม fgetcsv
    if (($handle = fopen($filePath, "r")) !== FALSE) {
        fgetcsv($handle, 1000, ","); // ข้าม Header

        $db->beginTransaction();
        try {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if ($importType === 'students') {
                    $sql = "INSERT INTO student (student_id, title, first_name_th, last_name_th) 
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                } else if ($importType === 'teachers') {
                    $sql = "INSERT INTO faculty (faculty_id, title, first_name_th, last_name_th) 
                            VALUES (?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                } else {
                    continue;
                }

                $stmt = $db->prepare($sql);
                // ตรวจสอบว่ามีข้อมูลใน $data ครบตามจำนวน column หรือไม่
                $stmt->execute([$data[0], $data[1], $data[2], $data[3]]);
                $rowCount++;
            }
            $db->commit();
            fclose($handle);
            return $rowCount;
        } catch (Exception $e) {
            $db->rollBack();
            fclose($handle);
            throw $e;
        }
    }
    return false;
}

try {
    $db = new Connect();

    if (!isset($_FILES['file']) || !isset($_POST['importType'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน (ขาดไฟล์หรือประเภทการนำเข้า)");
    }

    $file = $_FILES['file'];
    $importType = $_POST['importType'];
    $userId = isset($_POST['userId']) ? $_POST['userId'] : 0;

    $allowed = ["xlsx", "xls", "csv"];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowed)) {
        throw new Exception("รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น");
    }

    $uploadDir = __DIR__ . "/uploads/imports/$importType/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $newFileName = date("Ymd_His") . "_" . uniqid() . "." . $fileExt;
    $uploadPath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        
        // 1. บันทึกประวัติเริ่มต้นก่อน (ต้องมีค่า 'processing' ใน ENUM ของ DB)
        $sql = "INSERT INTO import_history (user_id, type, file_name, status, created_at) 
                VALUES (:uid, :type, :fname, 'processing', NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':uid' => $userId,
            ':type' => $importType,
            ':fname' => $file['name']
        ]);
        $importId = $db->lastInsertId();

        // 2. รันกระบวนการอ่านไฟล์
        try {
            $finalCount = processExcelToDatabase($uploadPath, $importType, $db);

            if ($finalCount !== false) {
                // 3. ถ้าสำเร็จ: UPDATE เป็น 'success'
                $update = $db->prepare("UPDATE import_history SET status = 'success', record_count = :count WHERE id = :id");
                $update->execute([':count' => $finalCount, ':id' => $importId]);

                echo json_encode([
                    "status" => "success",
                    "message" => "นำเข้าข้อมูลสำเร็จจำนวน $finalCount รายการ",
                    "importId" => $importId
                ]);
            }
        } catch (Exception $e) {
            // 4. ถ้าพลาด: UPDATE เป็น 'failed'
            $errorUpdate = $db->prepare("UPDATE import_history SET status = 'failed', error_details = :msg WHERE id = :id");
            $errorUpdate->execute([':msg' => $e->getMessage(), ':id' => $importId]);
            throw $e; 
        }
    } else {
        throw new Exception("ไม่สามารถบันทึกไฟล์ลงใน Server ได้");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}