<?php
// 1. ตรวจสอบสถานะการเปิดใช้งาน Session ป้องกันการเปิดซ้ำ
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. เคลียร์ Output Buffer ป้องกัน Warning ไปกวนก้อน JSON หน้าบ้าน
ob_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 3. ลอจิกตรวจสอบคีย์ Session
$student_raw_id = null;
if (isset($_SESSION['username'])) {
    $student_raw_id = $_SESSION['username'];
} elseif (isset($_SESSION['user_id'])) {
    $student_raw_id = $_SESSION['user_id'];
}

if (!$student_raw_id) {
    ob_clean();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(["status" => "error", "message" => "กรุณาเข้าสู่ระบบใหม่อีกครั้ง"]);
    exit();
}

require_once __DIR__ . '/../../../config/config.php'; 
if (file_exists(__DIR__ . '/../../../config/academic_helper.php')) {
    require_once __DIR__ . '/../../../config/academic_helper.php';
}

try {
    $db = new Connect();
    $student_session_id = trim((string)$student_raw_id);

    // ตรวจสอบข้อมูลผู้ใช้ในกรณีที่เป็น user_id
    $stmtUser = $db->prepare("SELECT username, role_id FROM users WHERE username = :u1 OR user_id = :u2 LIMIT 1");
    $stmtUser->execute([':u1' => $student_session_id, ':u2' => $student_session_id]);
    $userRow = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if ($userRow && !empty($userRow['username'])) {
        $student_session_id = $userRow['username'];
    }

    // ----------------------------------------------------
    // จัดการ POST Action (Upload / Delete)
    // ----------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'upload-registration') {
            $academicYear = trim($_POST['academic_year'] ?? '');
            $semester = trim($_POST['semester'] ?? '');
            $courseCount = max(1, (int)($_POST['course_count'] ?? 1));

            if (!$academicYear || !$semester) {
                throw new Exception("กรุณาระบุปีการศึกษาและภาคเรียน");
            }
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== 0) {
                throw new Exception("กรุณาเลือกไฟล์ใบลงทะเบียนเรียน");
            }

            $file = $_FILES['file'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['pdf', 'jpg', 'jpeg', 'png', 'webp'])) {
                throw new Exception("รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP เท่านั้น");
            }

            $uploadDir = __DIR__ . '/../../../uploads/student-documents/' . $student_session_id . '/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filename = 'reg_' . uniqid() . '.' . $ext;
            $dest = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                throw new Exception("ไม่สามารถบันทึกไฟล์ได้");
            }

            $dbPath = 'uploads/student-documents/' . $student_session_id . '/' . $filename;

            $stmt = $db->prepare("INSERT INTO student_course_registrations (student_id, academic_year, semester, course_count, file_path) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$student_session_id, $academicYear, $semester, $courseCount, $dbPath]);

            ob_clean();
            echo json_encode(["status" => "success", "message" => "อัปโหลดใบลงทะเบียนเรียนเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($action === 'delete-registration') {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) throw new Exception("Invalid ID");

            $stmt = $db->prepare("SELECT file_path FROM student_course_registrations WHERE id = ? AND student_id = ?");
            $stmt->execute([$id, $student_session_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $fullPath = __DIR__ . '/../../../' . $row['file_path'];
                if (file_exists($fullPath)) {
                    @unlink($fullPath);
                }
                $db->prepare("DELETE FROM student_course_registrations WHERE id = ? AND student_id = ?")->execute([$id, $student_session_id]);
            }

            ob_clean();
            echo json_encode(["status" => "success", "message" => "ลบใบลงทะเบียนเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($action === 'upload-term-grade') {
            $academicYear = trim($_POST['academic_year'] ?? '');
            $semester = trim($_POST['semester'] ?? '');
            $gpa = !empty($_POST['gpa']) ? (float)$_POST['gpa'] : null;

            if (!$academicYear || !$semester) {
                throw new Exception("กรุณาระบุปีการศึกษาและภาคเรียน");
            }
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== 0) {
                throw new Exception("กรุณาเลือกไฟล์ใบรายงานผลการเรียน/เกรด");
            }

            $file = $_FILES['file'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['pdf', 'jpg', 'jpeg', 'png', 'webp'])) {
                throw new Exception("รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP เท่านั้น");
            }

            $uploadDir = __DIR__ . '/../../../uploads/student-documents/' . $student_session_id . '/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filename = 'grade_' . uniqid() . '.' . $ext;
            $dest = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                throw new Exception("ไม่สามารถบันทึกไฟล์ได้");
            }

            $dbPath = 'uploads/student-documents/' . $student_session_id . '/' . $filename;

            $stmt = $db->prepare("INSERT INTO student_term_grades (student_id, academic_year, semester, gpa, file_path) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$student_session_id, $academicYear, $semester, $gpa, $dbPath]);

            ob_clean();
            echo json_encode(["status" => "success", "message" => "อัปโหลดใบเกรดเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if ($action === 'delete-term-grade') {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) throw new Exception("Invalid ID");

            $stmt = $db->prepare("SELECT file_path FROM student_term_grades WHERE id = ? AND student_id = ?");
            $stmt->execute([$id, $student_session_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $fullPath = __DIR__ . '/../../../' . $row['file_path'];
                if (file_exists($fullPath)) {
                    @unlink($fullPath);
                }
                $db->prepare("DELETE FROM student_term_grades WHERE id = ? AND student_id = ?")->execute([$id, $student_session_id]);
            }

            ob_clean();
            echo json_encode(["status" => "success", "message" => "ลบใบเกรดเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        throw new Exception("Action ไม่ถูกต้อง");
    }

    // ----------------------------------------------------
    // GET: ดึงข้อมูลโปรไฟล์, ใบลงทะเบียน, และใบเกรด
    // ----------------------------------------------------
    $sql_profile = "SELECT s.student_id AS student_code, 
                           CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) AS student_name,
                           'พยาบาลศาสตร์' AS faculty,
                           'หลักสูตรพยาบาลศาสตรบัณฑิต' AS major,
                           s.admission_year,
                           IFNULL(s.year_level, 1) AS current_year,
                           (
                               SELECT TRIM(CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th))
                               FROM student_advisor_mapping sam
                               JOIN faculty f ON sam.faculty_id = f.faculty_id
                               WHERE sam.student_id = s.student_id
                                 AND (sam.advisor_type != 'practical' OR sam.advisor_type IS NULL)
                               ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                               LIMIT 1
                           ) AS advisor_name,
                           (
                               SELECT f.email
                               FROM student_advisor_mapping sam
                               JOIN faculty f ON sam.faculty_id = f.faculty_id
                               WHERE sam.student_id = s.student_id
                                 AND (sam.advisor_type != 'practical' OR sam.advisor_type IS NULL)
                               ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                               LIMIT 1
                           ) AS advisor_email,
                           (
                               SELECT TRIM(CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th))
                               FROM student_advisor_mapping sam
                               JOIN faculty f ON sam.faculty_id = f.faculty_id
                               WHERE sam.student_id = s.student_id
                                 AND sam.advisor_type = 'practical'
                               ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                               LIMIT 1
                           ) AS practical_advisor_name,
                           (
                               SELECT f.email
                               FROM student_advisor_mapping sam
                               JOIN faculty f ON sam.faculty_id = f.faculty_id
                               WHERE sam.student_id = s.student_id
                                 AND sam.advisor_type = 'practical'
                               ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                               LIMIT 1
                           ) AS practical_advisor_email
                    FROM student s 
                    WHERE s.student_id = :student_id LIMIT 1";
                    
    $stmt_profile = $db->prepare($sql_profile);
    $stmt_profile->execute([':student_id' => $student_session_id]);
    $profile = $stmt_profile->fetch(PDO::FETCH_ASSOC);

    if ($profile) {
        $realtimeYearLevel = null;
        if (function_exists('calculateRealtimeAcademicInfo')) {
            $academicInfo = calculateRealtimeAcademicInfo(
                $profile['student_code'],
                $profile['admission_year'] ?? null,
                $db
            );
            $realtimeYearLevel = (int)$academicInfo['year_level'];
            $profile['current_year'] = $realtimeYearLevel;
            $profile['academic_year'] = (int)$academicInfo['academic_year'];
        } else {
            $cleanId = trim((string)$profile['student_code']);
            if (strlen($cleanId) >= 2 && is_numeric(substr($cleanId, 0, 2))) {
                $now = new DateTime();
                $currY = (int)$now->format('Y') + 543;
                $cutOff = new DateTime($now->format('Y') . '-08-10 00:00:00');
                $ay = ($now >= $cutOff) ? $currY : ($currY - 1);
                $entryY = 2500 + (int)substr($cleanId, 0, 2);
                $yl = $ay - $entryY + 1;
                if ($yl < 1) $yl = 1;
                if ($yl > 8) $yl = 8;
                $realtimeYearLevel = $yl;
                $profile['current_year'] = $yl;
            }
        }

        // ซิงค์ค่า year_level กลับไปยัง student table เพื่อความสอดคล้อง
        if ($realtimeYearLevel !== null) {
            try {
                $syncStmt = $db->prepare("UPDATE student SET year_level = :yl WHERE student_id = :sid");
                $syncStmt->execute([':yl' => $realtimeYearLevel, ':sid' => $profile['student_code']]);
            } catch (Exception $ignored) {
            }
        }
    }

    if (!$profile) {
        ob_clean();
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Student profile not found",
            "data" => [
                "profile" => null,
                "registrations" => [],
                "term_grades" => []
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ดึงใบลงทะเบียนเรียน
    $stmtReg = $db->prepare("SELECT id, academic_year, semester, course_count, file_path, uploaded_at FROM student_course_registrations WHERE student_id = ? ORDER BY academic_year DESC, semester DESC, id DESC");
    $stmtReg->execute([$student_session_id]);
    $registrations = $stmtReg->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // ดึงใบรายงานผลการเรียน/เกรดแต่ละเทอม
    $stmtGrades = $db->prepare("SELECT id, academic_year, semester, gpa, file_path, uploaded_at FROM student_term_grades WHERE student_id = ? ORDER BY academic_year DESC, semester DESC, id DESC");
    $stmtGrades->execute([$student_session_id]);
    $termGrades = $stmtGrades->fetchAll(PDO::FETCH_ASSOC) ?: [];

    ob_clean();
    echo json_encode([
        "status" => "success",
        "data" => [
            "profile" => $profile,
            "registrations" => $registrations,
            "term_grades" => $termGrades
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
