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

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 3) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $student_id = $user['username'];
    $method = $_SERVER['REQUEST_METHOD'];

    // ตำแหน่งโฟลเดอร์เก็บไฟล์ (จะสร้างให้อัตโนมัติถ้ายังไม่มี)
    $uploadDir = __DIR__ . '/../../../uploads/health_records/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // [GET] ดึงข้อมูลสุขภาพและรูปภาพ
    if ($method === 'GET') {
        $query = "SELECT * FROM student_health_records WHERE student_id = :sid ORDER BY year_level ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([':sid' => $student_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        // ถอดรหัส JSON ของรูปภาพก่อนส่งให้ Frontend
        foreach ($rows as &$row) {
            $row['evidence_images'] = !empty($row['evidence_images']) ? json_decode($row['evidence_images'], true) : [];
        }

        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // [POST] บันทึกข้อมูลและอัปโหลดรูปภาพ (รับแบบ FormData)
    if ($method === 'POST') {
        // ข้อมูลหลักถูกส่งมาในรูปแบบ JSON string ผ่าน $_POST['records']
        $records = isset($_POST['records']) ? json_decode($_POST['records'], true) : [];

        if (empty($records) || !is_array($records)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่มีข้อมูลสำหรับบันทึก"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $totalDeletedImages = 0;
        $totalUploadedImages = 0;

        $db->beginTransaction();
        try {
            foreach ($records as $item) {
                $year_level = (int)($item['year_level'] ?? 1);
                
                //  ตรวจสอบข้อมูลเก่าใน DB เพื่อเปรียบเทียบรูปภาพที่ถูกลบ
                $oldStmt = $db->prepare("SELECT evidence_images FROM student_health_records WHERE student_id = :sid AND year_level = :yl");
                $oldStmt->execute([':sid' => $student_id, ':yl' => $year_level]);
                $oldRecord = $oldStmt->fetch(PDO::FETCH_ASSOC);
                
                $oldImages = [];
                if ($oldRecord && !empty($oldRecord['evidence_images'])) {
                    $oldImages = json_decode($oldRecord['evidence_images'], true) ?: [];
                }

                // รูปที่ผู้ใช้ต้องการเก็บไว้ (ส่งมาจาก Frontend)
                $existingImagesToKeep = $item['existing_images'] ?? [];
                
                // หาไฟล์ที่ถูกผู้ใช้กดถังขยะทิ้ง แล้วลบไฟล์จริงออกจากเซิร์ฟเวอร์
                $imagesToDelete = array_diff($oldImages, $existingImagesToKeep);
                foreach ($imagesToDelete as $delPath) {
                    $fullPath = __DIR__ . '/../../../' . $delPath;
                    if (file_exists($fullPath) && is_file($fullPath)) {
                        unlink($fullPath);
                    }
                    $totalDeletedImages++;
                }

                //  จัดการอัปโหลดไฟล์ใหม่ (ถ้ามี)
                $newUploadedPaths = [];
                $fileInputName = 'images_' . $year_level; // หน้าเว็บจะส่งชื่อนี้มา (เช่น images_1)
                
                if (isset($_FILES[$fileInputName])) {
                    $fileArray = $_FILES[$fileInputName];
                    $fileCount = count($fileArray['name']);
                    
                    for ($i = 0; $i < $fileCount; $i++) {
                        if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                            $tmpName = $fileArray['tmp_name'][$i];
                            $originalName = basename($fileArray['name'][$i]);
                            $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                            
                            // เปลี่ยนชื่อไฟล์ป้องกันชื่อซ้ำ
                            $newName = "health_{$student_id}_y{$year_level}_" . uniqid() . ".{$ext}";
                            $destination = $uploadDir . $newName;
                            
                            if (move_uploaded_file($tmpName, $destination)) {
                                $newUploadedPaths[] = "uploads/health_records/" . $newName;
                                $totalUploadedImages++;
                            }
                        }
                    }
                }

                // รวมรูปเก่าที่เหลืออยู่ เข้ากับ รูปใหม่ที่เพิ่งอัปโหลด
                $finalImages = array_merge($existingImagesToKeep, $newUploadedPaths);
                $evidenceJson = !empty($finalImages) ? json_encode($finalImages, JSON_UNESCAPED_UNICODE) : null;

                //  เตรียมคำนวณข้อมูลสุขภาพ
                $height = !empty($item['height']) ? (float)$item['height'] : null;
                $weight = !empty($item['weight']) ? (float)$item['weight'] : null;
                $bmi = null;

                if ($height && $weight && $height > 0) {
                    $heightMeter = $height / 100;
                    $bmi = round($weight / ($heightMeter * $heightMeter), 2);
                }

                $ostatus = null;
                if (!empty($item['overall_status'])) {
                    if ($item['overall_status'] === 'has_health_issue') {
                        $ostatus = 'has_health_issue';
                    } elseif ($item['overall_status'] === 'healthy') {
                        $ostatus = 'healthy';
                    }
                }

                //  อัปเดตลง Database
                $upsertSql = "
                    INSERT INTO student_health_records (
                        student_id, year_level, academic_year, height, weight, bmi,
                        overall_status, health_issue_detail, evidence_images
                    ) VALUES (
                        :sid, :y_level, :ayear, :height, :weight, :bmi,
                        :ostatus, :detail, :evidence
                    ) ON DUPLICATE KEY UPDATE
                        academic_year = VALUES(academic_year),
                        height = VALUES(height),
                        weight = VALUES(weight),
                        bmi = VALUES(bmi),
                        overall_status = VALUES(overall_status),
                        health_issue_detail = VALUES(health_issue_detail),
                        evidence_images = VALUES(evidence_images)
                ";
                $stmt = $db->prepare($upsertSql);
                $stmt->execute([
                    ':sid'     => $student_id,
                    ':y_level' => $year_level,
                    ':ayear'   => (int)($item['academic_year'] ?? (2567 + ($year_level - 1))),
                    ':height'  => $height,
                    ':weight'  => $weight,
                    ':bmi'     => $bmi,
                    ':ostatus' => $ostatus,
                    ':detail'  => ($ostatus === 'has_health_issue') ? ($item['health_issue_detail'] ?? '') : null,
                    ':evidence'=> $evidenceJson
                ]);
            }
            $db->commit();

            // บันทึก Audit Log (ถ้ามีการลบรูปให้ลง Log แจ้งเตือนด้วย)
            $logMsg = "บันทึกข้อมูลภาวะสุขภาพนักศึกษา รหัส: {$student_id}";
            if ($totalUploadedImages > 0) $logMsg .= " (แนบหลักฐานเพิ่ม {$totalUploadedImages} ไฟล์)";
            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'student_health_records', $logMsg);

            if ($totalDeletedImages > 0) {
                logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'student_health_records', "ลบรูปภาพหลักฐานภาวะสุขภาพนักศึกษา รหัส: {$student_id} จำนวน {$totalDeletedImages} ไฟล์");
            }

        } catch (Throwable $e) {
            $db->rollBack();
            throw $e;
        }

        echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลภาวะสุขภาพเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>