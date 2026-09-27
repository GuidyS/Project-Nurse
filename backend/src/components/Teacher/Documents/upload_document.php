<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

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

        // ชื่อวิชาตามหลักสูตรที่ใช้งานก่อน แล้วค่อยถอยไปใช้ตาราง subject
        require_once __DIR__ . '/../../../config/active_curriculum.php';
        $subjectName = activeCurriculumSubjectName($pdo, (string)$courseCode);
        if ($subjectName === null) {
            $sql = "SELECT subject_name_th FROM subject WHERE subject_code = :code";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $courseCode]);
            $subjectName = $stmt->fetchColumn() ?: '';
        }

        $teacherName = $_SESSION['username'] ?? '';
        if (!empty($_SESSION['user_id'])) {
            $teacherStmt = $pdo->prepare("
                SELECT TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) AS full_name
                FROM faculty
                WHERE user_id = :user_id
                LIMIT 1
            ");
            $teacherStmt->execute([':user_id' => $_SESSION['user_id']]);
            $resolvedTeacherName = trim((string) ($teacherStmt->fetchColumn() ?: ''));
            if ($resolvedTeacherName !== '') {
                $teacherName = $resolvedTeacherName;
            }
        }
        
        $insertSql = "INSERT INTO tqf_documents 
            (subject_code, subject_name, tqf_type, academic_year, semester, responsible_teacher, file_name, file_path) 
            VALUES 
            (:sc, :sn, :type, :year, :sem, :teacher, :fn, :fp)";
        
        $insertStmt = $pdo->prepare($insertSql);
        $insertStmt->execute([
            ':sc' => $courseCode,
            ':sn' => $subjectName,
            ':type' => $type,
            ':year' => $academicYear,
            ':sem' => $semester,
            ':teacher' => $teacherName,
            ':fn' => $name,
            ':fp' => $googleDriveLink
        ]);

        $tqfId = $pdo->lastInsertId();

        // บันทึก Log เมื่ออัปโหลดเอกสาร มคอ. ใหม่
        logAudit(
            $pdo, 
            $_SESSION['user_id'] ?? null, 
            'create', 
            'documents', 
            "อัปโหลดเอกสาร $type (ID: $tqfId) รายวิชา: $courseCode"
        );

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
