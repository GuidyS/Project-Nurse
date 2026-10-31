-- เปลี่ยนชื่อเมนูในแถบด้านข้างจาก "ภาระงานการเรียนการสอน" เป็น "บุคลากรภายในคณะ"
-- ชื่อเมนูเก็บอยู่ในฐานข้อมูล จึงต้องรันคำสั่งนี้ด้วย ไม่ใช่แก้แค่ในโค้ด
--
-- รันครั้งเดียว ปลอดภัยถ้ารันซ้ำ (อิงจาก url ซึ่งไม่เปลี่ยน)
--   mysql -uroot -p MYSQL_DATABASE < rename_menu_faculty_directory.sql

UPDATE `system_sidebar_menus`
   SET `title` = 'บุคลากรภายในคณะ',
       `icon`  = 'Users'
 WHERE `url` = 'dean-teaching-workload';

SELECT menu_id, title, url, icon
  FROM `system_sidebar_menus`
 WHERE `url` = 'dean-teaching-workload';
