-- เพิ่มเมนู "วิชาที่ลงทะเบียน" ให้นักศึกษา (หน้าลงทะเบียนเรียน)
-- รันไฟล์นี้กับฐานข้อมูลของทุกเครื่อง/เซิร์ฟเวอร์ หลังดึงโค้ดชุดนี้แล้ว
-- mysql -uroot -p MYSQL_DATABASE < add_registration_menu.sql

INSERT INTO permissions (permission_name, module_group, description_th)
SELECT 'STUDENT_COURSE_REGISTRATION', 'Student', 'ลงทะเบียนเรียนรายวิชาของหลักสูตร'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE permission_name = 'STUDENT_COURSE_REGISTRATION');

-- ให้สิทธิ์กับตำแหน่งที่มีสิทธิ์ดูข้อมูลนักศึกษาของตัวเองอยู่แล้ว (ตำแหน่ง "นักศึกษา")
INSERT INTO position_permission (position_id, permission_id)
SELECT pp.position_id, (SELECT permission_id FROM permissions WHERE permission_name = 'STUDENT_COURSE_REGISTRATION')
FROM position_permission pp
INNER JOIN permissions p ON p.permission_id = pp.permission_id
WHERE p.permission_name = 'STUDENT_VIEW_TRANSCRIPT'
  AND NOT EXISTS (
      SELECT 1 FROM position_permission x
      WHERE x.position_id = pp.position_id
        AND x.permission_id = (SELECT permission_id FROM permissions WHERE permission_name = 'STUDENT_COURSE_REGISTRATION')
  );

INSERT INTO system_sidebar_menus (title, url, icon, permission_required, section_title, is_active)
SELECT 'วิชาที่ลงทะเบียน', 'student-registration', 'BookOpen', 'STUDENT_COURSE_REGISTRATION', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM system_sidebar_menus WHERE url = 'student-registration');
