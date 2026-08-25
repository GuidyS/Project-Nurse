CREATE TABLE IF NOT EXISTS `student_clo_results` (
  `result_id` BIGINT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `subject_id` INT NOT NULL,
  `clo_id` INT NOT NULL,
  `academic_year` INT NOT NULL,
  `semester` TINYINT NOT NULL,
  `score_percent` DECIMAL(5,2) DEFAULT NULL,
  `pass_status` TINYINT(1) DEFAULT NULL,
  `assessed_by` BIGINT DEFAULT NULL,
  `assessed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `uq_student_clo_result`
    (`student_id`, `subject_id`, `clo_id`, `academic_year`, `semester`),
  KEY `idx_student_clo_results_subject_year`
    (`subject_id`, `academic_year`, `semester`),
  KEY `idx_student_clo_results_clo` (`clo_id`),
  KEY `idx_student_clo_results_assessed_by` (`assessed_by`),
  CONSTRAINT `fk_student_clo_results_student`
    FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_clo_results_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_student_clo_results_clo`
    FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_student_clo_results_assessor`
    FOREIGN KEY (`assessed_by`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_student_clo_results_score`
    CHECK (`score_percent` IS NULL OR (`score_percent` >= 0 AND `score_percent` <= 100)),
  CONSTRAINT `chk_student_clo_results_pass`
    CHECK (`pass_status` IS NULL OR `pass_status` IN (0, 1)),
  CONSTRAINT `chk_student_clo_results_semester`
    CHECK (`semester` BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
