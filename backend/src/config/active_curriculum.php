<?php
/**
 * หลักสูตรที่ใช้งานในระบบ — ตั้งค่าที่หน้า "จัดการหลักสูตร" (ปุ่ม "ใช้หลักสูตรนี้ทั้งระบบ")
 *
 * หน้าที่เกี่ยวกับรายวิชาของหลักสูตรใช้ไฟล์นี้ เพื่อแสดงเฉพาะรายวิชาของหลักสูตรที่ใช้งาน:
 *  - กำหนด CLO รายวิชา, จัดการ CLO, ตาราง CLO Map, จัดอาจารย์ผู้สอน, เชื่อมโยงระดับ LO, คลังเอกสาร
 *  - หน้าการสอนของอาจารย์: รายวิชา, วิชาที่รับผิดชอบ, ผล CLO รายบุคคล, ผลการเรียน, รายชื่อนักศึกษา
 *
 * ยังไม่ได้กดเลือก → ใช้หลักสูตรที่ครอบคลุมปี พ.ศ. ปัจจุบัน ถ้าไม่มีใช้หลักสูตรล่าสุด
 * ยังไม่มีหลักสูตรในระบบเลย → ฟังก์ชันคืน null และหน้าเหล่านั้นทำงานแบบเดิม (รายวิชาทั้งหมดจากตาราง subject)
 */

function activeCurriculumColumnExists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
    ");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

/** @return array{id:int,start_year:int,end_year:int,is_explicit:bool,label:string}|null */
function activeCurriculumCycle(PDO $db): ?array
{
    static $cache = [];
    $key = spl_object_id($db);
    if (array_key_exists($key, $cache)) {
        return $cache[$key];
    }

    $tables = (int)$db->query("
        SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('curriculum_cycle', 'curriculum_cycle_subject')
    ")->fetchColumn();
    if ($tables < 2) {
        return $cache[$key] = null;
    }

    $row = false;
    $explicit = false;
    if (activeCurriculumColumnExists($db, 'curriculum_cycle', 'is_active')) {
        $row = $db->query("SELECT id, start_year, end_year FROM curriculum_cycle WHERE is_active = 1 ORDER BY id LIMIT 1")
                  ->fetch(PDO::FETCH_ASSOC);
        $explicit = $row !== false;
    }
    if ($row === false) {
        // ใช้ปีของ MySQL (Asia/Bangkok) — PHP ในคอนเทนเนอร์เป็น UTC
        $row = $db->query("
            SELECT id, start_year, end_year FROM curriculum_cycle
            ORDER BY (YEAR(CURDATE()) + 543 BETWEEN start_year AND end_year) DESC, start_year DESC, end_year DESC
            LIMIT 1
        ")->fetch(PDO::FETCH_ASSOC);
    }
    if ($row === false) {
        return $cache[$key] = null;
    }

    return $cache[$key] = [
        'id' => (int)$row['id'],
        'start_year' => (int)$row['start_year'],
        'end_year' => (int)$row['end_year'],
        'is_explicit' => $explicit,
        'label' => 'พ.ศ. ' . $row['start_year'] . ' – ' . $row['end_year'],
    ];
}

/**
 * รายวิชาของหลักสูตรที่ใช้งาน เรียงรหัสแบบตัวเลข (null = ยังไม่มีหลักสูตรในระบบ)
 * subject_id เป็น null ได้ ถ้าวิชามีเฉพาะในหลักสูตร (ยังไม่มีในตาราง subject)
 */
function activeCurriculumSubjects(PDO $db): ?array
{
    static $cache = [];
    $cycle = activeCurriculumCycle($db);
    if ($cycle === null) {
        return null;
    }
    $key = spl_object_id($db) . ':' . $cycle['id'];
    if (isset($cache[$key])) {
        return $cache[$key];
    }

    // ภาคเรียน/ปีการศึกษา: ตาราง subject ก่อน แล้วถอยไปใช้ค่าที่เก็บในรายวิชาของหลักสูตร (วิชาที่ไม่มีในตาราง subject)
    $subjectYear = activeCurriculumColumnExists($db, 'subject', 'academic_year') ? 's.academic_year' : 'NULL';
    $cycleHasTerm = activeCurriculumColumnExists($db, 'curriculum_cycle_subject', 'semester');
    $semesterSelect = $cycleHasTerm ? 'COALESCE(s.semester, cs.semester)' : 's.semester';
    $yearSelect = $cycleHasTerm ? "COALESCE({$subjectYear}, cs.academic_year)" : $subjectYear;

    $stmt = $db->prepare("
        SELECT cs.subject_code, cs.subject_name, cs.credit, cs.credit_desc, s.subject_id,
               {$semesterSelect} AS semester, {$yearSelect} AS academic_year
        FROM curriculum_cycle_subject cs
        LEFT JOIN subject s ON s.subject_code = cs.subject_code
        WHERE cs.cycle_id = ?
    ");
    $stmt->execute([$cycle['id']]);

    $subjects = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $subjects[] = [
            'subject_code' => (string)$row['subject_code'],
            'subject_name' => (string)$row['subject_name'],
            'credit' => (int)$row['credit'],
            'credit_desc' => $row['credit_desc'],
            'subject_id' => $row['subject_id'] === null ? null : (int)$row['subject_id'],
            'semester' => $row['semester'] === null ? null : (int)$row['semester'],
            'academic_year' => $row['academic_year'] === null ? null : (int)$row['academic_year'],
        ];
    }
    usort($subjects, static fn(array $a, array $b): int => strnatcasecmp($a['subject_code'], $b['subject_code']));

    return $cache[$key] = $subjects;
}

/** รหัสวิชาของหลักสูตรที่ใช้งาน (null = ยังไม่มีหลักสูตรในระบบ) */
function activeCurriculumSubjectCodes(PDO $db): ?array
{
    $subjects = activeCurriculumSubjects($db);
    return $subjects === null ? null : array_column($subjects, 'subject_code');
}

/** กรองรหัสวิชาให้เหลือเฉพาะวิชาในหลักสูตรที่ใช้งาน (ยังไม่มีหลักสูตร → คืนตามเดิม) */
function activeCurriculumFilterCodes(PDO $db, array $codes): array
{
    $activeCodes = activeCurriculumSubjectCodes($db);
    if ($activeCodes === null) {
        return array_values($codes);
    }
    $allowed = array_fill_keys(array_map('mb_strtolower', $activeCodes), true);
    return array_values(array_filter($codes, static fn($code): bool => isset($allowed[mb_strtolower((string)$code)])));
}

/** ชื่อวิชาตามหลักสูตรที่ใช้งาน (null = ไม่อยู่ในหลักสูตร หรือยังไม่มีหลักสูตร) */
function activeCurriculumSubjectName(PDO $db, string $code): ?string
{
    foreach (activeCurriculumSubjects($db) ?? [] as $subject) {
        if (mb_strtolower($subject['subject_code']) === mb_strtolower($code)) {
            return $subject['subject_name'];
        }
    }
    return null;
}

/** แทนชื่อวิชาในรายการด้วยชื่อตามหลักสูตรที่ใช้งาน (วิชาที่ไม่อยู่ในหลักสูตรคงชื่อเดิม) */
function activeCurriculumApplyNames(PDO $db, array $rows, string $codeKey, string $nameKey): array
{
    $subjects = activeCurriculumSubjects($db);
    if ($subjects === null) {
        return $rows;
    }
    $names = [];
    foreach ($subjects as $subject) {
        $names[mb_strtolower($subject['subject_code'])] = $subject['subject_name'];
    }
    foreach ($rows as &$row) {
        $code = mb_strtolower((string)($row[$codeKey] ?? ''));
        if (isset($names[$code])) {
            $row[$nameKey] = $names[$code];
        }
    }
    unset($row);
    return $rows;
}
