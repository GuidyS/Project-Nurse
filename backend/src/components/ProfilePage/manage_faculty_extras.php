<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

$db = new Connect();
$userId = $_SESSION['user_id'];

// Get faculty_id
$stmt = $db->prepare("SELECT username FROM users WHERE user_id = :id AND role_id != 3");
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
    exit;
}

$facultyId = $user['username'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';
$safeFacultyId = preg_replace('/[^A-Za-z0-9_-]/', '_', (string)$facultyId);

function facultyExtrasLocalFile(string $path): ?string
{
    $uploadsRoot = realpath(__DIR__ . '/../../uploads');
    $file = realpath(__DIR__ . '/../../' . ltrim($path, '/\\'));
    return $uploadsRoot !== false && $file !== false
        && str_starts_with($file, $uploadsRoot . DIRECTORY_SEPARATOR)
        && is_file($file) ? $file : null;
}

try {
    if ($action === 'upload-workload') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) throw new Exception("ไม่สามารถรับไฟล์ที่อัปโหลดได้");
        $academicYear = $_POST['academic_year'] ?? '';
        $term = $_POST['term'] ?? '';
        if (!preg_match('/^25\d{2}$/', (string)$academicYear) || !in_array((string)$term, ['1', '2', '3'], true)) throw new Exception("ปีการศึกษาหรือภาคเรียนไม่ถูกต้อง");

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['xls', 'xlsx', 'csv', 'pdf', 'doc', 'docx'], true)
            || $file['size'] < 1 || $file['size'] > 10 * 1024 * 1024
            || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception("Invalid file type");
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $allowedMime = [
            'xls' => ['application/vnd.ms-excel', 'application/octet-stream'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
            'csv' => ['text/plain', 'text/csv', 'application/vnd.ms-excel'],
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword', 'application/octet-stream'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        ];
        if (!in_array($mime, $allowedMime[$ext], true)) throw new Exception('ชนิดไฟล์ไม่ตรงกับนามสกุล');

        $uploadDir = __DIR__ . '/../../uploads/faculty-extras/' . $safeFacultyId . '/';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0750, true)) throw new Exception('ไม่สามารถสร้างที่เก็บไฟล์ได้');
        
        $filename = uniqid('wl_') . '.' . $ext;
        $dest = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception("Failed to save file");
        }
        
        $dbPath = 'uploads/faculty-extras/' . $safeFacultyId . '/' . $filename;

        $stmt = $db->prepare("INSERT INTO faculty_teaching_workloads (faculty_id, academic_year, term, file_path) VALUES (?, ?, ?, ?)");
        $stmt->execute([$facultyId, $academicYear, $term, $dbPath]);
        
        echo json_encode(["status" => "success", "message" => "อัปโหลดเรียบร้อยแล้ว", "path" => $dbPath]);
    } 
    elseif ($action === 'delete-workload') {
        $id = $_POST['id'] ?? '';
        $stmt = $db->prepare("SELECT file_path FROM faculty_teaching_workloads WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $fullPath = facultyExtrasLocalFile((string)$row['file_path']);
            if ($fullPath !== null) unlink($fullPath);
            $db->prepare("DELETE FROM faculty_teaching_workloads WHERE id = ?")->execute([$id]);
        }
        echo json_encode(["status" => "success"]);
    }
    elseif ($action === 'add-development') {
        $trainingDate = $_POST['training_date'] ?? '';
        $trainingTopic = $_POST['training_topic'] ?? '';
        $learnings = $_POST['learnings'] ?? '';
        if (!$trainingDate || !$trainingTopic) throw new Exception("ข้อมูลไม่ครบถ้วน");

        $dbPath = null;
        if (isset($_FILES['file']) && $_FILES['file']['error'] === 0) {
            $file = $_FILES['file'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], true)
                || $file['size'] < 1 || $file['size'] > 10 * 1024 * 1024
                || !is_uploaded_file($file['tmp_name'])) {
                throw new Exception("Invalid file type for certificate");
            }
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
            $certificateMimes = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'pdf' => 'application/pdf'];
            if ($mime !== $certificateMimes[$ext]) {
                throw new Exception('ชนิดไฟล์หลักฐานไม่ถูกต้อง');
            }
            $uploadDir = __DIR__ . '/../../uploads/faculty-extras/' . $safeFacultyId . '/';
            if (!is_dir($uploadDir) && !mkdir($uploadDir, 0750, true)) throw new Exception('ไม่สามารถสร้างที่เก็บไฟล์ได้');
            
            $filename = uniqid('cert_') . '.' . $ext;
            $dest = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) throw new Exception('ไม่สามารถบันทึกไฟล์หลักฐานได้');
            $dbPath = 'uploads/faculty-extras/' . $safeFacultyId . '/' . $filename;
        } elseif (isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
            throw new Exception('ไม่สามารถรับไฟล์หลักฐานที่อัปโหลดได้');
        }

        $stmt = $db->prepare("INSERT INTO faculty_personnel_development (faculty_id, training_date, training_topic, learnings, certificate_file) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$facultyId, $trainingDate, $trainingTopic, $learnings, $dbPath]);
        
        echo json_encode(["status" => "success", "message" => "บันทึกเรียบร้อยแล้ว"]);
    }
    elseif ($action === 'delete-development') {
        $id = $_POST['id'] ?? '';
        $stmt = $db->prepare("SELECT certificate_file FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['certificate_file']) {
            $fullPath = facultyExtrasLocalFile((string)$row['certificate_file']);
            if ($fullPath !== null) unlink($fullPath);
        }
        $db->prepare("DELETE FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?")->execute([$id, $facultyId]);
        echo json_encode(["status" => "success"]);
    }
    else {
        throw new Exception("Invalid action");
    }
} catch (PDOException $e) {
    error_log('manage-faculty-extras database error: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถบันทึกข้อมูลได้'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
