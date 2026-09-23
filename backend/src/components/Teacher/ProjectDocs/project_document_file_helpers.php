<?php

function project_document_base_upload_dir(): string
{
    return __DIR__ . '/../../../uploads/project_docs/';
}

function project_document_allowed_extensions(): array
{
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'];
}

function project_document_allowed_mimes(): array
{
    return [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
    ];
}

function project_document_validate_google_drive_link(string $url): void
{
    $trimmedUrl = trim($url);
    if ($trimmedUrl === '') {
        return;
    }

    if (!filter_var($trimmedUrl, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException("ลิงก์ Google Drive ไม่ถูกต้อง");
    }

    $parts = parse_url($trimmedUrl);
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if ($scheme !== 'https' || !in_array($host, ['drive.google.com', 'docs.google.com'], true)) {
        throw new InvalidArgumentException("กรุณาแนบลิงก์ Google Drive ที่ถูกต้อง");
    }
}

function project_document_validate_file(array $file): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException("เกิดข้อผิดพลาดระหว่างการอัปโหลดไฟล์");
    }

    if (($file['size'] ?? 0) <= 0 || (int) $file['size'] > PROJECT_UPLOAD_MAX_BYTES) {
        throw new InvalidArgumentException("ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
    }

    $originalName = basename((string) ($file['name'] ?? ''));
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($extension, project_document_allowed_extensions(), true)) {
        throw new InvalidArgumentException("ชนิดไฟล์ไม่รองรับ");
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo ? finfo_file($finfo, $file['tmp_name']) : ($file['type'] ?? '');
    if ($finfo) {
        finfo_close($finfo);
    }

    if (!in_array($detectedMime, project_document_allowed_mimes(), true)) {
        throw new InvalidArgumentException("ชนิดไฟล์ไม่ตรงกับไฟล์ที่อนุญาต");
    }

    return [
        'original_name' => $originalName,
        'mime_type' => $detectedMime,
        'file_size' => (int) $file['size'],
    ];
}

function project_document_upload_file(array $file, int $facultyId): array
{
    $meta = project_document_validate_file($file);
    $baseProjectDocsDir = project_document_base_upload_dir();

    if (!is_dir($baseProjectDocsDir) && !mkdir($baseProjectDocsDir, 0755, true)) {
        throw new RuntimeException("ไม่สามารถสร้างโฟลเดอร์อัปโหลดได้");
    }

    $facultyDirName = (string) $facultyId;
    $uploadDir = $baseProjectDocsDir . $facultyDirName . DIRECTORY_SEPARATOR;
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new RuntimeException("ไม่สามารถสร้างโฟลเดอร์อัปโหลดสำหรับอาจารย์ได้");
    }

    $baseUploadDir = realpath($baseProjectDocsDir);
    $realUploadDir = realpath($uploadDir);
    if (
        !$baseUploadDir ||
        !$realUploadDir ||
        strpos($realUploadDir . DIRECTORY_SEPARATOR, $baseUploadDir . DIRECTORY_SEPARATOR) !== 0
    ) {
        throw new RuntimeException("ตำแหน่งจัดเก็บไฟล์ไม่ถูกต้อง");
    }

    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $meta['original_name']);
    $fileName = date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '_' . $safeName;
    $targetPath = $realUploadDir . DIRECTORY_SEPARATOR . $fileName;
    $publicPath = 'uploads/project_docs/' . $facultyDirName . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new RuntimeException("ไม่สามารถย้ายไฟล์ไปยังโฟลเดอร์เซิร์ฟเวอร์ได้");
    }

    return [
        'file_path' => $publicPath,
        'file_name' => $meta['original_name'],
        'mime_type' => $meta['mime_type'],
        'file_size' => $meta['file_size'],
    ];
}

function project_document_resolve_safe_path(?string $publicPath): ?string
{
    $path = ltrim(str_replace('\\', '/', trim((string) $publicPath)), '/');
    if ($path === '') {
        return null;
    }
    if (preg_match('/^https?:\/\//i', $path)) {
        return null;
    }

    $baseProjectDocsDir = project_document_base_upload_dir();
    if (!is_dir($baseProjectDocsDir)) {
        return null;
    }

    $baseUploadDir = realpath($baseProjectDocsDir);
    if (!$baseUploadDir) {
        return null;
    }

    $prefix = 'uploads/project_docs/';
    if (strpos($path, $prefix) !== 0) {
        throw new RuntimeException("ตำแหน่งไฟล์ไม่อยู่ในโฟลเดอร์ที่อนุญาต");
    }

    $relativePath = substr($path, strlen($prefix));
    if ($relativePath === '' || str_contains($relativePath, '..')) {
        throw new RuntimeException("ตำแหน่งไฟล์ไม่ถูกต้อง");
    }

    $fullPath = $baseUploadDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $realParent = realpath(dirname($fullPath));
    if (
        !$realParent ||
        strpos($realParent . DIRECTORY_SEPARATOR, $baseUploadDir . DIRECTORY_SEPARATOR) !== 0
    ) {
        throw new RuntimeException("ตำแหน่งไฟล์ไม่ปลอดภัย");
    }

    return $fullPath;
}

function project_document_delete_file(?string $publicPath): void
{
    $fullPath = project_document_resolve_safe_path($publicPath);
    if ($fullPath === null || !file_exists($fullPath)) {
        return;
    }

    if (!is_file($fullPath) || !unlink($fullPath)) {
        throw new RuntimeException("ไม่สามารถลบไฟล์จริงบนเซิร์ฟเวอร์ได้");
    }
}

?>
