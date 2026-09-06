<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

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

    // 🔍 [GET] ดึงข้อมูลวัคซีนพร้อม JOIN ดึงชื่ออาจารย์ที่ปรึกษา
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

        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 💾 [POST] บันทึกข้อมูล
    if ($method === 'POST') {
        $dataRaw = $_POST['vaccinations'] ?? '[]';
        $vaccinations = json_decode($dataRaw, true);

        if (!is_array($vaccinations) || empty($vaccinations)) {
            $input = json_decode(file_get_contents("php://input"), true);
            $vaccinations = $input['vaccinations'] ?? [];
        }

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
        foreach ($vaccinations as $item) {
            $groupId = $item['group_id'] ?? ($item['sequence_no'] ?? null);
            if ($groupId === null || isset($groupEvidencePaths[$groupId])) continue;

            $fileKey = "evidence_file_" . $groupId;
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $fileInfo = $_FILES[$fileKey];
                $ext = strtolower(pathinfo($fileInfo['name'], PATHINFO_EXTENSION));
                if (in_array($ext, ALLOWED_EVIDENCE_EXT, true) && $fileInfo['size'] <= MAX_EVIDENCE_SIZE) {
                    $newFileName = 'vaccine_' . preg_replace('/[^a-zA-Z0-9_]/', '', (string)$groupId) . '_' . time() . '_' . uniqid() . '.' . $ext;
                    $targetFile = $uploadDir . $newFileName;
                    if (move_uploaded_file($fileInfo['tmp_name'], $targetFile)) {
                        $groupEvidencePaths[$groupId] = 'uploads/vaccine_evidence/' . $student_id . '/' . $newFileName;
                    }
                }
            }
        }

        // ดึงรายชื่ออาจารย์ทั้งหมดไว้เพื่อ Match ชื่อที่กรอกเข้ามากับ faculty_id
        $facultyStmt = $db->query("SELECT faculty_id, first_name_th, last_name_th, CONCAT(first_name_th, ' ', last_name_th) AS full_name FROM faculty");
        $facultyList = $facultyStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $db->beginTransaction();

        try {
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
                $evidencePath = $groupEvidencePaths[$groupId] ?? ($item['evidence_file_path'] ?: null);

                // ตรวจสอบและค้นหา faculty_id จากชื่ออาจารย์
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
                    ':evidence'      => !empty($item['evidence_attached']) ? 1 : 0,
                    ':evidence_path' => $evidencePath,
                    ':advisor_id'    => $matchedAdvisorId,
                    ':signed_at'     => $signedAt,
                    ':remark'        => $item['remark'] ?? null,
                ]);
            }

            $db->commit();
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