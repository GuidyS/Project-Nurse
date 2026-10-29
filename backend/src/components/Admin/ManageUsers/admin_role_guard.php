<?php

/** Call inside the same transaction as the change so concurrent requests cannot remove the last active admin. */
function assertCanRemoveActiveAdmin(PDO $db, int $targetUserId, ?int $actorUserId = null): void
{
    if (!$db->inTransaction()) {
        throw new LogicException('Admin role check requires a transaction');
    }
    if ($actorUserId !== null && $targetUserId === $actorUserId) {
        throw new DomainException('ผู้ดูแลระบบไม่สามารถลบ ระงับ หรือถอด Role ของบัญชีตัวเองได้');
    }

    $stmt = $db->query("SELECT user_id FROM users WHERE role_id = 1 AND COALESCE(status, 'active') = 'active' ORDER BY user_id FOR UPDATE");
    $activeAdminIds = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    if (in_array($targetUserId, $activeAdminIds, true) && count($activeAdminIds) <= 1) {
        throw new DomainException('ระบบต้องมีผู้ดูแลระบบที่ใช้งานได้อย่างน้อย 1 คน');
    }
}
