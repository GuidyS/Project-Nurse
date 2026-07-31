<?php

/**
 * ตาราง notification_hidden: เก็บว่า "ใครซ่อน/ลบการแจ้งเตือนใบไหนออกจากรายการของตัวเอง"
 *
 * เดิม delete_notification.php ลบแถวในตาราง notifications ทิ้งเลย แต่แถวเดียวถูกใช้ร่วมกัน
 * ทั้งฝั่งผู้รับ (user_id) และผู้ส่ง (sender_user_id) — ลบทีเดียวจึงหายทั้งสองฝั่ง
 * จึงเปลี่ยนเป็นซ่อนรายฝั่ง และลบแถวจริงเมื่อไม่มีใครเหลือแล้ว
 */
function ensureNotificationHiddenTable(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS notification_hidden (
            notification_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            hidden_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (notification_id, user_id),
            KEY idx_notification_hidden_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

?>
