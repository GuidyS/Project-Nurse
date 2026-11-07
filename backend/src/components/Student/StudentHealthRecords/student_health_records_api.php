<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../../../config/storage.php';

const HEALTH_EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

// ฟังก์ชันแปลงวันที่ของไฟล์เป็นภาษาไทย
function getFileThaiDate($reference) {
    $filePath = storageLegacyAbsolutePath($reference);
    if (!$filePath) return 'ไม่ทราบวันที่';
    $time = filemtime($filePath);
    $thaiYear = date('Y', $time) + 543;
    return date('d/m/', $time) . $thaiYear;
}

function healthUploadedFileAt(array $files, int $index): array {
    return [
        'name' => $files['name'][$index] ?? '', 'type' => $files['type'][$index] ?? '',
        'tmp_name' => $files['tmp_name'][$index] ?? '', 'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
        'size' => $files['size'][$index] ?? 0,
    ];
}

function healthEvidenceMime(array $file): string {
    if (($file['size'] ?? 0) <= 0 || (int)$file['size'] > HEALTH_EVIDENCE_MAX_BYTES) {
        throw new InvalidArgumentException('ไฟล์หลักฐานสุขภาพต้องมีขนาดไม่เกิน 5 MB');
    }
    $mime = mime_content_type($file['tmp_name']) ?: '';
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], true)) {
        throw new InvalidArgumentException('รองรับหลักฐานสุขภาพเฉพาะ JPG, PNG, WEBP หรือ PDF');
    }
    return $mime;
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
                    $descriptor = storageDescriptor($db, $path);
                    $row['evidence_images_with_date'][] = [
                        'path' => $path,
                        'url' => $descriptor['url'], 'available' => $descriptor['available'],
                        'date' => getFileThaiDate($path)
                    ];
                }
            }

            // ประมวลผล ผลตรวจร่างกายปี 1 (admission_health_check)
            $admissionArray = !empty($row['admission_health_check']) ? json_decode($row['admission_health_check'], true) : [];
            $row['admission_images_with_date'] = [];
            if (is_array($admissionArray)) {
                foreach ($admissionArray as $path) {
                    $descriptor = storageDescriptor($db, $path);
                    $row['admission_images_with_date'][] = [
                        'path' => $path,
                        'url' => $descriptor['url'], 'available' => $descriptor['available'],
                        'date' => getFileThaiDate($path)
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
        $uploadedObjects = [];
        $referencesToDelete = [];
        $legacyPathsToDelete = [];
        $transactionCommitted = false;

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
                $requestedImagesToKeep = array_values(array_filter($item['existing_images'] ?? [], 'is_string'));
                $existingImagesToKeep = array_values(array_intersect($oldImages ?: [], $requestedImagesToKeep));
                foreach (array_diff($oldImages ?: [], $existingImagesToKeep) as $delPath) {
                    if (storageReferenceId($delPath)) $referencesToDelete[] = $delPath;
                    else $legacyPathsToDelete[] = $delPath;
                    $totalDeleted++;
                }

                // ลบรูปผลตรวจปี 1
                $oldAdmission = $oldRecord && !empty($oldRecord['admission_health_check']) ? json_decode($oldRecord['admission_health_check'], true) : [];
                $requestedAdmissionToKeep = array_values(array_filter($item['existing_admission_images'] ?? [], 'is_string'));
                $existingAdmissionToKeep = array_values(array_intersect($oldAdmission ?: [], $requestedAdmissionToKeep));
                foreach (array_diff($oldAdmission ?: [], $existingAdmissionToKeep) as $delPath) {
                    if (storageReferenceId($delPath)) $referencesToDelete[] = $delPath;
                    else $legacyPathsToDelete[] = $delPath;
                    $totalDeleted++;
                }

                // --- จัดการอัปโหลดไฟล์ใหม่ ---
                $newUploadedPaths = [];
                if (isset($_FILES['images_' . $year_level])) {
                    $fileArray = $_FILES['images_' . $year_level];
                    for ($i = 0; $i < count($fileArray['name']); $i++) {
                        if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                            $single = healthUploadedFileAt($fileArray, $i);
                            $mime = healthEvidenceMime($single);
                            $stored = storagePutUploadedFile($db, $single, [
                                'owner_type' => 'student', 'owner_id' => $student_id,
                                'resource_type' => 'health_evidence', 'resource_id' => (string)$year_level,
                                'access_scope' => 'student_advisor_admin', 'mime_type' => $mime,
                            ]);
                            $newUploadedPaths[] = $stored['reference'];
                            $uploadedObjects[] = $stored;
                            $totalUploaded++;
                        }
                    }
                }

                $newAdmissionPaths = [];
                if ($year_level === 1 && isset($_FILES['admission_images_1'])) {
                    $fileArray = $_FILES['admission_images_1'];
                    for ($i = 0; $i < count($fileArray['name']); $i++) {
                        if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                            $single = healthUploadedFileAt($fileArray, $i);
                            $mime = healthEvidenceMime($single);
                            $stored = storagePutUploadedFile($db, $single, [
                                'owner_type' => 'student', 'owner_id' => $student_id,
                                'resource_type' => 'admission_health_evidence', 'resource_id' => '1',
                                'access_scope' => 'student_advisor_admin', 'mime_type' => $mime,
                            ]);
                            $newAdmissionPaths[] = $stored['reference'];
                            $uploadedObjects[] = $stored;
                            $totalUploaded++;
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
            $transactionCommitted = true;

            foreach (array_unique($referencesToDelete) as $referenceToDelete) {
                storageDeleteReference($db, $referenceToDelete);
            }
            foreach (array_unique($legacyPathsToDelete) as $legacyPathToDelete) {
                $fullPath = storageLegacyAbsolutePath($legacyPathToDelete);
                if ($fullPath) unlink($fullPath);
            }

            $logMsg = "บันทึกข้อมูลภาวะสุขภาพนักศึกษา รหัส: {$student_id}";
            if ($totalUploaded > 0) $logMsg .= " (แนบรูปเพิ่ม {$totalUploaded} ไฟล์)";
            try {
                logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'student_health_records', $logMsg);
                if ($totalDeleted > 0) {
                    logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'student_health_records', "ลบรูปภาพหลักฐานภาวะสุขภาพนักศึกษา รหัส: {$student_id} จำนวน {$totalDeleted} ไฟล์");
                }
            } catch (Throwable $auditError) {
                error_log('Health record audit log failed: ' . $auditError->getMessage());
            }

        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }

        echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลภาวะสุขภาพเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $e) {
    if (isset($uploadedObjects) && empty($transactionCommitted)) {
        foreach ($uploadedObjects as $uploadedObject) storageDeleteObjectKey($uploadedObject['object_key'] ?? null);
    }
    http_response_code($e instanceof InvalidArgumentException ? 400 : 500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
