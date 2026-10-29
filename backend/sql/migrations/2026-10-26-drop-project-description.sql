-- Deploy Project APIs that no longer read/write this column before applying.
-- Intentionally deletes project descriptions; project IDs, related tables and historical audit/snapshots are preserved.
SET @project_description_ddl = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='project' AND COLUMN_NAME='description'),
  'ALTER TABLE `project` DROP COLUMN `description`',
  'SELECT 1'
);
PREPARE project_description_statement FROM @project_description_ddl;
EXECUTE project_description_statement;
DEALLOCATE PREPARE project_description_statement;
