-- Apply manually to the database using the updated MYSQL_DATABASE.sql schema.
-- Requires project.id PRIMARY KEY and project.project_id UNIQUE to already exist.
-- Preserves existing ids, project codes, and all child foreign keys.
ALTER TABLE `project` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
