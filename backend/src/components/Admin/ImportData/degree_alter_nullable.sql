-- Allow unmatched CSV degree rows (no faculty match) to store faculty_id = NULL.
-- Index fk_degree_faculty exists as KEY only (no FOREIGN KEY constraint in current dump).
-- field_group separates nursing vs other from CSV column groups (ตรี = NULL).

ALTER TABLE `degree`
  MODIFY `faculty_id` bigint NULL
  COMMENT 'รหัสอาจารย์ (อ้างอิง faculty) — NULL ถ้ายังไม่จับคู่ได้';

-- Idempotent-ish: ignore error if column already exists when re-run manually.
ALTER TABLE `degree`
  ADD COLUMN `field_group` varchar(20) NULL
  COMMENT 'nursing | other — จากกลุ่มคอลัมน์ใน CSV; ตรี = NULL'
  AFTER `degree_level`;
