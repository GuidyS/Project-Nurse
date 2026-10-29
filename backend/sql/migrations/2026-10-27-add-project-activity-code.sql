-- Apply during a maintenance write pause before enabling application code that requires activity_code.
-- Existing activity IDs and relationships are preserved. The generated LEGACY-* codes
-- provide a stable, deterministic key for existing rows without changing their meaning.

SET @activity_code_ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'annual_project_report_items'
      AND COLUMN_NAME = 'activity_code'
  ),
  'SELECT 1',
  'ALTER TABLE `annual_project_report_items` ADD COLUMN `activity_code` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NULL AFTER `activity_name`'
);
PREPARE activity_code_statement FROM @activity_code_ddl;
EXECUTE activity_code_statement;
DEALLOCATE PREPARE activity_code_statement;

UPDATE `annual_project_report_items`
SET `activity_code` = CONCAT('LEGACY-', `id`)
WHERE `row_type` = 'activity'
  AND (`activity_code` IS NULL OR TRIM(`activity_code`) = '');

SET @activity_code_index_ddl = IF(
  EXISTS(
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'annual_project_report_items'
      AND INDEX_NAME = 'uq_report_item_activity_code'
  ),
  'SELECT 1',
  'ALTER TABLE `annual_project_report_items` ADD UNIQUE KEY `uq_report_item_activity_code` (`parent_item_id`, `activity_code`)'
);
PREPARE activity_code_index_statement FROM @activity_code_index_ddl;
EXECUTE activity_code_index_statement;
DEALLOCATE PREPARE activity_code_index_statement;
