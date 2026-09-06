-- UTF-8 repair notes for Project data.
-- Use this file only with a source dump/file that contains the correct Thai text.
-- Run with: mysql --default-character-set=utf8mb4 -u... -p... MYSQL_DATABASE < repair-project-thai-data.sql

SET NAMES utf8mb4;

-- Re-applied from Downloads/project_documents.sql because the current DB rows had ????? text.
UPDATE project_documents
SET name = 'ข้อเสนอโครงการวิจัย AI',
    project = 'โครงการพัฒนาระบบ AI สำหรับการศึกษา'
WHERE id = 1;

UPDATE project_documents
SET name = 'รายงานความก้าวหน้า ไตรมาส 1',
    project = 'โครงการพัฒนาระบบ AI สำหรับการศึกษา'
WHERE id = 2;

UPDATE project_documents
SET name = 'สรุปงบประมาณการจัดซื้ออุปกรณ์',
    project = 'โครงการปรับปรุงห้องปฏิบัติการคอมพิวเตอร์'
WHERE id = 3;

UPDATE project_documents
SET name = 'รายงานสรุปผลการดำเนินงาน',
    project = 'โครงการค่ายอาสาพัฒนาชนบท'
WHERE id = 4;

UPDATE project_documents
SET name = 'ข้อเสนอโครงการประกวดนวัตกรรม',
    project = 'โครงการประกวดนวัตกรรมสีเขียว 2026'
WHERE id = 5;

-- The current project.project_name_th rows are also corrupted, but no matching
-- source rows were found for the current project_name_en values. Do not guess
-- these values; update them only from the correct source file.
--
-- Example:
-- UPDATE project
-- SET project_name_th = '<correct Thai project name>'
-- WHERE project_name_en = '<matching English project name>';
