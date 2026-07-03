-- =====================================================================
--  Schema เพิ่มเติมสำหรับฟีเจอร์ที่ทำให้สมบูรณ์ (รันครั้งเดียว)
-- =====================================================================
USE `MYSQL_DATABASE`;

-- คะแนน CLO รายบุคคล (CourseStudents) — เก็บจริง แทนค่าสุ่ม
CREATE TABLE IF NOT EXISTS `student_clo_scores` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `student_id` BIGINT NOT NULL,
  `clo_key`    VARCHAR(30) NOT NULL,
  `score`      INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_clo_score` (`subject_id`,`student_id`,`clo_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- คะแนนย่อยของ enrollment (CoursesPage): กลางภาค/ปลายภาค/งาน
ALTER TABLE `enrollment` ADD COLUMN `midterm`    DECIMAL(5,2) NULL AFTER `grade`;
ALTER TABLE `enrollment` ADD COLUMN `final`      DECIMAL(5,2) NULL AFTER `midterm`;
ALTER TABLE `enrollment` ADD COLUMN `assignment` DECIMAL(5,2) NULL AFTER `final`;
