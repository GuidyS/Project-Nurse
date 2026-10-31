<?php
/**
 * ทำเนียบบุคลากรภายในคณะ (โหมดดูอย่างเดียว)
 *
 * ใช้กับหน้า "บุคลากรภายในคณะ" ของคณบดี — แสดงรายชื่ออาจารย์ทั้งหมดในระบบ
 * และเปิดดูข้อมูลส่วนตัวของแต่ละคนได้ แต่แก้ไขอะไรไม่ได้เลย
 */

/** คอลัมน์ในตาราง faculty ที่เก็บไฟล์เอกสารแนบ */
function facultyDirectoryDocumentFields(): array
{
    return [
        'description'          => 'ประวัติ/Resume',
        'nursing_council_file' => 'สำเนาบัตรสมาชิกสภาการพยาบาล',
        'license_file'         => 'สำเนาใบอนุญาตประกอบวิชาชีพ',
        'teaching_cert_file'   => 'เอกสารรับรองหลักสูตรการสอนทางพยาบาล',
    ];
}

/**
 * ตรวจสิทธิ์: เปิดให้เฉพาะผู้ดูแลระบบ หรืออาจารย์ที่มีตำแหน่งคณบดีเท่านั้น
 * (เงื่อนไขเดียวกับหน้าอื่นในหมวดการบริหารคณะ)
 */
function facultyDirectoryRequireDean(PDO $db, $userId): void
{
    $stmt = $db->prepare("
        SELECT u.role_id, up.position_id
        FROM users u
        LEFT JOIN user_position up ON up.user_id = u.user_id AND up.is_primary = 1
        WHERE u.user_id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $roleId = (int)($row['role_id'] ?? 0);
    $positionId = (int)($row['position_id'] ?? 0);

    if ($roleId === 1 || ($roleId === 2 && $positionId === 1)) {
        return;
    }

    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "ไม่มีสิทธิ์ดูข้อมูลบุคลากรภายในคณะ",
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * คอลัมน์ไฟล์บางคอลัมน์เก็บได้หลายไฟล์ในรูป JSON array (เช่น ["uploads/..."])
 * จึงต้องคลี่ออกมาก่อน ไม่งั้นจะอ่านเป็นข้อความก้อนเดียวแล้วหาไฟล์ไม่เจอ
 */
function facultyDirectoryPathList($value): array
{
    if ($value === null) {
        return [];
    }

    $raw = trim((string)$value);
    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return array_values(array_filter(
            array_map('strval', $decoded),
            static fn(string $path): bool => trim($path) !== ''
        ));
    }

    return [$raw];
}

/** แยกรหัสไฟล์ของ Google Drive ออกจากลิงก์หลายรูปแบบ */
function facultyDirectoryDriveId(string $value): ?string
{
    $value = trim($value);
    if ($value === '') {
        return null;
    }

    $patterns = [
        '~drive\.google\.com/file/d/([A-Za-z0-9_-]{10,})~',
        '~drive\.google\.com/open\?id=([A-Za-z0-9_-]{10,})~',
        '~docs\.google\.com/[^?]+\?id=([A-Za-z0-9_-]{10,})~',
        '~[?&]id=([A-Za-z0-9_-]{10,})~',
    ];
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $value, $matches)) {
            return $matches[1];
        }
    }

    return null;
}

/**
 * แปลงค่าที่เก็บไว้ในฐานข้อมูลให้เป็นลิงก์ที่เปิดดูได้
 * รองรับทั้งลิงก์ภายนอก ลิงก์ Google Drive และไฟล์ที่อัปโหลดไว้ในโฟลเดอร์ uploads
 */
function facultyDirectoryResolveFile(?string $raw): ?array
{
    $value = trim((string)$raw);
    if ($value === '') {
        return null;
    }

    $driveId = facultyDirectoryDriveId($value);
    if ($driveId !== null) {
        return [
            'url'    => 'https://drive.google.com/file/d/' . $driveId . '/view',
            'source' => 'google_drive',
            'name'   => 'เปิดดูใน Google Drive',
        ];
    }

    if (preg_match('~^https?://~i', $value)) {
        return ['url' => $value, 'source' => 'external', 'name' => 'เปิดลิงก์เอกสาร'];
    }

    $normalized = ltrim(str_replace('\\', '/', $value), '/');
    if (!str_starts_with($normalized, 'uploads/')) {
        return null; // ค่าที่ไม่ใช่เส้นทางไฟล์ เช่น ข้อความอธิบายทั่วไป
    }

    $absolute = realpath(__DIR__ . '/../../../' . $normalized);
    $uploadRoot = realpath(__DIR__ . '/../../../uploads');

    // กันไม่ให้หลุดออกไปนอกโฟลเดอร์ uploads
    $available = $absolute !== false
        && $uploadRoot !== false
        && str_starts_with($absolute, $uploadRoot)
        && is_file($absolute);

    return [
        'url'       => $normalized,
        'source'    => 'upload',
        'name'      => basename($normalized),
        'available' => $available,
    ];
}

/** รายการเอกสารแนบของอาจารย์ 1 คน (คอลัมน์ในตาราง faculty + ไฟล์คุณวุฒิจากตาราง degree) */
function facultyDirectoryDocuments(PDO $db, array $faculty): array
{
    $documents = [];
    $seen = [];

    foreach (facultyDirectoryDocumentFields() as $field => $label) {
        foreach (facultyDirectoryPathList($faculty[$field] ?? null) as $path) {
            $resolved = facultyDirectoryResolveFile($path);
            if ($resolved === null || isset($seen[$resolved['url']])) {
                continue;
            }
            $seen[$resolved['url']] = true;
            $documents[] = [
                'title'     => $label,
                'url'       => $resolved['url'],
                'source'    => $resolved['source'],
                'file_name' => $resolved['name'],
                'available' => $resolved['available'] ?? true,
            ];
        }
    }

    $stmt = $db->prepare("
        SELECT degree_level, degree_name_th, file_path
        FROM degree
        WHERE faculty_id = :fid AND file_path IS NOT NULL AND TRIM(file_path) <> ''
        ORDER BY degree_id
    ");
    $stmt->execute([':fid' => (string)($faculty['faculty_id'] ?? '')]);

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $name = trim((string)($row['degree_name_th'] ?? ''));
        foreach (facultyDirectoryPathList($row['file_path'] ?? null) as $path) {
            $resolved = facultyDirectoryResolveFile($path);
            if ($resolved === null || isset($seen[$resolved['url']])) {
                continue;
            }
            $seen[$resolved['url']] = true;
            $documents[] = [
                'title'     => 'ใบคุณวุฒิการศึกษา' . ($name !== '' ? " — {$name}" : ''),
                'url'       => $resolved['url'],
                'source'    => $resolved['source'],
                'file_name' => $resolved['name'],
                'available' => $resolved['available'] ?? true,
            ];
        }
    }

    return $documents;
}

/** ชื่อเต็มภาษาไทยของอาจารย์ */
function facultyDirectoryFullName(array $row): string
{
    return trim(implode(' ', array_filter([
        trim((string)($row['title'] ?? '')),
        trim((string)($row['first_name_th'] ?? '')),
        trim((string)($row['last_name_th'] ?? '')),
    ], static fn(string $part): bool => $part !== '')));
}
