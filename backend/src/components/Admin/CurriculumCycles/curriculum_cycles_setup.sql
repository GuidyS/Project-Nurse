-- หน้า "จัดการหลักสูตร" (หลักสูตรรอบละ 5 ปี) — รันซ้ำได้ ไม่เพิ่มข้อมูลซ้ำ
-- ตารางถูกสร้างอัตโนมัติจาก API อยู่แล้ว ไฟล์นี้จำเป็นสำหรับ "เมนู + สิทธิ์" ที่ต้องมีก่อนเมนูจะโผล่

CREATE TABLE IF NOT EXISTS `curriculum_cycle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_year` int NOT NULL,
  `end_year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_cycle_years` (`start_year`, `end_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `curriculum_cycle_subject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cycle_id` int NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `credit` int NOT NULL DEFAULT 0,
  `credit_desc` varchar(50) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_curriculum_cycle_subject_code` (`cycle_id`, `subject_code`),
  CONSTRAINT `fk_curriculum_cycle_subject_cycle`
    FOREIGN KEY (`cycle_id`) REFERENCES `curriculum_cycle` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- สิทธิ์
INSERT INTO `permissions` (`permission_name`, `module_group`, `description_th`)
SELECT 'CURRICULUM_CYCLE_MANAGE', 'Admin', 'จัดการหลักสูตรรายรอบ 5 ปี (อัปโหลด Excel / เพิ่ม-ลดรายวิชา)'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `permission_name` = 'CURRICULUM_CYCLE_MANAGE');

-- มอบสิทธิ์ให้ตำแหน่ง 7 (เลขา/ผู้ดูแลระบบ)
INSERT IGNORE INTO `position_permission` (`position_id`, `permission_id`)
SELECT 7, `permission_id` FROM `permissions` WHERE `permission_name` = 'CURRICULUM_CYCLE_MANAGE';

-- เมนูในหมวด "จัดการระบบ"
INSERT INTO `system_sidebar_menus` (`title`, `url`, `icon`, `permission_required`, `section_title`, `is_active`)
SELECT 'จัดการหลักสูตร', 'curriculum-cycles', 'Library', 'CURRICULUM_CYCLE_MANAGE', 'จัดการระบบ', 1
WHERE NOT EXISTS (SELECT 1 FROM `system_sidebar_menus` WHERE `url` = 'curriculum-cycles');
