CREATE TABLE IF NOT EXISTS `approval_requests` (
  `approval_request_id` bigint NOT NULL AUTO_INCREMENT,
  `request_type` varchar(50) NOT NULL,
  `requester_user_id` bigint DEFAULT NULL,
  `target_ref_type` varchar(50) DEFAULT NULL,
  `target_ref_id` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `review_note` text DEFAULT NULL,
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`approval_request_id`),
  KEY `idx_approval_requests_status` (`status`),
  KEY `idx_approval_requests_type` (`request_type`),
  KEY `idx_approval_requests_requester` (`requester_user_id`),
  KEY `idx_approval_requests_reviewer` (`reviewed_by`),
  CONSTRAINT `approval_requests_requester_fk` FOREIGN KEY (`requester_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `approval_requests_reviewer_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `grade_change_requests` (
  `grade_change_request_id` bigint NOT NULL AUTO_INCREMENT,
  `approval_request_id` bigint NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `current_grade` varchar(10) DEFAULT NULL,
  `requested_grade` varchar(10) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grade_change_request_id`),
  UNIQUE KEY `uq_grade_change_approval` (`approval_request_id`),
  KEY `idx_grade_change_student` (`student_id`),
  KEY `idx_grade_change_subject` (`subject_code`),
  CONSTRAINT `grade_change_requests_approval_fk` FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests` (`approval_request_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `student_transfer_requests` (
  `student_transfer_request_id` bigint NOT NULL AUTO_INCREMENT,
  `approval_request_id` bigint NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `from_advisor_user_id` bigint DEFAULT NULL,
  `to_advisor_user_id` bigint DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_transfer_request_id`),
  UNIQUE KEY `uq_student_transfer_approval` (`approval_request_id`),
  KEY `idx_student_transfer_student` (`student_id`),
  CONSTRAINT `student_transfer_requests_approval_fk` FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests` (`approval_request_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `student_transfer_requests_from_advisor_fk` FOREIGN KEY (`from_advisor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `student_transfer_requests_to_advisor_fk` FOREIGN KEY (`to_advisor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `project_approval_requests` (
  `project_approval_request_id` bigint NOT NULL AUTO_INCREMENT,
  `approval_request_id` bigint NOT NULL,
  `project_id` bigint DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `academic_year` int DEFAULT NULL,
  `budget_requested` decimal(15,2) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_approval_request_id`),
  UNIQUE KEY `uq_project_approval` (`approval_request_id`),
  KEY `idx_project_approval_project` (`project_id`),
  CONSTRAINT `project_approval_requests_approval_fk` FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests` (`approval_request_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `project_approval_requests_project_fk` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `document_approval_requests` (
  `document_approval_request_id` bigint NOT NULL AUTO_INCREMENT,
  `approval_request_id` bigint NOT NULL,
  `document_ref` varchar(100) DEFAULT NULL,
  `document_title` varchar(255) NOT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_approval_request_id`),
  UNIQUE KEY `uq_document_approval` (`approval_request_id`),
  KEY `idx_document_approval_ref` (`document_ref`),
  CONSTRAINT `document_approval_requests_approval_fk` FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests` (`approval_request_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `approval_requests` (`request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `status`, `created_at`)
SELECT 'grade_change', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 2) THEN 2 ELSE NULL END), 'assessment', '64010001-NUR101', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101', 'pending', '2024-01-15 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM `approval_requests`);

INSERT INTO `approval_requests` (`request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `status`, `created_at`)
SELECT 'student_transfer', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 3) THEN 3 ELSE NULL END), 'student', '65010002', 'ขอรับมอบนักศึกษา', 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม', 'pending', '2024-01-14 10:30:00'
WHERE (SELECT COUNT(*) FROM `approval_requests`) = 1;

INSERT INTO `approval_requests` (`request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `status`, `created_at`)
SELECT 'project_request', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 4) THEN 4 ELSE NULL END), 'project', 'research-skill-development', 'ขอเปิดโครงการวิจัย', 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล', 'pending', '2024-01-12 13:15:00'
WHERE (SELECT COUNT(*) FROM `approval_requests`) = 2;

INSERT INTO `approval_requests` (`request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `status`, `reviewed_by`, `reviewed_at`, `created_at`)
SELECT 'document_approve', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 6) THEN 6 ELSE NULL END), 'document', 'TQF3-NUR301', 'ขออนุมัติเอกสาร', 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301', 'approved', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 5) THEN 5 ELSE NULL END), '2024-01-11 11:00:00', '2024-01-10 08:45:00'
WHERE (SELECT COUNT(*) FROM `approval_requests`) = 3;

INSERT INTO `approval_requests` (`request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `status`, `reviewed_by`, `reviewed_at`, `created_at`)
SELECT 'grade_change', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 7) THEN 7 ELSE NULL END), 'assessment', '63010005-NUR401', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401', 'rejected', (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 5) THEN 5 ELSE NULL END), '2024-01-09 15:20:00', '2024-01-08 14:00:00'
WHERE (SELECT COUNT(*) FROM `approval_requests`) = 4;

INSERT INTO `grade_change_requests` (`approval_request_id`, `student_id`, `subject_code`, `current_grade`, `requested_grade`, `reason`)
SELECT `approval_request_id`, '64010001', 'NUR101', 'B+', 'A', `description`
FROM `approval_requests`
WHERE `request_type` = 'grade_change'
  AND `target_ref_id` = '64010001-NUR101'
  AND NOT EXISTS (SELECT 1 FROM `grade_change_requests` WHERE `approval_request_id` = `approval_requests`.`approval_request_id`);

INSERT INTO `grade_change_requests` (`approval_request_id`, `student_id`, `subject_code`, `current_grade`, `requested_grade`, `reason`)
SELECT `approval_request_id`, '63010005', 'NUR401', 'C', 'B', `description`
FROM `approval_requests`
WHERE `request_type` = 'grade_change'
  AND `target_ref_id` = '63010005-NUR401'
  AND NOT EXISTS (SELECT 1 FROM `grade_change_requests` WHERE `approval_request_id` = `approval_requests`.`approval_request_id`);

INSERT INTO `student_transfer_requests` (`approval_request_id`, `student_id`, `from_advisor_user_id`, `to_advisor_user_id`, `reason`)
SELECT `approval_request_id`, '65010002',
       (SELECT CASE WHEN EXISTS (SELECT 1 FROM `users` WHERE `user_id` = 2) THEN 2 ELSE NULL END),
       `requester_user_id`,
       `description`
FROM `approval_requests`
WHERE `request_type` = 'student_transfer'
  AND NOT EXISTS (SELECT 1 FROM `student_transfer_requests` WHERE `approval_request_id` = `approval_requests`.`approval_request_id`);

INSERT INTO `project_approval_requests` (`approval_request_id`, `project_id`, `project_name`, `academic_year`, `budget_requested`, `reason`)
SELECT `approval_request_id`, NULL, 'การพัฒนาทักษะการพยาบาล', 2568, 50000.00, `description`
FROM `approval_requests`
WHERE `request_type` = 'project_request'
  AND NOT EXISTS (SELECT 1 FROM `project_approval_requests` WHERE `approval_request_id` = `approval_requests`.`approval_request_id`);

INSERT INTO `document_approval_requests` (`approval_request_id`, `document_ref`, `document_title`, `document_type`, `file_path`, `reason`)
SELECT `approval_request_id`, `target_ref_id`, 'TQF 3 รายวิชา NUR301', 'TQF 3', NULL, `description`
FROM `approval_requests`
WHERE `request_type` = 'document_approve'
  AND NOT EXISTS (SELECT 1 FROM `document_approval_requests` WHERE `approval_request_id` = `approval_requests`.`approval_request_id`);
