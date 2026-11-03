-- ============================================================
-- future-tables-schema.sql
-- โครงสร้างตาราง (CREATE TABLE) ที่ถูกลบออกในรอบ Clean Data 12 ต.ค. 2569
-- เก็บไว้เป็นต้นแบบ หากในอนาคตต้องการนำฟีเจอร์กลับมา ให้รันเฉพาะตารางที่ต้องการ
-- ที่มา: MYSQL_DATABASE.sql (phpMyAdmin dump 12 ต.ค. 2569, ก่อน commit main 0.0.7)
-- หมายเหตุ: ไฟล์นี้มีเฉพาะโครงสร้าง ไม่มีข้อมูล / FK อ้างอิงอยู่ในส่วน ALTER TABLE ท้ายไฟล์
-- ============================================================

-- ---- Student_License_Attempts ----
CREATE TABLE `Student_License_Attempts` (
  `attempt_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_code` varchar(50) DEFAULT NULL COMMENT 'วิชาที่สอบ',
  `exam_date` date DEFAULT NULL COMMENT 'วันที่สอบ',
  `result` varchar(50) DEFAULT NULL COMMENT 'ผลสอบ (ผ่าน/ไม่ผ่าน)',
  `attempt_number` int DEFAULT NULL COMMENT 'สอบครั้งที่เท่าไหร่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---- faculty_ce_records ----
CREATE TABLE `faculty_ce_records` (
  `record_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `activity_name` text COMMENT 'ชื่อกิจกรรมที่ไปอบรม',
  `credits` float DEFAULT NULL COMMENT 'หน่วยกิต/ชั่วโมงที่ได้',
  `result` varchar(255) DEFAULT NULL,
  `date_attended` date DEFAULT NULL COMMENT 'วันที่ไป'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---- research_journals ----
CREATE TABLE `research_journals` (
  `journal_id` bigint NOT NULL,
  `journal_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `database_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- research_publications ----
CREATE TABLE `research_publications` (
  `publication_id` bigint NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_id` bigint DEFAULT NULL,
  `publication_date` date NOT NULL,
  `publication_type` enum('research','academic','textbook') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'research',
  `database_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','verified') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint DEFAULT NULL,
  `verified_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- research_publication_authors ----
CREATE TABLE `research_publication_authors` (
  `publication_author_id` bigint NOT NULL,
  `publication_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `author_order` int DEFAULT NULL,
  `author_role` enum('first_author','corresponding','co_author') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'co_author'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- advisor_transfer_request ----
CREATE TABLE `advisor_transfer_request` (
  `request_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `from_advisor_id` bigint NOT NULL,
  `to_advisor_id` bigint NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `request_type` enum('incoming','outgoing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'outgoing',
  `created_by` bigint DEFAULT NULL,
  `reviewed_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- curriculum_report_stats ----
CREATE TABLE `curriculum_report_stats` (
  `stat_id` bigint NOT NULL,
  `type` enum('PLO','YLO') NOT NULL COMMENT 'ประเภท (PLO หรือ YLO)',
  `code_name` varchar(50) NOT NULL COMMENT 'รหัส เช่น PLO1, YLO1',
  `description` text COMMENT 'คำอธิบาย',
  `target_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'เป้าหมาย (%)',
  `achieved_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'ผลลัพธ์ที่ทำได้ (%)',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---- Indexes / Keys ----
ALTER TABLE `Student_License_Attempts`
  ADD PRIMARY KEY (`attempt_id`),
  ADD KEY `student_id` (`student_id`);
ALTER TABLE `faculty_ce_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `faculty_id` (`faculty_id`);
ALTER TABLE `research_journals`
  ADD PRIMARY KEY (`journal_id`),
  ADD UNIQUE KEY `uq_research_journal_name` (`journal_name`);
ALTER TABLE `research_publications`
  ADD PRIMARY KEY (`publication_id`),
  ADD UNIQUE KEY `uq_research_doi` (`doi`),
  ADD KEY `idx_research_publication_date` (`publication_date`),
  ADD KEY `idx_research_journal_id` (`journal_id`);
ALTER TABLE `research_publication_authors`
  ADD PRIMARY KEY (`publication_author_id`),
  ADD UNIQUE KEY `uq_research_publication_faculty_role` (`publication_id`,`faculty_id`,`author_role`),
  ADD KEY `idx_research_author_faculty` (`faculty_id`);
ALTER TABLE `advisor_transfer_request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_transfer_student` (`student_id`),
  ADD KEY `idx_transfer_from_advisor` (`from_advisor_id`),
  ADD KEY `idx_transfer_to_advisor` (`to_advisor_id`),
  ADD KEY `idx_transfer_status` (`status`),
  ADD KEY `idx_transfer_created_by` (`created_by`),
  ADD KEY `idx_transfer_reviewed_by` (`reviewed_by`);
ALTER TABLE `curriculum_report_stats`
  ADD PRIMARY KEY (`stat_id`),
  ADD UNIQUE KEY `uq_type_code` (`type`,`code_name`);

-- ---- Foreign keys ----
ALTER TABLE `Student_License_Attempts`
  ADD CONSTRAINT `student_license_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `advisor_transfer_request`
  ADD CONSTRAINT `fk_transfer_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_from_advisor` FOREIGN KEY (`from_advisor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_to_advisor` FOREIGN KEY (`to_advisor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;
