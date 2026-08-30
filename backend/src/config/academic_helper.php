<?php
/**
 * คำนวณปีการศึกษาและชั้นปีของนักศึกษาแบบ Real-time ตัดรอบวันที่ 10 สิงหาคม
 */
function calculateRealtimeAcademicInfo($studentId, $entryYearCandidate = null): array {
    $now = new DateTime();
    $currentYearBE = (int)$now->format('Y') + 543;
    
    // ตัดรอบเลื่อนชั้นปี: วันที่ 10 สิงหาคม ของทุกปี
    $cutOffDate = new DateTime($now->format('Y') . '-08-10 00:00:00');
    $academicYear = ($now >= $cutOffDate) ? $currentYearBE : ($currentYearBE - 1);

    // ยึดปีเข้าศึกษาจาก 2 ตัวแรกของรหัสนักศึกษาเป็นหลัก (เช่น 6603400001 -> 2566)
    $cleanId = trim((string)$studentId);
    $entryYear = 0;

    if (strlen($cleanId) >= 2 && ctype_digit(substr($cleanId, 0, 2))) {
        $entryYear = 2500 + (int)substr($cleanId, 0, 2);
    } elseif (!empty($entryYearCandidate) && (int)$entryYearCandidate >= 2500) {
        $entryYear = (int)$entryYearCandidate;
    } else {
        $entryYear = $academicYear; // Fallback
    }

    // สูตรคำนวณชั้นปี
    $yearLevel = $academicYear - $entryYear + 1;

    if ($yearLevel < 1) $yearLevel = 1;
    if ($yearLevel > 8) $yearLevel = 8;

    return [
        'academic_year' => $academicYear,
        'year_level'    => $yearLevel,
        'entry_year'    => $entryYear
    ];
}