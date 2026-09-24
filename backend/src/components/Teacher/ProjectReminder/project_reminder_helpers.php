<?php
/**
 * แจ้งเตือนโครงการใกล้สิ้นสุด
 *
 * - กำหนดเวลาแจ้งจากวันสิ้นสุดโครงการ (project.end_date) อย่างเดียว ไม่ดูวันเริ่ม
 * - ไม่แจ้งโครงการที่เสร็จสิ้นหรือยกเลิกแล้ว (PROJECT_REMINDER_SKIP_STATUSES)
 * - แจ้งก่อนสิ้นสุด 30 และ 14 วัน (ปรับได้ที่ PROJECT_REMINDER_STAGES_DAYS)
 * - ผู้รับ: ผู้ดูแลระบบ (role 1) ทุกคนในระบบ + อีเมลคณะ nus1@siam.edu (เปลี่ยนได้ด้วย env PROJECT_REMINDER_EMAIL)
 *
 * จุดที่เรียกใช้:
 *  - NotificationPage/get_notifications.php          → เช็กอัตโนมัติไม่เกินชั่วโมงละครั้ง
 *  - ProjectsPage/add_project.php, update_project.php → เช็กโครงการนั้นทันทีหลังบันทึก
 *  - ?page=run-project-reminders                      → แอดมินสั่งรันเอง
 *  - cron/project_end_reminders.php                   → สำหรับตั้ง cron บนเซิร์ฟเวอร์จริง
 *
 * แต่ละ (โครงการ, วันสิ้นสุด, ระยะ) แจ้งได้ครั้งเดียว — เลื่อนวันสิ้นสุดแล้ว รอบแจ้งเตือนจะเริ่มใหม่เอง
 */
require_once __DIR__ . '/../../../config/mailer.php';
require_once __DIR__ . '/../../../config/scheduled_jobs.php';

const PROJECT_REMINDER_STAGES_DAYS = [30, 14]; // วันก่อนสิ้นสุด เรียงจากไกลไปใกล้
const PROJECT_REMINDER_SKIP_STATUSES = ['completed', 'cancelled'];
const PROJECT_REMINDER_JOB = 'project_end_reminders';
const PROJECT_REMINDER_EMAIL_DEFAULT = 'nus1@siam.edu';
const PROJECT_REMINDER_MAX_EMAIL_ATTEMPTS = 5;

function projectReminderRecipientEmail(): string
{
    return trim((string)(getenv('PROJECT_REMINDER_EMAIL') ?: PROJECT_REMINDER_EMAIL_DEFAULT));
}

// สร้างตารางอัตโนมัติ (import ดัมพ์เก่าก็ไม่พัง)
function projectReminderEnsureSchema(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $db->exec("
        CREATE TABLE IF NOT EXISTS project_end_reminders (
            id BIGINT NOT NULL AUTO_INCREMENT,
            project_id BIGINT NOT NULL,
            end_date DATE NOT NULL,
            stage_days SMALLINT NOT NULL COMMENT 'จำนวนวันก่อนสิ้นสุด (30 หรือ 14)',
            admin_notified INT NOT NULL DEFAULT 0 COMMENT 'จำนวนแอดมินที่ได้รับแจ้งเตือนในระบบ',
            email_to VARCHAR(255) NULL,
            email_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'sent | failed | not_configured | invalid_recipient',
            email_error TEXT NULL,
            email_attempts INT NOT NULL DEFAULT 0,
            email_sent_at TIMESTAMP NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_project_end_reminder_stage (project_id, end_date, stage_days),
            CONSTRAINT fk_project_end_reminders_project
                FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $ready = true;
}

/** ระยะที่ต้องแจ้งตอนนี้ (30/14) หรือ null ถ้ายังเหลือมากกว่า 30 วัน หรือสิ้นสุดไปแล้ว */
function projectReminderDueStage(int $daysLeft): ?int
{
    if ($daysLeft < 0) {
        return null;
    }
    $due = null;
    foreach (PROJECT_REMINDER_STAGES_DAYS as $days) {
        if ($daysLeft <= $days) {
            $due = $days; // วนจากไกลไปใกล้ ค่าสุดท้ายที่ผ่านคือระยะที่ใกล้สิ้นสุดที่สุด
        }
    }
    return $due;
}

function projectReminderThaiDate(?string $ymd): string
{
    if ($ymd === null || $ymd === '') {
        return '-';
    }
    $months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
               'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    $date = new DateTimeImmutable($ymd);
    return (int)$date->format('j') . ' ' . $months[(int)$date->format('n') - 1] . ' ' . ((int)$date->format('Y') + 543);
}

function projectReminderTypeLabel(string $type): string
{
    return match ($type) {
        'academic_service' => 'บริการวิชาการ',
        'culture' => 'ทำนุบำรุงศิลปวัฒนธรรม',
        default => 'โครงการอื่น',
    };
}

function projectReminderStatusLabel(string $status): string
{
    // ใช้คำเดียวกับหน้าจัดการโครงการ (ProjectsPage.tsx)
    return match ($status) {
        'pending' => 'รออนุมัติ',
        'active' => 'กำลังดำเนินการ',
        'completed' => 'เสร็จสิ้น',
        'cancelled' => 'ไม่อนุมัติ/ยกเลิก',
        default => $status !== '' ? $status : '-',
    };
}

function projectReminderContent(array $row, int $daysLeft): array
{
    $name = trim((string)($row['project_name_th'] ?? ''))
        ?: (trim((string)($row['project_name_en'] ?? '')) ?: 'โครงการ #' . $row['project_id']);
    $type = projectReminderTypeLabel((string)($row['project_type'] ?? 'other'));
    $status = projectReminderStatusLabel((string)($row['status'] ?? ''));
    $year = !empty($row['academic_year']) ? (string)$row['academic_year'] : '-';
    $responsible = trim((string)($row['responsible_name'] ?? '')) ?: '-';
    $startText = projectReminderThaiDate($row['start_date'] ?? null);
    $endText = projectReminderThaiDate($row['end_date']);
    $remaining = $daysLeft === 0 ? 'สิ้นสุดวันนี้' : "อีก {$daysLeft} วัน";
    $appUrl = rtrim((string)(getenv('APP_URL') ?: 'http://localhost:5173'), '/');

    $title = "ระยะเวลาโครงการใกล้สิ้นสุด ({$remaining})";
    $message = "โครงการ \"{$name}\" ({$type} ปีการศึกษา {$year}) จะสิ้นสุดวันที่ {$endText} ({$remaining}) "
             . "ระยะเวลาของโครงการใกล้สิ้นสุดแล้ว กรุณาเริ่มดำเนินโครงการ | สถานะปัจจุบัน: {$status} | ผู้ดำเนินโครงการ: {$responsible}";

    $h = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    $rows = [
        'ชื่อโครงการ' => $name,
        'ประเภท' => $type,
        'ปีการศึกษา' => $year,
        'ผู้ดำเนินโครงการ' => $responsible,
        'สถานะปัจจุบัน' => $status,
        'วันเริ่มโครงการ' => $startText,
        'วันสิ้นสุดโครงการ' => $endText,
        'คงเหลือ' => $remaining,
    ];
    $tableRows = '';
    foreach ($rows as $label => $value) {
        $tableRows .= '<tr><td style="padding:4px 16px 4px 0;color:#6b7280;white-space:nowrap">' . $h($label)
                    . '</td><td style="padding:4px 0"><strong>' . $h($value) . '</strong></td></tr>';
    }
    $safeUrl = $h($appUrl);
    $safeRemaining = $h($remaining);

    $html = <<<HTML
<div style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7;color:#1f2937;max-width:600px">
  <p>เรียน ผู้ดูแลระบบ คณะพยาบาลศาสตร์</p>
  <p>ระยะเวลาของโครงการต่อไปนี้<strong>ใกล้สิ้นสุดแล้ว ({$safeRemaining})</strong> กรุณาเริ่มดำเนินโครงการ</p>
  <table style="border-collapse:collapse;margin:12px 0">{$tableRows}</table>
  <p><a href="{$safeUrl}" style="display:inline-block;background:#8a2be2;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none">เข้าสู่ระบบเพื่อจัดการโครงการ</a></p>
  <p style="color:#9ca3af;font-size:13px">อีเมลนี้ส่งอัตโนมัติจากระบบบริหารจัดการคณะพยาบาลศาสตร์ มหาวิทยาลัยสยาม ระบบจะแจ้งเตือนก่อนโครงการสิ้นสุด 30 และ 14 วัน</p>
</div>
HTML;

    $text = "เรียน ผู้ดูแลระบบ คณะพยาบาลศาสตร์\n\n"
          . "ระยะเวลาของโครงการต่อไปนี้ใกล้สิ้นสุดแล้ว ({$remaining}) กรุณาเริ่มดำเนินโครงการ\n\n";
    foreach ($rows as $label => $value) {
        $text .= "{$label}: {$value}\n";
    }
    $text .= "\nเข้าสู่ระบบ: {$appUrl}\n";

    return [
        'title' => $title,
        'message' => $message,
        'subject' => "[แจ้งเตือนโครงการ] {$name} ใกล้สิ้นสุด ({$remaining})",
        'html' => $html,
        'text' => $text,
    ];
}

function projectReminderDeliverEmail(PDO $db, array $reminder, array $content, array &$summary): void
{
    $to = projectReminderRecipientEmail();
    $attempts = (int)($reminder['email_attempts'] ?? 0);

    $result = appSendMail($to, 'คณะพยาบาลศาสตร์ มหาวิทยาลัยสยาม', $content['subject'], $content['html'], $content['text']);
    $status = $result['status'];
    if (in_array($status, ['sent', 'failed'], true)) {
        $attempts++;
    }

    $stmt = $db->prepare("
        UPDATE project_end_reminders
        SET email_to = :email_to, email_status = :status, email_error = :error, email_attempts = :attempts,
            email_sent_at = IF(:sent = 1, NOW(), email_sent_at)
        WHERE id = :id
    ");
    $stmt->execute([
        ':email_to' => mb_substr($to, 0, 255),
        ':status' => $status,
        ':error' => $result['error'],
        ':attempts' => $attempts,
        ':sent' => $status === 'sent' ? 1 : 0,
        ':id' => $reminder['id'],
    ]);

    $key = 'emails_' . $status;
    $summary[$key] = ($summary[$key] ?? 0) + 1;
}

/**
 * เช็กและส่งแจ้งเตือน — ส่ง project_id มาเพื่อเช็กเฉพาะโครงการเดียว
 * @return array สรุปผล เช่น ['checked' => 2, 'notified_projects' => 1, 'admin_notifications' => 1, 'emails_sent' => 1]
 */
function projectReminderProcess(PDO $db, ?int $onlyProjectId = null): array
{
    projectReminderEnsureSchema($db);
    $maxDays = max(PROJECT_REMINDER_STAGES_DAYS);

    // project_type มาจาก schema ของทีม — ฐานข้อมูลที่ยังไม่ได้รัน migration จะไม่มีคอลัมน์นี้
    $hasType = (int)$db->query("
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project' AND COLUMN_NAME = 'project_type'
    ")->fetchColumn() > 0;
    $typeSelect = $hasType ? 'p.project_type' : "'other' AS project_type";

    $skipStatuses = implode(', ', array_map(static fn(string $status): string => $db->quote($status), PROJECT_REMINDER_SKIP_STATUSES));

    // วันที่ใช้ CURDATE() ของ MySQL (Asia/Bangkok)
    $sql = "
        SELECT p.project_id, p.project_name_th, p.project_name_en, {$typeSelect}, p.academic_year, p.status,
               p.start_date, p.end_date, DATEDIFF(p.end_date, CURDATE()) AS days_left,
               TRIM(CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, ''))) AS responsible_name
        FROM project p
        LEFT JOIN faculty f ON f.faculty_id = p.responsible_faculty_id
        WHERE p.end_date IS NOT NULL
          AND p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL {$maxDays} DAY)
          AND p.status NOT IN ({$skipStatuses})
    ";
    $params = [];
    if ($onlyProjectId !== null) {
        $sql .= " AND p.project_id = :project_id";
        $params[':project_id'] = $onlyProjectId;
    }
    $sql .= " ORDER BY p.end_date ASC, p.project_id ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $admins = $db->query("SELECT user_id FROM users WHERE role_id = 1 AND status = 'active'")->fetchAll(PDO::FETCH_COLUMN);

    $summary = ['checked' => count($rows), 'notified_projects' => 0, 'admin_notifications' => 0];

    $existingStmt = $db->prepare("
        SELECT id, stage_days, email_status, email_attempts
        FROM project_end_reminders
        WHERE project_id = ? AND end_date = ?
        ORDER BY stage_days ASC
    ");
    $insertReminder = $db->prepare("
        INSERT IGNORE INTO project_end_reminders (project_id, end_date, stage_days) VALUES (?, ?, ?)
    ");
    $insertNotification = $db->prepare("
        INSERT INTO notifications (user_id, sender_user_id, title, message, payload_json, type, channel, is_read)
        VALUES (?, NULL, ?, ?, ?, 'warning', 'both', 0)
    ");

    foreach ($rows as $row) {
        $daysLeft = (int)$row['days_left'];
        $stage = projectReminderDueStage($daysLeft);
        if ($stage === null) {
            continue;
        }

        $content = projectReminderContent($row, $daysLeft);

        $existingStmt->execute([$row['project_id'], $row['end_date']]);
        $existing = $existingStmt->fetchAll(PDO::FETCH_ASSOC);

        // แจ้งระยะนี้ (หรือระยะที่ใกล้กว่า) ไปแล้ว → ลองส่งอีเมลซ้ำเฉพาะกรณีรอบก่อนส่งไม่สำเร็จ
        if (!empty($existing) && (int)$existing[0]['stage_days'] <= $stage) {
            $current = $existing[0];
            $retryable = in_array($current['email_status'], ['pending', 'not_configured', 'invalid_recipient'], true)
                || ($current['email_status'] === 'failed' && (int)$current['email_attempts'] < PROJECT_REMINDER_MAX_EMAIL_ATTEMPTS);
            if ((int)$current['stage_days'] === $stage && $retryable) {
                projectReminderDeliverEmail($db, $current, $content, $summary);
            }
            continue;
        }

        // จองแถวก่อน — ถ้ามีคำขออื่นจองไปแล้ว (UNIQUE) จะไม่แจ้งซ้ำ
        $insertReminder->execute([$row['project_id'], $row['end_date'], $stage]);
        if ($insertReminder->rowCount() === 0) {
            continue;
        }
        $reminder = ['id' => (int)$db->lastInsertId(), 'email_attempts' => 0];

        $payload = json_encode([
            'kind' => 'project_end',
            'project_id' => (int)$row['project_id'],
            'stage_days' => $stage,
            'end_date' => $row['end_date'],
            'days_left' => $daysLeft,
            'link' => 'projectspage',
        ], JSON_UNESCAPED_UNICODE);

        foreach ($admins as $adminUserId) {
            $insertNotification->execute([$adminUserId, $content['title'], $content['message'], $payload]);
        }
        $db->prepare("UPDATE project_end_reminders SET admin_notified = ? WHERE id = ?")
           ->execute([count($admins), $reminder['id']]);

        $summary['notified_projects']++;
        $summary['admin_notifications'] += count($admins);

        projectReminderDeliverEmail($db, $reminder, $content, $summary);
    }

    return $summary;
}

function projectReminderRecordRun(PDO $db, array $summary): void
{
    scheduledJobRecordRun($db, PROJECT_REMINDER_JOB, $summary);
}

/** รันตามรอบ (ค่าเริ่มต้นไม่เกินชั่วโมงละครั้ง) — คืน null ถ้ายังไม่ถึงรอบ */
function projectReminderMaybeRunScheduled(PDO $db, int $intervalMinutes = 60): ?array
{
    return scheduledJobRunIfDue(
        $db,
        PROJECT_REMINDER_JOB,
        static fn(PDO $db): array => projectReminderProcess($db),
        $intervalMinutes
    );
}
