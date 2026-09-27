<?php
/** ปีการศึกษาเริ่มวันที่ 1 เมษายน ตามเวลาไทย (ไม่ใช่กฎเลื่อนชั้นปีหรือปีงบประมาณ) */
function currentAcademicYear(?DateTimeImmutable $now = null): int
{
    $now = ($now ?? new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('Asia/Bangkok'));
    return (int)$now->format('Y') + 543 - ((int)$now->format('n') < 4 ? 1 : 0);
}

function academicYearOptions(array $existingYears, ?int $currentYear = null): array
{
    $years = array_filter(array_map('intval', $existingYears), static fn(int $year): bool => $year >= 2500 && $year <= 2700);
    $years[] = $currentYear ?? currentAcademicYear();
    $years = array_values(array_unique($years));
    rsort($years, SORT_NUMERIC);
    return $years;
}
