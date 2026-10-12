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

// ฟังก์ชันแปลงวันที่ของไฟล์เป็นภาษาไทย
function getFileThaiDate($filePath) {
    if (!file_exists($filePath)) return 'ไม่ทราบวันที่';
    $time = filemtime($filePath);
    $thaiYear = date('Y', $time) + 543;
    return date('d/m/', $time) . $thaiYear;
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

    $uploadDir = __DIR__ . '/../../../uploads/health_records/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // [GET] ดึงข้อมูลและหาวันที่อัปโหลดของแต่ละไฟล์
    if ($method === 'GET') {
        $query = "SELECT * FROM student_health_records WHERE student_id = :sid ORDER BY year_level ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([':sid' => $student_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        foreach ($rows as &$row) {
            // ประมวลผล หลักฐานทั่วไป (evidence_images)
            $evidenceArray = !empty($row['evidence_images']) ? json_decode($row['evidence_images'], true) : [];
            $row['evidence_images_with_date'] = [];
            if (is_array($evidenceArray)) {
                foreach ($evidenceArray as $path) {
                    $row['evidence_images_with_date'][] = [
                        'path' => $path,
                        'date' => getFileThaiDate(__DIR__ . '/../../../' . $path)
                    ];
                }
            }

            // ประมวลผล ผลตรวจร่างกายปี 1 (admission_health_check)
            $admissionArray = !empty($row['admission_health_check']) ? json_decode($row['admission_health_check'], true) : [];
            $row['admission_images_with_date'] = [];
            if (is_array($admissionArray)) {
                foreach ($admissionArray as $path) {
                    $row['admission_images_with_date'][] = [
                        'path' => $path,
                        'date' => getFileThaiDate(__DIR__ . '/../../../' . $path)
                    ];
                }
            }
        }

        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // [POST] บันทึกข้อมูล
    if ($method === 'POST') {
        $records = isset($_POST['records']) ? json_decode($_POST['records'], true) : [];

        if (empty($records) || !is_array($records)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่มีข้อมูลสำหรับบันทึก"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $totalDeleted = 0;
        $totalUploaded = 0;

        $db->beginTransaction();
        try {
            foreach ($records as $item) {
                $year_level = (int)($item['year_level'] ?? 1);
                
                // --- จัดการไฟล์เก่า และลบไฟล์ที่ถูกกดถังขยะ ---
                $oldStmt = $db->prepare("SELECT evidence_images, admission_health_check FROM student_health_records WHERE student_id = :sid AND year_level = :yl");
                $oldStmt->execute([':sid' => $student_id, ':yl' => $year_level]);
                $oldRecord = $oldStmt->fetch(PDO::FETCH_ASSOC);
                
                // ลบรูปทั่วไป
                $oldImages = $oldRecord && !empty($oldRecord['evidence_images']) ? json_decode($oldRecord['evidence_images'], true) : [];
                $existingImagesToKeep = $item['existing_images'] ?? [];
                foreach (array_diff($oldImages ?: [], $existingImagesToKeep) as $delPath) {
                    $fullPath = __DIR__ . '/../../../' . $delPath;
                    if (file_exists($fullPath) && is_file($fullPath)) { unlink($fullPath); }
                    $totalDeleted++;
                }

                // ลบรูปผลตรวจปี 1
                $oldAdmission = $oldRecord && !empty($oldRecord['admission_health_check']) ? json_decode($oldRecord['admission_health_check'], true) : [];
                $existingAdmissionToKeep = $item['existing_admission_images'] ?? [];
                foreach (array_diff($oldAdmission ?: [], $existingAdmissionToKeep) as $delPath) {
                    $fullPath = __DIR__ . '/../../../' . $delPath;
                    if (file_exists($fullPath) && is_file($fullPath)) { unlink($fullPath); }
                    $totalDeleted++;
                }

                // --- จัดการอัปโหลดไฟล์ใหม่ ---
                $newUploadedPaths = [];
                if (isset($_FILES['images_' . $year_level])) {
                    $fileArray = $_FILES['images_' . $year_level];
                    for ($i = 0; $i < count($fileArray['name']); $i++) {
                        if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                            $ext = strtolower(pathinfo($fileArray['name'][$i], PATHINFO_EXTENSION));
                            $newName = "health_{$student_id}_y{$year_level}_" . uniqid() . ".{$ext}";
                            if (move_uploaded_file($fileArray['tmp_name'][$i], $uploadDir . $newName)) {
                                $newUploadedPaths[] = "uploads/health_records/" . $newName;
                                $totalUploaded++;
                            }
                        }
                    }
                }

                $newAdmissionPaths = [];
                if ($year_level === 1 && isset($_FILES['admission_images_1'])) {
                    $fileArray = $_FILES['admission_images_1'];
                    for ($i = 0; $i < count($fileArray['name']); $i++) {
                        if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                            $ext = strtolower(pathinfo($fileArray['name'][$i], PATHINFO_EXTENSION));
                            $newName = "admission_{$student_id}_y1_" . uniqid() . ".{$ext}";
                            if (move_uploaded_file($fileArray['tmp_name'][$i], $uploadDir . $newName)) {
                                $newAdmissionPaths[] = "uploads/health_records/" . $newName;
                                $totalUploaded++;
                            }
                        }
                    }
                }

                $finalImages = array_merge($existingImagesToKeep, $newUploadedPaths);
                $evidenceJson = !empty($finalImages) ? json_encode($finalImages, JSON_UNESCAPED_UNICODE) : null;

                $finalAdmission = array_merge($existingAdmissionToKeep, $newAdmissionPaths);
                $admissionJson = !empty($finalAdmission) ? json_encode($finalAdmission, JSON_UNESCAPED_UNICODE) : null;

                // --- ข้อมูลสุขภาพ ---
                $height = !empty($item['height']) ? (float)$item['height'] : null;
                $weight = !empty($item['weight']) ? (float)$item['weight'] : null;
                $bmi = ($height && $weight && $height > 0) ? round($weight / (($height/100) * ($height/100)), 2) : null;
                
                $ostatus = null;
                if (!empty($item['overall_status'])) {
                    $ostatus = in_array($item['overall_status'], ['healthy', 'has_health_issue']) ? $item['overall_status'] : null;
                }

                $upsertSql = "
                    INSERT INTO student_health_records (
                        student_id, year_level, academic_year, height, weight, bmi,
                        overall_status, health_issue_detail, evidence_images, admission_health_check
                    ) VALUES (
                        :sid, :y_level, :ayear, :height, :weight, :bmi,
                        :ostatus, :detail, :evidence, :admission
                    ) ON DUPLICATE KEY UPDATE
                        academic_year = VALUES(academic_year),
                        height = VALUES(height), weight = VALUES(weight), bmi = VALUES(bmi),
                        overall_status = VALUES(overall_status), health_issue_detail = VALUES(health_issue_detail),
                        evidence_images = VALUES(evidence_images), admission_health_check = VALUES(admission_health_check)
                ";
                $stmt = $db->prepare($upsertSql);
                $stmt->execute([
                    ':sid'       => $student_id,
                    ':y_level'   => $year_level,
                    ':ayear'     => (int)($item['academic_year'] ?? (2567 + ($year_level - 1))),
                    ':height'    => $height, ':weight' => $weight, ':bmi' => $bmi,
                    ':ostatus'   => $ostatus,
                    ':detail'    => ($ostatus === 'has_health_issue') ? ($item['health_issue_detail'] ?? '') : null,
                    ':evidence'  => $evidenceJson,
                    ':admission' => $admissionJson
                ]);
            }
            $db->commit();

            $logMsg = "บันทึกข้อมูลภาวะสุขภาพนักศึกษา รหัส: {$student_id}";
            if ($totalUploaded > 0) $logMsg .= " (แนบรูปเพิ่ม {$totalUploaded} ไฟล์)";
            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'student_health_records', $logMsg);

            if ($totalDeleted > 0) {
                logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'student_health_records', "ลบรูปภาพหลักฐานภาวะสุขภาพนักศึกษา รหัส: {$student_id} จำนวน {$totalDeleted} ไฟล์");
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