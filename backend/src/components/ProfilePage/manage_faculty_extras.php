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
$rawInput = file_get_contents('php://input');
$jsonBody = !empty($rawInput) ? json_decode($rawInput, true) : null;
$action = $_POST['action'] ?? $_GET['action'] ?? ($jsonBody['action'] ?? '');

function ensureFacultyExtrasSchema(PDO $db): void {
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS `faculty_teaching_workloads` (
          `id` bigint NOT NULL AUTO_INCREMENT,
          `faculty_id` bigint NOT NULL,
          `academic_year` int NOT NULL,
          `term` varchar(20) NOT NULL,
          `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `idx_faculty` (`faculty_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $db->exec("CREATE TABLE IF NOT EXISTS `faculty_personnel_development` (
          `id` bigint NOT NULL AUTO_INCREMENT,
          `faculty_id` bigint NOT NULL,
          `training_date` date NOT NULL,
          `training_topic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
          `learnings` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          `certificate_file` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `idx_faculty` (`faculty_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $checkCol = $db->query("SHOW COLUMNS FROM `faculty_teaching_workloads` LIKE 'academic_year'")->fetch(PDO::FETCH_ASSOC);
        if ($checkCol && strtolower((string)$checkCol['Type']) === 'year') {
            $db->exec("ALTER TABLE `faculty_teaching_workloads` MODIFY COLUMN `academic_year` INT NOT NULL");
        }
        $checkTerm = $db->query("SHOW COLUMNS FROM `faculty_teaching_workloads` LIKE 'term'")->fetch(PDO::FETCH_ASSOC);
        if ($checkTerm && stripos((string)$checkTerm['Type'], 'bit') !== false) {
            $db->exec("ALTER TABLE `faculty_teaching_workloads` MODIFY COLUMN `term` VARCHAR(20) NOT NULL");
        }
    } catch (Throwable $e) {
        // ignore schema auto-migration errors
    }
}

ensureFacultyExtrasSchema($db);

try {
    if ($action === 'upload-workload') {
        if (!isset($_FILES['file'])) throw new Exception("No file uploaded");
        $academicYear = trim($_POST['academic_year'] ?? ($jsonBody['academic_year'] ?? ''));
        $term = trim($_POST['term'] ?? ($jsonBody['term'] ?? ''));
        if (!$academicYear || !$term) throw new Exception("Missing academic_year or term");
        if (!in_array((string)$term, ['1', '2', '3'], true)) {
            throw new Exception("เทอมต้องเป็น 1, 2 หรือ 3 เท่านั้น");
        }

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("เกิดข้อผิดพลาดในการอัปโหลดไฟล์ (รหัส: " . $file['error'] . ")");
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['xls', 'xlsx', 'csv', 'pdf', 'doc', 'docx'])) {
            throw new Exception("Invalid file type");
        }

        $uploadDir = __DIR__ . '/../../uploads/faculty-extras/' . $facultyId . '/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $filename = uniqid('wl_') . '.' . $ext;
        $dest = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception("Failed to save file");
        }
        
        $dbPath = 'uploads/faculty-extras/' . $facultyId . '/' . $filename;

        $stmt = $db->prepare("INSERT INTO faculty_teaching_workloads (faculty_id, academic_year, term, file_path) VALUES (?, ?, ?, ?)");
        $stmt->execute([$facultyId, $academicYear, $term, $dbPath]);
        
        echo json_encode(["status" => "success", "message" => "อัปโหลดเรียบร้อยแล้ว", "path" => $dbPath], JSON_UNESCAPED_UNICODE);
    } 
    elseif ($action === 'delete-workload') {
        $id = $_POST['id'] ?? $_GET['id'] ?? ($jsonBody['id'] ?? '');
        if (!$id) throw new Exception("Missing ID");
        $stmt = $db->prepare("SELECT file_path FROM faculty_teaching_workloads WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $fullPath = __DIR__ . '/../../' . $row['file_path'];
            if (file_exists($fullPath)) @unlink($fullPath);
            $db->prepare("DELETE FROM faculty_teaching_workloads WHERE id = ? AND faculty_id = ?")->execute([$id, $facultyId]);
        }
        echo json_encode(["status" => "success", "message" => "ลบเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
    }
    elseif ($action === 'add-development') {
        $trainingDate = trim($_POST['training_date'] ?? ($jsonBody['training_date'] ?? ''));
        $trainingTopic = trim($_POST['training_topic'] ?? ($jsonBody['training_topic'] ?? ''));
        $learnings = trim($_POST['learnings'] ?? ($jsonBody['learnings'] ?? ''));
        if (!$trainingDate || !$trainingTopic) throw new Exception("ข้อมูลไม่ครบถ้วน");

        $dbPath = null;
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['file'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'])) {
                throw new Exception("Invalid file type for certificate");
            }
            $uploadDir = __DIR__ . '/../../uploads/faculty-extras/' . $facultyId . '/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $filename = uniqid('cert_') . '.' . $ext;
            $dest = $uploadDir . $filename;
            if (move_uploaded_file($file['tmp_name'], $dest)) {
                $dbPath = 'uploads/faculty-extras/' . $facultyId . '/' . $filename;
            }
        }

        $stmt = $db->prepare("INSERT INTO faculty_personnel_development (faculty_id, training_date, training_topic, learnings, certificate_file) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$facultyId, $trainingDate, $trainingTopic, $learnings, $dbPath]);
        
        echo json_encode(["status" => "success", "message" => "บันทึกเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
    }
    elseif ($action === 'delete-development') {
        $id = $_POST['id'] ?? $_GET['id'] ?? ($jsonBody['id'] ?? '');
        if (!$id) throw new Exception("Missing ID");
        $stmt = $db->prepare("SELECT certificate_file FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['certificate_file']) {
            $fullPath = __DIR__ . '/../../' . $row['certificate_file'];
            if (file_exists($fullPath)) @unlink($fullPath);
        }
        $db->prepare("DELETE FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?")->execute([$id, $facultyId]);
        echo json_encode(["status" => "success", "message" => "ลบเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
    }
    else {
        throw new Exception("Invalid action");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
