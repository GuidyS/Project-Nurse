# โค้ด API สำหรับ Hostinger — ฉบับเต็ม

ไฟล์นี้เป็นสำเนาโค้ดครบทุกไฟล์จาก `api-hostinger-fixes-20261020.zip` สำหรับอ่านและใช้สอน โดยคง path เดิมไว้ ไม่มี `config.local.php`, รหัสผ่านจริง, SQL dump หรือข้อมูลผู้ใช้

อ่าน [คู่มือการเรียนรู้](HOSTINGER_API_TEACHING_GUIDE.md) ก่อน แล้วใช้โค้ดด้านล่างประกอบแต่ละบท

## api/.htaccess

~~~apache
Options -Indexes
RewriteEngine On

# Only the page router is a public PHP entry point.
RewriteRule ^(?:components|config|cron|vendor)(?:/|$) - [F,L,NC]
RewriteRule ^(?!index\.php$).*\.(?:php|phar|phtml|sql|ini|env|log|bak)$ - [F,L,NC]
RewriteRule ^uploads/imports(?:/|$) - [F,L,NC]

<FilesMatch "^\.">
    Require all denied
</FilesMatch>
~~~

## api/config/config.php

~~~php
<?php
declare(strict_types=1);

/**
 * Database configuration shared by Docker development and Hostinger production.
 * Production credentials belong in config.local.php or environment variables.
 */
$localConfigPath = __DIR__ . '/config.local.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];
$localDatabase = is_array($localConfig['database'] ?? null) ? $localConfig['database'] : [];

function databaseConfigValue(string $environmentName, string $localKey, string $developmentDefault): string
{
    global $localDatabase;

    $environmentValue = getenv($environmentName);
    if ($environmentValue !== false && trim((string)$environmentValue) !== '') {
        return trim((string)$environmentValue);
    }

    $localValue = $localDatabase[$localKey] ?? null;
    if (is_string($localValue) && trim($localValue) !== '') {
        return trim($localValue);
    }

    return $developmentDefault;
}

class Connect extends PDO
{
    public function __construct()
    {
        $host = databaseConfigValue('DB_HOST', 'host', 'db');
        $port = databaseConfigValue('DB_PORT', 'port', '3306');
        $database = databaseConfigValue('DB_NAME', 'name', 'MYSQL_DATABASE');
        $username = databaseConfigValue('DB_USER', 'user', 'MYSQL_USER');
        $password = databaseConfigValue('DB_PASSWORD', 'password', 'MYSQL_PASSWORD');
        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

        try {
            parent::__construct($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $exception) {
            error_log('Database connection failed: ' . $exception->getMessage());
            throw new RuntimeException('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
        }
    }
}
~~~

## api/components/NotificationPage/get_notifications.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = new Connect();

// สร้างตารางเก็บ "ใบที่ผู้ใช้ลบออกจากรายการตัวเอง" ถ้ายังไม่มี (ครั้งแรกเท่านั้น)
require_once __DIR__ . '/notification_hidden_helper.php';
ensureNotificationHiddenTable($pdo);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    // ไฟล์นี้อ่าน session อย่างเดียว — ปลดล็อกไว้ เผื่อรอบเช็กด้านล่างใช้เวลาส่งอีเมล
    session_write_close();

    // เช็กใบประกอบวิชาชีพใกล้หมดอายุ (ไม่เกินชั่วโมงละครั้ง) — ถ้าพังต้องไม่กระทบการโหลดแจ้งเตือน
    try {
        require_once __DIR__ . '/../Teacher/LicenseReminder/license_reminder_helpers.php';
        licenseReminderMaybeRunScheduled($pdo);
    } catch (Throwable $e) {
        error_log('license reminder: ' . $e->getMessage());
    }

    // เช็กโครงการใกล้สิ้นสุด (ไม่เกินชั่วโมงละครั้ง) — แจ้งเฉพาะแอดมิน + อีเมลคณะ
    try {
        require_once __DIR__ . '/../Teacher/ProjectReminder/project_reminder_helpers.php';
        projectReminderMaybeRunScheduled($pdo);
    } catch (Throwable $e) {
        error_log('project reminder: ' . $e->getMessage());
    }

    // ลบข้อมูลนักศึกษาที่เข้าศึกษาเกินกำหนด (ปีละครั้ง และเฉพาะเมื่อแอดมินเปิดใช้งานไว้)
    try {
        require_once __DIR__ . '/../Admin/AcademicSettings/student_purge_helpers.php';
        studentPurgeRunIfDue($pdo);
    } catch (Throwable $e) {
        error_log('student purge: ' . $e->getMessage());
    }

    // ตรวจสอบบทบาทผู้ใช้ และดึงข้อมูลอาจารย์ที่ปรึกษา/อาจารย์ปฏิบัติ หากเป็นนักศึกษา
    $studentAdvisorInfo = null;
    $userStmt = $pdo->prepare("SELECT username, role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $userStmt->execute([':user_id' => $user_id]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);

    if ($currentUser && (int)$currentUser['role_id'] === 3) {
        $studentId = $currentUser['username'];
        $advStmt = $pdo->prepare("
            SELECT
                (
                    SELECT TRIM(CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th))
                    FROM student_advisor_mapping sam
                    JOIN faculty f ON sam.faculty_id = f.faculty_id
                    WHERE sam.student_id = :sid1
                      AND (sam.advisor_type != 'practical' OR sam.advisor_type IS NULL)
                    ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                    LIMIT 1
                ) AS advisor_name,
                (
                    SELECT TRIM(CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th))
                    FROM student_advisor_mapping sam
                    JOIN faculty f ON sam.faculty_id = f.faculty_id
                    WHERE sam.student_id = :sid2
                      AND sam.advisor_type = 'practical'
                    ORDER BY sam.academic_year DESC, sam.mapping_id DESC
                    LIMIT 1
                ) AS practical_advisor_name
        ");
        $advStmt->execute([':sid1' => $studentId, ':sid2' => $studentId]);
        $studentAdvisorInfo = $advStmt->fetch(PDO::FETCH_ASSOC) ?: null;

        // หากมีข้อมูลอาจารย์ แต่ยังไม่เคยมีแจ้งเตือนเรื่องอาจารย์เลย ให้สร้างแจ้งเตือนเริ่มต้น 1 รายการ
        if ($studentAdvisorInfo && (!empty($studentAdvisorInfo['advisor_name']) || !empty($studentAdvisorInfo['practical_advisor_name']))) {
            $checkNotif = $pdo->prepare("
                SELECT COUNT(*) FROM notifications
                WHERE user_id = :uid AND (title LIKE '%อาจารย์ที่ปรึกษา%' OR title LIKE '%อาจารย์ปฏิบัติ%' OR title LIKE '%อาจารย์ผู้ดูแล%')
            ");
            $checkNotif->execute([':uid' => $user_id]);
            if ((int)$checkNotif->fetchColumn() === 0) {
                $advText = !empty($studentAdvisorInfo['advisor_name']) ? $studentAdvisorInfo['advisor_name'] : 'ยังไม่มีการมอบหมาย';
                $pracText = !empty($studentAdvisorInfo['practical_advisor_name']) ? $studentAdvisorInfo['practical_advisor_name'] : 'ยังไม่มีการมอบหมาย';
                $initTitle = "แจ้งข้อมูลอาจารย์ผู้ดูแลคนปัจจุบัน";
                $initMsg = "อาจารย์ที่ปรึกษา: {$advText} | อาจารย์ปฏิบัติ: {$pracText} (คลิกเพื่อดูรายละเอียดในใบแสดงผลการเรียน)";
                $initPayload = json_encode([
                    'action' => 'view_transcript',
                    'target' => 'transcript',
                    'advisor_name' => $advText,
                    'practical_advisor_name' => $pracText
                ], JSON_UNESCAPED_UNICODE);

                $initNotif = $pdo->prepare("
                    INSERT INTO notifications (user_id, sender_user_id, title, message, payload_json, type, channel, is_read, created_at)
                    VALUES (:uid, NULL, :title, :msg, :payload, 'info', 'in-app', 0, NOW())
                ");
                $initNotif->execute([
                    ':uid' => $user_id,
                    ':title' => $initTitle,
                    ':msg' => $initMsg,
                    ':payload' => $initPayload
                ]);
            }
        }
    }

    $sql = "SELECT
                n.notification_id AS id,
                n.title,
                n.message,
                n.payload_json AS payloadJson,
                n.type,
                n.channel,
                CASE
                    WHEN n.sender_user_id = :current_user_id THEN 'sent'
                    ELSE 'received'
                END AS direction,

                -- 🔍 ลอจิกดึงชื่อผู้รับ (Recipient)
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(f_rec.title, ''), COALESCE(f_rec.first_name_th, ''), ' ', COALESCE(f_rec.last_name_th, ''))), ''),
                    IF(u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', u.username),
                    'ระบบ'
                ) AS recipient,

                -- 🔍 ลอจิกดึงชื่อผู้ส่ง (Sender)
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(f_sender.title, ''), COALESCE(f_sender.first_name_th, ''), ' ', COALESCE(f_sender.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(s_sender.title, ''), COALESCE(s_sender.first_name_th, ''), ' ', COALESCE(s_sender.last_name_th, ''))), ''),
                    IF(sender_u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', sender_u.username),
                    'ระบบ'
                ) AS sender,

                n.is_read AS isRead,
                n.created_at AS createdAt
            FROM notifications n

            -- JOIN สำหรับหาข้อมูลผู้รับ
            LEFT JOIN users u ON n.user_id = u.user_id
            LEFT JOIN student s ON CAST(u.username AS UNSIGNED) = s.student_id
            LEFT JOIN faculty f_rec ON CAST(u.username AS CHAR) = f_rec.faculty_id

            -- JOIN สำหรับหาข้อมูลผู้ส่ง
            LEFT JOIN users sender_u ON n.sender_user_id = sender_u.user_id
            LEFT JOIN faculty f_sender ON CAST(sender_u.username AS CHAR) = f_sender.faculty_id
            LEFT JOIN student s_sender ON CAST(sender_u.username AS UNSIGNED) = s_sender.student_id

            WHERE (n.user_id = :recipient_user_id OR n.sender_user_id = :sender_user_id)
              -- ไม่แสดงใบที่ผู้ใช้คนนี้ลบออกจากรายการของตัวเองแล้ว (อีกฝ่ายยังเห็นอยู่)
              AND NOT EXISTS (
                    SELECT 1 FROM notification_hidden nh
                    WHERE nh.notification_id = n.notification_id AND nh.user_id = :hidden_user_id
              )
            ORDER BY n.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':current_user_id' => $user_id,
        ':recipient_user_id' => $user_id,
        ':sender_user_id' => $user_id,
        ':hidden_user_id' => $user_id,
    ]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($notifications as &$row) {
        $row['id'] = (int) $row['id'];
        $row['isRead'] = (bool) $row['isRead'];
        $row['createdAt'] = date('d/m/Y H:i', strtotime($row['createdAt']));
    }

    echo json_encode([
        "status" => "success",
        "data" => $notifications,
        "advisors" => $studentAdvisorInfo
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/get_student_notifications.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
}

try {
    $pdo = new Connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $current_user_id = $_SESSION['user_id'];

    // 1. เช็คสิทธิ์ของผู้ที่กำลังจะส่งข้อความ
    $roleStmt = $pdo->prepare("SELECT role_id FROM users WHERE user_id = :user_id");
    $roleStmt->execute([':user_id' => $current_user_id]);
    $sender_role = (int) $roleStmt->fetchColumn();

    // ถ้านักศึกษา (Role 3) พยายามแอบยิง API เข้ามา ให้บล็อกและส่งอาร์เรย์ว่างกลับไป
    if ($sender_role === 3) {
        echo json_encode(["status" => "success", "data" => []]); exit();
    }

    // 2. คิวรีดึงรายชื่อผู้รับ โดยเช็คสิทธิ์ (Role 1 เห็นหมด, Role 2 เห็นแค่ 1 กับ 3)
    $sql = "SELECT
                u.user_id AS id,
                u.username AS identifier,
                u.role_id,
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, ''))), ''),
                    NULLIF(TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))), ''),
                    IF(u.role_id = 1, 'ผู้ดูแลระบบ (Admin)', u.username)
                ) AS name
            FROM users u
            LEFT JOIN faculty f ON CAST(u.username AS CHAR) = f.faculty_id
            LEFT JOIN student s ON CAST(u.username AS UNSIGNED) = s.student_id
            WHERE u.user_id != :current_user_id "; // ไม่ให้ส่งหาตัวเอง

    if ($sender_role === 2) {
        // ถ้าคนส่งเป็นอาจารย์ ให้เห็นเฉพาะ Admin (1) และ นักศึกษา (3)
        $sql .= " AND u.role_id IN (1, 3) ";
    }

    $sql .= " ORDER BY u.role_id ASC, identifier ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':current_user_id' => $current_user_id]);
    $recipients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // จัดรูปแบบข้อมูลก่อนส่งให้หน้าบ้าน
    foreach ($recipients as &$rec) {
        $rec['id'] = (int) $rec['id'];
        $rec['role_id'] = (int) $rec['role_id'];
    }

    echo json_encode(["status" => "success", "data" => $recipients]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/send_notification.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();
require_once __DIR__ . '/../../config/audit_helper.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['recipient_ids']) || empty($input['title'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$channel = $input['channel'] ?? 'in-app';
$allowedChannels = ['in-app', 'email', 'both'];
$type = $input['type'] ?? 'info';
$allowedTypes = ['info', 'warning', 'success', 'request'];
$category = $input['category'] ?? ($type === 'request' ? 'request' : 'student');
$allowedCategories = ['general', 'student', 'request', 'grade', 'project'];

if (!in_array($channel, $allowedChannels, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid channel"]);
    exit();
}

if (!in_array($type, $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid type"]);
    exit();
}

if (!in_array($category, $allowedCategories, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid category"]);
    exit();
}

function canReceiveNotification(array $settings, string $category): bool
{
    if ($category === 'grade') {
        return (bool) $settings['grade_notifications'];
    }

    if ($category === 'project') {
        return (bool) $settings['project_notifications'];
    }

    if ($category === 'student' || $category === 'request') {
        return (bool) $settings['student_notifications'];
    }

    return true;
}

function resolveChannel(string $requestedChannel, array $settings): ?string
{
    $canUseInApp = (bool) $settings['push_notifications'];
    $canUseEmail = (bool) $settings['email_notifications'];

    if ($requestedChannel === 'in-app') {
        return $canUseInApp ? 'in-app' : null;
    }

    if ($requestedChannel === 'email') {
        return $canUseEmail ? 'email' : null;
    }

    if ($canUseInApp && $canUseEmail) {
        return 'both';
    }

    if ($canUseInApp) {
        return 'in-app';
    }

    if ($canUseEmail) {
        return 'email';
    }

    return null;
}

try {
    $pdo = new Connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $roleStmt = $pdo->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    $roleId = (int) $roleStmt->fetchColumn();

    if ($roleId === 3) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Students are not allowed to send notifications"
        ]);
        exit();
    }

    $pdo->beginTransaction();

    $settingsSql = "SELECT
                        COALESCE(email_notifications, 1) AS email_notifications,
                        COALESCE(push_notifications, 1) AS push_notifications,
                        COALESCE(grade_notifications, 1) AS grade_notifications,
                        COALESCE(project_notifications, 1) AS project_notifications,
                        COALESCE(student_notifications, 1) AS student_notifications
                    FROM user_notification_settings
                    WHERE user_id = :user_id";
    $settingsStmt = $pdo->prepare($settingsSql);

    $sql = "INSERT INTO notifications (user_id, sender_user_id, title, message, type, channel, is_read)
            VALUES (:user_id, :sender_user_id, :title, :message, :type, :channel, 0)";
    $stmt = $pdo->prepare($sql);
    $sentCount = 0;
    $skippedCount = 0;

    foreach ($input['recipient_ids'] as $recipient_user_id) {
        $settingsStmt->execute([':user_id' => $recipient_user_id]);
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC) ?: [
            'email_notifications' => 1, 'push_notifications' => 1,
            'grade_notifications' => 1, 'project_notifications' => 1, 'student_notifications' => 1,
        ];

        if (!canReceiveNotification($settings, $category)) {
            $skippedCount++;
            continue;
        }

        $resolvedChannel = resolveChannel($channel, $settings);
        if ($resolvedChannel === null) {
            $skippedCount++;
            continue;
        }

        $stmt->execute([
            ':user_id' => $recipient_user_id,
            ':sender_user_id' => $_SESSION['user_id'],
            ':title' => $input['title'],
            ':message' => $input['message'] ?? '',
            ':type' => $type,
            ':channel' => $resolvedChannel,
        ]);
        $sentCount++;
    }

    $pdo->commit();
    logAudit($pdo, $_SESSION['user_id'] ?? null, 'create', 'notifications', "ส่งการแจ้งเตือนหัวข้อ: {$input['title']} ถึงผู้รับ {$sentCount} รายการ (ข้าม {$skippedCount}, channel={$channel}, type={$type}, category={$category})");
    echo json_encode([
        "status" => "success",
        "message" => "Notification sent",
        "sent" => $sentCount,
        "skipped" => $skippedCount,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/get_settings.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    $pdo = new Connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $defaults = [
        "emailNotifications" => true,
        "pushNotifications" => true,
        "gradeNotifications" => true,
        "projectNotifications" => true,
        "studentNotifications" => true,
    ];

    $stmt = $pdo->prepare(
        "SELECT email_notifications, push_notifications, grade_notifications, project_notifications, student_notifications
         FROM user_notification_settings
         WHERE user_id = :user_id"
    );
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        echo json_encode(["status" => "success", "data" => $defaults]);
        exit();
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "emailNotifications" => (bool) $settings['email_notifications'],
            "pushNotifications" => (bool) $settings['push_notifications'],
            "gradeNotifications" => (bool) $settings['grade_notifications'],
            "projectNotifications" => (bool) $settings['project_notifications'],
            "studentNotifications" => (bool) $settings['student_notifications'],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/save_settings.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    $pdo = new Connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $settings = [
        ':user_id' => $_SESSION['user_id'],
        ':email_notifications' => !empty($input['emailNotifications']) ? 1 : 0,
        ':push_notifications' => !empty($input['pushNotifications']) ? 1 : 0,
        ':grade_notifications' => !empty($input['gradeNotifications']) ? 1 : 0,
        ':project_notifications' => !empty($input['projectNotifications']) ? 1 : 0,
        ':student_notifications' => !empty($input['studentNotifications']) ? 1 : 0,
    ];

    $sql = "INSERT INTO user_notification_settings (
                user_id,
                email_notifications,
                push_notifications,
                grade_notifications,
                project_notifications,
                student_notifications
            ) VALUES (
                :user_id,
                :email_notifications,
                :push_notifications,
                :grade_notifications,
                :project_notifications,
                :student_notifications
            )
            ON DUPLICATE KEY UPDATE
                email_notifications = VALUES(email_notifications),
                push_notifications = VALUES(push_notifications),
                grade_notifications = VALUES(grade_notifications),
                project_notifications = VALUES(project_notifications),
                student_notifications = VALUES(student_notifications),
                updated_at = CURRENT_TIMESTAMP";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($settings);

    echo json_encode(["status" => "success", "message" => "Notification settings saved"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/mark_read.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
session_start();

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];

try {
    $pdo = new Connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($input['id'])) {
        $sql = "UPDATE notifications
                SET is_read = 1
                WHERE notification_id = :id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $input['id'],
            ':user_id' => $_SESSION['user_id'],
        ]);
    } else {
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $_SESSION['user_id']]);
    }

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
~~~

## api/components/NotificationPage/delete_notification.php

~~~php
<?php
require_once __DIR__ . '/../../config/config.php';
//  เริ่มต้น Session (ต้องอยู่บรรทัดแรกสุดเสมอ!)
// ถ้าขาดบรรทัดนี้ $_SESSION['user_id'] จะว่างเปล่า และระบบจะคิดว่าไม่ได้ล็อกอิน
session_start();
require_once __DIR__ . '/../../config/audit_helper.php';
// ตั้งค่า CORS ให้ Frontend (React) คุยกับ Backend ได้
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");             // สำคัญ! อนุญาตให้ส่ง Cookie/Session มาด้วยได้
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//  เชื่อมต่อฐานข้อมูล
$pdo = new Connect();
$input = json_decode(file_get_contents("php://input"), true);
 //  SECURITY CHECK: ป้องกันคนนอกเข้าใช้งาน
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

require_once __DIR__ . '/notification_hidden_helper.php';

if (isset($input['id'])) {
    try {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        ensureNotificationHiddenTable($pdo);

        $userId = (int)$_SESSION['user_id'];
        $notifId = (int)$input['id'];

        // ต้องเป็นผู้รับหรือผู้ส่งของการแจ้งเตือนใบนี้เท่านั้น
        $own = $pdo->prepare(
            "SELECT user_id, sender_user_id FROM notifications
             WHERE notification_id = :id AND (user_id = :uid OR sender_user_id = :uid2) LIMIT 1"
        );
        $own->execute([':id' => $notifId, ':uid' => $userId, ':uid2' => $userId]);
        $row = $own->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบการแจ้งเตือนนี้"], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // ซ่อนเฉพาะฝั่งของผู้ใช้คนนี้ (อีกฝ่ายยังเห็นอยู่)
        $hide = $pdo->prepare(
            "INSERT IGNORE INTO notification_hidden (notification_id, user_id) VALUES (:id, :uid)"
        );
        $hide->execute([':id' => $notifId, ':uid' => $userId]);

        // ถ้าทั้งผู้รับและผู้ส่งซ่อนแล้ว (หรือไม่มีผู้ส่ง) ค่อยลบแถวจริงเพื่อไม่ให้ข้อมูลค้าง
        $receiverId = (int)$row['user_id'];
        $senderId = $row['sender_user_id'] !== null ? (int)$row['sender_user_id'] : null;
        $physicallyDeleted = false;

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM notification_hidden WHERE notification_id = :id");
        $countStmt->execute([':id' => $notifId]);
        $hiddenCount = (int)$countStmt->fetchColumn();

        $sidesNeeded = ($senderId !== null && $senderId !== $receiverId) ? 2 : 1;
        if ($hiddenCount >= $sidesNeeded) {
            $pdo->prepare("DELETE FROM notifications WHERE notification_id = :id")->execute([':id' => $notifId]);
            $pdo->prepare("DELETE FROM notification_hidden WHERE notification_id = :id")->execute([':id' => $notifId]);
            $physicallyDeleted = true;
        }

        $deleteMode = $physicallyDeleted ? 'ลบออกจากระบบ' : 'ซ่อนจากรายการของผู้ใช้';
        logAudit($pdo, $userId, 'delete', 'notifications', "{$deleteMode} notification_id={$notifId}");

        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
~~~

## api/components/Teacher/CLOMap/get_clo_map.php

~~~php
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/clo_mapping_helpers.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/curriculum_outcomes.php';
require_once __DIR__ . '/../../../config/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $pdo = new Connect();

    // รายวิชาตามหลักสูตรที่ใช้งานในระบบ (หน้า "จัดการหลักสูตร") — ยังไม่มีหลักสูตรใช้ตาราง subject แบบเดิม
    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        $courses = array_map(
            static fn(array $subject): array => ['code' => $subject['subject_code'], 'name' => $subject['subject_name']],
            $curriculumSubjects
        );
    } else {
        $sql_subjects = "SELECT subject_code as code, subject_name_th as name FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
        $stmt_subjects = $pdo->prepare($sql_subjects);
        $stmt_subjects->execute();
        $courses = $stmt_subjects->fetchAll(PDO::FETCH_ASSOC);
    }

    // YLO ของแต่ละรายวิชา (ตั้งค่าที่หน้า "จัดการหลักสูตร") — ใช้กรองในหน้า CLO Map
    outcomesEnsureSchema($pdo);
    $yloMap = outcomesSubjectYloMap($pdo);
    foreach ($courses as &$course) {
        $course['ylo'] = $yloMap[(string)$course['code']] ?? null;
    }
    unset($course);

    $frameworkId = getActiveFrameworkId($pdo);
    $plos = [];
    $cloMap = [];

    if ($frameworkId && curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
        $plos = listPloCodes($pdo, $frameworkId);
        $coursePlos = getCoursePloMap($pdo, $frameworkId);
        $allClos = listAllClosDetailed($pdo, $frameworkId);
        $closBySubject = [];
        foreach ($allClos as $clo) {
            $closBySubject[(string)$clo['subject_code']][] = cloRowToApiArray($clo);
        }
        foreach ($courses as $course) {
            $code = $course['code'];
            $subjectData = [
                'course_plos' => $coursePlos[$code] ?? [],
                'clos' => $closBySubject[$code] ?? [],
            ];
            $cloMap[$code] = mergeCourseMappedPlos($subjectData);
        }
    } else {
        $data = loadActiveMappingData($pdo);
        if (isset($data['plos']) && is_array($data['plos'])) {
            foreach ($data['plos'] as $plo) {
                $plos[] = $plo['plo_id'] ?? $plo['id'];
            }
        }
        if (isset($data['subject_mappings'])) {
            foreach ($courses as $course) {
                $code = $course['code'];
                $subjectData = $data['subject_mappings'][$code] ?? [];
                $cloMap[$code] = mergeCourseMappedPlos($subjectData);
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "courses" => $courses,
            "plos" => $plos,
            "cloMap" => empty($cloMap) ? new stdClass() : $cloMap,
            "curriculum" => activeCurriculumCycle($pdo),
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('get-clo-map failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถดึงข้อมูล CLO Map ได้"], JSON_UNESCAPED_UNICODE);
}
?>
~~~

## api/components/Teacher/CLOPage/get_subjects.php

~~~php
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $pdo = new Connect();

    $userId = $_SESSION['user_id'];
    $isAdmin = cloAccessIsAdmin($pdo, $userId);
    // ทุกคนเห็นเฉพาะวิชาที่ตนเองเป็นผู้รับผิดชอบ รวมถึงผู้ดูแลระบบด้วย
    // (มอบหมายผู้สอนที่หน้า "จัดอาจารย์ผู้สอน")
    $myCodes = cloAccessMySubjectCodes($pdo, $userId);

    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        // รายวิชาตามหลักสูตรที่ใช้งานในระบบ (ตั้งค่าที่หน้า "จัดการหลักสูตร") — ชื่อวิชาตามหลักสูตร
        // subject_id เป็น null ได้ถ้าวิชามีเฉพาะในหลักสูตร (หน้า CLO ระบุวิชาด้วย subject_code)
        $myCodeSet = array_fill_keys(array_map('mb_strtolower', $myCodes), true);
        $subjects = [];
        foreach ($curriculumSubjects as $subject) {
            if (!isset($myCodeSet[mb_strtolower($subject['subject_code'])])) {
                continue;
            }
            $subjects[] = [
                'subject_id' => $subject['subject_id'],
                'subject_code' => $subject['subject_code'],
                'subject_name_th' => $subject['subject_name'],
            ];
        }
    } elseif (empty($myCodes)) {
        $subjects = [];
    } else {
        $placeholders = implode(',', array_fill(0, count($myCodes), '?'));
        $stmt = $pdo->prepare("SELECT subject_id, subject_code, subject_name_th
                               FROM subject
                               WHERE is_active = 1 AND subject_code IN ($placeholders)
                               ORDER BY subject_code ASC");
        $stmt->execute($myCodes);
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "status" => "success",
        "data" => $subjects,
        // ให้หน้าเว็บรู้ว่าควรแสดงปุ่ม "แก้ไข YLO" หรือไม่
        "is_admin" => $isAdmin,
        // หลักสูตรที่ใช้งานในระบบ (null = ยังไม่มีหลักสูตร)
        "curriculum" => activeCurriculumCycle($pdo),
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('get-subjects failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ดึงข้อมูลรายวิชาไม่สำเร็จ"], JSON_UNESCAPED_UNICODE);
}
~~~

## api/components/Teacher/CLOPage/get_clos.php

~~~php
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/clo_mapping_helpers.php';
require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';
require_once __DIR__ . '/../../../config/curriculum_outcomes.php';
require_once __DIR__ . '/../../../config/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $pdo = new Connect();

    // รับได้ทั้ง subject_id (ตาราง subject) และ subject_code (วิชาที่มีเฉพาะในหน้า "จัดการหลักสูตร")
    $hasSubjectParam = (isset($_GET['subject_id']) && $_GET['subject_id'] !== '')
        || (isset($_GET['subject_code']) && $_GET['subject_code'] !== '');

    if ($hasSubjectParam) {
        $subject_code = cloResolveSubjectCode($pdo, $_GET);

        if (!$subject_code) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $frameworkId = getActiveFrameworkId($pdo);
        if (!$frameworkId) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "subject_ylo" => null, "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
            outcomesEnsureSchema($pdo);

            // YLO ของรายวิชามาจากหน้า "จัดการหลักสูตร" — หน้านี้ไม่ให้เลือกเองอีกแล้ว
            $subjectYlo = outcomesSubjectYlo($pdo, (string)$subject_code);
            $subPloCatalog = $subjectYlo === null
                ? []
                : outcomesSubPlos($pdo, $frameworkId, $subjectYlo);

            // คะแนนที่แต่ละ CLO แบ่งให้ Sub PLO ไว้แล้ว
            $scoresByClo = [];
            foreach (outcomesSubjectCloScores($pdo, $frameworkId, (string)$subject_code) as $score) {
                $scoresByClo[$score['clo_id']][$score['code']] = [
                    'sub_plo_id' => $score['sub_plo_id'],
                    'max_score' => $score['max_score'],
                    'pass_score' => $score['pass_score'],
                ];
            }

            $clos = listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code);
            foreach ($clos as &$clo) {
                $clo['sub_plo_scores'] = $scoresByClo[(int)$clo['clo_id']] ?? new stdClass();
            }
            unset($clo);

            echo json_encode([
                "status" => "success",
                "data" => [
                    "clos" => $clos,
                    "plos" => getPloCatalogFromTables($pdo, $frameworkId),
                    "subject_ylo" => $subjectYlo,
                    "sub_plo_catalog" => $subPloCatalog,
                    "score_budget" => outcomesSubjectScoreBudget($pdo, $frameworkId, (string)$subject_code),
                ],
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $mappingData = loadActiveMappingData($pdo);
        $rawClos = $mappingData['subject_mappings'][$subject_code]['clos'] ?? [];

        $clos = [];
        foreach ($rawClos as $index => $clo) {
            $clos[] = [
                "clo_id" => (int)($clo['clo_id'] ?? ($index + 1)),
                "clo_code" => $clo['clo_code'] ?? null,
                "description" => $clo['description'] ?? ($clo['clo_description'] ?? ''),
                "ylo_id" => $clo['ylo_id'] ?? null,
                "mapped_plos" => $clo['mapped_plos'] ?? [],
                "sub_plos" => $clo['sub_plos'] ?? [],
            ];
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "clos" => $clos,
                "plos" => getPloCatalog($mappingData),
                "subject_ylo" => null,
                "sub_plo_catalog" => [],
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "subject_ylo" => null, "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('get-clos failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ดึงข้อมูล CLO ไม่สำเร็จ"], JSON_UNESCAPED_UNICODE);
}
?>
~~~

## api/components/Teacher/Documents/get_documents.php

~~~php
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit();
    }

    $pdo = new Connect();
    $roleStmt = $pdo->prepare('SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1');
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    if (!in_array((int) $roleStmt->fetchColumn(), [1, 2], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit();
    }

    // 1. รายวิชาทำ Dropdown — ตามหลักสูตรที่ใช้งานในระบบ (ยังไม่มีหลักสูตรใช้ตาราง subject แบบเดิม)
    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        $courses = array_map(
            static fn(array $subject): array => ['subject_code' => $subject['subject_code'], 'subject_name_th' => $subject['subject_name']],
            $curriculumSubjects
        );
    } else {
        $sql_courses = "SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
        $stmt_courses = $pdo->query($sql_courses);
        $courses = $stmt_courses->fetchAll(PDO::FETCH_ASSOC);
    }

    // 2. ดึงข้อมูลเอกสารจากตาราง tqf_documents
    $sql_docs = "SELECT * FROM tqf_documents ORDER BY created_at DESC";
    $stmt_docs = $pdo->query($sql_docs);
    $docs = $stmt_docs->fetchAll(PDO::FETCH_ASSOC);

    $all_documents = [];
    foreach ($docs as $doc) {
        // กำหนด URL ของไฟล์
        $fileUrl = '';
        if (!empty($doc['file_path'])) {
            if (preg_match('/^https?:\/\//', $doc['file_path'])) {
                $fileUrl = $doc['file_path'];
            } else {
                $fileUrl = '/api/index.php?page=download-document&id=' . rawurlencode((string) $doc['id']);
            }
        }

        $all_documents[] = [
            'id' => (string)$doc['id'],
            'name' => $doc['file_name'],
            'type' => $doc['tqf_type'],
            'course' => $doc['subject_code'],
            'academic_year' => $doc['academic_year'],
            'uploadedAt' => substr($doc['created_at'], 0, 10),
            'fileUrl' => $fileUrl,
            'downloadUrl' => '/api/index.php?page=download-document&id=' . rawurlencode((string) $doc['id'])
        ];
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "documents" => $all_documents,
            "courses" => $courses
        ]
    ]);

} catch (Throwable $e) {
    error_log('get-documents failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถดึงข้อมูลเอกสารได้"], JSON_UNESCAPED_UNICODE);
}
?>
~~~

## api/components/Teacher/Documents/download_document.php

~~~php
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null || $id < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid document ID']);
    exit;
}

try {
    $pdo = new Connect();
    $roleStmt = $pdo->prepare('SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1');
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    if (!in_array((int) $roleStmt->fetchColumn(), [1, 2], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT file_name, file_path FROM tqf_documents WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$doc || empty($doc['file_path'])) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        exit;
    }

    $path = (string) $doc['file_path'];
    if (preg_match('/^https?:\/\//i', $path)) {
        if (preg_match('/^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i', $path, $matches)) {
            header('Location: https://drive.google.com/uc?export=download&id=' . $matches[1]);
        } else {
            header('Location: ' . $path);
        }
        exit;
    }

    $uploadsRoot = realpath(__DIR__ . '/../../../uploads');
    $absolutePath = realpath(__DIR__ . '/../../../' . ltrim($path, '/\\'));
    if ($uploadsRoot === false || $absolutePath === false
        || !str_starts_with($absolutePath, $uploadsRoot . DIRECTORY_SEPARATOR)
        || !is_file($absolutePath)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        exit;
    }

    $fileName = basename((string) ($doc['file_name'] ?: 'document'));
    $fileName = str_replace(["\r", "\n", '"'], '', $fileName);
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Cache-Control: private, no-store');
    header('Content-Length: ' . filesize($absolutePath));
    readfile($absolutePath);
} catch (Throwable $e) {
    error_log('download-document failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถดาวน์โหลดเอกสารได้'], JSON_UNESCAPED_UNICODE);
}
~~~
