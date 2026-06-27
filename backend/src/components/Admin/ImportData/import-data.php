<?php
// upload.php
require_once __DIR__ . '/../../../config/config.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * ฟังก์ชันหลักในการอ่านไฟล์และบันทึกลงฐานข้อมูล
 */
function processExcelToDatabase($filePath, $importType, $db, $fileExt) {
    $rowCount = 0;

    // 🌟 กรณีที่ 1: อ่านไฟล์ประเภท CSV
    if ($fileExt === 'csv') {
        if (($handle = fopen($filePath, "r")) !== FALSE) {
            fgetcsv($handle, 1000, ","); // สั่งข้ามแถวหัวตาราง (Header)
            
            $db->beginTransaction();
            try {
                while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    // ล้างช่องว่างสิ่งสกปรกออกจากข้อมูล String
                    $colA = isset($data[0]) ? trim($data[0]) : '';
                    $colB = isset($data[1]) ? trim($data[1]) : '';
                    $colC = isset($data[2]) ? trim($data[2]) : '';
                    $colD = isset($data[3]) ? trim($data[3]) : '';

                    if (empty($colA)) continue; // ถ้ารหัสหลักในช่องแรกว่าง ให้ข้ามแถวทันที

                    // 🎯 ลอจิกการทำงานสับเปลี่ยน SQL ตาม 4 ประเภทหลัก
                    if ($importType === 'students') {
                        $sql = "INSERT INTO student (student_id, title, first_name_th, last_name_th) 
                                VALUES (?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE title=VALUES(title), first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$colA, $colB, $colC, $colD]);
                    } 
                    else if ($importType === 'teachers') {
                        // 🔧 แก้ไขจุด Error: มั่นใจว่าโยนรหัสอาจารย์ (ตัวเลข) เข้า faculty_id และโยนชื่อเข้าตำแหน่งที่ถูกต้อง
                        $sql = "INSERT INTO faculty (faculty_id, title, first_name_th, last_name_th) 
                                VALUES (?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE title=VALUES(title), first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$colA, $colB, $colC, $colD]);
                    } 
                    else if ($importType === 'courses') {
                        $sql = "INSERT INTO subject (subject_code, subject_name_th, credit, description) 
                                VALUES (?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE subject_name_th=VALUES(subject_name_th), credit=VALUES(credit)";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$colA, $colB, $colC, $colD]);
                    } 
                    else if ($importType === 'projects') {
                        $sql = "INSERT INTO project (project_id, project_name, budget, status) 
                                VALUES (?, ?, ?, 'pending') 
                                ON DUPLICATE KEY UPDATE project_name=VALUES(project_name), budget=VALUES(budget)";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$colA, $colB, $colC]);
                    }

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
    } 
    // 🌟 กรณีที่ 2: อ่านไฟล์ประเภท Excel (.xlsx, .xls)
    else {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $highestRow = $worksheet->getHighestRow();
        
        $db->beginTransaction();
        try {
            // ลูปวนอ่านค่าดิบรายแถวเริ่มต้นตั้งแต่แถวที่ 2 เป็นต้นไป (ข้ามบรรทัดหัวตาราง)
            for ($row = 2; $row <= $highestRow; $row++) {
                
                $colA = trim($worksheet->getCell('A' . $row)->getValue() ?? '');
                $colB = trim($worksheet->getCell('B' . $row)->getValue() ?? '');
                $colC = trim($worksheet->getCell('C' . $row)->getValue() ?? '');
                $colD = trim($worksheet->getCell('D' . $row)->getValue() ?? '');

                if (empty($colA)) continue; // บรรทัดขยะเปล่าท้ายเล่มให้ดีดข้าม

                if ($importType === 'students') {
                    $sql = "INSERT INTO student (student_id, title, first_name_th, last_name_th) 
                            VALUES (?, ?, ?, ?) 
                            ON DUPLICATE KEY UPDATE title=VALUES(title), first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$colA, $colB, $colC, $colD]);
                } 
                else if ($importType === 'teachers') {
                    // 🔧 ป้องกันช่องสลับ: จัดพารามิเตอร์ให้ตรงล็อกตารางอาจารย์พยาบาล
                    $sql = "INSERT INTO faculty (faculty_id, title, first_name_th, last_name_th) 
                            VALUES (?, ?, ?, ?) 
                            ON DUPLICATE KEY UPDATE title=VALUES(title), first_name_th=VALUES(first_name_th), last_name_th=VALUES(last_name_th)";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$colA, $colB, $colC, $colD]);
                } 
                else if ($importType === 'courses') {
                    // แปรรูปวิชาพยาบาลศาสตร์ เช่น NUR101 คอลัมน์ A เป็นรหัสวิชา
                    $sql = "INSERT INTO subject (subject_code, subject_name_th, credit, description) 
                            VALUES (?, ?, ?, ?) 
                            ON DUPLICATE KEY UPDATE subject_name_th=VALUES(subject_name_th), credit=VALUES(credit)";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$colA, $colB, $colC, $colD]);
                } 
                else if ($importType === 'projects') {
                    // แปรรูปข้อมูลโครงการวิจัย/โครงการคณะพยาบาลศาสตร์
                    $sql = "INSERT INTO project (project_code, project_name, budget, status) 
                            VALUES (?, ?, ?, 'pending') 
                            ON DUPLICATE KEY UPDATE project_name=VALUES(project_name), budget=VALUES(budget)";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$colA, $colB, $colC]);
                }

                $rowCount++;
            }
            $db->commit();
            return $rowCount;
        } catch (Exception $e) {
            $db->rollBack();
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
            $finalCount = processExcelToDatabase($uploadPath, $importType, $db, $fileExt);

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