<?php
// อาจารย์อัปโหลดรูปใบประกอบวิชาชีพการพยาบาลของตัวเอง (หน้าข้อมูลส่วนตัว)
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/license_reminder_helpers.php';

header("Content-Type: application/json; charset=UTF-8");

const LICENSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const LICENSE_IMAGE_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

function licenseImageRespond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    if (!isset($_SESSION['user_id'])) {
        licenseImageRespond(401, ["status" => "error", "message" => "Unauthorized"]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        licenseImageRespond(405, ["status" => "error", "message" => "Method not allowed"]);
    }

    $db = new Connect();
    licenseReminderEnsureSchema($db);

    $stmt = $db->prepare("
        SELECT u.role_id, f.faculty_id, f.license_image
        FROM users u
        LEFT JOIN faculty f ON f.faculty_id = u.username
        WHERE u.user_id = ?
        LIMIT 1
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)$user['role_id'] === 3 || $user['faculty_id'] === null) {
        licenseImageRespond(403, ["status" => "error", "message" => "เฉพาะอาจารย์และบุคลากรเท่านั้นที่อัปโหลดใบประกอบวิชาชีพได้"]);
    }

    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        licenseImageRespond(400, ["status" => "error", "message" => "กรุณาเลือกรูปภาพใบประกอบวิชาชีพ"]);
    }
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || $file['size'] > LICENSE_IMAGE_MAX_BYTES) {
        licenseImageRespond(400, ["status" => "error", "message" => "รูปภาพต้องมีขนาดไม่เกิน 5 MB"]);
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        licenseImageRespond(400, ["status" => "error", "message" => "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่"]);
    }

    // ตรวจชนิดไฟล์จากเนื้อไฟล์จริง ไม่เชื่อนามสกุลที่ส่งมา
    $mime = mime_content_type($file['tmp_name']);
    if (!is_string($mime) || !array_key_exists($mime, LICENSE_IMAGE_TYPES)) {
        licenseImageRespond(400, ["status" => "error", "message" => "รองรับเฉพาะรูปภาพ JPG, PNG หรือ WEBP"]);
    }

    $owner = preg_replace('/[^A-Za-z0-9_-]/', '_', (string)$user['faculty_id']);
    $relativeDir = 'uploads/user-documents/' . $owner;
    $absoluteDir = __DIR__ . '/../../../' . $relativeDir;
    if (!is_dir($absoluteDir) && !mkdir($absoluteDir, 0775, true)) {
        throw new RuntimeException('สร้างโฟลเดอร์เก็บไฟล์ไม่สำเร็จ');
    }

    $fileName = 'license_image_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . LICENSE_IMAGE_TYPES[$mime];
    if (!move_uploaded_file($file['tmp_name'], $absoluteDir . '/' . $fileName)) {
        throw new RuntimeException('บันทึกไฟล์ลงเซิร์ฟเวอร์ไม่สำเร็จ');
    }
    $relativePath = $relativeDir . '/' . $fileName;

    $db->prepare("UPDATE faculty SET license_image = ? WHERE faculty_id = ?")
       ->execute([$relativePath, $user['faculty_id']]);

    // ลบรูปเก่า — เฉพาะรูปใบประกอบวิชาชีพในโฟลเดอร์ของเจ้าของเท่านั้น
    $old = (string)($user['license_image'] ?? '');
    if ($old !== '' && dirname($old) === $relativeDir && str_starts_with(basename($old), 'license_image_')) {
        $oldAbsolute = __DIR__ . '/../../../' . $old;
        if (is_file($oldAbsolute)) {
            @unlink($oldAbsolute);
        }
    }

    logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'license_images', "อัปโหลด/เปลี่ยนรูปใบประกอบวิชาชีพ (faculty_id: {$user['faculty_id']})");

    licenseImageRespond(200, [
        "status" => "success",
        "message" => "อัปโหลดรูปใบประกอบวิชาชีพแล้ว",
        "data" => ["license_image" => $relativePath],
    ]);
} catch (Throwable $e) {
    licenseImageRespond(500, ["status" => "error", "message" => $e->getMessage()]);
}
