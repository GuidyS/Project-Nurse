-- =====================================================================
--  Mock data สำหรับ manual test 9 โมดูล (รันบน DB จริงของทีม)
--  ผู้ทดสอบ: Admin 46172040 (ซึ่งเป็น faculty ด้วย → ตั้งเป็น instructor)
--  รันได้ซ้ำ (idempotent): ล้าง enrollment/clo ก่อนแล้วใส่ใหม่
-- =====================================================================
USE `MYSQL_DATABASE`;

-- ---------- 1) ตาราง clo (สำหรับหน้า CLOPage) ----------
DROP TABLE IF EXISTS `clo`;
CREATE TABLE `clo` (
  `clo_id`     INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `description` TEXT,
  `ylo_id`     VARCHAR(30),
  `clo_code`   VARCHAR(30),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clo` (`subject_id`,`description`,`ylo_id`,`clo_code`) VALUES
  (1,'อธิบายหลักไวยากรณ์และคำศัพท์ภาษาอังกฤษพื้นฐานได้','YLO1','CLO1'),
  (1,'สื่อสารภาษาอังกฤษในสถานการณ์ทั่วไปได้','YLO1','CLO2');

-- ---------- 2) enrollment (การลงทะเบียนเรียน) ----------
DELETE FROM `enrollment`;
INSERT INTO `enrollment` (`student_id`,`subject_id`,`academic_year`,`semester`,`section`,`grade`,`status`) VALUES
  (6603400001,1,2567,1,1,'A','Active'),
  (6603400002,1,2567,1,1,'B+','Active'),
  (6603400004,1,2567,1,1,'C+','Active'),
  (6603400005,1,2567,1,1,'B','Active'),
  (6603400006,1,2567,1,1,NULL,'Active'),
  (6603400007,1,2567,1,1,NULL,'Active'),
  (6603400001,2,2567,1,1,'B','Active'),
  (6603400002,2,2567,1,1,'A','Active'),
  (6603400004,2,2567,1,1,NULL,'Active'),
  (6603400001,4,2567,1,1,NULL,'Active'),
  (6603400005,4,2567,1,1,'C','Active'),
  -- วิชา 103-113 (subject 3): ยังไม่มีการให้เกรดเลย — ไว้ทดสอบรายงานกรณีกราฟว่าง (ข้อ 24)
  (6603400001,3,2567,1,1,NULL,'Active'),
  (6603400002,3,2567,1,1,NULL,'Active'),
  (6603400004,3,2567,1,1,NULL,'Active');

-- ---------- 3) เติม mapping_json: instructor_id + clos + course_plos + documents + course_clos ----------
UPDATE `curriculum_framework` SET `mapping_json` = JSON_SET(
  `mapping_json`,
  '$.subject_mappings."103-111".instructor_id', '46172040',
  '$.subject_mappings."103-112".instructor_id', '46172040',
  '$.subject_mappings."103-114".instructor_id', '46172040',
  '$.subject_mappings."103-111".course_plos', CAST('["PLO1","PLO2","PLO3"]' AS JSON),
  '$.subject_mappings."103-112".course_plos', CAST('["PLO2"]' AS JSON),
  '$.subject_mappings."103-114".course_plos', CAST('["PLO4"]' AS JSON),
  '$.subject_mappings."103-111".clos', CAST('[{"id":"CLO1","code":"CLO1","description":"อธิบายหลักไวยากรณ์และคำศัพท์พื้นฐานได้","weight":40,"mapped_plos":["PLO1","PLO2"]},{"id":"CLO2","code":"CLO2","description":"สื่อสารภาษาอังกฤษในชีวิตประจำวันได้","weight":60,"mapped_plos":["PLO3"]}]' AS JSON),
  '$.subject_mappings."103-112".clos', CAST('[{"id":"CLO1","code":"CLO1","description":"ใช้ภาษาอังกฤษเพื่อการสื่อสารเชิงวิชาชีพได้","weight":100,"mapped_plos":["PLO2"]}]' AS JSON),
  '$.subject_mappings."103-114".clos', CAST('[{"id":"CLO1","code":"CLO1","description":"นำเสนอผลงานเป็นภาษาอังกฤษได้อย่างมืออาชีพ","weight":100,"mapped_plos":["PLO4"]}]' AS JSON),
  '$.subject_mappings."103-111".documents', CAST('[{"id":"doc_seed_1","name":"TQF 3 - 103-111 ภาษาอังกฤษพื้นฐาน","type":"TQF 3","uploadedAt":"2026-06-01","size":"1.2 MB","status":"approved"}]' AS JSON),
  '$.course_clos', CAST('{"103-111":[{"id":"1","code":"CLO1","description":"อธิบายหลักไวยากรณ์และคำศัพท์พื้นฐานได้","plo":"PLO1","weight":40,"status":"active"},{"id":"2","code":"CLO2","description":"สื่อสารภาษาอังกฤษในชีวิตประจำวันได้","plo":"PLO2","weight":60,"status":"active"}]}' AS JSON)
) WHERE `is_active` = 1;

-- ---------- ตรวจผล ----------
SELECT (SELECT COUNT(*) FROM enrollment) AS enrollment_rows,
       (SELECT COUNT(*) FROM clo) AS clo_rows,
       JSON_EXTRACT(mapping_json,'$.subject_mappings."103-111".instructor_id') AS instr_103111
FROM curriculum_framework WHERE is_active=1;
