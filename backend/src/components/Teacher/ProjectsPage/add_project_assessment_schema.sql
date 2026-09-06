-- แยกประเภทโครงการและรองรับการประเมินผู้เข้าร่วมโครงการรายคน

ALTER TABLE `project`
  ADD COLUMN `project_type` enum('academic_service','culture','other')
    NOT NULL DEFAULT 'other' AFTER `description`,
  ADD KEY `idx_project_type_year` (`project_type`, `academic_year`);

CREATE TABLE `project_satisfaction_responses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `is_satisfied` tinyint(1) NOT NULL,
  `comment` text,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_satisfaction_student` (`project_id`, `student_id`),
  CONSTRAINT `chk_project_satisfaction_value`
    CHECK (`is_satisfied` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `student_project_outcome_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `project_outcome_link_id` bigint NOT NULL,
  `score_percent` decimal(5,2) DEFAULT NULL,
  `pass_status` tinyint(1) DEFAULT NULL,
  `assessed_by` bigint DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_project_outcome`
    (`project_id`, `student_id`, `project_outcome_link_id`),
  KEY `idx_student_project_outcome_link`
    (`project_id`, `project_outcome_link_id`),
  KEY `idx_student_project_outcome_assessor` (`assessed_by`),
  CONSTRAINT `chk_student_project_outcome_score`
    CHECK (`score_percent` IS NULL OR (`score_percent` >= 0 AND `score_percent` <= 100)),
  CONSTRAINT `chk_student_project_outcome_pass`
    CHECK (`pass_status` IS NULL OR `pass_status` IN (0, 1)),
  CONSTRAINT `chk_student_project_outcome_has_result`
    CHECK (`score_percent` IS NOT NULL OR `pass_status` IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
