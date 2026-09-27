<?php
require_once (getenv('NURSE_BACKEND_SRC') ?: dirname(__DIR__) . '/src') . '/config/academic_calendar.php';

$cases = [
    ['2026-03-31T23:59:59+07:00', 2568],
    ['2026-04-01T00:00:00+07:00', 2569],
    ['2027-01-01T00:00:00+07:00', 2569],
    ['2027-04-01T00:00:00+07:00', 2570],
    ['2026-03-31T16:59:59Z', 2568],
    ['2026-03-31T17:00:00Z', 2569],
    ['2026-03-31T10:00:00-07:00', 2569],
    ['2028-02-29T12:00:00+07:00', 2570],
];
foreach (['UTC', 'Asia/Bangkok', 'America/Los_Angeles'] as $timezone) {
    date_default_timezone_set($timezone);
    foreach ($cases as [$date, $expected]) {
        if (currentAcademicYear(new DateTimeImmutable($date)) !== $expected) {
            throw new RuntimeException("Academic year mismatch: $date ($timezone)");
        }
    }
}
if (academicYearOptions(['2561', '2568', '2568', null, 'invalid'], 2569) !== [2569, 2568, 2561]) {
    throw new RuntimeException('Historical years must be preserved, deduplicated and sorted');
}
if (academicYearOptions([], 2569) !== [2569]) {
    throw new RuntimeException('Current year must exist without records');
}
echo "PASS: 24 date/timezone cases and 2 year-list cases\n";
