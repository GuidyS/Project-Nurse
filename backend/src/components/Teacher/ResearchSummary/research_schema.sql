-- Research dashboard extension.
-- Use this as a migration after reviewing IDs in the target database.

INSERT INTO `position` (`position_id`, `position_name`)
VALUES (9, 'อาจารย์งานวิจัย')
ON DUPLICATE KEY UPDATE `position_name` = VALUES(`position_name`);

INSERT INTO `permissions` (`permission_id`, `permission_name`, `module_group`, `description_th`)
VALUES
  (53, 'RESEARCH_SUMMARY_VIEW', 'RESEARCH', 'ดูแดชบอร์ดและตารางสรุปผลงานวิจัย 5 ปี'),
  (54, 'RESEARCH_RECORD_MANAGE', 'RESEARCH', 'บันทึก แก้ไข ตรวจสอบผลงานวิจัยและวารสาร')
ON DUPLICATE KEY UPDATE
  `permission_name` = VALUES(`permission_name`),
  `module_group` = VALUES(`module_group`),
  `description_th` = VALUES(`description_th`);

INSERT IGNORE INTO `position_permission` (`position_id`, `permission_id`)
VALUES
  (1, 53),
  (1, 54),
  (7, 53),
  (7, 54),
  (9, 1),
  (9, 3),
  (9, 21),
  (9, 53),
  (9, 54);

INSERT INTO `system_sidebar_menus`
  (`menu_id`, `title`, `url`, `icon`, `permission_required`, `section_title`, `is_active`)
VALUES
  (35, 'สรุปผลงานวิจัย 5 ปี', 'research-summary', 'Microscope', 'RESEARCH_SUMMARY_VIEW', 'งานวิจัย', 1)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `url` = VALUES(`url`),
  `icon` = VALUES(`icon`),
  `permission_required` = VALUES(`permission_required`),
  `section_title` = VALUES(`section_title`),
  `is_active` = VALUES(`is_active`);

CREATE TABLE IF NOT EXISTS `research_journals` (
  `journal_id` bigint NOT NULL AUTO_INCREMENT,
  `journal_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `database_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`journal_id`),
  UNIQUE KEY `uq_research_journal_name` (`journal_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `research_publications` (
  `publication_id` bigint NOT NULL AUTO_INCREMENT,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_id` bigint DEFAULT NULL,
  `publication_date` date NOT NULL,
  `publication_type` enum('research','academic','textbook') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'research',
  `database_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','verified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint DEFAULT NULL,
  `verified_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`publication_id`),
  KEY `idx_research_publication_date` (`publication_date`),
  KEY `idx_research_journal_id` (`journal_id`),
  UNIQUE KEY `uq_research_doi` (`doi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `research_publication_authors` (
  `publication_author_id` bigint NOT NULL AUTO_INCREMENT,
  `publication_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `author_order` int DEFAULT NULL,
  `author_role` enum('first_author','corresponding','co_author') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'co_author',
  PRIMARY KEY (`publication_author_id`),
  UNIQUE KEY `uq_research_publication_faculty_role` (`publication_id`, `faculty_id`, `author_role`),
  KEY `idx_research_author_faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
