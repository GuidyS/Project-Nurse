<?php
/**
 * ส่งแจ้งเตือนในระบบ (ตาราง notifications) — ใช้ร่วมกันทุกฟีเจอร์
 *
 * ใช้กับงานที่ "เกิดขึ้นทันที" เช่น อาจารย์อัปโหลดเอกสารวิชาชีพ หรือแอดมินมอบหมายนักศึกษา
 * (งานตามรอบเวลา เช่น แจ้งเตือนใบอนุญาตใกล้หมดอายุ ใช้ helper ของฟีเจอร์นั้นเอง)
 */

/** user_id ของผู้ดูแลระบบที่ยังใช้งานอยู่ */
function notifyAdminUserIds(PDO $db): array
{
    $rows = $db->query("SELECT user_id FROM users WHERE role_id = 1 AND status = 'active'")
               ->fetchAll(PDO::FETCH_COLUMN);
    return array_map('intval', $rows ?: []);
}

/** user_id ของอาจารย์จากรหัสอาจารย์ (username = faculty_id) */
function notifyUserIdByFacultyId(PDO $db, string $facultyId): ?int
{
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$facultyId]);
    $id = $stmt->fetchColumn();
    return $id === false ? null : (int)$id;
}

/**
 * บันทึกแจ้งเตือนให้ผู้ใช้หลายคน คืนจำนวนที่ส่งสำเร็จ
 *
 * @param int[] $userIds
 * @param 'info'|'warning'|'success'|'request' $type
 * @param 'in-app'|'email'|'both' $channel
 */
function notifyUsers(
    PDO $db,
    array $userIds,
    string $title,
    string $message,
    string $type = 'info',
    string $channel = 'in-app',
    ?int $senderUserId = null,
    ?array $payload = null
): int {
    $userIds = array_values(array_unique(array_filter(array_map('intval', $userIds), static fn(int $id): bool => $id > 0)));
    if (empty($userIds)) {
        return 0;
    }

    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, sender_user_id, title, message, payload_json, type, channel, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    ");

    $payloadJson = $payload !== null ? json_encode($payload, JSON_UNESCAPED_UNICODE) : null;
    $sent = 0;
    foreach ($userIds as $userId) {
        $stmt->execute([
            $userId,
            $senderUserId,
            mb_substr($title, 0, 255),
            $message,
            $payloadJson,
            $type,
            $channel,
        ]);
        $sent++;
    }

    return $sent;
}

/** แจ้งเตือนผู้ดูแลระบบทุกคน */
function notifyAdmins(
    PDO $db,
    string $title,
    string $message,
    string $type = 'info',
    ?int $senderUserId = null,
    ?array $payload = null
): int {
    return notifyUsers($db, notifyAdminUserIds($db), $title, $message, $type, 'in-app', $senderUserId, $payload);
}
