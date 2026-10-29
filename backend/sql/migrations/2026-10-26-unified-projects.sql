-- Stage 1: preserve legacy money for explicit review; never reinterpret it automatically.
-- Apply once before deploying the unified endpoints. No FK checks are disabled.
ALTER TABLE project_budget_years DROP FOREIGN KEY project_budget_years_ibfk_1;
ALTER TABLE project_documents DROP FOREIGN KEY fk_project_documents_project;
ALTER TABLE project_end_reminders DROP FOREIGN KEY fk_project_end_reminders_project;
ALTER TABLE project_faculty_members DROP FOREIGN KEY fk_project_faculty_members_project;
ALTER TABLE project_outcome_links DROP FOREIGN KEY fk_project_outcome_links_project;
ALTER TABLE project MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL;
ALTER TABLE project_budget_years MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL, ADD budget_proposed DECIMAL(15,2) NULL;
ALTER TABLE project_documents MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NULL,
 ADD report_item_id BIGINT NULL, ADD report_document_type VARCHAR(30) NOT NULL DEFAULT 'general',
 ADD legacy_report_document_id BIGINT NULL, ADD UNIQUE KEY uq_legacy_report_document (legacy_report_document_id),
 ADD CONSTRAINT fk_project_doc_report_item FOREIGN KEY (report_item_id) REFERENCES annual_project_report_items(id) ON DELETE SET NULL;
ALTER TABLE project_end_reminders MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL;
ALTER TABLE project_faculty_members MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL;
ALTER TABLE project_outcome_links MODIFY project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL;
ALTER TABLE project_budget_years ADD CONSTRAINT project_budget_years_ibfk_1 FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE project_documents ADD CONSTRAINT fk_project_documents_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE project_end_reminders ADD CONSTRAINT fk_project_end_reminders_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE project_faculty_members ADD CONSTRAINT fk_project_faculty_members_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE project_outcome_links ADD CONSTRAINT fk_project_outcome_links_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE annual_project_report_budgets MODIFY amount DECIMAL(15,2) NOT NULL DEFAULT 0,
 MODIFY source_key ENUM('university','thonburiHospital','nursingFaculty','external','unspecified') NOT NULL;

CREATE TABLE project_report_links (
 project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci PRIMARY KEY,
 report_item_id BIGINT NOT NULL UNIQUE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_project_report_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE RESTRICT,
 CONSTRAINT fk_project_report_item FOREIGN KEY (report_item_id) REFERENCES annual_project_report_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE project_report_periods (
 academic_year INT PRIMARY KEY,
 status ENUM('review','open','closed') NOT NULL DEFAULT 'open',
 closed_by BIGINT NULL, closed_at TIMESTAMP NULL,
 CONSTRAINT fk_project_period_user FOREIGN KEY (closed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE project_report_snapshots (
 academic_year INT PRIMARY KEY, snapshot_json JSON NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_project_snapshot_period FOREIGN KEY (academic_year) REFERENCES project_report_periods(academic_year) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE project_merge_audit (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 operation VARCHAR(40) NOT NULL, source_type VARCHAR(40) NOT NULL, source_id VARCHAR(100) NOT NULL,
 project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NULL,
 payload_json JSON NOT NULL, user_id BIGINT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_project_merge_source (operation,source_type,source_id),
 CONSTRAINT fk_project_merge_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Archive the exact ambiguous old values before any application changes them.
INSERT INTO project_merge_audit(operation,source_type,source_id,project_id,payload_json)
SELECT 'original','budget',CAST(project_budget_years_id AS CHAR),project_id,
 JSON_OBJECT('id',project_budget_years_id,'project_id',project_id,'fiscal_year',fiscal_year,
 'legacy_amount',budget_allocated,'spent',budget_spent,'result',result)
FROM project_budget_years;
INSERT INTO project_report_periods(academic_year,status)
SELECT academic_year,'review' FROM (SELECT DISTINCT academic_year FROM project WHERE academic_year IS NOT NULL
UNION SELECT DISTINCT academic_year FROM annual_project_report_items
UNION SELECT DISTINCT fiscal_year FROM project_budget_years WHERE fiscal_year IS NOT NULL) legacy_years;
