<?php
/**
 * การลงทะเบียนเรียนของนักศึกษา
 *
 * - รายวิชาที่ลงได้ = รายวิชาของ "หลักสูตรที่ใช้งานในระบบ" (หน้าจัดการหลักสูตร) เท่านั้น
 * - เก็บผลการลงทะเบียนในตาราง enrollment เดิม เพื่อให้หน้า "วิชาที่รับผิดชอบ" ของอาจารย์
 *   และหน้าให้คะแนนเห็นนักศึกษาทันทีโดยไม่ต้องทำข้อมูลซ้ำ
 */

require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/academic_helper.php';
require_once __DIR__ . '/../../../config/curriculum_outcomes.php';
require_once __DIR__ . '/../../Teacher/AssignInstructors/subject_term_helpers.php';
require_once __DIR__ . '/../../Teacher/CLOPage/curriculum_repository.php';

/** รหัสนักศึกษาของผู้ใช้ที่ล็อกอิน (null = ไม่ใช่นักศึกษา) */
function registrationStudentId(PDO $db, $userId): ?string
{
    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || (int)($user['role_id'] ?? 0) !== 3) {
        return null;
    }

    $check = $db->prepare("SELECT student_id FROM student WHERE student_id = :sid LIMIT 1");
    $check->execute([':sid' => $user['username']]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
    return $row ? (string)$row['student_id'] : null;
}

/**
 * หา subject_id ของรายวิชาในหลักสูตร ถ้ายังไม่มีแถวในตาราง subject ให้สร้างให้
 *
 * รายวิชาที่เพิ่มจากหน้า "จัดการหลักสูตร" อย่างเดียวจะยังไม่มีใน subject
 * แต่ตาราง enrollment อ้างด้วย subject_id จึงต้องมีแถวจริงก่อนจึงลงทะเบียนได้
 */
function registrationEnsureSubjectRow(PDO $db, array $curriculumSubject): int
{
    if ($curriculumSubject['subject_id'] !== null) {
        return (int)$curriculumSubject['subject_id'];
    }

    // หมายเหตุ: ห้ามเรียก subjectTermEnsureColumn() ที่นี่
    // เพราะ ALTER TABLE ทำให้ MySQL commit transaction ที่เปิดค้างไว้โดยอัตโนมัติ
    $stmt = $db->prepare("SELECT subject_id FROM subject WHERE subject_code = :code LIMIT 1");
    $stmt->execute([':code' => $curriculumSubject['subject_code']]);
    $existing = $stmt->fetchColumn();
    if ($existing !== false) {
        return (int)$existing;
    }

    // subject.subject_id เป็น PK ธรรมดา ไม่ได้ตั้ง AUTO_INCREMENT ไว้ จึงต้องออกเลขเอง
    $autoStmt = $db->prepare("
        SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'subject'
          AND column_name = 'subject_id' AND extra LIKE '%auto_increment%'
    ");
    $autoStmt->execute();
    $isAutoIncrement = (int)$autoStmt->fetchColumn() > 0;

    if ($isAutoIncrement) {
        $db->prepare("
            INSERT INTO subject (subject_code, subject_name_th, credit, semester, academic_year, is_active)
            VALUES (:code, :name, :credit, :semester, :year, 1)
        ")->execute([
            ':code' => $curriculumSubject['subject_code'],
            ':name' => $curriculumSubject['subject_name'],
            ':credit' => $curriculumSubject['credit'],
            ':semester' => $curriculumSubject['semester'],
            ':year' => $curriculumSubject['academic_year'],
        ]);
        return (int)$db->lastInsertId();
    }

    $nextId = (int)$db->query("SELECT COALESCE(MAX(subject_id), 0) + 1 FROM subject")->fetchColumn();
    $db->prepare("
        INSERT INTO subject (subject_id, subject_code, subject_name_th, credit, semester, academic_year, is_active)
        VALUES (:id, :code, :name, :credit, :semester, :year, 1)
    ")->execute([
        ':id' => $nextId,
        ':code' => $curriculumSubject['subject_code'],
        ':name' => $curriculumSubject['subject_name'],
        ':credit' => $curriculumSubject['credit'],
        ':semester' => $curriculumSubject['semester'],
        ':year' => $curriculumSubject['academic_year'],
    ]);

    return $nextId;
}

/**
 * รายวิชาที่เปิดให้ลงทะเบียน พร้อมสถานะของนักศึกษาคนนี้
 *
 * เปิดให้ลงทะเบียนเฉพาะรายวิชาที่มีอาจารย์ผู้รับผิดชอบแล้ว (หน้า "จัดอาจารย์ผู้สอน")
 * ส่วนวิชาที่ลงทะเบียนไว้แล้วจะคงอยู่ในรายการเสมอ แม้ภายหลังจะถูกถอนอาจารย์ออก
 *
 * @return array<int, array<string, mixed>>
 */
function registrationAvailableSubjects(PDO $db, string $studentId): array
{
    $subjects = activeCurriculumSubjects($db);
    if ($subjects === null) {
        return [];
    }

    // วิชาที่ลงทะเบียนไว้แล้ว (อ้างด้วยรหัสวิชา เพื่อให้ตรงกับรายวิชาของหลักสูตร)
    $enrolledStmt = $db->prepare("
        SELECT e.enrollment_id, e.subject_id, e.academic_year, e.semester, e.status, s.subject_code
        FROM enrollment e
        INNER JOIN subject s ON s.subject_id = e.subject_id
        WHERE e.student_id = :sid
    ");
    $enrolledStmt->execute([':sid' => $studentId]);
    $enrolled = [];
    foreach ($enrolledStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $enrolled[(string)$row['subject_code']] = $row;
    }

    // อาจารย์ผู้รับผิดชอบรายวิชา (หน้า "จัดอาจารย์ผู้สอน")
    $frameworkId = getActiveFrameworkId($db);
    $instructorByCode = $frameworkId ? getSubjectInstructorMap($db, $frameworkId) : [];
    $facultyNames = [];
    if (!empty($instructorByCode)) {
        $ids = array_values(array_unique(array_filter($instructorByCode)));
        if (!empty($ids)) {
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $nameStmt = $db->prepare("
                SELECT faculty_id, TRIM(CONCAT(IFNULL(title,''), ' ', first_name_th, ' ', last_name_th)) AS name
                FROM faculty WHERE faculty_id IN ($ph)
            ");
            $nameStmt->execute($ids);
            foreach ($nameStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
                $facultyNames[(string)$row['faculty_id']] = (string)$row['name'];
            }
        }
    }

    $yloMap = outcomesSubjectYloMap($db);

    $out = [];
    foreach ($subjects as $subject) {
        $code = $subject['subject_code'];
        $row = $enrolled[$code] ?? null;
        $instructorId = $instructorByCode[$code] ?? null;

        // ยังไม่มีอาจารย์ผู้รับผิดชอบ = ยังไม่เปิดให้ลงทะเบียน
        if ($instructorId === null && $row === null) {
            continue;
        }

        $out[] = [
            'subject_code' => $code,
            'subject_name' => $subject['subject_name'],
            'credit' => $subject['credit'],
            'credit_desc' => $subject['credit_desc'],
            'ylo' => $yloMap[$code] ?? null,
            'instructor_id' => $instructorId,
            'instructor_name' => $instructorId !== null ? ($facultyNames[(string)$instructorId] ?? null) : null,
            'is_enrolled' => $row !== null,
            'enrollment_id' => $row !== null ? (int)$row['enrollment_id'] : null,
            'enrollment_status' => $row !== null ? (string)$row['status'] : null,
            // มีคะแนนแล้วห้ามถอน เพราะจะทำให้ผลประเมินหาย
            'has_scores' => false,
        ];
    }

    // วิชาไหนมีคะแนนบันทึกไว้แล้วบ้าง
    $subjectIds = array_values(array_filter(array_map(
        static fn(array $r) => $enrolled[$r['subject_code']]['subject_id'] ?? null,
        $out
    )));
    if (!empty($subjectIds) && outcomesTableExists($db, 'student_clo_sub_scores')) {
        $ph = implode(',', array_fill(0, count($subjectIds), '?'));
        $scoreStmt = $db->prepare("
            SELECT DISTINCT s.subject_code
            FROM student_clo_sub_scores sc
            INNER JOIN subject s ON s.subject_id = sc.subject_id
            WHERE sc.student_id = ? AND sc.subject_id IN ($ph) AND sc.score IS NOT NULL
        ");
        $scoreStmt->execute(array_merge([$studentId], $subjectIds));
        $withScores = array_flip($scoreStmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
        foreach ($out as &$item) {
            $item['has_scores'] = isset($withScores[$item['subject_code']]);
        }
        unset($item);
    }

    return $out;
}
