-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 28, 2026 at 06:23 AM
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
  `description` text COMMENT 'รายละเอียดสิ่งที่นักศึกษาต้องทำได้',
  `ylo_id` bigint DEFAULT NULL COMMENT 'เชื่อมกับ YLO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clo`
--

INSERT INTO `clo` (`clo_id`, `subject_id`, `description`, `ylo_id`) VALUES
(2, 1, 'ปฏิบัติทักษะทางการพยาบาลพื้นฐานในห้องปฏิบัติการได้ตามมาตรฐาน', 2),
(3, 1, 'ประยุกต์ใช้ความรู้เพื่อวางแผนการพยาบาลผู้ป่วยเบื้องต้นได้', 3),
(4, 2, 'อธิบายโครงสร้างและหน้าที่ของระบบต่างๆ ในร่างกายมนุษย์ได้', 1),
(5, 2, 'อธิบายโครงสร้างและหน้าที่ของระบบต่างๆ ในร่างกายมนุษย์ได้', NULL);

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
  `start_date` date DEFAULT NULL COMMENT 'วันที่เริ่มงาน',
  `status` varchar(50) DEFAULT NULL COMMENT 'สถานะการทำงาน (Active/Retired)',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `birth_date`, `license_no`, `member_no`, `email`, `phone`, `start_date`, `status`, `description`, `created_at`) VALUES
(41172008, 'นาง', 'จรัสดาว', 'เรโนลด์', 'Jaratdao', NULL, 'female', '1968-04-15', '4511059407', NULL, NULL, NULL, '1998-03-15', NULL, 'มี 2 นามสกุล', NULL),
(41172011, 'นางสาว', 'พิชาภรณ์ ', 'จันทนกุล', 'Pichaporn', 'Janthanakul', 'female', '1972-07-27', '4511036515', '50436', NULL, NULL, '1998-06-01', NULL, NULL, NULL),
(41172017, 'นางสาว', 'อรทิพา', 'ส่องศิริ', 'Orntipa', 'Songsiri', 'female', '1951-07-22', '4511016150', NULL, NULL, NULL, '1994-10-01', NULL, NULL, NULL),
(42172021, 'นาง', 'วัฒนีย์ ', 'ปานจินดา', 'Wattanee', 'Panjinda', 'female', '1955-08-17', '4511077074', 'อ.1/1710', NULL, NULL, '1999-01-01', NULL, NULL, NULL),
(42172025, 'นาง', 'ปรียธิดา', 'ชลศึกเสนีย์', NULL, NULL, 'female', '1966-07-31', '4511055442', NULL, NULL, NULL, '1999-07-01', NULL, NULL, NULL),
(44172033, 'นางสาว', 'ภัทรพร', 'อรัณยภาค', NULL, 'Arunyaphaga', 'female', '1953-02-16', '4511016607', NULL, NULL, NULL, '2001-10-16', NULL, 'ชื่อภัทรา หรือ ภัทรพร', NULL),
(45172037, 'นาง', 'สุสารี', 'ประคินกิจ', 'Susaree', 'Prakhinkit', 'female', '1975-01-25', '4511005639', NULL, NULL, NULL, '2002-11-01', NULL, NULL, NULL),
(46172038, 'นางสาว', 'สมฤดี', 'ชื่นกิติญานนท์', NULL, NULL, 'female', '1975-05-09', '4611093778', NULL, NULL, NULL, '2002-12-01', NULL, NULL, NULL),
(46172040, 'พ.จ.อ.', 'ภูมเดชา', 'ชาญเบญจพิภู', NULL, NULL, 'male', '1964-04-07', '4521050682', NULL, NULL, NULL, '2003-03-01', NULL, NULL, NULL),
(47172044, 'นาง', 'สุวรรณา', 'เชียงขุนทด', 'Suwanna', NULL, 'female', '1973-02-01', '4511007784', NULL, NULL, NULL, '2004-05-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(47172046, 'นาง', 'วารุณี', 'เพไร', 'Warunee', NULL, 'female', '1976-08-06', '4711186486', '47789', NULL, NULL, '2004-06-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(47172047, 'นางสาว', 'ชนิดา', 'มัททวางกูร', 'Chanida', 'Mattavangkul', 'female', '1971-09-21', '4511069513', NULL, NULL, NULL, '2004-07-01', NULL, NULL, NULL),
(47172049, 'นางสาว', 'ศนิกานต์', 'ศรีมณี', NULL, NULL, 'female', '1975-03-01', '4511078893', NULL, NULL, NULL, '2004-10-01', NULL, NULL, NULL),
(49172053, 'นาง', 'พรพิมล', 'ภูมิฤทธิกุล', NULL, NULL, 'female', '1959-04-20', '5511168672', NULL, NULL, NULL, '2006-03-16', NULL, NULL, NULL),
(49172054, 'นางสาว', 'สุนันทา', 'บุญรักษา', NULL, NULL, 'female', '1975-05-10', '5311108587', NULL, NULL, NULL, '2006-08-01', NULL, NULL, NULL),
(51172062, 'นางสาว', 'เพ็ญรุ่ง', 'นวลแจ่ม', NULL, NULL, 'female', '1973-01-20', '6611103761', '76117', NULL, NULL, '2008-08-01', NULL, NULL, NULL),
(52172066, 'นาง', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharnthip', 'Jirakanjana', 'female', '1975-02-15', '4511034476', NULL, NULL, NULL, '2009-11-01', NULL, NULL, NULL),
(54172071, 'นางสาว', 'วราภรณ์', 'คำรศ', 'Waraporn', 'Khamros', 'female', '1983-08-09', '6411198208', '115533', NULL, NULL, '2010-12-01', NULL, NULL, NULL),
(54172075, 'นางสาว', 'สิริณัฐ', 'สินวรรณกุล', 'Sirinut', 'Sinvonnagul', 'female', '1969-09-11', '4511070793', NULL, NULL, NULL, '2010-09-01', NULL, NULL, NULL),
(54172078, 'รอ.หญิง', 'วิภานันท์', 'ม่วงสกุล', 'Wipanun', 'Muangsakul', 'female', '1977-04-27', '4711178169', NULL, NULL, NULL, '2011-05-01', NULL, NULL, NULL),
(54172084, 'นางสาว', 'ธัญลักษณ์วดี', 'ก้อนทองถม', NULL, NULL, 'female', '1986-09-15', '5211209369', '137583', NULL, NULL, '2011-10-01', NULL, NULL, NULL),
(54172085, 'นางสาว', 'อัมพร', 'คงจีระ', 'Amporn', 'Kongjeera', 'female', '1951-04-16', '4511002485', NULL, NULL, NULL, '2011-12-01', NULL, NULL, NULL),
(56172088, 'นาง', 'วิวรรณา', 'คล้ายคลึง', NULL, NULL, 'female', '1973-10-07', '4511013331', '55314', NULL, NULL, '2013-03-01', NULL, NULL, NULL),
(56172089, 'นางสาว', 'สุจิตราภรณ์', 'ทับครอง', NULL, NULL, 'female', '1965-10-02', '4511050062', NULL, NULL, NULL, '2013-05-01', NULL, NULL, NULL),
(56172103, 'นางสาว', 'รัฐกานต์', 'ขำเขียว', NULL, NULL, 'female', '1984-12-10', '5111205212', NULL, NULL, NULL, '2013-07-01', NULL, NULL, NULL),
(56172104, 'นางสาว', 'ณิชมล', 'ขวัญเมือง', NULL, NULL, 'female', '1972-03-19', '5011200055', '47562', NULL, NULL, '2013-07-01', NULL, NULL, NULL),
(57172108, 'นางสาว', 'นฤมล', 'อังศิริศักดิ์', NULL, NULL, 'female', '1985-02-04', '5011200055', '126375', NULL, NULL, '2014-04-01', NULL, NULL, NULL),
(57172109, 'นางสาว', 'ดวงกมล', 'วิรุฬห์อุดมผล', NULL, NULL, 'female', '1966-04-22', '5711254926', NULL, NULL, NULL, '2014-06-01', NULL, NULL, NULL),
(58172110, 'นางสาว', 'สุกฤตา', 'ตะการีย์', NULL, NULL, 'female', '1980-01-26', '4811193884', '115510', NULL, NULL, '2015-01-15', NULL, NULL, NULL),
(58172114, 'นางสาว', 'ศิริพร', 'สามสี', 'Siriporn', 'Samsri', 'female', '1969-03-13', '4511075055', NULL, NULL, NULL, '2015-10-01', NULL, NULL, NULL),
(59172119, 'นาย', 'ชัยสิทธิ์', 'ทันศึก', NULL, NULL, 'male', '1972-04-30', '4311158065', NULL, NULL, NULL, '2016-10-01', NULL, NULL, NULL),
(59172120, 'นาง', 'พิไลพรรณ', 'แก้วแก่นตา', NULL, NULL, 'female', '1976-01-13', '4511032299', '74109', NULL, NULL, '2016-05-01', NULL, NULL, NULL),
(59172121, 'พ.ต.อ.หญิง', 'ระชี', 'ดิษฐจร', 'Rachee', 'Ditachorn', 'female', '1955-11-16', '4511012136', NULL, NULL, NULL, '2016-11-01', NULL, NULL, NULL),
(60172123, 'นางสาว', 'ขวัญเรือน', 'ก๋าวิตู', NULL, NULL, 'female', '1985-06-19', '5111207345', '129959', NULL, NULL, '2017-02-01', NULL, NULL, NULL),
(63172128, 'นาย', 'เรวัต', 'แย้มสุดา', 'Raywat', 'Yaemsuda', 'male', '1959-04-28', '4521023170', 'อ.1/21510', NULL, NULL, '2020-01-02', NULL, NULL, NULL),
(63172129, 'นางสาว', 'รัตนาภรณ์', 'นิวาศานนท์', NULL, NULL, 'female', '1992-03-24', '5811261753', NULL, NULL, NULL, '2019-02-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(63172131, 'นางสาว', 'พาจนา', 'ดวงจันทร์', NULL, NULL, 'female', '1967-04-29', '4511050318', NULL, NULL, NULL, '2005-02-01', NULL, NULL, NULL),
(63172132, 'นาง', 'บัวทิพย์', 'เพ็งศรี', 'Buatip', 'Phengsri', 'female', '1970-10-17', '4511048575', NULL, NULL, NULL, '2015-10-01', NULL, NULL, NULL),
(63172133, 'นางสาว', 'พรรณี', 'ตรังคสันต์', NULL, NULL, 'female', '1968-02-27', '4511050332', NULL, NULL, NULL, '2015-10-10', NULL, NULL, NULL),
(64172139, 'นางสาว', 'สุภาภรณ์', 'ศรีฟ้า', 'Supaporn', 'Srifa', 'female', '1985-11-12', '5111207470', NULL, NULL, NULL, '2021-03-01', NULL, NULL, NULL),
(65172142, 'นาง', 'อัจรา', 'ฐิตวัฒนกุล', NULL, NULL, 'female', '1987-09-13', '5311218207', NULL, NULL, NULL, '2022-08-01', NULL, NULL, NULL),
(66172148, 'นาง', 'รุ่งนภา', 'พรหมแย้ม', NULL, NULL, 'female', '1963-05-03', '4511053132', NULL, NULL, NULL, '2023-12-01', NULL, NULL, NULL),
(66712147, 'นางสาว', 'เกวลี', 'เชียรวิชัย', NULL, NULL, 'female', '1990-09-06', '5611243227', '164439', NULL, NULL, '2023-11-01', NULL, NULL, NULL);

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
-- Table structure for table `import_history`
--

CREATE TABLE `import_history` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'ผู้ที่ทำรายการ',
  `type` varchar(50) NOT NULL COMMENT 'ประเภท (students, teachers, etc.)',
  `file_name` varchar(255) NOT NULL,
  `record_count` int DEFAULT '0' COMMENT 'จำนวนแถวที่นำเข้าสำเร็จ',
  `status` enum('success','failed','partial','processing') DEFAULT 'processing',
  `error_details` text COMMENT 'เก็บ JSON หรือรายละเอียดแถวที่ผิดพลาด',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `import_history`
--

INSERT INTO `import_history` (`id`, `user_id`, `type`, `file_name`, `record_count`, `status`, `error_details`, `created_at`) VALUES
(1, 5, 'teachers', 'ข้อมูลอาจารย์ 2568_คณะพยาบาล มหาวิทยาลัยสยามเเก้ (csv)(test).csv', 43, 'success', NULL, '2026-02-27 12:38:02');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'แจ้งเตือนถึงใคร (FK users)',
  `title` varchar(255) NOT NULL COMMENT 'หัวข้อแจ้งเตือน',
  `message` text COMMENT 'เนื้อหา',
  `type` enum('info','warning','success','request') DEFAULT 'info' COMMENT 'ประเภทสี (ตรงกับ Frontend)',
  `channel` enum('in-app','email','both') DEFAULT 'in-app' COMMENT 'ช่องทางการส่ง',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '0=ยังไม่รุ้, 1=อ่านแล้ว',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `channel`, `is_read`, `created_at`) VALUES
(4, 1, 'คำขอนัดพบอาจารย์', 'นายสมชาย รักเรียน ต้องการนัดพบเพื่อปรึกษาเรื่องการลงทะเบียน', 'request', 'in-app', 0, '2026-02-02 05:35:51'),
(5, 1, 'แจ้งเตือนกำหนดส่งรายงาน', 'ส่งการแจ้งเตือนกำหนดส่งรายงานโครงการวิจัยให้นักศึกษา 5 คน', 'info', 'email', 0, '2026-02-02 04:35:51'),
(6, 1, 'ส่งการแจ้งเตือนสำเร็จ', 'แจ้งเตือนผลการเรียนถึงนักศึกษา 12 คน สำเร็จแล้ว', 'success', 'both', 1, '2026-02-01 05:35:51');

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
  `description_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `description_th` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT 'คำอธิบายเพิ่มเติมเกี่ยวกับสิทธิ์นี้',
  `role_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permissions_id`, `name`, `description_en`, `description_th`, `role_description`, `created_at`) VALUES
(1, 'PROFILE_VIEW', 'View Profile', 'ดูข้อมูลส่วนตัว', 'ทุกคน', '2026-02-13 18:26:30'),
(2, 'RESEARCH_UPLOAD', 'Upload Research', 'อัปโหลดงานวิจัย', 'ทุกคน', '2026-02-13 18:26:30'),
(3, 'NOTIFICATION_VIEW', 'View Notification', 'รับแจ้งเตือน', 'ทุกคน', '2026-02-13 18:26:30'),
(4, 'COURSE_EXPORT_5YEAR', 'Export 5-Year Report', 'Export ผลย้อนหลัง 5 ปี', 'ทุกคน ยกเว้นคณบดี', '2026-02-13 18:26:30'),
(5, 'VIEW_DEAN_DASHBOARD', 'View Dashboard KPI', 'ดู Dashboard ภาพรวม KPI ระดับคณะ', 'คณบดี', '2026-02-13 18:26:30'),
(6, 'FINANCIAL_VIEW', 'View Financial Report', 'ดูรายงานการเงินและข้อมูลเชิงบริหาร', 'คณบดี', '2026-02-13 18:26:30'),
(7, 'DASHBOARD_EXPORT', 'Export KPI Report', 'Export รายงาน KPI', 'คณบดี', '2026-02-13 18:26:30'),
(8, 'PROJECT_VIEW', 'View Project', 'ดูข้อมูลโครงการที่อาจารย์ดูแล', 'คณบดี', '2026-02-13 18:26:30'),
(9, 'CURRICULUM_REPORT_VIEW', 'View PLO/YLO/CLO Report', 'ดูรายงานผลลัพธ์หลักสูตรทุกชั้นปี', 'คณบดี', '2026-02-13 18:26:30'),
(10, 'COURSE_EXPORT_5YEAR', 'Export 5-Year Report', 'Export ข้อมูลผลสรุป 5 ปี', 'คณบดี', '2026-02-13 18:26:30'),
(11, 'EXEC_REPORT_CREATE', 'Create Executive Report', 'สร้างรายงานระดับบริหาร', 'คณบดี', '2026-02-13 18:26:30'),
(12, 'PROFILE_VIEW_ALL', 'View Other Profile', 'ดูข้อมูลส่วนตัวอาจารย์ท่านอื่น', 'คณบดี', '2026-02-13 18:26:30'),
(13, 'STUDENT_VIEW_COURSE', 'View Course Students', 'ดูนักศึกษาที่สอน', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(14, 'STUDENT_EXPORT_COURSE', 'Export Course Students', 'Export รายชื่อนักศึกษา', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(15, 'PLO_REPORT_READ', 'Read PLO/YLO Report', 'อ่านรายงาน PLO/YLO ของวิชา', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(16, 'PROJECT_VIEW', 'View Project', 'ดูโครงการที่รับผิดชอบ', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(17, 'PROJECT_UPLOAD_DOC', 'Upload Project Doc', 'อัปโหลดเอกสารโครงการ', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(18, 'PROJECT_LINK_LO', 'Link Project LO', 'เชื่อมโยง PLO/YLO/CLO', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(19, 'GRADE_DEFINE', 'Define Grade', 'กำหนดเกรดตาม CLO', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(20, 'GRADE_UPDATE', 'Update Grade', 'แก้ไขเกรดตาม CLO', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(21, 'CURRICULUM_REPORT_VIEW', 'View Curriculum Report', 'ดูรายงานหลักสูตร', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(22, 'STUDENT_UPLOAD_EVIDENCE', 'Upload Student Evidence', 'แนบหลักฐาน นศ.', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(23, 'STUDENT_ASSIGN_COURSE', 'Assign Student', 'เพิ่ม นศ. เข้ารายวิชา', 'อ.ประจำ/ประจำหลักสูตร', '2026-02-13 18:26:30'),
(24, 'STUDENT_VIEW_ADVISOR', 'View Advisor Students', 'ดูนักศึกษา 1:12', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(25, 'STUDENT_UPLOAD_LIST', 'Upload Student List', 'อัปโหลดรายชื่อนักศึกษา', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(26, 'PROJECT_VIEW', 'View Project', 'ดูโครงการ', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(27, 'STUDENT_UPLOAD_EVIDENCE', 'Upload Evidence', 'แนบหลักฐาน นศ.', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(28, 'EXAM_UPLOAD_8SUBJ', 'Upload 8-Subject', 'อัปโหลดเอกสารสอบ 8 วิชา', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(29, 'EXAM_UPLOAD_LICENSE', 'Upload License', 'อัปโหลดใบประกอบ', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(30, 'STUDENT_GRAD_CHECK', 'Check Graduation', 'ตรวจสอบจบการศึกษา', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(31, 'EXAM_REPORT_8SUBJ', 'Report 8-Subject', 'สร้างรายงานสอบ 8 วิชา', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(32, 'EXAM_REPORT_LICENSE', 'Report License', 'สร้างรายงานใบประกอบ', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(33, 'STUDENT_ASSIGN_COURSE', 'Assign Student', 'เพิ่ม นศ.', 'อ.ที่ปรึกษา', '2026-02-13 18:26:30'),
(34, 'PROJECT_VIEW', 'View Project', 'ดูโครงการ', 'รับผิดชอบโครงการ', '2026-02-13 18:26:30'),
(35, 'PROJECT_UPLOAD_DOC', 'Upload Project', 'อัปโหลดเอกสารโครงการ', 'รับผิดชอบโครงการ', '2026-02-13 18:26:30'),
(36, 'PROJECT_LINK_LO', 'Link LO', 'เชื่อมโยง Learning Outcome', 'รับผิดชอบโครงการ', '2026-02-13 18:26:30'),
(37, 'PROJECT_ASSIGN_STUDENT', 'Assign Student to Project', 'เพิ่ม นศ. เข้าโครงการ', 'รับผิดชอบโครงการ', '2026-02-13 18:26:30'),
(38, 'CLO_DEFINE', 'Define CLO', 'กำหนด CLO', 'รับผิดชอบหลักสูตร', '2026-02-13 18:26:30'),
(39, 'CLO_UPDATE', 'Update CLO', 'แก้ไข CLO', 'รับผิดชอบหลักสูตร', '2026-02-13 18:26:30'),
(40, 'COURSE_REPORT_CREATE', 'Create Course Report', 'สร้างรายงานรายวิชา', 'รับผิดชอบหลักสูตร', '2026-02-13 18:26:30'),
(41, 'CURRICULUM_REPORT_VIEW', 'View Curriculum Report', 'ดูรายงานหลักสูตร', 'รับผิดชอบหลักสูตร', '2026-02-13 18:26:30'),
(42, 'STUDENT_VIEW_COURSE', 'View Course Students', 'ดูนักศึกษาที่สอน', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(43, 'STUDENT_EXPORT_COURSE', 'Export Course Students', 'Export รายชื่อนักศึกษา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(44, 'PLO_REPORT_READ', 'Read PLO/YLO Report', 'อ่านรายงาน PLO/YLO ของวิชา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(45, 'STUDENT_UPLOAD_LIST', 'Upload Student List', 'อัปโหลดรายชื่อนักศึกษา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(46, 'PROJECT_VIEW', 'View Project', 'ดูโครงการ', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(47, 'PROJECT_UPLOAD_DOC', 'Upload Project', 'อัปโหลดเอกสารโครงการ', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(48, 'PROJECT_LINK_LO', 'Link Project LO', 'เชื่อมโยง PLO/YLO/CLO', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(49, 'GRADE_DEFINE', 'Define Grade', 'กำหนดเกรดตาม CLO', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(50, 'GRADE_UPDATE', 'Update Grade', 'แก้ไขเกรดตาม CLO', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(51, 'STUDENT_VIEW_CLINICAL', 'View Advisor Students', 'ดูนักศึกษา 1:8', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(52, 'STUDENT_UPLOAD_EVIDENCE', 'Upload Student Evidence', 'แนบหลักฐาน นศ.', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(53, 'EXAM_UPLOAD_8SUBJ', 'Upload 8-Subject', 'อัปโหลดเอกสารสอบ 8 วิชา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(54, 'EXAM_UPLOAD_LICENSE', 'Upload License', 'อัปโหลดใบประกอบ', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(55, 'STUDENT_GRAD_CHECK', 'Check Graduation', 'ตรวจสอบจบการศึกษา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(56, 'EXAM_REPORT_8SUBJ', 'Report 8-Subject', 'สร้างรายงานสอบ 8 วิชา', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(57, 'EXAM_REPORT_LICENSE', 'Report License', 'สร้างรายงานใบประกอบ', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(58, 'STUDENT_ASSIGN_COURSE', 'Assign Student', 'เพิ่ม นศ.', 'ปฏิบัติ', '2026-02-13 18:26:30'),
(59, 'VIEW_ADMIN_DASHBOARD', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(60, 'USERS_MANAGEMENT', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(61, 'ROLES_MANAGEMENT', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(62, 'IMPORT_DATA', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(63, 'EXPORT_DATA', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(64, 'AUDIT_LOG', NULL, NULL, 'เลขา', '2026-02-14 16:35:11'),
(65, 'ADMIN_REPORTS', NULL, NULL, 'เลขา', '2026-02-14 16:35:48'),
(66, 'ADMIN_APPROVALS', NULL, NULL, 'เลขา', '2026-02-14 16:35:48'),
(67, 'SETTINGS', NULL, 'การตั้งค่า', 'ทุกคน', '2026-02-14 17:48:48'),
(68, 'VIEW_RETENTION', NULL, 'ดูอัตราการคงอยู่ต่างๆ', 'คณบดี', '2026-02-21 10:58:48'),
(69, 'ASSIGN_INSTRUCTORS', 'assign course to instructors', 'จัดการมอบหมายอาจารย์ผู้สอน', 'ผู้รับผิดชอบหลักสูตร', '2026-02-23 11:36:58');

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

--
-- Dumping data for table `position`
--

INSERT INTO `position` (`position_id`, `position_name`) VALUES
(1, 'คณบดี'),
(2, 'อาจารย์ประจำ/อาจารย์ประจำหลักสูตร'),
(3, 'อาจารย์ที่ปรึกษา'),
(4, 'อาจารย์ปฏิบัติ'),
(5, 'อาจารย์ผู้รับผิดชอบหลักสูตร'),
(6, 'อาจารย์ผู้รับผิดชอบโครงการ'),
(7, 'เลขา');

-- --------------------------------------------------------

--
-- Table structure for table `position_permission`
--

CREATE TABLE `position_permission` (
  `position_permission_id` bigint NOT NULL,
  `position_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `position_permission`
--

INSERT INTO `position_permission` (`position_permission_id`, `position_id`, `permission_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6),
(7, 1, 7),
(8, 1, 8),
(9, 1, 9),
(10, 1, 10),
(11, 1, 11),
(12, 1, 12),
(13, 2, 1),
(14, 2, 2),
(15, 2, 3),
(16, 2, 4),
(17, 2, 13),
(18, 2, 14),
(19, 2, 15),
(20, 2, 16),
(21, 2, 17),
(22, 2, 18),
(23, 2, 19),
(24, 2, 20),
(25, 2, 21),
(26, 2, 22),
(27, 2, 23),
(28, 3, 1),
(29, 3, 2),
(30, 3, 3),
(31, 3, 4),
(32, 3, 24),
(33, 3, 25),
(34, 3, 26),
(35, 3, 27),
(36, 3, 28),
(37, 3, 29),
(38, 3, 30),
(39, 3, 31),
(40, 3, 32),
(41, 3, 33),
(42, 4, 1),
(43, 4, 2),
(44, 4, 3),
(45, 4, 4),
(46, 4, 42),
(47, 4, 43),
(48, 4, 44),
(49, 4, 45),
(50, 4, 46),
(51, 4, 47),
(52, 4, 48),
(53, 4, 49),
(54, 4, 50),
(55, 4, 51),
(56, 4, 52),
(57, 4, 53),
(58, 4, 54),
(59, 4, 55),
(60, 4, 56),
(61, 4, 57),
(62, 4, 58),
(63, 5, 1),
(64, 5, 2),
(65, 5, 3),
(66, 5, 4),
(67, 5, 38),
(68, 5, 39),
(69, 5, 40),
(70, 5, 41),
(71, 6, 1),
(72, 6, 2),
(73, 6, 3),
(74, 6, 4),
(75, 6, 34),
(76, 6, 35),
(77, 6, 36),
(78, 6, 37),
(79, 7, 59),
(80, 7, 60),
(81, 7, 61),
(82, 7, 62),
(83, 7, 63),
(84, 7, 64),
(85, 7, 65),
(86, 7, 66),
(90, 7, 1),
(91, 7, 3),
(92, 1, 67),
(93, 2, 67),
(94, 3, 67),
(95, 4, 67),
(96, 5, 67),
(97, 6, 67),
(98, 7, 67),
(99, 1, 68),
(100, 5, 69);

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

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Teacher'),
(3, 'Student');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_permission_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`role_permission_id`, `role_id`, `permission_id`) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 1, 59),
(4, 1, 60),
(5, 1, 61),
(6, 1, 62),
(7, 1, 63),
(8, 1, 64),
(9, 1, 65),
(10, 1, 66),
(11, 1, 67),
(12, 2, 1),
(13, 2, 2),
(14, 2, 3),
(15, 2, 4),
(16, 2, 5),
(17, 2, 6),
(18, 2, 7),
(19, 2, 8),
(20, 2, 9),
(21, 2, 10),
(22, 2, 11),
(23, 2, 12),
(24, 2, 13),
(25, 2, 14),
(26, 2, 15),
(27, 2, 16),
(28, 2, 17),
(29, 2, 18),
(30, 2, 19),
(31, 2, 20),
(32, 2, 21),
(33, 2, 22),
(34, 2, 23),
(35, 2, 24),
(36, 2, 25),
(37, 2, 26),
(38, 2, 27),
(39, 2, 28),
(40, 2, 29),
(41, 2, 30),
(42, 2, 31),
(43, 2, 32),
(44, 2, 33),
(45, 2, 34),
(46, 2, 35),
(47, 2, 36),
(48, 2, 37),
(49, 2, 38),
(50, 2, 39),
(51, 2, 40),
(52, 2, 41),
(53, 2, 42),
(54, 2, 43),
(55, 2, 44),
(56, 2, 45),
(57, 2, 46),
(58, 2, 47),
(59, 2, 48),
(60, 2, 49),
(61, 2, 50),
(62, 2, 51),
(63, 2, 52),
(64, 2, 53),
(65, 2, 54),
(66, 2, 55),
(67, 2, 56),
(68, 2, 57),
(69, 2, 58),
(70, 2, 59),
(71, 2, 60),
(72, 2, 61),
(73, 2, 62),
(74, 2, 63),
(75, 2, 64),
(76, 2, 65),
(77, 2, 66),
(78, 2, 67);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` bigint NOT NULL,
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

INSERT INTO `student` (`student_id`, `position_id`, `instructor_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `year`, `gpa`, `birth_date`, `email`, `phone`, `status`, `graduation_date`, `retire_date`, `description`, `created_at`, `updated_at`) VALUES
(6603400001, NULL, NULL, 'นางสาว', 'ญาณันธร', 'โอนอิง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400002, NULL, NULL, 'นางสาว', 'จุรีพร', 'ผลพรต', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400004, NULL, NULL, 'นางสาว', 'ศิริพรรณ', 'ทองอ่อน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400005, NULL, NULL, 'นางสาว', 'ตะวัน', 'รีฮุง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400006, NULL, NULL, 'นางสาว', 'บัณฑิตา', 'ยุดา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400007, NULL, NULL, 'นางสาว', 'ประภาภรณ์', 'จงเจริญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400008, NULL, NULL, 'นางสาว', 'ปวีณา', 'ม่วงชุ่ม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400009, NULL, NULL, 'นางสาว', 'ศินาภรณ์', 'ทองเชิด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400010, NULL, NULL, 'นางสาว', 'กฤตพร', 'รุณรังษี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400011, NULL, NULL, 'ว่าที่ร้อยตรีหญิง', 'ปวีณา', 'เย็นขาว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400012, NULL, NULL, 'นางสาว', 'ศรุตา', 'พันธ์ครู', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400013, NULL, NULL, 'นางสาว', 'ภัคธีมา', 'โลหิตานนท์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400014, NULL, NULL, 'นาย', 'พิพัฒน์', 'คุโนภาต', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400015, NULL, NULL, 'นางสาว', 'ณัฐชา', 'พิณราช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400016, NULL, NULL, 'นาย', 'ณัฐสิทธิ์', 'ปัญญาอุทัย', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400017, NULL, NULL, 'นางสาว', 'จิราวัช', 'พระนา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400018, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'เรืองเดช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400019, NULL, NULL, 'นางสาว', 'ฐานวดี', 'ปุนมาปัด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400020, NULL, NULL, 'นางสาว', 'สุธาสินี', 'สาธุชาติ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400021, NULL, NULL, 'นางสาว', 'ณัฐนันท์', 'ศรีม่วง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400022, NULL, NULL, 'นางสาว', 'โยษิตา', 'จิตรีชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400023, NULL, NULL, 'นางสาว', 'กมลทิพย์', 'อาลัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400024, NULL, NULL, 'นาย', 'มารุต', 'กรุณา', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400025, NULL, NULL, 'นางสาว', 'ณรินทร์ดา', 'วงค์บุญมา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400026, NULL, NULL, 'นางสาว', 'วรัญญา', 'บุญเชิญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400027, NULL, NULL, 'นางสาว', 'กุสุมา', 'สมแวง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400028, NULL, NULL, 'นางสาว', 'จิรฐา', 'พิทักษา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400029, NULL, NULL, 'นางสาว', 'วิลาลักษณ์', 'กล่อมใจ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400030, NULL, NULL, 'นาย', 'นพเกล้า', 'นพพันธ์ศิริ', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400031, NULL, NULL, 'นาย', 'ทัศนา', 'ขันตรี', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400032, NULL, NULL, 'นางสาว', 'สุนันญา', 'มะโนเเสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400033, NULL, NULL, 'นางสาว', 'ศศิวิมล', 'เพ็งอุดม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400034, NULL, NULL, 'นางสาว', 'ณัชชา', 'คุ้มคงกระจ่าง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400035, NULL, NULL, 'นางสาว', 'สุปรียา', 'ศรีละบุตร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400036, NULL, NULL, 'นางสาว', 'ศุภิกา', 'สว่างภพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400037, NULL, NULL, 'นางสาว', 'อรอมล', 'คุณสมบัติ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400038, NULL, NULL, 'นางสาว', 'ปรียานุช', 'ผ่านละคร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400039, NULL, NULL, 'นางสาว', 'ปาริสชา', 'ดอกพุดตาน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400040, NULL, NULL, 'นางสาว', 'นภัสนันท์', 'ดีประชีพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400041, NULL, NULL, 'นางสาว', 'ชลดา', 'อุคำ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400042, NULL, NULL, 'นางสาว', 'อริสา', 'บุญแยง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400044, NULL, NULL, 'นางสาว', 'เพ็ญพิชชา', 'รามศิริ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400046, NULL, NULL, 'นางสาว', 'นริศรา', 'ไทยอุดม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400047, NULL, NULL, 'นาย', 'รัชวัฒน์', 'สุรภีร์', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400048, NULL, NULL, 'นางสาว', 'ขนิษฐา', 'มุธุสิทธิ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400049, NULL, NULL, 'นางสาว', 'วนิชชา', 'นาสานนิวัฒน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400050, NULL, NULL, 'นางสาว', 'ดวงหทัย', 'บัวกล้า', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400051, NULL, NULL, 'นางสาว', 'ปาริชาต', 'เชื้อตาอ่อน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400052, NULL, NULL, 'นางสาว', 'จิราวรรณ', 'พุก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400053, NULL, NULL, 'นางสาว', 'อรนุช', 'เลี่ยนเพชร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400054, NULL, NULL, 'นางสาว', 'วราภรณ์', 'พุ่มแย้ม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400055, NULL, NULL, 'นางสาว', 'ธิดาพร', 'พิกุลทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400056, NULL, NULL, 'นางสาว', 'ณัฐพร', 'พุ่มไสว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400057, NULL, NULL, 'นางสาว', 'ศุภัชญา', 'โพธิ์ทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400058, NULL, NULL, 'นางสาว', 'สุกัญญา', 'ช่องงาม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400061, NULL, NULL, 'นางสาว', 'วิภาดา', 'คิดดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400062, NULL, NULL, 'นาย', 'ธนากร', 'โฆษิวากาญจน์', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400063, NULL, NULL, 'นางสาว', 'ชุติมา', 'หาทรัพย์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400064, NULL, NULL, 'นางสาว', 'ฐิติรัตน์', 'เหล่าสูง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400065, NULL, NULL, 'นางสาว', 'ฌานิศา', 'บุญพุฒ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400066, NULL, NULL, 'นางสาว', 'สิริญญา', 'คำชั่ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400067, NULL, NULL, 'นางสาว', 'ดวงรัตน์', 'ครุฑธา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400068, NULL, NULL, 'นางสาว', 'ณฐินี', 'สายจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400069, NULL, NULL, 'นางสาว', 'กัญชพร', 'สายแปง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400070, NULL, NULL, 'นางสาว', 'นฤมล', 'อ่อนทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400071, NULL, NULL, 'นางสาว', 'นฤมล', 'ทำลา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400072, NULL, NULL, 'นางสาว', 'สุชญา', 'ทองเนื้อแปด', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400073, NULL, NULL, 'นางสาว', 'ศิรประภา', 'เมาตะยา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400074, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'สุยังกูล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400075, NULL, NULL, 'นาย', 'จตุรวิทย์', 'สาแก้ว', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400076, NULL, NULL, 'นางสาว', 'พิลาสินี', 'จิตต์อุทัศน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400077, NULL, NULL, 'นางสาว', 'ธัญณิชา', 'ท่วมไธสง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400078, NULL, NULL, 'นางสาว', 'พิยดา', 'ม่วงสุข', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400079, NULL, NULL, 'นางสาว', 'น้ำมนต์', 'พงษ์บุบผา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400080, NULL, NULL, 'นางสาว', 'ณัฏฐณิชา', 'ภูมิกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400081, NULL, NULL, 'นางสาว', 'เพ็ญนภา', 'ชฎาแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400082, NULL, NULL, 'นางสาว', 'ณิชาพัฒน์', 'จำบุญ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400083, NULL, NULL, 'นางสาว', 'ศุกลภัทร', 'สุพรรณ์คำ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400084, NULL, NULL, 'นาย', 'ศตพล', 'เกษแก้ว', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400085, NULL, NULL, 'นางสาว', 'ดวงพร', 'อาศัยนา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400086, NULL, NULL, 'นางสาว', 'ญาณิน', 'ทินกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400087, NULL, NULL, 'นางสาว', 'ปพิชญา', 'พัวอุดมจินดากุล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400088, NULL, NULL, 'นางสาว', 'สาธิตา', 'ปลอดโปร่ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400090, NULL, NULL, 'นางสาว', 'ภัททิยา', 'บงภูเขียว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400091, NULL, NULL, 'นางสาว', 'ภัทรานิษฐ์', 'แก้ววิชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400092, NULL, NULL, 'นางสาว', 'ไปรยา', 'แสนแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400093, NULL, NULL, 'นางสาว', 'อนุธิดา', 'คำบุตรดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400094, NULL, NULL, 'นางสาว', 'ปาลิดา', 'กล่อมฤกษ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400095, NULL, NULL, 'นางสาว', 'วรรณพร', 'อะโนมา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400096, NULL, NULL, 'นางสาว', 'สุธาสินี', 'โคกวิไล', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400097, NULL, NULL, 'นางสาว', 'อรวรรณ', 'พาบุ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400098, NULL, NULL, 'นางสาว', 'สิริพรรณ', 'บุญช่วย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400099, NULL, NULL, 'นางสาว', 'กฤตยา', 'ปะสาวะเท', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400100, NULL, NULL, 'นางสาว', 'นฤมล', 'สรรพโภชน์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400102, NULL, NULL, 'นางสาว', 'วรัญญา', 'มีประเสริฐ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400104, NULL, NULL, 'นางสาว', 'นันทน์ณัฏฐ์', 'แซ่โซ้ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400105, NULL, NULL, 'นางสาว', 'รวิมล', 'ดวงคำจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400106, NULL, NULL, 'นางสาว', 'กาญจนา', 'ทะวาแสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400107, NULL, NULL, 'นางสาว', 'จิรวรรณ', 'พลชู', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400108, NULL, NULL, 'นางสาว', 'นภสร', 'อินภูวา', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400109, NULL, NULL, 'นางสาว', 'รุ่งนภา', 'ถวิลเดช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400110, NULL, NULL, 'นางสาว', 'วรัทยา', 'คำน้อย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400111, NULL, NULL, 'นางสาว', 'สุกัญญา', 'พรประไพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400112, NULL, NULL, 'นางสาว', 'โชษิตา', 'แม้นอินทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400113, NULL, NULL, 'นางสาว', 'สุภัชชา', 'งามเลิศ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400114, NULL, NULL, 'นางสาว', 'นฤมล', 'ขอดทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400115, NULL, NULL, 'นางสาว', 'พรพิมล', 'สังสีราช', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400116, NULL, NULL, 'นางสาว', 'เปรมิกา', 'โพธิ์ชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400117, NULL, NULL, 'นางสาว', 'นิลุบล', 'นนท์ลุ่น', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400118, NULL, NULL, 'นางสาว', 'นภารัตน์', 'ปุรัมภะ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400119, NULL, NULL, 'นางสาว', 'ธีมาพร', 'สุนทร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400120, NULL, NULL, 'นางสาว', 'ณัฐชา', 'ภูสีดวง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400121, NULL, NULL, 'นางสาว', 'ปวริศา', 'บุตรตะวงค์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400122, NULL, NULL, 'นางสาว', 'นฤมล', 'ขุนภักดี', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400123, NULL, NULL, 'นางสาว', 'กัญญาณัฐ', 'อินต๊ะสาร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400124, NULL, NULL, 'นางสาว', 'จิดาภา', 'ไชยสาร', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400125, NULL, NULL, 'นางสาว', 'จิดาภา', 'เชื้อทอง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400126, NULL, NULL, 'นางสาว', 'นิภาวรรณ', 'สืบทายาท', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400127, NULL, NULL, 'นางสาว', 'นริศรา', 'จวงกระโทก', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400128, NULL, NULL, 'นาย', 'ภาธร', 'ธงศรี', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400129, NULL, NULL, 'นาย', 'ประภวิษณุ์', 'พรหมบุตร', NULL, NULL, 'male', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400130, NULL, NULL, 'นางสาว', 'ดวงแข', 'สลับแสง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400132, NULL, NULL, 'นางสาว', 'ศิริญญา', 'สุภาพ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400133, NULL, NULL, 'นางสาว', 'ภคมน', 'เชื้อคำเพ็ง', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400134, NULL, NULL, 'นางสาว', 'กรนันท์', 'นันทเสน', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400135, NULL, NULL, 'นางสาว', 'ปรีณาพรรณ', 'ภานุวัฒนวงศ์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400136, NULL, NULL, 'นางสาว', 'หทัยรัตน์', 'ชุมจันทร์', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400137, NULL, NULL, 'นางสาว', 'ชมพูนุช', 'ลาพรม', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400138, NULL, NULL, 'นางสาว', 'ฐิติณัชชา', 'ลาดแก้ว', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400139, NULL, NULL, 'นางสาว', 'โสภิตา', 'แสวงกิจ', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6603400140, NULL, NULL, 'นางสาว', 'ศรีวิกา', 'โรจน์เจริญชัย', NULL, NULL, 'female', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subject_id`, `subject_code`, `subject_name_th`, `subject_name_en`, `credit`, `program_id`, `department`, `section_id`, `subject_group_id`, `select_subject_id`) VALUES
(1, 'NS101', 'การพยาบาลพื้นฐาน', 'Fundamental of Nursing', 3, 1, NULL, NULL, NULL, NULL),
(2, 'NS102', 'กายวิภาคศาสตร์และสรีรวิทยา', 'Anatomy and Physiology', 3, 1, NULL, NULL, NULL, NULL);

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
-- Table structure for table `system_sidebar_menus`
--

CREATE TABLE `system_sidebar_menus` (
  `menu_id` bigint NOT NULL,
  `title` varchar(100) NOT NULL COMMENT 'ชื่อเมนูที่แสดงผล',
  `url` varchar(100) NOT NULL COMMENT 'Key หรือ URL สำหรับ Frontend (เช่น course-students)',
  `icon` varchar(50) DEFAULT 'BookOpen' COMMENT 'ชื่อ Icon จาก Lucide React (เช่น Bell, Users)',
  `permission_required` varchar(100) DEFAULT NULL COMMENT 'ชื่อสิทธิ์ที่ต้องมีถึงจะเห็นเมนูนี้ (ตรงกับ permissions.name)',
  `section_title` varchar(100) DEFAULT NULL COMMENT 'กลุ่มของเมนู (เช่น การจัดการเรียนการสอน, งานหลักสูตร)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'สถานะเปิด/ปิดเมนู'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `system_sidebar_menus`
--

INSERT INTO `system_sidebar_menus` (`menu_id`, `title`, `url`, `icon`, `permission_required`, `section_title`, `is_active`) VALUES
(1, 'แดชบอร์ด Admin', 'dashboard', 'AdminDashboard', 'VIEW_ADMIN_DASHBOARD', 'จัดการระบบ', 1),
(2, 'จัดการข้อมูลระบบ', 'roles-management', 'Shield', 'USERS_MANAGEMENT', 'จัดการระบบ', 1),
(3, 'จัดการข้อมูลระบบ', 'users-management', 'Users', 'ROLES_MANAGEMENT', 'จัดการระบบ', 1),
(4, 'นำเข้าข้อมูล', 'import-data', 'Upload', 'IMPORT_DATA', 'ข้อมูล', 1),
(5, 'ส่งออกข้อมูล', 'export-data', 'Download', 'EXPORT_DATA', 'ข้อมูล', 1),
(6, 'Audit Log', 'audit-log', 'ClipboardList', 'AUDIT_LOG', 'ข้อมูล', 1),
(7, 'รายงาน', 'reports', 'FileText', 'ADMIN_REPORTS', 'ข้อมูล', 1),
(8, 'อนุมัติคำขอ', 'approvals', 'CheckSquare', 'ADMIN_APPROVALS', 'ข้อมูล', 1),
(9, 'แดชบอร์ด KPI', 'dean-dashboard', 'LayoutDashboard', 'VIEW_DEAN_DASHBOARD', 'จัดการระบบ', 1),
(10, 'อัตราคงอยู่', 'retention', 'UserCheck', 'VIEW_RETENTION', 'จัดการระบบ', 1),
(11, 'รายงาน PLO/YLO', 'plo-ylo-report', 'TrendingUp', 'CURRICULUM_REPORT_VIEW', 'งานหลักสูตร', 1),
(12, 'สรุปข้อมูล 5 ปี', 'five-year-summary', 'CalendarDays', 'COURSE_EXPORT_5YEAR', 'งานหลักสูตร', 1),
(13, 'จัดการอาจารย์ผู้สอน', 'assign-instructors', 'UserCheck', 'ASSIGN_INSTRUCTORS', 'งานหลักสูตร', 1),
(14, 'รายงานรายวิชา', 'course-report', 'CalendarDays', 'COURSE_REPORT_CREATE', 'งานหลักสูตร', 1),
(15, 'CLO Map', 'clo-map', 'UserCheck', 'CLO_DEFINE', 'งานหลักสูตร', 1),
(16, 'อัปโหลดเอกสาร', 'documents', 'UserCheck', 'RESEARCH_UPLOAD', 'งานหลักสูตร', 1),
(17, 'การแจ้งเตือน', 'notifications', 'Bell', 'NOTIFICATION_VIEW', 'ระบบทั่วไป', 1),
(18, 'ข้อมูลส่วนตัว', 'profile', 'User', 'PROFILE_VIEW', 'ระบบทั่วไป', 1),
(19, 'การตั้งค่า', 'settings', 'Settings', 'SETTINGS', 'ระบบทั่วไป', 1);

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

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `role_id`, `created_at`) VALUES
(1, '6603400001', '$2y$10$W68TSe8x0O9Jf/1A35UBQOKJqkoiSrngXhd3Ol.ewbocGr9m5LYpu', 3, '2026-02-02 09:35:39'),
(2, '41172008', '$2y$10$1IxE2ty86S1hAFqpiFBKG.v56oK73t.p9Cy.qoNipxrvIMxkTpBEm', 2, '2026-02-02 10:13:06'),
(3, '42172021', '$2y$10$bJy3Lgxp.IuluGEUSMSUkeugFjAPf2f2nWW/CNFBYplLFxM59IRUm', 2, '2026-02-12 22:02:38'),
(4, '41172011', '$2y$10$3K1ZE8cjAfEJKOeV1CrjJ.XzEObB75V3KBpWjDk/X6DaCg1ihyaiC', 2, '2026-02-14 03:47:25'),
(5, '46172040', '$2y$10$pTXswbeD91ynKGtWQIUSaukCVAq1NjinsVSBpKcuuUMRNgDZx.fU2', 1, '2026-02-14 16:13:36'),
(6, '41172017', '$2y$10$Ufr2JcYXlZYwjZtyhrObweBjW2wFA85DddGRR15iOA7rGkWpn0uX6', 2, '2026-02-14 18:02:44');

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

--
-- Dumping data for table `user_position`
--

INSERT INTO `user_position` (`user_position_id`, `user_id`, `position_id`, `is_primary`, `effective_from`, `effective_to`) VALUES
(1, 4, 5, 1, NULL, NULL),
(2, 5, 7, 1, NULL, NULL),
(3, 6, 1, 1, NULL, NULL);

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
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `clo_ibfk_2` (`ylo_id`);

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
  ADD PRIMARY KEY (`faculty_id`);

--
-- Indexes for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `import_history`
--
ALTER TABLE `import_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

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
  ADD KEY `position_permission_ibfk_1` (`position_id`),
  ADD KEY `position_permission_ibfk_2` (`permission_id`);

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
-- Indexes for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `idx_permission` (`permission_required`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

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
  MODIFY `clo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `faculty_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66712148;

--
-- AUTO_INCREMENT for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  MODIFY `record_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `import_history`
--
ALTER TABLE `import_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `other_degree`
--
ALTER TABLE `other_degree`
  MODIFY `degree_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permissions_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

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
  MODIFY `position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `position_permission`
--
ALTER TABLE `position_permission`
  MODIFY `position_permission_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10298;

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
  MODIFY `role_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `role_permission_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

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
  MODIFY `subject_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  MODIFY `menu_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_position`
--
ALTER TABLE `user_position`
  MODIFY `user_position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `clo`
--
ALTER TABLE `clo`
  ADD CONSTRAINT `clo_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `clo_ibfk_2` FOREIGN KEY (`ylo_id`) REFERENCES `ylo` (`ylo_id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD CONSTRAINT `faculty_ce_records_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
  ADD CONSTRAINT `position_permission_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `position_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permissions_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
-- Constraints for table `user_position`
--
ALTER TABLE `user_position`
  ADD CONSTRAINT `user_position_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
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
