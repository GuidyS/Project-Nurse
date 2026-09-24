<?php
/**
 * เช็กใบประกอบวิชาชีพใกล้หมดอายุ แล้วส่งแจ้งเตือนในระบบ + อีเมล
 *
 * ปกติระบบเช็กเองอัตโนมัติชั่วโมงละครั้งเมื่อมีผู้ใช้เปิดระบบอยู่
 * บนเซิร์ฟเวอร์จริงแนะนำให้ตั้ง cron วันละครั้งด้วย เพื่อให้แจ้งเตือนออกแม้ไม่มีใครเข้าระบบ เช่น
 *   0 8 * * * docker exec php-apache php /var/www/html/cron/license_expiry_reminders.php
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../components/Teacher/LicenseReminder/license_reminder_helpers.php';

$db = new Connect();
$summary = licenseReminderProcess($db);
licenseReminderRecordRun($db, $summary);

echo json_encode(
    array_merge($summary, ['smtp_configured' => appMailerIsConfigured()]),
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
) . PHP_EOL;
