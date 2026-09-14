<?php
/**
 * ส่งอีเมลผ่าน SMTP (PHPMailer)
 *
 * ตั้งค่าผ่าน environment variable ของ container backend (ไฟล์ .env ข้าง docker-compose.yml — ดู .env.example)
 * ถ้ายังไม่ได้ตั้ง SMTP_HOST ระบบจะไม่ส่งอีเมล (คืนสถานะ not_configured) แต่ส่วนอื่นยังทำงานปกติ
 */
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailerException;

function appMailerConfig(): array
{
    $secure = strtolower(trim((string)getenv('SMTP_SECURE')));

    return [
        'host' => trim((string)getenv('SMTP_HOST')),
        'port' => (int)(getenv('SMTP_PORT') ?: 587),
        'username' => (string)getenv('SMTP_USERNAME'),
        'password' => (string)getenv('SMTP_PASSWORD'),
        'secure' => in_array($secure, ['tls', 'ssl', 'none'], true) ? $secure : 'tls',
        'from_email' => trim((string)(getenv('SMTP_FROM_EMAIL') ?: getenv('SMTP_USERNAME'))),
        'from_name' => trim((string)(getenv('SMTP_FROM_NAME') ?: 'ระบบบริหารจัดการคณะพยาบาลศาสตร์')),
    ];
}

function appMailerIsConfigured(): bool
{
    $config = appMailerConfig();
    return $config['host'] !== '' && $config['from_email'] !== '';
}

/**
 * @return array{status: string, error: ?string}
 *         status = sent | failed | not_configured | invalid_recipient
 */
function appSendMail(string $toEmail, string $toName, string $subject, string $html, string $text): array
{
    $config = appMailerConfig();
    if ($config['host'] === '' || $config['from_email'] === '') {
        return ['status' => 'not_configured', 'error' => 'ยังไม่ได้ตั้งค่า SMTP_HOST / SMTP_FROM_EMAIL'];
    }
    if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        return ['status' => 'invalid_recipient', 'error' => 'อีเมลผู้รับไม่ถูกต้อง'];
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->Port = $config['port'];
        $mail->Timeout = 15;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;

        if ($config['username'] !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = $config['username'];
            $mail->Password = $config['password'];
        }

        if ($config['secure'] === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($config['secure'] === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } else {
            $mail->SMTPSecure = '';
            $mail->SMTPAutoTLS = false;
        }

        $mail->setFrom($config['from_email'], $config['from_name']);
        $mail->addAddress($toEmail, $toName);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html;
        $mail->AltBody = $text;
        $mail->send();

        return ['status' => 'sent', 'error' => null];
    } catch (MailerException $e) {
        return ['status' => 'failed', 'error' => $mail->ErrorInfo ?: $e->getMessage()];
    }
}
