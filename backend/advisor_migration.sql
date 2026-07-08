-- =====================================================================
--  Advisor pages (Advises / AdviseNotes / AdvisorNotifications)
--  เพิ่มคอลัมน์ที่ขาด + ข้อมูลตัวอย่างสำหรับทดสอบ (รันซ้ำได้)
-- =====================================================================
USE `MYSQL_DATABASE`;

-- 1) advice_log: เพิ่ม topic / log_type / created_at (ของเดิมมีแค่ advice_note)
SET @c := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='MYSQL_DATABASE' AND table_name='advice_log' AND column_name='topic');
SET @s := IF(@c=0, 'ALTER TABLE advice_log ADD COLUMN topic VARCHAR(255) NULL AFTER advisor_id', 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='MYSQL_DATABASE' AND table_name='advice_log' AND column_name='log_type');
SET @s := IF(@c=0, "ALTER TABLE advice_log ADD COLUMN log_type VARCHAR(20) NOT NULL DEFAULT 'academic' AFTER topic", 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='MYSQL_DATABASE' AND table_name='advice_log' AND column_name='created_at');
SET @s := IF(@c=0, 'ALTER TABLE advice_log ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 2) มอบนักศึกษาให้ที่ปรึกษา (admin 46172040 ดูแล 8 คน / teacher 41172008 ดูแล 4 คน)
DELETE FROM student_advisor_mapping;
INSERT INTO student_advisor_mapping (student_id, faculty_id, advisor_type, academic_year)
SELECT s.student_id, 46172040, 'หลัก', 2567 FROM student s ORDER BY s.student_id LIMIT 8;
INSERT INTO student_advisor_mapping (student_id, faculty_id, advisor_type, academic_year)
SELECT s.student_id, 41172008, 'หลัก', 2567 FROM student s ORDER BY s.student_id LIMIT 4 OFFSET 8;

-- 3) ตัวอย่างบันทึกคำปรึกษา (advisor_id = users.user_id ; admin=5)
DELETE FROM advice_log;
INSERT INTO advice_log (student_id, advisor_id, topic, log_type, advice_note)
SELECT s.student_id, 5, 'แนะนำการลงทะเบียนเรียน', 'academic', 'นักศึกษาสอบถามการลงทะเบียนวิชาเลือก แนะนำให้เลือกตามความสนใจและตารางเวลา'
FROM student s ORDER BY s.student_id LIMIT 1;
INSERT INTO advice_log (student_id, advisor_id, topic, log_type, advice_note)
SELECT s.student_id, 5, 'ติดตามผลการเรียน', 'warning', 'ผลการเรียนภาคที่ผ่านมาลดลง นัดติดตามอีกครั้งปลายเดือน'
FROM student s ORDER BY s.student_id LIMIT 1 OFFSET 1;
INSERT INTO advice_log (student_id, advisor_id, topic, log_type, advice_note)
SELECT s.student_id, 5, 'ปรับตัวเข้ากับการเรียน', 'personal', 'ให้คำปรึกษาเรื่องการปรับตัว แนะนำเข้าร่วมกิจกรรมของคณะ'
FROM student s ORDER BY s.student_id LIMIT 1 OFFSET 2;

-- 4) ตัวอย่างการแจ้งเตือนของที่ปรึกษา (user_id 5 = admin)
DELETE FROM avisor_notifications;
INSERT INTO avisor_notifications (user_id, type, title, message, student_id, is_read) VALUES
 (5,'warning','นักศึกษาเสี่ยงผลการเรียนต่ำ','นักศึกษาในความดูแลมีผลการเรียนรายวิชาต่ำกว่าเกณฑ์ กรุณานัดหมายให้คำปรึกษา','6603400001',0),
 (5,'request','คำขอนัดพบจากนักศึกษา','นักศึกษาส่งคำขอนัดพบเพื่อปรึกษาเรื่องการลงทะเบียนภาคเรียนหน้า','6603400002',0),
 (5,'info','กำหนดส่งรายงานการให้คำปรึกษา','ครบกำหนดส่งสรุปรายงานการให้คำปรึกษาประจำภาคเรียนภายในสิ้นเดือนนี้',NULL,1);

SELECT (SELECT COUNT(*) FROM student_advisor_mapping) mapping,
       (SELECT COUNT(*) FROM advice_log) advice,
       (SELECT COUNT(*) FROM avisor_notifications) noti;
