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
        'Active'   => 'คงอยู่',
        'OnLeave'  => 'พักการเรียน',
        'Resigned' => 'ลาออก',
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

/** เหตุผลที่เลือกได้เมื่อนักศึกษาพักการเรียนหรือลาออก */
function studentStatusReasons(): array
{
    return ['ปัญหาการเงิน', 'ย้ายที่เรียน', 'ปัญหาสุขภาพ', 'โดนรีไทร์'];
}

/** สถานะที่ต้องระบุเหตุผล */
function studentStatusNeedsReason(string $status): bool
{
    return in_array($status, ['OnLeave', 'Resigned'], true);
}

/** เพิ่มค่าใหม่ใน enum ของคอลัมน์ status (ทำครั้งเดียว ปลอดภัยถ้ารันซ้ำ) */
function userStatusEnsureSchema(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $needed = [
        'student' => ['Active', 'Graduted', 'Dropout', 'Retired', 'OnLeave', 'Resigned'],
        'faculty' => ['Active', 'Retired', 'Resigned'],
    ];

    foreach ($needed as $table => $values) {
        $stmt = $db->prepare("
            SELECT COLUMN_TYPE FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'status'
        ");
        $stmt->execute([$table]);
        $type = (string)$stmt->fetchColumn();
        if ($type === '' || stripos($type, 'enum') !== 0) {
            continue; // ไม่ใช่ enum (เช่น varchar) ไม่ต้องแก้
        }

        $missing = false;
        foreach ($values as $value) {
            if (stripos($type, "'{$value}'") === false) {
                $missing = true;
                break;
            }
        }
        if (!$missing) {
            continue;
        }

        $enumList = implode(',', array_map(static fn(string $v): string => "'" . $v . "'", $values));
        $db->exec("ALTER TABLE `{$table}` MODIFY COLUMN `status` ENUM({$enumList}) DEFAULT 'Active'");
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

    if ($status === '') {
        $status = $currentStatus ?: 'Active';
    }

    // ค่าเดิมในฐานข้อมูลที่ไม่มีในตัวเลือกใหม่ (เช่น Graduted) ให้คงไว้ได้ถ้าไม่ได้แก้
    if (!isset($options[$status])) {
        if ($currentStatus !== null && $status === $currentStatus) {
            return ['status' => $status, 'reason' => $reasonInput !== null ? trim((string)$reasonInput) : null];
        }
        throw new InvalidArgumentException('สถานะไม่ถูกต้อง');
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
