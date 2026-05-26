-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: May 25, 2026 at 01:48 PM
-- Server version: 9.7.0
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
  `action_type` enum('create','update','delete','login','logout','role_change') DEFAULT 'update',
  `resource` varchar(100) DEFAULT 'ระบบ',
  `details` text COMMENT 'รายละเอียดการกระทำ',
  `ip_address` varchar(45) DEFAULT '127.0.0.1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'ทำเมื่อไหร่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`audit_log_id`, `user_id`, `action_type`, `resource`, `details`, `ip_address`, `created_at`) VALUES
(1, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-23 16:56:10'),
(2, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 11:52:16'),
(3, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:26:04'),
(4, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:31:43'),
(5, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:43:19'),
(6, 8, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:52:26'),
(7, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:53:02');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_framework`
--

CREATE TABLE `curriculum_framework` (
  `id` int NOT NULL,
  `curriculum_year` int DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `mapping_json` text,
  `is_active` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_framework`
--

INSERT INTO `curriculum_framework` (`id`, `curriculum_year`, `program_name`, `mapping_json`, `is_active`, `created_at`) VALUES
(1, 2567, 'หลักสูตรพยาบาลศาสตรบัณฑิต', '{\"clos\": [{\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": 5.2}], \"subject_code\": \"103-111\", \"subject_name\": \"ภาษาอังกฤษพื้นฐาน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": 5.2}], \"subject_code\": \"103-112\", \"subject_name\": \"การสื่อสารภาษาอังกฤษในชีวิตประจำวัน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}], \"subject_code\": \"103-201\", \"subject_name\": \"ทักษะดิจิทัลสำหรับศตวรรษที่ 21\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}], \"subject_code\": \"103-202\", \"subject_name\": \"การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่องจักรเบื้องต้น\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}], \"subject_code\": \"103-301\", \"subject_name\": \"หลักปรัชญาของเศรษฐกิจพอเพียงเพื่อการพัฒนาที่ยั่งยืน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"103-302\", \"subject_name\": \"การออกแบบการคิดเพื่อสร้างนวัตกรรมฯ\"}, {\"plo_mappings\": [], \"subject_code\": \"103-302\", \"subject_name\": \"การออกแบบการคิดเพื่อสร้างนวัตกรรมและธุรกิจใหม่\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}], \"subject_code\": \"170-108\", \"subject_name\": \"ชีวเคมี\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}], \"subject_code\": \"170-112\", \"subject_name\": \"กายวิภาคศาสตร์และสรีรวิทยาฯ 1\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}], \"subject_code\": \"170-113\", \"subject_name\": \"กายวิภาคศาสตร์และสรีรวิทยาฯ 2\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}], \"subject_code\": \"170-201\", \"subject_name\": \"พยาธิสรีรวิทยาของมนุษย์\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}], \"subject_code\": \"170-208\", \"subject_name\": \"จุลชีววิทยาและปรสิตวิทยาของมนุษย์\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-216\", \"subject_name\": \"เภสัชวิทยาทางการพยาบาล\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}], \"subject_code\": \"170-224\", \"subject_name\": \"ชีวสถิติทางสุขภาพ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-228\", \"subject_name\": \"พัฒนาการมนุษย์และการสร้างเสริมสุขภาพ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": 8.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-229\", \"subject_name\": \"โภชนบำบัด\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}], \"subject_code\": \"170-211\", \"subject_name\": \"การพยาบาลพื้นฐาน 1\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}], \"subject_code\": \"170-212\", \"subject_name\": \"การพยาบาลพื้นฐาน 2\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": 5.2}], \"subject_code\": \"170-222\", \"subject_name\": \"จรรยาบรรณวิชาชีพการพยาบาลและกฎหมายที่เกี่ยวข้อง\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}], \"subject_code\": \"170-226\", \"subject_name\": \"การพยาบาลผู้ใหญ่\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 8.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-227\", \"subject_name\": \"มโนมติ ทฤษฎีฯ และบริการด้วยหัวใจ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}], \"subject_code\": \"170-230\", \"subject_name\": \"กระบวนการพยาบาลและการประเมินภาวะสุขภาพ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}], \"subject_code\": \"170-231\", \"subject_name\": \"การประยุกต์ใช้ AI และเทคโนโลยีดิจิทัล\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-324\", \"subject_name\": \"การพยาบาลผู้สูงอายุ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-348\", \"subject_name\": \"การพยาบาลเด็กและวัยรุ่น\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-349\", \"subject_name\": \"การพยาบาลวิกฤตและฉุกเฉิน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-350\", \"subject_name\": \"การพยาบาลสุขภาพจิตและจิตเวชศาสตร์\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-351\", \"subject_name\": \"การพยาบาลมารดาและทารก\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-352\", \"subject_name\": \"การผดุงครรภ์\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-353\", \"subject_name\": \"การพยาบาลอนามัยชุมชน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": 6.2}], \"subject_code\": \"170-354\", \"subject_name\": \"กระบวนการวิจัยทางวิชาชีพ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}], \"subject_code\": \"170-448\", \"subject_name\": \"การรักษาพยาบาลเบื้องต้น\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-457\", \"subject_name\": \"ภาวะผู้นำและการบริหารทางการพยาบาล\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}], \"subject_code\": \"170-232\", \"subject_name\": \"ปฏิบัติการพยาบาลพื้นฐาน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}], \"subject_code\": \"170-327\", \"subject_name\": \"ปฏิบัติการสุขภาพจิตและจิตเวชศาสตร์\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-331\", \"subject_name\": \"ปฏิบัติการพยาบาลเด็กและวัยรุ่น\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-337\", \"subject_name\": \"ปฏิบัติการพยาบาลมารดาและทารก\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-338\", \"subject_name\": \"ปฏิบัติการผดุงครรภ์ 1\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-339\", \"subject_name\": \"ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-340\", \"subject_name\": \"ปฏิบัติการพยาบาลผู้ป่วยวิกฤตและฉุกเฉิน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-355\", \"subject_name\": \"ปฏิบัติการพยาบาลอนามัยชุมชน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"2.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.3}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}], \"subject_code\": \"170-431\", \"subject_name\": \"ปฏิบัติการผดุงครรภ์ 2\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-449\", \"subject_name\": \"ปฏิบัติการรักษาพยาบาลเบื้องต้น\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-458\", \"subject_name\": \"ปฏิบัติการจัดการพยาบาล\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.2\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}, {\"weight\": 1, \"sub_plo_id\": \"5.1\"}, {\"weight\": 1, \"sub_plo_id\": 5.2}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": 6.2}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}, {\"weight\": 1, \"sub_plo_id\": 8.3}], \"subject_code\": \"170-459\", \"subject_name\": \"ปฏิบัติการพยาบาลรวบยอดวิกฤตและฉุกเฉิน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}], \"subject_code\": \"170-116\", \"subject_name\": \"การดูแลสุขภาพแบบผสมผสาน\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"6.1\"}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}], \"subject_code\": \"170-117\", \"subject_name\": \"การดูแลสุขภาพความงามแบบองค์รวม\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": \"7.1\"}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-233\", \"subject_name\": \"การดูแลสุขภาวะผู้สูงอายุกลุ่มเปราะบาง\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": 6.3}, {\"weight\": 1, \"sub_plo_id\": 7.2}, {\"weight\": 1, \"sub_plo_id\": \"8.1\"}, {\"weight\": 1, \"sub_plo_id\": 8.2}], \"subject_code\": \"170-234\", \"subject_name\": \"นันทนาการเพื่อส่งเสริมพัฒนาการเด็กฯ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": \"1.3\"}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}, {\"weight\": 1, \"sub_plo_id\": 3.2}, {\"weight\": 1, \"sub_plo_id\": \"4.1\"}], \"subject_code\": \"170-346\", \"subject_name\": \"นวัตกรรมทางสุขภาพ\"}, {\"plo_mappings\": [{\"weight\": 1, \"sub_plo_id\": \"1.1\"}, {\"weight\": 1, \"sub_plo_id\": 2.2}, {\"weight\": 1, \"sub_plo_id\": \"3.1\"}], \"subject_code\": \"170-347\", \"subject_name\": \"การปฐมพยาบาลและการช่วยฟื้นคืนชีพ\"}], \"plos\": [{\"plo_id\": \"PLO1\", \"plo_name\": \"PLO 1: ประยุกต์ความรู้และสาระสำคัญของศาสตร์ทางวิชาชีพการพยาบาลและการผดุงครรภ์ และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\", \"sub_plos\": [{\"id\": \"1.1\", \"desc\": \"มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย\"}, {\"id\": \"1.2\", \"desc\": \"มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต\"}, {\"id\": \"1.3\", \"desc\": \"ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต\"}], \"ylo_descriptions\": {\"year_1\": \"ใช้ความรู้ศาสตร์ที่เกี่ยวข้องพัฒนาการมนุษย์ทุกช่วงวัย\", \"year_2\": \"พื้นฐานทางวิชาชีพ ทางเลือกในการดูแลสุขภาพ, ใช้ศาสตร์พื้นฐานทางวิชาชีพในการดูแลสุขภาพ \", \"year_3\": \"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยทั่วไป\", \"year_4\": \"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยวิกฤตและบูรณาการศาสตร์ทางการพยาบาลทุกระดับ\"}}, {\"plo_id\": \"PLO2\", \"plo_name\": \"PLO 2: ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยเพื่อความปลอดภัยของผู้รับบริการ\", \"sub_plos\": [{\"id\": \"2.1\", \"desc\": \"ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\"}, {\"id\": \"2.2\", \"desc\": \"จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม\"}, {\"id\": \"2.3\", \"desc\": \"ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้\"}], \"ylo_descriptions\": {\"year_1\": \"ไม่มี\", \"year_2\": \"ปฏิบัติการพยาบาลพื้นฐานในการดูแลผู้ป่วยทั่วไปโดยใช้กระบวนการพยาบาลภายใต้กฎหมายและจรรยาบรรณวิชาชีพ\", \"year_3\": \"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยซับซ้อนโดยใช้กระบวนการพยาบาล\", \"year_4\": \"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยวิกฤตโดยใช้กระบวนการพยาบาล\"}}, {\"plo_id\": \"PLO3\", \"plo_name\": \"PLO 3: พัฒนานวัตกรรมทางสุขภาพโดยประยุกต์กระบวนการวิจัยและเทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\", \"sub_plos\": [{\"id\": \"3.1\", \"desc\": \"นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้\"}, {\"id\": \"3.2\", \"desc\": \"ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\"}], \"ylo_descriptions\": {\"year_1\": \"มีความรู้พื้นฐานทางเทคโนโลยีและสารสนเทศ\", \"year_2\": \"มีความรู้ในการสร้างนวัตกรรมเบื้องต้น\", \"year_3\": \"สามารถสืบค้นข้อมูล วิเคราะห์แหล่งข้อมูลที่น่าเชื่อถือ และออกแบบการสร้างนวัตกรรมทางสุขภาพในแต่ละสาขาวิชา\", \"year_4\": \"บูรณาการการวิจัยและนวัตกรรมและส่งผลงานเข้าร่วมนำเสนอ\"}}, {\"plo_id\": \"PLO4\", \"plo_name\": \"PLO 4: ประยุกต์ใช้ดิจิทัลในการจัดการพยาบาลได้อย่างเหมาะสม\", \"sub_plos\": [{\"id\": \"4.1\", \"desc\": \"สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง\"}], \"ylo_descriptions\": {\"year_1\": \"ไม่มี\", \"year_2\": \"มีความรู้พื้นฐานดิจิทัล\", \"year_3\": \"มีความรู้ด้านดิจิทัลทางการพยาบาล\", \"year_4\": \"ประยุกต์ดิจิทัลทางการพยาบาลมาใช้ในการดูแลผู้ป่วย\"}}, {\"plo_id\": \"PLO5\", \"plo_name\": \"PLO 5: สื่อสารด้วยภาษาไทยและภาษาอังกฤษได้อย่างมีประสิทธิภาพ\", \"sub_plos\": [{\"id\": \"5.1\", \"desc\": \"ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทีมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ\"}, {\"id\": \"5.2\", \"desc\": \"ใช้ภาษาอังกฤษในการสื่อสารกับทีมสุขภาพและผู้รับบริการได้\"}], \"ylo_descriptions\": {\"year_1\": \"สามารถสื่อสารภาษาไทยภาษาอังกฤษได้\", \"year_2\": \"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล -เข้าใจศัพท์พื้นฐานทางการแพทย์\", \"year_3\": \"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ  และหน่วยงานที่เกี่ยวข้อง -สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\", \"year_4\": \"ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ และหน่วยงานที่เกี่ยวข้อง สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\"}}, {\"plo_id\": \"PLO6\", \"plo_name\": \"PLO 6: แสดงออกถึงการมีจริยธรรมและทัศนคติที่ดีต่อวิชาชีพ มีจิตสาธารณะ และมีพฤติกรรมบริการที่เป็นที่ยอมรับ\", \"sub_plos\": [{\"id\": \"6.1\", \"desc\": \"แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ\"}, {\"id\": \"6.2\", \"desc\": \"ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ\"}, {\"id\": \"6.3\", \"desc\": \"สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\"}], \"ylo_descriptions\": {\"year_1\": \"-มีจิตสาธารณะบำเพ็ญประโยชน์เพื่อสังคม -สามารถปรับตัวเข้ากับสังคมและสิ่งแวดล้อมใหม่\", \"year_2\": \"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสม -ปฏิบัติงานด้วยตรงต่อเวลา มีความรับผิดชอบ -สามารถปรับตัวเข้าสู่วิชาชีพได้\", \"year_3\": \"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\", \"year_4\": \"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ และมีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่ซับซ้อน -มีพฤติกรรมบริการเป็น-ที่ยอมรับของผู้รับ\"}}, {\"plo_id\": \"PLO7\", \"plo_name\": \"PLO 7: แสดงออกถึงการเรียนรู้ด้วยตนเองอย่างต่อเนื่อง\", \"sub_plos\": [{\"id\": \"7.1\", \"desc\": \"แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง\"}, {\"id\": \"7.2\", \"desc\": \"สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม\"}], \"ylo_descriptions\": {\"year_1\": \"สามารถศึกษาค้นคว้าข้อมูลจากแหล่งข้อมูลต่าง ๆ\", \"year_2\": \"สามารถศึกษาค้นคว้าข้อมูลทางการพยาบาลจากแหล่งข้อมูลต่าง ๆ และวิเคราะห์ข้อมูลเบื้องต้น\", \"year_3\": \"สามารถนำข้อมูลทางการพยาบาลมาวางแผนการพยาบาล\", \"year_4\": \"สามารถเลือกและประยุกต์องค์ความรู้ทางการพยาบาลมาใช้วางแผนการพยาบาลตามสถานการณ์ที่หลากหลาย\"}}, {\"plo_id\": \"PLO8\", \"plo_name\": \"PLO 8: เข้าใจหลักการ การดำเนินการ การเป็นผู้ประกอบการที่เกี่ยวกับการพยาบาลและการผดุงครรภ์ได้\", \"sub_plos\": [{\"id\": \"8.1\", \"desc\": \"ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน\"}, {\"id\": \"8.2\", \"desc\": \"ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้\"}, {\"id\": \"8.3\", \"desc\": \"สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้\"}], \"ylo_descriptions\": {\"year_1\": \"-\", \"year_2\": \"-\", \"year_3\": \"ประเมินความต้องการบริการสุขภาพของบุคคลและครอบครัวได้\", \"year_4\": \"-ประเมินความต้องการบริการสุขภาพของบุคคล ครอบครัว และชุมชนได้ -ออกแบบบริการการพยาบาลและการผดุงครรภ์ในการเป็นผู้ประกอบการได้\"}}], \"program_name\": \"หลักสูตรพยาบาลศาสตรบัณฑิต (ฉบับปรับปรุง)\", \"curriculum_year\": 2567}', 1, '2026-02-09 13:44:39');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
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

INSERT INTO `faculty` (`faculty_id`, `user_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `birth_date`, `license_no`, `member_no`, `email`, `phone`, `start_date`, `status`, `description`, `created_at`) VALUES
(41172008, 2, 'นาง', 'จรัสดาว', 'เรโนลด์', 'Jaratdao', NULL, 'female', '1968-04-15', '4511059407', NULL, NULL, NULL, '1998-03-15', NULL, 'มี 2 นามสกุล', NULL),
(41172011, 4, 'นางสาว', 'พิชาภรณ์ ', 'จันทนกุล', 'Pichaporn', 'Janthanakul', 'female', '1972-07-27', '4511036515', '50436', NULL, NULL, '1998-06-01', NULL, NULL, NULL),
(41172017, 6, 'นางสาว', 'อรทิพา', 'ส่องศิริ', 'Orntipa', 'Songsiri', 'female', '1951-07-22', '4511016150', NULL, NULL, NULL, '1994-10-01', NULL, NULL, NULL),
(42172021, 3, 'นาง', 'วัฒนีย์ ', 'ปานจินดา', 'Wattanee', 'Panjinda', 'female', '1955-08-17', '4511077074', 'อ.1/1710', NULL, NULL, '1999-01-01', NULL, NULL, NULL),
(42172025, NULL, 'นาง', 'ปรียธิดา', 'ชลศึกเสนีย์', NULL, NULL, 'female', '1966-07-31', '4511055442', NULL, NULL, NULL, '1999-07-01', NULL, NULL, NULL),
(44172033, NULL, 'นางสาว', 'ภัทรพร', 'อรัณยภาค', NULL, 'Arunyaphaga', 'female', '1953-02-16', '4511016607', NULL, NULL, NULL, '2001-10-16', NULL, 'ชื่อภัทรา หรือ ภัทรพร', NULL),
(45172037, NULL, 'นาง', 'สุสารี', 'ประคินกิจ', 'Susaree', 'Prakhinkit', 'female', '1975-01-25', '4511005639', NULL, NULL, NULL, '2002-11-01', NULL, NULL, NULL),
(46172038, NULL, 'นางสาว', 'สมฤดี', 'ชื่นกิติญานนท์', NULL, NULL, 'female', '1975-05-09', '4611093778', NULL, NULL, NULL, '2002-12-01', NULL, NULL, NULL),
(46172040, 5, 'พ.จ.อ.', 'ภูมเดชา', 'ชาญเบญจพิภู', NULL, NULL, 'male', '1964-04-07', '4521050682', NULL, NULL, NULL, '2003-03-01', NULL, NULL, NULL),
(47172044, NULL, 'นาง', 'สุวรรณา', 'เชียงขุนทด', 'Suwanna', NULL, 'female', '1973-02-01', '4511007784', NULL, NULL, NULL, '2004-05-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(47172046, NULL, 'นาง', 'วารุณี', 'เพไร', 'Warunee', NULL, 'female', '1976-08-06', '4711186486', '47789', NULL, NULL, '2004-06-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(47172047, NULL, 'นางสาว', 'ชนิดา', 'มัททวางกูร', 'Chanida', 'Mattavangkul', 'female', '1971-09-21', '4511069513', NULL, NULL, NULL, '2004-07-01', NULL, NULL, NULL),
(47172049, NULL, 'นางสาว', 'ศนิกานต์', 'ศรีมณี', NULL, NULL, 'female', '1975-03-01', '4511078893', NULL, NULL, NULL, '2004-10-01', NULL, NULL, NULL),
(49172053, NULL, 'นาง', 'พรพิมล', 'ภูมิฤทธิกุล', NULL, NULL, 'female', '1959-04-20', '5511168672', NULL, NULL, NULL, '2006-03-16', NULL, NULL, NULL),
(49172054, NULL, 'นางสาว', 'สุนันทา', 'บุญรักษา', NULL, NULL, 'female', '1975-05-10', '5311108587', NULL, NULL, NULL, '2006-08-01', NULL, NULL, NULL),
(51172062, NULL, 'นางสาว', 'เพ็ญรุ่ง', 'นวลแจ่ม', NULL, NULL, 'female', '1973-01-20', '6611103761', '76117', NULL, NULL, '2008-08-01', NULL, NULL, NULL),
(52172066, NULL, 'นาง', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharnthip', 'Jirakanjana', 'female', '1975-02-15', '4511034476', NULL, NULL, NULL, '2009-11-01', NULL, NULL, NULL),
(54172071, NULL, 'นางสาว', 'วราภรณ์', 'คำรศ', 'Waraporn', 'Khamros', 'female', '1983-08-09', '6411198208', '115533', NULL, NULL, '2010-12-01', NULL, NULL, NULL),
(54172075, NULL, 'นางสาว', 'สิริณัฐ', 'สินวรรณกุล', 'Sirinut', 'Sinvonnagul', 'female', '1969-09-11', '4511070793', NULL, NULL, NULL, '2010-09-01', NULL, NULL, NULL),
(54172078, NULL, 'รอ.หญิง', 'วิภานันท์', 'ม่วงสกุล', 'Wipanun', 'Muangsakul', 'female', '1977-04-27', '4711178169', NULL, NULL, NULL, '2011-05-01', NULL, NULL, NULL),
(54172084, NULL, 'นางสาว', 'ธัญลักษณ์วดี', 'ก้อนทองถม', NULL, NULL, 'female', '1986-09-15', '5211209369', '137583', NULL, NULL, '2011-10-01', NULL, NULL, NULL),
(54172085, NULL, 'นางสาว', 'อัมพร', 'คงจีระ', 'Amporn', 'Kongjeera', 'female', '1951-04-16', '4511002485', NULL, NULL, NULL, '2011-12-01', NULL, NULL, NULL),
(56172088, NULL, 'นาง', 'วิวรรณา', 'คล้ายคลึง', NULL, NULL, 'female', '1973-10-07', '4511013331', '55314', NULL, NULL, '2013-03-01', NULL, NULL, NULL),
(56172089, NULL, 'นางสาว', 'สุจิตราภรณ์', 'ทับครอง', NULL, NULL, 'female', '1965-10-02', '4511050062', NULL, NULL, NULL, '2013-05-01', NULL, NULL, NULL),
(56172103, NULL, 'นางสาว', 'รัฐกานต์', 'ขำเขียว', NULL, NULL, 'female', '1984-12-10', '5111205212', NULL, NULL, NULL, '2013-07-01', NULL, NULL, NULL),
(56172104, NULL, 'นางสาว', 'ณิชมล', 'ขวัญเมือง', NULL, NULL, 'female', '1972-03-19', '5011200055', '47562', NULL, NULL, '2013-07-01', NULL, NULL, NULL),
(57172108, NULL, 'นางสาว', 'นฤมล', 'อังศิริศักดิ์', NULL, NULL, 'female', '1985-02-04', '5011200055', '126375', NULL, NULL, '2014-04-01', NULL, NULL, NULL),
(57172109, NULL, 'นางสาว', 'ดวงกมล', 'วิรุฬห์อุดมผล', NULL, NULL, 'female', '1966-04-22', '5711254926', NULL, NULL, NULL, '2014-06-01', NULL, NULL, NULL),
(58172110, NULL, 'นางสาว', 'สุกฤตา', 'ตะการีย์', NULL, NULL, 'female', '1980-01-26', '4811193884', '115510', NULL, NULL, '2015-01-15', NULL, NULL, NULL),
(58172114, NULL, 'นางสาว', 'ศิริพร', 'สามสี', 'Siriporn', 'Samsri', 'female', '1969-03-13', '4511075055', NULL, NULL, NULL, '2015-10-01', NULL, NULL, NULL),
(59172119, NULL, 'นาย', 'ชัยสิทธิ์', 'ทันศึก', NULL, NULL, 'male', '1972-04-30', '4311158065', NULL, NULL, NULL, '2016-10-01', NULL, NULL, NULL),
(59172120, NULL, 'นาง', 'พิไลพรรณ', 'แก้วแก่นตา', NULL, NULL, 'female', '1976-01-13', '4511032299', '74109', NULL, NULL, '2016-05-01', NULL, NULL, NULL),
(59172121, NULL, 'พ.ต.อ.หญิง', 'ระชี', 'ดิษฐจร', 'Rachee', 'Ditachorn', 'female', '1955-11-16', '4511012136', NULL, NULL, NULL, '2016-11-01', NULL, NULL, NULL),
(60172123, NULL, 'นางสาว', 'ขวัญเรือน', 'ก๋าวิตู', NULL, NULL, 'female', '1985-06-19', '5111207345', '129959', NULL, NULL, '2017-02-01', NULL, NULL, NULL),
(63172128, NULL, 'นาย', 'เรวัต', 'แย้มสุดา', 'Raywat', 'Yaemsuda', 'male', '1959-04-28', '4521023170', 'อ.1/21510', NULL, NULL, '2020-01-02', NULL, NULL, NULL),
(63172129, NULL, 'นางสาว', 'รัตนาภรณ์', 'นิวาศานนท์', NULL, NULL, 'female', '1992-03-24', '5811261753', NULL, NULL, NULL, '2019-02-01', NULL, 'เปลี่ยนนามสกุล', NULL),
(63172131, NULL, 'นางสาว', 'พาจนา', 'ดวงจันทร์', NULL, NULL, 'female', '1967-04-29', '4511050318', NULL, NULL, NULL, '2005-02-01', NULL, NULL, NULL),
(63172132, NULL, 'นาง', 'บัวทิพย์', 'เพ็งศรี', 'Buatip', 'Phengsri', 'female', '1970-10-17', '4511048575', NULL, NULL, NULL, '2015-10-01', NULL, NULL, NULL),
(63172133, NULL, 'นางสาว', 'พรรณี', 'ตรังคสันต์', NULL, NULL, 'female', '1968-02-27', '4511050332', NULL, NULL, NULL, '2015-10-10', NULL, NULL, NULL),
(64172139, NULL, 'นางสาว', 'สุภาภรณ์', 'ศรีฟ้า', 'Supaporn', 'Srifa', 'female', '1985-11-12', '5111207470', NULL, NULL, NULL, '2021-03-01', NULL, NULL, NULL),
(65172142, NULL, 'นาง', 'อัจรา', 'ฐิตวัฒนกุล', NULL, NULL, 'female', '1987-09-13', '5311218207', NULL, NULL, NULL, '2022-08-01', NULL, NULL, NULL),
(66172148, NULL, 'นาง', 'รุ่งนภา', 'พรหมแย้ม', NULL, NULL, 'female', '1963-05-03', '4511053132', NULL, NULL, NULL, '2023-12-01', NULL, NULL, NULL),
(66712147, NULL, 'นางสาว', 'เกวลี', 'เชียรวิชัย', NULL, NULL, 'female', '1990-09-06', '5611243227', '164439', NULL, NULL, '2023-11-01', NULL, NULL, NULL),
(6604800008, NULL, 'นางสาว', 'อาภัสรา', 'เนตรสัก', 'Arpatsara', 'Netsak', 'female', '2004-01-01', '1', '1', 'example@gmail.com', '0123456789', NULL, NULL, NULL, '2026-05-21 17:16:07');

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
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` bigint NOT NULL,
  `permission_name` varchar(100) NOT NULL COMMENT 'ชื่อสิทธิ์อ้างอิงใน Code (ห้ามซ้ำ)',
  `module_group` varchar(50) DEFAULT NULL COMMENT 'กลุ่มของฟังก์ชัน',
  `description_th` text COMMENT 'คำอธิบายสิทธิ์ภาษาไทย'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`, `module_group`, `description_th`) VALUES
(1, 'PROFILE_VIEW_SELF', 'General', 'ดูข้อมูลส่วนตัวของตนเอง'),
(2, 'PROFILE_VIEW_ALL', 'General', 'ดูข้อมูลส่วนตัวของบุคลากรคนอื่น'),
(3, 'NOTIFICATION_VIEW', 'General', 'รับและดูการแจ้งเตือน'),
(4, 'SYSTEM_SETTINGS', 'General', 'เข้าถึงการตั้งค่าระบบ'),
(5, 'RESEARCH_UPLOAD', 'Project', 'อัปโหลดงานวิจัย'),
(6, 'PROJECT_VIEW', 'Project', 'ดูข้อมูลโครงการ'),
(7, 'PROJECT_MANAGE', 'Project', 'จัดการข้อมูลและเอกสารโครงการ'),
(8, 'PROJECT_ASSIGN_STUDENT', 'Project', 'เพิ่มนักศึกษาเข้าโครงการ'),
(9, 'PROJECT_LINK_LO', 'Project', 'เชื่อมโยงโครงการกับ Learning Outcome'),
(10, 'STUDENT_VIEW_COURSE', 'Academic', 'ดูรายชื่อนักศึกษาในรายวิชาที่สอน'),
(11, 'STUDENT_EXPORT_COURSE', 'Academic', 'ส่งออกรายชื่อนักศึกษาในรายวิชา'),
(12, 'COURSE_REPORT_VIEW', 'Academic', 'ดูรายงานผลลัพธ์หลักสูตรและรายวิชา'),
(13, 'COURSE_REPORT_EXPORT', 'Academic', 'ส่งออกรายงานหลักสูตร รายงาน 5 ปี หรือ KPI'),
(14, 'GRADE_MANAGE', 'Academic', 'กำหนดและแก้ไขเกรดตาม CLO'),
(15, 'CLO_MANAGE', 'Academic', 'กำหนดและแก้ไข CLO ของหลักสูตร'),
(16, 'ASSIGN_INSTRUCTORS', 'Academic', 'มอบหมายอาจารย์ผู้สอนในรายวิชา'),
(17, 'ADVISOR_STUDENT_VIEW', 'Advisor', 'ดูข้อมูลนักศึกษาในความดูแล'),
(18, 'STUDENT_MANAGE_ALL', 'Advisor', 'จัดการรายชื่อและหลักฐานนักศึกษาทั้งหมด'),
(19, 'EXAM_REPORT_MANAGE', 'Advisor', 'จัดการรายงานสอบ 8 วิชาและใบประกอบวิชาชีพ'),
(20, 'VIEW_DEAN_DASHBOARD', 'Executive', 'ดู Dashboard ภาพรวม KPI ระดับคณะ'),
(21, 'VIEW_RETENTION', 'Executive', 'ดูอัตราการคงอยู่ต่างๆ ของนักศึกษา'),
(22, 'FINANCIAL_VIEW', 'Executive', 'ดูรายงานการเงินและข้อมูลเชิงบริหาร'),
(23, 'VIEW_ADMIN_DASHBOARD', 'Admin', 'ดูแดชบอร์ดของผู้ดูแลระบบ'),
(24, 'USER_ROLE_MANAGE', 'Admin', 'จัดการผู้ใช้งานและบทบาท/ตำแหน่ง'),
(25, 'DATA_IMPORT_EXPORT', 'Admin', 'นำเข้าและส่งออกข้อมูลระบบ'),
(26, 'AUDIT_LOG_VIEW', 'Admin', 'ดูประวัติการใช้งานระบบ (Audit Log)'),
(27, 'ADMIN_APPROVALS', 'Admin', 'อนุมัติคำขอต่างๆ ในระบบ'),
(28, 'ADMIN_REPORTS', 'Admin', 'จัดการรายงานระดับระบบ');

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
  `position_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `position_permission`
--

INSERT INTO `position_permission` (`position_id`, `permission_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(1, 2),
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(1, 4),
(2, 4),
(3, 4),
(4, 4),
(5, 4),
(6, 4),
(7, 4),
(1, 5),
(2, 5),
(3, 5),
(4, 5),
(1, 6),
(2, 6),
(3, 6),
(4, 6),
(6, 6),
(2, 7),
(4, 7),
(6, 7),
(6, 8),
(6, 9),
(2, 10),
(4, 10),
(2, 11),
(4, 11),
(2, 12),
(4, 12),
(5, 12),
(1, 13),
(2, 14),
(4, 14),
(5, 15),
(5, 16),
(3, 17),
(4, 17),
(3, 18),
(3, 19),
(1, 20),
(1, 21),
(1, 22),
(7, 23),
(7, 24),
(7, 25),
(7, 26),
(7, 27),
(7, 28);

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
  `subject_id` int NOT NULL,
  `subject_code` varchar(50) DEFAULT NULL,
  `subject_name_th` varchar(255) DEFAULT NULL,
  `subject_name_en` varchar(255) DEFAULT NULL,
  `credit` int DEFAULT NULL,
  `credit_desc` varchar(50) DEFAULT NULL,
  `description` text,
  `is_active` int DEFAULT NULL,
  `program_id` int DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `subject_type` varchar(100) DEFAULT NULL,
  `year_level` int DEFAULT NULL,
  `semester` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subject_id`, `subject_code`, `subject_name_th`, `subject_name_en`, `credit`, `credit_desc`, `description`, `is_active`, `program_id`, `department`, `subject_type`, `year_level`, `semester`) VALUES
(1, '103-111', 'ภาษาอังกฤษพื้นฐาน', 'English Fundamentals', 3, '3(2-2-5)', 'การอ่านข้อความที่สั้นและง่าย การฝึกใช้คำศัพท์และสำนวนพื้นฐานในการสนทนา การทำตามคำแนะนำ ความเข้าใจข้อมูลในโฆษณา โปรแกรม และโบรชัวร์ การสร้างวลีและประโยคอย่างง่ายในงานเขียน การอธิบายตนเองและชีวิตประจำวัน การเขียนข้อความสั้นๆ การโพสต์ออนไลน์ การมีส่วนร่วมอย่างแข่งขันในการถามและตอบคำถาม การมีส่วนร่วมในการสนทนาในหัวข้อที่ไม่ซับซ้อน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 1),
(2, '103-112', 'การสื่อสารภาษาอังกฤษในชีวิตประจำวัน', 'English Communication in Everyday Life', 3, '3(2-2-5)', 'การสื่อสารอย่างมั่นใจในสถานการณ์ที่กำหนดไว้ การแลกเปลี่ยนความคิดเห็น การถามและตอบคำถามในหัวข้อที่คุ้นเคย การมีส่วนร่วมในการสนทนาที่เกี่ยวข้องกับความสนใจและสาขาวิชาชีพ การอธิบายและชี้แจง การสื่อสารกับผู้อื่น เช่น การขอความช่วยเหลือ การเสนอแนะ และการปฏิบัติตามคำแนะนำ การเขียนจดหมายโต้ตอบเพื่อการสื่อสาร การใช้แพลตฟอร์มออนไลน์เพื่อการสื่อสาร', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 2),
(3, '103-113', 'ภาษาอังกฤษเพื่อการศึกษาทางวิชาการ', 'English for Academic Study', 3, '3(2-2-5)', 'การฝึกทักษะภาษาอังกฤษทั้ง 4 ด้านเพื่อการศึกษาทางวิชาการ การฟัง และตอบคำถามทางวิชาการ การนำเสนอด้วยปากเปล่า การพัฒนาความเข้าใจในการอ่านและทักษะการอ่านอย่างมีวิจารณญาณ คำศัพท์ และโครงสร้างประโยคที่ใช้ในการเขียนทางวิชาการ การเขียนย่อหน้าประเภทต่างๆ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(4, '103-114', 'ภาษาอังกฤษเพื่อการนำเสนอแบบมืออาชีพ', 'English for Professional Presentation', 3, '3(2-2-5)', 'หลักการพูด การเลือกใช้คำ ประโยค คำเชื่อมและสำนวน การพูดในสถานการณ์ต่างๆ การแสดงความคิดเห็นและการนำเสนอเชิงวิชาการ การนำเสนอทางธุรกิจ การสัมภาษณ์งาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(5, '103-121', 'ภาษาไทยเพื่อการสื่อสาร', 'Thai Language for Communication', 3, '3(2-2-5)', 'ภาษาไทยเพื่อการสื่อสารในสถานการณ์ต่างๆ หลักการใช้ภาษาสื่อสารที่ถูกต้องทั้งการรับสารและส่งสาร การจับประเด็นและการวิเคราะห์สารจากเรื่องที่ฟังหรืออ่านอย่างมีวิจารณญาณและนำเสนอความคิดผ่านการพูดการเขียนในรูปแบบที่เหมาะสมได้อย่างมีประสิทธิภาพ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(6, '103-122', 'ภาษาไทยเพื่อการนำเสนอ', 'Thai Language for Presentation', 3, '3(2-2-5)', 'การใช้ภาษาไทยนําเสนอข้อมูลในสถานการณ์ต่างๆ อาทิ การนําเสนอข้อมูลทางวิชาการ การนําเสนอข้อมูลทางธุรกิจ การแสดงความคิดเห็น วิเคราะห์และวิจารณ์ การนําเสนอข้อมูลที่มีความน่าเชื่อถือ การเลือกใช้ช่องทางการสื่อสารอย่างเหมาะสม และมีประสิทธิภาพเป็นประโยชน์ต่อการศึกษาและการทํางาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(7, '103-123', 'ภาษาไทยเพื่อผู้ประกอบการ', 'Thai Language for Entrepreneurs', 3, '3(2-2-5)', 'ภาษาไทยเพื่อการทำงานในสถานประกอบการ ทักษะการสื่อสารภาษาไทยที่มีประสิทธิภาพและจำเป็นต่อการทำงานในองค์กรทั้งการฟัง การพูด การอ่าน และการเขียน การจัดทำเอกสารการประชุมหรือเอกสารที่เกี่ยวข้องกับการทำงาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(8, '103-131', 'ภาษาจีนเพื่อการสื่อสารในชีวิตประจำวัน', 'Chinese for Daily Communication', 3, '3(2-2-5)', 'การฝึกทักษะฟัง พูด อ่าน และเขียน วิธีการอ่านสัทอักษรการถอดเสียงพินอิน Pinyin ภาษาจีนกลางที่ถูกต้อง โครงสร้างไวยากรณ์ คำศัพท์ประมาณ 150-300 คำ และสำนวนพื้นฐานที่ใช้ในชีวิตประจำวัน บทสนทนาขั้นพื้นฐาน ได้แก่ การพูดสนทนาทักทาย การแนะนำตนเอง การนับ และการใช้ตัวเลขแสดงจำนวน การสอบถามสถานที่และตำแหน่งทิศทาง การบอกเวลา และการบอกชื่อสิ่งของ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(9, '103-141', 'ภาษาญี่ปุ่นในชีวิตประจำวัน', 'Daily Life Japanese', 3, '3(2-2-5)', 'คำศัพท์ สำนวน วัฒนธรรม และทักษะในการสื่อสาร การตั้งคำถามและการตอบอย่างสั้น บทสนทนาอย่างง่ายในระดับวลี และประโยคสั้นๆโดยเน้นหัวข้อที่สามารถประยุกต์ใช้ในชีวิตประจำวัน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(10, '103-151', 'การเขียนโค้ดคอมพิวเตอร์สำหรับทุกคน', 'Computer Coding for Everyone', 3, '3(2-2-5)', 'ความรู้พื้นฐานการเขียนโปรแกรมด้วยภาษาไพธอน เครื่องมือที่ใช้ในการเขียนโปรแกรมภาษาไพธอน ชนิดของข้อมูลและตัวแปร การรับข้อมูลเข้าและการแสดงผลลัพธ์ การใช้งานคำสั่งทางเลือก การใช้งานคำสั่งวนลูป การสร้างฟังก์ชัน การวิเคราะห์ข้อมูลและการนำเสนอข้อมูล', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(11, '103-201', 'ทักษะดิจิทัลสำหรับศตวรรษที่ 21', 'Digital Literacy for 21st Century', 3, '3(2-2-5)', 'การใช้เทคโนโลยีดิจิทัลเพื่อการสืบค้นสารสนเทศ การสื่อสาร และการรู้เท่าทันการเปลี่ยนแปลงด้านเทคโนโลยีดิจิทัล หลักการการเป็นพลเมืองดิจิทัล ความปลอดภัยด้านสารสนเทศ จริยธรรมและกฎหมายที่เกี่ยวข้อง การนำเทคโนโลยีมาใช้เพื่อการจัดการสมัยใหม่ การวิเคราะห์และสังเคราะห์สารสนเทศ การเขียนรายงาน การเลือกเครื่องมือดิจิทัลที่สอดคล้องกับการทำงานเพื่อให้เกิดประสิทธิภาพ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 1),
(12, '103-202', 'การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่องจักรเบื้องต้น', 'Introduction to Data Analytics and Machine Learning', 3, '3(2-2-5)', 'พื้นฐานของการทำงานอัตโนมัติ การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่อง เช่น การรวบรวมข้อมูล การระบุแหล่งข้อมูล การทำความสะอาดข้อมูล การวิเคราะห์ การสื่อสารข้อมูลเชิงลึกด้วยการใช้แดชบอร์ด การแสดงภาพเพื่อเพิ่มมูลค่าให้กับการตัดสินใจ การเรียนรู้ของเครื่องจักร เครื่องมือต่างๆและการประยุกต์ใช้ การอภิปรายสถานการณ์จริงของการเรียนรู้เครื่องมือหรือตัวอย่างของการใช้ปัญญาประดิษฐ์เชิงกำเนิด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 2),
(13, '103-203', 'ความเป็นพลเมืองในสังคมไทยและสังคมโลก', 'Civic Literacy in Thai and Global Context', 3, '3(3-0-6)', 'สภาพการณ์ทางการเมือง เศรษฐกิจ สังคม และวัฒนธรรมของกลุ่มประเทศต่างๆ ประเด็นปัญหาร่วมสมัยในสังคมโลก ประเทศไทยในสังคมโลก ความหลากหลายทางวัฒนธรรมและกระบวนการทางความคิดที่เป็นสากล ความรับผิดชอบต่อสังคม การรู้หน้าที่ของพลเมืองและรับผิดชอบต่อสังคมในการต่อต้านการทุจริต ความสัมพันธ์ระหว่างความเป็นพลเมืองกับสถานะการพัฒนาของประเทศภายใต้กฎหมายในชีวิตประจำวันและกติกาสากลของสังคมประชาธิปไตย บทบาทและหน้าที่ของบุคคลในฐานะพลเมืองไทยและพลเมืองโลก', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(14, '103-204', 'มนุษยสัมพันธ์และการพัฒนาบุคลิกภาพ', 'Human Relations and Personality Development', 3, '3(3-0-6)', 'การสร้างความสัมพันธ์ระหว่างบุคคล การรู้จักตนเองและผู้อื่น เสริมสร้างการเห็นคุณค่าในตนเอง กำหนดเป้าหมายในการเรียนการทำงานและการมีบุคลิกภาพที่เหมาะสม สามารถทำงานร่วมกับผู้อื่นได้', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(15, '103-205', 'จิตวิทยาในชีวิตประจำวัน', 'Psychology in Daily Life', 3, '3(3-0-6)', 'แนวคิดทางจิตวิทยาที่สำคัญ พัฒนาการวัยต่างๆ การรับรู้ การจูงใจ บุคลิกภาพและความแตกต่างระหว่างบุคคล ความหลากหลายทางเพศ อิทธิพลทางสังคมและพฤติกรรมทางสังคม การวิเคราะห์ปฏิสัมพันธ์ระหว่างบุคคล ความสัมพันธ์ที่ดี การจัดการความเครียด ความผิดปกติทางจิตและการบำบัด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(16, '103-206', 'อาหาร การดูแลสุขภาพ และการออกกำลังกาย', 'Diet, Health Care and Exercise', 3, '3(2-2-5)', 'สุขภาวะด้านร่างกาย จิตใจ อารมณ์ และสังคม อาหารและโภชนาการ การป้องกันและการบำบัดโรค ด้วยอาหาร ความปลอดภัยของอาหาร ฉลากโภชนาการ ผลิตภัณฑ์เสริมอาหารและการเลือกใช้ การออกกำลังกายเพื่อเสริมสร้างสมรรถภาพของร่างกาย ผลของการออกกำลังกายที่มีต่อระบบต่างๆในร่างกาย นวัตกรรมอาหารเพื่อสุขภาพ และเทคโนโลยีดิจิทัลเพื่อการออกกำลังกาย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(17, '103-207', 'สารเคมีในชีวิตประจำวัน', 'Chemicals in Daily Life', 3, '3(3-0-6)', 'สารเคมีที่ใช้ในชีวิตประจำวัน องค์ประกอบของสารเคมี สารเคมีประเภทธรรมชาติและสารสังเคราะห์ ที่เกี่ยวข้องกับชีวิตประจำวัน น้ำและเครื่องดื่ม สารปรุงแต่งอาหาร ความหมาย ประเภทและสารประกอบของเครื่อง สมอาง ความหมาย ประเภทและสมบัติของสารทำความสะอาด การป้องกันและการแก้พิษจากสารเคมี', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(18, '103-208', 'คณิตศาสตร์และสถิติในชีวิตประจำวัน', 'Mathematics and Statistics in Daily Life', 3, '3(3-0-6)', 'คณิตศาสตร์และสถิติเบื้องต้น เพื่อนำไปใช้ในชีวิตประจำวัน โดยใช้ความรู้เรื่อง เรขาคณิต อัตราส่วน ร้อยละ ฟังก์ชัน ความรู้เบื้องต้นเกี่ยวกับสถิติ การเก็บรวบรวมข้อมูล การวิเคราะห์ข้อมูลด้วยสถิติแบบบรรยาย ความน่าจะเป็นกับการตัดสินใจอย่างง่าย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(19, '103-209', 'ศิลปะและดนตรีเพื่อสุนทรียภาพแห่งชีวิต', 'Art and Music Appreciation', 3, '3(3-0-6)', 'ความรู้เกี่ยวกับสุนทรียศาสตร์ ศิลปะในรูปแบบของสถาปัตยกรรม จิตรกรรม ประติมากรรม นาฎศิลป์ และดุริยางคศิลป์ ยุคสมัยต่างๆของศิลปะ แรงบันดาลใจเบื้องหลังผลงานศิลปะ ความซาบซึ้งในศิลปะ การประเมินคุณค่าทางสุนทรียะ ความสัมพันธ์ระหว่างศิลปะ ดนตรี กับชีวิต ศิลปะในชีวิตประจำวัน และคุณค่าความงามในงานศิลปะแขนงต่างๆ ในฐานะเป็นเครื่องมือจรรโลงจิตใจและสร้างสุนทรียภาพต่อชีวิตของมนุษย์', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(20, '103-210', 'นิยมไทยและอัศจรรย์ในสยาม', 'Thai Appreciation and Unseen in Siam', 3, '3(3-0-6)', 'ศิลปะและวัฒนธรรม ขนบธรรมเนียมประเพณี เอกลักษณ์ความเป็นไทย มรดกทางภูมิปัญญาที่มีคุณค่า และน่าภาคภูมิใจ คติความเชื่อ ค่านิยม วิถีชีวิต แนวทางการอนุรักษ์ สืบทอดและเผยแพร่ความเป็นไทย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(21, '103-211', 'การคิดเชิงสร้างสรรค์และการแก้ปัญหา', 'Creative Thinking and Problem Solving', 3, '3(2-2-5)', 'กระบวนการคิดและเทคนิคการคิดสร้างสรรค์ในรูปแบบต่างๆ การค้นหาแนวทางหรือทางเลือกใหม่ๆในการทำงาน การวิเคราะห์ปัญหาและการใช้เครื่องมือช่วยในการตัดสินใจเลือกทางเลือกที่มีประสิทธิภาพสูงสุด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(22, '103-212', 'การเป็นผู้ประกอบการและการสร้างธุรกิจใหม่', 'Entrepreneurship and New Business Creation', 3, '3(2-2-5)', 'คุณลักษณะและแนวคิดการเป็นผู้ประกอบการ โอกาสทางธุรกิจ การวิเคราะห์สภาพแวดล้อมทางธุรกิจ การวางแผนกลยุทธ์ การตลาด การเงิน และการจัดการสําหรับธุรกิจใหม่ การจัดทำแผนธุรกิจเบื้องต้น', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(23, '103-301', 'หลักปรัชญาของเศรษฐกิจพอเพียงเพื่อการพัฒนาที่ยั่งยืน', 'Philosophy of Sufficiency Economy for Sustainable Development', 3, '3(3-0-6)', 'ความเป็นมาและความหมายของปรัชญาของเศรษฐกิจพอเพียงตามแนวพระราชดำริ การประยุกต์ใช้ในระดับบุคคล ครอบครัว และชุมชน การขับเคลื่อนเศรษฐกิจพอเพียงในภาคส่วนต่างๆของสังคมและการเชื่อมโยงสู่การพัฒนาที่ยั่งยืน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(24, '103-302', 'การออกแบบการคิดเพื่อสร้างนวัตกรรมและธุรกิจใหม่', 'Design Thinking for Innovation and New Business Creation', 3, '3(2-2-5)', 'กระบวนการคิดเชิงออกแบบและการนำมาประยุกต์ใช้ในการระบุปัญหาและสร้างสรรค์นวัตกรรมด้านผลิตภัณฑ์ บริการ หรือโมเดลธุรกิจใหม่ๆ การทดสอบแนวคิดกับกลุ่มเป้าหมายและการพัฒนาเป็นต้นแบบธุรกิจ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0),
(25, '170-108', 'ชีวเคมี', 'Biochemistry', 2, '2(2-0-4)', 'โครงสร้างและหน้าที่ของสารชีวโมเลกุลในร่างกายมนุษย์ เอนไซม์และฮอร์โมนที่ควบคุมเมแทบอลิซึม การสลายสารอาหารและการเก็บสะสมพลังงานในระดับเซลล์ ความพยาธิสภาพที่เกิดจากความผิดปกติทางชีวเคมี', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1),
(26, '170-112', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 1', 'Human Anatomy and Physiology 1', 3, '3(2-2-5)', 'โครงสร้างและหน้าที่ของร่างกายมนุษย์ในระดับเซลล์และเนื้อเยื่อ ระบบปกคลุมร่างกาย ระบบโครงร่าง ระบบกล้ามเนื้อ ระบบประสาท และระบบรับความรู้สึก กลไกการรักษาดุลยภาพของร่างกายและการฝึกปฏิบัติการที่เกี่ยวข้อง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1),
(27, '170-113', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 2', 'Human Anatomy and Physiology 2', 3, '3(2-2-5)', 'โครงสร้างและหน้าที่ของระบบอวัยวะต่างๆ ต่อเนื่องจากภาค 1 ได้แก่ ระบบไหลเวียนโลหิต ระบบภูมิคุ้มกัน ระบบหายใจ ระบบย่อยอาหาร ระบบขับถ่ายปัสสาวะ ระบบต่อมไร้ท่อ และระบบสืบพันธุ์ รวมถึงการฝึกปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 2),
(28, '170-116', 'การดูแลสุขภาพแบบผสมผสาน', 'Alternative and Complementary Health Care', 2, '2(2-0-4)', 'แนวคิดและขอบเขตของการแพทย์ทางเลือกและการแพทย์ผสมผสาน สมาธิบำบัด วารีบำบัด การนวดไทย และศาสตร์ทางเลือกอื่นๆ เพื่อนำมาใช้ในการส่งเสริมสุขภาพและบรรเทาอาการเจ็บป่วยร่วมกับการแพทย์แผนปัจจุบัน', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 1, 2),
(29, '170-117', 'การดูแลสุขภาพความงามแบบองค์รวม', 'Holistic Beauty and Wellness Care', 2, '2(2-0-4)', 'แนวคิดและหลักการดูแลสุขภาพความงามจากภายในสู่ภายนอก โภชนาการเพื่อความงาม สารต้านอนุมูลอิสระ การดูแลผิวพรรณ รูปร่าง และการชะลอวัยด้วยวิธีธรรมชาติและการแพทย์สมัยใหม่อย่างปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 1, 2),
(30, '170-201', 'พยาธิสรีรวิทยาของมนุษย์', 'Human Pathophysiology', 2, '2(2-0-4)', 'กลไกการเกิดโรคและความเปลี่ยนแปลงทางสรีรวิทยาในภาวะเจ็บป่วย พยาธิสภาพของโรคที่พบบ่อยในระบบอวัยวะต่างๆ การตอบสนองของเซลล์ต่อการบาดเจ็บ การอักเสบ และกลไกการปรับตัวของร่างกาย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(31, '170-208', 'จุลชีววิทยาและปรสิตวิทยาของมนุษย์', 'Human Microbiology and Parasitology', 2, '2(1-2-3)', 'คุณลักษณะ กลไกการก่อโรค และการแพร่กระจายของเชื้อแบคทีเรีย ไวรัส เชื้อรา และปรสิตที่ก่อโรคในมนุษย์ ปฏิกิริยาภูมิคุ้มกันของร่างกาย หลักการควบคุมเชื้อและการทำลายเชื้อและการฝึกปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(32, '170-211', 'การพยาบาลพื้นฐาน 1', 'Fundamentals of Nursing 1', 3, '3(2-2-5)', 'แนวคิดพื้นฐานทางการพยาบาล กระบวนการพยาบาล หลักการตอบสนองความต้องการขั้นพื้นฐานด้านความสุขสบาย สุขอนามัย และความปลอดภัยของผู้ป่วย การควบคุมการติดเชื้อในโรงพยาบาล และการฝึกปฏิบัติในห้องปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(33, '170-212', 'การพยาบาลพื้นฐาน 2', 'Fundamentals of Nursing 2', 2, '2(1-2-3)', 'หลักการและเทคนิคการทำหัตถการทางการพยาบาลที่ซับซ้อนขึ้น การวัดสัญญาณชีพ การเก็บสิ่งส่งตรวจ การให้ออกซิเจน การดูดเสมหะ การแต่งแผล หลักเกณฑ์ความปลอดภัยในการบริหารยา และการฝึกปฏิบัติในห้องปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(34, '170-216', 'เภสัชวิทยาทางการพยาบาล', 'Pharmacology in Nursing', 2, '2(2-0-4)', 'กลไกการออกฤทธิ์ เภสัชจลนศาสตร์ ข้อบ่งใช้ ผลข้างเคียง และข้อควรระวังของยาในกลุ่มต่างๆ บทบาทหน้าที่ของพยาบาลในการบริหารยาอย่างปลอดภัย การคำนวณขนาดยา และการพยาบาลผู้ป่วยที่ได้รับยา', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(35, '170-222', 'จรรยาบรรณวิชาชีพการพยาบาลและกฎหมายที่เกี่ยวข้อง', 'Nursing Ethics and Related Laws', 2, '2(2-0-4)', 'แนวคิดทางจริยธรรม จรรยาบรรณวิชาชีพพยาบาล สิทธิผู้ป่วย กฎหมายวิชาชีพการพยาบาลและผดุงครรภ์ และกฎหมายสาธารณสุขที่เกี่ยวข้องกับการปฏิบัติการพยาบาล การตัดสินใจเชิงจริยธรรมในสถานการณ์ปัญหาขัดแย้ง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(36, '170-224', 'ชีวสถิติทางสุขภาพ', 'Biostatistics for Health', 2, '2(2-0-4)', 'สถิติพรรณนาและสถิติอ้างอิงที่ประยุกต์ใช้ในงานวิทยาศาสตร์สุขภาพ การทดสอบสมมติฐาน การเลือกใช้สถิติที่เหมาะสมในการวิเคราะห์ข้อมูล และการใช้โปรแกรมคอมพิวเตอร์สำเร็จรูปเพื่อการวิเคราะห์และแปลผล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(37, '170-228', 'พัฒนาการมนุษย์และการสร้างเสริมสุขภาพ', 'Human Development and Health Promotion', 2, '2(2-0-4)', 'ทฤษฎีและพัฒนาการของมนุษย์ในทุกช่วงวัย ปัจจัยที่มีผลต่อการเจริญเติบโต แนวคิดและแนวทางการสร้างเสริมสุขภาพ การป้องกันโรค และการประเมินภาวะสุขภาพตามกลุ่มวัย พฤติกรรมสุขภาพและแบบแผนการดำเนินชีวิต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(38, '170-229', 'โภชนบำบัด', 'Diet Therapy', 2, '2(2-0-4)', 'หลักโภชนาการปกติและความต้องการสารอาหารในแต่ละวัย หลักการจัดอาหารบำบัดโรคสำหรับผู้ป่วยที่มีพยาธิสภาพต่างๆ เช่น เบาหวาน ความดันโลหิตสูง โรคไต โรคหัวใจ บทบาทพยาบาลในการดูแลและให้คำแนะนำด้านอาหาร', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(39, '170-226', 'การพยาบาลผู้ใหญ่', 'Adult Nursing', 3, '3(3-0-6)', 'การพยาบาลแบบองค์รวมสำหรับผู้ป่วยวัยผู้ใหญ่ที่มีปัญหาสุขภาพในระยะเฉียบพลัน กึ่งเฉียบพลัน และเรื้อรัง ของระบบทางเดินหายใจ ไหลเวียนโลหิต ทางเดินอาหาร ทางเดินปัสสาวะ ต่อมไร้ท่อ และระบบประสาท โดยใช้กระบวนการพยาบาล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(40, '170-227', 'มโนมติ ทฤษฎีการพยาบาล และบริการด้วยหัวใจความเป็นมนุษย์', 'Concepts, Nursing Theories, and Humanized Care Service', 2, '2(2-0-4)', 'มโนมติหลักทางการพยาบาล วิวัฒนาการของวิชาชีพ ทฤษฎีการพยาบาลที่สำคัญและการนำไปประยุกต์ใช้ในการปฏิบัติ แนวคิดและค่านิยมการบริการด้วยหัวใจความเป็นมนุษย์ ความเอื้ออาทร และการเคารพศักดิ์ศรีความเป็นมนุษย์', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(41, '170-230', 'กระบวนการพยาบาลและการประเมินภาวะสุขภาพ', 'Nursing Process and Health Assessment', 2, '2(1-2-3)', 'ขั้นตอนและองค์ประกอบของกระบวนการพยาบาล หลักการและเทคนิคการประเมินภาวะสุขภาพทางกาย จิต สังคม จิตวิญญาณ การซักประวัติ การตรวจร่างกายทุกระบบ การบันทึกข้อมูลสุขภาพ และการฝึกทักษะการตรวจร่างกาย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(42, '170-231', 'การประยุกต์ใช้ AI และเทคโนโลยีดิจิทัลทางการพยาบาล', 'Application of AI and Digital Technology in Nursing', 2, '2(1-2-3)', 'แนวคิดและการประยุกต์ใช้ปัญญาประดิษฐ์ (AI) เทคโนโลยีดิจิทัล และสารสนเทศในการจัดการข้อมูลสุขภาพ ระบบบันทึกทางการพยาบาลอิเล็กทรอนิกส์ การพยาบาลทางไกล (Telenursing) และจริยธรรมความปลอดภัยของข้อมูล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(43, '170-324', 'การพยาบาลผู้สูงอายุ', 'Gerontological Nursing', 2, '2(2-0-4)', 'กระบวนการชราภาพและการเปลี่ยนแปลงในผู้สูงอายุ กลุ่มอาการที่พบบ่อยในผู้สูงอายุ การประเมินภาวะสุขภาพผู้สูงอายุแบบองค์รวม การพยาบาลผู้สูงอายุที่มีปัญหาสุขภาพเฉียบพลันและเรื้อรัง และการดูแลในระยะท้าย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(44, '170-348', 'การพยาบาลเด็กและวัยรุ่น', 'Pediatric and Adolescent Nursing', 3, '3(3-0-6)', 'การเจริญเติบโต พัฒนาการ และพยาธิสภาพของโรคที่พบบ่อยในทารก เด็ก และวัยรุ่น การประยุกต์ใช้กระบวนการพยาบาลในการดูแลเด็กที่มีภาวะเจ็บป่วยเฉียบพลัน เรื้อรัง และวิกฤต โดยเน้นครอบครัวเป็นศูนย์กลาง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(45, '170-349', 'การพยาบาลวิกฤตและฉุกเฉิน', 'Critical Care and Emergency Nursing', 2, '2(2-0-4)', 'หลักการพยาบาลในภาวะฉุกเฉินและวิกฤตคุกคามต่อชีวิต การคัดแยกผู้ป่วย การประเมินและเฝ้าระวังอาการอย่างรวดเร็วต่อเนื่อง พยาธิสภาพของผู้ป่วยภาวะช็อก บาดเจ็บรุนแรงหลายระบบ และหลักการช่วยฟื้นคืนชีพขั้นสูง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(46, '170-350', 'การพยาบาลสุขภาพจิตและจิตเวชศาสตร์', 'Psychiatric and Mental Health Nursing', 3, '3(3-0-6)', 'แนวคิด ทฤษฎี และลักษณะทางคลินิกของโรคทางจิตเวชที่พบบ่อย ปัจจัยที่มีผลต่อสุขภาพจิต การประยุกต์ใช้กระบวนการพยาบาลในการดูแลแบบองค์รวมแก่ผู้รับบริการที่มีปัญหาสุขภาพจิต การบำบัดทางการพยาบาลจิตเวช', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(47, '170-351', 'การพยาบาลมารดาและทารก', 'Maternal and Newborn Nursing', 3, '3(3-0-6)', 'แนวคิดและทฤษฎีการพยาบาลในการดูแลสตรีในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอดปกติ พยาธิสรีรวิทยาและการเปลี่ยนแปลงตามธรรมชาติ การประเมินสุขภาพมารดาและทารกในครรภ์ กลไกการคลอด และการบริบาลทารกแรกเกิด', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(48, '170-352', 'การผดุงครรภ์', 'Midwifery', 3, '3(3-0-6)', 'กฎหมายและขอบเขตวิชาชีพผดุงครรภ์ การพยาบาลและการผดุงครรภ์ในสตรีที่มีภาวะแทรกซ้อนในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอด ทารกแรกเกิดที่มีภาวะเสี่ยงหรือพยาธิสภาพ การเฝ้าระวังและการพยาบาลในภาวะฉุกเฉิน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(49, '170-353', 'การพยาบาลอนามัยชุมชน', 'Community Health Nursing', 3, '3(3-0-6)', 'หลักการสาธารณสุขและการพยาบาลอนามัยชุมชน ระบบบริการสุขภาพปฐมภูมิ เครื่องมือศึกษาชุมชน การประเมินและการวางแผนแก้ปัญหาอนามัยชุมชน การประยุกต์ใช้กระบวนการพยาบาลในการดูแลครอบครัวและกลุ่มเฉพาะ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(50, '170-354', 'กระบวนการวิจัยทางวิชาชีพ', 'Professional Research Process', 2, '2(2-0-4)', 'ความสำคัญของการวิจัยทางการพยาบาล จริยธรรมการวิจัยในมนุษย์ ขั้นตอนกระบวนการวิจัย ตั้งแต่การกำหนดปัญหาวิจัย การทบทวนวรรณกรรม รูปแบบการวิจัย เครื่องมือ การเก็บรวบรวมข้อมูล และการวิเคราะห์แปลผลข้อมูล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(51, '170-448', 'การรักษาพยาบาลเบื้องต้น', 'Primary Medical Care', 2, '2(2-0-4)', 'หลักการและขอบเขตการรักษาพยาบาลเบื้องต้นโดยพยาบาลตามกฎหมาย การซักประวัติ ตรวจร่างกาย และใช้เหตุผลทางคลินิกเพื่อวินิจฉัยแยกโรค อาการเจ็บป่วยและโรคที่พบบ่อย การสั่งใช้ยาตามขอบเขตวิชาชีพ และการส่งต่อ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1),
(52, '170-457', 'ภาวะผู้นำและการบริหารทางการพยาบาล', 'Leadership and Nursing Management', 2, '2(2-0-4)', 'แนวคิดทฤษฎีภาวะผู้นำ การจัดการองค์กรพยาบาล กระบวนการบริหารจัดการทางการพยาบาล (วางแผน จัดองค์กร บริหารงานบุคคล อำนวยการ ควบคุม) การประกันคุณภาพการพยาบาล การบริหารความเสี่ยงและความขัดแย้ง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1),
(53, '170-232', 'ปฏิบัติการพยาบาลพื้นฐาน', 'Practicum in Fundamentals of Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลบนหอผู้ป่วยในการดูแลผู้ป่วยที่มีความต้องการขั้นพื้นฐาน โดยใช้กระบวนการพยาบาลและทักษะหัตถการพื้นฐาน การสื่อสารเพื่อการบำบัด ความปลอดภัย การบริหารยา และการบันทึกรายงาน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(54, '170-327', 'ปฏิบัติการสุขภาพจิตและจิตเวชศาสตร์', 'Practicum in Psychiatric and Mental Health Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลผู้รับบริการที่มีปัญหาสุขภาพจิตและโรคทางจิตเวช การสร้างสัมพันธภาพและการสื่อสารเพื่อการบำบัดรายบุคคลและกลุ่ม กิจกรรมบำบัด การบริหารยาจิตเวช และการคุ้มครองสิทธิผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(55, '170-331', 'ปฏิบัติการพยาบาลเด็กและวัยรุ่น', 'Practicum in Pediatric Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลทารก เด็ก และวัยรุ่น ที่มีภาวะเจ็บป่วยเฉียบพลัน เรื้อรัง และวิกฤต ในหอผู้ป่วยเด็ก โดยใช้กระบวนการพยาบาล การประเมินภาวะสุขภาพและพัฒนาการ และการบริหารยาอย่างปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(56, '170-337', 'ปฏิบัติการพยาบาลมารดาและทารก', 'Practicum in Maternal and Newborn Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลสตรีในระยะตั้งครรภ์ ระยะคลอด ระยะหลังคลอดปกติและมีความเสี่ยง และการดูแลทารกแรกเกิดในแผนกฝากครรภ์ ห้องคลอด และหอผู้ป่วยหลังคลอด โดยใช้กระบวนการพยาบาลและการทำคลอดปกติ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(57, '170-338', 'ปฏิบัติการผดุงครรภ์ 1', 'Practicum in Midwifery 1', 2, '2(0-8-0)', 'การฝึกปฏิบัติการผดุงครรภ์ในการตรวจครรภ์ การทำคลอดปกติ การดูแลทารกแรกเกิดทันทีหลังคลอด การเย็บแผลฝีเย็บ และการดูแลมารดาและทารกในระยะหลังคลอดปกติ ตามขอบเขตมาตรฐานวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(58, '170-339', 'ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ', 'Practicum in Adult and Gerontological Nursing', 4, '4(0-16-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลผู้ป่วยวัยผู้ใหญ่และผู้สูงอายุที่มีปัญหาสุขภาพเฉียบพลันและเรื้อรัง โดยประยุกต์ใช้กระบวนการพยาบาลแบบองค์รวม ทักษะหัตถการที่ซับซ้อนอย่างปลอดภัย และการเฝ้าระวังอาการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(59, '170-340', 'ปฏิบัติการพยาบาลผู้ป่วยวิกฤตและฉุกเฉิน', 'Practicum in Critical Care and Emergency Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลใน ICU หรือ ER ในการดูแลผู้ป่วยภาวะวิกฤตหรือฉุกเฉินคุกคามต่อชีวิต การประเมินและเฝ้าระวังอาการอย่างรวดเร็วต่อเนื่อง การกู้ชีพขั้นสูง และการใช้เทคโนโลยีขั้นสูงในการดูแลผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(60, '170-355', 'ปฏิบัติการพยาบาลอนามัยชุมชน', 'Practicum in Community Health Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลอนามัยชุมชน การใช้เครื่องมือและกระบวนการศึกษาชุมชน การจัดทำโครงการพัฒนาสุขภาพร่วมกับชุมชน การจัดกิจกรรมสร้างเสริมสุขภาพ การป้องกันโรค และการฝึกปฏิบัติการพยาบาลที่บ้าน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(61, '170-431', 'ปฏิบัติการผดุงครรภ์ 2', 'Practicum in Midwifery 2', 2, '2(0-8-0)', 'การฝึกปฏิบัติการผดุงครรภ์ในการดูแลมารดาและทารกในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอดที่มีภาวะแทรกซ้อนหรือความเสี่ยงสูง การช่วยเหลือเบื้องต้นในภาวะฉุกเฉินทางสูติศาสตร์อย่างถูกต้องปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1),
(62, '170-449', 'ปฏิบัติการรักษาพยาบาลเบื้องต้น', 'Practicum in Primary Medical Care', 2, '2(0-8-0)', 'การฝึกปฏิบัติการรักษาพยาบาลเบื้องต้นในหน่วยบริการปฐมภูมิหรือ ER/OPD ทักษะการซักประวัติ ตรวจร่างกาย วินิจฉัยแยกโรคเบื้องต้น สั่งใช้ยาตามขอบเขต การทำหัตถการเย็บแผล ล้างแผล ถอดเล็บ และการส่งต่อผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1),
(63, '170-458', 'ปฏิบัติการจัดการพยาบาล', 'Practicum in Nursing Management', 2, '2(0-8-0)', 'การฝึกปฏิบัติการบริหารจัดการทางการพยาบาลบนหอผู้ป่วยในฐานะหัวหน้าเวร ทักษะภาวะผู้นำ การมอบหมายงาน การนิเทศการพยาบาล การบริหารความเสี่ยง คุมคุณภาพการพยาบาล และการทำงานร่วมกับสหสาขาวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2),
(64, '170-459', 'ปฏิบัติการพยาบาลรวบยอดวิกฤตและฉุกเฉิน', 'Comprehensive Practicum in Critical Care and Emergency Nursing', 3, '3(0-12-0)', 'การฝึกปฏิบัติการพยาบาลรวบยอดในสภาวะวิกฤตและฉุกเฉิน บูรณาการองค์ความรู้ ทฤษฎี และงานวิจัยเชิงประจักษ์ในการดูแลผู้ป่วยวิกฤตและฉุกเฉินที่มีความซับซ้อนสูง เพื่อเตรียมความพร้อมสู่การเป็นพยาบาลวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2),
(65, '170-114', 'เคมีอินทรีย์พื้นฐาน', 'Basic Organic Chemistry', 2, '2(2-0-4)', 'โครงสร้าง การเรียกชื่อ ไอโซเมอริซึม และปฏิกิริยาเคมีของสารประกอบอินทรีย์กลุ่มต่างๆ ที่มีความสำคัญทางชีวภาพและทางการแพทย์', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1),
(66, '170-115', 'ฟิสิกส์การแพทย์เบื้องต้น', 'Introduction to Medical Physics', 2, '2(2-0-4)', 'หลักการทางฟิสิกส์ที่ประยุกต์ใช้ในทางการแพทย์ เช่น กลศาสตร์ของของไหลในระบบหมุนเวียน คลื่นเสียงและอัลตราซาวด์ รังสีและการป้องกันรังสี', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 2),
(67, '170-235', 'พันธุศาสตร์ทางการแพทย์และจีโนมิกส์', 'Medical Genetics and Genomics', 2, '2(2-0-4)', 'การถ่ายทอดลักษณะทางพันธุกรรม โครงสร้างดีเอ็นเอ ความผิดปกติของโครโมโซม โรคทางพันธุกรรมที่พบบ่อย และแนวคิดจีโนมิกส์ในการรักษาแบบแม่นยำ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1),
(68, '170-236', 'วิทยาภูมิคุ้มกันพื้นฐาน', 'Basic Immunology', 2, '2(2-0-4)', 'กลไกการตอบสนองทางภูมิคุ้มกันของร่างกาย ทั้งแบบจำเพาะและไม่จำเพาะ อวัยวะและเซลล์ในระบบภูมิคุ้มกัน ความผิดปกติของระบบภูมิคุ้มกันและการแพ้ยา', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2),
(69, '170-356', 'การพยาบาลบรรเทาอาการและดูแลระยะท้าย', 'Palliative and End-of-Life Care', 2, '2(2-0-4)', 'หลักการดูแลแบบประคับประคอง การจัดการความปวดและอาการทุกข์ทรมาน การสนับสนุนทางจิตสังคมและจิตวิญญาณแก่ผู้ป่วยระยะท้ายและครอบครัว', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2),
(70, '170-357', 'สารสนเทศศาสตร์สุขภาพ', 'Health Informatics', 2, '2(1-2-3)', 'ระบบข้อมูลสารสนเทศในโรงพยาบาล มาตรฐานรหัสทางการแพทย์ การจัดการฐานข้อมูลสุขภาพ และแนวโน้มเทคโนโลยีสารสนเทศสุขภาพในอนาคต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1),
(71, '170-460', 'การเตรียมความพร้อมเพื่อการทำงานในอนาคต', 'Preparation for Future Career', 1, '1(0-2-1)', 'การพัฒนาบุคลิกภาพ เทคนิคการสมัครงานและการสัมภาษณ์ ภาษาอังกฤษเพื่อการทำงาน จริยธรรมในการทำงาน และการวางแผนเส้นทางอาชีพในอนาคต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1),
(72, '170-461', 'การประมวลความรู้ทางวิชาชีพการพยาบาล', 'Comprehensive Review of Professional Nursing', 2, '2(2-0-4)', 'การทบทวนและประมวลความรู้รวบยอดในศาสตร์ทางการพยาบาลทุกสาขาวิชา เพื่อเตรียมความพร้อมในการสอบขึ้นทะเบียนรับใบอนุญาตประกอบวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2),
(73, '170-462', 'การฝึกปฏิบัติการพยาบาลเลือกสรร', 'Elective Practicum in Nursing', 2, '2(0-8-0)', 'การเลือกฝึกปฏิบัติงานในหอผู้ป่วยหรือสาขาวิชาที่นักศึกษาสนใจเป็นพิเศษ เพื่อเพิ่มพูนทักษะและความมั่นใจก่อนจบการศึกษาเป็นพยาบาลวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 4, 2);

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
(2, 'จัดการสิทธิ์', 'roles-management', 'Shield', 'USER_ROLE_MANAGE', 'จัดการระบบ', 1),
(3, 'จัดการข้อมูลผู้ใช้', 'users-management', 'Users', 'USER_ROLE_MANAGE', 'จัดการระบบ', 1),
(4, 'นำเข้าข้อมูล', 'import-data', 'Upload', 'DATA_IMPORT_EXPORT', 'ข้อมูล', 1),
(5, 'ส่งออกข้อมูล', 'export-data', 'Download', 'DATA_IMPORT_EXPORT', 'ข้อมูล', 1),
(6, 'Audit Log', 'audit-log', 'ClipboardList', 'AUDIT_LOG_VIEW', 'ข้อมูล', 1),
(7, 'รายงาน', 'reports', 'FileText', 'ADMIN_REPORTS', 'ข้อมูล', 1),
(8, 'อนุมัติคำขอ', 'approvals', 'CheckSquare', 'ADMIN_APPROVALS', 'ข้อมูล', 1),
(9, 'แดชบอร์ด KPI', 'dean-dashboard', 'LayoutDashboard', 'VIEW_DEAN_DASHBOARD', 'จัดการระบบ', 1),
(10, 'อัตราคงอยู่', 'retention', 'UserCheck', 'VIEW_RETENTION', 'จัดการระบบ', 1),
(11, 'รายงาน PLO/YLO', 'plo-ylo-report', 'TrendingUp', 'COURSE_REPORT_VIEW', 'งานหลักสูตร', 1),
(12, 'สรุปข้อมูล 5 ปี', 'five-year-summary', 'CalendarDays', 'COURSE_REPORT_EXPORT', 'งานหลักสูตร', 1),
(13, 'จัดการอาจารย์ผู้สอน', 'assign-instructors', 'UserCheck', 'ASSIGN_INSTRUCTORS', 'งานหลักสูตร', 1),
(14, 'รายงานรายวิชา', 'course-report', 'CalendarDays', 'COURSE_REPORT_VIEW', 'งานหลักสูตร', 1),
(15, 'CLO Map', 'clo-map', 'UserCheck', 'CLO_MANAGE', 'งานหลักสูตร', 1),
(16, 'อัปโหลดเอกสาร', 'documents', 'UserCheck', 'RESEARCH_UPLOAD', 'งานหลักสูตร', 1),
(17, 'การแจ้งเตือน', 'notifications', 'User', 'NOTIFICATION_VIEW', 'ระบบทั่วไป', 1),
(18, 'ข้อมูลส่วนตัว', 'profile', 'User', 'PROFILE_VIEW_SELF', 'ระบบทั่วไป', 1),
(19, 'การตั้งค่า', 'settings', 'Settings', 'SYSTEM_SETTINGS', 'ระบบทั่วไป', 1),
(20, 'โครงการ', 'project-docs', 'Target', 'PROJECT_VIEW', 'โครงการ', 1);

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
(6, '41172017', '$2y$10$Ufr2JcYXlZYwjZtyhrObweBjW2wFA85DddGRR15iOA7rGkWpn0uX6', 2, '2026-02-14 18:02:44'),
(7, '63172133', '$2y$10$X7qXABiTtnCl1xSbziwsc.VkyWBv7sDqou6Iu6ChatJAvoIevCFp6', 2, '2026-03-01 18:20:12'),
(8, '6604800008', '$2y$10$NqeqUCzI4OhQi8J0ddkbqOwLuaEBOae042PzbJ0iwhjYSEb0bR64i', 2, '2026-05-21 17:17:08');

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
(3, 6, 1, 1, NULL, NULL),
(5, 7, 6, 1, NULL, NULL),
(9, 8, 2, 1, NULL, NULL);

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
-- Indexes for table `curriculum_framework`
--
ALTER TABLE `curriculum_framework`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name` (`permission_name`);

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
  ADD PRIMARY KEY (`position_id`,`permission_id`),
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
  ADD PRIMARY KEY (`subject_id`);

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
  MODIFY `audit_log_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6604800009;

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
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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
-- AUTO_INCREMENT for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  MODIFY `menu_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_position`
--
ALTER TABLE `user_position`
  MODIFY `user_position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  ADD CONSTRAINT `position_permission_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `position` (`position_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `position_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

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
