<?php
/**
 * ลบข้อมูลนักศึกษาที่เข้าศึกษามานานเกินกำหนด (ค่าเริ่มต้น 8 ปี) ออกจากระบบ
 *
 * - ทำงานอัตโนมัติปีละครั้ง หลังวันตัดรอบเลื่อนชั้นปี (เปิด/ปิดได้ที่หน้าจัดการผู้ใช้)
 * - ก่อนลบจะ export ข้อมูลของนักศึกษาที่จะถูกลบเก็บเป็นไฟล์ JSON ไว้ที่
 *   backend/src/uploads/student-purge-archive/ เพื่อให้ยังตรวจสอบย้อนหลังได้
 * - ลบข้อมูลในตารางลูกที่ไม่มี ON DELETE CASCADE ให้ด้วย แล้วจึงลบแถวนักศึกษาและบัญชีผู้ใช้
 */

require_once __DIR__ . '/../../../config/academic_helper.php';
require_once __DIR__ . '/../../../config/scheduled_jobs.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

const STUDENT_PURGE_JOB = 'student_purge_yearly';
const STUDENT_PURGE_ARCHIVE_DIR = __DIR__ . '/../../../uploads/student-purge-archive';

/** ตารางลูกที่อ้างถึงนักศึกษาด้วย student_id (ลบก่อนลบตัวนักศึกษา) */
function studentPurgeChildTables(PDO $db): array
{
    $stmt = $db->prepare("
        SELECT DISTINCT TABLE_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND COLUMN_NAME = 'student_id'
          AND TABLE_NAME <> 'student'
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
}

/** ปีที่เข้าศึกษาที่ถือว่าเกินกำหนด (เข้าก่อนหรือเท่ากับปีนี้) */
function studentPurgeCutoffEntryYear(PDO $db): int
{
    $years = academicPurgeYears($db);
    $info = calculateRealtimeAcademicInfo('', null, $db);
    return (int)$info['academic_year'] - $years;
}

/** รายชื่อนักศึกษาที่เข้าเกณฑ์ถูกลบ */
function studentPurgeCandidates(PDO $db): array
{
    $cutoffYear = studentPurgeCutoffEntryYear($db);
    $rows = $db->query("SELECT * FROM student")->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $candidates = [];

    foreach ($rows as $row) {
        $info = calculateRealtimeAcademicInfo($row['student_id'], $row['admission_year'] ?? null, $db);
        if ((int)$info['entry_year'] <= $cutoffYear) {
            $row['_entry_year'] = (int)$info['entry_year'];
            $candidates[] = $row;
        }
    }

    return $candidates;
}

/** สรุปจำนวนที่จะถูกลบ (ใช้แสดงในหน้าตั้งค่า) */
function studentPurgePreview(PDO $db): array
{
    $candidates = studentPurgeCandidates($db);
    $byYear = [];
    foreach ($candidates as $row) {
        $key = (string)$row['_entry_year'];
        $byYear[$key] = ($byYear[$key] ?? 0) + 1;
    }
    ksort($byYear);

    return [
        'cutoff_entry_year' => studentPurgeCutoffEntryYear($db),
        'total' => count($candidates),
        'by_entry_year' => $byYear,
        'sample' => array_map(
            static fn(array $r): string => (string)$r['student_id'],
            array_slice($candidates, 0, 10)
        ),
    ];
}

/** เก็บสำเนาข้อมูลก่อนลบ คืน path ของไฟล์ */
function studentPurgeArchive(array $candidates): ?string
{
    if (empty($candidates)) {
        return null;
    }
    if (!is_dir(STUDENT_PURGE_ARCHIVE_DIR)) {
        @mkdir(STUDENT_PURGE_ARCHIVE_DIR, 0775, true);
    }
    $file = STUDENT_PURGE_ARCHIVE_DIR . '/purge_' . date('Ymd_His') . '.json';
    $ok = @file_put_contents($file, json_encode($candidates, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $ok === false ? null : $file;
}

/**
 * ลบจริง
 * @param int|string|null $actorUserId ผู้สั่งลบ (null = ระบบรันอัตโนมัติ)
 */
function studentPurgeRun(PDO $db, $actorUserId = null): array
{
    $candidates = studentPurgeCandidates($db);
    if (empty($candidates)) {
        return ['status' => 'ok', 'deleted' => 0, 'message' => 'ไม่มีนักศึกษาที่เข้าเกณฑ์ต้องลบ'];
    }

    $archive = studentPurgeArchive($candidates);
    $ids = array_map(static fn(array $r) => (string)$r['student_id'], $candidates);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $childTables = studentPurgeChildTables($db);

    $db->beginTransaction();
    try {
        foreach ($childTables as $table) {
            $db->prepare("DELETE FROM `{$table}` WHERE student_id IN ($placeholders)")->execute($ids);
        }
        $db->prepare("DELETE FROM student WHERE student_id IN ($placeholders)")->execute($ids);
        // บัญชีผู้ใช้ของนักศึกษา (username = รหัสนักศึกษา)
        $userStmt = $db->prepare("DELETE FROM users WHERE role_id = 3 AND username IN ($placeholders)");
        $userStmt->execute($ids);
        $deletedUsers = $userStmt->rowCount();
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        return ['status' => 'error', 'deleted' => 0, 'message' => $e->getMessage()];
    }

    $summary = [
        'status' => 'ok',
        'deleted' => count($ids),
        'deleted_users' => $deletedUsers,
        'cutoff_entry_year' => studentPurgeCutoffEntryYear($db),
        'archive_file' => $archive ? basename($archive) : null,
        'ran_at' => date('Y-m-d H:i:s'),
    ];

    logAudit(
        $db,
        $actorUserId,
        'delete',
        'students',
        sprintf(
            'ลบข้อมูลนักศึกษาที่เข้าศึกษาเกิน %d ปี จำนวน %d คน (บัญชีผู้ใช้ %d บัญชี) %s',
            academicPurgeYears($db),
            count($ids),
            $deletedUsers,
            $archive ? '| สำรองไว้ที่ ' . basename($archive) : '| ไม่ได้สำรองไฟล์'
        )
    );

    return $summary;
}

/** รันอัตโนมัติ: ปีละครั้ง และเฉพาะเมื่อเปิดใช้งานไว้ */
function studentPurgeRunIfDue(PDO $db): ?array
{
    if (!academicPurgeEnabled($db)) {
        return null;
    }
    // 365 วันต่อครั้ง
    return scheduledJobRunIfDue($db, STUDENT_PURGE_JOB, static function (PDO $db): array {
        return studentPurgeRun($db, null);
    }, 365 * 24 * 60);
}
