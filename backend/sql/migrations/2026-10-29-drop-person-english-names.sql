-- Deploy application code that no longer reads or writes these columns before applying.
-- This migration intentionally deletes stored English first/last names for students and faculty.

SET @drop_student_first_name_en = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'student'
      AND COLUMN_NAME = 'first_name_en'
  ),
  'ALTER TABLE `student` DROP COLUMN `first_name_en`',
  'SELECT 1'
);
PREPARE drop_student_first_name_en_statement FROM @drop_student_first_name_en;
EXECUTE drop_student_first_name_en_statement;
DEALLOCATE PREPARE drop_student_first_name_en_statement;

SET @drop_student_last_name_en = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'student'
      AND COLUMN_NAME = 'last_name_en'
  ),
  'ALTER TABLE `student` DROP COLUMN `last_name_en`',
  'SELECT 1'
);
PREPARE drop_student_last_name_en_statement FROM @drop_student_last_name_en;
EXECUTE drop_student_last_name_en_statement;
DEALLOCATE PREPARE drop_student_last_name_en_statement;

SET @drop_faculty_first_name_en = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'faculty'
      AND COLUMN_NAME = 'first_name_en'
  ),
  'ALTER TABLE `faculty` DROP COLUMN `first_name_en`',
  'SELECT 1'
);
PREPARE drop_faculty_first_name_en_statement FROM @drop_faculty_first_name_en;
EXECUTE drop_faculty_first_name_en_statement;
DEALLOCATE PREPARE drop_faculty_first_name_en_statement;

SET @drop_faculty_last_name_en = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'faculty'
      AND COLUMN_NAME = 'last_name_en'
  ),
  'ALTER TABLE `faculty` DROP COLUMN `last_name_en`',
  'SELECT 1'
);
PREPARE drop_faculty_last_name_en_statement FROM @drop_faculty_last_name_en;
EXECUTE drop_faculty_last_name_en_statement;
DEALLOCATE PREPARE drop_faculty_last_name_en_statement;
