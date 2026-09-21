<?php
/**
 * งานที่ต้องรันตามรอบ (เช่น แจ้งเตือนต่างๆ) — เก็บเวลารันล่าสุดในตาราง system_job_runs
 *
 * คอนเทนเนอร์ backend ไม่มี cron จึงเรียกจากคำขอที่เกิดบ่อย (get-notifications ที่ sidebar เรียกทุก 30 วินาที)
 * แล้วจำกัดความถี่ที่นี่ บนเซิร์ฟเวอร์จริงควรตั้ง cron เรียกสคริปต์ใน backend/src/cron/ เพิ่มด้วย
 */

function scheduledJobEnsureTable(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $db->exec("
        CREATE TABLE IF NOT EXISTS system_job_runs (
            job_name VARCHAR(100) NOT NULL,
            last_run_at DATETIME NOT NULL,
            last_result TEXT NULL,
            PRIMARY KEY (job_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $ready = true;
}

function scheduledJobRecordRun(PDO $db, string $jobName, array $summary): void
{
    scheduledJobEnsureTable($db);
    $db->prepare("
        INSERT INTO system_job_runs (job_name, last_run_at, last_result) VALUES (?, NOW(), ?)
        ON DUPLICATE KEY UPDATE last_run_at = NOW(), last_result = VALUES(last_result)
    ")->execute([$jobName, json_encode($summary, JSON_UNESCAPED_UNICODE)]);
}

/**
 * รัน $job ถ้าครบรอบแล้ว (ค่าเริ่มต้นไม่เกินชั่วโมงละครั้ง)
 * คืน null ถ้ายังไม่ถึงรอบ หรือมีคำขออื่นกำลังรันงานเดียวกันอยู่
 *
 * @param callable(PDO): array $job
 */
function scheduledJobRunIfDue(PDO $db, string $jobName, callable $job, int $intervalMinutes = 60): ?array
{
    scheduledJobEnsureTable($db);

    // เทียบเวลาด้วย NOW() ของ MySQL (Asia/Bangkok) — PHP ในคอนเทนเนอร์เป็น UTC
    $dueStmt = $db->prepare("
        SELECT COUNT(*) FROM system_job_runs
        WHERE job_name = ? AND last_run_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
    ");
    $dueStmt->execute([$jobName, $intervalMinutes]);
    if ((int)$dueStmt->fetchColumn() > 0) {
        return null;
    }

    // กันหลายคำขอรันงานเดียวกันพร้อมกัน
    $lockStmt = $db->prepare("SELECT GET_LOCK(?, 0)");
    $lockStmt->execute([$jobName]);
    if ((int)$lockStmt->fetchColumn() !== 1) {
        return null;
    }

    try {
        $dueStmt->execute([$jobName, $intervalMinutes]);
        if ((int)$dueStmt->fetchColumn() > 0) {
            return null;
        }
        // บันทึกเวลาก่อนรัน เพื่อไม่ให้คำขอถัดไปรันซ้ำระหว่างกำลังส่งอีเมล
        scheduledJobRecordRun($db, $jobName, ['status' => 'running']);
        $summary = $job($db);
        scheduledJobRecordRun($db, $jobName, $summary);
        return $summary;
    } finally {
        $releaseStmt = $db->prepare("SELECT RELEASE_LOCK(?)");
        $releaseStmt->execute([$jobName]);
        $releaseStmt->fetchColumn();
    }
}
