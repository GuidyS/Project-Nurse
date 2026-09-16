<?php
/**
 * แจ้งเตือนใบประกอบวิชาชีพการพยาบาลใกล้หมดอายุ — 6 / 3 / 1 เดือนก่อนหมดอายุ
 * ส่งทั้งแจ้งเตือนในระบบ (ตาราง notifications) และอีเมล (config/mailer.php)
 *
 * จุดที่เรียกใช้:
 *  - NotificationPage/get_notifications.php → เช็กอัตโนมัติไม่เกินชั่วโมงละครั้ง (sidebar เรียกทุก 30 วินาที)
 *  - ProfilePage/get_profile.php            → เช็กทันทีเมื่ออาจารย์บันทึกข้อมูลส่วนตัว
 *  - cron/license_expiry_reminders.php      → สำหรับตั้ง cron บนเซิร์ฟเวอร์จริง
 *  - ?page=run-license-reminders            → แอดมินสั่งรันเอง
 *
 * แต่ละ (อาจารย์, วันหมดอายุ, ระยะ) แจ้งได้ครั้งเดียว — ต่ออายุแล้วเปลี่ยนวันหมดอายุ รอบแจ้งเตือนจะเริ่มใหม่เอง
 */
require_once __DIR__ . '/../../../config/mailer.php';

const LICENSE_REMINDER_STAGES = [6, 3, 1]; // เดือนก่อนหมดอายุ เรียงจากไกลไปใกล้
const LICENSE_REMINDER_JOB = 'license_expiry_reminders';
const LICENSE_REMINDER_MAX_EMAIL_ATTEMPTS = 5;

function licenseReminderTableExists(PDO $db, string $table): bool
{
    $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $stmt->execute([$table]);
    return (int)$stmt->fetchColumn() > 0;
}

function licenseReminderColumnExists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

// สร้างคอลัมน์/ตารางอัตโนมัติ (import ดัมพ์เก่าก็ไม่พัง)
function licenseReminderEnsureSchema(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    // แยกจาก license_file ที่แอดมินอัปโหลด PDF ไว้ เพื่อไม่ให้รูปของอาจารย์ไปทับ
    if (!licenseReminderColumnExists($db, 'faculty', 'license_image')) {
        $db->exec("ALTER TABLE faculty ADD COLUMN license_image TEXT NULL COMMENT 'รูปใบประกอบวิชาชีพที่อาจารย์อัปโหลดเอง'");
    }

    $db->exec("
        CREATE TABLE IF NOT EXISTS faculty_license_reminders (
            id BIGINT NOT NULL AUTO_INCREMENT,
            faculty_id BIGINT NOT NULL,
            license_expiry DATE NOT NULL,
            stage_months TINYINT NOT NULL COMMENT '6, 3 หรือ 1 เดือนก่อนหมดอายุ',
            notification_id BIGINT NULL,
            email_to VARCHAR(100) NULL,
            email_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'sent | failed | no_email | disabled | not_configured',
            email_error TEXT NULL,
            email_attempts INT NOT NULL DEFAULT 0,
            email_sent_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_license_reminder_stage (faculty_id, license_expiry, stage_months)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

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

// ลบเดือนแบบไม่ล้นไปเดือนถัดไป (31 ส.ค. - 6 เดือน = 28/29 ก.พ.)
function licenseReminderSubMonths(DateTimeImmutable $date, int $months): DateTimeImmutable
{
    $year = (int)$date->format('Y');
    $month = (int)$date->format('n') - $months;
    while ($month < 1) {
        $month += 12;
        $year--;
    }
    $lastDay = (int)(new DateTimeImmutable(sprintf('%04d-%02d-01', $year, $month)))->format('t');
    return new DateTimeImmutable(sprintf('%04d-%02d-%02d', $year, $month, min((int)$date->format('j'), $lastDay)));
}

/** ระยะที่ต้องแจ้งตอนนี้ (6/3/1) หรือ null ถ้ายังไม่ถึง 6 เดือน หรือหมดอายุไปแล้ว */
function licenseReminderDueStage(DateTimeImmutable $expiry, DateTimeImmutable $today): ?int
{
    if ($expiry < $today) {
        return null;
    }
    $due = null;
    foreach (LICENSE_REMINDER_STAGES as $months) {
        if ($today >= licenseReminderSubMonths($expiry, $months)) {
            $due = $months; // วนจากไกลไปใกล้ ค่าสุดท้ายที่ผ่านคือระยะที่ใกล้หมดอายุที่สุด
        }
    }
    return $due;
}

function licenseReminderThaiDate(DateTimeImmutable $date): string
{
    $months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
               'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return (int)$date->format('j') . ' ' . $months[(int)$date->format('n') - 1] . ' ' . ((int)$date->format('Y') + 543);
}

function licenseReminderContent(array $row, int $stage, DateTimeImmutable $expiry, int $daysLeft): array
{
    $name = trim(($row['title'] ?? '') . ($row['first_name_th'] ?? '') . ' ' . ($row['last_name_th'] ?? '')) ?: 'อาจารย์';
    $expiryText = licenseReminderThaiDate($expiry);
    $appUrl = rtrim((string)(getenv('APP_URL') ?: 'http://localhost:5173'), '/');

    $title = "ใบประกอบวิชาชีพจะหมดอายุในอีก {$stage} เดือน";
    $message = "ใบอนุญาตประกอบวิชาชีพการพยาบาลของท่านจะหมดอายุวันที่ {$expiryText} (อีก {$daysLeft} วัน) "
             . "กรุณาดำเนินการต่ออายุ แล้วอัปเดตวันหมดอายุและรูปใบประกอบวิชาชีพใหม่ในหน้าข้อมูลส่วนตัว";

    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeUrl = htmlspecialchars($appUrl, ENT_QUOTES, 'UTF-8');
    $html = <<<HTML
<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7;color:#1f2937;max-width:560px">
  <p>เรียน {$safeName}</p>
  <p>ใบอนุญาตประกอบวิชาชีพการพยาบาลของท่านจะหมดอายุในอีก <strong>{$stage} เดือน</strong></p>
  <table style="border-collapse:collapse;margin:12px 0">
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">วันหมดอายุ</td><td style="padding:4px 0"><strong>{$expiryText}</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">คงเหลือ</td><td style="padding:4px 0"><strong>{$daysLeft} วัน</strong></td></tr>
  </table>
  <p>กรุณาดำเนินการต่ออายุใบอนุญาต แล้วเข้าสู่ระบบเพื่ออัปเดตวันหมดอายุและรูปใบประกอบวิชาชีพใหม่ในหน้า <strong>ข้อมูลส่วนตัว</strong></p>
  <p><a href="{$safeUrl}" style="display:inline-block;background:#8a2be2;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none">เข้าสู่ระบบ</a></p>
  <p style="color:#9ca3af;font-size:13px">อีเมลนี้ส่งอัตโนมัติจากระบบบริหารจัดการคณะพยาบาลศาสตร์ มหาวิทยาลัยสยาม ระบบจะแจ้งเตือนก่อนหมดอายุ 6 เดือน, 3 เดือน และ 1 เดือน</p>
</div>
HTML;

    $text = "เรียน {$name}\n\n"
          . "ใบอนุญาตประกอบวิชาชีพการพยาบาลของท่านจะหมดอายุในอีก {$stage} เดือน\n"
          . "วันหมดอายุ: {$expiryText} (คงเหลือ {$daysLeft} วัน)\n\n"
          . "กรุณาดำเนินการต่ออายุ แล้วเข้าสู่ระบบ {$appUrl} เพื่ออัปเดตข้อมูลในหน้าข้อมูลส่วนตัว\n";

    return [
        'name' => $name,
        'title' => $title,
        'message' => $message,
        'subject' => "[แจ้งเตือน] {$title}",
        'html' => $html,
        'text' => $text,
    ];
}

function licenseReminderDeliverEmail(PDO $db, array $reminder, array $row, array $content, array &$summary): void
{
    $email = trim((string)($row['email'] ?? ''));
    $attempts = (int)($reminder['email_attempts'] ?? 0);

    if (isset($row['email_notifications']) && $row['email_notifications'] !== null && (int)$row['email_notifications'] === 0) {
        $status = 'disabled';
        $error = 'ผู้ใช้ปิดการรับแจ้งเตือนทางอีเมล';
    } elseif ($email === '') {
        $status = 'no_email';
        $error = 'ยังไม่มีอีเมลในข้อมูลส่วนตัว';
    } else {
        $result = appSendMail($email, $content['name'], $content['subject'], $content['html'], $content['text']);
        $status = $result['status'] === 'invalid_recipient' ? 'no_email' : $result['status'];
        $error = $result['error'];
        if (in_array($status, ['sent', 'failed'], true)) {
            $attempts++;
        }
    }

    $stmt = $db->prepare("
        UPDATE faculty_license_reminders
        SET email_to = :email_to, email_status = :status, email_error = :error, email_attempts = :attempts,
            email_sent_at = IF(:sent = 1, NOW(), email_sent_at)
        WHERE id = :id
    ");
    $stmt->execute([
        ':email_to' => $email !== '' ? mb_substr($email, 0, 100) : null,
        ':status' => $status,
        ':error' => $error,
        ':attempts' => $attempts,
        ':sent' => $status === 'sent' ? 1 : 0,
        ':id' => $reminder['id'],
    ]);

    $key = 'emails_' . $status;
    $summary[$key] = ($summary[$key] ?? 0) + 1;
}

/**
 * เช็กและส่งแจ้งเตือน — ส่ง faculty_id มาเพื่อเช็กเฉพาะคนเดียว
 * @return array สรุปผล เช่น ['checked' => 3, 'notified' => 1, 'emails_sent' => 1]
 */
function licenseReminderProcess(PDO $db, ?string $onlyFacultyId = null): array
{
    licenseReminderEnsureSchema($db);

    // ใช้วันที่ของ MySQL (ตั้ง Asia/Bangkok) แทน PHP ที่เป็น UTC
    $today = new DateTimeImmutable((string)$db->query("SELECT CURDATE()")->fetchColumn());
    $maxMonths = max(LICENSE_REMINDER_STAGES);

    $hasSettings = licenseReminderTableExists($db, 'user_notification_settings');
    $settingsSelect = $hasSettings ? 's.email_notifications' : 'NULL AS email_notifications';
    $settingsJoin = $hasSettings ? 'LEFT JOIN user_notification_settings s ON s.user_id = u.user_id' : '';

    $sql = "
        SELECT f.faculty_id, f.title, f.first_name_th, f.last_name_th, f.email, f.license_expiry,
               u.user_id, {$settingsSelect}
        FROM faculty f
        LEFT JOIN users u ON u.username = f.faculty_id
        {$settingsJoin}
        WHERE f.license_expiry IS NOT NULL
          AND f.license_expiry BETWEEN :today AND DATE_ADD(:today_end, INTERVAL {$maxMonths} MONTH)
          AND (f.status IS NULL OR f.status <> 'Retired')
    ";
    $params = [':today' => $today->format('Y-m-d'), ':today_end' => $today->format('Y-m-d')];
    if ($onlyFacultyId !== null) {
        $sql .= " AND f.faculty_id = :faculty_id";
        $params[':faculty_id'] = $onlyFacultyId;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $summary = ['checked' => count($rows), 'notified' => 0];

    $existingStmt = $db->prepare("
        SELECT id, stage_months, email_status, email_attempts
        FROM faculty_license_reminders
        WHERE faculty_id = ? AND license_expiry = ?
        ORDER BY stage_months ASC
    ");
    $insertReminder = $db->prepare("
        INSERT IGNORE INTO faculty_license_reminders (faculty_id, license_expiry, stage_months)
        VALUES (?, ?, ?)
    ");
    $insertNotification = $db->prepare("
        INSERT INTO notifications (user_id, sender_user_id, title, message, payload_json, type, channel, is_read)
        VALUES (?, NULL, ?, ?, ?, 'warning', 'both', 0)
    ");

    foreach ($rows as $row) {
        $expiry = new DateTimeImmutable($row['license_expiry']);
        $stage = licenseReminderDueStage($expiry, $today);
        if ($stage === null) {
            continue;
        }

        $daysLeft = (int)$today->diff($expiry)->days;
        $content = licenseReminderContent($row, $stage, $expiry, $daysLeft);

        $existingStmt->execute([$row['faculty_id'], $row['license_expiry']]);
        $existing = $existingStmt->fetchAll(PDO::FETCH_ASSOC);

        // แจ้งระยะนี้ (หรือระยะที่ใกล้กว่า) ไปแล้ว → ลองส่งอีเมลซ้ำเฉพาะกรณีรอบก่อนส่งไม่สำเร็จ
        if (!empty($existing) && (int)$existing[0]['stage_months'] <= $stage) {
            $current = $existing[0];
            $retryable = in_array($current['email_status'], ['pending', 'no_email', 'not_configured', 'disabled'], true)
                || ($current['email_status'] === 'failed' && (int)$current['email_attempts'] < LICENSE_REMINDER_MAX_EMAIL_ATTEMPTS);
            if ((int)$current['stage_months'] === $stage && $retryable) {
                licenseReminderDeliverEmail($db, $current, $row, $content, $summary);
            }
            continue;
        }

        // จองแถวก่อน — ถ้ามีคำขออื่นจองไปแล้ว (UNIQUE) จะไม่แจ้งซ้ำ
        $insertReminder->execute([$row['faculty_id'], $row['license_expiry'], $stage]);
        if ($insertReminder->rowCount() === 0) {
            continue;
        }
        $reminder = ['id' => (int)$db->lastInsertId(), 'email_attempts' => 0];

        if (!empty($row['user_id'])) {
            $insertNotification->execute([
                $row['user_id'],
                $content['title'],
                $content['message'],
                json_encode([
                    'kind' => 'license_expiry',
                    'stage_months' => $stage,
                    'license_expiry' => $row['license_expiry'],
                    'days_left' => $daysLeft,
                    'link' => 'profile',
                ], JSON_UNESCAPED_UNICODE),
            ]);
            $db->prepare("UPDATE faculty_license_reminders SET notification_id = ? WHERE id = ?")
               ->execute([(int)$db->lastInsertId(), $reminder['id']]);
            $summary['notified']++;
        }

        licenseReminderDeliverEmail($db, $reminder, $row, $content, $summary);
    }

    return $summary;
}

function licenseReminderRecordRun(PDO $db, array $summary): void
{
    licenseReminderEnsureSchema($db);
    $db->prepare("
        INSERT INTO system_job_runs (job_name, last_run_at, last_result) VALUES (?, NOW(), ?)
        ON DUPLICATE KEY UPDATE last_run_at = NOW(), last_result = VALUES(last_result)
    ")->execute([LICENSE_REMINDER_JOB, json_encode($summary, JSON_UNESCAPED_UNICODE)]);
}

/** รันตามรอบ (ค่าเริ่มต้นไม่เกินชั่วโมงละครั้ง) — คืน null ถ้ายังไม่ถึงรอบ */
function licenseReminderMaybeRunScheduled(PDO $db, int $intervalMinutes = 60): ?array
{
    licenseReminderEnsureSchema($db);

    $dueStmt = $db->prepare("
        SELECT COUNT(*) FROM system_job_runs
        WHERE job_name = ? AND last_run_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
    ");
    $dueStmt->execute([LICENSE_REMINDER_JOB, $intervalMinutes]);
    if ((int)$dueStmt->fetchColumn() > 0) {
        return null;
    }

    // กันหลายคำขอรันพร้อมกัน
    if ((int)$db->query("SELECT GET_LOCK('" . LICENSE_REMINDER_JOB . "', 0)")->fetchColumn() !== 1) {
        return null;
    }

    try {
        $dueStmt->execute([LICENSE_REMINDER_JOB, $intervalMinutes]);
        if ((int)$dueStmt->fetchColumn() > 0) {
            return null;
        }
        // บันทึกเวลาก่อนรัน เพื่อไม่ให้คำขอถัดไปรันซ้ำระหว่างกำลังส่งอีเมล
        licenseReminderRecordRun($db, ['status' => 'running']);
        $summary = licenseReminderProcess($db);
        licenseReminderRecordRun($db, $summary);
        return $summary;
    } finally {
        $db->query("SELECT RELEASE_LOCK('" . LICENSE_REMINDER_JOB . "')");
    }
}
