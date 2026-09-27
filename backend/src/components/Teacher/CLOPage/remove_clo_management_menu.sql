-- ลบหน้า "จัดการ CLO" (clo-management) ออกจากระบบ — ไม่ใช้งานแล้ว
-- รันไฟล์นี้กับฐานข้อมูลของทุกเครื่อง/เซิร์ฟเวอร์ หลังดึงโค้ดที่ตัดหน้านี้ออกแล้ว
-- mysql -uroot -p MYSQL_DATABASE < remove_clo_management_menu.sql

DELETE FROM system_sidebar_menus WHERE url = 'clo-management';

DELETE FROM position_permission
WHERE permission_id IN (SELECT permission_id FROM permissions WHERE permission_name = 'CLO_MANAGEMENT_VIEW');

DELETE FROM permissions WHERE permission_name = 'CLO_MANAGEMENT_VIEW';
