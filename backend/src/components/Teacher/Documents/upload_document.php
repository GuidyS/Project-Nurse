<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if (!empty($_POST['name']) && !empty($_POST['course']) && !empty($_POST['type']) && isset($_FILES['file'])) {
        $courseCode = $_POST['course'];
        $name = $_POST['name'];
        $type = $_POST['type']; // e.g. 'มคอ.3'
        $academicYear = $_POST['academic_year'] ?? date('Y') + 543;
        $semester = $_POST['semester'] ?? 1;

        $file = $_FILES['file'];

        if ($file['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = time() . "_" . rand(1000, 9999) . "." . $ext;
            
            $uploadDir = __DIR__ . '/../../../uploads/tqf/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $destPath = $uploadDir . $newFileName;

            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                $sql = "SELECT subject_name_th FROM subject WHERE subject_code = :code";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':code' => $courseCode]);
                $subjectName = $stmt->fetchColumn() ?: '';

                $relativePath = '/uploads/tqf/' . $newFileName;
                
                $insertSql = "INSERT INTO tqf_documents 
                    (subject_code, subject_name, tqf_type, academic_year, semester, approval_status, responsible_teacher, file_name, file_path) 
                    VALUES 
                    (:sc, :sn, :type, :year, :sem, 'รอหัวหน้าภาคฯ', :teacher, :fn, :fp)";
                
                $insertStmt = $pdo->prepare($insertSql);
                $insertStmt->execute([
                    ':sc' => $courseCode,
                    ':sn' => $subjectName,
                    ':type' => $type,
                    ':year' => $academicYear,
                    ':sem' => $semester,
                    ':teacher' => $_SESSION['username'] ?? '',
                    ':fn' => $name,
                    ':fp' => $relativePath
                ]);

                $tqfId = $pdo->lastInsertId();
                $requestSql = "INSERT INTO approval_requests 
                    (request_type, requester_user_id, target_ref_type, target_ref_id, title, status)
                    VALUES ('document_approve', :user, 'tqf_document', :ref_id, :title, 'pending')";
                $reqStmt = $pdo->prepare($requestSql);
                $reqStmt->execute([
                    ':user' => $_SESSION['user_id'] ?? 1,
                    ':ref_id' => $tqfId,
                    ':title' => "อนุมัติเอกสาร TQF: $name ($courseCode)"
                ]);

                echo json_encode(["status" => "success", "message" => "อัปโหลดเอกสารสำเร็จ"]);
            } else {
                echo json_encode(["status" => "error", "message" => "ไม่สามารถบันทึกไฟล์ได้"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดในการอัปโหลดไฟล์: " . $file['error']]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "กรอกข้อมูลไม่ครบถ้วน หรือไม่ได้เลือกไฟล์"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>