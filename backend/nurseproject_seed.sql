-- =====================================================================
--  Nursing MIS - Schema + Seed สำหรับการทดสอบ (Test Database)
-- ---------------------------------------------------------------------
--  จุดประสงค์: สร้างตารางขั้นต่ำ + ข้อมูลตัวอย่าง ให้ระบบ login ได้
--  และทดสอบโมดูล CLOManagement / CLOMap / CLOPage / CourseReports /
--  CoursesPage / CourseStudents / Documents / Grades / MyCourses ได้
--
--  ผู้ใช้ทดสอบ (รหัสผ่านเดียวกันทุกคน):  Test@1234
--    - admin    / Test@1234   (role_id = 1)
--    - T001     / Test@1234   (role_id = 2  อาจารย์)  <-- ใช้ทดสอบ 9 โมดูล
--    - 6401001  / Test@1234   (role_id = 3  นักศึกษา)
--
--  หมายเหตุ: ค่า database/user/password เป็นค่าตามตัวอักษรที่ docker-compose ตั้งไว้
--           (MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `MYSQL_DATABASE`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `MYSQL_DATABASE`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------- ล้างของเดิม (idempotent) ----------
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `position_permission`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `user_position`;
DROP TABLE IF EXISTS `positions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `enrollment`;
DROP TABLE IF EXISTS `clo`;
DROP TABLE IF EXISTS `curriculum_framework`;
DROP TABLE IF EXISTS `subject`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `faculty`;
DROP TABLE IF EXISTS `users`;

-- =====================================================================
--  RBAC / Auth
-- =====================================================================
CREATE TABLE `roles` (
  `role_id`   INT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `positions` (
  `position_id`   INT PRIMARY KEY,
  `position_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `user_id`       INT AUTO_INCREMENT PRIMARY KEY,
  `username`      VARCHAR(50) NOT NULL UNIQUE,   -- = faculty_id หรือ student_id
  `password_hash` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(150) NULL,
  `role_id`       INT NOT NULL DEFAULT 3,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_position` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT NOT NULL,
  `position_id` INT NOT NULL,
  `is_primary`  TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `permissions` (
  `permission_id`   INT AUTO_INCREMENT PRIMARY KEY,
  `permission_name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `position_permission` (
  `position_id`   INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`position_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `audit_log` (
  `log_id`      INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT NULL,
  `action_type` VARCHAR(50) NULL,
  `resource`    VARCHAR(100) NULL,
  `details`     TEXT NULL,
  `ip_address`  VARCHAR(64) NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
--  People
-- =====================================================================
CREATE TABLE `faculty` (
  `faculty_id`    VARCHAR(50) PRIMARY KEY,        -- = users.username (ของอาจารย์)
  `user_id`       INT NULL,                       -- บางโมดูล (MyCourses) join ด้วยคอลัมน์นี้
  `title`         VARCHAR(50) NULL,
  `first_name_th` VARCHAR(100) NULL,
  `last_name_th`  VARCHAR(100) NULL,
  `position`      VARCHAR(100) NULL,
  `email`         VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `student` (
  `student_id`    VARCHAR(50) PRIMARY KEY,        -- = users.username (ของนักศึกษา)
  `title`         VARCHAR(50) NULL,
  `first_name_th` VARCHAR(100) NULL,
  `last_name_th`  VARCHAR(100) NULL,
  `program_id`    INT NULL,
  `year_of_study` INT NULL,
  `gpa`           DECIMAL(3,2) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
--  Academic
-- =====================================================================
CREATE TABLE `subject` (
  `subject_id`      INT AUTO_INCREMENT PRIMARY KEY,
  `subject_code`    VARCHAR(30) NOT NULL UNIQUE,
  `subject_name_th` VARCHAR(255) NOT NULL,
  `credit`          INT NOT NULL DEFAULT 3,
  `semester`        VARCHAR(20) NULL,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `enrollment` (
  `enrollment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id`    VARCHAR(50) NOT NULL,
  `subject_id`    INT NOT NULL,
  `grade`         VARCHAR(5) NULL,
  `status`        VARCHAR(20) NULL DEFAULT 'Active',
  `academic_year` VARCHAR(10) NULL,
  `semester`      VARCHAR(10) NULL,
  `section`       VARCHAR(10) NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- โครงสร้างหลักสูตรเก็บเป็น JSON (ใช้โดย CLOManagement/CLOMap/Documents/MyCourses ฯลฯ)
CREATE TABLE `curriculum_framework` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `mapping_json` LONGTEXT NULL,
  `is_active`    TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ตาราง CLO เชิงสัมพันธ์ (ใช้โดยหน้า CLOPage: add/get/update/delete-clo)
CREATE TABLE `clo` (
  `clo_id`          INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id`      INT NOT NULL,
  `description`     TEXT NULL,
  `ylo_id`          VARCHAR(30) NULL,
  `clo_code`        VARCHAR(30) NULL,
  `clo_description` TEXT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
--  SEED DATA
-- =====================================================================

INSERT INTO `roles` (`role_id`,`role_name`) VALUES
  (1,'admin'), (2,'faculty'), (3,'student');

INSERT INTO `positions` (`position_id`,`position_name`) VALUES
  (1,'ผู้ดูแลระบบ'), (2,'อาจารย์'), (3,'นักศึกษา'), (4,'ประธานหลักสูตร');

-- รหัสผ่านทั้งหมดคือ  Test@1234  (bcrypt, ตรวจด้วย password_verify ของ PHP ได้)
INSERT INTO `users` (`user_id`,`username`,`password_hash`,`email`,`role_id`) VALUES
  (1,'admin',   '$2b$10$nrmbPOGrudK0kL3.4hvx5eQWbee5WC914plP9ievbFpdoal9WN1ti','admin@nurse.test',   1),
  (2,'T001',    '$2b$10$j1SVNQaVRzBnqslL5uRJHutWtaiR9swr4FurLe4W9gWoPxmogIGN2','teacher@nurse.test', 2),
  (3,'6401001', '$2b$10$ISR1wSxwghh/LvVg.A1ZX.G0X4gHk/0NSO.BlYpNSWvf4jLKm6ZgS','student@nurse.test', 3);

INSERT INTO `user_position` (`user_id`,`position_id`,`is_primary`) VALUES
  (1,1,1), (2,2,1), (3,3,1);

INSERT INTO `permissions` (`permission_id`,`permission_name`) VALUES
  (1,'manage_users'),
  (2,'manage_roles'),
  (3,'manage_course_grading'),
  (4,'manage_clo'),
  (5,'view_reports'),
  (6,'manage_documents'),
  (7,'view_advisory_student');

-- อาจารย์ (position 2) ได้สิทธิ์จัดการเกรด/CLO/เอกสาร/ดูรายงาน
INSERT INTO `position_permission` (`position_id`,`permission_id`) VALUES
  (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),
  (2,3),(2,4),(2,5),(2,6),(2,7);

-- อาจารย์ทดสอบ:  faculty_id = T001  (= users.username) , user_id = 2
INSERT INTO `faculty` (`faculty_id`,`user_id`,`title`,`first_name_th`,`last_name_th`,`position`) VALUES
  ('T001',2,'อ.','สมชาย','ใจดี','อาจารย์ประจำ'),
  ('T002',NULL,'ผศ.','สมศรี','รักเรียน','อาจารย์ประจำ');

INSERT INTO `student` (`student_id`,`title`,`first_name_th`,`last_name_th`,`year_of_study`) VALUES
  ('6401001','นางสาว','สมหญิง','เรียนดี',3),
  ('6401002','นางสาว','มานี','ตั้งใจ',3),
  ('6401003','นาย','ปิติ','ขยันยิ่ง',3),
  ('6401004','นางสาว','ชูใจ','พากเพียร',3);

INSERT INTO `subject` (`subject_id`,`subject_code`,`subject_name_th`,`credit`,`semester`,`is_active`) VALUES
  (1,'103-111','การพยาบาลพื้นฐาน',3,'1/2567',1),
  (2,'103-112','การพยาบาลผู้ใหญ่ 1',3,'1/2567',1),
  (3,'103-201','การพยาบาลมารดาและทารก',2,'2/2567',1);

-- ลงทะเบียนเรียน (subject 1 = 103-111) — มีทั้งเด็กที่มีเกรด และยังไม่มีเกรด (ไว้ทดสอบบันทึกเกรด)
INSERT INTO `enrollment` (`student_id`,`subject_id`,`grade`,`status`,`academic_year`,`semester`,`section`) VALUES
  ('6401001',1,'B', 'Active','2567','1','1'),
  ('6401002',1,'A', 'Active','2567','1','1'),
  ('6401003',1,'C+','Active','2567','1','1'),
  ('6401004',1,NULL,'Active','2567','1','1'),
  ('6401001',2,'B+','Active','2567','1','1'),
  ('6401002',2,NULL,'Active','2567','1','1');

-- CLO เชิงสัมพันธ์ของวิชา 103-111 (subject_id = 1) สำหรับหน้า CLOPage
INSERT INTO `clo` (`subject_id`,`description`,`ylo_id`,`clo_code`) VALUES
  (1,'อธิบายหลักการและทฤษฎีการพยาบาลพื้นฐานได้','YLO1','CLO1'),
  (1,'ปฏิบัติการพยาบาลพื้นฐานตามมาตรฐานได้','YLO2','CLO2');

-- โครงสร้างหลักสูตร (JSON) : PLO, การ map รายวิชา-PLO, CLO ราย course, instructor, เอกสาร
INSERT INTO `curriculum_framework` (`id`,`mapping_json`,`is_active`) VALUES
(1, '{
  "plos": [
    {"plo_id":"PLO1","plo_name":"มีคุณธรรม จริยธรรม และจรรยาบรรณวิชาชีพการพยาบาล"},
    {"plo_id":"PLO2","plo_name":"มีความรู้ในศาสตร์การพยาบาลและศาสตร์ที่เกี่ยวข้อง"},
    {"plo_id":"PLO3","plo_name":"มีทักษะทางปัญญาในการแก้ปัญหาทางการพยาบาล"},
    {"plo_id":"PLO4","plo_name":"มีทักษะความสัมพันธ์ระหว่างบุคคลและความรับผิดชอบ"},
    {"plo_id":"PLO5","plo_name":"มีทักษะการวิเคราะห์เชิงตัวเลข การสื่อสาร และเทคโนโลยี"}
  ],
  "subject_mappings": {
    "103-111": {
      "instructor_id": "T001",
      "course_plos": ["PLO1","PLO2"],
      "clos": [
        {"id":"CLO1","code":"CLO1","description":"อธิบายหลักการพยาบาลพื้นฐานได้","weight":40,"mapped_plos":["PLO1"]},
        {"id":"CLO2","code":"CLO2","description":"ปฏิบัติการพยาบาลพื้นฐานได้","weight":60,"mapped_plos":["PLO2"]}
      ],
      "documents": [
        {"id":"doc_seed_1","name":"TQF 3 - 103-111","type":"TQF 3","uploadedAt":"2025-06-01","size":"1.2 MB","status":"approved"}
      ]
    },
    "103-112": {
      "instructor_id": "T001",
      "course_plos": ["PLO2","PLO3"],
      "clos": [
        {"id":"CLO1","code":"CLO1","description":"วางแผนการพยาบาลผู้ใหญ่ได้","weight":50,"mapped_plos":["PLO2"]}
      ],
      "documents": []
    },
    "103-201": {
      "instructor_id": "T002",
      "course_plos": ["PLO4"],
      "clos": [],
      "documents": []
    }
  },
  "course_clos": {
    "103-111": [
      {"id":"1","code":"CLO1","description":"อธิบายหลักการพยาบาลพื้นฐานได้","plo":"PLO1","weight":40,"status":"active"},
      {"id":"2","code":"CLO2","description":"ปฏิบัติการพยาบาลพื้นฐานได้","plo":"PLO2","weight":60,"status":"active"}
    ]
  }
}', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
--  เสร็จสิ้น — ลองล็อกอินด้วย T001 / Test@1234 เพื่อทดสอบ 9 โมดูล
-- =====================================================================
