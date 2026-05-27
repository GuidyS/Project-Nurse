DELETE FROM `notifications`
WHERE `notification_id` IN (4, 5, 6)
  AND `created_at` IN (
    '2026-02-02 05:35:51',
    '2026-02-02 04:35:51',
    '2026-02-01 05:35:51'
  );
