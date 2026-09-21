<?php
/**
 * เช็กโครงการใกล้สิ้นสุด แล้วแจ้งเตือนแอดมินในระบบ + อีเมลคณะ (nus1@siam.edu)
 *
 * ปกติระบบเช็กเองอัตโนมัติชั่วโมงละครั้งเมื่อมีผู้ใช้เปิดระบบอยู่
 * บนเซิร์ฟเวอร์จริงแนะนำให้ตั้ง cron วันละครั้งด้วย เพื่อให้แจ้งเตือนออกแม้ไม่มีใครเข้าระบบ เช่น
 *   0 8 * * * docker exec php-apache php /var/www/html/cron/project_end_reminders.php
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../components/Teacher/ProjectReminder/project_reminder_helpers.php';

$db = new Connect();
$summary = projectReminderProcess($db);
projectReminderRecordRun($db, $summary);

echo json_encode(
    array_merge($summary, [
        'email_to' => projectReminderRecipientEmail(),
        'smtp_configured' => appMailerIsConfigured(),
    ]),
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
) . PHP_EOL;
