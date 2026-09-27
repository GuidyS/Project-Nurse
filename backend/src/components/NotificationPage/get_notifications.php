<?php
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

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

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
            
            WHERE (n.user_id = :filter_user_id OR n.sender_user_id = :filter_user_id)
              -- ไม่แสดงใบที่ผู้ใช้คนนี้ลบออกจากรายการของตัวเองแล้ว (อีกฝ่ายยังเห็นอยู่)
              AND NOT EXISTS (
                    SELECT 1 FROM notification_hidden nh
                    WHERE nh.notification_id = n.notification_id AND nh.user_id = :hidden_user_id
              )
            ORDER BY n.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':current_user_id' => $user_id,
        ':filter_user_id' => $user_id,
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