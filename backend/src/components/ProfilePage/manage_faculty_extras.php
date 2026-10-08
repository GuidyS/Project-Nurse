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
$action = $_GET['action'] ?? '';

try {
    if ($action === 'upload-workload') {
        if (!isset($_FILES['file'])) throw new Exception("No file uploaded");
        $academicYear = $_POST['academic_year'] ?? '';
        $term = $_POST['term'] ?? '';
        if (!$academicYear || !$term) throw new Exception("Missing academic_year or term");

        $file = $_FILES['file'];
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
        
        echo json_encode(["status" => "success", "message" => "อัปโหลดเรียบร้อยแล้ว", "path" => $dbPath]);
    } 
    elseif ($action === 'delete-workload') {
        $id = $_POST['id'] ?? '';
        $stmt = $db->prepare("SELECT file_path FROM faculty_teaching_workloads WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $fullPath = __DIR__ . '/../../' . $row['file_path'];
            if (file_exists($fullPath)) unlink($fullPath);
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
        
        echo json_encode(["status" => "success", "message" => "บันทึกเรียบร้อยแล้ว"]);
    }
    elseif ($action === 'delete-development') {
        $id = $_POST['id'] ?? '';
        $stmt = $db->prepare("SELECT certificate_file FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?");
        $stmt->execute([$id, $facultyId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['certificate_file']) {
            $fullPath = __DIR__ . '/../../' . $row['certificate_file'];
            if (file_exists($fullPath)) unlink($fullPath);
        }
        $db->prepare("DELETE FROM faculty_personnel_development WHERE id = ? AND faculty_id = ?")->execute([$id, $facultyId]);
        echo json_encode(["status" => "success"]);
    }
    else {
        throw new Exception("Invalid action");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
