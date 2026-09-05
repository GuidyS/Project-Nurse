<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!empty($input['name']) && !empty($input['course']) && !empty($input['type']) && !empty($input['google_drive_link'])) {
        $courseCode = $input['course'];
        $name = $input['name'];
        $type = $input['type']; // e.g. 'มคอ.3'
        $academicYear = $input['academic_year'] ?? date('Y') + 543;
        $semester = $input['semester'] ?? 1;
        $googleDriveLink = trim($input['google_drive_link']);

        $sql = "SELECT subject_name_th FROM subject WHERE subject_code = :code";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':code' => $courseCode]);
        $subjectName = $stmt->fetchColumn() ?: '';
        
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
            ':fp' => $googleDriveLink
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

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}