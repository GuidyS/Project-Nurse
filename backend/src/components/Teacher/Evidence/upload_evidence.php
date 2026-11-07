<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper
require_once __DIR__ . '/../../../config/storage.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status"=>"error","message"=>"Unauthorized"]);
        exit;
    }
    $userStmt = $pdo->prepare('SELECT username,role_id FROM users WHERE user_id=? LIMIT 1');
    $userStmt->execute([$_SESSION['user_id']]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);
    if (!$currentUser || !in_array((int)$currentUser['role_id'], [1,2], true)) {
        http_response_code(403);
        echo json_encode(["status"=>"error","message"=>"Forbidden"]);
        exit;
    }
    // 1. อ่านค่าตัวแปรจาก $_POST หรือ JSON input
    $studentId = $_POST['studentId'] ?? '';
    $title = $_POST['title'] ?? '';
    $type = $_POST['type'] ?? '';

    if (empty($studentId) || empty($title) || empty($type)) {
        $input = json_decode(file_get_contents("php://input"), true);
        $studentId = $input['studentId'] ?? '';
        $title = $input['title'] ?? '';
        $type = $input['type'] ?? '';
    }

    if (!empty($studentId) && !empty($title) && !empty($type)) {
        
        // 2. หารหัส Primary Key ของนักศึกษา
        $stmt_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_std->execute([$studentId]);
        $student_id = $stmt_std->fetchColumn();

        if (!$student_id) {
            echo json_encode(["status" => "error", "message" => "ไม่พบรหัสนักศึกษาในระบบ"]);
            exit();
        }
        if ((int)$currentUser['role_id'] === 2) {
            $advisorStmt = $pdo->prepare('SELECT 1 FROM student_advisor_mapping WHERE student_id=? AND faculty_id=? LIMIT 1');
            $advisorStmt->execute([$student_id, $currentUser['username']]);
            if (!$advisorStmt->fetchColumn()) {
                http_response_code(403);
                echo json_encode(["status"=>"error","message"=>"ไม่มีสิทธิ์จัดการหลักฐานของนักศึกษาคนนี้"]);
                exit;
            }
        }

        // 3. จัดการเรื่องอัปโหลดไฟล์จริง
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $error_code = $_FILES['file']['error'] ?? 'unknown';
            echo json_encode(["status" => "error", "message" => "อัปโหลดไฟล์ไม่สำเร็จ (Error Code: $error_code). ไฟล์อาจมีขนาดใหญ่เกินไป"]);
            exit();
        }
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mime_type = mime_content_type($fileTmpPath);
        if ((int)($_FILES['file']['size'] ?? 0) <= 0 || (int)$_FILES['file']['size'] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["status"=>"error","message"=>"ไฟล์หลักฐานต้องมีขนาดไม่เกิน 10 MB"]);
            exit;
        }
        $allowedMimes = ['application/pdf','image/jpeg','image/png','image/gif','video/mp4','video/quicktime'];
        if (!$mime_type || !in_array($mime_type, $allowedMimes, true)) {
            http_response_code(400);
            echo json_encode(["status"=>"error","message"=>"ชนิดไฟล์หลักฐานไม่รองรับ"]);
            exit;
        }
        
        $is_image = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif']);
        $is_video = in_array($fileExtension, ['mp4', 'mov', 'avi']);
        $file_category = $is_image ? 'image' : ($is_video ? 'video' : 'document');

        $pdo->beginTransaction();
        $stored = storagePutUploadedFile($pdo, $_FILES['file'], [
            'owner_type' => 'student', 'owner_id' => $student_id,
            'resource_type' => 'portfolio', 'access_scope' => 'student_advisor_admin',
            'mime_type' => $mime_type ?: 'application/octet-stream',
        ]);
        $sql = "INSERT INTO portfolio (
                    student_id,
                    title,
                    type,
                    file_name,
                    file_path,
                    mime_type,
                    file_category
                ) VALUES (
                    :student_id,
                    :title,
                    :type,
                    :file_name,
                    :file_path,
                    :mime_type,
                    :file_category
                )";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_id' => $student_id,
            ':title' => $title,
            ':type' => $type,
            ':file_name' => $fileName,
            ':file_path' => $stored['reference'],
            ':mime_type' => $mime_type ?: null,
            ':file_category' => $file_category
        ]);

        $portfolioId = $pdo->lastInsertId();
        $pdo->prepare('UPDATE storage_objects SET resource_id = :resource_id WHERE storage_id = :id')
            ->execute([':resource_id' => $portfolioId, ':id' => $stored['id']]);
        $pdo->commit();

        // บันทึก Log การอัปโหลดหลักฐาน
        try {
            logAudit(
                $pdo,
                $_SESSION['user_id'] ?? null,
                'create',
                'evidence',
                "อัปโหลดหลักฐาน/พอร์ตโฟลิโอ: {$title} (ID: {$portfolioId}) ให้กับนักศึกษารหัส: {$studentId}"
            );
        } catch (Throwable $auditError) {
            error_log('Evidence audit log failed: ' . $auditError->getMessage());
        }

        echo json_encode(["status" => "success", "message" => "อัปโหลดหลักฐานสำเร็จ"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    if (isset($stored['object_key'])) storageDeleteObjectKey($stored['object_key']);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
