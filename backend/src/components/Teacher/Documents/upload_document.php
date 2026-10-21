<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper
require_once __DIR__ . '/document_access.php';

try {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    $pdo = new Connect();
    $input = json_decode(file_get_contents('php://input'), true);

    if (!empty($input['course']) && !empty($input['type']) && !empty($input['google_drive_link'])) {
        $courseCode = trim((string)$input['course']);
        if (documentAccessRole($pdo, $_SESSION['user_id']) === null) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            exit;
        }
        $name = trim((string)($input['name'] ?? ''));
        if ($name === '') $name = trim((string)$input['type']) . ' - ' . $courseCode;
        $type = $input['type']; // e.g. 'มคอ.3'
        $academicYear = $input['academic_year'] ?? currentAcademicYear(null, $pdo);
        if (!is_scalar($academicYear) || !preg_match('/^\d{4}$/', (string)$academicYear) || (int)$academicYear < 2500 || (int)$academicYear > 2700) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'ปีการศึกษาต้องเป็น พ.ศ. 2500–2700'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $semester = $input['semester'] ?? 1;
        $googleDriveLink = trim((string)$input['google_drive_link']);
        if (!filter_var($googleDriveLink, FILTER_VALIDATE_URL) || !in_array(parse_url($googleDriveLink, PHP_URL_SCHEME), ['https', 'http'], true)) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'ลิงก์เอกสารไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ชื่อวิชาตามหลักสูตรที่ใช้งานก่อน แล้วค่อยถอยไปใช้ตาราง subject
        require_once __DIR__ . '/../../../config/active_curriculum.php';
        $subjectName = activeCurriculumSubjectName($pdo, (string)$courseCode);
        if ($subjectName === null) {
            $sql = "SELECT subject_name_th FROM subject WHERE subject_code = :code";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $courseCode]);
            $subjectName = $stmt->fetchColumn() ?: '';
        }
        if ($subjectName === '') {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบรายวิชา'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Store a stable owner identifier so teachers can delete only their own entries.
        $teacherName = cloAccessFacultyId($pdo, $_SESSION['user_id']) ?? '';
        
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
} catch (Throwable $e) {
    error_log('upload-document failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถบันทึกเอกสารได้'], JSON_UNESCAPED_UNICODE);
}
