-- Phase 2: permanently remove project.mapping_json.
-- Run only after the phase-1 code has been deployed and verified.
-- Do not roll back to application code that reads or writes this column afterwards.

DROP PROCEDURE IF EXISTS drop_project_mapping_json_if_ready;
DELIMITER $$
CREATE PROCEDURE drop_project_mapping_json_if_ready()
BEGIN
  DECLARE mapping_column_exists INT DEFAULT 0;
  DECLARE audit_table_exists INT DEFAULT 0;
  DECLARE phase_one_ready INT DEFAULT 0;
  DECLARE issue_count INT DEFAULT 0;

  SELECT COUNT(*) INTO mapping_column_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'project'
    AND COLUMN_NAME = 'mapping_json';

  IF mapping_column_exists > 0 THEN
    SELECT COUNT(*) INTO audit_table_exists
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_mapping_json_backfill_audit';

    SELECT COUNT(*) INTO phase_one_ready
    FROM schema_migrations
    WHERE version = '202610290002';

    IF audit_table_exists = 0 OR phase_one_ready = 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Phase-1 project mapping backfill has not passed validation';
    END IF;

    SELECT COUNT(*) INTO issue_count
    FROM project p
    LEFT JOIN project_mapping_json_backfill_audit audit_row ON audit_row.project_id = p.project_id
    WHERE p.mapping_json IS NOT NULL
      AND (
        audit_row.project_id IS NULL
        OR audit_row.mapping_hash <> SHA2(CAST(p.mapping_json AS CHAR CHARACTER SET utf8mb4), 256)
      );

    IF issue_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'project.mapping_json changed after phase-1 backfill; rerun phase 1';
    END IF;

    SELECT COUNT(*) INTO issue_count
    FROM project p
    JOIN project_outcome_links pol
      ON pol.project_id = p.project_id AND pol.outcome_type IN ('plo', 'clo')
    WHERE p.project_type <> 'academic_service';

    IF issue_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Non-academic projects still have PLO/CLO links';
    END IF;

    ALTER TABLE project DROP COLUMN mapping_json;
  END IF;

  DROP TABLE IF EXISTS project_mapping_json_backfill_audit;

  INSERT INTO schema_migrations (version, name, notes)
  VALUES ('202610290003', 'drop_project_mapping_json', JSON_ARRAY('Dropped project.mapping_json after verified relational backfill'))
  ON DUPLICATE KEY UPDATE notes = VALUES(notes);
END$$
DELIMITER ;

CALL drop_project_mapping_json_if_ready();
DROP PROCEDURE IF EXISTS drop_project_mapping_json_if_ready;
