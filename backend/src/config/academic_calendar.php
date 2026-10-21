<?php
/**
 * ปีการศึกษา
 *
 * ปีการศึกษาเริ่มนับที่ "วันเปิดภาคการศึกษาที่ 1" ซึ่งตั้งค่าได้ที่หน้า "จัดการหลักสูตร"
 * (ค่าเริ่มต้น 15 สิงหาคม ตามปฏิทินของคณะ) ทั้งระบบใช้เส้นแบ่งเดียวกันนี้
 * เพื่อไม่ให้ภาคเรียนเดียวกันถูกนับเป็นคนละปีการศึกษา
 *
 * ส่งพารามิเตอร์ $db มาด้วยทุกครั้งที่ทำได้ เพื่อให้ได้ค่าที่ผู้ใช้ตั้งไว้จริง
 * ถ้าไม่ส่งมาจะใช้ค่าเริ่มต้นในโค้ด
 */

require_once __DIR__ . '/academic_helper.php';

/** วันเริ่มปีการศึกษา (= วันเปิดภาคการศึกษาที่ 1) ในรูปแบบ ['month' => int, 'day' => int] */
function academicYearBoundary(?PDO $db = null): array
{
    $ranges = academicTermRanges($db);
    $start = $ranges[1]['start'] ?? ACADEMIC_TERM_DEFAULTS[1]['start'];
    $value = academicMonthDayValue((string)$start);
    if ($value === null) {
        $value = academicMonthDayValue(ACADEMIC_TERM_DEFAULTS[1]['start']);
    }
    return ['month' => intdiv($value, 100), 'day' => $value % 100];
}

function currentAcademicYear(?DateTimeImmutable $now = null, ?PDO $db = null): int
{
    $now = ($now ?? new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('Asia/Bangkok'));
    $boundary = academicYearBoundary($db);
    $today = (int)$now->format('n') * 100 + (int)$now->format('j');
    $start = $boundary['month'] * 100 + $boundary['day'];

    return (int)$now->format('Y') + 543 - ($today < $start ? 1 : 0);
}

function academicYearOptions(array $existingYears, ?int $currentYear = null): array
{
    $years = array_filter(array_map('intval', $existingYears), static fn(int $year): bool => $year >= 2500 && $year <= 2700);
    $years[] = $currentYear ?? currentAcademicYear();
    $years = array_values(array_unique($years));
    rsort($years, SORT_NUMERIC);
    return $years;
}
