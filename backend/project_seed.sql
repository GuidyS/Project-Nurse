-- Seed ข้อมูลโครงการสำหรับทดสอบ role อาจารย์ผู้รับผิดชอบโครงการ (63172133)
USE `MYSQL_DATABASE`;

-- โครงการ 1: มอบหมายผู้รับผิดชอบ + meta (เก็บใต้ key 'meta' ใน mapping_json ไม่ทับ links)
UPDATE project SET
  responsible_faculty_id = 63172133,
  academic_year = 2567,
  mapping_json = JSON_SET(IFNULL(mapping_json, '{}'),
    '$.meta', JSON_OBJECT('type', 'บริการวิชาการ', 'status', 'active', 'progress', 65,
                          'deadline', '2568-03-31', 'members', 8))
WHERE project_id = 1;

-- โครงการ 2 (เพิ่มถ้ายังไม่มี)
INSERT INTO project (project_name_th, project_name_en, description, responsible_faculty_id, academic_year, mapping_json)
SELECT 'โครงการอบรมเชิงปฏิบัติการการพยาบาลชุมชน',
       'Community Nursing Workshop',
       'อบรมเชิงปฏิบัติการด้านการพยาบาลชุมชนสำหรับนักศึกษาชั้นปีที่ 3',
       63172133, 2567,
       JSON_OBJECT('meta', JSON_OBJECT('type', 'ทำนุบำรุงศิลปวัฒนธรรม', 'status', 'pending', 'progress', 20,
                                       'deadline', '2568-06-30', 'members', 5))
WHERE NOT EXISTS (SELECT 1 FROM (SELECT project_name_th FROM project) p WHERE p.project_name_th = 'โครงการอบรมเชิงปฏิบัติการการพยาบาลชุมชน');

-- งบประมาณโครงการ 2
INSERT INTO project_budget_years (project_id, fiscal_year, budget_allocated, budget_spent)
SELECT p.project_id, 2567, 80000, 25000 FROM project p
WHERE p.project_name_th = 'โครงการอบรมเชิงปฏิบัติการการพยาบาลชุมชน'
  AND NOT EXISTS (SELECT 1 FROM project_budget_years b WHERE b.project_id = p.project_id AND b.fiscal_year = 2567);

SELECT project_id, project_name_th, responsible_faculty_id FROM project;
SELECT project_id, fiscal_year, budget_allocated, budget_spent FROM project_budget_years;
