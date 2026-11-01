<?php
/**
 * student_license_helper.php
 * ตัวช่วยจัดการ schema และไฟล์หลักฐานการสอบใบประกอบวิชาชีพของนักศึกษา
 */

if (!defined('STUDENT_LICENSE_EVIDENCE_MAX_BYTES')) {
    define('STUDENT_LICENSE_EVIDENCE_MAX_BYTES', 5 * 1024 * 1024);
}

if (!defined('STUDENT_LICENSE_EVIDENCE_MIME_EXTENSIONS')) {
    define('STUDENT_LICENSE_EVIDENCE_MIME_EXTENSIONS', [
        'application/pdf' => 'pdf',
        'application/x-pdf' => 'pdf',
        'application/octet-stream' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
    ]);
}

/**
 * ตรวจสอบและสร้างคอลัมน์ข้อมูลการสอบใบประกอบวิชาชีพในตาราง student อัตโนมัติถ้ายังไม่มี
 */
function studentLicenseEnsureSchema(PDO $db): void
{
    $columns = [
        'license_first_attempt_passed' => "ALTER TABLE student ADD COLUMN license_first_attempt_passed TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'ผ่านสอบใบประกอบวิชาชีพครั้งแรก'",
        'license_first_attempt_passed_at' => "ALTER TABLE student ADD COLUMN license_first_attempt_passed_at DATETIME DEFAULT NULL COMMENT 'วันที่บันทึกว่าผ่านสอบใบประกอบวิชาชีพครั้งแรก'",
        'license_first_attempt_evidence_path' => "ALTER TABLE student ADD COLUMN license_first_attempt_evidence_path VARCHAR(255) DEFAULT NULL COMMENT 'ไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพครั้งแรก'",
        'license_first_attempt_evidence_name' => "ALTER TABLE student ADD COLUMN license_first_attempt_evidence_name VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพครั้งแรก'",
        'license_within_one_year_passed' => "ALTER TABLE student ADD COLUMN license_within_one_year_passed TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'ผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี'",
        'license_within_one_year_passed_at' => "ALTER TABLE student ADD COLUMN license_within_one_year_passed_at DATETIME DEFAULT NULL COMMENT 'วันที่บันทึกว่าผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี'",
        'license_within_one_year_evidence_path' => "ALTER TABLE student ADD COLUMN license_within_one_year_evidence_path VARCHAR(255) DEFAULT NULL COMMENT 'ไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี'",
        'license_within_one_year_evidence_name' => "ALTER TABLE student ADD COLUMN license_within_one_year_evidence_name VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี'",
    ];

    foreach ($columns as $column => $alterSql) {
        $stmt = $db->prepare("
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'student'
              AND COLUMN_NAME = :column
        ");
        $stmt->execute([':column' => $column]);
        if ((int)$stmt->fetchColumn() === 0) {
            $db->exec($alterSql);
        }
    }
}

/**
 * แปลงค่าที่ส่งมาจาก client ให้เป็น boolean
 */
function studentLicenseBool($value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    $normalized = strtolower(trim((string)$value));
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

/**
 * ตรวจสอบไฟล์อัปโหลดใน $_FILES
 */
function studentLicenseUploadedFile(string $fieldName): ?array
{
    if (!isset($_FILES[$fieldName]) || !is_array($_FILES[$fieldName])) {
        return null;
    }
    $file = $_FILES[$fieldName];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    return $file;
}

/**
 * บันทึกไฟล์หลักฐานการสอบใบประกอบวิชาชีพของนักศึกษา
 */
function studentLicenseSaveEvidence(array $file, string $studentId, string $prefix): array
{
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => "ไฟล์หลักฐานใหญ่เกิน upload_max_filesize ของ PHP",
        UPLOAD_ERR_FORM_SIZE => "ไฟล์หลักฐานใหญ่เกินขนาดที่ฟอร์มกำหนด",
        UPLOAD_ERR_PARTIAL => "ไฟล์หลักฐานอัปโหลดมาไม่ครบ",
        UPLOAD_ERR_NO_TMP_DIR => "ไม่พบ temporary upload directory",
        UPLOAD_ERR_CANT_WRITE => "ไม่สามารถเขียนไฟล์หลักฐานลง disk ได้",
        UPLOAD_ERR_EXTENSION => "PHP extension หยุดการอัปโหลดหลักฐาน",
    ];

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'] ?? '')) {
        throw new Exception($uploadErrors[$file['error'] ?? UPLOAD_ERR_NO_FILE] ?? "อัปโหลดไฟล์หลักฐานไม่สำเร็จ");
    }

    if (($file['size'] ?? 0) > STUDENT_LICENSE_EVIDENCE_MAX_BYTES) {
        throw new Exception("ไฟล์หลักฐานต้องมีขนาดไม่เกิน 5 MB");
    }

    $extension = strtolower(pathinfo((string)($file['name'] ?? ''), PATHINFO_EXTENSION));
    $mime = mime_content_type($file['tmp_name']) ?: '';
    $allowedExtensions = STUDENT_LICENSE_EVIDENCE_MIME_EXTENSIONS;
    $allowedExtension = $allowedExtensions[$mime] ?? null;
    if ($allowedExtension === null || !in_array($extension, ['pdf', 'jpg', 'jpeg', 'png'], true)) {
        throw new Exception("รองรับหลักฐานเฉพาะไฟล์ PDF, JPG หรือ PNG");
    }
    if ($extension === 'jpeg') {
        $extension = 'jpg';
    }
    if ($allowedExtension !== $extension && !($allowedExtension === 'jpg' && $extension === 'jpeg')) {
        throw new Exception("ชนิดไฟล์หลักฐานไม่ตรงกับนามสกุลไฟล์");
    }

    $safeOwner = preg_replace('/[^A-Za-z0-9_-]/', '_', $studentId);
    $relativeDir = 'uploads/user-documents/' . $safeOwner;
    $baseDir = realpath(__DIR__ . '/../') ?: (__DIR__ . '/../');
    $absoluteDir = $baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativeDir);
    if (!is_dir($absoluteDir) && !mkdir($absoluteDir, 0775, true)) {
        throw new Exception("ไม่สามารถสร้างโฟลเดอร์เก็บหลักฐานได้");
    }

    $fileName = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $targetPath = $absoluteDir . DIRECTORY_SEPARATOR . $fileName;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("ไม่สามารถบันทึกไฟล์หลักฐานได้");
    }

    $rawOriginalName = basename((string)$file['name']);
    $originalName = function_exists('mb_substr') ? mb_substr($rawOriginalName, 0, 255) : substr($rawOriginalName, 0, 255);
    return [
        'path' => $relativeDir . '/' . $fileName,
        'name' => $originalName !== '' ? $originalName : $fileName,
    ];
}

/**
 * ลบไฟล์หลักฐานเดิม (ถ้ามีและอยู่ใน uploads/user-documents/)
 */
function studentLicenseDeleteEvidence(?string $relativePath): bool
{
    if (empty($relativePath)) {
        return false;
    }
    $normalized = ltrim(str_replace('\\', '/', $relativePath), '/');
    if ($normalized === '' || str_contains($normalized, '..')) {
        return false;
    }
    if (!str_starts_with($normalized, 'uploads/user-documents/')) {
        return false;
    }
    $baseDir = realpath(__DIR__ . '/../') ?: (__DIR__ . '/../');
    $absolute = $baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    if (is_file($absolute)) {
        return @unlink($absolute);
    }
    return false;
}
