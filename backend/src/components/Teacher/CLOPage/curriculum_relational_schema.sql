-- Phase 2: relational curriculum tables (YLO / PLO / SubPLO / CLO)
-- Run against MYSQL_DATABASE before migrate_mapping_json_to_tables.php

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `curriculum_plo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `framework_id` int NOT NULL,
  `plo_code` varchar(20) NOT NULL,
  `name` text,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_plo_code` (`framework_id`, `plo_code`),
  CONSTRAINT `fk_curriculum_plo_framework`
    FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_sub_plo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `framework_id` int NOT NULL,
  `plo_id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_sub_plo_code` (`framework_id`, `code`),
  KEY `idx_curriculum_sub_plo_plo` (`plo_id`),
  CONSTRAINT `fk_curriculum_sub_plo_framework`
    FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_curriculum_sub_plo_plo`
    FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_ylo_plo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `framework_id` int NOT NULL,
  `ylo_code` varchar(10) NOT NULL,
  `plo_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_ylo_plo` (`framework_id`, `ylo_code`, `plo_id`),
  KEY `idx_curriculum_ylo_plo_plo` (`plo_id`),
  CONSTRAINT `fk_curriculum_ylo_plo_framework`
    FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_curriculum_ylo_plo_plo`
    FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_subject_meta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `framework_id` int NOT NULL,
  `subject_code` varchar(32) NOT NULL,
  `instructor_id` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_subject_meta` (`framework_id`, `subject_code`),
  CONSTRAINT `fk_curriculum_subject_meta_framework`
    FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_subject_plo` (
  `subject_meta_id` int NOT NULL,
  `plo_id` int NOT NULL,
  PRIMARY KEY (`subject_meta_id`, `plo_id`),
  KEY `idx_curriculum_subject_plo_plo` (`plo_id`),
  CONSTRAINT `fk_curriculum_subject_plo_meta`
    FOREIGN KEY (`subject_meta_id`) REFERENCES `curriculum_subject_meta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_curriculum_subject_plo_plo`
    FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_clo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `framework_id` int NOT NULL,
  `subject_code` varchar(32) NOT NULL,
  `clo_code` varchar(32) DEFAULT NULL,
  `description` text,
  `ylo_code` varchar(10) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_curriculum_clo_subject` (`framework_id`, `subject_code`),
  CONSTRAINT `fk_curriculum_clo_framework`
    FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_clo_plo` (
  `clo_id` int NOT NULL,
  `plo_id` int NOT NULL,
  `weight` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`clo_id`, `plo_id`),
  KEY `idx_curriculum_clo_plo_plo` (`plo_id`),
  CONSTRAINT `fk_curriculum_clo_plo_clo`
    FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_curriculum_clo_plo_plo`
    FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_clo_sub_plo` (
  `clo_id` int NOT NULL,
  `sub_plo_id` int NOT NULL,
  PRIMARY KEY (`clo_id`, `sub_plo_id`),
  KEY `idx_curriculum_clo_sub_plo_sub` (`sub_plo_id`),
  CONSTRAINT `fk_curriculum_clo_sub_plo_clo`
    FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_curriculum_clo_sub_plo_sub`
    FOREIGN KEY (`sub_plo_id`) REFERENCES `curriculum_sub_plo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
