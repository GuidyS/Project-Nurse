-- รวมหน้า "ข้อมูลวัคซีนนักศึกษา" และ "ประเมินสมรรถนะหลัก" (ฝั่งอาจารย์ที่ปรึกษา)
-- เข้ากับหน้า "ข้อมูลสุขภาพนักศึกษา" (advisor-health-records-view) ให้เหลือหน้าเดียว
-- รันไฟล์นี้กับฐานข้อมูลของทุกเครื่อง/เซิร์ฟเวอร์ หลังดึงโค้ดชุดนี้แล้ว
-- mysql -uroot -p MYSQL_DATABASE < merge_advisor_student_menus.sql
--
-- หมายเหตุ: ไม่ลบ permission VIEW_STUDENT_VACCINATION / MANAGE_COMPETENCY
-- เพราะ endpoint ฝั่ง backend (view-student-vaccinations, student-competency,
-- save-student-competency) ยังถูกเรียกจากหน้ารวม และสิทธิ์ชุดนี้ยังใช้กำหนดขอบเขตผู้ใช้

DELETE FROM system_sidebar_menus WHERE url IN ('advisor-vaccination-view', 'advisor-competency-view');

-- ให้ชื่อเมนูที่เหลือสื่อว่าเป็นหน้ารวม
UPDATE system_sidebar_menus
SET title = 'ข้อมูลสุขภาพนักศึกษา'
WHERE url = 'advisor-health-records-view';
