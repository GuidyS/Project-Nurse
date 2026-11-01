<?php
/**
 * สถานะของนักศึกษา / อาจารย์ ที่ผู้ดูแลระบบเลือกได้ (ใช้ร่วมกันระหว่าง API และหน้าเว็บ)
 *
 * นักศึกษา: คงอยู่ / พักการเรียน / ลาออก — สองสถานะหลังต้องระบุเหตุผลจากรายการที่กำหนดไว้
 * อาจารย์ : คงอยู่ / ลาออก / เกษียณ — ไม่ต้องระบุเหตุผล
 */

/** value => label */
function studentStatusOptions(): array
{
    return [
        'Active'    => 'คงอยู่',
        'Graduated' => 'สำเร็จการศึกษา',
        'OnLeave'   => 'พักการเรียน',
        'Resigned'  => 'ลาออก',
        'Retired'   => 'พ้นสภาพ',
    ];
}

function facultyStatusOptions(): array
{
    return [
        'Active'   => 'คงอยู่',
        'Resigned' => 'ลาออก',
        'Retired'  => 'เกษียณ',
    ];
}

/** เหตุผลที่เลือกได้เมื่อนักศึกษาพักการเรียน ลาออก หรือพ้นสภาพ */
function studentStatusReasons(): array
{
    return ['ปัญหาการเงิน', 'ย้ายที่เรียน', 'ปัญหาสุขภาพ', 'โดนรีไทร์'];
}

/** สถานะที่ต้องระบุเหตุผล */
function studentStatusNeedsReason(string $status): bool
{
    return in_array($status, ['OnLeave', 'Resigned', 'Retired', 'Dropout', 'พักการเรียน', 'ลาออก', 'พ้นสภาพ'], true);
}

/** ปรับคอลัมน์ status ให้เป็น VARCHAR(50) เพื่อรองรับทุกสถานะและป้องกัน Warning 1265 Data truncated */
function userStatusEnsureSchema(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    foreach (['student', 'faculty'] as $table) {
        $stmt = $db->prepare("
            SELECT DATA_TYPE FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'status'
        ");
        $stmt->execute([$table]);
        $type = strtolower((string)$stmt->fetchColumn());
        if ($type === 'enum') {
            $default = $table === 'student' ? "'คงอยู่'" : "'Active'";
            $db->exec("ALTER TABLE `{$table}` MODIFY COLUMN `status` VARCHAR(50) DEFAULT {$default}");
        }
    }

    $ready = true;
}

/**
 * ตรวจสถานะที่ส่งมาจากหน้าเว็บ
 * @return array{status:string,reason:?string}
 * @throws InvalidArgumentException
 */
function normalizeUserStatusInput(string $role, $statusInput, $reasonInput, ?string $currentStatus = null): array
{
    $options = $role === 'student' ? studentStatusOptions() : facultyStatusOptions();
    $status = trim((string)$statusInput);

    // รองรับทั้งกรณีหน้าเว็บส่งมาเป็น label ภาษาไทย (เช่น "ลาออก") หรือ key ภาษาอังกฤษ (เช่น "Resigned")
    $reverseMap = array_flip($options);
    if (isset($reverseMap[$status])) {
        $status = $reverseMap[$status];
    }

    if ($status === '') {
        $status = $currentStatus ?: 'Active';
    }

    // ค่าเดิมในฐานข้อมูลที่ไม่มีในตัวเลือกใหม่ (เช่น Graduted, Retired) ให้คงไว้ได้ถ้าไม่ได้แก้
    if (!isset($options[$status])) {
        if ($currentStatus !== null && $status === $currentStatus) {
            return ['status' => $status, 'reason' => $reasonInput !== null ? trim((string)$reasonInput) : null];
        }
        throw new InvalidArgumentException('สถานะไม่ถูกต้อง: ' . $status);
    }

    $reason = $reasonInput !== null ? trim((string)$reasonInput) : '';

    if ($role === 'student') {
        if (studentStatusNeedsReason($status)) {
            if ($reason === '') {
                throw new InvalidArgumentException('กรุณาเลือกเหตุผลของสถานะ ' . $options[$status]);
            }
            if (!in_array($reason, studentStatusReasons(), true)) {
                throw new InvalidArgumentException('เหตุผลต้องเลือกจากรายการที่กำหนดไว้');
            }
        } else {
            $reason = ''; // คงอยู่ = ไม่มีเหตุผล
        }
    } else {
        $reason = '';
    }

    return ['status' => $status, 'reason' => $reason !== '' ? $reason : null];
}
