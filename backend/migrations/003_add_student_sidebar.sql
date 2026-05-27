INSERT INTO `permissions` (`permission_name`, `module_group`, `description_th`)
SELECT 'STUDENT_TRANSCRIPT_VIEW', 'Student', 'View own transcript'
WHERE NOT EXISTS (
  SELECT 1 FROM `permissions` WHERE `permission_name` = 'STUDENT_TRANSCRIPT_VIEW'
);

INSERT INTO `permissions` (`permission_name`, `module_group`, `description_th`)
SELECT 'STUDENT_PORTFOLIO_VIEW', 'Student', 'View and manage own portfolio'
WHERE NOT EXISTS (
  SELECT 1 FROM `permissions` WHERE `permission_name` = 'STUDENT_PORTFOLIO_VIEW'
);

INSERT IGNORE INTO `position` (`position_id`, `position_name`) VALUES
(8, 'Student');

INSERT IGNORE INTO `position_permission` (`position_id`, `permission_id`)
SELECT 8, `permission_id`
FROM `permissions`
WHERE `permission_name` IN (
  'PROFILE_VIEW_SELF',
  'NOTIFICATION_VIEW',
  'SYSTEM_SETTINGS',
  'STUDENT_TRANSCRIPT_VIEW',
  'STUDENT_PORTFOLIO_VIEW'
);

INSERT INTO `system_sidebar_menus` (`title`, `url`, `icon`, `permission_required`, `section_title`, `is_active`)
SELECT 'ผลการเรียน', 'transcript', 'FileText', 'STUDENT_TRANSCRIPT_VIEW', 'นักศึกษา', 1
WHERE NOT EXISTS (
  SELECT 1 FROM `system_sidebar_menus` WHERE `url` = 'transcript'
);

INSERT INTO `system_sidebar_menus` (`title`, `url`, `icon`, `permission_required`, `section_title`, `is_active`)
SELECT 'Portfolio', 'portfolio', 'FolderKanban', 'STUDENT_PORTFOLIO_VIEW', 'นักศึกษา', 1
WHERE NOT EXISTS (
  SELECT 1 FROM `system_sidebar_menus` WHERE `url` = 'portfolio'
);

INSERT INTO `user_position` (`user_id`, `position_id`, `is_primary`, `effective_from`, `effective_to`)
SELECT u.user_id, 8, 1, NULL, NULL
FROM `users` u
WHERE u.role_id = 3
  AND NOT EXISTS (
    SELECT 1 FROM `user_position` up
    WHERE up.user_id = u.user_id
  );
