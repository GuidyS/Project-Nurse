<?php
/**
 * ตัวช่วยจัดการ "ภาคเรียน / ปีการศึกษา" ของรายวิชา
 *
 * ตาราง subject เดิมมีแค่คอลัมน์ semester (int) และไม่มีปีการศึกษา
 * ไฟล์นี้จะเพิ่มคอลัมน์ academic_year ให้อัตโนมัติเมื่อยังไม่มี (รันซ้ำได้)
 */

if (!function_exists('subjectTermEnsureColumn')) {
    /** เพิ่มคอลัมน์ academic_year ให้ตาราง subject ถ้ายังไม่มี */
    function subjectTermEnsureColumn(PDO $db): void
    {
        $stmt = $db->prepare("
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'subject'
              AND COLUMN_NAME = 'academic_year'
        ");
        $stmt->execute();

        if ((int)$stmt->fetchColumn() === 0) {
            $db->exec("ALTER TABLE subject ADD COLUMN academic_year INT NULL DEFAULT NULL AFTER semester");
        }
    }
}

if (!function_exists('subjectTermNormalizeSemester')) {
    /**
     * แปลงค่าภาคเรียนที่รับมา
     * @return int|null  null = ไม่ระบุ (เก็บเป็น NULL ไม่ใช่ 0 เพื่อไม่ให้สับสนกับภาคเรียนจริง)
     */
    function subjectTermNormalizeSemester($value): ?int
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return null;
        }

        if (!is_numeric($value)) {
            throw new InvalidArgumentException("ภาคเรียนต้องเป็นตัวเลข");
        }

        $semester = (int)$value;
        // ภาคเรียน 1, 2 และ 3 (ภาคฤดูร้อน)
        if ($semester < 1 || $semester > 3) {
            throw new InvalidArgumentException("ภาคเรียนต้องเป็น 1, 2 หรือ 3 เท่านั้น");
        }

        return $semester;
    }
}

if (!function_exists('subjectTermNormalizeYear')) {
    /**
     * แปลงค่าปีการศึกษา (พ.ศ.)
     * @return int|null  null = ไม่ระบุ
     */
    function subjectTermNormalizeYear($value): ?int
    {
        if ($value === null || $value === '' || $value === 0 || $value === '0') {
            return null;
        }

        if (!is_numeric($value)) {
            throw new InvalidArgumentException("ปีการศึกษาต้องเป็นตัวเลข");
        }

        $year = (int)$value;
        // รับเฉพาะ พ.ศ. ในช่วงที่สมเหตุสมผล
        if ($year < 2500 || $year > 2600) {
            throw new InvalidArgumentException("ปีการศึกษาต้องเป็น พ.ศ. เช่น 2567");
        }

        return $year;
    }
}

if (!function_exists('subjectTermSave')) {
    /**
     * บันทึกภาคเรียน/ปีการศึกษาให้รายวิชา
     * ส่ง null มาหมายถึง "ไม่แตะค่าเดิม" (ใช้ตอนมอบหมายอาจารย์โดยไม่กรอกภาคเรียน)
     */
    function subjectTermSave(PDO $db, string $subjectCode, ?int $semester, ?int $academicYear, bool $clearWhenNull = false): void
    {
        subjectTermEnsureColumn($db);

        $sets = [];
        $params = [':code' => $subjectCode];

        if ($semester !== null || $clearWhenNull) {
            $sets[] = "semester = :semester";
            $params[':semester'] = $semester;
        }

        if ($academicYear !== null || $clearWhenNull) {
            $sets[] = "academic_year = :academic_year";
            $params[':academic_year'] = $academicYear;
        }

        if (empty($sets)) {
            return;
        }

        $stmt = $db->prepare("UPDATE subject SET " . implode(', ', $sets) . " WHERE subject_code = :code");
        $stmt->execute($params);
    }
}

if (!function_exists('subjectTermLabel')) {
    /**
     * ข้อความแสดงผล เช่น "1/2567", "1" (ถ้าไม่มีปี) หรือ "-" (ถ้าไม่มีข้อมูลเลย)
     * ใช้ชุดเดียวกันทุกหน้า จะได้ไม่มีใครไป hardcode ค่า fallback อีก
     */
    function subjectTermLabel($semester, $academicYear): string
    {
        $sem = ($semester === null || $semester === '' || (int)$semester === 0) ? null : (int)$semester;
        $year = ($academicYear === null || $academicYear === '' || (int)$academicYear === 0) ? null : (int)$academicYear;

        if ($sem === null && $year === null) {
            return '-';
        }

        if ($sem !== null && $year !== null) {
            return $sem . '/' . $year;
        }

        return $sem !== null ? (string)$sem : (string)$year;
    }
}
