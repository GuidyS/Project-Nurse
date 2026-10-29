-- Deploy code that no longer reads/writes this column before applying.
-- Intentionally deletes the English project names; does not change project keys or child tables.
ALTER TABLE `project` DROP COLUMN `project_name_en`;
