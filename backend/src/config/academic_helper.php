<?php
/**
 * ปีการศึกษา / ชั้นปีของนักศึกษา
 *
 * - ชั้นปีคำนวณแบบ Real-time จากปีที่เข้าศึกษา ไม่ต้องไล่อัปเดตทีละคน
 * - วันตัดรอบเลื่อนชั้นปี ตั้งค่าได้จากหน้า "จัดการข้อมูลผู้ใช้" (ปุ่มตั้งค่าปีการศึกษา)
 *   ค่าเริ่มต้นคือ 10 สิงหาคม ตามที่ระบบเดิมใช้
 * - เก็บค่าตั้งค่าไว้ในตาราง system_settings
 */

const ACADEMIC_CUTOFF_DEFAULT_MONTH = 8;
const ACADEMIC_CUTOFF_DEFAULT_DAY = 10;
const ACADEMIC_PURGE_DEFAULT_YEARS = 8;
const ACADEMIC_MAX_YEAR_LEVEL = 8;

function academicEnsureSettingsTable(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }
    $db->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) NOT NULL,
            setting_value VARCHAR(255) NULL,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");
    $ready = true;
}

function academicGetSetting(PDO $db, string $key, ?string $default = null): ?string
{
    academicEnsureSettingsTable($db);
    $stmt = $db->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1");
    $stmt->execute([$key]);
    $value = $stmt->fetchColumn();
    return ($value === false || $value === null || $value === '') ? $default : (string)$value;
}

function academicSetSetting(PDO $db, string $key, string $value): void
{
    academicEnsureSettingsTable($db);
    $db->prepare("
        INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ")->execute([$key, $value]);
}

/** วันตัดรอบเลื่อนชั้นปี @return array{month:int,day:int} */
function academicPromotionCutoff(?PDO $db = null): array
{
    $month = ACADEMIC_CUTOFF_DEFAULT_MONTH;
    $day = ACADEMIC_CUTOFF_DEFAULT_DAY;

    if ($db !== null) {
        $raw = academicGetSetting($db, 'academic_promotion_cutoff');
        if ($raw !== null && preg_match('/^(\d{1,2})-(\d{1,2})$/', trim($raw), $m)) {
            $month = max(1, min(12, (int)$m[1]));
            $day = max(1, min(31, (int)$m[2]));
        }
    }

    return ['month' => $month, 'day' => $day];
}

/** จำนวนปีที่เก็บข้อมูลนักศึกษาก่อนลบออกจากระบบ */
function academicPurgeYears(?PDO $db = null): int
{
    if ($db === null) {
        return ACADEMIC_PURGE_DEFAULT_YEARS;
    }
    $value = (int)academicGetSetting($db, 'student_purge_years', (string)ACADEMIC_PURGE_DEFAULT_YEARS);
    return ($value >= 1 && $value <= 50) ? $value : ACADEMIC_PURGE_DEFAULT_YEARS;
}

/** เปิด/ปิดการลบข้อมูลนักศึกษาอัตโนมัติ */
function academicPurgeEnabled(?PDO $db = null): bool
{
    if ($db === null) {
        return false;
    }
    return academicGetSetting($db, 'student_purge_enabled', '0') === '1';
}

/**
 * คำนวณปีการศึกษาและชั้นปีของนักศึกษาแบบ Real-time
 * ส่ง PDO มาด้วยถ้าต้องการใช้วันตัดรอบที่แอดมินตั้งไว้ (ไม่ส่ง = ใช้ค่าเริ่มต้น 10 ส.ค.)
 */
function calculateRealtimeAcademicInfo($studentId, $entryYearCandidate = null, ?PDO $db = null): array
{
    $now = new DateTime();
    $currentYearBE = (int)$now->format('Y') + 543;

    $cutoff = academicPromotionCutoff($db);
    $cutOffDate = new DateTime(sprintf('%s-%02d-%02d 00:00:00', $now->format('Y'), $cutoff['month'], $cutoff['day']));
    $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);

    // ดึงปีที่เข้าศึกษาจาก 2 ตัวแรกของรหัสนักศึกษาเป็นหลัก (เช่น 6603400001 -> 2566)
    $cleanId = trim((string)$studentId);
    $entryYear = 0;

    if (strlen($cleanId) >= 2 && is_numeric(substr($cleanId, 0, 2))) {
        $entryYear = 2500 + (int)substr($cleanId, 0, 2);
    } elseif (!empty($entryYearCandidate) && is_numeric($entryYearCandidate) && (int)$entryYearCandidate >= 2500) {
        $entryYear = (int)$entryYearCandidate;
    } else {
        $entryYear = $academicYear; // Fallback
    }

    $yearLevel = $academicYear - $entryYear + 1;

    if ($yearLevel < 1) $yearLevel = 1;
    if ($yearLevel > ACADEMIC_MAX_YEAR_LEVEL) $yearLevel = ACADEMIC_MAX_YEAR_LEVEL;

    return [
        'academic_year' => $academicYear,
        'year_level'    => $yearLevel,
        'entry_year'    => $entryYear,
        'cutoff'        => sprintf('%02d-%02d', $cutoff['month'], $cutoff['day']),
    ];
}

/** วันเลื่อนชั้นปีครั้งถัดไป (รูปแบบ Y-m-d) */
function academicNextPromotionDate(?PDO $db = null): string
{
    $cutoff = academicPromotionCutoff($db);
    $now = new DateTime();
    $thisYear = new DateTime(sprintf('%s-%02d-%02d', $now->format('Y'), $cutoff['month'], $cutoff['day']));
    if ($now >= $thisYear) {
        $thisYear->modify('+1 year');
    }
    return $thisYear->format('Y-m-d');
}
