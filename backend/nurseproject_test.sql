-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jan 23, 2026 at 05:38 PM
-- Server version: 9.5.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `MYSQL_DATABASE`
--

-- --------------------------------------------------------

--
-- Table structure for table `advice_log`
--

CREATE TABLE `advice_log` (
  `advice_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `advisor_id` bigint NOT NULL,
  `advice_note` text COMMENT 'รายละเอียดการพูดคุย/คำแนะนำ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `assessments_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `ylo_id` bigint NOT NULL COMMENT 'ประเมินตามเกณฑ์ YLO ตัวไหน',
  `assessor_id` bigint DEFAULT NULL COMMENT 'ผู้ประเมิน (อาจารย์)',
  `pass_status` tinyint(1) DEFAULT NULL COMMENT 'ผลการประเมิน (ผ่าน/ไม่ผ่าน)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `audit_log_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'ใครทำรายการ',
  `action` text COMMENT 'ทำอะไร (เช่น แก้ไขเกรด, ลบข้อมูล)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'ทำเมื่อไหร่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clo`
--

CREATE TABLE `clo` (
  `clo_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL COMMENT 'เป็น CLO ของวิชาไหน',
  `description` text COMMENT 'รายละเอียดสิ่งที่นักศึกษาต้องทำได้'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `degree`
--

CREATE TABLE `degree` (
  `degree_id` bigint NOT NULL,
  `degree_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อวุฒิ เช่น วท.บ.',
  `grad_uni` varchar(255) DEFAULT NULL COMMENT 'มหาวิทยาลัยที่จบ',
  `grad_faculty` varchar(255) DEFAULT NULL COMMENT 'คณะที่จบ',
  `grad_year` int DEFAULT NULL COMMENT 'ปีที่จบการศึกษา',
  `grad_rank` varchar(50) DEFAULT NULL COMMENT 'เกียรตินิยม (ถ้ามี)',
  `degree_files` varchar(255) DEFAULT NULL COMMENT 'เก็บ Path ไฟล์เอกสารแนบ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `enrollment_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `academic_year` int DEFAULT NULL COMMENT 'ปีการศึกษา เช่น 2567',
  `semester` int DEFAULT NULL COMMENT 'ภาคการศึกษา (1, 2, 3)',
  `section` int DEFAULT NULL COMMENT 'ตอนเรียน (Sec)',
  `grade` varchar(5) DEFAULT NULL COMMENT 'เกรดที่ได้ (A, B+, ...)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` bigint NOT NULL,
  `title` varchar(50) DEFAULT NULL COMMENT 'คำนำหน้าชื่อ (นาย/นาง/ดร./ผศ.)',
  `first_name_th` varchar(100) DEFAULT NULL,
  `last_name_th` varchar(100) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `license_no` varchar(50) DEFAULT NULL COMMENT 'เลขใบประกอบวิชาชีพ (ถ้ามี)',
  `member_no` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `position_id` bigint DEFAULT NULL,
  `is_course_leader` tinyint(1) DEFAULT '0' COMMENT 'เป็นผู้รับผิดชอบรายวิชาหรือไม่ (0=ไม่, 1=ใช่)',
  `is_program_leader` tinyint(1) DEFAULT '0' COMMENT 'เป็นผู้รับผิดชอบหลักสูตรหรือไม่',
  `start_date` date DEFAULT NULL COMMENT 'วันที่เริ่มงาน',
  `status` varchar(50) DEFAULT NULL COMMENT 'สถานะการทำงาน (Active/Retired)',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_ce_records`
--

CREATE TABLE `faculty_ce_records` (
  `record_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `activity_name` text COMMENT 'ชื่อกิจกรรมที่ไปอบรม',
  `credits` float DEFAULT NULL COMMENT 'หน่วยกิต/ชั่วโมงที่ได้',
  `result` varchar(255) DEFAULT NULL,
  `date_attended` date DEFAULT NULL COMMENT 'วันที่ไป'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `other_degree`
--

CREATE TABLE `other_degree` (
  `degree_id` bigint NOT NULL,
  `degree_name` varchar(255) DEFAULT NULL,
  `grad_uni` varchar(255) DEFAULT NULL,
  `grad_faculty` varchar(255) DEFAULT NULL,
  `grad_year` int DEFAULT NULL,
  `grad_rank` varchar(50) DEFAULT NULL,
  `degree_files` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permissions_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'ชื่อสิทธิ์ (ควรเป็นภาษาอังกฤษ)',
  `description` text COMMENT 'คำอธิบายเพิ่มเติมเกี่ยวกับสิทธิ์นี้',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plo`
--

CREATE TABLE `plo` (
  `plo_id` bigint NOT NULL,
  `program_id` bigint NOT NULL COMMENT 'เป็น PLO ของหลักสูตรไหน',
  `plo_no` varchar(50) DEFAULT NULL COMMENT 'เลขข้อ PLO เช่น 1.1, 2.1',
  `description` text COMMENT 'รายละเอียด PLO',
  `sub_ploid` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `plo`
--

INSERT INTO `plo` (`plo_id`, `program_id`, `plo_no`, `description`, `sub_ploid`) VALUES
(1, 1, NULL, 'ประยุกต์ความรู้และสาระสําคัญของศาสตร์ทางวิชาชีพการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', 103),
(2, 1, NULL, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยเพื่อความปลอดภัยของผู้รับบริการ', 203),
(3, 1, NULL, 'พัฒนานวัตกรรมทางสุขภาพโดยประยุกต์กระบวนการวิจัยและเทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', 302),
(4, 1, NULL, 'ประยุกต์ใช้ดิจิทัลในการจัดการพยาบาลได้อย่างเหมาะสม', 401),
(5, 1, NULL, 'สื่อสารด้วยภาษาไทยและภาษาอังกฤษได้อย่างมีประสิทธิภาพ', 502),
(6, 1, NULL, 'แสดงออกถึงการมีจริยธรรมและทัศนคติที่ดีต่อวิชาชีพ มีจิตสาธารณะ และมีพฤติกรรมบริการ ที่เป็นที่ยอมรับ', 603),
(7, 1, NULL, 'แสดงออกถึงการเรียนรู้ด้วยตนเองอย่างต่อเนื่อง', 702),
(8, 1, NULL, 'เข้าใจหลักการ การดำเนินการ การเป็นผู้ประกอบการที่เกี่ยวกับการพยาบาลและการผดุงครรภ์ได้', 803);

-- --------------------------------------------------------

--
-- Table structure for table `portfolio`
--

CREATE TABLE `portfolio` (
  `portfolio_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `file_path` varchar(255) DEFAULT NULL COMMENT 'ที่อยู่ไฟล์ (Path) บน Server หรือ Cloud'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `position`
--

CREATE TABLE `position` (
  `position_id` bigint NOT NULL,
  `position_name` varchar(100) NOT NULL COMMENT 'ชื่อตำแหน่ง'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `position_permission`
--

CREATE TABLE `position_permission` (
  `position_permission_id` bigint NOT NULL,
  `position_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

CREATE TABLE `program` (
  `program_id` bigint NOT NULL,
  `program_code` varchar(50) NOT NULL COMMENT 'รหัสหลักสูตร',
  `name_th` varchar(255) DEFAULT NULL COMMENT 'ชื่อหลักสูตรภาษาไทย',
  `name_en` varchar(255) DEFAULT NULL COMMENT 'ชื่อหลักสูตรภาษาอังกฤษ',
  `academic_year` int DEFAULT NULL COMMENT 'ปีการศึกษาที่เริ่มใช้หลักสูตร',
  `total_credits` int DEFAULT NULL COMMENT 'หน่วยกิตรวมตลอดหลักสูตร'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `program`
--

INSERT INTO `program` (`program_id`, `program_code`, `name_th`, `name_en`, `academic_year`, `total_credits`) VALUES
(1, '25491800000000.0', 'หลักสูตรพยาบาลศาสตรบัณฑิต', 'Bachelor of Nursing Science Program', 2567, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `project_id` bigint NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `responsible_faculty_id` bigint DEFAULT NULL COMMENT 'อาจารย์ผู้รับผิดชอบโครงการ',
  `academic_year` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_budget_years`
--

CREATE TABLE `project_budget_years` (
  `project_budget_years_id` bigint NOT NULL,
  `project_id` bigint NOT NULL COMMENT 'ของโครงการไหน',
  `fiscal_year` int DEFAULT NULL COMMENT 'ปีงบประมาณ',
  `budget_allocated` decimal(15,2) DEFAULT NULL COMMENT 'งบที่ได้รับจัดสรร',
  `budget_spent` decimal(15,2) DEFAULT NULL COMMENT 'งบที่ใช้จริง',
  `result` varchar(255) DEFAULT NULL COMMENT 'ผลการดำเนินงาน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` bigint NOT NULL,
  `role_name` varchar(100) NOT NULL COMMENT 'ชื่อบทบาท เช่น Admin, Student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_permission_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'เชื่อม Users',
  `position_id` bigint DEFAULT NULL COMMENT 'ตำแหน่งในห้อง',
  `instructor_id` bigint DEFAULT NULL COMMENT 'อ.ที่ปรึกษา',
  `title` varchar(50) DEFAULT NULL,
  `first_name_th` varchar(100) DEFAULT NULL,
  `last_name_th` varchar(100) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `year` int DEFAULT NULL COMMENT 'ชั้นปี',
  `gpa` float DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `retire_date` date DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `user_id`, `position_id`, `instructor_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `year`, `gpa`, `birth_date`, `email`, `phone`, `status`, `graduation_date`, `retire_date`, `description`, `created_at`, `updated_at`) VALUES
(6603400001, NULL, NULL, NULL, 'นางสาว', 'ญาณันธร', 'โอนอิง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400002, NULL, NULL, NULL, 'นางสาว', 'จุรีพร', 'ผลพรต', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400004, NULL, NULL, NULL, 'นางสาว', 'ศิริพรรณ', 'ทองอ่อน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400005, NULL, NULL, NULL, 'นางสาว', 'ตะวัน', 'รีฮุง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400006, NULL, NULL, NULL, 'นางสาว', 'บัณฑิตา', 'ยุดา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400007, NULL, NULL, NULL, 'นางสาว', 'ประภาภรณ์', 'จงเจริญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400008, NULL, NULL, NULL, 'นางสาว', 'ปวีณา', 'ม่วงชุ่ม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400009, NULL, NULL, NULL, 'นางสาว', 'ศินาภรณ์', 'ทองเชิด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400010, NULL, NULL, NULL, 'นางสาว', 'กฤตพร', 'รุณรังษี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400011, NULL, NULL, NULL, 'ว่าที่ร้อยตรีหญิง', 'ปวีณา', 'เย็นขาว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400012, NULL, NULL, NULL, 'นางสาว', 'ศรุตา', 'พันธ์ครู', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400013, NULL, NULL, NULL, 'นางสาว', 'ภัคธีมา', 'โลหิตานนท์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400014, NULL, NULL, NULL, 'นาย', 'พิพัฒน์', 'คุโนภาต', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400015, NULL, NULL, NULL, 'นางสาว', 'ณัฐชา', 'พิณราช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400016, NULL, NULL, NULL, 'นาย', 'ณัฐสิทธิ์', 'ปัญญาอุทัย', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400017, NULL, NULL, NULL, 'นางสาว', 'จิราวัช', 'พระนา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400018, NULL, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'เรืองเดช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400019, NULL, NULL, NULL, 'นางสาว', 'ฐานวดี', 'ปุนมาปัด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400020, NULL, NULL, NULL, 'นางสาว', 'สุธาสินี', 'สาธุชาติ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400021, NULL, NULL, NULL, 'นางสาว', 'ณัฐนันท์', 'ศรีม่วง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400022, NULL, NULL, NULL, 'นางสาว', 'โยษิตา', 'จิตรีชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400023, NULL, NULL, NULL, 'นางสาว', 'กมลทิพย์', 'อาลัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400024, NULL, NULL, NULL, 'นาย', 'มารุต', 'กรุณา', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400025, NULL, NULL, NULL, 'นางสาว', 'ณรินทร์ดา', 'วงค์บุญมา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400026, NULL, NULL, NULL, 'นางสาว', 'วรัญญา', 'บุญเชิญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400027, NULL, NULL, NULL, 'นางสาว', 'กุสุมา', 'สมแวง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400028, NULL, NULL, NULL, 'นางสาว', 'จิรฐา', 'พิทักษา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400029, NULL, NULL, NULL, 'นางสาว', 'วิลาลักษณ์', 'กล่อมใจ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400030, NULL, NULL, NULL, 'นาย', 'นพเกล้า', 'นพพันธ์ศิริ', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400031, NULL, NULL, NULL, 'นาย', 'ทัศนา', 'ขันตรี', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400032, NULL, NULL, NULL, 'นางสาว', 'สุนันญา', 'มะโนเเสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400033, NULL, NULL, NULL, 'นางสาว', 'ศศิวิมล', 'เพ็งอุดม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400034, NULL, NULL, NULL, 'นางสาว', 'ณัชชา', 'คุ้มคงกระจ่าง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400035, NULL, NULL, NULL, 'นางสาว', 'สุปรียา', 'ศรีละบุตร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400036, NULL, NULL, NULL, 'นางสาว', 'ศุภิกา', 'สว่างภพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400037, NULL, NULL, NULL, 'นางสาว', 'อรอมล', 'คุณสมบัติ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400038, NULL, NULL, NULL, 'นางสาว', 'ปรียานุช', 'ผ่านละคร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400039, NULL, NULL, NULL, 'นางสาว', 'ปาริสชา', 'ดอกพุดตาน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400040, NULL, NULL, NULL, 'นางสาว', 'นภัสนันท์', 'ดีประชีพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400041, NULL, NULL, NULL, 'นางสาว', 'ชลดา', 'อุคำ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400042, NULL, NULL, NULL, 'นางสาว', 'อริสา', 'บุญแยง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400044, NULL, NULL, NULL, 'นางสาว', 'เพ็ญพิชชา', 'รามศิริ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400046, NULL, NULL, NULL, 'นางสาว', 'นริศรา', 'ไทยอุดม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400047, NULL, NULL, NULL, 'นาย', 'รัชวัฒน์', 'สุรภีร์', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400048, NULL, NULL, NULL, 'นางสาว', 'ขนิษฐา', 'มุธุสิทธิ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400049, NULL, NULL, NULL, 'นางสาว', 'วนิชชา', 'นาสานนิวัฒน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400050, NULL, NULL, NULL, 'นางสาว', 'ดวงหทัย', 'บัวกล้า', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400051, NULL, NULL, NULL, 'นางสาว', 'ปาริชาต', 'เชื้อตาอ่อน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400052, NULL, NULL, NULL, 'นางสาว', 'จิราวรรณ', 'พุก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400053, NULL, NULL, NULL, 'นางสาว', 'อรนุช', 'เลี่ยนเพชร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400054, NULL, NULL, NULL, 'นางสาว', 'วราภรณ์', 'พุ่มแย้ม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400055, NULL, NULL, NULL, 'นางสาว', 'ธิดาพร', 'พิกุลทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400056, NULL, NULL, NULL, 'นางสาว', 'ณัฐพร', 'พุ่มไสว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400057, NULL, NULL, NULL, 'นางสาว', 'ศุภัชญา', 'โพธิ์ทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400058, NULL, NULL, NULL, 'นางสาว', 'สุกัญญา', 'ช่องงาม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400061, NULL, NULL, NULL, 'นางสาว', 'วิภาดา', 'คิดดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400062, NULL, NULL, NULL, 'นาย', 'ธนากร', 'โฆษิวากาญจน์', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400063, NULL, NULL, NULL, 'นางสาว', 'ชุติมา', 'หาทรัพย์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400064, NULL, NULL, NULL, 'นางสาว', 'ฐิติรัตน์', 'เหล่าสูง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400065, NULL, NULL, NULL, 'นางสาว', 'ฌานิศา', 'บุญพุฒ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400066, NULL, NULL, NULL, 'นางสาว', 'สิริญญา', 'คำชั่ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400067, NULL, NULL, NULL, 'นางสาว', 'ดวงรัตน์', 'ครุฑธา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400068, NULL, NULL, NULL, 'นางสาว', 'ณฐินี', 'สายจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400069, NULL, NULL, NULL, 'นางสาว', 'กัญชพร', 'สายแปง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400070, NULL, NULL, NULL, 'นางสาว', 'นฤมล', 'อ่อนทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400071, NULL, NULL, NULL, 'นางสาว', 'นฤมล', 'ทำลา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400072, NULL, NULL, NULL, 'นางสาว', 'สุชญา', 'ทองเนื้อแปด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400073, NULL, NULL, NULL, 'นางสาว', 'ศิรประภา', 'เมาตะยา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400074, NULL, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'สุยังกูล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400075, NULL, NULL, NULL, 'นาย', 'จตุรวิทย์', 'สาแก้ว', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400076, NULL, NULL, NULL, 'นางสาว', 'พิลาสินี', 'จิตต์อุทัศน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400077, NULL, NULL, NULL, 'นางสาว', 'ธัญณิชา', 'ท่วมไธสง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400078, NULL, NULL, NULL, 'นางสาว', 'พิยดา', 'ม่วงสุข', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400079, NULL, NULL, NULL, 'นางสาว', 'น้ำมนต์', 'พงษ์บุบผา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400080, NULL, NULL, NULL, 'นางสาว', 'ณัฏฐณิชา', 'ภูมิกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400081, NULL, NULL, NULL, 'นางสาว', 'เพ็ญนภา', 'ชฎาแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400082, NULL, NULL, NULL, 'นางสาว', 'ณิชาพัฒน์', 'จำบุญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400083, NULL, NULL, NULL, 'นางสาว', 'ศุกลภัทร', 'สุพรรณ์คำ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400084, NULL, NULL, NULL, 'นาย', 'ศตพล', 'เกษแก้ว', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400085, NULL, NULL, NULL, 'นางสาว', 'ดวงพร', 'อาศัยนา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400086, NULL, NULL, NULL, 'นางสาว', 'ญาณิน', 'ทินกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400087, NULL, NULL, NULL, 'นางสาว', 'ปพิชญา', 'พัวอุดมจินดากุล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400088, NULL, NULL, NULL, 'นางสาว', 'สาธิตา', 'ปลอดโปร่ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400090, NULL, NULL, NULL, 'นางสาว', 'ภัททิยา', 'บงภูเขียว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400091, NULL, NULL, NULL, 'นางสาว', 'ภัทรานิษฐ์', 'แก้ววิชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400092, NULL, NULL, NULL, 'นางสาว', 'ไปรยา', 'แสนแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400093, NULL, NULL, NULL, 'นางสาว', 'อนุธิดา', 'คำบุตรดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400094, NULL, NULL, NULL, 'นางสาว', 'ปาลิดา', 'กล่อมฤกษ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400095, NULL, NULL, NULL, 'นางสาว', 'วรรณพร', 'อะโนมา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400096, NULL, NULL, NULL, 'นางสาว', 'สุธาสินี', 'โคกวิไล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400097, NULL, NULL, NULL, 'นางสาว', 'อรวรรณ', 'พาบุ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400098, NULL, NULL, NULL, 'นางสาว', 'สิริพรรณ', 'บุญช่วย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400099, NULL, NULL, NULL, 'นางสาว', 'กฤตยา', 'ปะสาวะเท', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400100, NULL, NULL, NULL, 'นางสาว', 'นฤมล', 'สรรพโภชน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400102, NULL, NULL, NULL, 'นางสาว', 'วรัญญา', 'มีประเสริฐ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400104, NULL, NULL, NULL, 'นางสาว', 'นันทน์ณัฏฐ์', 'แซ่โซ้ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400105, NULL, NULL, NULL, 'นางสาว', 'รวิมล', 'ดวงคำจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400106, NULL, NULL, NULL, 'นางสาว', 'กาญจนา', 'ทะวาแสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400107, NULL, NULL, NULL, 'นางสาว', 'จิรวรรณ', 'พลชู', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400108, NULL, NULL, NULL, 'นางสาว', 'นภสร', 'อินภูวา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400109, NULL, NULL, NULL, 'นางสาว', 'รุ่งนภา', 'ถวิลเดช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400110, NULL, NULL, NULL, 'นางสาว', 'วรัทยา', 'คำน้อย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400111, NULL, NULL, NULL, 'นางสาว', 'สุกัญญา', 'พรประไพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400112, NULL, NULL, NULL, 'นางสาว', 'โชษิตา', 'แม้นอินทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400113, NULL, NULL, NULL, 'นางสาว', 'สุภัชชา', 'งามเลิศ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400114, NULL, NULL, NULL, 'นางสาว', 'นฤมล', 'ขอดทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400115, NULL, NULL, NULL, 'นางสาว', 'พรพิมล', 'สังสีราช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400116, NULL, NULL, NULL, 'นางสาว', 'เปรมิกา', 'โพธิ์ชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400117, NULL, NULL, NULL, 'นางสาว', 'นิลุบล', 'นนท์ลุ่น', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400118, NULL, NULL, NULL, 'นางสาว', 'นภารัตน์', 'ปุรัมภะ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400119, NULL, NULL, NULL, 'นางสาว', 'ธีมาพร', 'สุนทร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400120, NULL, NULL, NULL, 'นางสาว', 'ณัฐชา', 'ภูสีดวง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400121, NULL, NULL, NULL, 'นางสาว', 'ปวริศา', 'บุตรตะวงค์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400122, NULL, NULL, NULL, 'นางสาว', 'นฤมล', 'ขุนภักดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400123, NULL, NULL, NULL, 'นางสาว', 'กัญญาณัฐ', 'อินต๊ะสาร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400124, NULL, NULL, NULL, 'นางสาว', 'จิดาภา', 'ไชยสาร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400125, NULL, NULL, NULL, 'นางสาว', 'จิดาภา', 'เชื้อทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400126, NULL, NULL, NULL, 'นางสาว', 'นิภาวรรณ', 'สืบทายาท', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400127, NULL, NULL, NULL, 'นางสาว', 'นริศรา', 'จวงกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400128, NULL, NULL, NULL, 'นาย', 'ภาธร', 'ธงศรี', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400129, NULL, NULL, NULL, 'นาย', 'ประภวิษณุ์', 'พรหมบุตร', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400130, NULL, NULL, NULL, 'นางสาว', 'ดวงแข', 'สลับแสง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400132, NULL, NULL, NULL, 'นางสาว', 'ศิริญญา', 'สุภาพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400133, NULL, NULL, NULL, 'นางสาว', 'ภคมน', 'เชื้อคำเพ็ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400134, NULL, NULL, NULL, 'นางสาว', 'กรนันท์', 'นันทเสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400135, NULL, NULL, NULL, 'นางสาว', 'ปรีณาพรรณ', 'ภานุวัฒนวงศ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400136, NULL, NULL, NULL, 'นางสาว', 'หทัยรัตน์', 'ชุมจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400137, NULL, NULL, NULL, 'นางสาว', 'ชมพูนุช', 'ลาพรม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400138, NULL, NULL, NULL, 'นางสาว', 'ฐิติณัชชา', 'ลาดแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400139, NULL, NULL, NULL, 'นางสาว', 'โสภิตา', 'แสวงกิจ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400140, NULL, NULL, NULL, 'นางสาว', 'ศรีวิกา', 'โรจน์เจริญชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_advisor_mapping`
--

CREATE TABLE `student_advisor_mapping` (
  `mapping_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL COMMENT 'อาจารย์ที่ปรึกษา',
  `advisor_type` varchar(50) DEFAULT NULL COMMENT 'ประเภท (ที่ปรึกษาหลัก/ร่วม)',
  `academic_year` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Student_License_Attempts`
--

CREATE TABLE `Student_License_Attempts` (
  `attempt_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_code` varchar(50) DEFAULT NULL COMMENT 'วิชาที่สอบ',
  `exam_date` date DEFAULT NULL COMMENT 'วันที่สอบ',
  `result` varchar(50) DEFAULT NULL COMMENT 'ผลสอบ (ผ่าน/ไม่ผ่าน)',
  `attempt_number` int DEFAULT NULL COMMENT 'สอบครั้งที่เท่าไหร่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `subject_id` bigint NOT NULL,
  `subject_code` varchar(50) DEFAULT NULL COMMENT 'รหัสวิชา เช่น CS101',
  `subject_name_th` varchar(255) DEFAULT NULL,
  `subject_name_en` varchar(255) DEFAULT NULL,
  `credit` int DEFAULT NULL COMMENT 'หน่วยกิต',
  `program_id` bigint DEFAULT NULL COMMENT 'สังกัดหลักสูตรไหน',
  `department` varchar(100) DEFAULT NULL COMMENT 'ภาควิชา',
  `section_id` int DEFAULT NULL,
  `subject_group_id` int DEFAULT NULL,
  `select_subject_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_plo`
--

CREATE TABLE `sub_plo` (
  `id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `subject_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_plo`
--

INSERT INTO `sub_plo` (`id`, `description`, `subject_id`) VALUES
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-108'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-112'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-113'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-201'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-208'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-211'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-212'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-216'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-226'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-227'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-229'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-230'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-233'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-324'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-327'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-331'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-337'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-338'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-339'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-340'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-346'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-347'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-348'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-349'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-350'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-351'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-352'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-353'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-355'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-431'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-448'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-449'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-457'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-458'),
(101, 'มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแล บุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ', '170-459'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-108'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-201'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-229'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-340'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-349'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-458'),
(102, 'มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต', '170-459'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '103-301'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '103-302'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-108'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-112'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-113'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-116'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-117'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-201'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-208'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-222'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-224'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-226'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-230'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-231'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-233'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-234'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-324'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-327'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-331'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-337'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-338'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-339'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-340'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-346'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-348'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-349'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-350'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-351'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-352'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-353'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-354'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-355'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-431'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-448'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-449'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-457'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-458'),
(103, 'ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต', '170-459'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-216'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-228'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-232'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-327'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-331'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-337'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-338'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-339'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-340'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-347'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-355'),
(201, 'ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', '170-431'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-222'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-327'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-331'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-339'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-340'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-349'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-350'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-351'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-352'),
(202, 'จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม', '170-353'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-232'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-327'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-331'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-337'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-338'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-339'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-340'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-347'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-355'),
(203, 'ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้', '170-431'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-331'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-339'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-346'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-348'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-349'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-354'),
(301, 'นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้', '170-457'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '103-202'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-211'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-212'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-231'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-232'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-350'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-351'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-352'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-353'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-354'),
(302, 'ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', '170-457'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '103-202'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-112'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-113'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-231'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-327'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-346'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-431'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-457'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-458'),
(401, 'สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง', '170-459'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-112'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-113'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-327'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-431'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-448'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-457'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-458'),
(501, 'ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทึมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ', '170-459'),
(502, 'ใช้ภาษาอังกฤษในการสื่อสารกับทึมสุขภาพและผู้รับบริการได้', '170-112'),
(502, 'ใช้ภาษาอังกฤษในการสื่อสารกับทึมสุขภาพและผู้รับบริการได้', '170-113'),
(502, 'ใช้ภาษาอังกฤษในการสื่อสารกับทึมสุขภาพและผู้รับบริการได้', '170-457'),
(502, 'ใช้ภาษาอังกฤษในการสื่อสารกับทึมสุขภาพและผู้รับบริการได้', '170-458'),
(502, 'ใช้ภาษาอังกฤษในการสื่อสารกับทึมสุขภาพและผู้รับบริการได้', '170-459'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-227'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-228'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-337'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-338'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-340'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-355'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-449'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-458'),
(601, 'แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ', '170-459'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-232'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-337'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-338'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-340'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-354'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-355'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-449'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-458'),
(602, 'ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ', '170-459'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-117'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-337'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-338'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-340'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-355'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-449'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-458'),
(603, 'สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย', '170-459'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '103-201'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-208'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-211'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-212'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-216'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-226'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-228'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-229'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-231'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-232'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-233'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-234'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-324'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-331'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-339'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-348'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-349'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-350'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-351'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-352'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-353'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-448'),
(701, 'แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง', '170-457'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '103-201'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-116'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-201'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-211'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-212'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-226'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-234'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-324'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-350'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-351'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-352'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-353'),
(702, 'สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม', '170-448'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '103-302'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-116'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-117'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-216'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-227'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-228'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-229'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-230'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-233'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-234'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-324'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-348'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-350'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-351'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-352'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-353'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-448'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-457'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-458'),
(801, 'ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน', '170-459'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '103-302'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-117'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-227'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-233'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-234'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-324'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-331'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-337'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-338'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-339'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-340'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-349'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-350'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-351'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-352'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-353'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-355'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-449'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-458'),
(802, 'ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้', '170-459'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '103-302'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-117'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-229'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-233'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-234'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-324'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-457'),
(803, 'สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้', '170-458');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint NOT NULL,
  `username` varchar(100) NOT NULL COMMENT 'ชื่อผู้ใช้ (ห้ามซ้ำ)',
  `password_hash` varchar(255) NOT NULL COMMENT 'รหัสผ่านที่เข้ารหัสแล้ว (ห้ามเก็บ Plain text)',
  `role_id` bigint NOT NULL COMMENT 'เชื่อมกับตาราง Role เพื่อบอกว่าเป็นใคร',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_position`
--

CREATE TABLE `user_position` (
  `user_position_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `position_id` bigint NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ylo`
--

CREATE TABLE `ylo` (
  `ylo_id` bigint NOT NULL,
  `plo_id` bigint DEFAULT NULL COMMENT 'เชื่อมกลับไปหา PLO แม่',
  `year` varchar(20) DEFAULT NULL COMMENT 'ชั้นปีที่เป้าหมายนี้บังคับใช้',
  `target_percent` int DEFAULT NULL COMMENT 'ค่าเป้าหมาย (%)',
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ylo`
--

INSERT INTO `ylo` (`ylo_id`, `plo_id`, `year`, `target_percent`, `description`) VALUES
(1, NULL, 'ปี 1', NULL, NULL),
(2, NULL, 'ปี 2', NULL, NULL),
(3, NULL, 'ปี 3', NULL, NULL),
(4, NULL, 'ปี 4', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advice_log`
--
ALTER TABLE `advice_log`
  ADD PRIMARY KEY (`advice_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `advisor_id` (`advisor_id`);

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`assessments_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `ylo_id` (`ylo_id`),
  ADD KEY `assessor_id` (`assessor_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`audit_log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `clo`
--
ALTER TABLE `clo`
  ADD PRIMARY KEY (`clo_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `degree`
--
ALTER TABLE `degree`
  ADD PRIMARY KEY (`degree_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD KEY `position_id` (`position_id`);

--
-- Indexes for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `other_degree`
--
ALTER TABLE `other_degree`
  ADD PRIMARY KEY (`degree_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permissions_id`);

--
-- Indexes for table `plo`
--
ALTER TABLE `plo`
  ADD PRIMARY KEY (`plo_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD PRIMARY KEY (`portfolio_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `position`
--
ALTER TABLE `position`
  ADD PRIMARY KEY (`position_id`);

--
-- Indexes for table `position_permission`
--
ALTER TABLE `position_permission`
  ADD PRIMARY KEY (`position_permission_id`),
  ADD KEY `position_id` (`position_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `program`
--
ALTER TABLE `program`
  ADD PRIMARY KEY (`program_id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `responsible_faculty_id` (`responsible_faculty_id`);

--
-- Indexes for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  ADD PRIMARY KEY (`project_budget_years_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `position_id` (`position_id`),
  ADD KEY `instructor_id` (`instructor_id`);

--
-- Indexes for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  ADD PRIMARY KEY (`mapping_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  ADD PRIMARY KEY (`attempt_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `sub_plo`
--
ALTER TABLE `sub_plo`
  ADD PRIMARY KEY (`id`,`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_position`
--
ALTER TABLE `user_position`
  ADD PRIMARY KEY (`user_position_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `position_id` (`position_id`);

--
-- Indexes for table `ylo`
--
ALTER TABLE `ylo`
  ADD PRIMARY KEY (`ylo_id`),
  ADD KEY `plo_id` (`plo_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advice_log`
--
ALTER TABLE `advice_log`
  MODIFY `advice_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `assessments_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `audit_log_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clo`
--
ALTER TABLE `clo`
  MODIFY `clo_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `degree`
--
ALTER TABLE `degree`
  MODIFY `degree_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `enrollment_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  MODIFY `record_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `other_degree`
--
ALTER TABLE `other_degree`
  MODIFY `degree_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permissions_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plo`
--
ALTER TABLE `plo`
  MODIFY `plo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `portfolio_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `position_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `position_permission`
--
ALTER TABLE `position_permission`
  MODIFY `position_permission_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `program`
--
ALTER TABLE `program`
  MODIFY `program_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  MODIFY `project_budget_years_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `role_permission_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  MODIFY `mapping_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  MODIFY `attempt_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `subject_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_position`
--
ALTER TABLE `user_position`
  MODIFY `user_position_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ylo`
--
ALTER TABLE `ylo`
  MODIFY `ylo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advice_log`
--
ALTER TABLE `advice_log`
  ADD CONSTRAINT `advice_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `advice_log_ibfk_2` FOREIGN KEY (`advisor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`ylo_id`) REFERENCES `ylo` (`ylo_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessments_ibfk_3` FOREIGN KEY (`assessor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `clo`
--
ALTER TABLE `clo`
  ADD CONSTRAINT `clo_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD CONSTRAINT `faculty_ce_records_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `plo`
--
ALTER TABLE `plo`
  ADD CONSTRAINT `plo_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD CONSTRAINT `portfolio_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`);

--
-- Constraints for table `position_permission`
--
ALTER TABLE `position_permission`
  ADD CONSTRAINT `position_permission_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `position_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permissions_id`) ON DELETE CASCADE;

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`responsible_faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  ADD CONSTRAINT `project_budget_years_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permissions_id`) ON DELETE CASCADE;

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_ibfk_3` FOREIGN KEY (`instructor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL;

--
-- Constraints for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  ADD CONSTRAINT `student_advisor_mapping_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `student_advisor_mapping_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  ADD CONSTRAINT `Student_License_Attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`);

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `subject_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_position`
--
ALTER TABLE `user_position`
  ADD CONSTRAINT `user_position_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_position_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE CASCADE;

--
-- Constraints for table `ylo`
--
ALTER TABLE `ylo`
  ADD CONSTRAINT `ylo_ibfk_1` FOREIGN KEY (`plo_id`) REFERENCES `plo` (`plo_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
