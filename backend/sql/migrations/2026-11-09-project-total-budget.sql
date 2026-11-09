-- เปลี่ยนโมเดลงบโครงการให้เหลือยอดรวมระดับโครงการเพียงค่าเดียว
-- สำรองฐานข้อมูลและหยุดการเขียนข้อมูลโครงการก่อนรัน migration นี้

-- รองรับทั้งฐานเดิมและฐานที่สร้างใหม่จาก MYSQL_DATABASE.sql ซึ่งมีคอลัมน์นี้แล้ว
SET @project_total_budget_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project'
      AND COLUMN_NAME = 'total_budget'
);
SET @project_total_budget_ddl = IF(
    @project_total_budget_exists = 0,
    'ALTER TABLE project ADD COLUMN total_budget DECIMAL(15,2) NULL AFTER strategy',
    'DO 0'
);
PREPARE project_total_budget_stmt FROM @project_total_budget_ddl;
EXECUTE project_total_budget_stmt;
DEALLOCATE PREPARE project_total_budget_stmt;

SET @project_total_budget_check_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project'
      AND CONSTRAINT_NAME = 'chk_project_total_budget_nonnegative'
      AND CONSTRAINT_TYPE = 'CHECK'
);
SET @project_total_budget_check_ddl = IF(
    @project_total_budget_check_exists = 0,
    'ALTER TABLE project ADD CONSTRAINT chk_project_total_budget_nonnegative CHECK (total_budget IS NULL OR total_budget >= 0)',
    'DO 0'
);
PREPARE project_total_budget_check_stmt FROM @project_total_budget_check_ddl;
EXECUTE project_total_budget_check_stmt;
DEALLOCATE PREPARE project_total_budget_check_stmt;

-- ใช้ผลรวมงบเสนอของรายการโครงการหลักเป็นแหล่งแรก
UPDATE project p
LEFT JOIN (
    SELECT l.project_id, SUM(b.amount) AS proposed_total
    FROM project_report_links l
    INNER JOIN annual_project_report_budgets b
        ON b.report_item_id = l.report_item_id
       AND b.budget_type = 'proposed'
    GROUP BY l.project_id
) detail ON detail.project_id = p.project_id
SET p.total_budget = detail.proposed_total
WHERE p.total_budget IS NULL
  AND detail.proposed_total IS NOT NULL;

-- หากไม่มีรายละเอียดงบ ให้ fallback จาก cache เฉพาะปีเดียวกับโครงการ
UPDATE project p
LEFT JOIN (
    SELECT project_id, fiscal_year, SUM(budget_proposed) AS proposed_total
    FROM project_budget_years
    WHERE budget_proposed IS NOT NULL
    GROUP BY project_id, fiscal_year
) cache
    ON cache.project_id = p.project_id
   AND cache.fiscal_year = p.academic_year
SET p.total_budget = cache.proposed_total
WHERE p.total_budget IS NULL
  AND cache.proposed_total IS NOT NULL;

ProjectsPage.tsx MyProjects.tsx 
ปรับให้รายการโครงการแสดงเป็นแถว ไม่แสดงเป็น card แล้ว โดย
1. ในแถวให้แสดงแค่ชื่อและสถานะ
2. กดคลิ้กที่แถวนั้นๆเพื่อเปิดดูรายละเอียดโครงการ (ทั้ง 2 หน้า)
3. ย้ายปุ่ม dropdown menu ไปไว้ด้านขวาของแถว (หน้า @ProjectsPage.tsx)