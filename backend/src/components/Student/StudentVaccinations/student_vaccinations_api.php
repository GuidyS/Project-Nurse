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

const ALLOWED_EVIDENCE_EXT = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_EVIDENCE_SIZE = 5 * 1024 * 1024; // 5MB

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

    //  [GET] ดึงข้อมูลวัคซีน (พร้อมแปลง path ไฟล์ให้เป็น Array รองรับหลายรูป)
    if ($method === 'GET') {
        $query = "
            SELECT v.*, 
                   COALESCE(CONCAT(f.first_name_th, ' ', f.last_name_th), f.first_name_th, v.advisor_id, '') AS advisor_name
            FROM student_vaccinations v
            LEFT JOIN faculty f ON v.advisor_id = f.faculty_id
            WHERE v.student_id = :sid
            ORDER BY v.sequence_no ASC, v.dose_no ASC
        ";
        $stmt = $db->prepare($query);
        $stmt->execute([':sid' => $student_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        foreach ($rows as &$row) {
            $path = $row['evidence_file_path'];
            if (empty($path)) {
                $row['existing_images'] = [];
            } else {
                $decoded = json_decode($path, true);
                if (is_array($decoded)) {
                    $row['existing_images'] = $decoded;
                } else {
                    $row['existing_images'] = [$path]; // รองรับข้อมูลเก่าที่เป็น string เดี่ยวๆ
                }
            }
        }

        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    //  [POST] บันทึกข้อมูลและอัปโหลดไฟล์หลายไฟล์
    if ($method === 'POST') {
        $dataRaw = $_POST['vaccinations'] ?? '[]';
        $vaccinations = json_decode($dataRaw, true);

        if (empty($vaccinations) || !is_array($vaccinations)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลที่จะบันทึก"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $uploadDir = __DIR__ . '/../../../uploads/vaccine_evidence/' . $student_id . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $groupEvidencePaths = [];
        
        //  ดึงไฟล์เก่าที่ผู้ใช้ยังต้องการเก็บไว้
        foreach ($vaccinations as $item) {
            $groupId = $item['group_id'] ?? ($item['sequence_no'] ?? null);
            if ($groupId !== null && !isset($groupEvidencePaths[$groupId])) {
                $groupEvidencePaths[$groupId] = $item['existing_images'] ?? [];
            }
        }

        //  จัดการไฟล์เก่าที่ถูกผู้ใช้ลบทิ้ง (ลบไฟล์จริงในเซิร์ฟเวอร์)
        $oldStmt = $db->prepare("SELECT evidence_file_path FROM student_vaccinations WHERE student_id = :sid");
        $oldStmt->execute([':sid' => $student_id]);
        $oldRows = $oldStmt->fetchAll(PDO::FETCH_ASSOC);
        $allOldFiles = [];
        foreach ($oldRows as $r) {
            if (!empty($r['evidence_file_path'])) {
                $decoded = json_decode($r['evidence_file_path'], true);
                if (is_array($decoded)) {
                    $allOldFiles = array_merge($allOldFiles, $decoded);
                } else {
                    $allOldFiles[] = $r['evidence_file_path'];
                }
            }
        }
        $allOldFiles = array_unique($allOldFiles);
        $allNewKeptFiles = [];
        foreach ($groupEvidencePaths as $files) {
            $allNewKeptFiles = array_merge($allNewKeptFiles, $files);
        }
        $filesToDelete = array_diff($allOldFiles, $allNewKeptFiles);
        foreach ($filesToDelete as $delPath) {
             $fullPath = __DIR__ . '/../../../' . $delPath;
             if (file_exists($fullPath) && is_file($fullPath)) {
                 unlink($fullPath);
             }
        }

        //  อัปโหลดไฟล์ใหม่ (รองรับ multiple files)
        foreach ($_FILES as $key => $fileArray) {
            if (preg_match('/^images_(.+)$/', $key, $matches)) {
                $groupId = $matches[1];
                if (!isset($groupEvidencePaths[$groupId])) {
                    $groupEvidencePaths[$groupId] = [];
                }
                
                $fileCount = count($fileArray['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($fileArray['error'][$i] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($fileArray['name'][$i], PATHINFO_EXTENSION));
                        if (in_array($ext, ALLOWED_EVIDENCE_EXT, true) && $fileArray['size'][$i] <= MAX_EVIDENCE_SIZE) {
                            $newFileName = 'vaccine_' . preg_replace('/[^a-zA-Z0-9_]/', '', $groupId) . '_' . time() . '_' . uniqid() . '.' . $ext;
                            $targetFile = $uploadDir . $newFileName;
                            if (move_uploaded_file($fileArray['tmp_name'][$i], $targetFile)) {
                                $groupEvidencePaths[$groupId][] = 'uploads/vaccine_evidence/' . $student_id . '/' . $newFileName;
                            }
                        }
                    }
                }
            }
        }

        $facultyStmt = $db->query("SELECT faculty_id, first_name_th, last_name_th, CONCAT(first_name_th, ' ', last_name_th) AS full_name FROM faculty");
        $facultyList = $facultyStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $db->beginTransaction();
        try {
            // ลบข้อมูลเดิมแล้ว Insert ใหม่ทั้งหมด (วิธีอัปเดตแบบล้างกระดานของเดิม)
            $deleteStmt = $db->prepare("DELETE FROM student_vaccinations WHERE student_id = :sid");
            $deleteStmt->execute([':sid' => $student_id]);

            $insertSql = "
                INSERT INTO student_vaccinations (
                    student_id, sequence_no, vaccine_name, dose_no,
                    immunity_status, received_date, evidence_attached, evidence_file_path, 
                    advisor_id, signed_at, remark
                ) VALUES (
                    :sid, :seq, :name, :dose,
                    :immunity, :rdate, :evidence, :evidence_path, 
                    :advisor_id, :signed_at, :remark
                )
            ";
            $stmt = $db->prepare($insertSql);

            foreach ($vaccinations as $item) {
                $groupId = $item['group_id'] ?? ($item['sequence_no'] ?? null);
                $receivedDate = !empty($item['received_date']) ? $item['received_date'] : null;
                
                // แปลง Array ของรูปกลับเป็น JSON String 
                $evidencePathJson = !empty($groupEvidencePaths[$groupId]) ? json_encode($groupEvidencePaths[$groupId], JSON_UNESCAPED_UNICODE) : null;

                $advisorNameInput = trim($item['advisor_name'] ?? '');
                $matchedAdvisorId = null;
                $signedAt = null;

                if ($advisorNameInput !== '') {
                    foreach ($facultyList as $fac) {
                        if ($fac['faculty_id'] == $advisorNameInput || 
                            $fac['full_name'] === $advisorNameInput || 
                            $fac['first_name_th'] === $advisorNameInput ||
                            str_contains($advisorNameInput, $fac['first_name_th'])) {
                            $matchedAdvisorId = $fac['faculty_id'];
                            $signedAt = date('Y-m-d H:i:s');
                            break;
                        }
                    }
                    if (!$matchedAdvisorId && is_numeric($advisorNameInput)) {
                        $matchedAdvisorId = $advisorNameInput;
                        $signedAt = date('Y-m-d H:i:s');
                    }
                }

                $stmt->execute([
                    ':sid'           => $student_id,
                    ':seq'           => max(1, (int)($item['sequence_no'] ?? 1)),
                    ':name'          => mb_substr((string)($item['vaccine_name'] ?? 'วัคซีน'), 0, 255),
                    ':dose'          => max(1, (int)($item['dose_no'] ?? 1)),
                    ':immunity'      => $item['immunity_status'] ?? null,
                    ':rdate'         => $receivedDate,
                    ':evidence'      => !empty($groupEvidencePaths[$groupId]) ? 1 : 0,
                    ':evidence_path' => $evidencePathJson,
                    ':advisor_id'    => $matchedAdvisorId,
                    ':signed_at'     => $signedAt,
                    ':remark'        => $item['remark'] ?? null,
                ]);
            }

            $db->commit();
            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'student_vaccinations', "บันทึกและอัปเดตประวัติ/หลักฐานการรับวัคซีนนักศึกษา รหัส: {$student_id}");

        } catch (Throwable $e) {
            $db->rollBack();
            throw $e;
        }

        echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}