-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 12, 2026 at 12:31 PM
-- Server version: 26.7.0
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
  `topic` varchar(255) DEFAULT NULL,
  `log_type` varchar(20) NOT NULL DEFAULT 'academic',
  `advice_note` text COMMENT 'รายละเอียดการพูดคุย/คำแนะนำ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `advice_log`
--

INSERT INTO `advice_log` (`advice_id`, `student_id`, `advisor_id`, `topic`, `log_type`, `advice_note`, `created_at`) VALUES
(1, 6603400001, 5, 'แนะนำการลงทะเบียนเรียน', 'academic', 'นักศึกษาสอบถามการลงทะเบียนวิชาเลือก แนะนำให้เลือกตามความสนใจและตารางเวลา', '2026-07-10 10:17:10'),
(2, 6603400002, 5, 'ติดตามผลการเรียน', 'warning', 'ผลการเรียนภาคที่ผ่านมาลดลง นัดติดตามอีกครั้งปลายเดือน', '2026-07-10 10:17:10'),
(3, 6603400004, 5, 'ปรับตัวเข้ากับการเรียน', 'personal', 'ให้คำปรึกษาเรื่องการปรับตัว แนะนำเข้าร่วมกิจกรรมของคณะ', '2026-07-10 10:17:10'),
(4, 6603400001, 12, '123', 'academic', '123', '2026-09-28 07:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `advisor_transfer_request`
--

CREATE TABLE `advisor_transfer_request` (
  `request_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `from_advisor_id` bigint NOT NULL,
  `to_advisor_id` bigint NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `request_type` enum('incoming','outgoing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'outgoing',
  `created_by` bigint DEFAULT NULL,
  `reviewed_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `annual_project_report_budgets`
--

CREATE TABLE `annual_project_report_budgets` (
  `id` bigint NOT NULL,
  `report_item_id` bigint NOT NULL,
  `budget_type` enum('proposed','actual') NOT NULL,
  `source_key` enum('university','thonburiHospital','nursingFaculty','external') NOT NULL,
  `source_label` varchar(255) NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `annual_project_report_budgets`
--

INSERT INTO `annual_project_report_budgets` (`id`, `report_item_id`, `budget_type`, `source_key`, `source_label`, `amount`, `note`, `created_at`) VALUES
(1, 11, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'รออนุมัติ', '2026-07-01 10:03:41'),
(2, 12, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(3, 19, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(4, 22, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(5, 23, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบโรงพยาบาลธนบุรี', '2026-07-01 10:03:41'),
(6, 24, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(7, 27, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(8, 30, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบศิษย์เก่า', '2026-07-01 10:03:41'),
(9, 31, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(10, 32, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบสโมสร', '2026-07-01 10:03:41'),
(11, 41, 'proposed', 'nursingFaculty', 'nursingFaculty', 10000.00, '10,000 (มหาลัยตั้งงบให้ต่างหาก)', '2026-07-01 10:03:41'),
(12, 49, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบสโมสรนักศึกษา', '2026-07-01 10:03:41'),
(13, 50, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบสโมสรนักศึกษา', '2026-07-01 10:03:41'),
(14, 51, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(15, 53, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบคณะ', '2026-07-01 10:03:41'),
(16, 60, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(17, 101, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(18, 105, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบโรงพยาบาลธนบุรี', '2026-07-01 10:03:41'),
(19, 108, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ใช้งบคณะพยาบาลศาสตร์', '2026-07-01 10:03:41'),
(20, 110, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(21, 112, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(22, 114, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(23, 116, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(24, 118, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(25, 128, 'proposed', 'nursingFaculty', 'nursingFaculty', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(26, 135, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(27, 135, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(28, 136, 'proposed', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(29, 136, 'actual', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(30, 137, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(31, 137, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(32, 138, 'proposed', 'university', 'university', 133500.00, NULL, '2026-07-01 10:03:41'),
(33, 138, 'actual', 'university', 'university', 36000.00, NULL, '2026-07-01 10:03:41'),
(34, 139, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(35, 139, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(36, 140, 'proposed', 'university', 'university', 36000.00, NULL, '2026-07-01 10:03:41'),
(37, 140, 'actual', 'university', 'university', 36000.00, NULL, '2026-07-01 10:03:41'),
(38, 141, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(39, 141, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(40, 142, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(41, 142, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(42, 143, 'proposed', 'university', 'university', 97500.00, NULL, '2026-07-01 10:03:41'),
(43, 143, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(44, 144, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(45, 144, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(46, 145, 'proposed', 'university', 'university', 2966.00, NULL, '2026-07-01 10:03:41'),
(47, 145, 'actual', 'university', 'university', 2966.00, NULL, '2026-07-01 10:03:41'),
(48, 146, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(49, 146, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(50, 147, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(51, 147, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(52, 148, 'proposed', 'university', 'university', 2966.00, NULL, '2026-07-01 10:03:41'),
(53, 148, 'actual', 'university', 'university', 2966.00, NULL, '2026-07-01 10:03:41'),
(54, 149, 'proposed', 'university', 'university', 86816.00, NULL, '2026-07-01 10:03:41'),
(55, 149, 'actual', 'university', 'university', 75599.00, NULL, '2026-07-01 10:03:41'),
(56, 150, 'proposed', 'nursingFaculty', 'nursingFaculty', 1962.00, NULL, '2026-07-01 10:03:41'),
(57, 150, 'actual', 'nursingFaculty', 'nursingFaculty', 2162.00, NULL, '2026-07-01 10:03:41'),
(58, 151, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(59, 151, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(60, 152, 'proposed', 'university', 'university', 24200.00, NULL, '2026-07-01 10:03:41'),
(61, 152, 'actual', 'university', 'university', 12873.00, NULL, '2026-07-01 10:03:41'),
(62, 153, 'proposed', 'university', 'university', 15000.00, NULL, '2026-07-01 10:03:41'),
(63, 153, 'actual', 'university', 'university', 19010.00, NULL, '2026-07-01 10:03:41'),
(64, 154, 'proposed', 'university', 'university', 10214.00, NULL, '2026-07-01 10:03:41'),
(65, 154, 'actual', 'university', 'university', 12614.00, NULL, '2026-07-01 10:03:41'),
(66, 155, 'proposed', 'university', 'university', 18840.00, NULL, '2026-07-01 10:03:41'),
(67, 155, 'actual', 'university', 'university', 13140.00, NULL, '2026-07-01 10:03:41'),
(68, 155, 'actual', 'nursingFaculty', 'nursingFaculty', 1200.00, NULL, '2026-07-01 10:03:41'),
(69, 156, 'proposed', 'university', 'university', 14600.00, NULL, '2026-07-01 10:03:41'),
(70, 156, 'actual', 'university', 'university', 14600.00, NULL, '2026-07-01 10:03:41'),
(71, 157, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(72, 157, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(73, 158, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(74, 158, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(75, 159, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(76, 159, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(77, 160, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(78, 160, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(79, 161, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(80, 161, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(81, 162, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(82, 162, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(83, 163, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(84, 163, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(85, 164, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(86, 164, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(87, 165, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(88, 165, 'proposed', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(89, 165, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(90, 166, 'proposed', 'university', 'university', 767200.00, NULL, '2026-07-01 10:03:41'),
(91, 166, 'actual', 'university', 'university', 580949.00, NULL, '2026-07-01 10:03:41'),
(92, 167, 'proposed', 'external', 'external', 39000.00, NULL, '2026-07-01 10:03:41'),
(93, 167, 'actual', 'external', 'external', 56237.00, NULL, '2026-07-01 10:03:41'),
(94, 168, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(95, 168, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(96, 169, 'proposed', 'nursingFaculty', 'nursingFaculty', 200000.00, NULL, '2026-07-01 10:03:41'),
(97, 169, 'actual', 'nursingFaculty', 'nursingFaculty', 200000.00, NULL, '2026-07-01 10:03:41'),
(98, 170, 'proposed', 'university', 'university', 7500.00, NULL, '2026-07-01 10:03:41'),
(99, 170, 'actual', 'university', 'university', 4580.00, NULL, '2026-07-01 10:03:41'),
(100, 171, 'proposed', 'university', 'university', 4200.00, NULL, '2026-07-01 10:03:41'),
(101, 171, 'actual', 'university', 'university', 4200.00, NULL, '2026-07-01 10:03:41'),
(102, 172, 'proposed', 'nursingFaculty', 'nursingFaculty', 300000.00, NULL, '2026-07-01 10:03:41'),
(103, 172, 'actual', 'nursingFaculty', 'nursingFaculty', 300000.00, NULL, '2026-07-01 10:03:41'),
(104, 173, 'proposed', 'nursingFaculty', 'nursingFaculty', 5000.00, NULL, '2026-07-01 10:03:41'),
(105, 173, 'actual', 'nursingFaculty', 'nursingFaculty', 5000.00, NULL, '2026-07-01 10:03:41'),
(106, 174, 'proposed', 'university', 'university', 150000.00, NULL, '2026-07-01 10:03:41'),
(107, 174, 'proposed', 'external', 'external', 52000.00, NULL, '2026-07-01 10:03:41'),
(108, 174, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(109, 175, 'proposed', 'nursingFaculty', 'nursingFaculty', 5000.00, NULL, '2026-07-01 10:03:41'),
(110, 175, 'actual', 'nursingFaculty', 'nursingFaculty', 5000.00, NULL, '2026-07-01 10:03:41'),
(111, 176, 'proposed', 'nursingFaculty', 'nursingFaculty', 2500.00, NULL, '2026-07-01 10:03:41'),
(112, 176, 'actual', 'nursingFaculty', 'nursingFaculty', 3932.00, NULL, '2026-07-01 10:03:41'),
(113, 177, 'proposed', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(114, 177, 'actual', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(115, 178, 'proposed', 'university', 'university', 72600.00, NULL, '2026-07-01 10:03:41'),
(116, 178, 'actual', 'university', 'university', 77684.00, NULL, '2026-07-01 10:03:41'),
(117, 179, 'proposed', 'university', 'university', 16000.00, NULL, '2026-07-01 10:03:41'),
(118, 179, 'actual', 'university', 'university', 16000.00, NULL, '2026-07-01 10:03:41'),
(119, 180, 'proposed', 'university', 'university', 18000.00, NULL, '2026-07-01 10:03:41'),
(120, 180, 'actual', 'university', 'university', 18000.00, NULL, '2026-07-01 10:03:41'),
(121, 181, 'proposed', 'university', 'university', 38600.00, NULL, '2026-07-01 10:03:41'),
(122, 181, 'actual', 'university', 'university', 43684.00, NULL, '2026-07-01 10:03:41'),
(123, 182, 'proposed', 'university', 'university', 17000.00, NULL, '2026-07-01 10:03:41'),
(124, 182, 'actual', 'university', 'university', 17000.00, NULL, '2026-07-01 10:03:41'),
(125, 183, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(126, 183, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(127, 184, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(128, 184, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(129, 185, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(130, 185, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(131, 186, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(132, 186, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(133, 187, 'proposed', 'university', 'university', 17000.00, NULL, '2026-07-01 10:03:41'),
(134, 187, 'actual', 'university', 'university', 17000.00, NULL, '2026-07-01 10:03:41'),
(135, 188, 'proposed', 'university', 'university', 25610.00, NULL, '2026-07-01 10:03:41'),
(136, 188, 'actual', 'university', 'university', 19174.00, NULL, '2026-07-01 10:03:41'),
(137, 189, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(138, 189, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(139, 190, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(140, 190, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(141, 191, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(142, 191, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(143, 192, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(144, 192, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(145, 193, 'proposed', 'university', 'university', 1000.00, NULL, '2026-07-01 10:03:41'),
(146, 193, 'actual', 'university', 'university', 1000.00, NULL, '2026-07-01 10:03:41'),
(147, 194, 'proposed', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(148, 194, 'actual', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(149, 195, 'proposed', 'university', 'university', 22610.00, NULL, '2026-07-01 10:03:41'),
(150, 195, 'actual', 'university', 'university', 16174.00, NULL, '2026-07-01 10:03:41'),
(151, 196, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(152, 196, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(153, 197, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(154, 197, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(155, 198, 'proposed', 'university', 'university', 168880.00, NULL, '2026-07-01 10:03:41'),
(156, 198, 'actual', 'university', 'university', 153390.00, NULL, '2026-07-01 10:03:41'),
(157, 199, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(158, 199, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(159, 200, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(160, 200, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(161, 201, 'proposed', 'thonburiHospital', 'thonburiHospital', 120000.00, NULL, '2026-07-01 10:03:41'),
(162, 201, 'actual', 'thonburiHospital', 'thonburiHospital', 120000.00, NULL, '2026-07-01 10:03:41'),
(163, 202, 'proposed', 'university', 'university', 14530.00, NULL, '2026-07-01 10:03:41'),
(164, 202, 'actual', 'university', 'university', 14540.00, NULL, '2026-07-01 10:03:41'),
(165, 203, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(166, 203, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(167, 204, 'proposed', 'university', 'university', 24700.00, NULL, '2026-07-01 10:03:41'),
(168, 204, 'actual', 'university', 'university', 11200.00, NULL, '2026-07-01 10:03:41'),
(169, 205, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(170, 205, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(171, 206, 'proposed', 'university', 'university', 9650.00, NULL, '2026-07-01 10:03:41'),
(172, 206, 'actual', 'university', 'university', 7650.00, NULL, '2026-07-01 10:03:41'),
(173, 207, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(174, 207, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(175, 208, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(176, 208, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(177, 209, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(178, 209, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(179, 210, 'proposed', 'university', 'university', 2550.00, NULL, '2026-07-01 10:03:41'),
(180, 210, 'actual', 'university', 'university', 2550.00, NULL, '2026-07-01 10:03:41'),
(181, 211, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(182, 211, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(183, 212, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(184, 212, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(185, 213, 'proposed', 'university', 'university', 21000.00, NULL, '2026-07-01 10:03:41'),
(186, 213, 'actual', 'university', 'university', 14844.00, NULL, '2026-07-01 10:03:41'),
(187, 214, 'proposed', 'university', 'university', 11000.00, NULL, '2026-07-01 10:03:41'),
(188, 214, 'actual', 'university', 'university', 8798.00, NULL, '2026-07-01 10:03:41'),
(189, 215, 'proposed', 'university', 'university', 10000.00, NULL, '2026-07-01 10:03:41'),
(190, 215, 'actual', 'university', 'university', 6046.00, NULL, '2026-07-01 10:03:41'),
(191, 216, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(192, 216, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(193, 217, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(194, 217, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(195, 218, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(196, 218, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(197, 219, 'proposed', 'university', 'university', 20000.00, NULL, '2026-07-01 10:03:41'),
(198, 219, 'actual', 'university', 'university', 20000.00, NULL, '2026-07-01 10:03:41'),
(199, 220, 'proposed', 'university', 'university', 80000.00, NULL, '2026-07-01 10:03:41'),
(200, 220, 'actual', 'university', 'university', 80000.00, NULL, '2026-07-01 10:03:41'),
(201, 221, 'proposed', 'university', 'university', 8070.00, NULL, '2026-07-01 10:03:41'),
(202, 221, 'actual', 'university', 'university', 3900.00, NULL, '2026-07-01 10:03:41'),
(203, 222, 'proposed', 'university', 'university', 10000.00, NULL, '2026-07-01 10:03:41'),
(204, 222, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(205, 223, 'proposed', 'university', 'university', 250100.00, NULL, '2026-07-01 10:03:41'),
(206, 223, 'actual', 'university', 'university', 190541.00, NULL, '2026-07-01 10:03:41'),
(207, 224, 'proposed', 'university', 'university', 10000.00, NULL, '2026-07-01 10:03:41'),
(208, 224, 'actual', 'university', 'university', 9200.00, NULL, '2026-07-01 10:03:41'),
(209, 225, 'proposed', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(210, 225, 'actual', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(211, 226, 'proposed', 'university', 'university', 34800.00, NULL, '2026-07-01 10:03:41'),
(212, 226, 'proposed', 'external', 'external', 50000.00, NULL, '2026-07-01 10:03:41'),
(213, 226, 'actual', 'university', 'university', 28800.00, NULL, '2026-07-01 10:03:41'),
(214, 227, 'proposed', 'university', 'university', 18600.00, NULL, '2026-07-01 10:03:41'),
(215, 227, 'actual', 'university', 'university', 19341.00, NULL, '2026-07-01 10:03:41'),
(216, 228, 'proposed', 'external', 'external', 90000.00, NULL, '2026-07-01 10:03:41'),
(217, 228, 'actual', 'external', 'external', 90000.00, NULL, '2026-07-01 10:03:41'),
(218, 229, 'proposed', 'university', 'university', 46700.00, NULL, '2026-07-01 10:03:41'),
(219, 229, 'actual', 'university', 'university', 43200.00, NULL, '2026-07-01 10:03:41'),
(220, 230, 'proposed', 'university', 'university', 39250.00, NULL, '2026-07-01 10:03:41'),
(221, 230, 'actual', 'university', 'university', 43000.00, NULL, '2026-07-01 10:03:41'),
(222, 231, 'proposed', 'university', 'university', 444950.00, NULL, '2026-07-01 10:03:41'),
(223, 231, 'actual', 'university', 'university', 409701.00, NULL, '2026-07-01 10:03:41'),
(224, 232, 'proposed', 'thonburiHospital', 'thonburiHospital', 0.00, '*ไม่ระบุจำนวน', '2026-07-01 10:03:41'),
(225, 232, 'actual', 'thonburiHospital', 'thonburiHospital', 0.00, '*ไม่ระบุจำนวน', '2026-07-01 10:03:41'),
(226, 233, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(227, 233, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(228, 234, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(229, 234, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(230, 235, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(231, 235, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(232, 236, 'proposed', 'thonburiHospital', 'thonburiHospital', 300000.00, NULL, '2026-07-01 10:03:41'),
(233, 236, 'actual', 'thonburiHospital', 'thonburiHospital', 300000.00, NULL, '2026-07-01 10:03:41'),
(234, 237, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(235, 237, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(236, 238, 'proposed', 'thonburiHospital', 'thonburiHospital', 100000.00, NULL, '2026-07-01 10:03:41'),
(237, 238, 'actual', 'thonburiHospital', 'thonburiHospital', 100000.00, NULL, '2026-07-01 10:03:41'),
(238, 239, 'proposed', 'university', 'university', 14950.00, NULL, '2026-07-01 10:03:41'),
(239, 239, 'actual', 'university', 'university', 9700.50, NULL, '2026-07-01 10:03:41'),
(240, 240, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(241, 240, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(242, 241, 'proposed', 'university', 'university', 30000.00, NULL, '2026-07-01 10:03:41'),
(243, 241, 'actual', 'external', 'external', 0.00, '**รอ อ.นุชนาถ', '2026-07-01 10:03:41'),
(244, 242, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(245, 242, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(246, 243, 'proposed', 'thonburiHospital', 'thonburiHospital', 500000.00, NULL, '2026-07-01 10:03:41'),
(247, 243, 'actual', 'thonburiHospital', 'thonburiHospital', 500000.00, NULL, '2026-07-01 10:03:41'),
(248, 244, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(249, 244, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(250, 245, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(251, 245, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(252, 246, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(253, 246, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(254, 247, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(255, 247, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(256, 248, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(257, 248, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(258, 249, 'proposed', 'university', 'university', 19040.00, NULL, '2026-07-01 10:03:41'),
(259, 249, 'actual', 'university', 'university', 14840.00, NULL, '2026-07-01 10:03:41'),
(260, 250, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(261, 250, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(262, 251, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(263, 251, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(264, 252, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(265, 252, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(266, 253, 'proposed', 'university', 'university', 200000.00, NULL, '2026-07-01 10:03:41'),
(267, 253, 'actual', 'university', 'university', 200000.00, NULL, '2026-07-01 10:03:41'),
(268, 254, 'proposed', 'university', 'university', 33825.00, NULL, '2026-07-01 10:03:41'),
(269, 254, 'actual', 'university', 'university', 31230.00, NULL, '2026-07-01 10:03:41'),
(270, 255, 'proposed', 'university', 'university', 235280.00, NULL, '2026-07-01 10:03:41'),
(271, 255, 'actual', 'university', 'university', 64861.00, NULL, '2026-07-01 10:03:41'),
(272, 256, 'proposed', 'university', 'university', 200000.00, NULL, '2026-07-01 10:03:41'),
(273, 256, 'actual', 'university', 'university', 35000.00, NULL, '2026-07-01 10:03:41'),
(274, 257, 'proposed', 'university', 'university', 35280.00, NULL, '2026-07-01 10:03:41'),
(275, 257, 'actual', 'university', 'university', 29861.00, NULL, '2026-07-01 10:03:41'),
(276, 258, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(277, 258, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(278, 259, 'proposed', 'university', 'university', 3000.00, NULL, '2026-07-01 10:03:41'),
(279, 259, 'actual', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(280, 260, 'proposed', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(281, 260, 'actual', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(282, 261, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(283, 261, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(284, 262, 'proposed', 'university', 'university', 1000.00, NULL, '2026-07-01 10:03:41'),
(285, 262, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(286, 263, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(287, 263, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(288, 264, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(289, 264, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(290, 265, 'proposed', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(291, 265, 'actual', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(292, 266, 'proposed', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(293, 266, 'actual', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(294, 267, 'proposed', 'university', 'university', 7820.00, NULL, '2026-07-01 10:03:41'),
(295, 267, 'actual', 'university', 'university', 2101.00, NULL, '2026-07-01 10:03:41'),
(296, 268, 'proposed', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(297, 268, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(298, 269, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(299, 269, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(300, 270, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(301, 270, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(302, 271, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(303, 271, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(304, 272, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(305, 272, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(306, 273, 'proposed', 'university', 'university', 2100.00, NULL, '2026-07-01 10:03:41'),
(307, 273, 'actual', 'university', 'university', 2101.00, NULL, '2026-07-01 10:03:41'),
(308, 274, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(309, 274, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(310, 275, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(311, 275, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(312, 276, 'proposed', 'university', 'university', 5720.00, NULL, '2026-07-01 10:03:41'),
(313, 276, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(314, 277, 'proposed', 'nursingFaculty', 'nursingFaculty', 10400.00, NULL, '2026-07-01 10:03:41'),
(315, 277, 'actual', 'nursingFaculty', 'nursingFaculty', 10200.00, NULL, '2026-07-01 10:03:41'),
(316, 278, 'proposed', 'university', 'university', 120000.00, NULL, '2026-07-01 10:03:41'),
(317, 278, 'actual', 'university', 'university', 120001.00, NULL, '2026-07-01 10:03:41'),
(318, 279, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(319, 279, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(320, 280, 'proposed', 'thonburiHospital', 'thonburiHospital', 120000.00, NULL, '2026-07-01 10:03:41'),
(321, 280, 'actual', 'thonburiHospital', 'thonburiHospital', 120001.00, NULL, '2026-07-01 10:03:41'),
(322, 281, 'proposed', 'university', 'university', 11200.00, NULL, '2026-07-01 10:03:41'),
(323, 281, 'actual', 'university', 'university', 11200.00, NULL, '2026-07-01 10:03:41'),
(324, 282, 'proposed', 'university', 'university', 5600.00, NULL, '2026-07-01 10:03:41'),
(325, 282, 'actual', 'university', 'university', 5600.00, NULL, '2026-07-01 10:03:41'),
(326, 283, 'proposed', 'university', 'university', 5600.00, NULL, '2026-07-01 10:03:41'),
(327, 283, 'actual', 'university', 'university', 5600.00, NULL, '2026-07-01 10:03:41'),
(328, 284, 'proposed', 'university', 'university', 5600.00, NULL, '2026-07-01 10:03:41'),
(329, 284, 'actual', 'university', 'university', 5601.00, NULL, '2026-07-01 10:03:41'),
(330, 285, 'proposed', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(331, 285, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(332, 286, 'proposed', 'university', 'university', 59500.00, NULL, '2026-07-01 10:03:41'),
(333, 286, 'actual', 'university', 'university', 29000.00, NULL, '2026-07-01 10:03:41'),
(334, 287, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(335, 287, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(336, 288, 'proposed', 'university', 'university', 59500.00, NULL, '2026-07-01 10:03:41'),
(337, 288, 'actual', 'university', 'university', 29000.00, NULL, '2026-07-01 10:03:41'),
(338, 289, 'proposed', 'university', 'university', 0.00, 'ไม่ใช่งบ', '2026-07-01 10:03:41'),
(339, 289, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(340, 290, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(341, 290, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(342, 291, 'proposed', 'university', 'university', 40270.00, NULL, '2026-07-01 10:03:41'),
(343, 291, 'actual', 'university', 'university', 4001.00, NULL, '2026-07-01 10:03:41'),
(344, 292, 'proposed', 'external', 'external', 2000.00, NULL, '2026-07-01 10:03:41'),
(345, 292, 'actual', 'external', 'external', 2000.00, NULL, '2026-07-01 10:03:41'),
(346, 293, 'proposed', 'university', 'university', 18310.00, NULL, '2026-07-01 10:03:41'),
(347, 293, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(348, 294, 'proposed', 'university', 'university', 17960.00, NULL, '2026-07-01 10:03:41'),
(349, 294, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(350, 295, 'proposed', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(351, 295, 'actual', 'university', 'university', 0.00, 'ไม่่ใช่งบ', '2026-07-01 10:03:41'),
(352, 296, 'proposed', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(353, 296, 'actual', 'nursingFaculty', 'nursingFaculty', 2001.00, NULL, '2026-07-01 10:03:41'),
(354, 297, 'proposed', 'university', 'university', 50000.00, NULL, '2026-07-01 10:03:41'),
(355, 297, 'proposed', 'thonburiHospital', 'thonburiHospital', 50000.00, NULL, '2026-07-01 10:03:41'),
(356, 297, 'actual', 'university', 'university', 60000.00, NULL, '2026-07-01 10:03:41'),
(357, 297, 'actual', 'thonburiHospital', 'thonburiHospital', 60000.00, NULL, '2026-07-01 10:03:41'),
(358, 299, 'proposed', 'university', 'university', 0.00, 'งบจากหน่วยงานภายนอก', '2026-07-01 10:03:41'),
(359, 299, 'proposed', 'thonburiHospital', 'thonburiHospital', 0.00, 'รวม', '2026-07-01 10:03:41'),
(360, 300, 'proposed', 'university', 'university', 91000.00, NULL, '2026-07-01 10:03:41'),
(361, 300, 'proposed', 'thonburiHospital', 'thonburiHospital', 1443912.00, NULL, '2026-07-01 10:03:41'),
(362, 301, 'proposed', 'university', 'university', 140000.00, NULL, '2026-07-01 10:03:41'),
(363, 301, 'proposed', 'thonburiHospital', 'thonburiHospital', 1253340.00, NULL, '2026-07-01 10:03:41'),
(364, 302, 'proposed', 'university', 'university', 0.00, NULL, '2026-07-01 10:03:41'),
(365, 302, 'proposed', 'thonburiHospital', 'thonburiHospital', 469105.00, NULL, '2026-07-01 10:03:41'),
(366, 303, 'proposed', 'university', 'university', 0.00, NULL, '2026-07-01 10:03:41'),
(367, 303, 'proposed', 'thonburiHospital', 'thonburiHospital', 3000.00, NULL, '2026-07-01 10:03:41'),
(368, 304, 'proposed', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(369, 304, 'proposed', 'thonburiHospital', 'thonburiHospital', 354790.00, NULL, '2026-07-01 10:03:41'),
(370, 305, 'proposed', 'university', 'university', 233000.00, NULL, '2026-07-01 10:03:41'),
(371, 305, 'proposed', 'thonburiHospital', 'thonburiHospital', 3524147.00, NULL, '2026-07-01 10:03:41'),
(372, 306, 'proposed', 'university', 'university', 0.00, 'งบจากหน่วยงานภายนอก', '2026-07-01 10:03:41'),
(373, 306, 'proposed', 'thonburiHospital', 'thonburiHospital', 0.00, 'รวม', '2026-07-01 10:03:41'),
(374, 307, 'proposed', 'university', 'university', 56237.00, NULL, '2026-07-01 10:03:41'),
(375, 307, 'proposed', 'thonburiHospital', 'thonburiHospital', 1111556.00, NULL, '2026-07-01 10:03:41'),
(376, 308, 'proposed', 'university', 'university', 90000.00, NULL, '2026-07-01 10:03:41'),
(377, 308, 'proposed', 'thonburiHospital', 'thonburiHospital', 1158082.00, NULL, '2026-07-01 10:03:41'),
(378, 309, 'proposed', 'thonburiHospital', 'thonburiHospital', 296091.00, NULL, '2026-07-01 10:03:41'),
(379, 310, 'proposed', 'thonburiHospital', 'thonburiHospital', 2000.00, NULL, '2026-07-01 10:03:41'),
(380, 311, 'proposed', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(381, 311, 'proposed', 'thonburiHospital', 'thonburiHospital', 302104.00, NULL, '2026-07-01 10:03:41'),
(382, 312, 'proposed', 'university', 'university', 148237.00, NULL, '2026-07-01 10:03:41'),
(383, 312, 'proposed', 'thonburiHospital', 'thonburiHospital', 2869832.00, NULL, '2026-07-01 10:03:41'),
(384, 313, 'actual', 'external', 'external', 12000.00, NULL, '2026-07-01 10:03:41'),
(385, 314, 'actual', 'external', 'external', 12000.00, NULL, '2026-07-01 10:03:41'),
(386, 315, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(387, 316, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(388, 317, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(389, 318, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(390, 319, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(391, 320, 'actual', 'external', 'external', 68740.00, NULL, '2026-07-01 10:03:41'),
(392, 321, 'actual', 'university', 'university', 26978.00, NULL, '2026-07-01 10:03:41'),
(393, 323, 'actual', 'university', 'university', 15035.00, NULL, '2026-07-01 10:03:41'),
(394, 324, 'actual', 'university', 'university', 6000.00, NULL, '2026-07-01 10:03:41'),
(395, 325, 'actual', 'university', 'university', 15000.00, NULL, '2026-07-01 10:03:41'),
(396, 326, 'actual', 'university', 'university', 23875.00, NULL, '2026-07-01 10:03:41'),
(397, 327, 'actual', 'university', 'university', 300000.00, NULL, '2026-07-01 10:03:41'),
(398, 328, 'actual', 'university', 'university', 15000.00, NULL, '2026-07-01 10:03:41'),
(399, 329, 'actual', 'university', 'university', 30000.00, NULL, '2026-07-01 10:03:41'),
(400, 330, 'actual', 'university', 'university', 37500.00, NULL, '2026-07-01 10:03:41'),
(401, 332, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(402, 333, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(403, 334, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(404, 335, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(405, 336, 'actual', 'thonburiHospital', 'thonburiHospital', 140000.00, NULL, '2026-07-01 10:03:41'),
(406, 337, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(407, 338, 'actual', 'university', 'university', 14800.00, NULL, '2026-07-01 10:03:41'),
(408, 339, 'actual', 'university', 'university', 50952.00, NULL, '2026-07-01 10:03:41'),
(409, 340, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(410, 341, 'actual', 'nursingFaculty', 'nursingFaculty', 250000.00, NULL, '2026-07-01 10:03:41'),
(411, 341, 'actual', 'external', 'external', 275286.00, NULL, '2026-07-01 10:03:41'),
(412, 342, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(413, 343, 'actual', 'external', 'external', 275286.00, NULL, '2026-07-01 10:03:41'),
(414, 344, 'actual', 'external', 'external', 102500.00, NULL, '2026-07-01 10:03:41'),
(415, 345, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(416, 346, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(417, 347, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(418, 348, 'actual', 'thonburiHospital', 'thonburiHospital', 300000.00, NULL, '2026-07-01 10:03:41'),
(419, 349, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(420, 350, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(421, 351, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(422, 352, 'actual', 'university', 'university', 14887.00, NULL, '2026-07-01 10:03:41'),
(423, 353, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(424, 354, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(425, 355, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(426, 356, 'actual', 'university', 'university', 5000.00, NULL, '2026-07-01 10:03:41'),
(427, 356, 'actual', 'nursingFaculty', 'nursingFaculty', 404500.00, NULL, '2026-07-01 10:03:41'),
(428, 356, 'actual', 'external', 'external', 10260.00, NULL, '2026-07-01 10:03:41'),
(429, 357, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(430, 358, 'actual', 'nursingFaculty', 'nursingFaculty', 2500.00, NULL, '2026-07-01 10:03:41'),
(431, 359, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(432, 360, 'actual', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(433, 361, 'actual', 'external', 'external', 3760.00, NULL, '2026-07-01 10:03:41'),
(434, 362, 'actual', 'external', 'external', 500.00, NULL, '2026-07-01 10:03:41'),
(435, 363, 'actual', 'external', 'external', 5000.00, NULL, '2026-07-01 10:03:41'),
(436, 364, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(437, 365, 'actual', 'external', 'external', 1000.00, NULL, '2026-07-01 10:03:41'),
(438, 366, 'actual', 'nursingFaculty', 'nursingFaculty', 400000.00, NULL, '2026-07-01 10:03:41'),
(439, 367, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(440, 368, 'actual', 'university', 'university', 8600.00, NULL, '2026-07-01 10:03:41'),
(441, 369, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(442, 370, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(443, 371, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(444, 372, 'actual', 'university', 'university', 2100.00, NULL, '2026-07-01 10:03:41'),
(445, 373, 'actual', 'university', 'university', 6500.00, NULL, '2026-07-01 10:03:41'),
(446, 374, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(447, 375, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(448, 376, 'actual', 'thonburiHospital', 'thonburiHospital', 300000.00, NULL, '2026-07-01 10:03:41'),
(449, 377, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(450, 378, 'actual', 'thonburiHospital', 'thonburiHospital', 300000.00, NULL, '2026-07-01 10:03:41'),
(451, 379, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(452, 380, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(453, 381, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(454, 382, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(455, 383, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(456, 384, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(457, 385, 'actual', 'external', 'external', 2000.00, NULL, '2026-07-01 10:03:41'),
(458, 386, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(459, 387, 'actual', 'university', 'university', 140058.40, NULL, '2026-07-01 10:03:41'),
(460, 388, 'actual', 'university', 'university', 30000.00, NULL, '2026-07-01 10:03:41'),
(461, 389, 'actual', 'university', 'university', 40000.00, NULL, '2026-07-01 10:03:41'),
(462, 390, 'actual', 'university', 'university', 10200.00, NULL, '2026-07-01 10:03:41'),
(463, 391, 'actual', 'university', 'university', 40558.40, NULL, '2026-07-01 10:03:41'),
(464, 392, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(465, 393, 'actual', 'university', 'university', 19300.00, NULL, '2026-07-01 10:03:41'),
(466, 394, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(467, 395, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(468, 396, 'actual', 'university', 'university', 24874.00, NULL, '2026-07-01 10:03:41'),
(469, 397, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(470, 398, 'actual', 'university', 'university', 12000.00, NULL, '2026-07-01 10:03:41'),
(471, 399, 'actual', 'university', 'university', 12874.00, NULL, '2026-07-01 10:03:41'),
(472, 400, 'actual', 'university', 'university', 15034.00, NULL, '2026-07-01 10:03:41'),
(473, 401, 'actual', 'university', 'university', 18520.00, NULL, '2026-07-01 10:03:41'),
(474, 402, 'actual', 'university', 'university', 36215.33, NULL, '2026-07-01 10:03:41'),
(475, 403, 'actual', 'university', 'university', 6500.00, NULL, '2026-07-01 10:03:41'),
(476, 404, 'actual', 'university', 'university', 0.00, 'ไม่ได้รับการอนุมัติ', '2026-07-01 10:03:41'),
(477, 405, 'actual', 'university', 'university', 30000.00, NULL, '2026-07-01 10:03:41'),
(478, 406, 'actual', 'university', 'university', 2990.00, NULL, '2026-07-01 10:03:41'),
(479, 406, 'actual', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(480, 407, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(481, 408, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(482, 409, 'actual', 'nursingFaculty', 'nursingFaculty', 2000.00, NULL, '2026-07-01 10:03:41'),
(483, 410, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(484, 411, 'actual', 'university', 'university', 990.00, NULL, '2026-07-01 10:03:41'),
(485, 412, 'actual', 'university', 'university', 2000.00, NULL, '2026-07-01 10:03:41'),
(486, 413, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(487, 414, 'actual', 'university', 'university', 36513.59, NULL, '2026-07-01 10:03:41'),
(488, 414, 'actual', 'thonburiHospital', 'thonburiHospital', 140000.00, NULL, '2026-07-01 10:03:41'),
(489, 414, 'actual', 'nursingFaculty', 'nursingFaculty', 1500.00, NULL, '2026-07-01 10:03:41'),
(490, 415, 'actual', 'thonburiHospital', 'thonburiHospital', 140000.00, NULL, '2026-07-01 10:03:41'),
(491, 416, 'actual', 'university', 'university', 27448.59, NULL, '2026-07-01 10:03:41'),
(492, 417, 'actual', 'university', 'university', 9065.00, NULL, '2026-07-01 10:03:41'),
(493, 418, 'actual', 'nursingFaculty', 'nursingFaculty', 1500.00, NULL, '2026-07-01 10:03:41'),
(494, 419, 'actual', 'university', 'university', 20128.20, NULL, '2026-07-01 10:03:41'),
(495, 420, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(496, 421, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(497, 422, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(498, 423, 'actual', 'university', 'university', 17778.20, NULL, '2026-07-01 10:03:41'),
(499, 424, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(500, 425, 'actual', 'university', 'university', 2350.00, NULL, '2026-07-01 10:03:41'),
(501, 426, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(502, 427, 'actual', 'university', 'university', 89947.00, NULL, '2026-07-01 10:03:41'),
(503, 428, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(504, 429, 'actual', 'university', 'university', 15928.00, NULL, '2026-07-01 10:03:41'),
(505, 430, 'actual', 'university', 'university', 22270.00, NULL, '2026-07-01 10:03:41'),
(506, 431, 'actual', 'university', 'university', 18796.00, NULL, '2026-07-01 10:03:41'),
(507, 432, 'actual', 'university', 'university', 18364.00, NULL, '2026-07-01 10:03:41'),
(508, 433, 'actual', 'university', 'university', 14589.00, NULL, '2026-07-01 10:03:41'),
(509, 434, 'actual', 'university', 'university', 17471.00, NULL, '2026-07-01 10:03:41'),
(510, 435, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(511, 436, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(512, 437, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(513, 438, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(514, 439, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(515, 440, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(516, 441, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(517, 442, 'actual', 'university', 'university', 0.00, 'ไม่ใช้งบ', '2026-07-01 10:03:41'),
(518, 443, 'actual', 'university', 'university', 11340.00, NULL, '2026-07-01 10:03:41'),
(519, 444, 'actual', 'university', 'university', 6131.00, NULL, '2026-07-01 10:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `annual_project_report_documents`
--

CREATE TABLE `annual_project_report_documents` (
  `id` bigint NOT NULL,
  `report_item_id` bigint NOT NULL,
  `document_type` enum('approved_budget','summary_report') NOT NULL,
  `url` text NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `annual_project_report_documents`
--

INSERT INTO `annual_project_report_documents` (`id`, `report_item_id`, `document_type`, `url`, `label`, `created_at`) VALUES
(1, 2, 'summary_report', 'https://drive.google.com/file/d/18W_0OGkrBf78IV2pj50IOB62eCK-z7IT/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(2, 3, 'summary_report', 'https://drive.google.com/file/d/1xaPtZwun-j8NQ9phWiZDh3m4zvCB6kM2/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(3, 4, 'summary_report', 'https://drive.google.com/file/d/1ZlDG7ZGWWxxp_DSaE35Dww8NycbMZVof/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(4, 6, 'summary_report', 'https://drive.google.com/file/d/1MF3nw9SPb64_LsaxPbojVBjdid_T9MY4/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(5, 7, 'summary_report', 'https://drive.google.com/file/d/1l0obib2kVOMql_68G9M7Ccr6QT1szgTh/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(6, 8, 'summary_report', 'https://drive.google.com/file/d/1Ln0x0PXQYSjCN46KcjVppyU1Roary371/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(7, 10, 'approved_budget', 'https://drive.google.com/file/d/1bLSv6NYhO1scqotgWDbNF0WA8WAs7jix/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(8, 11, 'summary_report', 'https://drive.google.com/file/d/1w94FLnEqdbksj52cHMV9MsVdR-6_E_Kw/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(9, 12, 'summary_report', 'https://drive.google.com/file/d/1Vo2pc--gV4XIGC_nqU7oLwVfjhnpptzh/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(10, 15, 'approved_budget', 'https://drive.google.com/file/d/1Y-krdhtTnro_xrqtJ2KHtyWKwIGE7uBP/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(11, 15, 'summary_report', 'https://drive.google.com/file/d/1hZ-7gOiTpa70_3Q4XFudbV2zNPgHFgPp/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(12, 16, 'approved_budget', 'https://drive.google.com/file/d/1lAq-3Bmgi3QQjZBDW12Hk15UIZBYeTOf/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(13, 17, 'approved_budget', 'https://drive.google.com/file/d/1w0KWZq2Pok29v2A86-LpjkDWkFkIenMz/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(14, 19, 'summary_report', 'https://drive.google.com/file/d/1amSXDm9LbIryttJrEtrxsYQ2k7Wmql1F/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(15, 20, 'summary_report', 'https://drive.google.com/file/d/1yXf28ZFm8X-cKOtpgtMpGDTJ4gTLIq-x/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(16, 21, 'summary_report', 'https://drive.google.com/file/d/1TWteb7YRKAdiSANdYHuQxKzoufZ1qDoa/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(17, 22, 'summary_report', 'https://drive.google.com/file/d/1fSBddXm6aBZwvcXX4uTfumTrn7o_KGwb/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(18, 23, 'summary_report', 'https://drive.google.com/file/d/1i6_93UIjp2DliU0fPSrFfropht-uZrhS/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(19, 24, 'summary_report', 'https://drive.google.com/file/d/1HUE0BtPg2gvct4HHHrhtQ9C71HFdDIyO/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(20, 25, 'approved_budget', 'https://drive.google.com/file/d/1CLCT7AWVPu9rcK51bmZ5AGu3NTYKH9WO/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(21, 26, 'approved_budget', 'https://drive.google.com/file/d/1JdNLaQUu7NPyJI_vyapymtrn0zHmfgHN/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(22, 27, 'summary_report', 'https://drive.google.com/file/d/1TawnTjmiqvgBa2FgDq4OPCPd-VUPUGXf/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(23, 30, 'summary_report', 'https://drive.google.com/file/d/1DTtVYHBq10BwreP8StPWrSh6glfWkCO1/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(24, 31, 'summary_report', 'https://drive.google.com/file/d/10uh8YckRBb1N77jhea3MFTA3RIGZo0Fq/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(25, 32, 'summary_report', 'https://drive.google.com/file/d/1dTbEblj1Qk4556_bcRFauA00tWlCK2rq/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(26, 33, 'summary_report', 'https://drive.google.com/file/d/1RXQbV4qizg6SZzeuk4jp84PA8_waO9Jb/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(27, 34, 'summary_report', 'https://drive.google.com/file/d/1YPdoEKufNJkO_ADf6V168LB4zMDmKCBp/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(28, 39, 'summary_report', 'https://drive.google.com/file/d/1pZ61or4fyVibNUz5a6Lvrg_A7yQlOxoC/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(29, 40, 'summary_report', 'https://drive.google.com/file/d/1MlCj41BBmUAsPoVw5o5y5g2M2Tn1H6cm/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(30, 41, 'summary_report', 'https://drive.google.com/file/d/1tYUpl90NCEs9Zbf2XXGAyV6l-Iv_crdB/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(31, 44, 'summary_report', 'https://drive.google.com/file/d/1jCv2lRczkVP5X1xbZ04L1rozHEpgS6L-/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(32, 45, 'summary_report', 'https://drive.google.com/file/d/1x-gXUzpJVptuMkCVkpg2b3jcFFO1uvcG/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(33, 46, 'summary_report', 'https://drive.google.com/file/d/15x_4j730y7vBjtGDvzRQbnjwS9-nXGqX/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(34, 48, 'summary_report', 'https://drive.google.com/file/d/1w-XTyORbTA6UTLgg0sjBYZlP09zoMCZB/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(35, 49, 'summary_report', 'https://drive.google.com/file/d/1_-1bCCch9xG9kFHykRQbGsLCXnz4Xq09/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(36, 50, 'summary_report', 'https://drive.google.com/file/d/1stM8fqcNCpAovXrQQoZ0XGgTJ4wWrE52/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(37, 51, 'summary_report', 'https://drive.google.com/file/d/1eH85aYwdP9A6k8sQWYzjLquqDPaPIm3R/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(38, 52, 'summary_report', 'https://drive.google.com/file/d/1e3d7u1ZVaqsbT5T6DVdTl-gwJUpglFEe/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(39, 53, 'summary_report', 'https://drive.google.com/file/d/1YRy4XeJRXg2sPIOGRWkVPghLQtRixPDy/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(40, 54, 'approved_budget', 'https://drive.google.com/file/d/1eS_wZGv6CGE-ztDEyPztAmZAwjkgxNBQ/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(41, 54, 'summary_report', 'https://drive.google.com/file/d/1X9zot66YnAQKZjSExxrJDSOEOhjFKCQr/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(42, 55, 'summary_report', 'https://drive.google.com/file/d/1mzyNAVbZBFKigY67wMXS2lmutWv8Q0q-/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(43, 59, 'summary_report', 'https://drive.google.com/file/d/16-WXyRkmxt7-l2CRrNZuHDRQG3RE7rrq/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(44, 60, 'summary_report', 'https://drive.google.com/file/d/18ioTYxMsuGqCBbDCTcXmryzsSFTYHOHL/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(45, 63, 'summary_report', 'https://drive.google.com/file/d/1Nf7jPUQs-6_0wrFPVSeBtogjNGvZ6JjU/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(46, 64, 'summary_report', 'https://drive.google.com/file/d/1zZRxSTfcv-UniEjEIkPjMJMeWx0c4LUe/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(47, 66, 'summary_report', 'https://drive.google.com/file/d/1XfWXcobgSsmAVA1nI9MhalSjO8fIbPTn/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(48, 67, 'summary_report', 'https://drive.google.com/file/d/1i5QJstdll7_qfNQMc0YurKD5Fzqtt8FO/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(49, 71, 'summary_report', 'https://drive.google.com/file/d/1Zut8i74FCSqynszut9Lkardn1VnuKVcP/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(50, 72, 'summary_report', 'https://drive.google.com/file/d/1-tVk7iMvulDH06owGjmiisYxsEEvLjZ3/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(51, 77, 'summary_report', 'https://drive.google.com/file/d/1pJyB6sxf2j-7sICxMJguJYPkJpRuWhsB/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(52, 79, 'summary_report', 'https://drive.google.com/file/d/1fOf3Z3n9Y1aoHT2noPWyIhIERxupUe_J/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(53, 80, 'summary_report', 'https://drive.google.com/file/d/1JuER0fxk-Q-xF0S5iXiRtBAI2lVvM2IC/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(54, 81, 'summary_report', 'https://drive.google.com/file/d/1ik65lxazzuOrzNgPO1Yvmxj4RVVoCaMa/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(55, 82, 'summary_report', 'https://drive.google.com/file/d/14xDapEYkeRCGNB5SleeUTumuz3NR8Xtm/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(56, 86, 'approved_budget', 'https://drive.google.com/file/d/1a_pkBnEDkMbOmEZ7eiPJyoZsERvZS5P3/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(57, 86, 'summary_report', 'https://drive.google.com/file/d/1Gi901qoP3sGvb6U0lbr_Dt-S9dyoAFS0/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(58, 87, 'summary_report', 'https://drive.google.com/file/d/1PYkxxZnFpgoL3s-cQo5Pjy8lBxcMkzrD/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(59, 88, 'summary_report', 'https://drive.google.com/file/d/1PfWXjQtHZ5GH1Vqx-ChbvH_cw1y7sirP/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(60, 89, 'summary_report', 'https://drive.google.com/file/d/1k-CLEFHxzwQer47GOay1E5kd3By72CZx/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(61, 90, 'approved_budget', 'https://drive.google.com/file/d/1afnm5weH6aRHy1FsWnFyP93Dog-9mIMV/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(62, 90, 'summary_report', 'https://drive.google.com/file/d/13jOYmgvtgRvD_OT3P-dWsRomjSk8BPEG/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(63, 93, 'approved_budget', 'https://drive.google.com/file/d/1lyQPFlY06E2r9n8EZP2g3GaUYXCYt3HT/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(64, 93, 'summary_report', 'https://drive.google.com/file/d/1RSmOu21_LKVXLbMYnHRYm9nJ0NlkRxTm/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(65, 94, 'approved_budget', 'https://drive.google.com/file/d/1lZkuEx2dsAzd9UkB41ZNNmmqrNGlMBCH/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(66, 95, 'approved_budget', 'https://drive.google.com/file/d/1qx3_C4La8UizEqoogxQeDX-a5oZQ30r0/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(67, 95, 'summary_report', 'https://drive.google.com/file/d/1sM4n8juVSRUHK6-9bNKEI8kl7NAHdExq/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(68, 96, 'approved_budget', 'https://drive.google.com/file/d/1Ms52OO9G-YEMPREXOpIYnIT4xlV9ibOz/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(69, 98, 'summary_report', 'https://drive.google.com/file/d/1gxcsBS3j9pzqAccAdCxfOee1nqF_zKDh/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(70, 99, 'summary_report', 'https://drive.google.com/file/d/1ZMFkQJHYTJv4r7MtCU3Hq88Vb0Y_EqeE/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(71, 101, 'summary_report', 'https://drive.google.com/file/d/1xZUhBR1ryqBBcFwRahPxzs7S6Z9OFSMR/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(72, 102, 'summary_report', 'https://drive.google.com/file/d/1BLc4G5ukMmpf3YFjfcjKKCFJqZZlqkuJ/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(73, 103, 'approved_budget', 'https://drive.google.com/file/d/1TTdAMKZqfk22GIhKCjtqNYqGHGOb5KJz/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(74, 103, 'summary_report', 'https://drive.google.com/file/d/1NOLTIUmVJZTrkfrwA-rnOknrVCNpsvvT/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(75, 105, 'summary_report', 'https://drive.google.com/file/d/1IRCB7hgjepVILmcc3DOi3tNKVmhJY0Ao/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(76, 106, 'summary_report', 'https://drive.google.com/file/d/11JWkFNsIRTLZGBpPLvImaXmUfjPDz4D3/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(77, 107, 'approved_budget', 'https://drive.google.com/file/d/1vbRY8Q_p9wZwRTJECjbRcJpMCyyWP_vz/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(78, 108, 'summary_report', 'https://drive.google.com/file/d/1X1CnftqDxYuNn1cRn2_7yRuJ0DABN4et/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(79, 110, 'summary_report', 'https://drive.google.com/file/d/1V1P8w7ReaAFdThWfhfMC3Tf1h0RzkwTQ/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(80, 111, 'approved_budget', 'https://drive.google.com/file/d/1Hg27hROw3WvLAH3Hvfk03z1rqgfJfnrD/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(81, 111, 'summary_report', 'https://drive.google.com/file/d/14NhLbwgZfgQoEoq4jER4Tf2RxwtWmbcl/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(82, 112, 'summary_report', 'https://drive.google.com/file/d/1vIgOpMlSvH-BLcaVAYb0itvWasbwzjNR/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(83, 113, 'approved_budget', 'https://drive.google.com/file/d/1Hhx2rVwR1U9rKumJ4JBw_dGETssOFT4V/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(84, 114, 'summary_report', 'https://drive.google.com/file/d/16qYW8axTXEM_qT4FxejL8XW5LLmS9yJs/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(85, 115, 'approved_budget', 'https://drive.google.com/file/d/1m6ytmm7iA_R6fc6D7kQnS7nnez4w2ZIs/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(86, 115, 'summary_report', 'https://drive.google.com/file/d/1tFicTkKEYh0WZL0SB6AMKVwSqmbXXK-m/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(87, 116, 'summary_report', 'https://drive.google.com/file/d/1_C1TYO3Fxo07X5nbDR5Cqvxo9smaM_9s/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(88, 118, 'summary_report', 'https://drive.google.com/file/d/1E-1HgejctgtBdCBpc9nS8HRfElaQbGvu/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(89, 119, 'approved_budget', 'https://drive.google.com/file/d/1GKP4KAaxVUgNUGfyEJbxVKm-411k3qME/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(90, 119, 'summary_report', 'https://drive.google.com/file/d/16rfjXTXuBqYjKas2jNTstUfgozbB_SyA/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(91, 120, 'approved_budget', 'https://drive.google.com/file/d/1sJxicrcfNqYnHnIsbNOrq0B3WlEySIpP/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(92, 121, 'approved_budget', 'https://drive.google.com/file/d/1s_m188hztRzLsClEwKPmsB9FD0RuKu4n/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(93, 122, 'approved_budget', 'https://drive.google.com/file/d/1dqqAPt2Rr7zesHhhZSwOilTg9ZoApvr8/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(94, 123, 'approved_budget', 'https://drive.google.com/file/d/1V7riErfSGccOBV8OfPyL_5NPK5w30EwW/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41'),
(95, 126, 'summary_report', 'https://drive.google.com/file/d/1WisMexldUm6ulzTyvnQIjvLbkcKoM0QX/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(96, 127, 'summary_report', 'https://drive.google.com/file/d/17EYWFClwUOlIWnpfaWrd1k4pFNbP9y6v/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(97, 128, 'summary_report', 'https://drive.google.com/file/d/16jPZ3W4zANZNpAVYViXmkblz3bWvINqb/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(98, 129, 'summary_report', 'https://drive.google.com/file/d/1YNUQxrip_-M8XxikaCiemSEwiYN_NzAA/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(99, 130, 'summary_report', 'https://drive.google.com/file/d/1TYxvoVeOxpGnYrRVqhw0_rkecm7koziV/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(100, 132, 'summary_report', 'https://drive.google.com/file/d/1Bzw95VyNBIFYm26s35vkqMUSCUaWYnvS/view?usp=sharing', 'summary_report', '2026-07-01 10:03:41'),
(101, 134, 'approved_budget', 'https://drive.google.com/file/d/13eq9affWu2QApEYMVnY3C-UJ_uQrozrx/view?usp=sharing', 'approved_budget', '2026-07-01 10:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `annual_project_report_items`
--

CREATE TABLE `annual_project_report_items` (
  `id` bigint NOT NULL,
  `import_batch_id` bigint DEFAULT NULL,
  `academic_year` int NOT NULL,
  `strategy` varchar(255) DEFAULT NULL,
  `plan_name` text,
  `objective` text,
  `kpi` text,
  `project_code` varchar(100) DEFAULT NULL,
  `project_name` text NOT NULL,
  `activity_name` text,
  `row_type` enum('project','activity') NOT NULL DEFAULT 'project',
  `parent_item_id` bigint DEFAULT NULL,
  `responsible_person` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `raw_row_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `annual_project_report_items`
--

INSERT INTO `annual_project_report_items` (`id`, `import_batch_id`, `academic_year`, `strategy`, `plan_name`, `objective`, `kpi`, `project_code`, `project_name`, `activity_name`, `row_type`, `parent_item_id`, `responsible_person`, `sort_order`, `raw_row_json`, `created_at`, `updated_at`) VALUES
(1, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68001', 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', NULL, 'project', NULL, 'ผศ.ดร.รอญ.วิภานันท์', 1, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(2, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.1 วิจัยและนวัตกรรมสาขาสูติศาสตร์', 'activity', 1, 'อ.สุกฤตา', 2, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(3, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.2 วิจัยและนวัตกรรมสาขาผู้ใหญ่', 'activity', 1, 'อ.รัตนาภรณ์', 3, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(4, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.3 วิจัยและนวัตกรรมสาขาเด็กและวัยรุ่น', 'activity', 1, 'อ.ธัญลักษณ์วดี', 4, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(5, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.4 วิจัยและนวัตกรรมสาขาจิตเวช', 'activity', 1, 'ดร.สุวรรณา', 5, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(6, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.5 วิจัยและนวัตกรรมสาขาชุมชน', 'activity', 1, 'อ.รัฐกานต์', 6, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(7, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.6 วิจัยและนวัตกรรมสาขาผู้สูงอายุ', 'activity', 1, 'ดร.ปรียธิดา', 7, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(8, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68002', 'โครงการส่งเสริมการวิจัยและนวัตกรรมร่วมกับเครือข่ายสถานพยาบาลหรือชุมชนเพื่อสุขภาวะชุมชนและสังคม (SDG 3)', NULL, 'project', NULL, 'อ.นฤมล', 8, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(9, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68003', 'โครงการ Siam Nurse IRB', NULL, 'project', NULL, 'อ.ขวัญเรือน', 9, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(10, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68004', 'โครงการ สนับสนุนการตีพิมพ์ผลงานใน SCOPUS', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 10, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(11, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68005', 'โครงการ ตีพิมพ์เผยแพร่งานวิจัยและนวัตกรรม', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 11, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(12, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68006', 'โครงการ Siam Nurse Innovation to Patent', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 12, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(13, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68007', 'โครงการ สนับสนุนการตีพิมพ์และเผยแพร่ผลงานผ่านวารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 13, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(14, 1, 2568, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', NULL, NULL, NULL, '2091101 - 68008', 'โครงการ การนำเสนองานวิจัยและนวัตกรรมในการประชุมวิชาการประจำปีระดับชาติ สสอท. สาขาพยาบาลศาสตร์', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 14, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(15, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68009', 'โครงการ ติดตามผลการดำเนินงานและพัฒนาแผนหลักสูตร', NULL, 'project', NULL, 'ผศ.ดร.วััฒนีย์', 15, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(16, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68010', 'โครงการ ติวเตรียมสอบภาษาอังกฤษ placement test', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 16, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(17, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68011', 'โครงการ English Camp', NULL, 'project', NULL, 'ดร.วราภรณ์', 17, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(18, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68012', 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 18, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(19, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.1 พัฒนาทักษะภาษา ปี 1', 'activity', 18, 'ผศ.ดร.วัฒนีย์', 19, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(20, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.2 พัฒนาทักษะภาษา ปี 2', 'activity', 18, 'ผศ.วารุณี', 20, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(21, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.3 พัฒนาทักษะภาษา ปี 3', 'activity', 18, 'อ.ธัญลักษณ์วดี', 21, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(22, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.4 พัฒนาทักษะภาษา ปี 4', 'activity', 18, 'ผศ.ดร.จรัสดาว', 22, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(23, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68013', 'โครงการ แลกเปลี่ยนนักศึกษาระหว่างประเทศ', NULL, 'project', NULL, 'ดร.วราภรณ์', 23, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(24, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68014', 'โครงการ พัฒนาทักษะดิจิทัลแก่นักศึกษาพยาบาล', NULL, 'project', NULL, 'อ.รัฐกานต์', 24, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(25, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68015', 'โครงการ เปิดบ้านพบผู้ประกอบการ', NULL, 'project', NULL, 'อ.สุจิตราภรณ์', 25, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(26, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68016', 'โครงการ เตรียมสอบใบอนุญาตประกอบวิชาชีพ', NULL, 'project', NULL, 'ผศ.ดร.รอญ.วิภานันท์', 26, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(27, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68017', 'โครงการ ติดตามประเมินคุณภาพบัณฑิต', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 27, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(28, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68018', 'โครงการ ศิษย์เก่าสัมพันธ์', NULL, 'project', NULL, 'อ.ชัยสิทธิ์', 28, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(29, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.1 เปิดโลกกว้างสู่เรียนรู้ตลอดชีวิต Open resource learning', 'activity', 28, 'อ.ชัยสิทธิ์/อ.เพ็ญรุ่ง', 29, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(30, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.2 ประชุมวิชาการศิษย์เก่า', 'activity', 28, 'อ.สุภาภรณ์', 30, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(31, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.3 คืนสู่เหย้า ดอกปีบคืนต้น', 'activity', 28, 'อ.ชัยสิทธิ์/ดร.วราภรณ์', 31, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(32, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.4 ส่งใจให้บัณฑิตใหม่', 'activity', 28, 'ผศ.ภัทรพร/สโมสรนักศึกษา', 32, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(33, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68019', 'โครงการ พัฒนานักศึกษาเพื่อการแข่งขันนวัตกรรม/โครงการ/START UP', NULL, 'project', NULL, 'อ.รัฐกานต์', 33, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(34, 1, 2568, 'ยุทธศาสตร์ที่ 2: Future Education', NULL, NULL, NULL, '2091101 - 68020', 'โครงการ ส่งประกวดสิ่งประดิษฐ์ผลงานนักศึกษาและการจดทรัพย์สินทางปัญญา', NULL, 'project', NULL, 'ผศ.วารุณี', 34, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(35, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68021', 'โครงการพัฒนาศักยภาพอาจารย์เพื่อรับรางวัลระดับชาติและนานาชาติ', NULL, 'project', NULL, 'ผศ.ดร.อรทิพา', 35, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(36, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68022', 'โครงการพัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 36, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(37, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการพัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', 'ก.1 ประเมินและพัฒนาความพึงพอใจสิ่งสนับสนุนการเรียนรู้', 'activity', 36, 'ผศ.ดร.สมฤดี', 37, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(38, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการพัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', 'ก.2 ประเมินและพัฒนากระบวนการบริการนักศึกษาระดับคณะฯ (เลขานุการ) และประเมินความพึงพอใจ', 'activity', 36, 'ผศ.ดร.สมฤดี', 38, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(39, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68023', 'โครงการ พัฒนาการให้คำปรึกษาและติดตามศิษย์แก่อาจารย์', NULL, 'project', NULL, 'อ.ธารทิพย์', 39, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(40, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68024', 'โครงการคัดเลือกนักศึกษาเข้าศึกษา', NULL, 'project', NULL, 'ผศ.วารุณี/นักศึกษา', 40, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(41, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการคัดเลือกนักศึกษาเข้าศึกษา', 'ก.1 Open house เพื่อการประชาสัมพันธ์สรรหา', 'activity', 40, 'ผศ.ภัทรพร/สโมสรนักศึกษา', 41, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(42, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการคัดเลือกนักศึกษาเข้าศึกษา', 'ก.2 ตรวจสุขภาพกาย สุขภาพจิต นักศึกษาใหม่ตามเกณฑ์', 'activity', 40, 'ดร.สุวรรณา', 42, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(43, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68025', 'โครงการ สโมสรคณะพยาบาลศาสตร์', NULL, 'project', NULL, 'ผศ.วารุณี', 43, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(44, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.1 รับน้องเข้าหอ', 'activity', 43, 'อ.รัตนาภรณ์/สโมสรนักศึกษา', 44, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(45, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.2 freshy', 'activity', 43, 'อ.เรวัต/สโมสรนักศึกษา', 45, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(46, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.3 พัฒนาวินัยนักศึกษาจากรุ่นพี่สู่รุ่นน้องอย่างยั่งยืน', 'activity', 43, 'ผศ.วารุณี/สโมสรนักศึกษา', 46, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(47, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.4 บ้านสี', 'activity', 43, 'อ.สุนันทา/สโมสรนักศึกษา', 47, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(48, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.5 จุดเทียนส่องใจ', 'activity', 43, 'อ.ชัยสิทธิ์/สโมสรนักศึกษา', 48, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(49, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.6 เปิดสายรหัส', 'activity', 43, 'ดร.ณิชมล/สโมสรนักศึกษา', 49, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(50, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.7 หูกวางเกมส์', 'activity', 43, 'ดร.พจอ.ภูมเดชา/สโมสรนักศึกษา', 50, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(51, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.8 ปฐมนิเทศมหาวิทยาลัย', 'activity', 43, 'ผศ.ดร.วัฒนีย์', 51, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(52, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.9 พี่สอนน้องประกันคุณภาพนักศึกษาพยาบาล', 'activity', 43, 'ผศ.วารุณี/อ.สุภาภรณ์', 52, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(53, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.10 Bye Nior', 'activity', 43, 'ดร.วราภรณ์', 53, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(54, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.11 กีฬาสัมพันธ์เครือข่ายสถาบันพยาบาล', 'activity', 43, 'อ.รััตนาภรณ์', 54, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(55, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.12 พัฒนาทักษะด้านกายวิภาคศาสตร์ (Anatomy) เพื่อการแข่งขัน', 'activity', 43, 'ผศ.ดร.วััฒนีย์', 55, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(56, 1, 2568, 'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher', NULL, NULL, NULL, '2091101 - 68026', 'โครงการพัฒนานักศึกษาด้านวิชาการ ผ่านกระบวนการ ปูปั้นดาว', NULL, 'project', NULL, 'อ.สุนันทา', 56, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(57, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091101 - 68027', 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', NULL, 'project', NULL, 'พจอ.ดร.ภูมเดชา', 57, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(58, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.1 การพัฒนาระบบสารสนเทศ', 'activity', 57, 'พจอ.ดร.ภูมเดชา', 58, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(59, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.2 การบริหารความเสี่ยง', 'activity', 57, 'ผศ.ดร.สุสารี', 59, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(60, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.3 การจัดการความรู้', 'activity', 57, 'ผศ.ดร.ชนิดา', 60, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(61, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.4 การประกันคุณภาพระดับคณะ', 'activity', 57, 'ผศ.ดร.สมฤดี', 61, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(62, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.5 การประกันคุณภาพระดับหลักสูตร AUN - QA', 'activity', 57, 'ผศ.ดร.สุสารี', 62, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(63, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.6 การประเมินความพึงพอใจด้านสารสนเทศ', 'activity', 57, 'ผศ.ดร.ดวงกมล', 63, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(64, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS', 'ก.7 การติดตามผลการดำเนินงานและนำผลการประเมินมาวางแผนปรับปรุง', 'activity', 57, 'อ.รัฐกานต์', 64, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(65, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091101 - 68028', 'โครงการ พัฒนาบุคลากร (Bind the organization)', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์์', 65, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(66, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.1 การพัฒนาตนเองของบุคลากร (IDP)', 'activity', 65, 'ผศ.ดร.พิชาภรณ์', 66, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(67, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.2 การพัฒนาด้านคุณวุฒิ', 'activity', 65, 'ผศ.ดร.พิชาภรณ์', 67, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(68, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.3 การพัฒนาอาจารย์สู่ตำแหน่งวิชาการ', 'activity', 65, 'ผศ.ดร.อรทิพา', 68, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(69, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.4 เพชรในเรือน', 'activity', 65, 'อ.อัมพร', 69, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(70, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.5 ปฐมนิเทศอาจารย์ใหม่', 'activity', 65, 'ผศ.ดร.อรทิพา/ผศ.ดร.วัฒนีย์', 70, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(71, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.6 ระบบพี่เลี้ยงอาจารย์ใหม่', 'activity', 65, 'ผศ.ดร.วัฒนีย์', 71, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(72, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.7 Faculty practice', 'activity', 65, 'ผศ.ดร.สุสารี', 72, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(73, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.8 การศึกษาดูงานภายในประเทศ', 'activity', 65, 'ผศ.ดร.อรทิพา', 73, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(74, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.9 การศึกษาดูงานต่างประเทศ', 'activity', 65, 'ผศ.ดร.อรทิพา', 74, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(75, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.10 อบรบป้องกันอัคคีภัย', 'activity', 65, 'พจอ.ดร.ภูมเดชา', 75, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(76, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.11 อบรมหลักสูตรพัฒนาศักยภาพด้านการสอนสำหรับอาจารย์พี่เลี้ยงในคลินิก', 'activity', 65, 'อ.ธารทิพย์', 76, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(77, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.12 อมรมสัมมนาทางวิชาการตามสาขา', 'activity', 65, 'ผศ.ดร.พิชาภรณ์', 77, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(78, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.13 สัมมนาทางวิชาการและวิชาชีพ', 'activity', 65, 'ผศ.ดร.อรทิพา', 78, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(79, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาบุคลากร (Bind the organization)', 'ก.14 Health instructor', 'activity', 65, 'อ.ธัญลักษณ์วดี', 79, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(80, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091101 - 68029', 'โครงการ ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 80, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(81, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091101 - 68030', 'โครงการ ศูนย์การศึกษาต่อเนื่อง', NULL, 'project', NULL, 'อ.สุกฤตา', 81, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(82, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091101 - 68031', 'โครงการ พัฒนาประเมินและติดตามผลงานเพื่อการจัดอันดับ', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 82, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(83, 1, 2568, 'ยุทธศาสตร์ที่ 4: Future System for Management', NULL, NULL, NULL, '2091102 - 68044', 'จัดหาและบำรุงรักษาวัสดุอุปกรณ์เพื่อสนับสนุนการดำเนินงานของคณะ', NULL, 'project', NULL, 'ผศ.ดร.อรทิพา', 83, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(84, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68032', 'โครงการ อบรมหลักสูตรพัฒนาศักยภาพด้านภาวะวิกฤติและฉุกเฉินสำหรับอาจารย์พี่เลี้ยงในคลินิกผู้ป่วยวิกฤติ', NULL, 'project', NULL, 'อ.สุนันทา', 84, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(85, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68033', 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัล', NULL, 'project', NULL, 'อ.เพ็ญรุ่ง', 85, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(86, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัล', 'ก.1 การพยาบาลผู้ใหญ่และผู้สูงอายุ', 'activity', 85, 'ผศ.ดร.ดวงกมล', 86, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(87, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัล', 'ก.2 การพยาบาลสุขภาพจิตและจิตเวช', 'activity', 85, 'ดร.สุวรรณา', 87, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(88, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัล', 'ก.3 การพยาบาลอนามัยชุมชน', 'activity', 85, 'อ.ชัยสิทธิ์', 88, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(89, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัล', 'ก.4 กระบวนการวิจัยทางการพยาบาลวิชาชีพ', 'activity', 85, 'อ.นฤมล', 89, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(90, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68034', 'โครงการ ศูนย์การบริการวิชาการแก่สังคมด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพของชุมชนอย่างยั่งยืน', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์', 90, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(91, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68035', 'โครงการ พฤฒิพลัง : สานใจดูแลใจกาย มุ่งสู่สมองสดใส', NULL, 'project', NULL, 'อ.เพ็็ญรุ่ง', 91, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(92, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ พฤฒิพลัง : สานใจดูแลใจกาย มุ่งสู่สมองสดใส', 'ก.1 ชุมชนสานรัก สายใย สานใจ ดูแลกัน สร้างเสริมสุขภาพ', 'activity', 91, 'อ.เพ็็ญรุ่ง', 92, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(93, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, NULL, 'โครงการ พฤฒิพลัง : สานใจดูแลใจกาย มุ่งสู่สมองสดใส', 'ก.2 รู้เร็ว ป้องกันได้ ห่างไกลสมองเสื่อม', 'activity', 91, 'อ.เพ็็ญรุ่ง', 93, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(94, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68036', 'โครงการ พัฒนาจัดตั้งชมรมผู้สูงอายุต้นแบบ (Excellent Center) ของคณะพยาบาลศาสตร์ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'ดร.ปรียธิดา', 94, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(95, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68037', 'โครงการ Caregiver ยุคดิจิทัล อบรมแกนนำ และนำความรู้ในการดูแลผู้สูงอายุสู่ชุมชน', NULL, 'project', NULL, 'อ.พรพิมล', 95, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(96, 1, 2568, 'ยุทธศาสตร์ที่ 5: Sustainable Future', NULL, NULL, NULL, '2091101 - 68038', 'โครงการ แกนนำนักศึกษาสร้างสังคมไทยปลอดบุหรี่', NULL, 'project', NULL, 'อ.สุุกฤตา', 96, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(97, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, '2091101 - 68039', 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', NULL, 'project', NULL, 'อ.สุจิตราภรณ์', 97, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(98, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.1 พิธีถวายกฐินพระราชทาน', 'activity', 97, 'อ.สุจิตราภรณ์', 98, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(99, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.2 พิธีหล่อเทียนและถวายเทียนพรรษา', 'activity', 97, 'อ.สุจิตราภรณ์', 99, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(100, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.3 บายศรีสู่ขวัญและไหว้ครู', 'activity', 97, 'อ.สุนันทา', 100, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(101, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.4 ตักบาตรวันขึ้นปีใหม่', 'activity', 97, 'พ.ต.อ.ระชี', 101, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(102, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.5 รดน้ำขอพรเทศกาลวันสงกรานต์', 'activity', 97, 'อ.สุกฤตา', 102, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(103, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.6 วันลอยกระทง', 'activity', 97, 'ดร.ณิชมล/อ.นฤมล', 103, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(104, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, '2091101 - 68040', 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', NULL, 'project', NULL, 'อ.รัฐกานต์', 104, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(105, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.1 แลกเปลี่ยนวัฒนธรรมกับนักศึกษาต่างชาติ', 'activity', 104, 'ดร.วราภรณ์', 105, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(106, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.2 คุณธรรมกับอัตลักษณ์ตัวตน', 'activity', 104, 'ดร.เกวลี', 106, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(107, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.3 กลุ่มสัมพันธ์ประสานใจ', 'activity', 104, 'ดร.สุวรรณา', 107, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(108, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.4 วันรำลึกผู้ก่อนตั้งมหาวิทยาลัย', 'activity', 104, 'ผศ.ดร.อรทิพา', 108, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(109, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, '2091101 - 68041', 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', NULL, 'project', NULL, 'อ.รุ่งนภา', 109, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(110, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.1 การแต่งกายด้วยผ้าไทย', 'activity', 109, 'อ.รุ่งนภา', 110, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(111, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.2 พยาบาลสยามไหว้สวย', 'activity', 109, 'พ.ต.อ.ระชี', 111, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(112, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.3 ปฐมนิเทศคณะพยาบาลศาสตร์', 'activity', 109, 'อ.อัมพร/สโมสรนักศึกษา', 112, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(113, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.4 ปัจฉิมนิเทศ', 'activity', 109, 'ผศ.ดร.พิชาภรณ์', 113, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(114, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.5 วันพยาบาลแห่งชาติ', 'activity', 109, 'ผศ.ภััทรพร', 114, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(115, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.6 วันมหิดล', 'activity', 109, 'อ.นฤมล', 115, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(116, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.7 BLACK BONE PROJECT', 'activity', 109, 'อ.เรวัต', 116, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(117, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, '2091101 - 68042', 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', NULL, 'project', NULL, 'พ.ต.อ.ระชี', 117, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(118, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.1 สอบธรรมศึกษา', 'activity', 117, 'ดร.ณิชมล/อ.รุ่งนภา', 118, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(119, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.2 การเป็นลูกที่ดีของพ่อแม่ (ชั้นปีที่ 1)', 'activity', 117, 'อ.สุภาภรณ์์', 119, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(120, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.3 สมาธิ สติ ปัญญา (ชั้นปีที่ 2)', 'activity', 117, 'อ.ขวัญเรือน', 120, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(121, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.4 ส่งเสริมไตรลักษณ์ (ชั้นปีที่ 3)', 'activity', 117, 'ผศ.ดร.ดวงกมล', 121, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(122, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.5 พรหมวิหาร 4 (ชั้นปีที่ 4)', 'activity', 117, 'ผศ.ภัทรพร/อ.วิวรรณา', 122, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(123, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.6 ธรรมสัญจร', 'activity', 117, 'อ.สุกฤตา', 123, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(124, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, '2091101 - 68043', 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', NULL, 'project', NULL, 'อ.เพ็ญรุ่ง', 124, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(125, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.1 Home Room ปี 1', 'activity', 124, 'อ.รุ่งนภา', 125, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(126, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.2 Home Room ปี 2', 'activity', 124, 'อ.เรวััต', 126, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(127, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.3 Home Room ปี 3', 'activity', 124, 'อ.ธารทิพย์', 127, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(128, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.4 Home Room ปี 4', 'activity', 124, 'ผศ.ดร.ศนิกานต์', 128, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(129, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.5 Portfolio ปี 1', 'activity', 124, 'ดร.เกวลีี', 129, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(130, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.6 Portfolio ปี 2', 'activity', 124, 'อ.พรพิมล', 130, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(131, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.7 Portfolio ปี 3', 'activity', 124, 'อ.ขวัญเรือน', 131, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(132, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.8 Portfolio ปี 4', 'activity', 124, 'ผศ.ดร.รอญ.วิภานันท์', 132, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(133, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.9 พิธีมอบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 2', 'activity', 124, 'ดร.ปรียธิดา', 133, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(134, 1, 2568, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', NULL, NULL, NULL, NULL, 'โครงการพัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.10 พิธีมอบแถบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 4', 'activity', 124, 'อ.วิวรรณา', 134, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(135, 2, 2566, NULL, NULL, NULL, NULL, NULL, 'ก.1 ประเมินความฉลาดทางอารมณ์และการปรับตัว', 'ก.1 ประเมินความฉลาดทางอารมณ์และการปรับตัว', 'activity', NULL, 'ดร.สุวรรณา', 1, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(136, 2, 2566, NULL, NULL, NULL, NULL, NULL, 'ก.2 พัฒนาทักษะชีวิตและทัศนคติต่อวิชาชีพ', 'ก.2 พัฒนาทักษะชีวิตและทัศนคติต่อวิชาชีพ', 'activity', NULL, 'ดร.สุลีมาศ', 2, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(137, 2, 2566, NULL, NULL, NULL, NULL, NULL, 'ก.3 พัฒนานักศึกษาด้านวิชาการ', 'ก.3 พัฒนานักศึกษาด้านวิชาการ', 'activity', NULL, 'ผศ.ดร.วัฒนีย์', 3, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(138, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', '66.1-004', 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 4, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(139, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.1 พัฒนานักศึกษาตามกรอบมาตรฐานคุณวุฒิ 6 ด้าน', 'activity', 138, 'อ.สุนันทา', 5, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(140, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.2 พัฒนานักศึกษาด้านวิจัยและนวัตกรรม', 'activity', 138, 'อ.ลัญชนา', 6, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(141, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.3 พัฒนาสิ่งสนับสนุนการเรียนรู้', 'activity', 138, 'อ.ธัญลักษณ์วดี', 7, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(142, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.4 พัฒนาทักษะด้านการใช้สารสนเทศ', 'activity', 138, 'อ.รัฐกานต์', 8, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(143, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.5 เปิดประตูสู่วิชาชีพ', 'activity', 138, 'ผศ.ดร.สมฤดี', 9, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(144, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนการเรียนรู้ในศตวรรษที่ 21', 'ก.6 ปู ปั้น ดาว', 'activity', 138, 'อ.สุนันทา', 10, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(145, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', '66.1-005', 'พัฒนาคุณภาพการเรียนการสอนด้วยระบบการจัดการความรู้ (KM)', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 11, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(146, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนด้วยระบบการจัดการความรู้ (KM)', 'ก.1 Nurse to be professional', 'activity', 145, 'อ.อัมพร', 12, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(147, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนด้วยระบบการจัดการความรู้ (KM)', 'ก.2 การเตรียมสอบใบอนุญาต', 'activity', 145, 'ผศ.ดร.สุสารี', 13, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(148, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาคุณภาพการเรียนการสอนด้วยระบบการจัดการความรู้ (KM)', 'ก.3 ติดตามประเมินคุณภาพบัณฑิตเน้น Outcomes', 'activity', 145, 'ผศ.ดร.สมฤดี', 14, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(149, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', '66.1-006', 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', NULL, 'project', NULL, 'อ.เฟื่องสุุข', 15, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(150, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.1 บายศรีสู่ขวัญและไหว้ครู', 'activity', 149, 'อ.สุุนันทา', 16, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(151, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.2  สอบธรรมศึกษา', 'activity', 149, 'อ.เฟื่องสุข', 17, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(152, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.3 การเป็นลูกที่ดีของพ่อแม่ (ชั้นปีที่ 1)', 'activity', 149, 'อ.เฟื่องสุข', 18, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(153, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.4 สมาธิ สติ ปัญญา  (ชั้นปีที่ 2)', 'activity', 149, 'อ.ชัยสิทธิ์', 19, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(154, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.5 ส่งเสริมไตรลักษณ์  (ชั้นปีที่ 3)', 'activity', 149, 'ผศ.ดร.ดวงกมล', 20, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(155, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.6 พรหมวิหาร 4  (ชั้นปีที่ 4)', 'activity', 149, 'ผศ.ภัทรพร', 21, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(156, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.7 ธรรมะสอนใจเป็นไฟส่องทาง', 'activity', 149, 'อ.สุกฤตา', 22, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41');
INSERT INTO `annual_project_report_items` (`id`, `import_batch_id`, `academic_year`, `strategy`, `plan_name`, `objective`, `kpi`, `project_code`, `project_name`, `activity_name`, `row_type`, `parent_item_id`, `responsible_person`, `sort_order`, `raw_row_json`, `created_at`, `updated_at`) VALUES
(157, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.8 Home Room ปี 1', 'activity', 149, 'ดร.สุลีมาศ', 23, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(158, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.9 Home Room ปี 2', 'activity', 149, 'อ.นฤมล', 24, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(159, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.10 Home Room ปี 3', 'activity', 149, 'อ.ศิรินา', 25, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(160, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.11 Home Room ปี 4', 'activity', 149, 'ผศ.ดร.ศนิกานต์', 26, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(161, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.12 Portfolio ปี 1', 'activity', 149, 'อ.สุภาภรณ์', 27, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(162, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.13 Portfolio ปี 2', 'activity', 149, 'อ.ชัยสิทธิ์', 28, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(163, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.14 Portfolio ปี 3', 'activity', 149, 'อ.นฐมน', 29, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(164, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.15 Portfolio ปี 4', 'activity', 149, 'ดร.ปรียธิดา', 30, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(165, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'พัฒนาด้านคุณธรรม จริยธรรม จรรยาบรรณวิชาชีพ และความเป็นพลเมืองที่เข้มแข็ง', 'ก.16 Hug Health', 'activity', 149, 'ดร.ณิชมล', 31, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(166, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', '66.1-007', 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', NULL, 'project', NULL, 'ดร.วราภรณ์', 32, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(167, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.1 ประชุมวิชาการให้ความรู้แก่ศิษย์เก่า', 'activity', 166, 'อ.ลัญชนา', 33, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(168, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.2 Siam University Open Source Learning', 'activity', 166, 'ดร.วราภรณ์', 34, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(169, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.3 คืนสู่เหย้าเหล่าพยาบาล', 'activity', 166, 'อ.สุธิดา/อ.ลัญชนา/ดร.วราภรณ์', 35, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(170, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.4 เปิดบ้านพบผู้ปกครอง  (ชั้นปีที่ 2)', 'activity', 166, 'อ.นฤมล', 36, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(171, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.5 เปิดบ้านพบผู้ปกครอง  (ชั้นปีที่ 4)', 'activity', 166, 'ผศ.ภัทรพร', 37, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(172, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.6 Goodbye Senior', 'activity', 166, 'ดร.วราภรณ์', 38, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(173, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.7 ประชุมเชียร์กีฬาหูกวางเกมส์', 'activity', 166, 'ผศ.วารุุณี', 39, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(174, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.8 กีฬาสถาบันพยาบาล', 'activity', 166, 'ดร.พจอ.ภูมเดชา', 40, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(175, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.9 ประชุมเชียร์กีฬาเฟรชชี่', 'activity', 166, 'ผศ.วารุณี', 41, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(176, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.10 รับน้องเข้าบ้านสี', 'activity', 166, 'อ.สุนันทา', 42, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(177, 2, 2566, NULL, 'แผนงานที่ 2.แผนการสรรหาคัดเลือกและเตรียมความพร้อมนักศึกษา', '2.บัณฑิตจากคณะพยาบาลศาสตร์มีความรู้ในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.มีระเบียบการคัดเลือกนักศึกษา ร้อยละ 100 \r\n2. มีกลุ่มโรงเรียนเป้าหมายในการประชาสัมพันธ์ทุกภาคของประเทศ ร้อยละ 100 \r\n3.นักศึกษาที่รับเข้ามีการกำหนดเกรดเฉลี่ย อย่างน้อย 2.5 \r\n4.นักศึกษาที่รับเข้าได้รับการทดสอบภาษาอังกฤษ ร้อยละ 100 \r\n5.นักศึกษารับเข้ามีคุณสมบัติตามเกณฑ์ ร้อยละ 100 \r\n6.นักศึกษารับเข้ามีทัศนคติที่ดีต่อวิขาชีพ ร้อยละ 100 \r\n7.มีการเตรียมความพร้อมให้นักศึกษาใหม่อย่างน้อย 3 ประเด็น ได้แก่ด้านวิชาการ ด้านการปรับตัว และด้านวิชาชีพ', NULL, 'เปิดโลกกว้าง เรียนรู้ทุกด้านตลอดชีวิต', 'ก.11 สานสัมพันธ์บัณฑิตใหม่', 'activity', 166, 'ผศ.วารุณี', 43, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(178, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', '66.1-008', 'ต้นกล้างานวิจัยและนวัตกรรมทางการพยาบาล', NULL, 'project', NULL, 'ผศ.รอญ.ดร.วิภานันท์', 44, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(179, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ต้นกล้างานวิจัยและนวัตกรรมทางการพยาบาล', 'ก.1 นวัตกรรมในรายวิชาการพยาบาลพื้นฐาน', 'activity', 178, 'ผศ.ดร.สมฤดี', 45, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(180, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ต้นกล้างานวิจัยและนวัตกรรมทางการพยาบาล', 'ก.2 นวัตกรรมในหมวดรายวิชาชีพ', 'activity', 178, 'ผศ.รอญ.ดร.วิภานันท์', 46, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(181, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ต้นกล้างานวิจัยและนวัตกรรมทางการพยาบาล', 'ก 3. วิจัยในรายวิชากระบวนการวิจัย', 'activity', 178, 'อ.ลัญชนา', 47, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(182, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', '66.1-009', 'บูรณาการการบริการวิชาการกับการเรียนการสอน', NULL, 'project', NULL, 'ดร.ปรียธิดา', 48, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(183, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'บูรณาการการบริการวิชาการกับการเรียนการสอน', 'ก.1 รายวิชา การพยาบาลผู้ใหญ่และผู้สูงอายุ', 'activity', 182, 'ดร.ปรียธิดา', 49, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(184, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'บูรณาการการบริการวิชาการกับการเรียนการสอน', 'ก.2 รายวิชา การผดุงครรภ์-มารดาทารก', 'activity', 182, 'อ.รัตนาภรณ์', 50, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(185, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'บูรณาการการบริการวิชาการกับการเรียนการสอน', 'ก.3 รายวิชา การพยาบาลเด็กและวัยรุ่น', 'activity', 182, 'อ.ธัญลักษณ์วดี', 51, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(186, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'บูรณาการการบริการวิชาการกับการเรียนการสอน', 'ก.4 การพยาบาลสุขภาพจิตและจิตเวช (เสริมความรู้ สู่ความมั่นใจในการดูแลผู้ป่วยจิตเวช)', 'activity', 182, 'อ.ศิรินา', 52, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(187, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'บูรณาการการบริการวิชาการกับการเรียนการสอน', 'ก.5 การพยาบาลอนามัยชุมชน', 'activity', 182, 'ผศ.ดร.ศนิกานต์', 53, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(188, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', '66.1-010', 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', NULL, 'project', NULL, 'อ.เฟื่องสุข', 54, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(189, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.1 ตักบาตรประจำสัปดาห์', 'activity', 188, 'พ.ต.อ.หญิงระชี', 55, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(190, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.2 พิธีถวายกฐินพระราชทาน', 'activity', 188, 'อ.สุจิตราภรณ์', 56, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(191, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.3 พิธีหล่อเทียนและถวายเทียนพรรษา', 'activity', 188, 'อ.สุจิตราภรณ์', 57, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(192, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.4 ตักบาตรวันขึ้นปีใหม่', 'activity', 188, 'พ.ต.อ.หญิงระชี', 58, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(193, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.5 รดน้ำขอพรเทศกาลวันสงกรานต์', 'activity', 188, 'อ.สุกฤตา', 59, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(194, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.6 วันลอยกระทง', 'activity', 188, 'อ.เฟื่องสุุข', 60, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(195, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.7 ปัจฉิมนิเทศ', 'activity', 188, 'ผศ.ดร.พิชาภรณ์', 61, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(196, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.8 วันมหิดล', 'activity', 188, 'อ.นฤมล', 62, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(197, 2, 2566, NULL, 'แผนงานที่ 3 การให้คำปรึกษาและพัฒนานักศึกษา', '3.บัณฑิตจากคณะพยาบาลศาสตร์มีทักษะทางวิชาชีพในการปฏิบัติงานอย่างมีคุณค่าในสังคมโลกอนาคต', '1.บัณฑิตสำเร็จการศึกษาไม่น้อยกว่า ร้อยละ 95\r\n2. บัณฑิตศึกษาครบตามเกณฑ์หลักสูตร ร้อยละ 100\r\n3.บัณฑิตสอบเพื่อรับใบอนุญาตประกอบวิชาชีพผ่านใน 1 ปี ร้อยละ 100\r\n4.บัณฑิตเป็นที่ต้องการของฝ่ายบริการทั้งภาครัฐและเอกชน ร้อยละ100\r\n5.บัณฑิตได้รับทุนจากฝ่ายบริการทั้งภาครัฐและเอกชน อย่างน้อยร้อยละ90\r\n6.อาจารย์ดูแลให้คำปรึกษานักศึกษาและบันทึกใน Port Folio ร้อยละ100\r\n7.พัฒนานักศึกษาในทักษะที่จำเป็นครอบคลุมร้อยละ 100', NULL, 'ทำนุบำรุงวัฒนธรรมประเพณีไทยร่วมกับวัฒนธรรมด้านวิชาชีพ', 'ก.9 วันรำลึกผู้ก่อตั้งมหาวิทยาลัยสยาม', 'activity', 188, 'ดร.อรทิพา', 63, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(198, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', '66.1-011', 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', NULL, 'project', NULL, 'อ.เฟื่องสุุข', 64, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(199, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.1 การแต่งกายด้วยผ้าไทย', 'activity', 198, 'อ.เฟื่องสุข', 65, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(200, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.2 พยาบาลสยาม สวยด้วยการไหว้', 'activity', 198, 'พ.ต.อ.หญิงระชี และ อ.สุภาภรณ์', 66, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(201, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.3 แลกเปลี่ยนนักศึกษากับต่างชาติ', 'activity', 198, 'ดร.วราภรณ์', 67, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(202, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.4 ศิลปะป้องกันตัว', 'activity', 198, 'พ.ต.อ.หญิงระชี และ อ.สุภาภรณ์', 68, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(203, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.5 ปฐมนิเทศคณะพยาบาลศาสตร์', 'activity', 198, 'อ.สุนันทา', 69, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(204, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.6 กลุ่มสัมพันธ์ประสานใจ', 'activity', 198, 'ดร.สุวรรณา', 70, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(205, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.7 BLACK BONE PROJECT', 'activity', 198, 'อ.นฐมน', 71, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(206, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.8 พิสูจน์หลักฐานทางกฏหมาย', 'activity', 198, 'พ.ต.อ.หญิงระชี', 72, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(207, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.9 สร้างเสริมสุขภาพ', 'activity', 198, 'อ.รัตนาภรณ์', 73, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(208, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.10 พัฒนาวินัยนักศึกษาจากรุ่นพี่สู่รุ่นน้องอย่างยั่งยืน', 'activity', 198, 'ผศ.วารุณี', 74, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(209, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, 'พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.11 สงบจิตก่อนนิทรา', 'activity', 198, 'ดร.ณิชมล', 75, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(210, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-012', NULL, 'project', NULL, 'อ.ชัยสิทธิ์', 76, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(211, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-013', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 77, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(212, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-014', NULL, 'project', NULL, 'อ.เพ็ญรุ่ง', 78, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(213, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', NULL, 'project', NULL, 'อ.อัมพร', 79, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(214, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', 'ก.1 พิธีมอบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 2', 'activity', 213, 'ดร.ณิชมล', 80, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(215, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', 'ก.2 พิธีมอบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 4', 'activity', 213, 'อ.วิวรรณา', 81, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(216, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', 'ก.3 วันพยาบาลแห่งชาติ', 'activity', 213, 'อ.สุธิดา', 82, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(217, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', 'ก.4 วันพยาบาลสากล', 'activity', 213, 'อ.สุธิดา', 83, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(218, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-015', 'ก.5 พิธีมุฑิตาจิตศิษย์บูชาครูชั้นปีที่ 4', 'activity', 213, 'อ.วิวรรณา', 84, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(219, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-016', NULL, 'project', NULL, 'อ.สุจิตราภรณ์', 85, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(220, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-017', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 86, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(221, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-018', NULL, 'project', NULL, 'อ.สุกฤตา', 87, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(222, 2, 2566, NULL, 'แผนงานที่ 4 ทำนุบำรุงศิลปวัฒนธรรมไทยและ ส่งเสริมอัตลักษณ์และเอกลักษณ์วิชาชีพ', '1.นักศึกษามีความภาคภูมิใจในวัฒนธรรมไทย อัตลักษณ์และเอกลักษณ์ของวิชาชีพ  2.ทำนุบำรุงศิลปะและวัฒนธรรม การยอมรับในความหลากหลายและความแตกต่างทางวัฒนธรรม', '1.นักศึกษามีความภูมิใจและพึงพอใจในวัฒนธรรมไทย \r\n2.นักศึกษามีการพัฒนาด้านทำนุบำรุงศิลปะและวัฒนธรรมที่ตอบสนองอัตลักษณ์และเอกลักษณ์วิชาชีพ \r\n3.นักศึกษาได้รับการพัฒนาด้านการส่งเสริมสิ่งแวดล้อมหรือภูมิปัญญา', NULL, '66.1-019', NULL, 'project', NULL, 'อ.วารุณี', 88, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(223, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-001', 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์', 89, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41');
INSERT INTO `annual_project_report_items` (`id`, `import_batch_id`, `academic_year`, `strategy`, `plan_name`, `objective`, `kpi`, `project_code`, `project_name`, `activity_name`, `row_type`, `parent_item_id`, `responsible_person`, `sort_order`, `raw_row_json`, `created_at`, `updated_at`) VALUES
(224, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.1 สร้างเสริมสุขภาพผู้สูงอายุระยะยาว (Long Term Care) ในชุมชนเมือง', 'activity', 223, 'ผศ.ดร.ศนิกานต์', 90, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(225, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.2 HOME CARE SHARING', 'activity', 223, 'อ.ธารทิพย์', 91, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(226, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.3 เสริมสร้างชมรมผู้สูงอายุคุณภาพด้านสุขภาพ', 'activity', 223, 'ดร.ปรียธิดา', 92, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(227, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.4  Friend Smile Together : อบรมแกนนำและนำความรู้สู่ชุมชน', 'activity', 223, 'อ.ลัญชนา', 93, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(228, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.5 Friend Smile Together : นำความรู้สู่ชุมชน', 'activity', 223, 'อ.นฤมล', 94, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(229, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'ศูนย์การบริการวิชาการด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพตามบริบทของชุมชน', 'ก.6  Friend Smile Together : แบ่งปันโอกาสที่ดีแก่น้อง', 'activity', 223, 'อ.ลัญชนา', 95, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(230, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '65.2-002', 'อบรมหลักสูตรพัฒนาศักยภาพด้านการสอนสำหรับอาจารย์พี่เลี้ยงในคลินิก', NULL, 'project', NULL, 'อ.ธารทิพย์', 96, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(231, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '65.2-003', 'สรรหาและพัฒนาอาจารย์', NULL, 'project', NULL, 'ผศ.ดร.อรทิพา', 97, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(232, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.1 อบรม/สัมมนาทางวิชาการตามสาขาที่เกี่ยวข้อง Training Need', 'activity', 231, 'ผศ.ดร.อรทิพา', 98, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(233, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.2 Faculty Practice', 'activity', 231, 'ผศ.ดร.อรทิพา', 99, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(234, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.3 ปฐมนิเทศอาจารย์ใหม่', 'activity', 231, 'ผศ.ดร.วัฒนีย์', 100, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(235, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.4 ระบบพี่เลี้ยง', 'activity', 231, 'ผศ.ดร.วัฒนีย์', 101, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(236, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.5 พัฒนาศักยภาพอาจารย์ด้านคุณวุฒิ', 'activity', 231, 'ผศ.ดร.อรทิพา', 102, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(237, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.6 พัฒนาตำแหน่งทางวิชาการ', 'activity', 231, 'ผศ.ดร.ชนิดา', 103, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(238, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.7 การดูแลสุขภาพบุคลากร', 'activity', 231, 'ผศ.ดร.อรทิพา', 104, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(239, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.8 พัฒนาอาจารย์ที่ปรึกษา', 'activity', 231, 'อ.ธารทิพย์', 105, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(240, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.9 สัมมนาทางวิชาการและวิชาชีพ', 'activity', 231, 'ผศ.ดร.อรทิพา', 106, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(241, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.10 ศึกษาดูงานในประเทศและต่างประเทศ', 'activity', 231, 'ผศ.ดร.อรทิพา', 107, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(242, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'สรรหาและพัฒนาอาจารย์', 'ก.11 การร่วมมือทางวิชาการกับองค์กรภายนอก', 'activity', 231, 'ผศ.ดร.อรทิพา', 108, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(243, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-004', 'พัฒนาอาจารย์สู่ความเลิศ ( SU BEST)', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 109, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(244, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-005', 'พัฒนาศิษย์สู่การเป็นอาจารย์ (ศิษย์ปัจจุบัน)', NULL, 'project', NULL, 'ผศ.ภัทรพร', 110, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(245, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-006', 'ยกระดับ UP SKILL/RE SKILL/NEW SKILL', NULL, 'project', NULL, 'อ.ธัญลักษวดี', 111, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(246, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-007', 'พัฒนาทักษะภาษาในศตวรรษที่ 21', NULL, 'project', NULL, 'อ.วิวรรณา', 112, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(247, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-008', 'IT FOR Instructure', NULL, 'project', NULL, 'อ.รัฐกานต์', 113, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(248, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-009', 'ส่งเสริมการจัดการเรียนรู้สู่เป้าหมายโลกเพื่อการพัฒนาที่ยั่งยืน', NULL, 'project', NULL, 'ดร.สุลีมาศ', 114, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(249, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-010', 'อบรมพัฒนารูปแบบการจัดการเรียนการสอนโดยใช้ชุมชนและวิจัยเป็นฐานการเรียนรู้', NULL, 'project', NULL, 'ผศ.รอญ.ดร.วิภานันท์', 115, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(250, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-011', 'เพชรในเรือน (อาจารย์ผู้เก่งด้านการสอน)', NULL, 'project', NULL, 'อ.อัมพร', 116, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(251, 2, 2566, 'ยุทธศาสตร์ที่ 2 อาจารย์ทันสมัยและเชี่ยวชาญ', 'แผนงานที่ 5 แผนงาน สรรหา การพัฒนาอาจารย์ การพัฒนาผลงานเพื่อก้าวสู่ตำแหน่งทางวิชาการ', '1.การบริการจัดการที่ปรับเปลี่ยนมีความคล่องตัวและมีคุณภาพประสิทธิภาพ\r\n2.อาจารย์และบุคลากรมีความพร้อมในการทำงานอย่างมีประสิทธิภาพและประสิทธิผล\r\n3.พัฒนาอาจารย์ด้านภาษาอังกฤษเพื่อรองรับการขยายตัวของหลักสูตรนานาชาติของมหาวิทยาลัย\r\n4.เสริมทักษะด้านการสอนที่มีความดึงดูดใจของผู้เรียน\r\n5.พัฒนาคุณวุฒิและตำแหน่งทางวิชาการของอาจารย์\r\n6.เสริมสร้างสุขภาพและสุขภาวะที่ดีของบุคลากร', '1.มีอาจารย์ครบตามสาขา 5 สาขา ร้อยละ 100\r\n2.มีแผนพัฒนาอาจารย์ในการขอตำแหน่งทางวิซาการ  อย่างน้อยปีละ 2 คน\r\n3.มีแผนการส่งอาจารย์ศึกษาต่อในระตับปริญญาเอก อย่างน้อยปีละ 2 คน\r\n4. อาจารย์ประจำมีคุณวุฒิอย่างน้อยระดับปริญญาโท ร้อยละ 100\r\n5.อาจารย์ใหม่สอบภาษาอังกฤษผ่านเกณฑ์ ร้อยละ 60\r\n6.อาจารย์ได้รับการตรวจร่างกายประจำปี ร้อยละ 100\r\n7.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่การบริหารตามพันธะกิจ ครบทุกพันธกิจ\r\n8.มีการบริหารความเสี่ยงโดยดำเนินการตามกระบวนการ ครบทุกขั้นตอน\r\n9.มีการจัดการความรู้ของคณะ อย่างน้อย 1 เรื่อง                                           \r\n10.มีการพัฒนาอาจารย์และบุคลากรสายสนับสนุน อย่างน้อยปีละ 1 ครั้งทุกคน\r\n11.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.2-012', 'พัฒนาวิชาการใน 5 สาขาหลัก (ตำรา)', NULL, 'project', NULL, 'อ.ดวงกมล', 117, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(252, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', '66.3-001', 'จัดการความรู้ด้านการวิจัย', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 118, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(253, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', '66.3-002', 'พัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', NULL, 'project', NULL, 'ผศ.รอญ.ดร.วิภนันท์', 119, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(254, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', '66.3-003', 'Siam Nurse IRB', NULL, 'project', NULL, 'อ.ขวัญเรือน', 120, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(255, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', '66.3-004', 'วิจัยเพื่อการพัฒนาที่ยั่งยืน', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 121, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(256, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', NULL, 'วิจัยเพื่อการพัฒนาที่ยั่งยืน', 'ก.1 ตีพิมพ์ เผยแพร่ นำเสนองานวิจัย และนวัตกรรม', 'activity', 255, 'ผศ.ดร.ชนิดา', 122, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(257, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', NULL, 'วิจัยเพื่อการพัฒนาที่ยั่งยืน', 'ก.2 ประชุมวิชาการด้านการวิจัย', 'activity', 255, 'ผศ.ดร.ชนิดา', 123, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(258, 2, 2566, 'ยุุทธศาสตร์ที่ 3 ผลงานวิจัยและงานสร้างสรรค์นำไปสู่นวัตกรรมและส่งผลต่อการพัฒนาที่ยั่งยืน', 'แผนงานที่ 6 ด้านการวิจัยและนวัตกรรม', '1.เพื่อสร้างความร่วมมือด้านการวิจัย/งานสร้างสรรค์กับหน่วยงานระดับชาติ นานาชาติ', '1.อาจารย์มีงานวิจัย/นวัตกรรม/งานสร้างสรรค์ที่เกิดจากความร่วมมือกับสถาบัน/องค์กรที่เกี่ยวข้อง อย่างน้อยคนละ 1 เรื่อง  \r\n2.จัดกิจกรรมพัฒนาศักยภาพการวิจัยร่วมกับหน่วยงานภายนอก อย่างน้อย 1 ครั้ง \r\n3.มีผลงานวิจัยที่ทำร่วมกับสถาบัน/องค์กรภายนอก อย่างน้อย 1 เรื่อง \r\n4.อาจารย์นำเสนองานวิจัย/บทความวิจัย อย่างน้อยปีละ 10 เรื่อง \r\n5.ได้รับทุนวิจัยภายใน/ภายนอก อย่างน้อยคนละ 20,000 บาท', '66.3-005', 'ส่งเสริมการวิจัยและนวัตกรรมร่วมกับเครือข่ายสถานบริการสุขภาพเพื่อสุขภาวะชุมชนและสังคม (SDGs 3)', NULL, 'project', NULL, 'อ.รัฐกานต์', 124, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(259, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', '66.4-001', 'อนุรักษ์สิ่งแวดล้อม', NULL, 'project', NULL, 'อ.สุกฤตา', 125, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(260, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', NULL, 'อนุรักษ์สิ่งแวดล้อม', 'ก.1 สาหร่ายเพื่อสุขภาพผู้สูงวัย', 'activity', 259, 'ผศ.วารุุณี', 126, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(261, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', NULL, 'อนุรักษ์สิ่งแวดล้อม', 'ก.2 สยามอนุรักษ์สิ่งแวดล้อมและภูมิปัญญาท้องถิ่น', 'activity', 259, 'อ.สุกฤตา', 127, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(262, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', NULL, 'อนุรักษ์สิ่งแวดล้อม', 'ก.3 Energy  Saving', 'activity', 259, 'อ.สุนันทา', 128, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(263, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', NULL, 'อนุรักษ์สิ่งแวดล้อม', 'ก.4 โลกสดใสร่วมใจ ใช้ถุงผ้า', 'activity', 259, 'อ.สุภาพร', 129, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(264, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', NULL, 'อนุรักษ์สิ่งแวดล้อม', 'ก.5 การคัดแยกขยะต้นทาง', 'activity', 259, 'อ.รัตนาภรณ์', 130, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(265, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', '66.4-002', 'ประเมินสิ่งสนับสนุนการเรียนรู้ (Need and Development)', NULL, 'project', NULL, 'อ.ธัญลักษณ์วดี', 131, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41');
INSERT INTO `annual_project_report_items` (`id`, `import_batch_id`, `academic_year`, `strategy`, `plan_name`, `objective`, `kpi`, `project_code`, `project_name`, `activity_name`, `row_type`, `parent_item_id`, `responsible_person`, `sort_order`, `raw_row_json`, `created_at`, `updated_at`) VALUES
(266, 2, 2566, 'ยุทธศาสตร์ที่ 4  บริการประทับใจและเป็นมิตรต่อสิ่งแวดล้อม', 'แผนงานที่ 7 บริการวิชาการและสร้างเครือข่ายสิ่งแวดล้อมในชุมน', '1.เพื่อส่งเสริม/สนับสนุนให้มีการนำองค์ความรู้ด้านสุขภาพและสิ่งแวดล้อมมาบูรณาการใช้ในชีวิตประจำวัน  \r\n2.นักศึกษานำหลักปรัชญาเศรษฐกิจพอเพียงมาใช้ในชีวิตประจำวัน \r\n3.นักศึกษาสามารถนำชุมชนในการอนุรักษ์สิ่งแวดล้อมอย่างยั่งยืน', '1.มีกิจกรรมที่เกี่ยวข้องกับสิ่งแวดล้อมจัดอย่างต่อเนื่องเพื่อสร้างความยั่งยืนในชุมชน', '66.4-003', 'Happy Faculty (Green Work Place/Green DOM/Zero waste)', NULL, 'project', NULL, 'อ.สุภาภรณ์', 132, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(267, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', '66.5-001', 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', NULL, 'project', NULL, 'ผศ.ดร.พิชาภรณ์', 133, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(268, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.1 ติดตามผลการดำเนินงานตามแผน', 'activity', 267, 'ผศ.ดร.พิชาภรณ์', 134, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(269, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.2 พัฒนาระบบสารสนเทศที่นำมาใช้ในการบริหารจัดการ', 'activity', 267, 'ดร.พจอ.ภูมเดชา', 135, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(270, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.3 ประเมินบุคลากร 360 องศา', 'activity', 267, 'ผศ.ดร.อรทิพา', 136, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(271, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.4 สำรวจความต้องการด้านทรัพยากรการเรียนการสอน', 'activity', 267, 'ผศ.ดร.วัฒนีย์', 137, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(272, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.5 การบริหารความเสี่ยง', 'activity', 267, 'ผศ.ดร.สุสารี', 138, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(273, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 8  พัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.เพื่อพัฒนางานและปรับปรุงระบบบริหารจัดการให้มีประสิทธิภาพและตรวจสอบได้', '1.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ  \r\n2.มีการจัดทำระบบฐานข้อมูลและใช้ระบบสารสนเทศเพื่อการบริหารตามพันธะกิจ ครบ 4 พันธะกิจ \r\n3.มีการดำเนินการประกันคุณภาพอย่างเป็นระบบในทุกระดับ คะแนนอยู่ในระดับดีขึ้นไป', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.6 รายงานการประเมินตนเองระดับคณะ (SAR)', 'activity', 267, 'ผศ.ดร.สมฤดี', 139, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(274, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.7 การสำรวจความพึงพอใจด้านสารสนเทศ', 'activity', 267, 'อ.สุธิดา', 140, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(275, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.8 การนำผลการประเมินมาวางแผนปรับปรุง', 'activity', 267, 'ผศ.ดร.พิชาภรณ์', 141, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(276, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.9 รายงานการประเมินตนเองระดับหลักสูตร (AUN QA)', 'activity', 267, 'ผศ.ดร.สุสารี', 142, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(277, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '65.5-002', 'อบรมอัคคีภัย', NULL, 'project', NULL, 'ดร.พจอ.ภูมเดชา', 143, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(278, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-003', 'แลกเปลี่ยนนักศึกษาระหว่างประเทศ', NULL, 'project', NULL, 'ดร.วราภรณ์', 144, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(279, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'แลกเปลี่ยนนักศึกษาระหว่างประเทศ', 'ก.1 พัฒนานักศึกษาเพื่อคัดเลือกเข้าโครงการแลกเปลี่ยน', 'activity', 278, 'ดร.วราภรณ์', 145, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(280, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'แลกเปลี่ยนนักศึกษาระหว่างประเทศ', 'ก.2 การแลกเปลี่ยนนักศึกษาเพื่อศึกษาดูงานที่ต่างประเทศ', 'activity', 278, 'ผศ.ดร.อรทิพา', 146, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(281, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-004', 'การพัฒนาและติดตามผลงานเพื่อการจัดอันดับ', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 147, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(282, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'การพัฒนาและติดตามผลงานเพื่อการจัดอันดับ', 'ก.1 คนดีศรี Siam Nurse', 'activity', 281, 'อ.ปรมัตถ์', 148, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(283, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'การพัฒนาและติดตามผลงานเพื่อการจัดอันดับ', 'ก.2 อบรมหลักเกณฑ์การจัดอันดับ (Ranking)', 'activity', 281, 'อ.ปรมัตถ์', 149, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(284, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-005', 'ประเมินและติดตามผลงานของบุคลากรตามเกณฑ์การจัดอันดับ', NULL, 'project', NULL, 'อ.ปรมัตถ์', 150, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(285, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-006', 'ประกันคุณภาพระดับหลักสูตรและระดับคณะ', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 151, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(286, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-007', 'ภาษาอังกฤษเพื่อวิชาชีพ', NULL, 'project', NULL, 'ดร.สุวรรณา', 152, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(287, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ภาษาอังกฤษเพื่อวิชาชีพ', 'ก.1 ฟุตฟิตฟอฟัน', 'activity', 286, 'ดร.สุวรรณา', 153, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(288, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ภาษาอังกฤษเพื่อวิชาชีพ', 'ก.2 English camp', 'activity', 286, 'ดร.วราภรณ์', 154, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(289, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ภาษาอังกฤษเพื่อวิชาชีพ', 'ก.3 English for nurse : Emergencies and Critical Care', 'activity', 286, 'ผศ.ดร.วัฒนีย์', 155, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(290, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ภาษาอังกฤษเพื่อวิชาชีพ', 'ก.4 Best of Nursing Student', 'activity', 286, 'อ.สุุภาภรณ์', 156, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(291, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-008', 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 157, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(292, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', 'ก.1 ศูนย์การศึกษาต่อเนื่อง', 'activity', 291, 'ผศ.ดร.สุสารี', 158, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(293, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', 'ก.2 เตรียมความพร้อมพยาบาลใหม่', 'activity', 291, 'อ.ธารทิพย์ และ อ.ศิรินา', 159, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(294, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', 'ก.3 Nurse Educator', 'activity', 291, 'อ.ศิรินา และ อ.ธารทิพย์', 160, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(295, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', 'ก.4 Critical care', 'activity', 291, 'อ.เรวัต', 161, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(296, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', NULL, 'ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', 'ก.5 Basic Life Support', 'activity', 291, 'อ.เรวัต', 162, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(297, 2, 2566, 'ยุทธศาสตร์ที่ 5 ก้าวไปสู่การเป็นที่ยอมรับในระดับสากล', 'แผนงานที่ 9 บริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '66.5-009', 'การขอรับรองสถาบันการศึกษาการพยาบาลและการผดุงครรภ์', NULL, 'project', NULL, 'ผศ.ดร.พิชาภรณ์', 163, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(298, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', '1.เพื่อบริหารทรัพยากรการศึกษาและสร้างความปลอดภัย', '1.มีการสำรวจความต้องการด้านทรัพยากรการเรียนการสอนทั้งเชิงปริมาณและคุณภาพ อย่างน้อยปีละ 1 ครั้ง  \r\n2.มีการจัดสรรอุปกรณ์ เครื่องมือให้เพียงพอต่อการจัดการเรียนการสอน อย่างน้อยปีละ 1 ครั้ง \r\n3.มีการอบรมเรื่องอัคคีภัย ปีละ 1 ครั้ง', '48', 'โครงการ', NULL, 'project', NULL, NULL, 164, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(299, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ลำดับยุทธศาสตร์ \r\n(2565-2567)', 'จำนวนโครงการ', NULL, 'งบประมาณที่เสนอ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'งบประมาณที่เสนอคณะพยาบาลศาสตร์', 165, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(300, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 1', '19', NULL, '714,450', NULL, 'project', NULL, '518,462', 166, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(301, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 2', '12', NULL, '213,340', NULL, 'project', NULL, '0', 167, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(302, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 3', '5', NULL, '469,105', NULL, 'project', NULL, '0', 168, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(303, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 4', '3', NULL, '1,000', NULL, 'project', NULL, '2,000', 169, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(304, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 5', '9', NULL, '170,390', NULL, 'project', NULL, '12,400', 170, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(305, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'รวม', '48', NULL, '1,568,285', NULL, 'project', NULL, '532,862', 171, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(306, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ลำดับยุทธศาสตร์ \r\n(2565-2567)', 'จำนวนโครงการ', NULL, 'งบประมาณที่เสนอ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'งบประมาณที่เสนอคณะพยาบาลศาสตร์', 172, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(307, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 1', '19', NULL, '416,025', NULL, 'project', NULL, '519,294', 173, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(308, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 2', '12', NULL, '168,082', NULL, 'project', NULL, '-', 174, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(309, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 3', '5', NULL, '296,091', NULL, 'project', NULL, '-', 175, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(310, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 4', '3', NULL, '-', NULL, 'project', NULL, '2,000', 176, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(311, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'ยุทธศาสตร์ที่ 5', '9', NULL, '107,902', NULL, 'project', NULL, '12,201', 177, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(312, 2, 2566, 'รวมยุทธศาสตร์ที่ 5', '9 แผนงาน', 'รวม', '48', NULL, '988,099', NULL, 'project', NULL, '533,495', 178, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(313, 3, 2567, 'ยุทธศาสตร์ที่ 1', 'สร้างงานวิจัยและนวัตกรรมที่มี', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', '2091101 - 67028', 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', NULL, 'project', NULL, 'ผศ.ดร.รอญ.วิภานันท์', 1, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(314, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'คุณภาพส่งผลต่อการสร้างเสริม', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.1 วิจัยและนวัตกรรมสาขาสูติศาสตร์', 'activity', 313, 'อ.สุกฤตา', 2, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(315, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.2 วิจัยและนวัตกรรมสาขาผู้ใหญ่', 'activity', 313, 'อ.รัตนาภรณ์', 3, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(316, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.3 วิจัยและนวัตกรรมสาขาเด็กและวัยรุ่น', 'activity', 313, 'อ.ธัญลักษณ์วดี', 4, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(317, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.4 วิจัยและนวัตกรรมสาขาจิตเวช', 'activity', 313, 'ดร.สุวรรณา', 5, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(318, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.5 วิจัยและนวัตกรรมสาขาชุมชน', 'activity', 313, 'อ.รัฐกานต์', 6, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(319, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา', NULL, 'โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา', 'ก.6 วิจัยและนวัตกรรมสาขาผู้สูงอายุ', 'activity', 313, 'ดร.ปรียธิดา', 7, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(320, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 2 จำนวนเครือข่ายความร่วมมือการสร้างงานวิจัย นวัตกรรม กับภาคอุสาหกรรม องค์กรทั้งในและต่างประเทศ', '2091101 - 67002', 'โครงการส่งเสริมการวิจัยและนวัตกรรมร่วมกับเครือข่ายสถานพยาบาลหรือชุมชนเพื่อสุขภาวะชุมชนและสังคม (SDG 3)', NULL, 'project', NULL, 'อ.นฤมล', 8, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(321, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 2 จำนวนเครือข่ายความร่วมมือการสร้างงานวิจัย นวัตกรรม กับภาคอุสาหกรรม องค์กรทั้งในและต่างประเทศ', '2091101 - 67044', 'โครงการ Siam Nurse IRB', NULL, 'project', NULL, 'อ.ขวัญเรือน', 9, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(322, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 2 จำนวนเครือข่ายความร่วมมือการสร้างงานวิจัย นวัตกรรม กับภาคอุสาหกรรม องค์กรทั้งในและต่างประเทศ', '2091101 - 67004', 'โครงการวิจัยและนวัตกรรมด้านการพยาบาลผู้ป่วยวิกฤติและฉุกเฉิน', NULL, 'project', NULL, 'อ.สุนันทา', 10, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(323, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 2 จำนวนเครือข่ายความร่วมมือการสร้างงานวิจัย นวัตกรรม กับภาคอุสาหกรรม องค์กรทั้งในและต่างประเทศ', '2091101 - 67038', 'โครงการวิจัยและพัฒนาคลินิกการพยาบาลอบอุ่น (สปสช.)', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์', 11, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(324, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 3 จำนวนผลงานตีพิมพ์ระดับนานาชาติ Q1, Q2 และระดับชาติ TCI กลุ่ม 1', '2091101 - 67016', 'โครงการ Journal Club', NULL, 'project', NULL, 'ดร.วราภรณ์', 12, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(325, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 3 จำนวนผลงานตีพิมพ์ระดับนานาชาติ Q1, Q2 และระดับชาติ TCI กลุ่ม 1', '2091101 - 67007', 'โครงกา ตีพิมพ์เผยแพร่งานวิจัยและนวัตกรรม', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 13, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(326, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 4 จำนวนทรัพย์สินทางปัญญา', '2091101 - 67008', 'โครงการ Siam Nurse Innovation to Patent', NULL, 'project', NULL, 'ผศ.ดร.ชนิดา', 14, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(327, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 4 จำนวนทรัพย์สินทางปัญญา', '2091101 - 67009', 'โครงการ สนับสนุนการตีพิมพ์และเผยแพร่ผลงานผ่านวารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 15, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(328, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'สุขภาวะของประชาชน', NULL, 'KPI 4 จำนวนทรัพย์สินทางปัญญา', '2091101 - 67010', 'โครงการติดตามผลการดำเนินงานและพัฒนาแผนหลักสูตร', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 16, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(329, 3, 2567, 'ยุทธศาสตร์ที่ 1: Future Research & Innovation', 'ผลิตบัณฑิตพยาบาลศาสตร์', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', '2091101 - 67011', 'โครงการติวเตรียมสอบภาษาอังกฤษ placement test', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 17, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(330, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ที่มีทักษะสูง ตรงต่อความต้องการ', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', '2091101 - 67012', 'โครงการ English Camp', NULL, 'project', NULL, 'ดร.วราภรณ์', 18, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(331, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', '2091101 - 67013', 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 19, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(332, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.1 พัฒนาทักษะภาษา ปี 1', 'activity', 331, 'ผศ.ดร.วัฒนีย์', 20, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(333, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.2 พัฒนาทักษะภาษา ปี 2', 'activity', 331, 'ผศ.วารุณี', 21, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(334, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.3 พัฒนาทักษะภาษา ปี 3', 'activity', 331, 'อ.ธัญลักษณ์วดี', 22, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(335, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', NULL, 'โครงการภาษาอังกฤษ เพื่อวิชาชีพ ระดับชั้น ปี 1 – 4', 'ก.4 พัฒนาทักษะภาษา ปี 4', 'activity', 331, 'ผศ.ดร.จรัสดาว', 23, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(336, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 5 นักศึกษา/บัณฑิตสอบผ่านเกณฑ์การวัดระดับภาษาอังกฤษ (Placement Test) เพิ่มมากขึ้น', '2091101 - 67014', 'โครงการ แลกเปลี่ยนนักศึกษาระหว่างประเทศ', NULL, 'project', NULL, 'ดร.วราภรณ์', 24, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(337, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 6 นักศึกษา/บัณฑิตได้รับการพัฒนาทักษะทางดิจิทัลเพิ่มมากขึ้น', '2091101 - 67015', 'โครงการ พัฒนาทักษะดิจิทัลแก่นักศึกษาพยาบาล', NULL, 'project', NULL, 'อ.รัฐกานต์', 25, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(338, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', '2091101 - 67006', 'โครงการ เปิดบ้านพบผู้ประกอบการ', NULL, 'project', NULL, 'อ.สุจิตราภรณ์', 26, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(339, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', '2091101 - 67017', 'โครงการ เตรียมสอบใบประกอบอนุญาต', NULL, 'project', NULL, 'ผศ.ดร.รอญ.วิภานันท์', 27, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(340, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', '2091101 - 67018', 'โครงการ ติดตามประเมินคุณภาพบัณฑิตเน้น Outcomes', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 28, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(341, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', '2091101 - 67019', 'โครงการ ศิษย์เก่าสัมพันธ์', NULL, 'project', NULL, 'อ.ชัยสิทธิ์', 29, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(342, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.1 เปิดโลกกว้างสู่เรียนรู้ตลอดชีวิต Open resource learning', 'activity', 341, 'อ.ชัยสิทธิ์/อ.เพ็ญรุ่ง', 30, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(343, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.2 ประชุมวิชาการศิษย์เก่า', 'activity', 341, 'อ.สุภาภรณ์', 31, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(344, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.3 คืนสู่เหย้า ดอกปีบคืนต้น', 'activity', 341, 'อ.ชัยสิทธิ์/ดร.วราภรณ์', 32, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(345, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 7 ระดับพึงพอใจต่อหลักสูตรของนักศึกษา', NULL, 'โครงการ ศิษย์เก่าสัมพันธ์', 'ก.4 สานสัมพันธ์บัณฑิตใหม่', 'activity', 341, 'ผศ.ภัทรพร', 33, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(346, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 8 จำนวนนักศึกษา/บัณฑิตเข้าสู่การเป็น Technology based Startup', '2091101 - 67020', 'โครงการ พัฒนานักศึกษาเพื่อการแข่งขันนวัตกรรม/โครงการ/START UP', NULL, 'project', NULL, 'อ.รัฐกานต์', 34, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(347, 3, 2567, 'ยุทธศาสตร์ที่ 2', 'ของผู้ใช้บัณฑิต', NULL, 'KPI 9 จำนวนรางวัลนวัตกรรม/Startup', '2091101 - 67021', 'โครงการ ส่งประกวดสิ่งประดิษฐ์ผลงานนักศึกษาและการจดทรัพย์สินทางปัญญา', NULL, 'project', NULL, 'ผศ.วารุณี', 35, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(348, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'พัฒนาอาจารย์ให้มีความสามารถ', NULL, 'KPI 10 จำนวนอาจารย์รับรางวัลด้านวิชาการ/วิชาชีพระดับชาติและนานาชาติ', '2091101 - 67022', 'โครงการ พัฒนาศักยภาพอาจารย์เพื่อรับรางวัลระดับชาติและนานาชาติ', NULL, 'project', NULL, 'ผศ.ดร.อรทิพา', 36, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(349, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ทันต่อการเปลี่ยนแปลงของโลก', NULL, 'KPI 11 ระดับพึงพอใจของนักศึกษาต่อบริการของมหาวิทยาลัย', '2091101 - 67023', 'โครงการ พัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', NULL, 'project', NULL, 'ผศ.ดร.สมฤดี', 37, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(350, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 11 ระดับพึงพอใจของนักศึกษาต่อบริการของมหาวิทยาลัย', NULL, 'โครงการ พัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', 'ก.1 พัฒนาและประเมินความพึงพอใจสิ่งสนับสนุนการเรียนรู้', 'activity', 349, 'ผศ.ดร.สมฤดี', 38, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(351, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 11 ระดับพึงพอใจของนักศึกษาต่อบริการของมหาวิทยาลัย', NULL, 'โครงการ พัฒนาความพึงพอใจของนักศึกษาต่อการบริการ', 'ก.2  พัฒนากระบวนการบริการนักศึกษาระดับคณะฯ (เลขานุการ) และประเมินความพึงพอใจ', 'activity', 349, 'ผศ.ดร.สมฤดี', 39, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(352, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', '2091101 - 67024', 'โครงการ พัฒนาการให้คำปรึกษาและการดูแลศิษย์แก่อาจารย์ที่ปรึกษา', NULL, 'project', NULL, 'อ.ธารทิพย์', 40, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(353, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', '2091101 - 67025', 'โครงการ คัดเลือกสรรหานักศึกษา', NULL, 'project', NULL, 'ผศ.วารุณี/นักศึกษา', 41, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(354, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ คัดเลือกสรรหานักศึกษา', 'ก.1 Open house เพื่อการประชาสัมพันธ์สรรหา', 'activity', 353, 'ผศ.ภัทรพร', 42, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(355, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ คัดเลือกสรรหานักศึกษา', 'ก.2 เกณฑ์การรับนักศึกษาใหม่ (สุขภาพกาย/สุขภาพจิต)', 'activity', 353, 'ดร.สุวรรณา', 43, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(356, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', '2091101 - 67026', 'โครงการ สโมสรคณะพยาบาลศาสตร์', NULL, 'project', NULL, 'ผศ.วารุณี', 44, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(357, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.1 รับน้องเข้าหอ', 'activity', 356, 'อ.รัตนาภรณ์', 45, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(358, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.2 freshy', 'activity', 356, 'อ.เรวัต', 46, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(359, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.3 พัฒนาวินัยนักศึกษาจากรุ่นพี่สู่รุ่นน้องอย่างยั่งยืน', 'activity', 356, 'ผศ.วารุณี', 47, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(360, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.4 บ้านสี', 'activity', 356, 'อ.สุนันทา', 48, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(361, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.5 จุดเทียนส่องใจ', 'activity', 356, 'อ.ชัยสิทธิ์', 49, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(362, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.6 เปิดสายรหัส', 'activity', 356, 'อ.วิวรรณา', 50, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(363, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.7 หูกวางเกมส์', 'activity', 356, 'ดร.พจอ.ภูมเดชา', 51, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(364, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.8 ปฐมนิเทศมหาวิทยาลัย', 'activity', 356, 'ผศ.ดร.วัฒนีย์', 52, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(365, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.9 พี่สอนน้องประกันคุณภาพนักศึกษาพยาบาล', 'activity', 356, 'ผศ.วารุณี/อ.สุภาภรณ์', 53, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(366, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', NULL, 'โครงการ สโมสรคณะพยาบาลศาสตร์', 'ก.10 Bye Nior', 'activity', 356, 'ดร.วราภรณ์', 54, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(367, 3, 2567, 'ยุทธศาสตร์ที่ 3', 'ยุคปัจุบัน', NULL, 'KPI 12 อัตราการลาออกของนักศึกษาลดลง', '2091101 - 67027', 'โครงการ พัฒนานักศึกษาด้านวิชาการ ผ่านกระบวนการ ปูปั้นดาว', NULL, 'project', NULL, 'อ.สุนันทา', 55, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(368, 3, 2567, 'ยุทธศาสตร์ที่ 4', 'พัฒนาระบบบริหารจัดการ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', '2091101 - 67001', 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', NULL, 'project', NULL, 'พจอ.ดร.ภูมเดชา', 56, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(369, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'เพื่อสนับสนุนการดำเนินงาน', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.1 การพัฒนาระบบสารสนเทศ', 'activity', 368, 'พจอ.ดร.ภูมเดชา', 57, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(370, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.2 การบริหารความเสี่ยง', 'activity', 368, 'ผศ.ดร.สุสารี', 58, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(371, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.3 การจัดการความรู้', 'activity', 368, 'ผศ.ดร.ชนิดา', 59, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(372, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.4 การประกันคุณภาพระดับคณะ', 'activity', 368, 'ผศ.ดร.สมฤดี', 60, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(373, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.5 การประกันคุณภาพระดับหลักสูตร AUN - QA', 'activity', 368, 'ผศ.ดร.สุสารี', 61, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(374, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.6 การประเมินความพึงพอใจด้านสารสนเทศ', 'activity', 368, 'ผศ.ดร.ดวงกมล', 62, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(375, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 13 มีระบบฐานข้อมูลสารสนเทศที่ถูกต้องและเป็นปัจจุบัน', NULL, 'โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ', 'ก.7 การติดตามผลการดำเนินงานและนำผลการประเมินมาวางแผนปรับปรุง', 'activity', 368, 'อ.รัฐกานต์', 63, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(376, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', '2091101 - 67029', 'โครงการ พัฒนาบุคลากร', NULL, 'project', NULL, 'อ.อัมพร', 64, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(377, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.1 การพัฒนาตนเองของบุคลากร (IPD)', 'activity', 376, 'ผศ.ดร.พิชาภรณ์', 65, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(378, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.2 การพัฒนาด้านคุณวุฒิ', 'activity', 376, 'ผศ.ดร.อรทิพา', 66, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(379, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.3 การพัฒนาอาจารย์สู่ตำแหน่งวิชาการ', 'activity', 376, 'ผศ.ดร.จรัสดาว', 67, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(380, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.4 เพชรในเรือน', 'activity', 376, 'อ.อัมพร', 68, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(381, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.5 ปฐมนิเทศอาจารย์ใหม่', 'activity', 376, 'ผศ.ดร.อรทิพา/ผศ.ดร.วัฒนีย์', 69, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(382, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.6 ระบบพี่เลี้ยงอาจารย์ใหม่', 'activity', 376, 'ผศ.ดร.วัฒนีย์', 70, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(383, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', NULL, 'โครงการ พัฒนาบุคลากร', 'ก.7 Faculty practice', 'activity', 376, 'ผศ.ดร.สุสารี', 71, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(384, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', '2091101 - 67030', 'โครงการ ศูนย์ให้คำปรึกษาของมหาวิทยาลัย', NULL, 'project', NULL, 'ผศ.ดร.สุสารี', 72, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(385, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', '2091101 - 67031', 'โครงการ ศูนย์การศึกษาต่อเนื่อง', NULL, 'project', NULL, 'อ.สุกฤตา', 73, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(386, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 14 มีระบบการประเมินผลงานอาจารย์ที่มีประสิทธิภาพ', '2091101 - 67032', 'โครงการ พัฒนาประเมินและติดตามผลงานเพื่อการจัดอันดับ', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 74, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(387, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', '2091101 - 67033', 'โครงการ Bind the organization', NULL, 'project', NULL, 'ผศ.ดร.วัฒนีย์', 75, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(388, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.1 การศึกษาดูงานภายในประเทศ', 'activity', 387, 'ผศ.ดร.อรทิพา', 76, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(389, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.2 การศึกษาดูงานต่างประเทศ', 'activity', 387, 'ผศ.ดร.อรทิพา', 77, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(390, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.3 การอบรบอัคคีภัย', 'activity', 387, 'พจอ.ดร.ภูมเดชา', 78, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(391, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.4 อบรมหลักสูตรพัฒนาศักยภาพด้านการสอนสำหรับอาจารย์พี่เลี้ยงในคลินิก', 'activity', 387, 'อ.ธารทิพย์', 79, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(392, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.5 อมรม/สัมมนาทางวิชาการตามสาขาที่เกี่ยวข้องตาม training need', 'activity', 387, 'ผศ.ดร.พิชาภรณ์', 80, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(393, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.6 สัมมนาทางวิชาการและวิชาชีพ', 'activity', 387, 'ผศ.ดร.อรทิพา', 81, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(394, 3, 2567, 'ยุทธศาสตร์ที่ 4: Future System for Management', 'ทุกพันธกิจ', NULL, 'KPI 15 ระดับความยึดมั่นผูกพันธ์ต่อองค์กร อยู่ในระดับดี', NULL, 'โครงการ Bind the organization', 'ก.7 Health instructor', 'activity', 387, 'อ.ธัญลักษณ์วดี', 82, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(395, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'สร้างเสริมให้นักศึกษาพยาบาล', NULL, 'KPI 16 มหาวิทยาลัยที่ได้รับการจัดอันดับ (Rankings) ในระดับสากล การสร้างผลกระทบต่อการพัฒนาอย่างยั่งยืน และในด้านวิชาการ', '2091101 - 67034', 'โครงการ อบรมหลักสูตรพัฒนาศักยภาพด้านภาวะวิกฤติและฉุกเฉินสำหรับอาจารย์พี่เลี้ยงในคลินิกผู้ป่วยวิกฤติ', NULL, 'project', NULL, 'อ.สุนันทา', 83, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(396, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'มีความฉลาดด้านความยั่งยืน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67035', 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัลในรายวิชา', NULL, 'project', NULL, 'อ.เพ็ญรุ่ง', 84, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(397, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'ผ่านประสบการณ์จริงในองค์กร', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัลในรายวิชา', 'ก.1 รายวิชาการพยาบาลผู้ใหญ่และผู้สูงอายุ', 'activity', 396, 'ผศ.ดร.ดวงกมล', 85, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(398, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัลในรายวิชา', 'ก.2 รายวิชาการพยาบาลสุขภาพจิตและจิตเวช', 'activity', 396, 'ดร.สุวรรณา', 86, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(399, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', NULL, 'โครงการ บูรณาการการบริการวิชาการกับการเรียนการสอนสู่ยุคดิจิทัลในรายวิชา', 'ก.3 รายวิชาการพยาบาลอนามัยชุมชน', 'activity', 396, 'อ.ชัยสิทธิ์', 87, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(400, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67036', 'โครงการ ศูนย์การบริการวิชาการแก่สังคมด้านวิชาชีพการพยาบาลเพื่อสร้างเสริมศักยภาพของชุมชนอย่างยั่งยืน', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์', 88, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(401, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67037', 'โครงการสร้างเสริมสุขภาพผู้สูงอายุโดยการพัฒนาศักยภาพผู้ดูแล Caregiver ในอำเภอบางกรวย จังหวัดนนทบุรี', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์', 89, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(402, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67005', 'โครงการ พัฒนาจัดตั้งชมรมผู้สูงอายุต้นแบบ (Excellent Center) ของคณะพยาบาลศาสตร์ มหาวิทยาลัยสยาม', NULL, 'project', NULL, 'ดร.ปรียธิดา', 90, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(403, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67039', 'โครงการ Caregiver ยุคดิจิทัล อบรมแกนนำ และนำความรู้ในการดูแลผู้สูงอายุสู่ชุมชน', NULL, 'project', NULL, 'อ.พรพิมล', 91, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(404, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 17 คณะวิชามีโครงการบริการวิชาการ ทั้งแบบมีรายได้ และไม่มีรายได้', '2091101 - 67040', 'โครงการ เครือข่าย สสอท. จัดตั้งคลินิกพยาบาลชุมชนอบอุ่นในสถาบันการศึกษา', NULL, 'project', NULL, 'ผศ.ดร.ศนิกานต์/', 92, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41');
INSERT INTO `annual_project_report_items` (`id`, `import_batch_id`, `academic_year`, `strategy`, `plan_name`, `objective`, `kpi`, `project_code`, `project_name`, `activity_name`, `row_type`, `parent_item_id`, `responsible_person`, `sort_order`, `raw_row_json`, `created_at`, `updated_at`) VALUES
(405, 3, 2567, 'ยุทธศาสตร์ที่ 5', 'และชุมชน', NULL, 'KPI 18 ผลการวัดความฉลาดรู้ด้านความ ยั่งยืน (Thai-SULI Test) อยู่ในระดับดี', '2091101 - 67041', 'โครงการ การวัดความฉลาดรู้ด้านความ ยั่งยืน', NULL, 'project', NULL, 'ผศ.ดร.จรัสดาว', 93, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(406, 3, 2567, 'ยุทธศาสตร์ที่ 6', 'มีความภาคภูมิใจในวัฒนธรรมไทย', NULL, 'KPI N1 จำนวนโครงการ/กิจกรรม', '2091101 - 67042', 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', NULL, 'project', NULL, 'อ.สุจิตราภรณ์', 94, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(407, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'อัตลักษณ์และเอกลักษณ์', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.1 พิธีถวายกฐินพระราชทาน', 'activity', 406, 'อ.สุจิตราภรณ์', 95, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(408, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ของวิชาชีพ ทำนุบำรุงศิลปะ', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.2 พิธีหล่อเทียนและถวายเทียนพรรษา', 'activity', 406, 'อ.ศิรินา', 96, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(409, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'และวัฒนธรรม ยอมรับในความ', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.3 บายศรีสู่ขวัญและไหว้ครู', 'activity', 406, 'อ.สุนันทา', 97, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(410, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'หลากหลายและความแตกต่าง', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.4 ตักบาตรวันขึ้นปีใหม่', 'activity', 406, 'พ.ต.อ.ระชี', 98, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(411, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.5 รดน้ำขอพรเทศกาลวันสงกรานต์', 'activity', 406, 'อ.สุกฤตา', 99, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(412, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.6 วันลอยกระทง', 'activity', 406, 'ดร.ณิชมล/อ.นฤมล', 100, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(413, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N2 ค่าเฉลี่ยนความพึงพอใจของผู้เข้าร่วมโครงการ', NULL, 'โครงการ ธำรงศิลปวัฒนธรรมและประเพณีไทย', 'ก.7 ออนไลน์ไทยเฟสติวัล', 'activity', 406, 'อ.สุจิตราภรณ์', 101, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(414, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N3 จำนวนโครงการ/กิจกรรม', '2091101 - 67043', 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', NULL, 'project', NULL, 'อ.รัฐกานต์', 102, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(415, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N4 แนวปฏิบัติที่ดีที่เกิดจากการดำเนินโครงการ', NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.1 แลกเปลี่ยนวัฒนธรรมกับนักศึกษาต่างชาติ', 'activity', 414, 'ดร.วราภรณ์', 103, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(416, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N4 แนวปฏิบัติที่ดีที่เกิดจากการดำเนินโครงการ', NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.2 คุณธรรมกับอัตลักษณ์ตัวตน', 'activity', 414, 'พ.ต.อ.ระชี', 104, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(417, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N4 แนวปฏิบัติที่ดีที่เกิดจากการดำเนินโครงการ', NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.3 กลุ่มสัมพันธ์ประสานใจ', 'activity', 414, 'ดร.สุวรรณา/อ.วิวรรณา', 105, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(418, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N4 แนวปฏิบัติที่ดีที่เกิดจากการดำเนินโครงการ', NULL, 'โครงการ บูรณาการงานทำนุบำรุงศิลปะและวัฒนธรรม', 'ก.4 วันรำลึกผู้ก่อนตั้งมหาวิทยาลัย', 'activity', 414, 'ผศ.ดร.อรทิพา', 106, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(419, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N5 จำนวนผู้เข้าร่วมกิจกรรม', '2091101 - 67003', 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', NULL, 'project', NULL, 'อ.รุ่งนภา', 107, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(420, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.1 การแต่งกายด้วยผ้าไทย', 'activity', 419, 'อ.รุ่งนภา', 108, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(421, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.2 พยาบาลสยามไหว้สวย', 'activity', 419, 'พ.ต.อ.ระชี', 109, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(422, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.3 ปฐมนิเทศคณะพยาบาลศาสตร์', 'activity', 419, 'อ.อัมพร', 110, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(423, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.4 ปัจฉิมนิเทศ', 'activity', 419, 'ผศ.ดร.พิชาภรณ์', 111, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(424, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.5 วันพยาบาลแห่งชาติ', 'activity', 419, 'ดร.สุจิตราภรณ์', 112, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(425, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.6 วันมหิดล', 'activity', 419, 'อ.นฤมล', 113, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(426, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N6 ค่าเฉลี่ผลการประเมินเจคติและพฤติกรรม', NULL, 'โครงการ พัฒนานักศึกษาด้านอัตลักษณ์ เอกลักษณ์', 'ก.7 BLACK BONE PROJECT', 'activity', 419, 'อ.เรวัต', 114, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(427, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N7 จำนวนผู้เข้าร่วมกิจกรรม', '2091101 - 67045', 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', NULL, 'project', NULL, 'พ.ต.อ.ระชี', 115, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(428, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.1 สอบธรรมศึกษา', 'activity', 427, 'ดร.ณิชมล/อ.รุ่งนภา', 116, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(429, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.2 การเป็นลูกที่ดีของพ่อแม่ (ชั้นปีที่ 1)', 'activity', 427, 'พ.ต.อ.ระชี', 117, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(430, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.3 สมาธิ สติ ปัญญา (ชั้นปีที่ 2)', 'activity', 427, 'อ.ชัยสิทธิ์/อ.ขวัญเรือน', 118, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(431, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.4 ส่งเสริมไตรลักษณ์ (ชั้นปีที่ 3)', 'activity', 427, 'ผศ.ดร.ดวงกมล', 119, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(432, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.5 พรหมวิหาร 4 (ชั้นปีที่ 4)', 'activity', 427, 'ผศ.ภัทรพร', 120, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(433, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N8 จำนวนนักศึกษาที่สอบผ่านธรรมศึกษา', NULL, 'โครงการ พัฒนาจรรยาบรรณ คุณธรรมความดีงาม และกตัญญูรู้คุณ', 'ก.6 ธรรมะสอนใจ เป็นไฟส่องทาง', 'activity', 427, 'อ.สุกฤตา', 121, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(434, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', '2091101 - 67046', 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', NULL, 'project', NULL, 'อ.เพ็ญรุ่ง', 122, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(435, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.1 Home Room ปี 1', 'activity', 434, 'อ.รุ่งนภา', 123, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(436, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.2 Home Room ปี 2', 'activity', 434, 'ดร.ณิชมล', 124, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(437, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.3 Home Room ปี 3', 'activity', 434, 'อ.ธารทิพย์', 125, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(438, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.4 Home Room ปี 4', 'activity', 434, 'อ.เพ็ญรุ่ง', 126, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(439, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.5 Portfolio ปี 1', 'activity', 434, 'อ.สุภาภรณ์', 127, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(440, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.6 Portfolio ปี 2', 'activity', 434, 'อ.พรพิมล', 128, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(441, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.7 Portfolio ปี 3', 'activity', 434, 'อ.ขวัญเรือน', 129, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(442, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.8 Portfolio ปี 4', 'activity', 434, 'ผศ.ดร.รอญ.วิภานันท์', 130, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(443, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.9 พิธีมอบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 2', 'activity', 434, 'ดร.ณิชมล', 131, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41'),
(444, 3, 2567, 'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม', 'ทางวัฒนธรรม', NULL, 'KPI N9 จำนวนผู้เข้าร่วมกิจกรรม', NULL, 'โครงการ พัฒนาจรรยาบรรณ พฤติกรรมบริการและวัฒนธรรมทางวิชาชีพ', 'ก.10 พิธีมอบหมวกและเข็มเครื่องหมาย ชั้นปีที่ 4', 'activity', 434, 'อ.วิวรรณา', 132, NULL, '2026-07-01 10:03:41', '2026-07-01 10:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `approval_requests`
--

CREATE TABLE `approval_requests` (
  `approval_request_id` bigint NOT NULL,
  `request_type` varchar(50) NOT NULL,
  `requester_user_id` bigint DEFAULT NULL,
  `target_ref_type` varchar(50) DEFAULT NULL,
  `target_ref_id` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `payload_json` json DEFAULT NULL,
  `before_json` json DEFAULT NULL,
  `after_json` json DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `review_note` text,
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `approval_requests`
--

INSERT INTO `approval_requests` (`approval_request_id`, `request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `payload_json`, `before_json`, `after_json`, `status`, `review_note`, `reviewed_by`, `reviewed_at`, `applied_at`, `created_at`, `updated_at`) VALUES
(30, 'student_transfer', 12, 'student', '6603400004,6603400005,6603400006,6603400007', 'โอนย้ายนักศึกษา (4 คน)', 'เปลี่ยนเด็กหน่อยค้าบ', '{\"reason\": \"เปลี่ยนเด็กหน่อยค้าบ\", \"student_id\": null, \"student_ids\": [\"6603400004\", \"6603400005\", \"6603400006\", \"6603400007\"], \"to_advisor_id\": \"380018\", \"from_advisor_id\": \"44172033\", \"to_advisor_user_id\": 16, \"from_advisor_user_id\": 12}', NULL, NULL, 'approved', NULL, 5, '2026-09-24 14:36:57', '2026-09-24 14:36:57', '2026-09-24 14:35:44', '2026-09-24 14:36:57'),
(31, 'student_transfer', 12, 'student', NULL, 'โอนย้ายนักศึกษา (12 คน)', 'ย้ายๆๆๆ', '{\"reason\": \"ย้ายๆๆๆ\", \"student_id\": null, \"student_ids\": [\"6603400001\", \"6603400002\", \"6603400004\", \"6603400005\", \"6603400006\", \"6603400007\", \"6603400008\", \"6603400009\", \"6603400010\", \"6603400011\", \"6603400012\", \"6603400013\"], \"to_advisor_id\": \"380018\", \"from_advisor_id\": \"44172033\", \"to_advisor_user_id\": 16, \"from_advisor_user_id\": 12}', NULL, NULL, 'approved', NULL, 5, '2026-09-24 15:04:40', '2026-09-24 15:04:40', '2026-09-24 15:04:12', '2026-09-24 15:04:40'),
(32, 'student_transfer', 16, 'student', NULL, 'โอนย้ายนักศึกษา (12 คน)', 'ไม่เอาๆไม่ย้าย เอากลับไป', '{\"reason\": \"ไม่เอาๆไม่ย้าย เอากลับไป\", \"student_id\": null, \"student_ids\": [\"6603400001\", \"6603400002\", \"6603400004\", \"6603400005\", \"6603400006\", \"6603400007\", \"6603400008\", \"6603400009\", \"6603400010\", \"6603400011\", \"6603400012\", \"6603400013\"], \"to_advisor_id\": \"44172033\", \"from_advisor_id\": \"380018\", \"to_advisor_user_id\": 12, \"from_advisor_user_id\": 16}', NULL, NULL, 'approved', NULL, 5, '2026-09-24 15:05:54', '2026-09-24 15:05:54', '2026-09-24 15:05:36', '2026-09-24 15:05:54');

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
  `action_type` enum('create','update','delete','login','logout','role_change','export') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'update',
  `resource` varchar(100) DEFAULT 'ระบบ',
  `details` text COMMENT 'รายละเอียดการกระทำ',
  `ip_address` varchar(45) DEFAULT '127.0.0.1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'ทำเมื่อไหร่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`audit_log_id`, `user_id`, `action_type`, `resource`, `details`, `ip_address`, `created_at`) VALUES
(724, 1, 'update', 'student_vaccinations', 'บันทึกประวัติการรับวัคซีนนักศึกษา รหัส: 6603400001', '172.18.0.1', '2026-09-26 15:50:46'),
(725, 1, 'update', 'student_health_records', 'บันทึกข้อมูลภาวะสุขภาพนักศึกษา รหัส: 6603400001', '172.18.0.1', '2026-09-26 15:51:20'),
(726, 12, 'update', 'student_competency', 'อาจารย์ประเมินสมรรถนะนักศึกษา รหัส: 6603400001 จำนวน 13 ข้อ (ปีการศึกษา 2569)', '172.18.0.1', '2026-09-26 15:51:55'),
(727, 1, 'update', 'student_vaccinations', 'บันทึกประวัติการรับวัคซีนนักศึกษา รหัส: 6603400001', '172.18.0.1', '2026-09-26 15:56:09'),
(728, 1, 'update', 'student_vaccinations', 'บันทึกประวัติการรับวัคซีนนักศึกษา รหัส: 6603400001', '172.18.0.1', '2026-09-26 15:56:33'),
(729, 12, 'create', 'documents', 'อัปโหลดเอกสาร มคอ.3 (ID: 110) รายวิชา: 123-123', '172.18.0.1', '2026-09-27 12:55:59'),
(730, 12, 'delete', 'documents', 'ลบเอกสาร มคอ.3 (เทสๆ) รายวิชา: 123-123', '172.18.0.1', '2026-09-27 13:14:21'),
(731, 12, 'create', 'documents', 'อัปโหลดเอกสาร มคอ.3 (ID: 111) รายวิชา: 123-123', '172.18.0.1', '2026-09-27 13:15:09'),
(732, 12, 'delete', 'documents', 'ลบเอกสาร มคอ.3 (เทสๆ) รายวิชา: 123-123', '172.18.0.1', '2026-09-27 13:16:35'),
(733, 12, 'create', 'documents', 'อัปโหลดเอกสาร มคอ.3 (ID: 112) รายวิชา: 123-123', '172.18.0.1', '2026-09-27 13:18:11'),
(734, 12, 'create', 'research_summary', 'publication_id=1; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:29'),
(735, 12, 'create', 'research_summary', 'publication_id=2; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:30'),
(736, 12, 'create', 'research_summary', 'publication_id=3; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:31'),
(737, 12, 'delete', 'research_summary', 'publication_id=3; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:32'),
(738, 12, 'delete', 'research_summary', 'publication_id=2; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:32'),
(739, 12, 'delete', 'research_summary', 'publication_id=1; faculty_id=41172008', '172.18.0.1', '2026-09-27 15:50:33'),
(740, 12, 'create', 'documents', 'อัปโหลดเอกสาร มคอ.4 (ID: 113) รายวิชา: 111-111', '172.18.0.1', '2026-09-27 15:57:23'),
(741, 12, 'create', 'research_summary', 'publication_id=4; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:13'),
(742, 12, 'delete', 'research_summary', 'publication_id=4; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:28'),
(743, 12, 'create', 'research_summary', 'publication_id=5; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:32'),
(744, 12, 'create', 'research_summary', 'publication_id=6; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:32'),
(745, 12, 'create', 'research_summary', 'publication_id=7; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:33'),
(746, 12, 'create', 'research_summary', 'publication_id=8; faculty_id=44172033', '172.18.0.1', '2026-09-27 16:04:36'),
(747, 12, 'create', 'research_summary', 'publication_id=9; faculty_id=44172033', '172.18.0.1', '2026-09-27 16:04:36'),
(748, 12, 'delete', 'research_summary', 'publication_id=9; faculty_id=44172033', '172.18.0.1', '2026-09-27 16:04:39'),
(749, 12, 'delete', 'research_summary', 'publication_id=8; faculty_id=44172033', '172.18.0.1', '2026-09-27 16:04:39'),
(750, 12, 'delete', 'research_summary', 'publication_id=5; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:41'),
(751, 12, 'delete', 'research_summary', 'publication_id=6; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:42'),
(752, 12, 'delete', 'research_summary', 'publication_id=7; faculty_id=41172008', '172.18.0.1', '2026-09-27 16:04:44'),
(753, 5, 'update', 'assign_instructors', 'มอบหมายอาจารย์ผู้สอน (ID: 44172033) รายวิชา: 111-111 (ภาคเรียน 1/2569)', '172.18.0.1', '2026-09-28 06:49:52'),
(754, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO1 (ID: 6) ในรายวิชา 111-111', '172.18.0.1', '2026-09-28 06:52:26'),
(755, 5, 'update', 'curriculum', 'ปรับปรุงตารางความสัมพันธ์ YLO-PLO ระดับหลักสูตร', '172.18.0.1', '2026-09-28 06:53:36'),
(756, 5, 'update', 'curriculum', 'ปรับปรุงข้อมูลหมวด Sub PLO หลักสูตร (เพิ่ม 0, แก้ไข 19, ลบ 0)', '172.18.0.1', '2026-09-28 06:53:36'),
(757, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:01:04'),
(758, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO4 (ID: 7) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:04:09'),
(759, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO5 (ID: 8) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:04:35'),
(760, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO6 (ID: 9) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:04:49'),
(761, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:05:30'),
(762, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:08:29'),
(763, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO1 (ID: 10) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:09:31'),
(764, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO2 (ID: 11) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:09:38'),
(765, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO2 (ID: 11) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:10:12'),
(766, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO1 (ID: 10) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:10:16'),
(767, 12, 'update', 'clos', 'แก้ไข CLO รหัส CLO1 (ID: 1) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:10:31'),
(768, 12, 'update', 'clos', 'แก้ไข CLO รหัส CLO2 (ID: 2) ในรายวิชา 103-111', '172.18.0.1', '2026-09-28 07:10:37'),
(769, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:11:07'),
(770, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:11:20'),
(771, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:11:48'),
(772, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:19:10'),
(773, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 1 คน)', '172.18.0.1', '2026-09-28 07:20:36'),
(774, 12, 'create', 'advise_notes', 'บันทึกการให้คำปรึกษานักศึกษารหัส 6603400001 (หัวข้อ: 123)', '172.18.0.1', '2026-09-28 07:38:36'),
(775, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 1): พไพไพำไพไพไ ชั้นปีที่ 1', '172.18.0.1', '2026-09-28 07:51:27'),
(776, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 178): เทสๆ ชั้นปีที่ 1', '172.18.0.1', '2026-09-28 07:51:28'),
(777, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 57): -ภ/ภ/ภ/ภ/-ภ ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 07:52:19'),
(778, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 58): /-ภ/ภ/ภ/ภ/ ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 07:52:21'),
(779, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 59): -ภ/ภ/ภ/ภ/ ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 07:52:22'),
(780, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 179): เทสๆ ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 07:52:25'),
(781, 5, 'create', 'competency_items', 'เพิ่มรายการประเมินสมรรถนะ: 123456 (ID: 180, ชั้นปีที่ 4, PLO1)', '172.18.0.1', '2026-09-28 07:52:29'),
(782, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 60): ภ/-ภ/-ภ/-ภ/ภ ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 07:52:33'),
(783, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 2): พไำพไพไพไพไ ชั้นปีที่ 1', '172.18.0.1', '2026-09-28 07:54:22'),
(784, 5, 'create', 'competency_items', 'เพิ่มรายการประเมินสมรรถนะ: 11235465 (ID: 181, ชั้นปีที่ 1, PLO1)', '172.18.0.1', '2026-09-28 08:05:27'),
(785, 5, 'update', 'competency_items', 'แก้ไขรายการประเมินสมรรถนะ: 1234561165165 (ID: 180, ชั้นปีที่ 4, PLO1)', '172.18.0.1', '2026-09-28 08:05:34'),
(786, 5, 'create', 'competency_items', 'เพิ่มรายการประเมินสมรรถนะ: 889484894 (ID: 182, ชั้นปีที่ 4, PLO1)', '172.18.0.1', '2026-09-28 08:05:40'),
(787, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 180): 1234561165165 ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 08:06:27'),
(788, 5, 'delete', 'competency_items', 'ลบรายการประเมินสมรรถนะ (ID: 182): 889484894 ชั้นปีที่ 4', '172.18.0.1', '2026-09-28 08:06:39'),
(789, 12, 'update', 'student_competency', 'อาจารย์ประเมินสมรรถนะนักศึกษา รหัส: 6603400001 จำนวน 9 ข้อ (ปีการศึกษา 2569)', '172.18.0.1', '2026-09-28 08:07:19'),
(790, 12, 'create', 'research_summary', 'publication_id=10; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:53'),
(791, 12, 'create', 'research_summary', 'publication_id=11; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:55'),
(792, 12, 'create', 'research_summary', 'publication_id=12; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:56'),
(793, 12, 'create', 'research_summary', 'publication_id=13; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:57'),
(794, 12, 'create', 'research_summary', 'publication_id=14; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:58'),
(795, 12, 'create', 'research_summary', 'publication_id=15; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:33:59'),
(796, 12, 'delete', 'research_summary', 'publication_id=11; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:36:42'),
(797, 12, 'delete', 'research_summary', 'publication_id=13; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:36:43'),
(798, 12, 'delete', 'research_summary', 'publication_id=15; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:36:44'),
(799, 12, 'create', 'research_summary', 'publication_id=16; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:36:48'),
(800, 12, 'create', 'research_summary', 'publication_id=17; faculty_id=41172008', '172.18.0.1', '2026-09-28 08:36:50'),
(801, 5, 'update', 'assign_students', 'จัดอาจารย์ปฏิบัติให้อาจารย์ ภัทรพร อรัณยภาค (รหัส: 44172033) จำนวน 5 คน', '172.18.0.1', '2026-09-28 08:40:59'),
(802, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-05 15:03:37'),
(803, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-05 15:03:56'),
(804, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:24'),
(805, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:24'),
(806, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:24'),
(807, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:33'),
(808, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:33'),
(809, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 16:49:33'),
(810, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 17:01:18'),
(811, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 17:01:19'),
(812, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 69, ชื่อ: โครงการ 2, ไฟล์: Screenshot 2025-11-12 010427.png)', '172.18.0.1', '2026-10-05 17:01:19'),
(813, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 17:02:34'),
(814, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-05 17:02:34'),
(815, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 72, ชื่อ: โครงการ 2, ไฟล์: Screenshot 2025-11-12 010427.png)', '172.18.0.1', '2026-10-05 17:02:34'),
(816, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 72 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-05 17:06:16'),
(817, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-05 17:06:24'),
(818, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 73, ชื่อ: Screenshot 2025-11-12 010427.png, ไฟล์: Screenshot 2025-11-12 010427.png)', '172.18.0.1', '2026-10-05 17:06:36'),
(819, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 73 ชื่อ: Screenshot 2025-11-12 010427.png (project_id: 14)', '172.18.0.1', '2026-10-05 17:06:53'),
(820, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-05 17:06:54'),
(821, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 74, ชื่อ: โครงการ 2, ไฟล์: Screenshot 2025-11-12 010427.png)', '172.18.0.1', '2026-10-05 17:07:05'),
(853, 5, 'update', 'ผู้ใช้', 'ระงับบัญชีผู้ใช้ 380018 (user_id=16)', '172.18.0.1', '2026-10-08 19:45:23'),
(854, 5, 'update', 'ผู้ใช้', 'เปิดใช้งานบัญชีผู้ใช้ 380018 (user_id=16)', '172.18.0.1', '2026-10-08 19:45:27'),
(855, 5, 'update', 'ผู้ใช้', 'ระงับบัญชีผู้ใช้ 380018 (user_id=16)', '172.18.0.1', '2026-10-08 19:46:49'),
(856, 5, 'update', 'ผู้ใช้', 'เปิดใช้งานบัญชีผู้ใช้ 380018 (user_id=16)', '172.18.0.1', '2026-10-08 19:46:53'),
(857, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 74 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:43:06'),
(858, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 112, ชื่อ: รูป, ไฟล์: Screenshot 2025-07-14 023631.png)', '172.18.0.1', '2026-10-11 13:43:51'),
(859, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 112 ชื่อ: รูป (project_id: 14)', '172.18.0.1', '2026-10-11 13:44:20'),
(860, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 71 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:44:22'),
(861, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 70 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:44:23'),
(862, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-11 13:44:26'),
(863, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-11 13:44:53'),
(864, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-11 13:44:53'),
(865, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 115, ชื่อ: โครงการ 2, ไฟล์: Screenshot 2025-07-14 023631.png)', '172.18.0.1', '2026-10-11 13:44:53'),
(866, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-11 13:45:19'),
(867, 5, 'create', 'project_documents', 'เพิ่มรายการเอกสารโครงการใหม่ (ชื่อ: โครงการ 2, โครงการ: โครงการ 2)', '172.18.0.1', '2026-10-11 13:45:19'),
(868, 5, 'create', 'project_documents', 'เพิ่มไฟล์เอกสารโครงการใหม่ (ID: 118, ชื่อ: โครงการ 2, ไฟล์: Screenshot 2025-07-14 023631.png)', '172.18.0.1', '2026-10-11 13:45:20'),
(869, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 115 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:45:42'),
(870, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 114 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:45:47'),
(871, 5, 'delete', 'project_documents', 'ลบเอกสารโครงการ ID: 113 ชื่อ: โครงการ 2 (project_id: 14)', '172.18.0.1', '2026-10-11 13:45:48'),
(872, 5, 'update', 'projects', 'แก้ไขข้อมูลโครงการ: โครงการ 2 (ID: 14)', '172.18.0.1', '2026-10-11 13:45:51'),
(873, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO6 (ID: 9) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:37'),
(874, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO4 (ID: 7) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:39'),
(875, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO2 (ID: 2) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:41'),
(876, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO1 (ID: 1) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:43'),
(877, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO3 (ID: 5) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:45'),
(878, 12, 'delete', 'clos', 'ลบ CLO รหัส CLO5 (ID: 8) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:10:48'),
(879, 5, 'create', 'curriculum_sub_plo', 'เพิ่ม Sub PLO 1.1: 1111111111111 (ID: 48, ชั้นปีที่ 4, PLO1)', '172.18.0.1', '2026-10-11 15:11:45'),
(880, 5, 'update', 'curriculum_subjects', 'แก้ไขรายวิชา 103-111 ในหลักสูตร พ.ศ. 2575 - 2580 (ID: 73)', '172.18.0.1', '2026-10-11 15:12:26'),
(881, 5, 'create', 'curriculum_sub_plo', 'เพิ่ม Sub PLO 1.2: dfjkslajfkd;saf (ID: 49, ชั้นปีที่ 1, PLO1)', '172.18.0.1', '2026-10-11 15:12:52'),
(882, 12, 'create', 'clos', 'เพิ่ม CLO รหัส CLO1 (ID: 12) ในรายวิชา 103-111', '172.18.0.1', '2026-10-11 15:14:18'),
(883, 12, 'update', 'course_students', 'บันทึก/แก้ไขคะแนน Sub PLO ในรายวิชา 103-111 (จำนวน 3 คน)', '172.18.0.1', '2026-10-11 15:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `competency_items`
--

CREATE TABLE `competency_items` (
  `id` bigint NOT NULL,
  `plo_id` bigint DEFAULT NULL,
  `year_level` tinyint NOT NULL COMMENT 'ชั้นปีที่ใช้ฟอร์มนี้',
  `sequence_no` tinyint UNSIGNED NOT NULL COMMENT 'ลำดับ (1-17...)',
  `competency_name` text NOT NULL,
  `is_scorable` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = แถวที่ไม่ต้องประเมิน (ไม่กำหนดตัวชี้วัด), 1 = ต้องให้คะแนน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `competency_items`
--

INSERT INTO `competency_items` (`id`, `plo_id`, `year_level`, `sequence_no`, `competency_name`, `is_scorable`) VALUES
(10, NULL, 4, 1, 'vdbbdfbdbdfb', 1),
(11, NULL, 4, 4, 'erbqbbtb', 1),
(12, NULL, 4, 5, 'wgwegbebeqbe', 1),
(14, NULL, 4, 7, 'ertettetet', 1),
(16, NULL, 1, 1, '42342', 1),
(17, NULL, 1, 2, '3242523', 1),
(18, 25, 1, 1, 'tetete', 1),
(19, 26, 1, 5, 'rwerwt', 1),
(23, NULL, 1, 5, 'ertet', 1),
(24, 27, 1, 8, 'tertetertet', 1),
(25, 28, 1, 9, 'ertetretet', 1),
(26, 29, 1, 10, 'tertertertr', 1),
(27, NULL, 1, 9, 'terteteteteter', 1),
(29, NULL, 4, 10, '353455', 1),
(31, NULL, 4, 11, '5345353', 1),
(38, 25, 1, 2, 'qttqtrq', 1),
(39, 25, 1, 3, 'ไำพไำพ', 1),
(40, 26, 1, 6, 'r23r2', 1),
(48, 25, 4, 1, 'ภ/-ภ/ำพำไพไพไ', 1),
(49, 25, 4, 2, '/ภ/-ภ/-ภ', 1),
(50, 26, 4, 4, '/-ภ/ภ/-ภ', 1),
(51, 27, 4, 6, 'ภ/-ภ/-ภ', 1),
(52, 25, 4, 3, 'ภ/-ภ/ภ/', 1),
(53, 28, 4, 9, 'ภ/ภ/ภ/-ภ', 1),
(54, 30, 4, 12, 'ภ/-ภ/ภ/-ภ', 1),
(55, 29, 4, 11, 'ภ/-ภ/ภ/ภ/', 1),
(56, 31, 4, 13, 'ภ/-ภ/-ภ/-ภ/ภ', 1),
(61, 10, 4, 1, 'ไำพไำไะไำะไำะ', 1),
(62, 10, 4, 2, 'ะำะำะำะำ', 1),
(63, 11, 4, 3, '-ถ-ถ-ถ-ถ-', 1),
(64, 11, 4, 4, '-ภถ-', 1),
(65, 13, 4, 5, 'ถ-ภถ-ถ-', 1),
(66, 14, 4, 6, 'ถ-ภถ-ถ-ถ', 1),
(67, 15, 4, 7, '-ถภ-ภถ-ถ-ถ', 1),
(68, 16, 4, 8, '-ถภ-ภถ-ถ-', 1),
(69, 32, 4, 15, '-ถภ-ถ-ถ', 1),
(70, 26, 4, 5, 'ำะำะำะ', 1),
(71, 27, 4, 7, 'ำะำะำพะำะ', 1),
(72, 28, 4, 10, 'ะำะำพะำะ', 1),
(73, 27, 4, 8, 'เดืืืื้เทเืเืเ้', 1),
(74, 31, 4, 14, 'ิดหิเดเหืดืดื', 1),
(75, 32, 4, 16, '5345', 1),
(125, 32, 4, 17, 'gggggggggggggg', 1),
(126, 26, 1, 7, 'พไำพพ', 1),
(177, 25, 1, 4, 'rwerw', 1),
(181, 9, 1, 1, '11235465', 1);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_clo`
--

CREATE TABLE `curriculum_clo` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `subject_code` varchar(32) NOT NULL,
  `clo_code` varchar(32) DEFAULT NULL,
  `description` text,
  `ylo_code` varchar(10) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_clo`
--

INSERT INTO `curriculum_clo` (`id`, `framework_id`, `subject_code`, `clo_code`, `description`, `ylo_code`, `weight`, `status`, `sort_order`) VALUES
(3, 1, '103-112', 'CLO1', 'ใช้ภาษาอังกฤษเพื่อการสื่อสารเชิงวิชาชีพได้', NULL, 100.00, 'active', 1),
(4, 1, '103-114', 'CLO1', 'นำเสนอผลงานเป็นภาษาอังกฤษได้อย่างมืออาชีพ', NULL, 100.00, 'active', 1),
(6, 1, '111-111', 'CLO1', 'jkjk;jkj', 'YLO1', NULL, 'active', 1),
(12, 1, '103-111', 'CLO1', 'djfkdjsklaf;d', 'YLO1', NULL, 'active', 1);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_clo_plo`
--

CREATE TABLE `curriculum_clo_plo` (
  `clo_id` int NOT NULL,
  `plo_id` int NOT NULL,
  `weight` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_clo_plo`
--

INSERT INTO `curriculum_clo_plo` (`clo_id`, `plo_id`, `weight`) VALUES
(3, 10, 0),
(4, 12, 0),
(6, 9, 0),
(6, 10, 0),
(12, 9, 0);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_clo_sub_plo`
--

CREATE TABLE `curriculum_clo_sub_plo` (
  `clo_id` int NOT NULL,
  `sub_plo_id` int NOT NULL,
  `max_score` decimal(6,2) DEFAULT NULL,
  `pass_score` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_clo_sub_plo`
--

INSERT INTO `curriculum_clo_sub_plo` (`clo_id`, `sub_plo_id`, `max_score`, `pass_score`) VALUES
(12, 39, 40.00, 20.00),
(12, 49, 40.00, 20.00);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_cycle`
--

CREATE TABLE `curriculum_cycle` (
  `id` int NOT NULL,
  `start_year` int NOT NULL,
  `end_year` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_cycle`
--

INSERT INTO `curriculum_cycle` (`id`, `start_year`, `end_year`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 2566, 2571, 0, '2026-09-14 13:45:15', '2026-09-22 15:23:37'),
(55, 2575, 2580, 1, '2026-09-15 14:17:03', '2026-09-22 15:23:37');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_cycle_subject`
--

CREATE TABLE `curriculum_cycle_subject` (
  `id` int NOT NULL,
  `cycle_id` int NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `subject_name_en` varchar(255) DEFAULT NULL,
  `credit` int NOT NULL DEFAULT '0',
  `credit_desc` varchar(50) DEFAULT NULL,
  `subject_type` varchar(100) DEFAULT NULL,
  `ylo` tinyint DEFAULT NULL,
  `pass_score` decimal(5,2) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `academic_year` int DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_cycle_subject`
--

INSERT INTO `curriculum_cycle_subject` (`id`, `cycle_id`, `subject_code`, `subject_name`, `subject_name_en`, `credit`, `credit_desc`, `subject_type`, `ylo`, `pass_score`, `semester`, `academic_year`, `sort_order`, `created_at`, `updated_at`) VALUES
(55, 3, '103-111', 'ภาษาอังกฤษพื้นฐาน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(56, 3, '103-112', 'การสื่อสารภาษาอังกฤษในชีวิตประจำวัน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(57, 3, '103-113', 'ภาษาจีน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(58, 3, '103-114', 'ภาษาญี่ปุ่น', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(59, 3, '103-115', 'อายุกรรม', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 5, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(60, 3, '103-116', 'วิสัญญีแพทย์', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 6, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(61, 3, '103-117', 'คลอดลูก', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 7, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(62, 3, '103-118', 'ฉีดยา', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 8, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(63, 3, '103-119', 'เตรียมฝึกงาน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 9, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(64, 3, '103-120', 'ฝึกงานหลอก', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 10, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(65, 3, '103-121', 'ฝึกงานจริง', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 11, '2026-09-14 14:15:30', '2026-09-14 14:15:30'),
(73, 55, '103-111', 'ภาษาอังกฤษพื้นฐาน', NULL, 3, NULL, NULL, 1, NULL, NULL, NULL, 1, '2026-09-15 14:17:20', '2026-10-11 15:12:26'),
(74, 55, '103-112', 'การสื่อสารภาษาอังกฤษในชีวิตประจำวัน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-09-15 14:17:20', '2026-09-15 14:17:20'),
(75, 55, '103-113', 'ภาษาจีน', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-09-15 14:17:20', '2026-09-15 14:17:20'),
(85, 55, '123-123', 'Test', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-09-15 14:35:14', '2026-09-15 15:01:15'),
(87, 55, '111-111', 'อุอุ', NULL, 3, NULL, NULL, NULL, NULL, 1, 2569, 5, '2026-09-20 19:55:39', '2026-09-28 06:49:52');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_documents`
--

CREATE TABLE `curriculum_documents` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `subject_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_uid` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` date NOT NULL,
  `file_size_label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `source` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'relational',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curriculum_documents`
--

INSERT INTO `curriculum_documents` (`id`, `framework_id`, `subject_code`, `document_uid`, `name`, `document_type`, `uploaded_at`, `file_size_label`, `status`, `source`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, '103-111', 'doc_seed_1', 'TQF 3 - 103-111 ภาษาอังกฤษพื้นฐาน', 'TQF 3', '2026-06-01', '1.2 MB', 'approved', 'mapping_json_backfill', NULL, '2026-08-14 15:49:52', '2026-08-14 15:49:52');

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
(1, 2567, 'หลักสูตรพยาบาลศาสตรบัณฑิต', '{\"clos\":[{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"103-111\",\"subject_name\":\"ภาษาอังกฤษพื้นฐาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"103-112\",\"subject_name\":\"การสื่อสารภาษาอังกฤษในชีวิตประจำวัน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"103-201\",\"subject_name\":\"ทักษะดิจิทัลสำหรับศตวรรษที่ 21\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"}],\"subject_code\":\"103-202\",\"subject_name\":\"การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่องจักรเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"103-301\",\"subject_name\":\"หลักปรัชญาของเศรษฐกิจพอเพียงเพื่อการพัฒนาที่ยั่งยืน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"103-302\",\"subject_name\":\"การออกแบบการคิดเพื่อสร้างนวัตกรรมฯ\"},{\"plo_mappings\":[],\"subject_code\":\"103-302\",\"subject_name\":\"การออกแบบการคิดเพื่อสร้างนวัตกรรมและธุรกิจใหม่\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"170-108\",\"subject_name\":\"ชีวเคมี\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"}],\"subject_code\":\"170-112\",\"subject_name\":\"กายวิภาคศาสตร์และสรีรวิทยาฯ 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"}],\"subject_code\":\"170-113\",\"subject_name\":\"กายวิภาคศาสตร์และสรีรวิทยาฯ 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3}],\"subject_code\":\"170-201\",\"subject_name\":\"พยาธิสรีรวิทยาของมนุษย์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3}],\"subject_code\":\"170-208\",\"subject_name\":\"จุลชีววิทยาและปรสิตวิทยาของมนุษย์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-216\",\"subject_name\":\"เภสัชวิทยาทางการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"170-224\",\"subject_name\":\"ชีวสถิติทางสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-228\",\"subject_name\":\"พัฒนาการมนุษย์และการสร้างเสริมสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-229\",\"subject_name\":\"โภชนบำบัด\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-211\",\"subject_name\":\"การพยาบาลพื้นฐาน 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-212\",\"subject_name\":\"การพยาบาลพื้นฐาน 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-222\",\"subject_name\":\"จรรยาบรรณวิชาชีพการพยาบาลและกฎหมายที่เกี่ยวข้อง\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-226\",\"subject_name\":\"การพยาบาลผู้ใหญ่\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-227\",\"subject_name\":\"มโนมติ ทฤษฎีฯ และบริการด้วยหัวใจ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-230\",\"subject_name\":\"กระบวนการพยาบาลและการประเมินภาวะสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-231\",\"subject_name\":\"การประยุกต์ใช้ AI และเทคโนโลยีดิจิทัล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-324\",\"subject_name\":\"การพยาบาลผู้สูงอายุ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-348\",\"subject_name\":\"การพยาบาลเด็กและวัยรุ่น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-349\",\"subject_name\":\"การพยาบาลวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-350\",\"subject_name\":\"การพยาบาลสุขภาพจิตและจิตเวชศาสตร์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-351\",\"subject_name\":\"การพยาบาลมารดาและทารก\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-352\",\"subject_name\":\"การผดุงครรภ์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-353\",\"subject_name\":\"การพยาบาลอนามัยชุมชน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":6.2}],\"subject_code\":\"170-354\",\"subject_name\":\"กระบวนการวิจัยทางวิชาชีพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"}],\"subject_code\":\"170-448\",\"subject_name\":\"การรักษาพยาบาลเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-457\",\"subject_name\":\"ภาวะผู้นำและการบริหารทางการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-232\",\"subject_name\":\"ปฏิบัติการพยาบาลพื้นฐาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-327\",\"subject_name\":\"ปฏิบัติการสุขภาพจิตและจิตเวชศาสตร์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-331\",\"subject_name\":\"ปฏิบัติการพยาบาลเด็กและวัยรุ่น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-337\",\"subject_name\":\"ปฏิบัติการพยาบาลมารดาและทารก\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-338\",\"subject_name\":\"ปฏิบัติการผดุงครรภ์ 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-339\",\"subject_name\":\"ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-340\",\"subject_name\":\"ปฏิบัติการพยาบาลผู้ป่วยวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-355\",\"subject_name\":\"ปฏิบัติการพยาบาลอนามัยชุมชน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-431\",\"subject_name\":\"ปฏิบัติการผดุงครรภ์ 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-449\",\"subject_name\":\"ปฏิบัติการรักษาพยาบาลเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-458\",\"subject_name\":\"ปฏิบัติการจัดการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-459\",\"subject_name\":\"ปฏิบัติการพยาบาลรวบยอดวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-116\",\"subject_name\":\"การดูแลสุขภาพแบบผสมผสาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"}],\"subject_code\":\"170-117\",\"subject_name\":\"การดูแลสุขภาพความงามแบบองค์รวม\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-233\",\"subject_name\":\"การดูแลสุขภาวะผู้สูงอายุกลุ่มเปราะบาง\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-234\",\"subject_name\":\"นันทนาการเพื่อส่งเสริมพัฒนาการเด็กฯ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"}],\"subject_code\":\"170-346\",\"subject_name\":\"นวัตกรรมทางสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"3.1\"}],\"subject_code\":\"170-347\",\"subject_name\":\"การปฐมพยาบาลและการช่วยฟื้นคืนชีพ\"}],\"plos\":[{\"plo_id\":\"PLO1\",\"plo_name\":\"PLO 1: ประยุกต์ความรู้และสาระสำคัญของศาสตร์ทางวิชาชีพการพยาบาลและการผดุงครรภ์ และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\",\"sub_plos\":[{\"id\":\"1.1\",\"desc\":\"มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย\"},{\"id\":\"1.2\",\"desc\":\"มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต\"},{\"id\":\"1.3\",\"desc\":\"ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต\"}],\"ylo_descriptions\":{\"year_1\":\"ใช้ความรู้ศาสตร์ที่เกี่ยวข้องพัฒนาการมนุษย์ทุกช่วงวัย\",\"year_2\":\"พื้นฐานทางวิชาชีพ ทางเลือกในการดูแลสุขภาพ, ใช้ศาสตร์พื้นฐานทางวิชาชีพในการดูแลสุขภาพ \",\"year_3\":\"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยทั่วไป\",\"year_4\":\"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยวิกฤตและบูรณาการศาสตร์ทางการพยาบาลทุกระดับ\"}},{\"plo_id\":\"PLO2\",\"plo_name\":\"PLO 2: ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยเพื่อความปลอดภัยของผู้รับบริการ\",\"sub_plos\":[{\"id\":\"2.1\",\"desc\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\"},{\"id\":\"2.2\",\"desc\":\"จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม\"},{\"id\":\"2.3\",\"desc\":\"ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้\"}],\"ylo_descriptions\":{\"year_1\":\"ไม่มี\",\"year_2\":\"ปฏิบัติการพยาบาลพื้นฐานในการดูแลผู้ป่วยทั่วไปโดยใช้กระบวนการพยาบาลภายใต้กฎหมายและจรรยาบรรณวิชาชีพ\",\"year_3\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยซับซ้อนโดยใช้กระบวนการพยาบาล\",\"year_4\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยวิกฤตโดยใช้กระบวนการพยาบาล\"}},{\"plo_id\":\"PLO3\",\"plo_name\":\"PLO 3: พพัฒนานวัตกรรมทางสุขภาพโดยประยุกต์กระบวนการวิจัยและเทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\",\"sub_plos\":[{\"id\":\"3.1\",\"desc\":\"นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้\"},{\"id\":\"3.2\",\"desc\":\"ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\"}],\"ylo_descriptions\":{\"year_1\":\"มีความรู้พื้นฐานทางเทคโนโลยีและสารสนเทศ\",\"year_2\":\"มีความรู้ในการสร้างนวัตกรรมเบื้องต้น\",\"year_3\":\"สามารถสืบค้นข้อมูล วิเคราะห์แหล่งข้อมูลที่น่าเชื่อถือ และออกแบบการสร้างนวัตกรรมทางสุขภาพในแต่ละสาขาวิชา\",\"year_4\":\"บูรณาการการวิจัยและนวัตกรรมและส่งผลงานเข้าร่วมนำเสนอ\"}},{\"plo_id\":\"PLO4\",\"plo_name\":\"PLO 4: ประยุกต์ใช้ดิจิทัลในการจัดการพยาบาลได้อย่างเหมาะสม\",\"sub_plos\":[{\"id\":\"4.1\",\"desc\":\"สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง\"}],\"ylo_descriptions\":{\"year_1\":\"ไม่มี\",\"year_2\":\"มีความรู้พื้นฐานดิจิทัล\",\"year_3\":\"มีความรู้ด้านดิจิทัลทางการพยาบาล\",\"year_4\":\"ประยุกต์ดิจิทัลทางการพยาบาลมาใช้ในการดูแลผู้ป่วย\"}},{\"plo_id\":\"PLO5\",\"plo_name\":\"PLO 5: สื่อสารด้วยภาษาไทยและภาษาอังกฤษได้อย่างมีประสิทธิภาพ\",\"sub_plos\":[{\"id\":\"5.1\",\"desc\":\"ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทีมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ\"},{\"id\":\"5.2\",\"desc\":\"ใช้ภาษาอังกฤษในการสื่อสารกับทีมสุขภาพและผู้รับบริการได้\"}],\"ylo_descriptions\":{\"year_1\":\"สามารถสื่อสารภาษาไทยภาษาอังกฤษได้\",\"year_2\":\"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล -เข้าใจศัพท์พื้นฐานทางการแพทย์\",\"year_3\":\"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ  และหน่วยงานที่เกี่ยวข้อง -สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\",\"year_4\":\"ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ และหน่วยงานที่เกี่ยวข้อง สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\"}},{\"plo_id\":\"PLO6\",\"plo_name\":\"PLO 6: แสดงออกถึงการมีจริยธรรมและทัศนคติที่ดีต่อวิชาชีพ มีจิตสาธารณะ และมีพฤติกรรมบริการที่เป็นที่ยอมรับ\",\"sub_plos\":[{\"id\":\"6.1\",\"desc\":\"แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ\"},{\"id\":\"6.2\",\"desc\":\"ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ\"},{\"id\":\"6.3\",\"desc\":\"สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\"}],\"ylo_descriptions\":{\"year_1\":\"-มีจิตสาธารณะบำเพ็ญประโยชน์เพื่อสังคม -สามารถปรับตัวเข้ากับสังคมและสิ่งแวดล้อมใหม่\",\"year_2\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสม -ปฏิบัติงานด้วยตรงต่อเวลา มีความรับผิดชอบ -สามารถปรับตัวเข้าสู่วิชาชีพได้\",\"year_3\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\",\"year_4\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ และมีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่ซับซ้อน -มีพฤติกรรมบริการเป็น-ที่ยอมรับของผู้รับ\"}},{\"plo_id\":\"PLO7\",\"plo_name\":\"PLO 7: แสดงออกถึงการเรียนรู้ด้วยตนเองอย่างต่อเนื่อง\",\"sub_plos\":[{\"id\":\"7.1\",\"desc\":\"แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง\"},{\"id\":\"7.2\",\"desc\":\"สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม\"}],\"ylo_descriptions\":{\"year_1\":\"สามารถศึกษาค้นคว้าข้อมูลจากแหล่งข้อมูลต่าง ๆ\",\"year_2\":\"สามารถศึกษาค้นคว้าข้อมูลทางการพยาบาลจากแหล่งข้อมูลต่าง ๆ และวิเคราะห์ข้อมูลเบื้องต้น\",\"year_3\":\"สามารถนำข้อมูลทางการพยาบาลมาวางแผนการพยาบาล\",\"year_4\":\"สามารถเลือกและประยุกต์องค์ความรู้ทางการพยาบาลมาใช้วางแผนการพยาบาลตามสถานการณ์ที่หลากหลาย\"}},{\"plo_id\":\"PLO8\",\"plo_name\":\"PLO 8: เข้าใจหลักการ การดำเนินการ การเป็นผู้ประกอบการที่เกี่ยวกับการพยาบาลและการผดุงครรภ์ได้\",\"sub_plos\":[{\"id\":\"8.1\",\"desc\":\"ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน\"},{\"id\":\"8.2\",\"desc\":\"ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้\"},{\"id\":\"8.3\",\"desc\":\"สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้\"}],\"ylo_descriptions\":{\"year_1\":\"-\",\"year_2\":\"-\",\"year_3\":\"ประเมินความต้องการบริการสุขภาพของบุคคลและครอบครัวได้\",\"year_4\":\"-ประเมินความต้องการบริการสุขภาพของบุคคล ครอบครัว และชุมชนได้ -ออกแบบบริการการพยาบาลและการผดุงครรภ์ในการเป็นผู้ประกอบการได้\"}}],\"course_clos\":{\"103-111\":[{\"id\":\"1\",\"plo\":\"PLO1\",\"code\":\"CLO1\",\"status\":\"active\",\"weight\":40,\"description\":\"อธิบายหลักไวยากรณ์และคำศัพท์พื้นฐานได้\"},{\"id\":\"2\",\"plo\":\"PLO2\",\"code\":\"CLO2\",\"status\":\"active\",\"weight\":60,\"description\":\"สื่อสารภาษาอังกฤษในชีวิตประจำวันได้\"}]},\"program_name\":\"หลักสูตรพยาบาลศาสตรบัณฑิต (ฉบับปรับปรุง)\",\"curriculum_year\":2567,\"subject_mappings\":{\"103-111\":{\"clos\":[{\"id\":\"CLO1\",\"code\":\"CLO1\",\"weight\":40,\"description\":\"อธิบายหลักไวยากรณ์และคำศัพท์พื้นฐานได้\",\"mapped_plos\":[\"PLO1\",\"PLO2\"]},{\"id\":\"CLO2\",\"code\":\"CLO2\",\"weight\":60,\"description\":\"สื่อสารภาษาอังกฤษในชีวิตประจำวันได้\",\"mapped_plos\":[\"PLO3\"]}],\"documents\":[{\"id\":\"doc_seed_1\",\"name\":\"TQF 3 - 103-111 ภาษาอังกฤษพื้นฐาน\",\"size\":\"1.2 MB\",\"type\":\"TQF 3\",\"status\":\"approved\",\"uploadedAt\":\"2026-06-01\"}],\"course_plos\":[\"PLO1\",\"PLO2\",\"PLO3\"],\"instructor_id\":\"44172033\"},\"103-112\":{\"clos\":[{\"id\":\"CLO1\",\"code\":\"CLO1\",\"weight\":100,\"description\":\"ใช้ภาษาอังกฤษเพื่อการสื่อสารเชิงวิชาชีพได้\",\"mapped_plos\":[\"PLO2\"]}],\"course_plos\":[\"PLO2\"],\"instructor_id\":\"44172033\"},\"103-113\":{\"clos\":[],\"course_plos\":[]},\"103-114\":{\"clos\":[{\"id\":\"CLO1\",\"code\":\"CLO1\",\"weight\":100,\"description\":\"นำเสนอผลงานเป็นภาษาอังกฤษได้อย่างมืออาชีพ\",\"mapped_plos\":[\"PLO4\"]}],\"course_plos\":[\"PLO4\"],\"instructor_id\":\"44172033\"},\"103-121\":{\"clos\":[],\"course_plos\":[]},\"103-122\":{\"clos\":[],\"course_plos\":[]},\"103-123\":{\"clos\":[],\"course_plos\":[]},\"103-131\":{\"clos\":[],\"course_plos\":[]},\"103-141\":{\"clos\":[],\"course_plos\":[]},\"103-151\":{\"clos\":[],\"course_plos\":[]},\"103-201\":{\"clos\":[],\"course_plos\":[]},\"103-202\":{\"clos\":[],\"course_plos\":[]},\"103-203\":{\"clos\":[],\"course_plos\":[]},\"103-204\":{\"clos\":[],\"course_plos\":[]},\"103-205\":{\"clos\":[],\"course_plos\":[]},\"103-206\":{\"clos\":[],\"course_plos\":[]},\"103-207\":{\"clos\":[],\"course_plos\":[]},\"103-208\":{\"clos\":[],\"course_plos\":[]},\"103-209\":{\"clos\":[],\"course_plos\":[]},\"103-210\":{\"clos\":[],\"course_plos\":[]},\"103-211\":{\"clos\":[],\"course_plos\":[]},\"103-212\":{\"clos\":[],\"course_plos\":[]},\"103-301\":{\"clos\":[],\"course_plos\":[]},\"103-302\":{\"clos\":[],\"course_plos\":[]},\"170-108\":{\"clos\":[],\"course_plos\":[]},\"170-112\":{\"clos\":[],\"course_plos\":[]},\"170-113\":{\"clos\":[],\"course_plos\":[]},\"170-114\":{\"clos\":[],\"course_plos\":[]},\"170-115\":{\"clos\":[],\"course_plos\":[]},\"170-116\":{\"clos\":[],\"course_plos\":[]},\"170-117\":{\"clos\":[],\"course_plos\":[]},\"170-201\":{\"clos\":[],\"course_plos\":[]},\"170-208\":{\"clos\":[],\"course_plos\":[]},\"170-211\":{\"clos\":[],\"course_plos\":[]},\"170-212\":{\"clos\":[],\"course_plos\":[]},\"170-216\":{\"clos\":[],\"course_plos\":[]},\"170-222\":{\"clos\":[],\"course_plos\":[]},\"170-224\":{\"clos\":[],\"course_plos\":[]},\"170-226\":{\"clos\":[],\"course_plos\":[]},\"170-227\":{\"clos\":[],\"course_plos\":[]},\"170-228\":{\"clos\":[],\"course_plos\":[]},\"170-229\":{\"clos\":[],\"course_plos\":[]},\"170-230\":{\"clos\":[],\"course_plos\":[]},\"170-231\":{\"clos\":[],\"course_plos\":[]},\"170-232\":{\"clos\":[],\"course_plos\":[]},\"170-235\":{\"clos\":[],\"course_plos\":[]},\"170-236\":{\"clos\":[],\"course_plos\":[]},\"170-324\":{\"clos\":[],\"course_plos\":[]},\"170-327\":{\"clos\":[],\"course_plos\":[]},\"170-331\":{\"clos\":[],\"course_plos\":[]},\"170-337\":{\"clos\":[],\"course_plos\":[]},\"170-338\":{\"clos\":[],\"course_plos\":[]},\"170-339\":{\"clos\":[],\"course_plos\":[]},\"170-340\":{\"clos\":[],\"course_plos\":[]},\"170-348\":{\"clos\":[],\"course_plos\":[]},\"170-349\":{\"clos\":[],\"course_plos\":[]},\"170-350\":{\"clos\":[],\"course_plos\":[]},\"170-351\":{\"clos\":[],\"course_plos\":[]},\"170-352\":{\"clos\":[],\"course_plos\":[]},\"170-353\":{\"clos\":[],\"course_plos\":[]},\"170-354\":{\"clos\":[],\"course_plos\":[]},\"170-355\":{\"clos\":[],\"course_plos\":[]},\"170-356\":{\"clos\":[],\"course_plos\":[]},\"170-357\":{\"clos\":[],\"course_plos\":[]},\"170-431\":{\"clos\":[],\"course_plos\":[]},\"170-448\":{\"clos\":[],\"course_plos\":[]},\"170-449\":{\"clos\":[],\"course_plos\":[]},\"170-457\":{\"clos\":[],\"course_plos\":[]},\"170-458\":{\"clos\":[],\"course_plos\":[]},\"170-459\":{\"clos\":[],\"course_plos\":[]},\"170-460\":{\"clos\":[],\"course_plos\":[]},\"170-461\":{\"clos\":[],\"course_plos\":[]},\"170-462\":{\"clos\":[],\"course_plos\":[]}},\"ylo_plo_matrix\":{\"YLO1\":{\"PLO1\":{\"active\":true,\"description\":\"aaaa\"},\"PLO2\":{\"active\":true,\"description\":\"bbbb\"},\"PLO3\":{\"active\":false,\"description\":\"\"},\"PLO4\":{\"active\":false,\"description\":\"\"},\"PLO5\":{\"active\":false,\"description\":\"\"},\"PLO6\":{\"active\":false,\"description\":\"\"},\"PLO7\":{\"active\":false,\"description\":\"\"},\"PLO8\":{\"active\":false,\"description\":\"\"}},\"YLO2\":{\"PLO1\":{\"active\":false,\"description\":\"\"},\"PLO2\":{\"active\":false,\"description\":\"\"},\"PLO3\":{\"active\":true,\"description\":\"cccc\"},\"PLO4\":{\"active\":true,\"description\":\"dddd\"},\"PLO5\":{\"active\":false,\"description\":\"\"},\"PLO6\":{\"active\":false,\"description\":\"\"},\"PLO7\":{\"active\":false,\"description\":\"\"},\"PLO8\":{\"active\":false,\"description\":\"\"}},\"YLO3\":{\"PLO1\":{\"active\":false,\"description\":\"\"},\"PLO2\":{\"active\":false,\"description\":\"\"},\"PLO3\":{\"active\":false,\"description\":\"\"},\"PLO4\":{\"active\":false,\"description\":\"\"},\"PLO5\":{\"active\":false,\"description\":\"\"},\"PLO6\":{\"active\":false,\"description\":\"\"},\"PLO7\":{\"active\":false,\"description\":\"\"},\"PLO8\":{\"active\":false,\"description\":\"\"}},\"YLO4\":{\"PLO1\":{\"active\":false,\"description\":\"\"},\"PLO2\":{\"active\":false,\"description\":\"\"},\"PLO3\":{\"active\":false,\"description\":\"\"},\"PLO4\":{\"active\":false,\"description\":\"\"},\"PLO5\":{\"active\":false,\"description\":\"\"},\"PLO6\":{\"active\":false,\"description\":\"\"},\"PLO7\":{\"active\":false,\"description\":\"\"},\"PLO8\":{\"active\":false,\"description\":\"\"}}}}', 1, '2026-02-09 06:44:39');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_plo`
--

CREATE TABLE `curriculum_plo` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `plo_code` varchar(20) NOT NULL,
  `name` text,
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_plo`
--

INSERT INTO `curriculum_plo` (`id`, `framework_id`, `plo_code`, `name`, `sort_order`) VALUES
(9, 1, 'PLO1', 'PLO 1: ประยุกต์ความรู้และสาระสำคัญของศาสตร์ทางวิชาชีพการพยาบาลและการผดุงครรภ์ และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย', 1),
(10, 1, 'PLO2', 'PLO 2: ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยเพื่อความปลอดภัยของผู้รับบริการ', 2),
(11, 1, 'PLO3', 'PLO 3: พพัฒนานวัตกรรมทางสุขภาพโดยประยุกต์กระบวนการวิจัยและเทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม', 3),
(12, 1, 'PLO4', 'PLO 4: ประยุกต์ใช้ดิจิทัลในการจัดการพยาบาลได้อย่างเหมาะสม', 4),
(13, 1, 'PLO5', 'PLO 5: สื่อสารด้วยภาษาไทยและภาษาอังกฤษได้อย่างมีประสิทธิภาพ', 5),
(14, 1, 'PLO6', 'PLO 6: แสดงออกถึงการมีจริยธรรมและทัศนคติที่ดีต่อวิชาชีพ มีจิตสาธารณะ และมีพฤติกรรมบริการที่เป็นที่ยอมรับ', 6),
(15, 1, 'PLO7', 'PLO 7: แสดงออกถึงการเรียนรู้ด้วยตนเองอย่างต่อเนื่อง', 7),
(16, 1, 'PLO8', 'PLO 8: เข้าใจหลักการ การดำเนินการ การเป็นผู้ประกอบการที่เกี่ยวกับการพยาบาลและการผดุงครรภ์ได้', 8);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_report_stats`
--

CREATE TABLE `curriculum_report_stats` (
  `stat_id` bigint NOT NULL,
  `type` enum('PLO','YLO') NOT NULL COMMENT 'ประเภท (PLO หรือ YLO)',
  `code_name` varchar(50) NOT NULL COMMENT 'รหัส เช่น PLO1, YLO1',
  `description` text COMMENT 'คำอธิบาย',
  `target_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'เป้าหมาย (%)',
  `achieved_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'ผลลัพธ์ที่ทำได้ (%)',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_report_stats`
--

INSERT INTO `curriculum_report_stats` (`stat_id`, `type`, `code_name`, `description`, `target_score`, `achieved_score`, `updated_at`) VALUES
(1, 'PLO', 'PLO1', 'ความรู้ทางวิชาชีพ', 80.00, 85.00, '2026-06-23 20:50:32'),
(2, 'PLO', 'PLO2', 'ทักษะการปฏิบัติ', 75.00, 72.00, '2026-06-23 20:50:32'),
(3, 'PLO', 'PLO3', 'คุณธรรมจริยธรรม', 80.00, 88.00, '2026-06-23 20:50:32'),
(4, 'PLO', 'PLO4', 'การสื่อสาร', 70.00, 75.00, '2026-06-23 20:50:32'),
(5, 'PLO', 'PLO5', 'การใช้เทคโนโลยี', 75.00, 70.00, '2026-06-23 20:50:32'),
(6, 'YLO', 'YLO1', 'เข้าใจแนวคิดพื้นฐาน', 75.00, 78.00, '2026-06-23 20:50:32'),
(7, 'YLO', 'YLO2', 'ประยุกต์ใช้ในการฝึกงาน', 80.00, 75.00, '2026-06-23 20:50:32'),
(8, 'YLO', 'YLO3', 'บูรณาการความรู้', 85.00, 82.00, '2026-06-23 20:50:32'),
(9, 'YLO', 'YLO4', 'ปฏิบัติงานจริงได้', 90.00, 88.00, '2026-06-23 20:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_subject_meta`
--

CREATE TABLE `curriculum_subject_meta` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `subject_code` varchar(32) NOT NULL,
  `instructor_id` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_subject_meta`
--

INSERT INTO `curriculum_subject_meta` (`id`, `framework_id`, `subject_code`, `instructor_id`) VALUES
(74, 1, '103-111', '44172033'),
(75, 1, '103-112', '44172033'),
(76, 1, '103-113', '380018'),
(77, 1, '103-114', '44172033'),
(78, 1, '103-121', NULL),
(79, 1, '103-122', NULL),
(80, 1, '103-123', NULL),
(81, 1, '103-131', NULL),
(82, 1, '103-141', NULL),
(83, 1, '103-151', NULL),
(84, 1, '103-201', NULL),
(85, 1, '103-202', NULL),
(86, 1, '103-203', NULL),
(87, 1, '103-204', NULL),
(88, 1, '103-205', NULL),
(89, 1, '103-206', NULL),
(90, 1, '103-207', NULL),
(91, 1, '103-208', NULL),
(92, 1, '103-209', NULL),
(93, 1, '103-210', NULL),
(94, 1, '103-211', NULL),
(95, 1, '103-212', NULL),
(96, 1, '103-301', NULL),
(97, 1, '103-302', NULL),
(98, 1, '170-108', NULL),
(99, 1, '170-112', NULL),
(100, 1, '170-113', NULL),
(101, 1, '170-114', NULL),
(102, 1, '170-115', NULL),
(103, 1, '170-116', NULL),
(104, 1, '170-117', NULL),
(105, 1, '170-201', NULL),
(106, 1, '170-208', NULL),
(107, 1, '170-211', NULL),
(108, 1, '170-212', NULL),
(109, 1, '170-216', NULL),
(110, 1, '170-222', NULL),
(111, 1, '170-224', NULL),
(112, 1, '170-226', NULL),
(113, 1, '170-227', NULL),
(114, 1, '170-228', NULL),
(115, 1, '170-229', NULL),
(116, 1, '170-230', NULL),
(117, 1, '170-231', NULL),
(118, 1, '170-232', NULL),
(119, 1, '170-235', NULL),
(120, 1, '170-236', NULL),
(121, 1, '170-324', NULL),
(122, 1, '170-327', NULL),
(123, 1, '170-331', NULL),
(124, 1, '170-337', NULL),
(125, 1, '170-338', NULL),
(126, 1, '170-339', NULL),
(127, 1, '170-340', NULL),
(128, 1, '170-348', NULL),
(129, 1, '170-349', NULL),
(130, 1, '170-350', NULL),
(131, 1, '170-351', NULL),
(132, 1, '170-352', NULL),
(133, 1, '170-353', NULL),
(134, 1, '170-354', NULL),
(135, 1, '170-355', NULL),
(136, 1, '170-356', NULL),
(137, 1, '170-357', NULL),
(138, 1, '170-431', NULL),
(139, 1, '170-448', NULL),
(140, 1, '170-449', NULL),
(141, 1, '170-457', NULL),
(142, 1, '170-458', NULL),
(143, 1, '170-459', NULL),
(144, 1, '170-460', NULL),
(145, 1, '170-461', NULL),
(146, 1, '170-462', NULL),
(147, 1, '111-111', '44172033');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_subject_plo`
--

CREATE TABLE `curriculum_subject_plo` (
  `subject_meta_id` int NOT NULL,
  `plo_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_subject_plo`
--

INSERT INTO `curriculum_subject_plo` (`subject_meta_id`, `plo_id`) VALUES
(74, 9),
(74, 10),
(75, 10),
(74, 11),
(77, 12);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_sub_plo`
--

CREATE TABLE `curriculum_sub_plo` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `plo_id` int NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `year_level` tinyint DEFAULT NULL,
  `is_scorable` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_sub_plo`
--

INSERT INTO `curriculum_sub_plo` (`id`, `framework_id`, `plo_id`, `code`, `description`, `year_level`, `is_scorable`, `sort_order`) VALUES
(39, 1, 9, '1.1', '11235465', 1, 1, 1),
(40, 1, 10, '2.1', 'ไำพไำไะไำะไำะ', 4, 1, 1),
(41, 1, 10, '2.2', 'ะำะำะำะำ', 4, 1, 2),
(42, 1, 11, '3.1', '-ถ-ถ-ถ-ถ-', 4, 1, 1),
(43, 1, 11, '3.2', '-ภถ-', 4, 1, 2),
(44, 1, 13, '5.1', 'ถ-ภถ-ถ-', 4, 1, 1),
(45, 1, 14, '6.1', 'ถ-ภถ-ถ-ถ', 4, 1, 1),
(46, 1, 15, '7.1', '-ถภ-ภถ-ถ-ถ', 4, 1, 1),
(47, 1, 16, '8.1', '-ถภ-ภถ-ถ-', 4, 1, 1),
(48, 1, 9, '1.1', '1111111111111', 4, 1, 1),
(49, 1, 9, '1.2', 'dfjkslajfkd;saf', 1, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_ylo_plo`
--

CREATE TABLE `curriculum_ylo_plo` (
  `id` int NOT NULL,
  `framework_id` int NOT NULL,
  `ylo_code` varchar(10) NOT NULL,
  `plo_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `curriculum_ylo_plo`
--

INSERT INTO `curriculum_ylo_plo` (`id`, `framework_id`, `ylo_code`, `plo_id`, `is_active`, `description`) VALUES
(65, 1, 'YLO1', 9, 1, 'aaaa'),
(66, 1, 'YLO1', 10, 1, 'bbbb'),
(67, 1, 'YLO1', 11, 1, '00000'),
(68, 1, 'YLO1', 12, 0, ''),
(69, 1, 'YLO1', 13, 0, ''),
(70, 1, 'YLO1', 14, 0, ''),
(71, 1, 'YLO1', 15, 0, ''),
(72, 1, 'YLO1', 16, 0, ''),
(73, 1, 'YLO2', 9, 0, ''),
(74, 1, 'YLO2', 10, 0, ''),
(75, 1, 'YLO2', 11, 1, 'cccc'),
(76, 1, 'YLO2', 12, 1, 'dddd'),
(77, 1, 'YLO2', 13, 0, ''),
(78, 1, 'YLO2', 14, 0, ''),
(79, 1, 'YLO2', 15, 0, ''),
(80, 1, 'YLO2', 16, 0, ''),
(81, 1, 'YLO3', 9, 0, ''),
(82, 1, 'YLO3', 10, 0, ''),
(83, 1, 'YLO3', 11, 0, ''),
(84, 1, 'YLO3', 12, 0, ''),
(85, 1, 'YLO3', 13, 0, ''),
(86, 1, 'YLO3', 14, 0, ''),
(87, 1, 'YLO3', 15, 0, ''),
(88, 1, 'YLO3', 16, 0, ''),
(89, 1, 'YLO4', 9, 0, ''),
(90, 1, 'YLO4', 10, 0, ''),
(91, 1, 'YLO4', 11, 0, ''),
(92, 1, 'YLO4', 12, 0, ''),
(93, 1, 'YLO4', 13, 0, ''),
(94, 1, 'YLO4', 14, 0, ''),
(95, 1, 'YLO4', 15, 0, ''),
(96, 1, 'YLO4', 16, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `degree`
--

CREATE TABLE `degree` (
  `degree_id` bigint NOT NULL,
  `faculty_id` bigint DEFAULT NULL COMMENT 'รหัสอาจารย์ (เชื่อมตาราง faculty)',
  `degree_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ระดับการศึกษา เช่น Bachelor, Master, Doctoral',
  `field_group` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'nursing | other — จากกลุ่มคอลัมน์ใน CSV; ตรี = NULL',
  `degree_name_th` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อปริญญา (ไทย)',
  `degree_name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อปริญญา (อังกฤษ)',
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ที่อยู่ไฟล์แนบหลักฐานการศึกษา',
  `degree_abbr_th` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อย่อปริญญา (ไทย)',
  `degree_abbr_en` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อย่อปริญญา (อังกฤษ)',
  `major` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'สาขาวิชา',
  `institution_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อสถาบันที่จบ',
  `graduation_year` int DEFAULT NULL COMMENT 'ปีที่จบการศึกษา (พ.ศ. หรือ ค.ศ.)',
  `start_year` int DEFAULT NULL COMMENT 'ปีที่เริ่มศึกษา',
  `expected_grad_year` int DEFAULT NULL COMMENT 'ปีที่คาดว่าจะจบ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `degree`
--

INSERT INTO `degree` (`degree_id`, `faculty_id`, `degree_level`, `field_group`, `degree_name_th`, `degree_name_en`, `file_path`, `degree_abbr_th`, `degree_abbr_en`, `major`, `institution_name`, `graduation_year`, `start_year`, `expected_grad_year`) VALUES
(1, 41172017, 'Bachelor', NULL, 'อนุปริญญาพยาบาล', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2516, NULL, NULL),
(2, 41172017, 'Bachelor', NULL, 'ครุศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2523, NULL, NULL),
(3, 41172017, 'Master', 'other', 'การศึกษามหาบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาแนะแนว', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2537, NULL, NULL),
(4, 41172017, 'Doctoral', 'other', 'การศึกษาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การอุดมศึกษา', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2545, NULL, NULL),
(5, 41172008, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยอัสสัมชัญ', 2536, NULL, NULL),
(6, 41172008, 'Master', 'other', 'พัฒนบริหารศาสตรมหาบัณฑิตทางการพัฒนาทรัพยากรมนุษย์', NULL, NULL, NULL, NULL, NULL, 'สถาบันบัณฑิตพัฒนบริหารศาสตร์', 2538, NULL, NULL),
(7, 41172008, 'Doctoral', 'other', 'Doctor of Philosophy', NULL, NULL, NULL, NULL, 'Higher Educational administration', 'University  of Newcastle Australia', 2005, NULL, NULL),
(8, 41172011, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2537, NULL, NULL),
(9, 41172011, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สาธารณสุขศาสตร์', 'มหาวิทยาลัยมหิดล', 2541, NULL, NULL),
(10, 41172011, 'Doctoral', 'other', 'ครุศาสตรดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'อุดมศึกษา', 'จุฬาลงกรณ์มหาวิทยาลัย', 2555, NULL, NULL),
(11, 42172021, 'Bachelor', NULL, 'อนุปริญญาพยาบาลและอนามัย', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลสภากาชาดไทย', 2521, NULL, NULL),
(12, 42172021, 'Bachelor', NULL, 'ประกาศนียบัตรวิชาผดุงครรภ์', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลสภากาชาดไทย', 2525, NULL, NULL),
(13, 42172021, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2525, NULL, NULL),
(14, 42172021, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลศาสตร์', 'มหาวิทยาลัยมหิดล', 2535, NULL, NULL),
(15, 42172021, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'บริหารการศึกษา', 'มหาวิทยาลัยสยาม', 2552, NULL, NULL),
(16, 42172025, 'Bachelor', NULL, 'ประกาศนียบัตรพยาบาลศาสตร์และผดุงครรภ์ชั้นสูง', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลนครราชสีมา', 2531, NULL, NULL),
(17, 42172025, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2538, NULL, NULL),
(18, 42172025, 'Doctoral', 'nursing', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาล', 'มหาวิทยาลัยขอนแก่น', 2560, NULL, NULL),
(19, 44172033, 'Bachelor', NULL, 'ประกาศนียบัตรพยาบาลอนามัยและผดุงครรภ์', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลพุทธชินราช พิษณุโลก', 2517, NULL, NULL),
(20, 44172033, 'Bachelor', NULL, 'ศิลปศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลศาสตร์', 'มหาวิทยาลัยขอนแก่น', 2521, NULL, NULL),
(21, 44172033, 'Master', 'other', 'ครุศาสตรมหาบัณฑิต', NULL, '[\"uploads\\/user-documents\\/44172033\\/teaching_degree_file_20260717_133639_7b4055bf.pdf\"]', NULL, NULL, 'นิเทศการศึกษาและพัฒนาหลักสูตร', 'จุฬาลงกรณ์มหาวิทยาลัย', 2530, NULL, NULL),
(22, 45172037, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2539, NULL, NULL),
(23, 45172037, 'Master', 'other', 'ศิลปศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาพัฒนาการ', 'จุฬาลงกรณ์มหาวิทยาลัย', 2545, NULL, NULL),
(24, 45172037, 'Doctoral', 'other', 'วิทยาศาสตรดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การส่งเสริมสุขภาพ', 'จุฬาลงกรณ์มหาวิทยาลัย', 2556, NULL, NULL),
(25, 45172038, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2541, NULL, NULL),
(26, 45172038, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'เภสัชวิทยา', 'จุฬาลงกรณ์มหาวิทยาลัย', 2545, NULL, NULL),
(27, 45172038, 'Doctoral', 'other', 'วิทยาศาสตรดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'เภสัชวิทยา', 'จุฬาลงกรณ์มหาวิทยาลัย', 2553, NULL, NULL),
(28, 46172040, 'Bachelor', NULL, 'ศิลปศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'รัฐศาสตร์', 'มหาวิทยาลัยรามคำแหง', 2532, NULL, NULL),
(29, 46172040, 'Bachelor', NULL, 'การศึกษาบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลศาสตร์', 'มหาวิทยาลัยศรีนครินทรวิโรฒ ประสานมิตร', 2535, NULL, NULL),
(30, 46172040, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2541, NULL, NULL),
(31, 46172040, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'วิศวกรรมทางการแพทย์', 'มหาวิทยาลัยธรรมศาสตร์', 2560, NULL, NULL),
(32, 47172044, 'Bachelor', NULL, 'วิทยาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลและผดุงครรภ์', 'มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ', 2538, NULL, NULL),
(33, 47172044, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'พิษวิทยาทางอาหารและโภชนาการ', 'มหาวิทยาลัยมหิดล', 2545, NULL, NULL),
(34, 47172044, 'Doctoral', 'other', 'พุทธศาสตรดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'พุทธจิตวิทยา', 'มหาจุฬาลงกรณราชวิทยาลัย', 2562, NULL, NULL),
(35, 47172046, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลเกื้อการุณย์', 2537, NULL, NULL),
(36, 47172046, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2544, NULL, NULL),
(37, 47172047, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2536, NULL, NULL),
(38, 47172047, 'Bachelor', NULL, 'สาธารณสุขศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'บริหารสาธารณสุข', 'มหาวิทยาลัยสุโขทัยธรรมธิราช', 2538, NULL, NULL),
(39, 47172047, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สาธารณสุขศาสตร์', 'มหาวิทยาลัยมหิดล', 2547, NULL, NULL),
(40, 47172047, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การพัฒนาทรัพยากรมนุษย์และชุมชน', 'มหาวิทยาลัยเกษตรศาสตร์', 2557, NULL, NULL),
(41, 47172049, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2540, NULL, NULL),
(42, 47172049, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สาธารณสุขศาสตร์', 'มหาวิทยาลัยมหิดล', 2546, NULL, NULL),
(43, 47172049, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การบริหารการศึกษา', 'มหาวิทยาลัยศิลปากร', 2559, NULL, NULL),
(44, 999002, 'Bachelor', NULL, 'วิทยาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลและผดุงครรภ์', 'มหาวิทยาลัยสงขลานครินทร์', 2532, NULL, NULL),
(45, 999002, 'Master', 'other', 'การศึกษามหาบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาแนะแนว', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2546, NULL, NULL),
(46, 49172053, 'Bachelor', NULL, 'ศึกษาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'สุขศึกษา', 'มหาวิทยาลัยรามคำแหง', 2534, NULL, NULL),
(47, 49172053, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2538, NULL, NULL),
(48, 49172053, 'Master', 'other', 'ศิลปศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาชุมชน', 'มหาวิทยาลัยศิลปากร', 2553, NULL, NULL),
(49, 49172054, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2541, NULL, NULL),
(50, 49172054, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2549, NULL, NULL),
(51, 51162072, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยขอนแก่น', 2538, NULL, NULL),
(52, 51162072, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การวางแผนสิ่งแวดล้อมเพื่อพัฒนาชุมชนและชนบท', 'มหาวิทยาลัยมหิดล', 2548, NULL, NULL),
(53, 51162072, 'Doctoral', 'nursing', 'Doctor of philosophy', NULL, NULL, NULL, NULL, 'Nursing Science', 'มหาวิทยาลัยมหิดล', 2567, NULL, NULL),
(54, 5200009, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2539, NULL, NULL),
(55, 5200009, 'Master', 'other', 'การศึกษามหาบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาพัฒนาการ', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2547, NULL, NULL),
(56, 999004, 'Bachelor', NULL, 'วิทยาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลและผดุงครรภ์', 'มหาวิทยาลัยหัวเฉียว', 2535, NULL, NULL),
(57, 999004, 'Master', 'other', 'ศิลปศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สังคมศาสตร์การแพทย์และสาธารณสุข', 'มหาวิทยาลัยมหิดล', 2551, NULL, NULL),
(58, 54172071, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2547, NULL, NULL),
(59, 54172071, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สาธารณสุขศาสตร์', 'มหาวิทยาลัยมหิดล', 2552, NULL, NULL),
(60, 54172071, 'Doctoral', 'other', 'วิทยาศาสตรดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'วิจัยและการจัดการด้านสุขภาพ', 'จุฬาลงกรณ์มหาวิทยาลัย', 2561, NULL, NULL),
(61, 54172078, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2542, NULL, NULL),
(62, 54172078, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'เวชศาสตร์ชุมชน', 'จุฬาลงกรณ์มหาวิทยาลัย', 2548, NULL, NULL),
(63, 54172078, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'การพัฒนาทรัพยากรมนุษย์และชุมชน', 'มหาวิทยาลัยเกษตรศาสตร์', 2561, NULL, NULL),
(64, 54127262, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยขอนแก่น', 2552, NULL, NULL),
(65, 54127262, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาลเด็ก', 'มหาวิทยาลัยมหิดล', 2559, NULL, NULL),
(66, 54172085, 'Bachelor', NULL, 'อนุปริญญาพยาบาลและอนามัย', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2516, NULL, NULL),
(67, 54172085, 'Bachelor', NULL, 'ประกาศนียบัตรผดุงครรภ์', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2517, NULL, NULL),
(68, 54172085, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2525, NULL, NULL),
(69, 54172085, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'บริหารการพยาบาล', 'วิทยาลัยเซนต์หลุยส์', 2550, NULL, NULL),
(70, 56172088, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยมิชชั่น', 2538, NULL, NULL),
(71, 56172088, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาลเวชปฏิบัติครอบครัว', 'มหาวิทยาลัยบูรพา', 2560, NULL, NULL),
(72, 56172089, 'Bachelor', NULL, 'วิทยาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลและผดุงครรภ์', 'วิทยาลัยหัวเฉียว', 2532, NULL, NULL),
(73, 56172089, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การบริหารการพยาบาล', 'มหาวิทยาลัยบูรพา', 2544, NULL, NULL),
(74, 56172089, 'Doctoral', 'other', 'การศึกษาดุษฎีบัณฑิต (กศ.ด.)', NULL, NULL, NULL, NULL, 'การจัดการอุดมศึกษา', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2567, NULL, NULL),
(75, 56172104, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสงขลานครินทร์', 2537, NULL, NULL),
(76, 56172104, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สรีรวิทยา', 'มหาวิทยาลัยมหิดล', 2544, NULL, NULL),
(77, 56172104, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'ภาวะผู้นำและนวัตกรรมการบริหารการศึกษา', 'มหาวิทยาลัยสยาม', 2565, NULL, NULL),
(78, 56172103, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยเชียงใหม่', 2551, NULL, NULL),
(79, 56172103, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'ชีวเคมี', 'มหาวิทยาลัยมหิดล', 2556, NULL, NULL),
(80, 57172108, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2550, NULL, NULL),
(81, 57172108, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'เภสัชวิทยา', 'จุฬาลงกรณ์มหาวิทยาลัย', 2556, NULL, NULL),
(82, 57172109, 'Bachelor', NULL, 'วิทยาศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลและผดุงครรภ์', 'มหาวิทยาลัยสงขลานครินทร์', 2531, NULL, NULL),
(83, 57172109, 'Master', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'อายุรศาสตร์เขตร้อน (หลักสูตรปริญญาโทควบปริญญาเอก)', 'มหาวิทยาลัยมหิดล', 2545, NULL, NULL),
(84, 57172109, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'อายุรศาสตร์เขตร้อน (หลักสูตรปริญญาโทควบปริญญาเอก)', 'มหาวิทยาลัยมหิดล', 2545, NULL, NULL),
(85, 58172110, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2547, NULL, NULL),
(86, 58172110, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาลผู้ใหญ่ขั้นสูง', 'มหาวิทยาลัยคริสเตียน', 2557, NULL, NULL),
(87, 540215, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยบรมราชชนนี สุรินทร์', 2535, NULL, NULL),
(88, 540215, 'Master', 'other', 'ศิลปศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สังคมศาสตร์การแพทย์และสาธารณสุข', 'มหาวิทยาลัยมหิดล', 2548, NULL, NULL),
(89, 382018, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยพยาบาลสวรรค์ประชารักษ์', 2536, NULL, NULL),
(90, 382018, 'Master', 'other', 'สังคมศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สิ่งแวดล้อม', 'มหาวิทยาลัยมหิดล', 2547, NULL, NULL),
(91, 380018, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2534, NULL, NULL),
(92, 380018, 'Bachelor', NULL, 'ศิลปศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'รัฐศาสตร์', 'มหาวิทยาลัยรามคำแหง', 2537, NULL, NULL),
(93, 380018, 'Master', 'other', 'ศึกษาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'ประชากรศึกษา', 'มหาวิทยาลัยมหิดล', 2544, NULL, NULL),
(94, 999001, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยรังสิต', 2540, NULL, NULL),
(95, 999001, 'Master', 'nursing', 'สาธารณสุขศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2544, NULL, NULL),
(96, 59172119, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2543, NULL, NULL),
(97, 59172119, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาลเวชปฏิบัติชุมชน', 'มหาวิทยาลัยมหิดล', 2560, NULL, NULL),
(98, 59172121, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2530, NULL, NULL),
(99, 59172121, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสุโขทัยธรรมธิราช', 2531, NULL, NULL),
(100, 59172121, 'Master', 'other', 'ศึกษาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การบริหารการศึกษาและภาวะผู้นำทางการศึกษา', 'มหาวิทยาลัยสยาม', 2559, NULL, NULL),
(101, 60172123, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'วิทยาลัยเซนต์หลุยส์', 2551, NULL, NULL),
(102, 60172123, 'Master', 'nursing', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สาธารณสุขศาสตร์', 'มหาวิทยาลัยมหิดล', 2557, NULL, NULL),
(103, 6317212129, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2558, NULL, NULL),
(104, 6317212129, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การเจริญพันธ์และการวางแผนประชากร', 'มหาวิทยาลัยมหิดล', 2563, NULL, NULL),
(105, 63172128, 'Bachelor', NULL, 'การศึกษาบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลศึกษา', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2530, NULL, NULL),
(106, 63172128, 'Master', 'other', 'พัฒนาแรงงานและสวัสดิการมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยธรรมศาสตร์', 2547, NULL, NULL),
(107, 64172139, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยสยาม', 2551, NULL, NULL),
(108, 64172139, 'Master', 'other', 'วิทยาศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'สารสนเทศทางสุขภาพ', 'มหาวิทยาลัยรามคำแหง', 2555, NULL, NULL),
(109, 650291, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2553, NULL, NULL),
(110, 650291, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'การพยาบาลจิตเวชและสุขภาพจิต', 'มหาวิทยาลัยธรรมศาสตร์', 2559, NULL, NULL),
(111, NULL, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'มหาวิทยาลัยมหิดล', 2556, NULL, NULL),
(112, NULL, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, NULL, 'จุฬาลงกรณ์มหาวิทยาลัย', 2561, NULL, NULL),
(113, NULL, 'Doctoral', 'other', 'ปรัชญาดุษฎีบัณฑิต', NULL, NULL, NULL, NULL, 'จิตวิทยาประยุกต์', 'มหาวิทยาลัยศรีนครินทรวิโรฒ', 2566, NULL, NULL),
(114, NULL, 'Bachelor', NULL, 'พยาบาลศาสตรบัณฑิต', NULL, NULL, NULL, NULL, 'พยาบาลศาสตร์และผดุงครรภ์', 'วิทยาลัยพยาบาลชลบุรี', 2531, NULL, NULL),
(115, NULL, 'Master', 'nursing', 'พยาบาลศาสตรมหาบัณฑิต', NULL, NULL, NULL, NULL, 'บริหารการพยาบาล', 'จุฬาลงกรณ์มหาวิทยาลัย', 2561, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `enrollment_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` int NOT NULL,
  `academic_year` int DEFAULT NULL COMMENT 'ปีการศึกษา เช่น 2567',
  `semester` int DEFAULT NULL COMMENT 'ภาคการศึกษา (1, 2, 3)',
  `section` int DEFAULT NULL COMMENT 'ตอนเรียน (Sec)',
  `grade` varchar(5) DEFAULT NULL COMMENT 'เกรดที่ได้ (A, B+, ...)',
  `status` enum('Active','Withdrawn','Dropped','Failed') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`enrollment_id`, `student_id`, `subject_id`, `academic_year`, `semester`, `section`, `grade`, `status`) VALUES
(1, 6603400001, 1, 2567, 1, 1, 'D', 'Active'),
(2, 6603400002, 1, 2567, 1, 1, 'B+', 'Active'),
(3, 6603400004, 1, 2567, 1, 1, 'C+', 'Active'),
(4, 6603400005, 1, 2567, 1, 1, 'B', 'Active'),
(5, 6603400006, 1, 2567, 1, 1, NULL, 'Active'),
(6, 6603400007, 1, 2567, 1, 1, NULL, 'Active'),
(7, 6603400001, 2, 2567, 1, 1, 'B', 'Active'),
(8, 6603400002, 2, 2567, 1, 1, 'A', 'Active'),
(9, 6603400004, 2, 2567, 1, 1, NULL, 'Active'),
(10, 6603400001, 4, 2567, 1, 1, NULL, 'Active'),
(11, 6603400005, 4, 2567, 1, 1, 'C', 'Active'),
(12, 6603400001, 3, 2567, 1, 1, NULL, 'Active'),
(13, 6603400002, 3, 2567, 1, 1, NULL, 'Active'),
(14, 6603400004, 3, 2567, 1, 1, NULL, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL COMMENT 'คำนำหน้าชื่อ (นาย/นาง/ดร./ผศ.)',
  `first_name_th` varchar(100) DEFAULT NULL,
  `last_name_th` varchar(100) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `gender` enum('ชาย','หญิง') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `current_address` text COMMENT 'ที่อยู่ปัจจุบัน',
  `nursing_council_no` varchar(50) DEFAULT NULL COMMENT 'เลขที่บัตรสภาการพยาบาล / ใบประกอบวิชาชีพ',
  `license_expiry` date DEFAULT NULL COMMENT 'วันหมดอายุใบอนุญาตประกอบวิชาชีพ',
  `start_work_date` date DEFAULT NULL COMMENT 'วันที่เริ่มปฏิบัติงาน',
  `contract_date` date DEFAULT NULL,
  `academic_position_date` date DEFAULT NULL COMMENT 'วันที่รับตำแหน่งทางวิชาการ',
  `pts_date` date DEFAULT NULL,
  `profile_picture` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'URL รูปโปรไฟล์',
  `nursing_council_file` text COMMENT 'URL ไฟล์บัตรสภาการพยาบาล',
  `license_file` text COMMENT 'URL ไฟล์ใบอนุญาตประกอบวิชาชีพ',
  `teaching_cert_file` text COMMENT 'URL ไฟล์ใบประกอบวิชาชีพครู',
  `status` enum('Active','Retired') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Active' COMMENT 'สถานะการทำงาน (Active/Retired)',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `license_image` text COMMENT 'รูปใบประกอบวิชาชีพที่อาจารย์อัปโหลดเอง'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `faculty_id`, `user_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `birth_date`, `email`, `phone`, `current_address`, `nursing_council_no`, `license_expiry`, `start_work_date`, `contract_date`, `academic_position_date`, `pts_date`, `profile_picture`, `nursing_council_file`, `license_file`, `teaching_cert_file`, `status`, `description`, `created_at`, `license_image`) VALUES
(57, 9003, NULL, 'ผศ.ดร.', 'สมใจ', 'รักเรียน', 'Somjai', 'Rakrian', 'หญิง', '1980-01-15', 'test3@siam.edu', '0833333333', '789 BKK', 'NC11111', '2030-12-31', '2010-06-01', NULL, '2015-06-01', NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-24 07:35:04', NULL),
(58, 9004, NULL, 'อาจารย์', 'ยอดเยี่ยม', 'สอนดี', 'Yodyiam', 'Sordee', 'ชาย', '1992-10-10', 'test4@siam.edu', '0844444444', '101 BKK', 'NC22222', '2030-12-31', '2018-05-01', NULL, '2018-05-01', NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-24 07:35:04', NULL),
(59, 9005, NULL, 'ดร.', 'วิชาการ', 'ก้าวหน้า', 'Wichakan', 'Kaona', 'หญิง', '1988-12-05', 'test5@siam.edu', '0855555555', '202 BKK', 'NC33333', '2030-12-31', '2015-08-01', NULL, '2020-08-01', NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-24 07:35:04', NULL),
(54, 123456, 14, 'นางสาว', 'อุษา', 'จันทวงศ์', 'Ousa', 'Chanthwngs', 'หญิง', '1976-12-25', NULL, '0876802992', NULL, NULL, '2028-03-23', '2009-02-09', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1caZxI_46bX91yrfYOQxDy2STIAj-v37c', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:55', NULL),
(26, 234561, 15, 'อาจารย์', 'สุภาพร', 'แตงจุ้ย', 'Suphaphr', 'Aetngchuy', 'หญิง', '1994-08-30', NULL, '0922626443', '145 หมู่11 ซ.สวนผัก29 ถ.สวนผัก เขตตลิ่งชัน กทม', '6111283091', '2027-12-23', '2023-03-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1AJ2mLVzvMR3AveL3vbFB-IWLYsreCX-O', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:53', NULL),
(33, 380018, 16, 'อาจารย์', 'พรรณี', 'ตรังคสันต์', 'Phrrni', 'Trangkhsant', 'หญิง', '1968-02-27', NULL, NULL, '63/213 บรมราชชนนี 64  แขวงศาลาธรรม เขตทวีวัฒนา กรุงเทพมหานคร', '4511050332', '2023-11-04', '2015-10-10', NULL, NULL, NULL, 'https://drive.google.com/uc?id=19xYaKu29ABLwiaMIv-3kkggQRSe9yvTn', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(31, 382018, 17, 'อาจารย์', 'บัวทิพย์', 'เพ็งศรี', 'Bawthiphy', 'Ephngsri', 'หญิง', '1970-10-17', NULL, '0815659852', '47/5 ม.4 ตำบลพิมลราช อำเภอบางบัวทอง จังหวัดนนทบุรี', '4511048575', '2023-08-05', '2015-10-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1pwVOigXqjqsLaNw6raKaTtsn0RVoamIA', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(32, 540215, 18, 'อาจารย์', 'ศิริพร', 'สามสี', 'Siriphr', 'Samsi', 'หญิง', '1969-04-13', NULL, '0812534343', '28 หอพักพยาบาล โรงพยาบาลธนบุรี1 ซอยแสงศึกษา ถนนอิสรภาพ พรานนก เขตบางกอกน้อย กรุงเทพมหานคร', '4511075055', '2024-04-07', '2015-10-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=18cohpXHCv2rRnAtuttjp34N9RkwyYKLh', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(52, 570205, 19, 'นางสาว', 'นลินี', 'แสนชนะ', 'Nlini', 'Aesnchna', 'หญิง', '1980-04-01', NULL, '0829159056', '58 ถนนพระรามที่ 2 วอย 28 แยก 11 แขวงจอมทอง เขตจอมทอง กรุงเทพมหานคร 10150', NULL, '2027-12-23', '2013-09-02', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1Z_hqbzznU1Gk3s1dyyeo_YMdza25VUVG', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:55', NULL),
(20, 650291, 20, 'อาจารย์', 'อัจรา', 'ฐิตวัฒนกุล', 'Oachra', 'Thitwathnkul', 'หญิง', '1987-09-13', NULL, '0646482795', '99/63 ม.แกรนดิโอ เพชรเกษม81 ถ.มาเจริญ แขวงหนองค้างพลู เขตหนองแขม กทม.', '5311218207', '2025-03-21', '2022-08-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1yn-yQIIdndxy43Q8LWU-rBHMnhO7UnnH', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(4, 980279, 21, 'อาจารย์', 'ศิรินา', 'สันทัดงาน', 'Sirina', 'Santhadngan', 'หญิง', '1966-03-07', NULL, '0987146559', '18/1 ซ. สวนผัก ถนนราชพฤกษ์ เบตตลิ่งชัน', '5611057840', '2025-11-28', '2020-05-01', NULL, '2024-07-31', NULL, 'https://drive.google.com/uc?id=1qbG0Q-5PqHaohfDK_p8EjI3jAa24b96k', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(35, 999001, 22, 'อาจารย์', 'พิไลพรรณ', 'แก้วแก่นตา', 'Phiailphrrn', 'Aekwaeknta', 'หญิง', '1976-01-13', NULL, '0800769229', '675 ม.10 ต.ท่าตูม อ.ศรีมหาโพธิ์ จ.ปราจีนบุรี', '4511032299', NULL, '2016-05-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1p1P6Uc1bF638ZmvZO06l997SfnqPPG8W', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(34, 999002, 23, 'อาจารย์', 'พาจนา', 'ดวงจันทร์', 'Phachna', 'Dwngchanthr', 'หญิง', '1967-04-29', NULL, NULL, '99/85 ม.2 แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพมหานคร', '4511050318', NULL, '2005-02-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1fYoqhgygboofzVEFHkKUVamW0RJxSWtP', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(30, 999003, 24, 'อาจารย์', 'นิตยา', 'วิโรจนะ', 'Nitya', 'Wiorchna', 'หญิง', '1950-02-14', NULL, '0817361147', '187/96 ซอย 17 ถนนท่าข้าม แขวงแสมดำ เขตบางขุนเทียน จังหวัดกรุงเทพมหานคร', '6111001037', NULL, '2013-05-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1-5OT7QO4me9xO4-FRznMWNxqgF3DIXIN', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(29, 999004, 25, 'อาจารย์', 'สิรินัฐ', 'สินวรรณกุล', 'Sirinath', 'Sinwrrnkul', 'หญิง', '1969-09-11', NULL, NULL, '34 ร.พ.ธนบุรี1 (10A) ถนนอิสรภาพ44 บ้านช่างทองหล่อ เขตบางกอกน้อย จังหวัดกรุงเทพมหานคร', '4511070793', NULL, '2010-09-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1hwm_h30h-344iu8i5WSvMhDAMoczCN61', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(37, 5200009, 26, 'นางสาว', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharthiphy', 'Chirkaychna', 'หญิง', '1975-02-15', NULL, '0928959059', '8/96 ถ.ศาลาธรรมสพน์30  แขวงศาลาธรรมสพน์  เขตทวีวัฒนา กทม. 10170', '4511034476', '2027-03-25', '2009-11-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1lXzV92RgQQVr14z6tiaHyt5-NKQ4V2dE', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(63, 11111111, NULL, 'นาย', 'เทส', 'ระบบ', 'test', 'rabop', 'ชาย', '1988-10-10', NULL, '1123456789', 'ลอนด้อน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-24 16:26:37', NULL),
(65, 22222222, NULL, 'นาย', 'นี่', 'มันรว้ายส์', 'Ni', 'Manrai', 'ชาย', '1970-05-14', NULL, '1111111111', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-25 07:49:56', NULL),
(70, 33333333, NULL, 'นาย', 'ไก่', 'กุ๊กกุ๊ก', 'Kai', 'Kookkook', 'ชาย', '1999-08-23', NULL, '7777777777', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, '2026-09-25 12:36:44', NULL),
(27, 40172006, 13, 'อาจารย์', 'เฟื่องสุข', 'ไพศาลกอบฤทธิ์', 'Efueongsukh', 'Aiphsalkobฤththi', 'หญิง', '1955-07-21', NULL, '0897865253', '102/432 ม.5 ต.บางรักพัฒนา อ.บางบัวทอง จ.นนทบุรี', '4511055434', '2027-12-23', '1998-11-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1tksZgZsAPP1ze0N8tEUfUaz82WjDWknV', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:53', NULL),
(48, 41172008, 27, 'ผู้ช่วยศาสตราจารย์ ดร.', 'จรัสดาว', 'เรโนลด์', 'Chrasdaw', 'Eronld', 'หญิง', '1968-04-15', NULL, '00000000', NULL, '4511059 407', '2025-07-26', '1989-01-11', NULL, '2015-06-01', NULL, 'https://drive.google.com/uc?id=1n2huOJMYaC-E4WOh0Q58d9JMrYum7wDo', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(19, 41172011, 4, 'ผู้ช่วยศาสตราจารย์ ดร.', 'พิชาภรณ์', 'จันทนกุล', 'Phichaphrn', 'Chanthnkul', 'หญิง', '1972-07-27', NULL, '0815852959', '99/168 ชั้น 9 ซิตี้โฮมสี่แยกท่าพระ ถ.รัชดาภิเษก แขวงวัดท่าพระ บางกอกใหญ่ กรุงเทพ', '4511036515', '2024-03-29', '1998-05-01', NULL, '2015-03-06', NULL, 'https://drive.google.com/uc?id=1JJd7suviuotMBPT7FSs8agD2whvr2MBw', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(36, 41172017, 6, 'ผู้ช่วยศาสตราจารย์ ดร.', 'อรทิพา', 'ส่องศิริ', 'Orthipha', 'Songsiri', 'หญิง', '1951-07-22', NULL, '0818036865', '105/19 ซอยเพชรเกษม 19 แขวงปากคลอง เขตภาษีเจริญ', '4511016150', '2028-07-27', '1994-10-01', NULL, '2005-11-26', NULL, 'https://drive.google.com/uc?id=102NBXg19xtPG_cNLibiU6HiU2LtH-GY-', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(49, 42172021, 28, 'ผู้ช่วยศาสตราจารย์ ดร.', 'วัฒนีย์', 'ปานจินดา', 'Wathniy', 'Panchinda', 'หญิง', '1955-08-17', NULL, '0000000000', NULL, '4511077 074', '2027-12-23', '2001-10-16', NULL, '2022-10-31', NULL, 'https://drive.google.com/uc?id=17RdUG9FbFhC4-7hMvOFHWf5sb6kObmSX', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(42, 42172025, 29, 'อาจารย์ ดร.', 'ปรียธิดา', 'ชลศึกเสนีย์', 'Priythida', 'Chlsuekesniy', 'หญิง', '1966-07-31', NULL, '0801461617', '52 ถ.โชคชัย4ซอย50 แยก6 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ', '4511055442', '2026-05-17', '1999-07-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1Lz7xtHQwsvpe3MKmo610S2SlThUsZwWT', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(3, 44172033, 12, 'ผู้ช่วยศาสตราจารย์', 'ภัทรพร', 'อรัณยภาค', 'Phathrphr', 'Oranyphakh', 'หญิง', '1953-02-16', 'qwertyuiop@gmail.com', '0814784647', '77 เพชรเกษม ซอย 40', '4511016607', '2025-08-06', '2001-10-16', NULL, '2008-07-14', NULL, 'https://drive.google.com/uc?id=11kytl6TBnEyLNZOzOz45LBKG4726L4d5', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(22, 45172037, 30, 'ผู้ช่วยศาสตราจารย์ ดร.', 'สุสารี', 'ประคินกิจ', 'Susari', 'Prakhinkich', 'หญิง', '1975-01-25', NULL, '0858219229', '29 ถ.ราชพฤกษ์ แขวงบุคคโล', '4511005639', '2027-12-23', '2002-11-01', NULL, '2010-08-30', NULL, 'https://drive.google.com/uc?id=1DvmZeNAYDIEqxb2F2pPlIUIuSiAI1jLT', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(21, 45172038, 31, 'ผู้ช่วยศาสตราจารย์ ดร.', 'สมฤดี', 'ชื่นกิติญานนท์', 'Smฤdi', 'Chuenkitiyannth', 'หญิง', '1975-05-09', NULL, '081-6148304', '525/444 หมู่บ้านทาวน์พลัสประชาอุทิศ ถนนประชาอุทิศ ทุ่งครุ ทุ่งครุ กทม 10140', '4611093778', '2027-12-23', '2002-12-02', NULL, '2015-03-06', NULL, 'https://drive.google.com/uc?id=1_p_8H6vofSiiaEK_x1XK9uqexqIGlCEy', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(47, 46172040, 5, 'อาจารย์ ดร. พันจ่าเอก', 'ภูมเดชา', 'ชาญเบญจพิภู', 'Phumedcha', 'Chayebychphiphu', 'ชาย', '1964-04-07', NULL, '0626954155', '5/102 หมู่บ้านวรารมย์ ถนนบางบอน 5 แขวงบางบอน เขตบางบอน กรุงเทพ 10150', '4521050682', '2025-03-21', '2003-03-03', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1nqUnmZPMKxvtp58XxbOJA30mFnsrM68F', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(15, 47172044, 32, 'อาจารย์ ดร.', 'สุวรรณา', 'เชียงขุนทด', 'Suwrrna', 'Echiyngkhunthd', 'หญิง', '1973-02-01', NULL, '0645165928', '27 หมู่ 1 ต.พะเนียด อ.นครชัยศรี จ.นครปฐม', '4511007784', '2024-03-29', '2003-05-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1873hqWR7woVu9DDMW62peMBHB3g1nq8s', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(43, 47172046, 33, 'ผู้ช่วยศาสตราจารย์', 'วารุณี', 'เพไร', 'Waruni', 'Ephair', 'หญิง', '1972-08-06', NULL, '0832347470', '318 เพชรเกษม 54 แยก 3 แขวงบางด้วน เขตภาษีเจริญ กรุงเทพ 10160', '4711186486', '2027-12-23', '2004-06-01', NULL, '2012-03-06', NULL, 'https://drive.google.com/uc?id=1WnAMTUhLQr6o922AuVoghx2Bxy7ieBlW', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(23, 47172047, 34, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ชนิดา', 'มัททวางกูร', 'Chnida', 'Maththwangkur', 'หญิง', '1971-09-21', NULL, '0870434000', NULL, '4511069513', '2027-12-23', '2004-07-01', NULL, '2019-06-13', NULL, 'https://drive.google.com/uc?id=1joP5gdCjeF_vwjd4pwgfWP1vtMHOQy-z', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(11, 47172049, 35, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ศนิกานต์', 'ศรีมณี', 'Snikant', 'Srimni', 'หญิง', '1975-03-01', NULL, '0815809893', '39/72 ไอคอนโดเพชรเกษม 39', '4511078893', NULL, '2004-10-10', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1d75kQbWnbEfPcuIIbPeVEsARyjVyTmHX', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(38, 49172053, 36, 'อาจารย์', 'พรพิมล', 'ภูมิฤทธิกุล', 'Phrphiml', 'Phumiฤththikul', 'หญิง', '1959-04-20', NULL, '0849122468', '18/23 หมู่บ้านตะวันฉาย หนองแขม กรุงเทพฯ', '5511168672', '2027-12-23', '2006-03-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1aqvr313xS63kdlSuNR-I6uYZ4jXjpdPc', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(53, 49172054, 37, 'อาจารย์', 'สุนันทา', 'บุญรักษา', 'Sunantha', 'Buyraksa', 'หญิง', '1975-05-10', NULL, '00000000', '19/1 ม 1 ต.สระลงเรือ อ.ห้วยกระเจา  จ.กาญจนบุรี', '6511108 587', '2027-12-23', '2006-08-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1O0HewXyY8pLusOpbJhrU9rUCpOdbqTad', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:55', NULL),
(6, 50172059, 38, 'อาจารย์์', 'ลัญชนา', 'พิมพันธ์ชัยยบูลย์', 'Laychna', 'Phimphanthchayybuly', 'หญิง', '1982-06-16', NULL, '0801635444', '864/188 the niche id บางแค แขวง/เขตบางแค กรุงเทพ 10160', '5211180156', '2028-03-18', '2007-07-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=13ory991sStiiW-IidEBl-ahxOFvyeZzO', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(45, 51162072, 39, 'อาจารย์', 'เพ็ญรุ่ง', 'นวลแจ่ม', 'Ephyrung', 'Nwlaechm', 'หญิง', '1973-01-20', NULL, '0816251474', '219 ซอยเทอดไท 63/2 ถนนเทอดไท บางหว้า ภาษีเจริญ กทม10160', '6611103761', '2027-12-23', '2008-08-04', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1aJ_tfI4dAkn8KeraBcZyspPQ7B4UxQ_H', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(18, 52172065, 40, 'อาจารย์ ดร.', 'สุลีมาศ', 'อังศุเกียรติถาวร', 'Sulimas', 'Oangsuekiyrtithawr', 'หญิง', '1974-08-14', NULL, '0869954040', '18/241 ลุมพินีวิลล์คอนโดบางแค', '4511009866', '2024-03-30', '2009-11-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1NGZ3VT9Y0Tp303CU2HPo_uFWz-2VtQa2', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(5, 53172079, 41, 'อาจารย์', 'สุธิดา', 'พรมรัศมี', 'Suthida', 'Phrmrasmi', 'หญิง', '1981-03-02', NULL, '0863297163', '160/134 แกรนริเวอร์เทาวน์เวอร์ ซ. พิบูลย์สงคราม 15 ถ. พิบูลย์สงคราม ต. สวนใหญ๋ อ. เมือง จ. นนทบุรี', '5611207472', '2023-08-05', '2010-11-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1bP3BrXVQiIeI9LZKI4br5FNgzyvg31qK', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(13, 54127262, 42, 'อาจารย์', 'ธัญลักษณ์วดี', 'ก้อนทองถม', 'Thaylaksnwdi', 'Konthongthm', 'หญิง', '1986-09-15', NULL, '0897210113', 'คอนโดลุมพินีเพลสบรมราชชนนี ปิ่นเกล้า ตลิ่งชัน กทม', '5211209369', '2023-10-28', '2011-10-03', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1Zm5Qq1dTXjAQVLN_dABYY-KFA0Nrl7lu', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(16, 54172071, 43, 'อาจารย์ ดร.', 'วราภรณ์', 'คำรศ', 'Wraphrn', 'Khamrs', 'หญิง', '1983-08-09', NULL, '0873711369', '107/34 หมู่บ้านเลอร์พาร์ค ซอยเทียนทะเล28 แขวงท่าข้าม เขตบางขุนเทียน กทม 10150', '6411198208', '2027-12-23', '2011-12-16', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1YCUnwuJfnQDJmZachO3w966obH4-ieEd', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(28, 54172078, 44, 'ผู้ช่วยศาสตราจารย์ ดร. เรือเอกหญิง', 'วิภานันท์', 'ม่วงสกุล', 'Wiphananth', 'Mwngskul', 'หญิง', '1977-04-27', NULL, '0879549929', '42 ถนนบางขุนเทียน แขวงบางบอน เขตบางบอน กทม.', '4711178169', '2027-12-23', '2011-05-01', NULL, '2021-03-10', NULL, 'https://drive.google.com/uc?id=1E2SjA2FNZyho64fD-xlhnxeyRLWSPA66', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(7, 54172085, 45, 'อาจารย์', 'อัมพร', 'คงจีระ', 'Oamphr', 'Khngchira', 'หญิง', '1951-04-16', NULL, '0819160919', '151 the trust residence ปิ่นเกล้า แขวงอรุณอมรินทร์ เขตบางกอกน้อย กรุงเทพ', '4511002485', '2027-12-23', '2011-01-11', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1ECqJDA5qXeauQteZxfD15vHsTLZAFyxw', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(51, 56172088, 46, 'อาจารย์', 'วิวรรณา', 'คล้ายคลึง', 'Wiwrrna', 'Khlaykhlueng', 'หญิง', '1973-10-07', NULL, '0895212345', '29 ซอยเทอดไท55 ถนนเทอดไท แขวงปากคลองภาษีเจริญ เขตภาษีเจริญ กรุงเทพมหานคร 10160', '4511013331', '2027-12-23', '2013-03-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1xx4kOk-muqL_M5BzWv4d6i1DgqrnGp_a', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:55', NULL),
(8, 56172089, 47, 'นางสาว', 'สุจิตราภรณ์', 'ทับครอง', 'Suchitraphrn', 'Thabkhrong', 'หญิง', '1995-10-02', NULL, '0863251189', '1435/4 ถนนริมทางรถไฟ แขวงตลาดพลู', '4511050062', '2027-12-23', '2013-01-05', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1auCWBF3365DVRxEU7ZR4po7uFY2UYb7i', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(1, 56172103, 48, 'อาจารย์', 'รัฐกานต์', 'ขำเขียว', 'Rathkant', 'Khamekhiyw', 'หญิง', '1984-12-10', NULL, '0874261515', '225/8 หมู่บ้านรุ่งกานต์ 7 ตำบลบางบัวทอง อำเภอบางบัวทอง จังหวัดนนทบุรี 11110', '5111205212', '2027-12-23', '2013-06-01', NULL, '2024-08-07', NULL, 'https://drive.google.com/uc?id=1elyf7BVBYfGCduTRsJ2xuffMBHT8AzpX', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:40:15', NULL),
(25, 56172104, 49, 'อาจารย์ ดร.', 'ณิชมล', 'ขวัญเมือง', 'Nichml', 'Khwayemueong', 'หญิง', '1972-03-19', NULL, '0894595043', '145 หมู่11 ซ.สวนผัก29 ถ.สวนผัก เขตตลิ่งชัน กทม', '4511017614', '2027-12-31', '2013-05-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1USqFiHXgoLACo41OpaS6Tfe2a5DERSve', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(10, 57172108, 50, 'อาจารย์', 'นฤมล', 'อังศิริศักดิ์', 'Nฤml', 'Oangsirisakdi', 'หญิง', '1985-02-04', NULL, '0851248147', '79/299 ม.ศุภาลัยวิลล์ ต.ศาลากลาง อ.บางกรวย จ.นนทบุรี', '5011200055', '2027-12-31', '2014-04-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1x6gI8B5uHFWFFLyXtJTvwFw39pYEep23', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(39, 57172109, 51, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ดวงกมล', 'วิรุฬห์อุดมผล', 'Dwngkml', 'Wirulhoudmphl', 'หญิง', '1966-04-22', NULL, '0899252193', '106/101 ถ.เอกชัย แขวลบาวบอน เขตบางบอน', '5711254926', '2024-07-27', '2014-06-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1-lOS-Wqk9T535DDJ1Xu70kTSF-nirLMV', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(9, 58172110, 52, 'อาจารย์', 'สุกฤตา', 'ตะการีย์', 'Sukฤta', 'Takariy', 'หญิง', '1980-01-26', NULL, '0909696157', '28/1 ม.2  ต.ท่าตลาด อ.สามพราน จ.นครปฐม 73110', '4811193884', '2025-11-28', '2015-01-15', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1psBPO920WMSZC76B4F_L8wSan3t8fN0m', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:29', NULL),
(17, 59172119, 53, 'อาจารย์', 'ชัยสิทธิ์', 'ทันศึก', 'Chaysiththi', 'Thansuek', 'ชาย', '1972-04-30', NULL, '0879881114', '142/23 ม.1 ต.แพรกยา อ.เมือง จ.สมุทรปราการ 10280', '4311158065', '2028-07-27', '2016-10-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1bwBv9IX269alpJcPN2jvhn87b253GC57', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(24, 59172121, 54, 'อาจารย์', 'ระชี', 'ดิษฐจร', 'Rachi', 'Disthchr', 'หญิง', '1955-11-16', NULL, '0869755634', '146 ซ.สุขุมวิท 62 ต.บางจาก อ.พระโขนง กรุงเทพฯ 10260', '4511012136', '2027-12-23', '2016-11-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=10OJ3-dzXbX-myVOmccENNAMR910U3fpL', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(41, 60172123, 55, 'อาจารย์', 'ขวัญเรือน', 'ก๋าวิตู', 'Khwayerueon', 'Kawitu', 'หญิง', '1985-06-19', NULL, '0847083511', '206/4 The village bangna3 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ', '5111207345', '2024-07-25', '2017-02-02', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1qf6sC-ZthUNaS6ntboBTHYlcPTChtwip', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(46, 63172128, 56, 'อาจารย์', 'เรวัต', 'แย้มสุดา', 'Erwat', 'Aeymsuda', 'ชาย', '1959-04-28', NULL, '0814463037', '109/170 หมู่2 ต.มหาสวัสดิ์ อ.บางกรวย จ.นนทบุรี', 'อ.1/21510', NULL, '2020-01-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1HcurGQ_0JKN-s4zn6PX7FPmR7hie1KI3', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(12, 63172129, 57, 'อาจารย์', 'รัตนาภรณ์', 'นิวาศานนท์', 'Ratnaphrn', 'Niwasannth', 'หญิง', '1992-03-24', NULL, '0868046982', 'หมู่บ้านร้อยพฤกษาเลควิว  223/169 ซอย11 หมู่ 10 ต. นครปฐม อ เมืองนครปฐม จ.นครปฐม', '51811261753', '2025-07-26', '2019-02-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1Yb5w7soKR-wXjXupTQJbZbgtwYw73HDB', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(14, 64172139, 58, 'นางสาว', 'สุภาภรณ์', 'ศรีฟ้า', 'Suphaphrn', 'Srifa', 'หญิง', '1985-11-12', NULL, '0840583508', '131 ซ เพชรเกษม 48 แยก 24 แขวงบางแวก เขตภาษีเจริญ กทม 10160', '5111207470', '2028-07-02', '2021-03-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1noxVEzgrQHZ9nXUbfT4hhubvxi-UGrKe', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:43:30', NULL),
(44, 65172141, 59, 'อาจารย์', 'นฐมน', 'บุญล้อม', 'Nthmn', 'Buylom', 'หญิง', '1972-02-28', NULL, '0949629947', 'มัลเบอรี่เพลส  118/8-9 ถ.เพชรเกษม แขวงบางหว้า เขตภาษีเจริญ  กรุงเทพฯ', '4511014607', '2027-12-23', '2022-08-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1Ec2xvmzkH5sgnPl7U1p_rl6pRRQzs6VR', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(40, 65172145, 60, 'อาจารย์', 'ปรมัตถ์', 'กิจจานุกิจวัฒนา', 'Prmatth', 'Kichchanukichwathna', 'หญิง', '1987-04-28', NULL, '0865133653', '581/943 เดอะนิชไอดีพระราม 2 เฟส 2', '5211209760', '2027-12-20', '2022-12-01', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1XaNNEA8x7lgMO-YblrQGRtbM8g0Wvjsr', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:54', NULL),
(50, 66172146, 61, 'นางสาว', 'สุธาทิพย์', 'กัลยา', 'Suthathiphy', 'Kalya', 'หญิง', '2000-01-22', NULL, '0893724113', '921/8  ซอยเพชรเกษม 4  ถนนเพชรเกษม  แขวงวัดท่าพระ  เขตบางกอกใหญ่  กรุงเทพมหานคร 10600', NULL, NULL, '2023-05-18', NULL, NULL, NULL, 'https://drive.google.com/uc?id=1pHcvF34hbZRXweT-3BgNVUmTADlkGtJP', NULL, NULL, NULL, 'Active', NULL, '2026-07-05 03:44:55', NULL);

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
-- Table structure for table `faculty_license_reminders`
--

CREATE TABLE `faculty_license_reminders` (
  `id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `license_expiry` date NOT NULL,
  `stage_months` tinyint NOT NULL COMMENT '6, 3 หรือ 1 เดือนก่อนหมดอายุ',
  `notification_id` bigint DEFAULT NULL,
  `email_to` varchar(100) DEFAULT NULL,
  `email_status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'sent | failed | no_email | disabled | not_configured',
  `email_error` text,
  `email_attempts` int NOT NULL DEFAULT '0',
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty_license_reminders`
--

INSERT INTO `faculty_license_reminders` (`id`, `faculty_id`, `license_expiry`, `stage_months`, `notification_id`, `email_to`, `email_status`, `email_error`, `email_attempts`, `email_sent_at`, `created_at`, `updated_at`) VALUES
(1, 5200009, '2027-03-25', 6, 24, NULL, 'no_email', 'ยังไม่มีอีเมลในข้อมูลส่วนตัว', 0, NULL, '2026-09-25 06:56:35', '2026-09-25 06:56:35');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_personnel_development`
--

CREATE TABLE `faculty_personnel_development` (
  `id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `training_date` date NOT NULL,
  `training_topic` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `learnings` text COLLATE utf8mb4_unicode_ci,
  `certificate_file` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_research`
--

CREATE TABLE `faculty_research` (
  `research_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL COMMENT 'เจ้าของผลงาน',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่องานวิจัย',
  `publication_year` int DEFAULT NULL COMMENT 'ปีที่ตีพิมพ์',
  `publication_date` date DEFAULT NULL,
  `article_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `journal_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_author_id` bigint DEFAULT NULL,
  `corresponding_author_id` bigint DEFAULT NULL,
  `co_author_ids` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ประเภท (วิจัยสถาบัน, วิจัยชุมชน)',
  `work_category` enum('research','innovation') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'research',
  `funding_type` enum('none','internal','external') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `funding_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `funding_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `irb_approved` tinyint(1) NOT NULL DEFAULT '0',
  `intellectual_property_status` enum('none','applying','copyright','petty_patent','patent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `award_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Path ไฟล์ PDF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty_research`
--

INSERT INTO `faculty_research` (`research_id`, `faculty_id`, `title`, `publication_year`, `publication_date`, `article_type`, `journal_name`, `issue_number`, `first_author_id`, `corresponding_author_id`, `co_author_ids`, `category`, `work_category`, `funding_type`, `funding_source`, `funding_amount`, `irb_approved`, `intellectual_property_status`, `award_name`, `file_path`, `created_at`) VALUES
(10, 41172008, 'บันทึกจำนวนผลงานวิจัย ปี 2565', 2565, '2022-01-01', 'research', NULL, NULL, 41172008, NULL, '[]', NULL, 'research', 'none', NULL, 0.00, 0, 'none', NULL, NULL, '2026-09-28 08:33:53'),
(12, 41172008, 'บันทึกจำนวนผลงานวิจัย ปี 2565', 2565, '2022-01-01', 'research', NULL, NULL, NULL, NULL, '[41172008]', NULL, 'research', 'none', NULL, 0.00, 0, 'none', NULL, NULL, '2026-09-28 08:33:56'),
(14, 41172008, 'บันทึกจำนวนผลงานวิชาการ/ตำรา ปี 2565', 2565, '2022-01-01', 'academic', NULL, NULL, NULL, NULL, '[41172008]', NULL, 'research', 'none', NULL, 0.00, 0, 'none', NULL, NULL, '2026-09-28 08:33:58'),
(16, 41172008, 'บันทึกจำนวนผลงานวิจัย ปี 2567', 2567, '2024-01-01', 'research', NULL, NULL, 41172008, NULL, '[]', NULL, 'research', 'none', NULL, 0.00, 0, 'none', NULL, NULL, '2026-09-28 08:36:48'),
(17, 41172008, 'บันทึกจำนวนผลงานวิชาการ/ตำรา ปี 2567', 2567, '2024-01-01', 'academic', NULL, NULL, NULL, NULL, '[41172008]', NULL, 'research', 'none', NULL, 0.00, 0, 'none', NULL, NULL, '2026-09-28 08:36:50');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_teaching_workloads`
--

CREATE TABLE `faculty_teaching_workloads` (
  `id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `academic_year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `term` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `grade_id` bigint NOT NULL,
  `student_id` bigint NOT NULL COMMENT 'รหัสนักศึกษา (เชื่อมกับตาราง student)',
  `subject_id` int NOT NULL COMMENT 'รหัสวิชาหลักหลังบ้าน (เชื่อมกับตาราง subjects)',
  `grade_letter` varchar(5) NOT NULL COMMENT 'เกรดตัวอักษร เช่น A, B+, B, C+, C, D+, D, F',
  `grade_point` decimal(3,2) NOT NULL COMMENT 'แต้มคะแนนประจำเกรด เช่น 4.00, 3.50, 3.00, 2.00',
  `semester` varchar(10) NOT NULL COMMENT 'ภาคเรียน เช่น 1, 2, 3',
  `year` varchar(10) NOT NULL COMMENT 'ปีการศึกษา เช่น 2567, 2568',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`grade_id`, `student_id`, `subject_id`, `grade_letter`, `grade_point`, `semester`, `year`, `created_at`, `updated_at`) VALUES
(1, 6603400001, 1, 'A', 4.00, '1', '2567', '2026-05-26 19:27:32', '2026-05-26 19:27:32'),
(2, 6603400001, 2, 'B+', 3.50, '1', '2567', '2026-05-26 19:27:32', '2026-05-26 19:27:32'),
(3, 6603400001, 3, 'B', 3.00, '2', '2567', '2026-05-26 19:27:32', '2026-05-26 19:27:32'),
(4, 6603400001, 4, 'C+', 2.50, '2', '2567', '2026-05-26 19:27:32', '2026-05-26 19:27:32');

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
(42, 5, 'teachers', 'mockup_teachers_new.csv.csv', 3, 'success', NULL, '2026-09-24 07:35:04'),
(43, 5, 'teachers', 'mockup_teachers_new.csv.csv', 3, 'success', NULL, '2026-09-24 15:14:19'),
(44, 5, 'students', 'student_import_test.xlsx', 1, 'success', NULL, '2026-09-24 16:21:26'),
(45, 5, 'students', 'student_import_test.xlsx', 1, 'success', NULL, '2026-09-24 16:22:35'),
(46, 5, 'teachers', 'teacher_import_test.xlsx', 1, 'success', NULL, '2026-09-24 16:26:36'),
(47, 5, 'students', 'teacher_import_test.xlsx', 0, 'failed', 'โครงสร้างไฟล์ไม่ตรงกับประเภท students: ขาดคอลัมน์ student_id, year_level, gpa, hometown_province, height, weight, bmi, home_phone, home_address, graduation_date, dropout_date, dropout_reason, admission_year', '2026-09-25 07:49:44'),
(48, 5, 'teachers', 'teacher_import_test.xlsx', 2, 'success', NULL, '2026-09-25 07:49:55'),
(49, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 07:55:03'),
(50, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 07:57:23'),
(51, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 07:57:36'),
(52, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 08:01:12'),
(53, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 08:01:22'),
(54, 5, 'teachers', 'teacher_import_test.xlsx', 0, 'failed', 'SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value: \'32426\' for column \'birth_date\' at row 1', '2026-09-25 08:01:54'),
(55, 5, 'teachers', 'teacher_import_test.xlsx', 2, 'success', NULL, '2026-09-25 08:25:15'),
(56, 5, 'students', 'student_import_test.xlsx', 1, 'success', NULL, '2026-09-25 08:27:53'),
(57, 5, 'students', 'teacher_import_test.xlsx', 0, 'failed', 'โครงสร้างไฟล์ไม่ตรงกับประเภท students: ขาดคอลัมน์ student_id, year_level, gpa, hometown_province, height, weight, bmi, home_phone, home_address, graduation_date, dropout_date, dropout_reason, admission_year', '2026-09-25 12:36:24'),
(58, 5, 'teachers', 'teacher_import_test.xlsx', 3, 'success', NULL, '2026-09-25 12:36:42');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT 'แจ้งเตือนถึงใคร (FK users)',
  `sender_user_id` bigint DEFAULT NULL COMMENT 'sender user (FK users)',
  `title` varchar(255) NOT NULL COMMENT 'หัวข้อแจ้งเตือน',
  `message` text COMMENT 'เนื้อหา',
  `payload_json` json DEFAULT NULL,
  `type` enum('info','warning','success','request') DEFAULT 'info' COMMENT 'ประเภทสี (ตรงกับ Frontend)',
  `channel` enum('in-app','email','both') DEFAULT 'in-app' COMMENT 'ช่องทางการส่ง',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '0=ยังไม่รุ้, 1=อ่านแล้ว',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `sender_user_id`, `title`, `message`, `payload_json`, `type`, `channel`, `is_read`, `created_at`) VALUES
(7, 1, NULL, 'เอกสารลับ', 'O_O', NULL, 'info', 'in-app', 1, '2026-06-26 17:44:00'),
(8, 1, NULL, 'เอกสารลับ2', 'อุอุอุอุอุอุอุอุอุ', NULL, 'warning', 'both', 1, '2026-06-26 18:04:40'),
(9, 1, 5, 'เอกสารลับ3', 'อุอุอุอุอุอะอะอะอะอะอะ', NULL, 'info', 'email', 1, '2026-06-26 19:39:53'),
(10, 1, 5, 'เอกสารลับ4', '676767676767', NULL, 'info', 'both', 1, '2026-06-26 19:50:56'),
(11, 5, 4, 'คำร้อง', 'เทสๆ', NULL, 'request', 'in-app', 1, '2026-06-27 07:59:42'),
(12, 4, 5, 'โหลลล', 'โหลๆๆเทสๆ', NULL, 'info', 'both', 1, '2026-06-27 17:19:05'),
(13, 1, 4, 'าก่ดฟ่กาหฟด่ก', 'กดฟกหเพฟเพำเพฟ', NULL, 'info', 'both', 1, '2026-06-27 17:20:00'),
(14, 5, NULL, 'นักศึกษาเสี่ยงผลการเรียนต่ำ', 'นักศึกษาในความดูแลมีผลการเรียนรายวิชาต่ำกว่าเกณฑ์ กรุณานัดหมายให้คำปรึกษา', '{\"module\": \"advisor\", \"student_id\": \"6603400001\", \"source_table\": \"avisor_notifications\", \"legacy_notification_id\": 1}', 'warning', 'in-app', 0, '2026-07-10 10:17:10'),
(15, 5, NULL, 'คำขอนัดพบจากนักศึกษา', 'นักศึกษาส่งคำขอนัดพบเพื่อปรึกษาเรื่องการลงทะเบียนภาคเรียนหน้า', '{\"module\": \"advisor\", \"student_id\": \"6603400002\", \"source_table\": \"avisor_notifications\", \"legacy_notification_id\": 2}', 'request', 'in-app', 1, '2026-07-10 10:17:10'),
(16, 5, NULL, 'กำหนดส่งรายงานการให้คำปรึกษา', 'ครบกำหนดส่งสรุปรายงานการให้คำปรึกษาประจำภาคเรียนภายในสิ้นเดือนนี้', '{\"module\": \"advisor\", \"student_id\": null, \"source_table\": \"avisor_notifications\", \"legacy_notification_id\": 3}', 'info', 'in-app', 1, '2026-07-10 10:17:10'),
(17, 5, NULL, 'โหลๆเทสๆอุอุอุ', 'อุอุอุอุอึอึอึอึอึ', NULL, 'request', 'in-app', 0, '2026-07-11 11:08:42'),
(23, 12, 5, 'เเเเเเเ', 'เเเเ', NULL, 'info', 'in-app', 1, '2026-08-03 13:38:02'),
(24, 26, NULL, 'ใบประกอบวิชาชีพจะหมดอายุในอีก 6 เดือน', 'ใบอนุญาตประกอบวิชาชีพการพยาบาลของท่านจะหมดอายุวันที่ 25 มีนาคม 2570 (อีก 181 วัน) กรุณาดำเนินการต่ออายุ แล้วอัปเดตวันหมดอายุและรูปใบประกอบวิชาชีพใหม่ในหน้าข้อมูลส่วนตัว', '{\"kind\": \"license_expiry\", \"link\": \"profile\", \"days_left\": 181, \"stage_months\": 6, \"license_expiry\": \"2027-03-25\"}', 'warning', 'both', 0, '2026-09-25 06:56:35'),
(25, 5, NULL, 'ระยะเวลาโครงการใกล้สิ้นสุด (อีก 1 วัน)', 'โครงการ \"โครงการ 2\" (ทำนุบำรุงศิลปวัฒนธรรม ปีการศึกษา 2569) จะสิ้นสุดวันที่ 26 กันยายน 2569 (อีก 1 วัน) ระยะเวลาของโครงการใกล้สิ้นสุดแล้ว กรุณาเริ่มดำเนินโครงการ | สถานะปัจจุบัน: รออนุมัติ | ผู้ดำเนินโครงการ: ผู้ช่วยศาสตราจารย์ภัทรพร อรัณยภาค', '{\"kind\": \"project_end\", \"link\": \"projectspage\", \"end_date\": \"2026-09-26\", \"days_left\": 1, \"project_id\": 14, \"stage_days\": 14}', 'warning', 'both', 0, '2026-09-25 13:20:44'),
(26, 1, NULL, 'แจ้งข้อมูลอาจารย์ผู้ดูแลคนปัจจุบัน', 'อาจารย์ที่ปรึกษา: ผู้ช่วยศาสตราจารย์ ภัทรพร อรัณยภาค | อาจารย์ปฏิบัติ: ยังไม่มีการมอบหมาย (คลิกเพื่อดูรายละเอียดในใบแสดงผลการเรียน)', '{\"action\": \"view_transcript\", \"target\": \"transcript\", \"advisor_name\": \"ผู้ช่วยศาสตราจารย์ ภัทรพร อรัณยภาค\", \"practical_advisor_name\": \"ยังไม่มีการมอบหมาย\"}', 'info', 'in-app', 1, '2026-09-27 17:19:35'),
(27, 1, 5, 'แจ้งการมอบหมายอาจารย์ปฏิบัติคนปัจจุบัน', 'คุณได้รับการมอบหมาย อาจารย์ปฏิบัติ: ภัทรพร อรัณยภาค ประจำปีการศึกษา 2569 สามารถตรวจสอบข้อมูลได้ที่หน้าใบแสดงผลการเรียน', '{\"action\": \"view_transcript\", \"target\": \"transcript\", \"advisor_name\": \"ภัทรพร อรัณยภาค\", \"advisor_type\": \"practical\"}', 'info', 'in-app', 0, '2026-09-28 08:40:59'),
(28, 12, 5, 'ได้รับมอบหมายนักศึกษา 5 คน (อาจารย์ปฏิบัติ)', 'ผู้ดูแลระบบมอบหมายนักศึกษาในความดูแลของท่าน ปีการศึกษา 2569\n6603400001 นางสาว ญาณันธร โอนอิง\n6603400002 นางสาว จุรีพร ผลพรต\n6603400004 นางสาว ศิริพรรณ ทองอ่อน\n6603400005 นางสาว ตะวัน รีฮุง\n6603400006 นางสาว บัณฑิตา ยุดา', '{\"student_ids\": [\"6603400001\", \"6603400002\", \"6603400004\", \"6603400005\", \"6603400006\"], \"advisor_type\": \"practical\", \"academic_year\": 2569}', 'info', 'in-app', 1, '2026-09-28 08:40:59');

-- --------------------------------------------------------

--
-- Table structure for table `notification_hidden`
--

CREATE TABLE `notification_hidden` (
  `notification_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `hidden_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_hidden`
--

INSERT INTO `notification_hidden` (`notification_id`, `user_id`, `hidden_at`) VALUES
(21, 5, '2026-08-02 15:43:18');

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
(1, 'PROFILE_VIEW_SELF', 'GENERAL', 'ดูข้อมูลส่วนตัวของตนเอง'),
(2, 'PROFILE_VIEW_ALL', 'GENERAL', 'ดูข้อมูลส่วนตัวของบุคลากรคนอื่นทั้งหมด (คณบดี)'),
(3, 'NOTIFICATION_VIEW', 'GENERAL', 'ดูการแจ้งเตือน'),
(4, 'SYSTEM_SETTINGS', 'GENERAL', 'เข้าถึงการตั้งค่าระบบ'),
(5, 'VIEW_DEAN_DASHBOARD', 'DEAN', 'ดูแดชบอร์ด KPI คณะ'),
(6, 'FINANCIAL_VIEW', 'DEAN', 'ดูรายงานด้านการเงิน'),
(7, 'DEAN_NOTIFICATION', 'DEAN', 'ดูการแจ้งเตือนสำหรับคณบดี'),
(8, 'STUDENT_VIEW_COURSE', 'ACADEMIC', 'ดูรายชื่อนักศึกษาในรายวิชาที่ตนเองเป็นผู้สอน'),
(9, 'STUDENT_EXPORT_COURSE', 'ACADEMIC', 'ส่งออกรายชื่อนักศึกษาในรายวิชาที่ตนเองสอน'),
(10, 'COURSE_REPORT_VIEW', 'ACADEMIC', 'ดูรายงานผลลัพธ์การเรียนรู้ PLO/YLO ในรายวิชาที่สอน'),
(11, 'RESEARCH_UPLOAD', 'ACADEMIC', 'อัปโหลดเอกสารรายวิชาต่างๆ (มคอ.3 / มคอ.5)'),
(12, 'ADVISOR_STUDENT_VIEW', 'ADVISOR', 'ดูนักศึกษาในความดูแล'),
(13, 'ADVISOR_ASSIGN_REQUEST', 'ADVISOR', 'ส่งคำร้องขอรับมอบสิทธิ์การดูแลนักศึกษาเพิ่มเติม'),
(14, 'PROJECT_VIEW', 'PROJECT', 'ดูโครงการและวิจัย'),
(15, 'RESEARCH_UPLOAD_PROJECT', 'PROJECT', 'อัปโหลดงานวิจัยหรือเอกสารโครงการ'),
(16, 'PROJECT_LINK_LO', 'PROJECT', 'ระบุการเชื่อมโยงโครงงานกับระดับ PLO, YLO, CLO'),
(17, 'GRADE_MANAGE', 'CURRICULUM', 'กำหนดและแก้ไขเกรดของนักศึกษาตามระดับ CLO'),
(18, 'CLO_MANAGE', 'CURRICULUM', 'กำหนด CLO รายวิชา'),
(19, 'COURSE_REPORT_MANAGE', 'CURRICULUM', 'จัดการรายงานรายวิชา'),
(20, 'CURRICULUM_REPORT_VIEW', 'CURRICULUM', 'ดูรายงาน PLO/YLO'),
(21, 'CLO_MAP_EDIT', 'CURRICULUM', 'แก้ไขตาราง CLO Map'),
(22, 'COURSE_REPORT_EXPORT', 'CURRICULUM', 'ส่งออกหรือดูสรุปข้อมูลสะสม 5 ปี'),
(23, 'CLINICAL_STUDENT_VIEW', 'PRACTICAL', 'ดูรายชื่อนักศึกษาฝึกปฏิบัติ'),
(24, 'CLINICAL_EVIDENCE_UPLOAD', 'PRACTICAL', 'จัดการหลักฐานการฝึกปฏิบัติ'),
(25, 'USER_ROLE_MANAGE', 'ADMIN', 'จัดการผู้ใช้ สิทธิ์ และตำแหน่ง'),
(26, 'DATA_IMPORT_EXPORT', 'ADMIN', 'นำเข้าและส่งออกข้อมูลระบบ'),
(27, 'ADMIN_APPROVALS', 'ADMIN', 'อนุมัติหรือปฏิเสธคำร้องขอ'),
(28, 'AUDIT_LOG_VIEW', 'ADMIN', 'ดูประวัติการใช้งานระบบ'),
(29, 'ADMIN_REPORTS', 'ADMIN', 'ดูรายงานระบบและรายงานผู้บริหาร'),
(30, 'ASSIGN_INSTRUCTORS', 'CURRICULUM', 'จัดอาจารย์ผู้สอน'),
(31, 'PROJECT_MY_VIEW', 'PROJECT', 'ดูโครงการของฉัน'),
(32, 'PROJECT_DOCS_MANAGE', 'PROJECT', 'จัดการเอกสารโครงการ'),
(33, 'PROJECT_LINKS_MANAGE', 'PROJECT', 'เชื่อมโยงโครงการกับ LO'),
(34, 'PROJECT_REPORTS_VIEW', 'PROJECT', 'ดูรายงานโครงการ'),
(35, 'VIEW_RETENTION', 'DEAN', 'ดูรายงานอัตราคงอยู่ของนักศึกษา'),
(36, 'STUDENT_VIEW_TRANSCRIPT', 'STUDENT', 'ดูผลการเรียนหรือ Transcript'),
(37, 'STUDENT_VIEW_PORTFOLIO', 'STUDENT', 'ดูแฟ้มสะสมผลงาน'),
(38, 'TEACHER_DASHBOARD_VIEW', 'TEACHER', 'ดูแดชบอร์ดอาจารย์'),
(39, 'COURSES_VIEW', 'TEACHER', 'ดูหน้ารายวิชา'),
(40, 'MY_COURSES_VIEW', 'TEACHER', 'ดูวิชาที่รับผิดชอบ'),
(41, 'COURSE_STUDENTS_VIEW', 'TEACHER', 'ดูนักศึกษาในรายวิชาและผล CLO รายบุคคล'),
(42, 'GRADES_MANAGE', 'TEACHER', 'จัดการผลการเรียน'),
(43, 'DOCUMENTS_MANAGE', 'TEACHER', 'จัดการคลังเอกสารการสอน'),
(44, 'CLO_MANAGEMENT_VIEW', 'CURRICULUM', 'ดูภาพรวมการจัดการ CLO'),
(45, 'PROGRAM_REPORTS_VIEW', 'CURRICULUM', 'ดูรายงานระดับหลักสูตร'),
(46, 'ADVISE_NOTES_MANAGE', 'ADVISOR', 'จัดการบันทึกการให้คำปรึกษา'),
(47, 'ADVISOR_NOTIFICATION_VIEW', 'ADVISOR', 'ดูการแจ้งเตือนของอาจารย์ที่ปรึกษา'),
(48, 'TRANSFER_REQUESTS_MANAGE', 'ADVISOR', 'จัดการคำร้องย้าย/โอนย้าย'),
(49, 'STUDENTS_VIEW', 'ADVISOR', 'ดูรายชื่อนักศึกษาทั้งระบบ'),
(50, 'PRACTICE_LOCATIONS_VIEW', 'ADVISOR', 'ดูข้อมูลสถานที่ฝึกปฏิบัติ'),
(51, 'PERFORMANCE_MANAGE', 'PRACTICAL', 'จัดการผลประเมิน Performance'),
(52, 'SCHEDULE_TASKS_MANAGE', 'PRACTICAL', 'จัดการตารางงานและงานฝึกปฏิบัติ'),
(53, 'RESEARCH_SUMMARY_VIEW', 'RESEARCH', 'ดูแดชบอร์ดและตารางสรุปผลงานวิจัย 5 ปี'),
(54, 'RESEARCH_RECORD_MANAGE', 'RESEARCH', 'บันทึก แก้ไข ตรวจสอบผลงานวิจัยและวารสาร'),
(85, 'STUDENT_ASSIGN', 'ADMIN', 'มอบหมายนักศึกษาให้อาจารย์ที่ปรึกษา/อาจารย์ปฏิบัติ'),
(86, 'RESEARCH_VIEW', 'RESEARCH', 'View research and innovation records'),
(87, 'RESEARCH_MANAGE', 'RESEARCH', 'Create and update research and innovation records'),
(88, 'STUDENT_VACCINATION', 'STUDENT', 'จัดการข้อมูลการฉีดวัคซีนของนักศึกษา'),
(89, 'STUDENT_HEALTH_RECORDS', 'STUDENT', 'จัดการข้อมูลสุขภาพของนักศึกษา'),
(90, 'STUDENT_VIEW_COMPETENCY', 'STUDENT', 'ดูผลการประเมินสมรรถนะหลัก'),
(91, 'VIEW_STUDENT_VACCINATION', 'ADVISOR', 'ดูข้อมูลการฉีดวัคซีนของนักศึกษา'),
(92, 'VIEW_STUDENT_HEALTH_RECORDS', 'ADVISOR', 'ดูข้อมูลสุขภาพของนักศึกษา'),
(93, 'MANAGE_COMPETENCY', 'ADVISOR', 'ประเมินสมรรถนะหลัก'),
(94, 'ADMIN_COMPETENCY_MANAGE', 'ADMIN', 'เชื่อมผลการประเมินสมรรถนะหลักเข้ากับ PLO'),
(139, 'ADMIN_CURRICULUM_CYCLE_MANAGE', 'ADMIN', 'จัดการหลักสูตรรอบ 5 ปี (เฉพาะแอดมิน)'),
(190, 'STUDENT_COURSE_REGISTRATION', 'Student', 'ลงทะเบียนเรียนรายวิชาของหลักสูตร');

-- --------------------------------------------------------

--
-- Table structure for table `plo`
--

CREATE TABLE `plo` (
  `plo_id` bigint NOT NULL,
  `program_id` int NOT NULL COMMENT 'เป็น PLO ของหลักสูตรไหน',
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
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `description` text,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL COMMENT 'ที่อยู่ไฟล์ (Path) บน Server หรือ Cloud',
  `file_data` longblob,
  `mime_type` varchar(255) DEFAULT NULL,
  `file_category` enum('image','video','document','other') NOT NULL DEFAULT 'document',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `portfolio`
--

INSERT INTO `portfolio` (`portfolio_id`, `student_id`, `title`, `type`, `description`, `file_name`, `file_path`, `file_data`, `mime_type`, `file_category`, `verified`, `created_at`, `updated_at`) VALUES
(22, 6603400001, 'แมวต้ม', 'certificate', 'ม..แมวต้ม', 'แมวต้ม', 'https://drive.google.com/drive/u/0/folders/1E6uZi9JTLjh2ljbRc0TvCHI6zK3yfYLz', NULL, 'text/uri-list', 'document', 0, '2026-09-24 11:58:55', '2026-09-24 12:11:13'),
(23, 6603400001, 'โครงการแมวช็อค', 'project', 'แมวช็อค ตาค้าง', 'โครงการแมวช็อค', 'https://drive.google.com/drive/u/0/folders/1Lrunz2IVTV70P8CbLXsC5M-ZTz9YSsKG', NULL, 'text/uri-list', 'document', 0, '2026-09-24 12:14:24', '2026-09-24 12:14:24'),
(24, 6603400001, 'กิจกรรมแมวมอง', 'activity', 'i แอบมอง u อยู่', 'กิจกรรมแมวมอง', 'https://drive.google.com/drive/u/0/folders/1fiDK92iOhXNPtfwGOsbxbk5DwhtRTT2E', NULL, 'text/uri-list', 'document', 0, '2026-09-24 12:17:11', '2026-09-24 12:17:11'),
(25, 6603400001, 'รางวัลแมวเหม่อแห่งปี', 'award', 'เง้อออออ', 'รางวัลแมวเหม่อแห่งปี', 'https://drive.google.com/drive/u/0/folders/19LKfU7X-XMcytCYbkKoWdZ9k8BUs2Jqf', NULL, 'text/uri-list', 'document', 0, '2026-09-24 12:17:55', '2026-09-24 12:17:55');

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
(2, 'อาจารย์ประจำ'),
(3, 'อาจารย์ที่ปรึกษา'),
(4, 'อาจารย์ปฏิบัติ'),
(5, 'อาจารย์ผู้รับผิดชอบหลักสูตร'),
(6, 'อาจารย์ผู้รับผิดชอบโครงการ'),
(7, 'เลขา'),
(8, 'นักศึกษา'),
(9, 'อาจารย์งานวิจัย');

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
(8, 1),
(9, 1),
(1, 2),
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(9, 3),
(1, 4),
(2, 4),
(3, 4),
(4, 4),
(5, 4),
(6, 4),
(7, 4),
(8, 4),
(9, 4),
(1, 5),
(1, 6),
(1, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(3, 12),
(3, 13),
(1, 14),
(7, 14),
(5, 17),
(5, 18),
(5, 19),
(5, 20),
(5, 21),
(5, 22),
(7, 25),
(7, 26),
(7, 27),
(7, 28),
(1, 29),
(7, 29),
(7, 30),
(2, 31),
(4, 31),
(5, 31),
(6, 31),
(7, 32),
(7, 33),
(1, 34),
(7, 34),
(1, 35),
(8, 36),
(8, 37),
(2, 39),
(2, 40),
(2, 41),
(2, 42),
(2, 43),
(5, 44),
(5, 45),
(3, 46),
(3, 47),
(3, 48),
(3, 49),
(3, 50),
(4, 50),
(7, 50),
(1, 53),
(9, 53),
(9, 54),
(7, 85),
(8, 88),
(8, 89),
(8, 90),
(3, 91),
(3, 92),
(3, 93),
(7, 94),
(7, 139),
(8, 190);

-- --------------------------------------------------------

--
-- Table structure for table `practice_locations`
--

CREATE TABLE `practice_locations` (
  `id` int NOT NULL,
  `hospital_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อโรงพยาบาล',
  `sub_district_hospital` varchar(255) DEFAULT NULL COMMENT 'ชื่อ รพ.สต.',
  `health_center` varchar(255) DEFAULT NULL COMMENT 'อนามัย',
  `mou_status` varchar(100) DEFAULT NULL COMMENT 'MOU',
  `subject_name` varchar(255) DEFAULT NULL COMMENT 'วิชาที่ฝึก',
  `uploaded_by` int DEFAULT NULL COMMENT 'รหัสคนที่อัปโหลด',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `practice_locations`
--

INSERT INTO `practice_locations` (`id`, `hospital_name`, `sub_district_hospital`, `health_center`, `mou_status`, `subject_name`, `uploaded_by`, `created_at`) VALUES
(564, 'โรงพยาบาลศิริราช', '', '', 'มี', 'การพยาบาลผู้ใหญ่', 12, '2026-10-04 22:09:50'),
(565, 'โรงพยาบาลรามาธิบดี', '', '', 'มี', 'การพยาบาลเด็กและวัยรุ่น', 12, '2026-10-04 22:09:50'),
(566, 'โรงพยาบาลตากสิน', '', '', 'ไม่มี', 'การพยาบาลจิตเวช', 12, '2026-10-04 22:09:50'),
(567, '', 'รพ.สต. บ้านบางแค', '', 'มี', 'การพยาบาลอนามัยชุมชน', 12, '2026-10-04 22:09:50'),
(568, '', 'รพ.สต. ท่าพระ', '', 'ไม่มี', 'การพยาบาลอนามัยชุมชน', 12, '2026-10-04 22:09:50'),
(569, '', '', 'ศูนย์บริการสาธารณสุข 41', 'มี', 'การพยาบาลมารดา ทารก และการผดุงครรภ์', 12, '2026-10-04 22:09:50'),
(570, '', '', 'ศูนย์บริการสาธารณสุข 47', 'ไม่มี', 'การพยาบาลมารดา ทารก และการผดุงครรภ์', 12, '2026-10-04 22:09:50'),
(571, 'โรงพยาบาลจุฬาลงกรณ์', '', '', 'มี', 'การพยาบาลผู้สูงอายุ', 12, '2026-10-04 22:09:50'),
(572, 'โรงพยาบาลธนบุรี', '', '', 'มี', 'การบริหารการพยาบาล', 12, '2026-10-04 22:09:50'),
(573, 'โรงพยาบาลพญาไท 3', '', '', 'มี', 'การพยาบาลผู้ใหญ่', 12, '2026-10-04 22:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

CREATE TABLE `program` (
  `program_id` int NOT NULL,
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
  `project_name_th` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `project_name_en` varchar(255) DEFAULT NULL,
  `description` text,
  `project_type` enum('academic_service','culture','other','teaching','research','quality_assurance') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'other',
  `mapping_json` json DEFAULT NULL,
  `responsible_faculty_id` bigint DEFAULT NULL COMMENT 'อาจารย์ผู้รับผิดชอบโครงการ',
  `academic_year` int DEFAULT NULL,
  `status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `strategy` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`project_id`, `project_name_th`, `project_name_en`, `description`, `project_type`, `mapping_json`, `responsible_faculty_id`, `academic_year`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `strategy`) VALUES
(13, 'โครงการ 1', 'First Project', 'ทดลองสร้างโครงการที่ 1', 'academic_service', '{\"clos\": [\"103-111\"], \"plos\": [\"PLO1\", \"PLO2\", \"PLO3\"], \"ylos\": []}', 44172033, 2569, 'active', '2026-08-24', '2026-08-27', '2026-08-24 12:01:04', '2026-09-24 04:03:08', 'ยุทธศาสตร์ที่ 1: Future Research & Innovation'),
(14, 'โครงการ 2', 'Second Project', 'ทดลองสร้างโครงการที่ 2', 'quality_assurance', '{\"member_count\": \"4\"}', 44172033, 2569, 'pending', '2026-09-25', '2026-09-26', '2026-09-25 13:20:44', '2026-10-05 15:03:56', NULL);

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

--
-- Dumping data for table `project_budget_years`
--

INSERT INTO `project_budget_years` (`project_budget_years_id`, `project_id`, `fiscal_year`, `budget_allocated`, `budget_spent`, `result`) VALUES
(57, 13, 2569, 200000.00, 180000.00, NULL),
(111, 14, 2569, 300000.00, 350000.00, 'แหล่งงบ: มหาวิทยาลัยสยาม');

-- --------------------------------------------------------

--
-- Table structure for table `project_documents`
--

CREATE TABLE `project_documents` (
  `id` bigint NOT NULL,
  `project_id` bigint DEFAULT NULL,
  `name` varchar(255) NOT NULL COMMENT 'ชื่อเอกสาร',
  `project` varchar(255) NOT NULL COMMENT 'ชื่อโครงการ หรือข้อมูลโครงการที่เกี่ยวข้อง',
  `type` varchar(50) NOT NULL COMMENT 'ประเภทเอกสาร (proposal, progress, financial, summary)',
  `date` date NOT NULL COMMENT 'วันที่บันทึก/วันที่เอกสาร',
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'สถานะเอกสาร (approved, pending)',
  `file_path` varchar(255) DEFAULT NULL COMMENT 'ที่อยู่ไฟล์แนบ (ถ้ามี)',
  `file_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_documents`
--

INSERT INTO `project_documents` (`id`, `project_id`, `name`, `project`, `type`, `date`, `status`, `file_path`, `file_name`, `mime_type`, `file_size`, `uploaded_by`, `created_at`, `updated_at`) VALUES
(11, 13, 'เอกสารแมวต้ม', 'โครงการ 1', 'summary', '2026-09-17', 'pending', 'https://drive.google.com/drive/u/0/folders/17iiO_zgnJmnmC1tdDJldFDGk6mfnKMJx', 'Google Drive', NULL, NULL, NULL, '2026-09-17 00:02:34', '2026-09-17 00:02:34'),
(116, 14, 'โครงการ 2', 'โครงการ 2', 'summary', '2026-10-11', 'pending', 'https://drive.google.com/drive/u/0/folders/17iiO_zgnJmnmC1tdDJldFDGk6mfnKMJx', 'Google Drive', NULL, NULL, NULL, '2026-10-11 13:45:19', '2026-10-11 13:45:19'),
(117, 14, 'โครงการ 2', 'โครงการ 2', 'summary', '2026-10-11', 'pending', 'https://github.com/GuidyS/Project-Nurse', 'Website URL', NULL, NULL, NULL, '2026-10-11 13:45:19', '2026-10-11 13:45:19'),
(118, 14, 'โครงการ 2', 'โครงการ 2', 'summary', '2026-10-11', 'pending', 'uploads/project_docs/44172033/20261011134520_a568293ca27bc531_Screenshot_2025-07-14_023631.png', 'Screenshot 2025-07-14 023631.png', 'image/png', 1279520, 5, '2026-10-11 13:45:20', '2026-10-11 13:45:20');

-- --------------------------------------------------------

--
-- Table structure for table `project_end_reminders`
--

CREATE TABLE `project_end_reminders` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `end_date` date NOT NULL,
  `stage_days` smallint NOT NULL COMMENT 'จำนวนวันก่อนสิ้นสุด (30 หรือ 14)',
  `admin_notified` int NOT NULL DEFAULT '0' COMMENT 'จำนวนแอดมินที่ได้รับแจ้งเตือนในระบบ',
  `email_to` varchar(255) DEFAULT NULL,
  `email_status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'sent | failed | not_configured | invalid_recipient',
  `email_error` text,
  `email_attempts` int NOT NULL DEFAULT '0',
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_end_reminders`
--

INSERT INTO `project_end_reminders` (`id`, `project_id`, `end_date`, `stage_days`, `admin_notified`, `email_to`, `email_status`, `email_error`, `email_attempts`, `email_sent_at`, `created_at`, `updated_at`) VALUES
(1, 14, '2026-09-26', 14, 1, 'nus1@siam.edu', 'not_configured', 'ยังไม่ได้ตั้งค่า SMTP_HOST / SMTP_FROM_EMAIL', 0, NULL, '2026-09-25 13:20:44', '2026-09-25 13:20:44');

-- --------------------------------------------------------

--
-- Table structure for table `project_faculty_members`
--

CREATE TABLE `project_faculty_members` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_faculty_members`
--

INSERT INTO `project_faculty_members` (`id`, `project_id`, `faculty_id`, `created_at`) VALUES
(60, 13, 380018, '2026-09-22 14:20:34'),
(118, 14, 5200009, '2026-10-11 13:45:51'),
(119, 14, 41172008, '2026-10-11 13:45:51'),
(120, 14, 65172141, '2026-10-11 13:45:51');

-- --------------------------------------------------------

--
-- Table structure for table `project_outcome_links`
--

CREATE TABLE `project_outcome_links` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `outcome_type` enum('plo','ylo','clo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `outcome_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_outcome_links`
--

INSERT INTO `project_outcome_links` (`id`, `project_id`, `outcome_type`, `outcome_code`, `created_at`) VALUES
(21, 13, 'plo', 'PLO1', '2026-09-16 23:37:17'),
(22, 13, 'clo', '103-111', '2026-09-16 23:37:17'),
(123, 13, 'plo', 'PLO2', '2026-09-24 04:03:08'),
(124, 13, 'plo', 'PLO3', '2026-09-24 04:03:08');

-- --------------------------------------------------------

--
-- Table structure for table `project_participants`
--

CREATE TABLE `project_participants` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL COMMENT 'รหัสโครงการ',
  `student_id` bigint NOT NULL COMMENT 'รหัสนักศึกษา',
  `status` enum('Registered','Joined','Passed','Failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Registered' COMMENT 'สถานะการเข้าร่วม',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_progress_logs`
--

CREATE TABLE `project_progress_logs` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `period_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `planned_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `actual_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `logged_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_progress_logs`
--

INSERT INTO `project_progress_logs` (`id`, `project_id`, `period_label`, `planned_percent`, `actual_percent`, `logged_at`, `created_at`) VALUES
(1, 13, 'อัปเดตความคืบหน้า', 100.00, 0.00, '2026-08-24', '2026-08-24 12:02:47');

-- --------------------------------------------------------

--
-- Table structure for table `project_satisfaction_responses`
--

CREATE TABLE `project_satisfaction_responses` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `is_satisfied` tinyint(1) NOT NULL,
  `comment` text,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_import_batches`
--

CREATE TABLE `report_import_batches` (
  `id` bigint NOT NULL,
  `academic_year` int NOT NULL,
  `source_type` enum('budget_plan','project_index') NOT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `imported_by` bigint DEFAULT NULL,
  `status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
  `error_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `report_import_batches`
--

INSERT INTO `report_import_batches` (`id`, `academic_year`, `source_type`, `original_filename`, `imported_by`, `status`, `error_message`, `created_at`) VALUES
(1, 2568, 'project_index', '2. สารบัญสรุปโครงการคณะพยาบาลศาสตร์.csv', NULL, 'success', NULL, '2026-07-01 10:03:41'),
(2, 2566, 'budget_plan', 'สรุปงบแผนคณะพยาบาลศาสตร์ ปี 2566.csv', NULL, 'success', NULL, '2026-07-01 10:03:41'),
(3, 2567, 'budget_plan', 'สรุปงบแผนคณะพยาบาลศาสตร์ ปี 2567 (21.08.68) ฉบับทาง.csv', NULL, 'success', NULL, '2026-07-01 10:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `research_journals`
--

CREATE TABLE `research_journals` (
  `journal_id` bigint NOT NULL,
  `journal_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `database_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_publications`
--

CREATE TABLE `research_publications` (
  `publication_id` bigint NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_id` bigint DEFAULT NULL,
  `publication_date` date NOT NULL,
  `publication_type` enum('research','academic','textbook') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'research',
  `database_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','verified') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint DEFAULT NULL,
  `verified_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_publication_authors`
--

CREATE TABLE `research_publication_authors` (
  `publication_author_id` bigint NOT NULL,
  `publication_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `author_order` int DEFAULT NULL,
  `author_role` enum('first_author','corresponding','co_author') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'co_author'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `schedule_tasks`
--

CREATE TABLE `schedule_tasks` (
  `task_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `description` text,
  `due_date` date NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','overdue') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedule_tasks`
--

INSERT INTO `schedule_tasks` (`task_id`, `student_id`, `task_name`, `description`, `due_date`, `priority`, `status`, `created_at`) VALUES
(1, 6603400001, 'อาาาาาา', 'อาอาาอาาาาาาาาาาาาาา', '2026-07-15', 'medium', 'pending', '2026-07-10 09:37:56');

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` json DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`version`, `name`, `notes`, `applied_at`) VALUES
('202608110001', 'faculty_user_id_and_transfer_request', '[\"Added faculty.user_id\", \"Backfilled faculty.user_id from users.username\", \"Added index idx_faculty_user_id\", \"Added FK fk_faculty_user\", \"Created advisor_transfer_request\", \"Added FK fk_transfer_student\", \"Added FK fk_transfer_from_advisor\", \"Added FK fk_transfer_to_advisor\", \"Added FK fk_transfer_created_by\", \"Added FK fk_transfer_reviewed_by\"]', '2026-08-11 09:15:24'),
('202608110002', 'core_foreign_keys_and_project_backfill', '[\"Added index idx_users_role_id\", \"Skipped index idx_student_user_id: missing student.user_id\", \"Added index idx_student_program_id\", \"Added index idx_subject_program_id\", \"Added index idx_enrollment_student_id\", \"Added index idx_enrollment_subject_id\", \"Added index idx_project_responsible_faculty_id\", \"Added index idx_project_documents_uploaded_by\", \"Backfilled project_documents.project_id by exact project name matches\", \"Added FK fk_users_role\", \"Skipped FK fk_student_user: incompatible or missing column types\", \"Added FK fk_student_program\", \"Skipped FK fk_subject_program: incompatible or missing column types\", \"Added FK fk_enrollment_student\", \"Skipped FK fk_enrollment_subject: incompatible or missing column types\", \"Added FK fk_project_responsible_faculty\", \"Added FK fk_project_documents_uploaded_by\"]', '2026-08-11 09:15:25'),
('202608110003', 'student_user_id', '[\"Added student.user_id\", \"Backfilled student.user_id from users.username\", \"Added index idx_student_user_id\", \"Added FK fk_student_user\"]', '2026-08-11 09:16:19'),
('202608110004', 'subject_enrollment_foreign_keys', '[\"Added FK fk_subject_program\", \"Added FK fk_enrollment_subject\"]', '2026-08-11 10:05:34'),
('202608140005', 'curriculum_documents', '[\"Created curriculum_documents\", \"Added FK fk_curriculum_documents_framework\", \"Skipped FK fk_curriculum_documents_created_by: incompatible or missing column types\", \"Backfilled 1 curriculum documents from mapping_json\"]', '2026-08-14 15:49:52'),
('202608140006', 'curriculum_documents_created_by_fk', '[\"Aligned curriculum_documents.created_by with users.user_id type\", \"Added FK fk_curriculum_documents_created_by\"]', '2026-08-14 15:50:48');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `program_id` int DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `first_name_th` varchar(100) DEFAULT NULL,
  `last_name_th` varchar(100) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL COMMENT 'ชื่อเล่น',
  `gender` varchar(20) DEFAULT NULL,
  `year_level` tinyint DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `hometown_province` varchar(100) DEFAULT NULL COMMENT 'ภูมิลำเนา จังหวัด',
  `height` decimal(5,2) DEFAULT NULL COMMENT 'ส่วนสูง (ซม.) ตอนแรกเข้า',
  `weight` decimal(5,2) DEFAULT NULL COMMENT 'น้ำหนัก (กก.) ตอนแรกเข้า',
  `bmi` decimal(5,2) DEFAULT NULL COMMENT 'ดัชนีมวลกาย (BMI) ตอนแรกเข้า',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('Active','Graduted','Dropout','Retired') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'Active',
  `home_phone` varchar(20) DEFAULT NULL COMMENT 'โทรศัพท์บ้าน',
  `home_address` text COMMENT 'ที่อยู่ตามทะเบียนบ้าน',
  `graduation_date` date DEFAULT NULL,
  `dropout_date` date DEFAULT NULL,
  `dropout_reason` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `admission_year` int NOT NULL DEFAULT '2567',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_eval_date` timestamp NULL DEFAULT NULL COMMENT 'วันที่ประเมินล่าสุด',
  `father_first_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อบิดา',
  `father_last_name` varchar(100) DEFAULT NULL COMMENT 'นามสกุลบิดา',
  `father_age` tinyint UNSIGNED DEFAULT NULL COMMENT 'อายุบิดา',
  `father_phone` varchar(20) DEFAULT NULL COMMENT 'โทรศัพท์มือถือบิดา',
  `father_address` text COMMENT 'ที่อยู่ปัจจุบันบิดา',
  `mother_first_name` varchar(100) DEFAULT NULL COMMENT 'ชื่อมารดา',
  `mother_last_name` varchar(100) DEFAULT NULL COMMENT 'นามสกุลมารดา',
  `mother_age` tinyint UNSIGNED DEFAULT NULL COMMENT 'อายุมารดา',
  `mother_phone` varchar(20) DEFAULT NULL COMMENT 'โทรศัพท์มือถือมารดา',
  `mother_address` text COMMENT 'ที่อยู่ปัจจุบันมารดา',
  `advisor_status` varchar(20) DEFAULT 'ปกติ',
  `advisor_status_details` text,
  `advisor_is_employed` tinyint(1) DEFAULT '0',
  `license_first_attempt_passed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'ผ่านสอบใบประกอบวิชาชีพครั้งแรก',
  `license_first_attempt_passed_at` datetime DEFAULT NULL COMMENT 'วันที่บันทึกว่าผ่านสอบใบประกอบวิชาชีพครั้งแรก',
  `license_first_attempt_evidence_path` varchar(255) DEFAULT NULL COMMENT 'ไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพครั้งแรก',
  `license_first_attempt_evidence_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพครั้งแรก',
  `license_within_one_year_passed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'ผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี',
  `license_within_one_year_passed_at` datetime DEFAULT NULL COMMENT 'วันที่บันทึกว่าผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี',
  `license_within_one_year_evidence_path` varchar(255) DEFAULT NULL COMMENT 'ไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี',
  `license_within_one_year_evidence_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อไฟล์หลักฐานผ่านสอบใบประกอบวิชาชีพภายใน 1 ปี'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `student_id`, `user_id`, `program_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `nickname`, `gender`, `year_level`, `gpa`, `birth_date`, `hometown_province`, `height`, `weight`, `bmi`, `email`, `phone`, `status`, `home_phone`, `home_address`, `graduation_date`, `dropout_date`, `dropout_reason`, `description`, `created_at`, `admission_year`, `updated_at`, `last_eval_date`, `father_first_name`, `father_last_name`, `father_age`, `father_phone`, `father_address`, `mother_first_name`, `mother_last_name`, `mother_age`, `mother_phone`, `mother_address`, `advisor_status`, `advisor_status_details`, `advisor_is_employed`) VALUES
(1, 6603400001, 1, NULL, 'นางสาว', 'ญาณันธร', 'โอนอิง', 'asdfg', 'hjkl', NULL, 'หญิง', 4, 1.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-10-11 15:38:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'จบการศึกษา', 'kkk', 1),
(3, 6603400002, NULL, NULL, 'นางสาว', 'จุรีพร', 'ผลพรต', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Graduted', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-07-11 20:20:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(5, 6603400004, NULL, NULL, 'นางสาว', 'ศิริพรรณ', 'ทองอ่อน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Retired', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-07-11 20:20:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(6, 6603400005, NULL, NULL, 'นางสาว', 'ตะวัน', 'รีฮุง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(7, 6603400006, NULL, NULL, 'นางสาว', 'บัณฑิตา', 'ยุดา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(8, 6603400007, NULL, NULL, 'นางสาว', 'ประภาภรณ์', 'จงเจริญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(9, 6603400008, NULL, NULL, 'นางสาว', 'ปวีณา', 'ม่วงชุ่ม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(10, 6603400009, NULL, NULL, 'นางสาว', 'ศินาภรณ์', 'ทองเชิด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(11, 6603400010, NULL, NULL, 'นางสาว', 'กฤตพร', 'รุณรังษี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(14, 6603400011, NULL, NULL, 'ว่าที่ร้อยตรีหญิง', 'ปวีณา', 'เย็นขาว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(15, 6603400012, NULL, NULL, 'นางสาว', 'ศรุตา', 'พันธ์ครู', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(16, 6603400013, NULL, NULL, 'นางสาว', 'ภัคธีมา', 'โลหิตานนท์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(17, 6603400014, NULL, NULL, 'นาย', 'พิพัฒน์', 'คุโนภาต', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(22, 6603400015, NULL, NULL, 'นางสาว', 'ณัฐชา', 'พิณราช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(23, 6603400016, NULL, NULL, 'นาย', 'ณัฐสิทธิ์', 'ปัญญาอุทัย', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(24, 6603400017, NULL, NULL, 'นางสาว', 'จิราวัช', 'พระนา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(25, 6603400018, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'เรืองเดช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(27, 6603400019, NULL, NULL, 'นางสาว', 'ฐานวดี', 'ปุนมาปัด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(28, 6603400020, NULL, NULL, 'นางสาว', 'สุธาสินี', 'สาธุชาติ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(29, 6603400021, NULL, NULL, 'นางสาว', 'ณัฐนันท์', 'ศรีม่วง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(31, 6603400022, NULL, NULL, 'นางสาว', 'โยษิตา', 'จิตรีชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(32, 6603400023, NULL, NULL, 'นางสาว', 'กมลทิพย์', 'อาลัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(34, 6603400024, NULL, NULL, 'นาย', 'มารุต', 'กรุณา', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(35, 6603400025, NULL, NULL, 'นางสาว', 'ณรินทร์ดา', 'วงค์บุญมา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(36, 6603400026, NULL, NULL, 'นางสาว', 'วรัญญา', 'บุญเชิญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(38, 6603400027, NULL, NULL, 'นางสาว', 'กุสุมา', 'สมแวง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(39, 6603400028, NULL, NULL, 'นางสาว', 'จิรฐา', 'พิทักษา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(41, 6603400029, NULL, NULL, 'นางสาว', 'วิลาลักษณ์', 'กล่อมใจ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(42, 6603400030, NULL, NULL, 'นาย', 'นพเกล้า', 'นพพันธ์ศิริ', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(43, 6603400031, NULL, NULL, 'นาย', 'ทัศนา', 'ขันตรี', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(44, 6603400032, NULL, NULL, 'นางสาว', 'สุนันญา', 'มะโนเเสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(45, 6603400033, NULL, NULL, 'นางสาว', 'ศศิวิมล', 'เพ็งอุดม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(46, 6603400034, NULL, NULL, 'นางสาว', 'ณัชชา', 'คุ้มคงกระจ่าง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(48, 6603400035, NULL, NULL, 'นางสาว', 'สุปรียา', 'ศรีละบุตร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(49, 6603400036, NULL, NULL, 'นางสาว', 'ศุภิกา', 'สว่างภพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(55, 6603400037, NULL, NULL, 'นางสาว', 'อรอมล', 'คุณสมบัติ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(66, 6603400038, NULL, NULL, 'นางสาว', 'ปรียานุช', 'ผ่านละคร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(67, 6603400039, NULL, NULL, 'นางสาว', 'ปาริสชา', 'ดอกพุดตาน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(70, 6603400040, NULL, NULL, 'นางสาว', 'นภัสนันท์', 'ดีประชีพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(71, 6603400041, NULL, NULL, 'นางสาว', 'ชลดา', 'อุคำ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(72, 6603400042, NULL, NULL, 'นางสาว', 'อริสา', 'บุญแยง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(73, 6603400044, NULL, NULL, 'นางสาว', 'เพ็ญพิชชา', 'รามศิริ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(78, 6603400046, NULL, NULL, 'นางสาว', 'นริศรา', 'ไทยอุดม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(85, 6603400047, NULL, NULL, 'นาย', 'รัชวัฒน์', 'สุรภีร์', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(86, 6603400048, NULL, NULL, 'นางสาว', 'ขนิษฐา', 'มุธุสิทธิ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(87, 6603400049, NULL, NULL, 'นางสาว', 'วนิชชา', 'นาสานนิวัฒน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(88, 6603400050, NULL, NULL, 'นางสาว', 'ดวงหทัย', 'บัวกล้า', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(89, 6603400051, NULL, NULL, 'นางสาว', 'ปาริชาต', 'เชื้อตาอ่อน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(90, 6603400052, NULL, NULL, 'นางสาว', 'จิราวรรณ', 'พุก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(92, 6603400053, NULL, NULL, 'นางสาว', 'อรนุช', 'เลี่ยนเพชร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(93, 6603400054, NULL, NULL, 'นางสาว', 'วราภรณ์', 'พุ่มแย้ม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(94, 6603400055, NULL, NULL, 'นางสาว', 'ธิดาพร', 'พิกุลทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(95, 6603400056, NULL, NULL, 'นางสาว', 'ณัฐพร', 'พุ่มไสว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(97, 6603400057, NULL, NULL, 'นางสาว', 'ศุภัชญา', 'โพธิ์ทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(98, 6603400058, NULL, NULL, 'นางสาว', 'สุกัญญา', 'ช่องงาม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(104, 6603400061, NULL, NULL, 'นางสาว', 'วิภาดา', 'คิดดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(105, 6603400062, NULL, NULL, 'นาย', 'ธนากร', 'โฆษิวากาญจน์', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(107, 6603400063, NULL, NULL, 'นางสาว', 'ชุติมา', 'หาทรัพย์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(108, 6603400064, NULL, NULL, 'นางสาว', 'ฐิติรัตน์', 'เหล่าสูง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(109, 6603400065, NULL, NULL, 'นางสาว', 'ฌานิศา', 'บุญพุฒ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(110, 6603400066, NULL, NULL, 'นางสาว', 'สิริญญา', 'คำชั่ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(2, 6603400067, NULL, NULL, 'นางสาว', 'ดวงรัตน์', 'ครุฑธา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(4, 6603400068, NULL, NULL, 'นางสาว', 'ณฐินี', 'สายจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(12, 6603400069, NULL, NULL, 'นางสาว', 'กัญชพร', 'สายแปง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(13, 6603400070, NULL, NULL, 'นางสาว', 'นฤมล', 'อ่อนทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(18, 6603400071, NULL, NULL, 'นางสาว', 'นฤมล', 'ทำลา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(19, 6603400072, NULL, NULL, 'นางสาว', 'สุชญา', 'ทองเนื้อแปด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(20, 6603400073, NULL, NULL, 'นางสาว', 'ศิรประภา', 'เมาตะยา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(21, 6603400074, NULL, NULL, 'นางสาว', 'พลอยชมพู', 'สุยังกูล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(26, 6603400075, NULL, NULL, 'นาย', 'จตุรวิทย์', 'สาแก้ว', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(30, 6603400076, NULL, NULL, 'นางสาว', 'พิลาสินี', 'จิตต์อุทัศน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(33, 6603400077, NULL, NULL, 'นางสาว', 'ธัญณิชา', 'ท่วมไธสง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(37, 6603400078, NULL, NULL, 'นางสาว', 'พิยดา', 'ม่วงสุข', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(40, 6603400079, NULL, NULL, 'นางสาว', 'น้ำมนต์', 'พงษ์บุบผา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(47, 6603400080, NULL, NULL, 'นางสาว', 'ณัฏฐณิชา', 'ภูมิกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(50, 6603400081, NULL, NULL, 'นางสาว', 'เพ็ญนภา', 'ชฎาแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(51, 6603400082, NULL, NULL, 'นางสาว', 'ณิชาพัฒน์', 'จำบุญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(52, 6603400083, NULL, NULL, 'นางสาว', 'ศุกลภัทร', 'สุพรรณ์คำ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(53, 6603400084, NULL, NULL, 'นาย', 'ศตพล', 'เกษแก้ว', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(54, 6603400085, NULL, NULL, 'นางสาว', 'ดวงพร', 'อาศัยนา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(56, 6603400086, NULL, NULL, 'นางสาว', 'ญาณิน', 'ทินกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(57, 6603400087, NULL, NULL, 'นางสาว', 'ปพิชญา', 'พัวอุดมจินดากุล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(58, 6603400088, NULL, NULL, 'นางสาว', 'สาธิตา', 'ปลอดโปร่ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(59, 6603400090, NULL, NULL, 'นางสาว', 'ภัททิยา', 'บงภูเขียว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(60, 6603400091, NULL, NULL, 'นางสาว', 'ภัทรานิษฐ์', 'แก้ววิชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(61, 6603400092, NULL, NULL, 'นางสาว', 'ไปรยา', 'แสนแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(62, 6603400093, NULL, NULL, 'นางสาว', 'อนุธิดา', 'คำบุตรดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(63, 6603400094, NULL, NULL, 'นางสาว', 'ปาลิดา', 'กล่อมฤกษ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(64, 6603400095, NULL, NULL, 'นางสาว', 'วรรณพร', 'อะโนมา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(65, 6603400096, NULL, NULL, 'นางสาว', 'สุธาสินี', 'โคกวิไล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(68, 6603400097, NULL, NULL, 'นางสาว', 'อรวรรณ', 'พาบุ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(69, 6603400098, NULL, NULL, 'นางสาว', 'สิริพรรณ', 'บุญช่วย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(74, 6603400099, NULL, NULL, 'นางสาว', 'กฤตยา', 'ปะสาวะเท', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(75, 6603400100, NULL, NULL, 'นางสาว', 'นฤมล', 'สรรพโภชน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(76, 6603400102, NULL, NULL, 'นางสาว', 'วรัญญา', 'มีประเสริฐ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(77, 6603400104, NULL, NULL, 'นางสาว', 'นันทน์ณัฏฐ์', 'แซ่โซ้ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(79, 6603400105, NULL, NULL, 'นางสาว', 'รวิมล', 'ดวงคำจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(80, 6603400106, NULL, NULL, 'นางสาว', 'กาญจนา', 'ทะวาแสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(81, 6603400107, NULL, NULL, 'นางสาว', 'จิรวรรณ', 'พลชู', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(82, 6603400108, NULL, NULL, 'นางสาว', 'นภสร', 'อินภูวา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(83, 6603400109, NULL, NULL, 'นางสาว', 'รุ่งนภา', 'ถวิลเดช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(84, 6603400110, NULL, NULL, 'นางสาว', 'วรัทยา', 'คำน้อย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(91, 6603400111, NULL, NULL, 'นางสาว', 'สุกัญญา', 'พรประไพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(96, 6603400112, NULL, NULL, 'นางสาว', 'โชษิตา', 'แม้นอินทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(99, 6603400113, NULL, NULL, 'นางสาว', 'สุภัชชา', 'งามเลิศ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(100, 6603400114, NULL, NULL, 'นางสาว', 'นฤมล', 'ขอดทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(101, 6603400115, NULL, NULL, 'นางสาว', 'พรพิมล', 'สังสีราช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(102, 6603400116, NULL, NULL, 'นางสาว', 'เปรมิกา', 'โพธิ์ชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(103, 6603400117, NULL, NULL, 'นางสาว', 'นิลุบล', 'นนท์ลุ่น', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(106, 6603400118, NULL, NULL, 'นางสาว', 'นภารัตน์', 'ปุรัมภะ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(111, 6603400119, NULL, NULL, 'นางสาว', 'ธีมาพร', 'สุนทร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(112, 6603400120, NULL, NULL, 'นางสาว', 'ณัฐชา', 'ภูสีดวง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(113, 6603400121, NULL, NULL, 'นางสาว', 'ปวริศา', 'บุตรตะวงค์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(114, 6603400122, NULL, NULL, 'นางสาว', 'นฤมล', 'ขุนภักดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(115, 6603400123, NULL, NULL, 'นางสาว', 'กัญญาณัฐ', 'อินต๊ะสาร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(116, 6603400124, NULL, NULL, 'นางสาว', 'จิดาภา', 'ไชยสาร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(117, 6603400125, NULL, NULL, 'นางสาว', 'จิดาภา', 'เชื้อทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(118, 6603400126, NULL, NULL, 'นางสาว', 'นิภาวรรณ', 'สืบทายาท', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(119, 6603400127, NULL, NULL, 'นางสาว', 'นริศรา', 'จวงกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(120, 6603400128, NULL, NULL, 'นาย', 'ภาธร', 'ธงศรี', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(121, 6603400129, NULL, NULL, 'นาย', 'ประภวิษณุ์', 'พรหมบุตร', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(122, 6603400130, NULL, NULL, 'นางสาว', 'ดวงแข', 'สลับแสง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(123, 6603400132, NULL, NULL, 'นางสาว', 'ศิริญญา', 'สุภาพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(124, 6603400133, NULL, NULL, 'นางสาว', 'ภคมน', 'เชื้อคำเพ็ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(125, 6603400134, NULL, NULL, 'นางสาว', 'กรนันท์', 'นันทเสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(126, 6603400135, NULL, NULL, 'นางสาว', 'ปรีณาพรรณ', 'ภานุวัฒนวงศ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(127, 6603400136, NULL, NULL, 'นางสาว', 'หทัยรัตน์', 'ชุมจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(128, 6603400137, NULL, NULL, 'นางสาว', 'ชมพูนุช', 'ลาพรม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(129, 6603400138, NULL, NULL, 'นางสาว', 'ฐิติณัชชา', 'ลาดแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(130, 6603400139, NULL, NULL, 'นางสาว', 'โสภิตา', 'แสวงกิจ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(131, 6603400140, NULL, NULL, 'นางสาว', 'ศรีวิกา', 'โรจน์เจริญชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0),
(133, 6604800008, NULL, NULL, 'นางสาว', 'เทส', 'ระบบ', 'test', 'rabop', NULL, 'หญิง', 1, 3.50, '1999-04-04', NULL, NULL, NULL, NULL, 'test@gmail.com', NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-24 16:21:29', 2567, '2026-09-26 06:51:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ปกติ', NULL, 0);

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

--
-- Dumping data for table `student_advisor_mapping`
--

INSERT INTO `student_advisor_mapping` (`mapping_id`, `student_id`, `faculty_id`, `advisor_type`, `academic_year`) VALUES
(108, 6603400001, 44172033, 'advisor', 2569),
(109, 6603400002, 44172033, 'advisor', 2569),
(110, 6603400004, 44172033, 'advisor', 2569),
(111, 6603400005, 44172033, 'advisor', 2569),
(112, 6603400006, 44172033, 'advisor', 2569),
(113, 6603400007, 44172033, 'advisor', 2569),
(114, 6603400008, 44172033, 'advisor', 2569),
(115, 6603400009, 44172033, 'advisor', 2569),
(116, 6603400010, 44172033, 'advisor', 2569),
(117, 6603400011, 44172033, 'advisor', 2569),
(118, 6603400012, 44172033, 'advisor', 2569),
(119, 6604800008, 44172033, 'advisor', 2569),
(120, 6603400001, 44172033, 'practical', 2569),
(121, 6603400002, 44172033, 'practical', 2569),
(122, 6603400004, 44172033, 'practical', 2569),
(123, 6603400005, 44172033, 'practical', 2569),
(124, 6603400006, 44172033, 'practical', 2569);

-- --------------------------------------------------------

--
-- Table structure for table `student_clo_results`
--

CREATE TABLE `student_clo_results` (
  `result_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` int NOT NULL,
  `clo_id` int NOT NULL,
  `academic_year` int NOT NULL,
  `semester` tinyint NOT NULL,
  `score_percent` decimal(5,2) DEFAULT NULL,
  `pass_status` tinyint(1) DEFAULT NULL,
  `assessed_by` bigint DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `student_clo_sub_scores`
--

CREATE TABLE `student_clo_sub_scores` (
  `id` bigint NOT NULL,
  `subject_id` int NOT NULL,
  `student_id` bigint NOT NULL,
  `clo_id` int NOT NULL,
  `sub_plo_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_clo_sub_scores`
--

INSERT INTO `student_clo_sub_scores` (`id`, `subject_id`, `student_id`, `clo_id`, `sub_plo_code`, `score`, `updated_by`, `updated_at`) VALUES
(8, 1, 6603400001, 12, '1.1', 40.00, 12, '2026-10-11 15:16:40'),
(9, 1, 6603400001, 12, '2.1', 99.00, 12, '2026-08-25 01:34:51'),
(10, 1, 6603400001, 13, '1.2', 100.00, 12, '2026-08-25 01:35:01'),
(11, 1, 6603400001, 13, '1.3', 100.00, 12, '2026-08-25 01:35:01'),
(12, 1, 6603400001, 14, '2.2', 100.00, 12, '2026-08-25 01:35:14'),
(13, 1, 6603400001, 14, '2.3', 100.00, 12, '2026-08-25 01:35:14'),
(14, 1, 6603400002, 12, '1.1', NULL, 12, '2026-10-11 15:16:40'),
(15, 1, 6603400002, 12, '2.1', 60.00, 12, '2026-08-25 01:50:16'),
(16, 1, 6603400002, 13, '1.2', 50.00, 12, '2026-08-25 01:50:16'),
(17, 1, 6603400002, 13, '1.3', 90.00, 12, '2026-08-25 01:50:16'),
(18, 1, 6603400004, 12, '1.1', NULL, 12, '2026-10-11 15:16:40'),
(19, 1, 6603400004, 12, '2.1', 100.00, 12, '2026-08-25 01:50:16'),
(20, 1, 6603400001, 15, '1.1', 100.00, 12, '2026-08-27 01:51:03'),
(21, 1, 6603400001, 15, '1.2', 100.00, 12, '2026-08-27 01:51:03'),
(22, 1, 6603400001, 15, '2.1', 100.00, 12, '2026-08-27 01:51:03'),
(23, 1, 6603400001, 16, '1.3', 100.00, 12, '2026-08-27 01:51:03'),
(24, 1, 6603400001, 16, '2.3', 100.00, 12, '2026-08-27 01:51:03'),
(25, 1, 6603400001, 17, '2.2', 100.00, 12, '2026-08-27 01:51:03'),
(26, 1, 6603400002, 15, '1.1', 98.00, 12, '2026-08-27 01:51:03'),
(27, 1, 6603400002, 15, '1.2', 80.00, 12, '2026-08-27 01:51:03'),
(28, 1, 6603400002, 15, '2.1', 78.00, 12, '2026-08-27 01:51:03'),
(29, 1, 6603400002, 16, '1.3', 88.00, 12, '2026-08-27 01:51:03'),
(30, 1, 6603400002, 16, '2.3', 78.00, 12, '2026-08-27 01:51:03'),
(31, 1, 6603400002, 17, '2.2', 99.00, 12, '2026-08-27 01:51:03'),
(32, 1, 6603400004, 15, '1.1', 50.00, 12, '2026-09-02 00:42:02'),
(33, 1, 6603400004, 15, '1.2', 50.00, 12, '2026-09-02 00:42:02'),
(34, 1, 6603400004, 15, '2.1', 50.00, 12, '2026-09-02 00:42:02'),
(35, 1, 6603400004, 16, '1.3', 50.00, 12, '2026-09-02 00:42:16'),
(36, 1, 6603400004, 16, '2.3', 50.00, 12, '2026-09-02 00:42:16'),
(37, 1, 6603400004, 17, '2.2', 50.00, 12, '2026-09-02 00:42:16'),
(38, 1, 6603400001, 5, '1.1', 60.00, 12, '2026-09-28 07:20:36'),
(39, 1, 6603400001, 5, '2.1', 60.00, 12, '2026-09-28 07:20:36'),
(40, 1, 6603400001, 7, '1.1', 60.00, 12, '2026-09-28 07:20:36'),
(41, 1, 6603400001, 9, '1.1', 60.00, 12, '2026-09-28 07:20:36'),
(42, 1, 6603400001, 9, '2.1', 60.00, 12, '2026-09-28 07:08:29'),
(43, 1, 6603400001, 9, '3.1', 60.00, 12, '2026-09-28 07:20:36'),
(44, 1, 6603400001, 1, '1.1', 60.00, 12, '2026-09-28 07:19:10'),
(45, 1, 6603400001, 2, '2.1', 60.00, 12, '2026-09-28 07:20:36'),
(46, 1, 6603400001, 8, '1.1', 60.00, 12, '2026-09-28 07:20:36'),
(47, 1, 6603400001, 8, '1.2', 60.00, 12, '2026-09-28 07:20:36'),
(48, 1, 6603400001, 8, '1.3', 60.00, 12, '2026-09-28 07:20:36'),
(49, 1, 6603400001, 8, '3.1', 60.00, 12, '2026-09-28 07:20:36'),
(50, 1, 6603400001, 8, '3.2', 60.00, 12, '2026-09-28 07:20:36'),
(65, 1, 6603400001, 12, '1.2', 35.00, 12, '2026-10-11 15:16:40'),
(67, 1, 6603400002, 12, '1.2', NULL, 12, '2026-10-11 15:16:40'),
(69, 1, 6603400004, 12, '1.2', NULL, 12, '2026-10-11 15:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `student_competency_assessments`
--

CREATE TABLE `student_competency_assessments` (
  `id` bigint UNSIGNED NOT NULL,
  `student_id` bigint NOT NULL,
  `competency_item_id` int UNSIGNED NOT NULL,
  `score` tinyint UNSIGNED NOT NULL COMMENT 'คะแนน 1-5 ที่อาจารย์ติก',
  `assessed_by` bigint NOT NULL COMMENT 'อาจารย์ที่ปรึกษา/ผู้ประเมิน',
  `academic_year` int NOT NULL COMMENT 'ปีการศึกษาที่ประเมิน',
  `assessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student_competency_assessments`
--

INSERT INTO `student_competency_assessments` (`id`, `student_id`, `competency_item_id`, `score`, `assessed_by`, `academic_year`, `assessed_at`) VALUES
(5, 6603400001, 61, 3, 44172033, 2569, '2026-09-28 08:07:19'),
(6, 6603400001, 62, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(7, 6603400001, 63, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(8, 6603400001, 64, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(9, 6603400001, 65, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(10, 6603400001, 66, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(11, 6603400001, 67, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(12, 6603400001, 68, 1, 44172033, 2569, '2026-09-28 08:07:19'),
(41, 6604800008, 61, 4, 44172033, 2569, '2026-09-26 05:43:41'),
(42, 6604800008, 62, 4, 44172033, 2569, '2026-09-26 05:43:41'),
(43, 6604800008, 63, 3, 44172033, 2569, '2026-09-26 05:43:41'),
(44, 6604800008, 64, 3, 44172033, 2569, '2026-09-26 05:43:41'),
(45, 6604800008, 65, 2, 44172033, 2569, '2026-09-26 05:43:41'),
(46, 6604800008, 66, 2, 44172033, 2569, '2026-09-26 05:43:41'),
(47, 6604800008, 67, 1, 44172033, 2569, '2026-09-26 05:43:41'),
(48, 6604800008, 68, 1, 44172033, 2569, '2026-09-26 05:43:41'),
(112, 6603400001, 180, 5, 44172033, 2569, '2026-09-28 08:07:19');

-- --------------------------------------------------------

--
-- Table structure for table `student_course_registrations`
--

CREATE TABLE `student_course_registrations` (
  `id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `academic_year` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_count` int NOT NULL DEFAULT '1',
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_health_records`
--

CREATE TABLE `student_health_records` (
  `id` bigint UNSIGNED NOT NULL,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสนักศึกษา',
  `year_level` tinyint NOT NULL COMMENT 'ชั้นปีที่บันทึก (1, 2, 3, 4)',
  `academic_year` int NOT NULL COMMENT 'ปีการศึกษา พ.ศ.',
  `height` decimal(5,2) DEFAULT NULL COMMENT 'ส่วนสูง',
  `weight` decimal(5,2) DEFAULT NULL COMMENT 'น้ำหนัก',
  `bmi` decimal(4,2) DEFAULT NULL COMMENT 'ดัชนีมวลกาย',
  `overall_status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'สถานะสุขภาพโดยรวม',
  `health_issue_detail` text COLLATE utf8mb4_unicode_ci COMMENT 'รายละเอียดปัญหาสุขภาพกรณีระบุ',
  `hospitalization_history` json DEFAULT NULL COMMENT 'ประวัติการรับการรักษาใน รพ. (ครั้งที่, วันที่, ข้อมูลการรักษา, ผลกระทบต่อการฝึกปฏิบัติ)',
  `recorded_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ผู้บันทึกข้อมูล',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_health_records`
--

INSERT INTO `student_health_records` (`id`, `student_id`, `year_level`, `academic_year`, `height`, `weight`, `bmi`, `overall_status`, `health_issue_detail`, `hospitalization_history`, `recorded_by`, `updated_at`) VALUES
(1, '6603400001', 1, 2567, 160.00, 56.00, 21.88, 'healthy', NULL, NULL, NULL, '2026-09-25 19:07:32'),
(2, '6603400001', 2, 2568, 160.00, 42.00, 16.41, 'has_health_issue', 'เป็นโรคกระเพาะ', NULL, NULL, '2026-09-25 19:34:28'),
(3, '6603400001', 3, 2569, 160.00, 50.00, 19.53, 'healthy', NULL, NULL, NULL, '2026-09-26 15:51:20'),
(4, '6603400001', 4, 2570, NULL, NULL, NULL, 'healthy', NULL, NULL, NULL, '2026-09-25 19:07:32');

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
-- Table structure for table `student_performance`
--

CREATE TABLE `student_performance` (
  `eval_id` bigint NOT NULL COMMENT 'รหัสการประเมิน',
  `student_id` int NOT NULL COMMENT 'รหัสนักศึกษา (เชื่อมตาราง student)',
  `faculty_id` int NOT NULL COMMENT 'รหัสอาจารย์ผู้ประเมิน',
  `academic_year` int NOT NULL COMMENT 'ปีการศึกษา',
  `semester` tinyint NOT NULL COMMENT 'ภาคการศึกษา',
  `scores_json` json NOT NULL COMMENT 'เก็บคะแนนย่อย เช่น skill, attitude, knowledge',
  `overall_score` decimal(3,2) NOT NULL COMMENT 'คะแนนเฉลี่ยรวม (เต็ม 5)',
  `evidence_path` varchar(255) DEFAULT NULL COMMENT 'พาร์ทไฟล์รูปภาพหลักฐานการปฏิบัติงาน',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่ประเมิน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ตารางเก็บประวัติการประเมินสมรรถนะนักศึกษา';

-- --------------------------------------------------------

--
-- Table structure for table `student_project_outcome_results`
--

CREATE TABLE `student_project_outcome_results` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `project_outcome_link_id` bigint NOT NULL,
  `score_percent` decimal(5,2) DEFAULT NULL,
  `pass_status` tinyint(1) DEFAULT NULL,
  `assessed_by` bigint DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_term_grades`
--

CREATE TABLE `student_term_grades` (
  `id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `academic_year` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_vaccinations`
--

CREATE TABLE `student_vaccinations` (
  `id` int UNSIGNED NOT NULL,
  `student_id` bigint NOT NULL,
  `sequence_no` tinyint UNSIGNED NOT NULL COMMENT 'ลำดับ',
  `vaccine_name` varchar(255) NOT NULL COMMENT 'วัคซีนคุ้มกันโรค (พิมพ์อิสระ เปลี่ยนแปลงได้)',
  `dose_no` tinyint UNSIGNED DEFAULT NULL COMMENT 'เข็มที่/ปีที่ N — ถ้าวัคซีนตัวเดียวกันมีหลายเข็ม ให้เพิ่มหลายแถว',
  `immunity_status` varchar(100) DEFAULT NULL COMMENT 'สถานะภูมิคุ้มกัน เช่น มีภูมิคุ้มกันโรค / ไม่มีภูมิ-เคยติดเชื้อ (พิมพ์อิสระ เพราะแต่ละโรคมีตัวเลือกไม่เหมือนกัน)',
  `received_date` date DEFAULT NULL COMMENT 'วัน เดือน ปี ที่ได้รับวัคซีน (กรณีไม่มีภูมิ ปล่อยว่างได้)',
  `evidence_attached` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'แนบหลักฐานแล้วหรือยัง',
  `evidence_file_path` varchar(255) DEFAULT NULL COMMENT 'ที่อยู่ไฟล์หลักฐาน',
  `advisor_id` bigint DEFAULT NULL COMMENT 'อาจารย์ที่ปรึกษาผู้ลงชื่อรับรอง',
  `signed_at` timestamp NULL DEFAULT NULL,
  `remark` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student_vaccinations`
--

INSERT INTO `student_vaccinations` (`id`, `student_id`, `sequence_no`, `vaccine_name`, `dose_no`, `immunity_status`, `received_date`, `evidence_attached`, `evidence_file_path`, `advisor_id`, `signed_at`, `remark`, `created_at`) VALUES
(326, 6603400001, 1, 'วัคซีนลำดับที่ 1', 1, 'none_uninfected', '2026-09-26', 0, NULL, 44172033, '2026-09-26 08:56:33', 'เทสๆๆโหลๆ', '2026-09-26 15:56:33'),
(327, 6603400001, 2, 'วัคซีนลำดับที่ 2', 1, 'none_uninfected', '2026-09-26', 0, NULL, 44172033, '2026-09-26 08:56:33', 'qwertyuiop', '2026-09-26 15:56:33');

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
  `semester` int DEFAULT NULL,
  `academic_year` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subject_id`, `subject_code`, `subject_name_th`, `subject_name_en`, `credit`, `credit_desc`, `description`, `is_active`, `program_id`, `department`, `subject_type`, `year_level`, `semester`, `academic_year`) VALUES
(1, '103-111', 'ภาษาอังกฤษพื้นฐาน', 'English Fundamentals', 3, '3(2-2-5)', 'การอ่านข้อความที่สั้นและง่าย การฝึกใช้คำศัพท์และสำนวนพื้นฐานในการสนทนา การทำตามคำแนะนำ ความเข้าใจข้อมูลในโฆษณา โปรแกรม และโบรชัวร์ การสร้างวลีและประโยคอย่างง่ายในงานเขียน การอธิบายตนเองและชีวิตประจำวัน การเขียนข้อความสั้นๆ การโพสต์ออนไลน์ การมีส่วนร่วมอย่างแข่งขันในการถามและตอบคำถาม การมีส่วนร่วมในการสนทนาในหัวข้อที่ไม่ซับซ้อน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 1, 2568),
(2, '103-112', 'การสื่อสารภาษาอังกฤษในชีวิตประจำวัน', 'English Communication in Everyday Life', 3, '3(2-2-5)', 'การสื่อสารอย่างมั่นใจในสถานการณ์ที่กำหนดไว้ การแลกเปลี่ยนความคิดเห็น การถามและตอบคำถามในหัวข้อที่คุ้นเคย การมีส่วนร่วมในการสนทนาที่เกี่ยวข้องกับความสนใจและสาขาวิชาชีพ การอธิบายและชี้แจง การสื่อสารกับผู้อื่น เช่น การขอความช่วยเหลือ การเสนอแนะ และการปฏิบัติตามคำแนะนำ การเขียนจดหมายโต้ตอบเพื่อการสื่อสาร การใช้แพลตฟอร์มออนไลน์เพื่อการสื่อสาร', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 2, 2568),
(3, '103-113', 'ภาษาอังกฤษเพื่อการศึกษาทางวิชาการ', 'English for Academic Study', 3, '3(2-2-5)', 'การฝึกทักษะภาษาอังกฤษทั้ง 4 ด้านเพื่อการศึกษาทางวิชาการ การฟัง และตอบคำถามทางวิชาการ การนำเสนอด้วยปากเปล่า การพัฒนาความเข้าใจในการอ่านและทักษะการอ่านอย่างมีวิจารณญาณ คำศัพท์ และโครงสร้างประโยคที่ใช้ในการเขียนทางวิชาการ การเขียนย่อหน้าประเภทต่างๆ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 2, NULL),
(4, '103-114', 'ภาษาอังกฤษเพื่อการนำเสนอแบบมืออาชีพ', 'English for Professional Presentation', 3, '3(2-2-5)', 'หลักการพูด การเลือกใช้คำ ประโยค คำเชื่อมและสำนวน การพูดในสถานการณ์ต่างๆ การแสดงความคิดเห็นและการนำเสนอเชิงวิชาการ การนำเสนอทางธุรกิจ การสัมภาษณ์งาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 1, 2567),
(5, '103-121', 'ภาษาไทยเพื่อการสื่อสาร', 'Thai Language for Communication', 3, '3(2-2-5)', 'ภาษาไทยเพื่อการสื่อสารในสถานการณ์ต่างๆ หลักการใช้ภาษาสื่อสารที่ถูกต้องทั้งการรับสารและส่งสาร การจับประเด็นและการวิเคราะห์สารจากเรื่องที่ฟังหรืออ่านอย่างมีวิจารณญาณและนำเสนอความคิดผ่านการพูดการเขียนในรูปแบบที่เหมาะสมได้อย่างมีประสิทธิภาพ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(6, '103-122', 'ภาษาไทยเพื่อการนำเสนอ', 'Thai Language for Presentation', 3, '3(2-2-5)', 'การใช้ภาษาไทยนําเสนอข้อมูลในสถานการณ์ต่างๆ อาทิ การนําเสนอข้อมูลทางวิชาการ การนําเสนอข้อมูลทางธุรกิจ การแสดงความคิดเห็น วิเคราะห์และวิจารณ์ การนําเสนอข้อมูลที่มีความน่าเชื่อถือ การเลือกใช้ช่องทางการสื่อสารอย่างเหมาะสม และมีประสิทธิภาพเป็นประโยชน์ต่อการศึกษาและการทํางาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(7, '103-123', 'ภาษาไทยเพื่อผู้ประกอบการ', 'Thai Language for Entrepreneurs', 3, '3(2-2-5)', 'ภาษาไทยเพื่อการทำงานในสถานประกอบการ ทักษะการสื่อสารภาษาไทยที่มีประสิทธิภาพและจำเป็นต่อการทำงานในองค์กรทั้งการฟัง การพูด การอ่าน และการเขียน การจัดทำเอกสารการประชุมหรือเอกสารที่เกี่ยวข้องกับการทำงาน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(8, '103-131', 'ภาษาจีนเพื่อการสื่อสารในชีวิตประจำวัน', 'Chinese for Daily Communication', 3, '3(2-2-5)', 'การฝึกทักษะฟัง พูด อ่าน และเขียน วิธีการอ่านสัทอักษรการถอดเสียงพินอิน Pinyin ภาษาจีนกลางที่ถูกต้อง โครงสร้างไวยากรณ์ คำศัพท์ประมาณ 150-300 คำ และสำนวนพื้นฐานที่ใช้ในชีวิตประจำวัน บทสนทนาขั้นพื้นฐาน ได้แก่ การพูดสนทนาทักทาย การแนะนำตนเอง การนับ และการใช้ตัวเลขแสดงจำนวน การสอบถามสถานที่และตำแหน่งทิศทาง การบอกเวลา และการบอกชื่อสิ่งของ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(9, '103-141', 'ภาษาญี่ปุ่นในชีวิตประจำวัน', 'Daily Life Japanese', 3, '3(2-2-5)', 'คำศัพท์ สำนวน วัฒนธรรม และทักษะในการสื่อสาร การตั้งคำถามและการตอบอย่างสั้น บทสนทนาอย่างง่ายในระดับวลี และประโยคสั้นๆโดยเน้นหัวข้อที่สามารถประยุกต์ใช้ในชีวิตประจำวัน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(10, '103-151', 'การเขียนโค้ดคอมพิวเตอร์สำหรับทุกคน', 'Computer Coding for Everyone', 3, '3(2-2-5)', 'ความรู้พื้นฐานการเขียนโปรแกรมด้วยภาษาไพธอน เครื่องมือที่ใช้ในการเขียนโปรแกรมภาษาไพธอน ชนิดของข้อมูลและตัวแปร การรับข้อมูลเข้าและการแสดงผลลัพธ์ การใช้งานคำสั่งทางเลือก การใช้งานคำสั่งวนลูป การสร้างฟังก์ชัน การวิเคราะห์ข้อมูลและการนำเสนอข้อมูล', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(11, '103-201', 'ทักษะดิจิทัลสำหรับศตวรรษที่ 21', 'Digital Literacy for 21st Century', 3, '3(2-2-5)', 'การใช้เทคโนโลยีดิจิทัลเพื่อการสืบค้นสารสนเทศ การสื่อสาร และการรู้เท่าทันการเปลี่ยนแปลงด้านเทคโนโลยีดิจิทัล หลักการการเป็นพลเมืองดิจิทัล ความปลอดภัยด้านสารสนเทศ จริยธรรมและกฎหมายที่เกี่ยวข้อง การนำเทคโนโลยีมาใช้เพื่อการจัดการสมัยใหม่ การวิเคราะห์และสังเคราะห์สารสนเทศ การเขียนรายงาน การเลือกเครื่องมือดิจิทัลที่สอดคล้องกับการทำงานเพื่อให้เกิดประสิทธิภาพ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 1, NULL),
(12, '103-202', 'การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่องจักรเบื้องต้น', 'Introduction to Data Analytics and Machine Learning', 3, '3(2-2-5)', 'พื้นฐานของการทำงานอัตโนมัติ การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่อง เช่น การรวบรวมข้อมูล การระบุแหล่งข้อมูล การทำความสะอาดข้อมูล การวิเคราะห์ การสื่อสารข้อมูลเชิงลึกด้วยการใช้แดชบอร์ด การแสดงภาพเพื่อเพิ่มมูลค่าให้กับการตัดสินใจ การเรียนรู้ของเครื่องจักร เครื่องมือต่างๆและการประยุกต์ใช้ การอภิปรายสถานการณ์จริงของการเรียนรู้เครื่องมือหรือตัวอย่างของการใช้ปัญญาประดิษฐ์เชิงกำเนิด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 1, 2, NULL),
(13, '103-203', 'ความเป็นพลเมืองในสังคมไทยและสังคมโลก', 'Civic Literacy in Thai and Global Context', 3, '3(3-0-6)', 'สภาพการณ์ทางการเมือง เศรษฐกิจ สังคม และวัฒนธรรมของกลุ่มประเทศต่างๆ ประเด็นปัญหาร่วมสมัยในสังคมโลก ประเทศไทยในสังคมโลก ความหลากหลายทางวัฒนธรรมและกระบวนการทางความคิดที่เป็นสากล ความรับผิดชอบต่อสังคม การรู้หน้าที่ของพลเมืองและรับผิดชอบต่อสังคมในการต่อต้านการทุจริต ความสัมพันธ์ระหว่างความเป็นพลเมืองกับสถานะการพัฒนาของประเทศภายใต้กฎหมายในชีวิตประจำวันและกติกาสากลของสังคมประชาธิปไตย บทบาทและหน้าที่ของบุคคลในฐานะพลเมืองไทยและพลเมืองโลก', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(14, '103-204', 'มนุษยสัมพันธ์และการพัฒนาบุคลิกภาพ', 'Human Relations and Personality Development', 3, '3(3-0-6)', 'การสร้างความสัมพันธ์ระหว่างบุคคล การรู้จักตนเองและผู้อื่น เสริมสร้างการเห็นคุณค่าในตนเอง กำหนดเป้าหมายในการเรียนการทำงานและการมีบุคลิกภาพที่เหมาะสม สามารถทำงานร่วมกับผู้อื่นได้', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(15, '103-205', 'จิตวิทยาในชีวิตประจำวัน', 'Psychology in Daily Life', 3, '3(3-0-6)', 'แนวคิดทางจิตวิทยาที่สำคัญ พัฒนาการวัยต่างๆ การรับรู้ การจูงใจ บุคลิกภาพและความแตกต่างระหว่างบุคคล ความหลากหลายทางเพศ อิทธิพลทางสังคมและพฤติกรรมทางสังคม การวิเคราะห์ปฏิสัมพันธ์ระหว่างบุคคล ความสัมพันธ์ที่ดี การจัดการความเครียด ความผิดปกติทางจิตและการบำบัด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(16, '103-206', 'อาหาร การดูแลสุขภาพ และการออกกำลังกาย', 'Diet, Health Care and Exercise', 3, '3(2-2-5)', 'สุขภาวะด้านร่างกาย จิตใจ อารมณ์ และสังคม อาหารและโภชนาการ การป้องกันและการบำบัดโรค ด้วยอาหาร ความปลอดภัยของอาหาร ฉลากโภชนาการ ผลิตภัณฑ์เสริมอาหารและการเลือกใช้ การออกกำลังกายเพื่อเสริมสร้างสมรรถภาพของร่างกาย ผลของการออกกำลังกายที่มีต่อระบบต่างๆในร่างกาย นวัตกรรมอาหารเพื่อสุขภาพ และเทคโนโลยีดิจิทัลเพื่อการออกกำลังกาย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(17, '103-207', 'สารเคมีในชีวิตประจำวัน', 'Chemicals in Daily Life', 3, '3(3-0-6)', 'สารเคมีที่ใช้ในชีวิตประจำวัน องค์ประกอบของสารเคมี สารเคมีประเภทธรรมชาติและสารสังเคราะห์ ที่เกี่ยวข้องกับชีวิตประจำวัน น้ำและเครื่องดื่ม สารปรุงแต่งอาหาร ความหมาย ประเภทและสารประกอบของเครื่อง สมอาง ความหมาย ประเภทและสมบัติของสารทำความสะอาด การป้องกันและการแก้พิษจากสารเคมี', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(18, '103-208', 'คณิตศาสตร์และสถิติในชีวิตประจำวัน', 'Mathematics and Statistics in Daily Life', 3, '3(3-0-6)', 'คณิตศาสตร์และสถิติเบื้องต้น เพื่อนำไปใช้ในชีวิตประจำวัน โดยใช้ความรู้เรื่อง เรขาคณิต อัตราส่วน ร้อยละ ฟังก์ชัน ความรู้เบื้องต้นเกี่ยวกับสถิติ การเก็บรวบรวมข้อมูล การวิเคราะห์ข้อมูลด้วยสถิติแบบบรรยาย ความน่าจะเป็นกับการตัดสินใจอย่างง่าย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(19, '103-209', 'ศิลปะและดนตรีเพื่อสุนทรียภาพแห่งชีวิต', 'Art and Music Appreciation', 3, '3(3-0-6)', 'ความรู้เกี่ยวกับสุนทรียศาสตร์ ศิลปะในรูปแบบของสถาปัตยกรรม จิตรกรรม ประติมากรรม นาฎศิลป์ และดุริยางคศิลป์ ยุคสมัยต่างๆของศิลปะ แรงบันดาลใจเบื้องหลังผลงานศิลปะ ความซาบซึ้งในศิลปะ การประเมินคุณค่าทางสุนทรียะ ความสัมพันธ์ระหว่างศิลปะ ดนตรี กับชีวิต ศิลปะในชีวิตประจำวัน และคุณค่าความงามในงานศิลปะแขนงต่างๆ ในฐานะเป็นเครื่องมือจรรโลงจิตใจและสร้างสุนทรียภาพต่อชีวิตของมนุษย์', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(20, '103-210', 'นิยมไทยและอัศจรรย์ในสยาม', 'Thai Appreciation and Unseen in Siam', 3, '3(3-0-6)', 'ศิลปะและวัฒนธรรม ขนบธรรมเนียมประเพณี เอกลักษณ์ความเป็นไทย มรดกทางภูมิปัญญาที่มีคุณค่า และน่าภาคภูมิใจ คติความเชื่อ ค่านิยม วิถีชีวิต แนวทางการอนุรักษ์ สืบทอดและเผยแพร่ความเป็นไทย', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(21, '103-211', 'การคิดเชิงสร้างสรรค์และการแก้ปัญหา', 'Creative Thinking and Problem Solving', 3, '3(2-2-5)', 'กระบวนการคิดและเทคนิคการคิดสร้างสรรค์ในรูปแบบต่างๆ การค้นหาแนวทางหรือทางเลือกใหม่ๆในการทำงาน การวิเคราะห์ปัญหาและการใช้เครื่องมือช่วยในการตัดสินใจเลือกทางเลือกที่มีประสิทธิภาพสูงสุด', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(22, '103-212', 'การเป็นผู้ประกอบการและการสร้างธุรกิจใหม่', 'Entrepreneurship and New Business Creation', 3, '3(2-2-5)', 'คุณลักษณะและแนวคิดการเป็นผู้ประกอบการ โอกาสทางธุรกิจ การวิเคราะห์สภาพแวดล้อมทางธุรกิจ การวางแผนกลยุทธ์ การตลาด การเงิน และการจัดการสําหรับธุรกิจใหม่ การจัดทำแผนธุรกิจเบื้องต้น', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(23, '103-301', 'หลักปรัชญาของเศรษฐกิจพอเพียงเพื่อการพัฒนาที่ยั่งยืน', 'Philosophy of Sufficiency Economy for Sustainable Development', 3, '3(3-0-6)', 'ความเป็นมาและความหมายของปรัชญาของเศรษฐกิจพอเพียงตามแนวพระราชดำริ การประยุกต์ใช้ในระดับบุคคล ครอบครัว และชุมชน การขับเคลื่อนเศรษฐกิจพอเพียงในภาคส่วนต่างๆของสังคมและการเชื่อมโยงสู่การพัฒนาที่ยั่งยืน', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(24, '103-302', 'การออกแบบการคิดเพื่อสร้างนวัตกรรมและธุรกิจใหม่', 'Design Thinking for Innovation and New Business Creation', 3, '3(2-2-5)', 'กระบวนการคิดเชิงออกแบบและการนำมาประยุกต์ใช้ในการระบุปัญหาและสร้างสรรค์นวัตกรรมด้านผลิตภัณฑ์ บริการ หรือโมเดลธุรกิจใหม่ๆ การทดสอบแนวคิดกับกลุ่มเป้าหมายและการพัฒนาเป็นต้นแบบธุรกิจ', 1, 1, NULL, 'หมวดวิชาศึกษาทั่วไป', 0, 0, NULL),
(25, '170-108', 'ชีวเคมี', 'Biochemistry', 2, '2(2-0-4)', 'โครงสร้างและหน้าที่ของสารชีวโมเลกุลในร่างกายมนุษย์ เอนไซม์และฮอร์โมนที่ควบคุมเมแทบอลิซึม การสลายสารอาหารและการเก็บสะสมพลังงานในระดับเซลล์ ความพยาธิสภาพที่เกิดจากความผิดปกติทางชีวเคมี', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1, NULL),
(26, '170-112', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 1', 'Human Anatomy and Physiology 1', 3, '3(2-2-5)', 'โครงสร้างและหน้าที่ของร่างกายมนุษย์ในระดับเซลล์และเนื้อเยื่อ ระบบปกคลุมร่างกาย ระบบโครงร่าง ระบบกล้ามเนื้อ ระบบประสาท และระบบรับความรู้สึก กลไกการรักษาดุลยภาพของร่างกายและการฝึกปฏิบัติการที่เกี่ยวข้อง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1, NULL),
(27, '170-113', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 2', 'Human Anatomy and Physiology 2', 3, '3(2-2-5)', 'โครงสร้างและหน้าที่ของระบบอวัยวะต่างๆ ต่อเนื่องจากภาค 1 ได้แก่ ระบบไหลเวียนโลหิต ระบบภูมิคุ้มกัน ระบบหายใจ ระบบย่อยอาหาร ระบบขับถ่ายปัสสาวะ ระบบต่อมไร้ท่อ และระบบสืบพันธุ์ รวมถึงการฝึกปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 2, NULL),
(28, '170-116', 'การดูแลสุขภาพแบบผสมผสาน', 'Alternative and Complementary Health Care', 2, '2(2-0-4)', 'แนวคิดและขอบเขตของการแพทย์ทางเลือกและการแพทย์ผสมผสาน สมาธิบำบัด วารีบำบัด การนวดไทย และศาสตร์ทางเลือกอื่นๆ เพื่อนำมาใช้ในการส่งเสริมสุขภาพและบรรเทาอาการเจ็บป่วยร่วมกับการแพทย์แผนปัจจุบัน', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 1, 2, NULL),
(29, '170-117', 'การดูแลสุขภาพความงามแบบองค์รวม', 'Holistic Beauty and Wellness Care', 2, '2(2-0-4)', 'แนวคิดและหลักการดูแลสุขภาพความงามจากภายในสู่ภายนอก โภชนาการเพื่อความงาม สารต้านอนุมูลอิสระ การดูแลผิวพรรณ รูปร่าง และการชะลอวัยด้วยวิธีธรรมชาติและการแพทย์สมัยใหม่อย่างปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 1, 2, NULL),
(30, '170-201', 'พยาธิสรีรวิทยาของมนุษย์', 'Human Pathophysiology', 2, '2(2-0-4)', 'กลไกการเกิดโรคและความเปลี่ยนแปลงทางสรีรวิทยาในภาวะเจ็บป่วย พยาธิสภาพของโรคที่พบบ่อยในระบบอวัยวะต่างๆ การตอบสนองของเซลล์ต่อการบาดเจ็บ การอักเสบ และกลไกการปรับตัวของร่างกาย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(31, '170-208', 'จุลชีววิทยาและปรสิตวิทยาของมนุษย์', 'Human Microbiology and Parasitology', 2, '2(1-2-3)', 'คุณลักษณะ กลไกการก่อโรค และการแพร่กระจายของเชื้อแบคทีเรีย ไวรัส เชื้อรา และปรสิตที่ก่อโรคในมนุษย์ ปฏิกิริยาภูมิคุ้มกันของร่างกาย หลักการควบคุมเชื้อและการทำลายเชื้อและการฝึกปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(32, '170-211', 'การพยาบาลพื้นฐาน 1', 'Fundamentals of Nursing 1', 3, '3(2-2-5)', 'แนวคิดพื้นฐานทางการพยาบาล กระบวนการพยาบาล หลักการตอบสนองความต้องการขั้นพื้นฐานด้านความสุขสบาย สุขอนามัย และความปลอดภัยของผู้ป่วย การควบคุมการติดเชื้อในโรงพยาบาล และการฝึกปฏิบัติในห้องปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(33, '170-212', 'การพยาบาลพื้นฐาน 2', 'Fundamentals of Nursing 2', 2, '2(1-2-3)', 'หลักการและเทคนิคการทำหัตถการทางการพยาบาลที่ซับซ้อนขึ้น การวัดสัญญาณชีพ การเก็บสิ่งส่งตรวจ การให้ออกซิเจน การดูดเสมหะ การแต่งแผล หลักเกณฑ์ความปลอดภัยในการบริหารยา และการฝึกปฏิบัติในห้องปฏิบัติการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(34, '170-216', 'เภสัชวิทยาทางการพยาบาล', 'Pharmacology in Nursing', 2, '2(2-0-4)', 'กลไกการออกฤทธิ์ เภสัชจลนศาสตร์ ข้อบ่งใช้ ผลข้างเคียง และข้อควรระวังของยาในกลุ่มต่างๆ บทบาทหน้าที่ของพยาบาลในการบริหารยาอย่างปลอดภัย การคำนวณขนาดยา และการพยาบาลผู้ป่วยที่ได้รับยา', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(35, '170-222', 'จรรยาบรรณวิชาชีพการพยาบาลและกฎหมายที่เกี่ยวข้อง', 'Nursing Ethics and Related Laws', 2, '2(2-0-4)', 'แนวคิดทางจริยธรรม จรรยาบรรณวิชาชีพพยาบาล สิทธิผู้ป่วย กฎหมายวิชาชีพการพยาบาลและผดุงครรภ์ และกฎหมายสาธารณสุขที่เกี่ยวข้องกับการปฏิบัติการพยาบาล การตัดสินใจเชิงจริยธรรมในสถานการณ์ปัญหาขัดแย้ง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(36, '170-224', 'ชีวสถิติทางสุขภาพ', 'Biostatistics for Health', 2, '2(2-0-4)', 'สถิติพรรณนาและสถิติอ้างอิงที่ประยุกต์ใช้ในงานวิทยาศาสตร์สุขภาพ การทดสอบสมมติฐาน การเลือกใช้สถิติที่เหมาะสมในการวิเคราะห์ข้อมูล และการใช้โปรแกรมคอมพิวเตอร์สำเร็จรูปเพื่อการวิเคราะห์และแปลผล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(37, '170-228', 'พัฒนาการมนุษย์และการสร้างเสริมสุขภาพ', 'Human Development and Health Promotion', 2, '2(2-0-4)', 'ทฤษฎีและพัฒนาการของมนุษย์ในทุกช่วงวัย ปัจจัยที่มีผลต่อการเจริญเติบโต แนวคิดและแนวทางการสร้างเสริมสุขภาพ การป้องกันโรค และการประเมินภาวะสุขภาพตามกลุ่มวัย พฤติกรรมสุขภาพและแบบแผนการดำเนินชีวิต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(38, '170-229', 'โภชนบำบัด', 'Diet Therapy', 2, '2(2-0-4)', 'หลักโภชนาการปกติและความต้องการสารอาหารในแต่ละวัย หลักการจัดอาหารบำบัดโรคสำหรับผู้ป่วยที่มีพยาธิสภาพต่างๆ เช่น เบาหวาน ความดันโลหิตสูง โรคไต โรคหัวใจ บทบาทพยาบาลในการดูแลและให้คำแนะนำด้านอาหาร', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(39, '170-226', 'การพยาบาลผู้ใหญ่', 'Adult Nursing', 3, '3(3-0-6)', 'การพยาบาลแบบองค์รวมสำหรับผู้ป่วยวัยผู้ใหญ่ที่มีปัญหาสุขภาพในระยะเฉียบพลัน กึ่งเฉียบพลัน และเรื้อรัง ของระบบทางเดินหายใจ ไหลเวียนโลหิต ทางเดินอาหาร ทางเดินปัสสาวะ ต่อมไร้ท่อ และระบบประสาท โดยใช้กระบวนการพยาบาล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(40, '170-227', 'มโนมติ ทฤษฎีการพยาบาล และบริการด้วยหัวใจความเป็นมนุษย์', 'Concepts, Nursing Theories, and Humanized Care Service', 2, '2(2-0-4)', 'มโนมติหลักทางการพยาบาล วิวัฒนาการของวิชาชีพ ทฤษฎีการพยาบาลที่สำคัญและการนำไปประยุกต์ใช้ในการปฏิบัติ แนวคิดและค่านิยมการบริการด้วยหัวใจความเป็นมนุษย์ ความเอื้ออาทร และการเคารพศักดิ์ศรีความเป็นมนุษย์', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(41, '170-230', 'กระบวนการพยาบาลและการประเมินภาวะสุขภาพ', 'Nursing Process and Health Assessment', 2, '2(1-2-3)', 'ขั้นตอนและองค์ประกอบของกระบวนการพยาบาล หลักการและเทคนิคการประเมินภาวะสุขภาพทางกาย จิต สังคม จิตวิญญาณ การซักประวัติ การตรวจร่างกายทุกระบบ การบันทึกข้อมูลสุขภาพ และการฝึกทักษะการตรวจร่างกาย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(42, '170-231', 'การประยุกต์ใช้ AI และเทคโนโลยีดิจิทัลทางการพยาบาล', 'Application of AI and Digital Technology in Nursing', 2, '2(1-2-3)', 'แนวคิดและการประยุกต์ใช้ปัญญาประดิษฐ์ (AI) เทคโนโลยีดิจิทัล และสารสนเทศในการจัดการข้อมูลสุขภาพ ระบบบันทึกทางการพยาบาลอิเล็กทรอนิกส์ การพยาบาลทางไกล (Telenursing) และจริยธรรมความปลอดภัยของข้อมูล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(43, '170-324', 'การพยาบาลผู้สูงอายุ', 'Gerontological Nursing', 2, '2(2-0-4)', 'กระบวนการชราภาพและการเปลี่ยนแปลงในผู้สูงอายุ กลุ่มอาการที่พบบ่อยในผู้สูงอายุ การประเมินภาวะสุขภาพผู้สูงอายุแบบองค์รวม การพยาบาลผู้สูงอายุที่มีปัญหาสุขภาพเฉียบพลันและเรื้อรัง และการดูแลในระยะท้าย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(44, '170-348', 'การพยาบาลเด็กและวัยรุ่น', 'Pediatric and Adolescent Nursing', 3, '3(3-0-6)', 'การเจริญเติบโต พัฒนาการ และพยาธิสภาพของโรคที่พบบ่อยในทารก เด็ก และวัยรุ่น การประยุกต์ใช้กระบวนการพยาบาลในการดูแลเด็กที่มีภาวะเจ็บป่วยเฉียบพลัน เรื้อรัง และวิกฤต โดยเน้นครอบครัวเป็นศูนย์กลาง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(45, '170-349', 'การพยาบาลวิกฤตและฉุกเฉิน', 'Critical Care and Emergency Nursing', 2, '2(2-0-4)', 'หลักการพยาบาลในภาวะฉุกเฉินและวิกฤตคุกคามต่อชีวิต การคัดแยกผู้ป่วย การประเมินและเฝ้าระวังอาการอย่างรวดเร็วต่อเนื่อง พยาธิสภาพของผู้ป่วยภาวะช็อก บาดเจ็บรุนแรงหลายระบบ และหลักการช่วยฟื้นคืนชีพขั้นสูง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(46, '170-350', 'การพยาบาลสุขภาพจิตและจิตเวชศาสตร์', 'Psychiatric and Mental Health Nursing', 3, '3(3-0-6)', 'แนวคิด ทฤษฎี และลักษณะทางคลินิกของโรคทางจิตเวชที่พบบ่อย ปัจจัยที่มีผลต่อสุขภาพจิต การประยุกต์ใช้กระบวนการพยาบาลในการดูแลแบบองค์รวมแก่ผู้รับบริการที่มีปัญหาสุขภาพจิต การบำบัดทางการพยาบาลจิตเวช', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(47, '170-351', 'การพยาบาลมารดาและทารก', 'Maternal and Newborn Nursing', 3, '3(3-0-6)', 'แนวคิดและทฤษฎีการพยาบาลในการดูแลสตรีในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอดปกติ พยาธิสรีรวิทยาและการเปลี่ยนแปลงตามธรรมชาติ การประเมินสุขภาพมารดาและทารกในครรภ์ กลไกการคลอด และการบริบาลทารกแรกเกิด', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(48, '170-352', 'การผดุงครรภ์', 'Midwifery', 3, '3(3-0-6)', 'กฎหมายและขอบเขตวิชาชีพผดุงครรภ์ การพยาบาลและการผดุงครรภ์ในสตรีที่มีภาวะแทรกซ้อนในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอด ทารกแรกเกิดที่มีภาวะเสี่ยงหรือพยาธิสภาพ การเฝ้าระวังและการพยาบาลในภาวะฉุกเฉิน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(49, '170-353', 'การพยาบาลอนามัยชุมชน', 'Community Health Nursing', 3, '3(3-0-6)', 'หลักการสาธารณสุขและการพยาบาลอนามัยชุมชน ระบบบริการสุขภาพปฐมภูมิ เครื่องมือศึกษาชุมชน การประเมินและการวางแผนแก้ปัญหาอนามัยชุมชน การประยุกต์ใช้กระบวนการพยาบาลในการดูแลครอบครัวและกลุ่มเฉพาะ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(50, '170-354', 'กระบวนการวิจัยทางวิชาชีพ', 'Professional Research Process', 2, '2(2-0-4)', 'ความสำคัญของการวิจัยทางการพยาบาล จริยธรรมการวิจัยในมนุษย์ ขั้นตอนกระบวนการวิจัย ตั้งแต่การกำหนดปัญหาวิจัย การทบทวนวรรณกรรม รูปแบบการวิจัย เครื่องมือ การเก็บรวบรวมข้อมูล และการวิเคราะห์แปลผลข้อมูล', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(51, '170-448', 'การรักษาพยาบาลเบื้องต้น', 'Primary Medical Care', 2, '2(2-0-4)', 'หลักการและขอบเขตการรักษาพยาบาลเบื้องต้นโดยพยาบาลตามกฎหมาย การซักประวัติ ตรวจร่างกาย และใช้เหตุผลทางคลินิกเพื่อวินิจฉัยแยกโรค อาการเจ็บป่วยและโรคที่พบบ่อย การสั่งใช้ยาตามขอบเขตวิชาชีพ และการส่งต่อ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1, NULL),
(52, '170-457', 'ภาวะผู้นำและการบริหารทางการพยาบาล', 'Leadership and Nursing Management', 2, '2(2-0-4)', 'แนวคิดทฤษฎีภาวะผู้นำ การจัดการองค์กรพยาบาล กระบวนการบริหารจัดการทางการพยาบาล (วางแผน จัดองค์กร บริหารงานบุคคล อำนวยการ ควบคุม) การประกันคุณภาพการพยาบาล การบริหารความเสี่ยงและความขัดแย้ง', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1, NULL),
(53, '170-232', 'ปฏิบัติการพยาบาลพื้นฐาน', 'Practicum in Fundamentals of Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลบนหอผู้ป่วยในการดูแลผู้ป่วยที่มีความต้องการขั้นพื้นฐาน โดยใช้กระบวนการพยาบาลและทักษะหัตถการพื้นฐาน การสื่อสารเพื่อการบำบัด ความปลอดภัย การบริหารยา และการบันทึกรายงาน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(54, '170-327', 'ปฏิบัติการสุขภาพจิตและจิตเวชศาสตร์', 'Practicum in Psychiatric and Mental Health Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลผู้รับบริการที่มีปัญหาสุขภาพจิตและโรคทางจิตเวช การสร้างสัมพันธภาพและการสื่อสารเพื่อการบำบัดรายบุคคลและกลุ่ม กิจกรรมบำบัด การบริหารยาจิตเวช และการคุ้มครองสิทธิผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(55, '170-331', 'ปฏิบัติการพยาบาลเด็กและวัยรุ่น', 'Practicum in Pediatric Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลทารก เด็ก และวัยรุ่น ที่มีภาวะเจ็บป่วยเฉียบพลัน เรื้อรัง และวิกฤต ในหอผู้ป่วยเด็ก โดยใช้กระบวนการพยาบาล การประเมินภาวะสุขภาพและพัฒนาการ และการบริหารยาอย่างปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(56, '170-337', 'ปฏิบัติการพยาบาลมารดาและทารก', 'Practicum in Maternal and Newborn Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลสตรีในระยะตั้งครรภ์ ระยะคลอด ระยะหลังคลอดปกติและมีความเสี่ยง และการดูแลทารกแรกเกิดในแผนกฝากครรภ์ ห้องคลอด และหอผู้ป่วยหลังคลอด โดยใช้กระบวนการพยาบาลและการทำคลอดปกติ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(57, '170-338', 'ปฏิบัติการผดุงครรภ์ 1', 'Practicum in Midwifery 1', 2, '2(0-8-0)', 'การฝึกปฏิบัติการผดุงครรภ์ในการตรวจครรภ์ การทำคลอดปกติ การดูแลทารกแรกเกิดทันทีหลังคลอด การเย็บแผลฝีเย็บ และการดูแลมารดาและทารกในระยะหลังคลอดปกติ ตามขอบเขตมาตรฐานวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(58, '170-339', 'ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ', 'Practicum in Adult and Gerontological Nursing', 4, '4(0-16-0)', 'การฝึกปฏิบัติการพยาบาลในการดูแลผู้ป่วยวัยผู้ใหญ่และผู้สูงอายุที่มีปัญหาสุขภาพเฉียบพลันและเรื้อรัง โดยประยุกต์ใช้กระบวนการพยาบาลแบบองค์รวม ทักษะหัตถการที่ซับซ้อนอย่างปลอดภัย และการเฝ้าระวังอาการ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(59, '170-340', 'ปฏิบัติการพยาบาลผู้ป่วยวิกฤตและฉุกเฉิน', 'Practicum in Critical Care and Emergency Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลใน ICU หรือ ER ในการดูแลผู้ป่วยภาวะวิกฤตหรือฉุกเฉินคุกคามต่อชีวิต การประเมินและเฝ้าระวังอาการอย่างรวดเร็วต่อเนื่อง การกู้ชีพขั้นสูง และการใช้เทคโนโลยีขั้นสูงในการดูแลผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(60, '170-355', 'ปฏิบัติการพยาบาลอนามัยชุมชน', 'Practicum in Community Health Nursing', 2, '2(0-8-0)', 'การฝึกปฏิบัติการพยาบาลอนามัยชุมชน การใช้เครื่องมือและกระบวนการศึกษาชุมชน การจัดทำโครงการพัฒนาสุขภาพร่วมกับชุมชน การจัดกิจกรรมสร้างเสริมสุขภาพ การป้องกันโรค และการฝึกปฏิบัติการพยาบาลที่บ้าน', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(61, '170-431', 'ปฏิบัติการผดุงครรภ์ 2', 'Practicum in Midwifery 2', 2, '2(0-8-0)', 'การฝึกปฏิบัติการผดุงครรภ์ในการดูแลมารดาและทารกในระยะตั้งครรภ์ ระยะคลอด และระยะหลังคลอดที่มีภาวะแทรกซ้อนหรือความเสี่ยงสูง การช่วยเหลือเบื้องต้นในภาวะฉุกเฉินทางสูติศาสตร์อย่างถูกต้องปลอดภัย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1, NULL),
(62, '170-449', 'ปฏิบัติการรักษาพยาบาลเบื้องต้น', 'Practicum in Primary Medical Care', 2, '2(0-8-0)', 'การฝึกปฏิบัติการรักษาพยาบาลเบื้องต้นในหน่วยบริการปฐมภูมิหรือ ER/OPD ทักษะการซักประวัติ ตรวจร่างกาย วินิจฉัยแยกโรคเบื้องต้น สั่งใช้ยาตามขอบเขต การทำหัตถการเย็บแผล ล้างแผล ถอดเล็บ และการส่งต่อผู้ป่วย', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1, NULL),
(63, '170-458', 'ปฏิบัติการจัดการพยาบาล', 'Practicum in Nursing Management', 2, '2(0-8-0)', 'การฝึกปฏิบัติการบริหารจัดการทางการพยาบาลบนหอผู้ป่วยในฐานะหัวหน้าเวร ทักษะภาวะผู้นำ การมอบหมายงาน การนิเทศการพยาบาล การบริหารความเสี่ยง คุมคุณภาพการพยาบาล และการทำงานร่วมกับสหสาขาวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2, NULL),
(64, '170-459', 'ปฏิบัติการพยาบาลรวบยอดวิกฤตและฉุกเฉิน', 'Comprehensive Practicum in Critical Care and Emergency Nursing', 3, '3(0-12-0)', 'การฝึกปฏิบัติการพยาบาลรวบยอดในสภาวะวิกฤตและฉุกเฉิน บูรณาการองค์ความรู้ ทฤษฎี และงานวิจัยเชิงประจักษ์ในการดูแลผู้ป่วยวิกฤตและฉุกเฉินที่มีความซับซ้อนสูง เพื่อเตรียมความพร้อมสู่การเป็นพยาบาลวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2, NULL),
(65, '170-114', 'เคมีอินทรีย์พื้นฐาน', 'Basic Organic Chemistry', 2, '2(2-0-4)', 'โครงสร้าง การเรียกชื่อ ไอโซเมอริซึม และปฏิกิริยาเคมีของสารประกอบอินทรีย์กลุ่มต่างๆ ที่มีความสำคัญทางชีวภาพและทางการแพทย์', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 1, NULL),
(66, '170-115', 'ฟิสิกส์การแพทย์เบื้องต้น', 'Introduction to Medical Physics', 2, '2(2-0-4)', 'หลักการทางฟิสิกส์ที่ประยุกต์ใช้ในทางการแพทย์ เช่น กลศาสตร์ของของไหลในระบบหมุนเวียน คลื่นเสียงและอัลตราซาวด์ รังสีและการป้องกันรังสี', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 1, 2, NULL),
(67, '170-235', 'พันธุศาสตร์ทางการแพทย์และจีโนมิกส์', 'Medical Genetics and Genomics', 2, '2(2-0-4)', 'การถ่ายทอดลักษณะทางพันธุกรรม โครงสร้างดีเอ็นเอ ความผิดปกติของโครโมโซม โรคทางพันธุกรรมที่พบบ่อย และแนวคิดจีโนมิกส์ในการรักษาแบบแม่นยำ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 1, NULL),
(68, '170-236', 'วิทยาภูมิคุ้มกันพื้นฐาน', 'Basic Immunology', 2, '2(2-0-4)', 'กลไกการตอบสนองทางภูมิคุ้มกันของร่างกาย ทั้งแบบจำเพาะและไม่จำเพาะ อวัยวะและเซลล์ในระบบภูมิคุ้มกัน ความผิดปกติของระบบภูมิคุ้มกันและการแพ้ยา', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 2, 2, NULL),
(69, '170-356', 'การพยาบาลบรรเทาอาการและดูแลระยะท้าย', 'Palliative and End-of-Life Care', 2, '2(2-0-4)', 'หลักการดูแลแบบประคับประคอง การจัดการความปวดและอาการทุกข์ทรมาน การสนับสนุนทางจิตสังคมและจิตวิญญาณแก่ผู้ป่วยระยะท้ายและครอบครัว', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 2, NULL),
(70, '170-357', 'สารสนเทศศาสตร์สุขภาพ', 'Health Informatics', 2, '2(1-2-3)', 'ระบบข้อมูลสารสนเทศในโรงพยาบาล มาตรฐานรหัสทางการแพทย์ การจัดการฐานข้อมูลสุขภาพ และแนวโน้มเทคโนโลยีสารสนเทศสุขภาพในอนาคต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 3, 1, NULL),
(71, '170-460', 'การเตรียมความพร้อมเพื่อการทำงานในอนาคต', 'Preparation for Future Career', 1, '1(0-2-1)', 'การพัฒนาบุคลิกภาพ เทคนิคการสมัครงานและการสัมภาษณ์ ภาษาอังกฤษเพื่อการทำงาน จริยธรรมในการทำงาน และการวางแผนเส้นทางอาชีพในอนาคต', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 1, NULL),
(72, '170-461', 'การประมวลความรู้ทางวิชาชีพการพยาบาล', 'Comprehensive Review of Professional Nursing', 2, '2(2-0-4)', 'การทบทวนและประมวลความรู้รวบยอดในศาสตร์ทางการพยาบาลทุกสาขาวิชา เพื่อเตรียมความพร้อมในการสอบขึ้นทะเบียนรับใบอนุญาตประกอบวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะ', 4, 2, NULL),
(73, '170-462', 'การฝึกปฏิบัติการพยาบาลเลือกสรร', 'Elective Practicum in Nursing', 2, '2(0-8-0)', 'การเลือกฝึกปฏิบัติงานในหอผู้ป่วยหรือสาขาวิชาที่นักศึกษาสนใจเป็นพิเศษ เพื่อเพิ่มพูนทักษะและความมั่นใจก่อนจบการศึกษาเป็นพยาบาลวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 4, 2, NULL);

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
-- Table structure for table `system_job_runs`
--

CREATE TABLE `system_job_runs` (
  `job_name` varchar(100) NOT NULL,
  `last_run_at` datetime NOT NULL,
  `last_result` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `system_job_runs`
--

INSERT INTO `system_job_runs` (`job_name`, `last_run_at`, `last_result`) VALUES
('license_expiry_reminders', '2026-10-12 19:13:40', '{\"checked\":1,\"notified\":0,\"emails_no_email\":1}'),
('project_end_reminders', '2026-10-12 19:13:40', '{\"checked\":0,\"notified_projects\":0,\"admin_notifications\":0}');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('outcomes.sub_plo_code_per_year', '2026-10-11T13:37:15+00:00', '2026-10-11 13:37:15'),
('outcomes.sub_plo_from_competency_items', '2026-10-11T13:37:15+00:00', '2026-10-11 13:37:15');

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
(1, 'จัดการข้อมูลผู้ใช้', 'users-management', 'Users', 'USER_ROLE_MANAGE', 'จัดการระบบ', 1),
(2, 'จัดการสิทธิ์/ตำแหน่ง', 'roles-management', 'Shield', 'USER_ROLE_MANAGE', 'จัดการระบบ', 1),
(3, 'นำเข้าข้อมูลระบบ', 'import-data', 'Upload', 'DATA_IMPORT_EXPORT', 'จัดการระบบ', 1),
(4, 'ส่งออกข้อมูลระบบ', 'export-data', 'Download', 'DATA_IMPORT_EXPORT', 'จัดการระบบ', 1),
(5, 'Audit Log', 'audit-log', 'ClipboardList', 'AUDIT_LOG_VIEW', 'จัดการระบบ', 1),
(6, 'อนุมัติคำร้องขอ', 'approvals', 'CheckSquare', 'ADMIN_APPROVALS', 'จัดการระบบ', 1),
(7, 'รายงานระบบ', 'reports', 'FileText', 'ADMIN_REPORTS', 'จัดการระบบ', 1),
(8, 'แดชบอร์ด KPI คณะ', 'dean-dashboard', 'LayoutDashboard', 'VIEW_DEAN_DASHBOARD', 'การบริหารคณะ', 1),
(9, 'อัตราคงอยู่ของ นศ.', 'retention', 'UserCheck', 'VIEW_RETENTION', 'การบริหารคณะ', 1),
(10, 'กำหนด CLO รายวิชา', 'clos', 'Target', 'CLO_MANAGE', 'งานหลักสูตร', 1),
(11, 'ตาราง CLO Map', 'clo-map', 'Grid', 'CLO_MAP_EDIT', 'งานหลักสูตร', 1),
(12, 'จัดอาจารย์ผู้สอน', 'assign-instructors', 'UserPlus', 'ASSIGN_INSTRUCTORS', 'งานหลักสูตร', 1),
(13, 'รายงานรายวิชา (มคอ.)', 'course-report', 'FileBarChart', 'COURSE_REPORT_MANAGE', 'งานหลักสูตร', 0),
(14, 'รายงานวิเคราะห์ PLO/YLO', 'plo-ylo-report', 'TrendingUp', 'CURRICULUM_REPORT_VIEW', 'งานหลักสูตร', 0),
(15, 'สรุปข้อมูลสะสม 5 ปี', 'five-year-summary', 'CalendarDays', 'COURSE_REPORT_EXPORT', 'งานหลักสูตร', 1),
(16, 'วิชาที่รับผิดชอบ', 'my-courses', 'BookOpen', 'MY_COURSES_VIEW', 'การจัดการเรียนการสอน', 1),
(17, 'คลังเอกสาร มคอ.', 'documents', 'FolderPlus', 'DOCUMENTS_MANAGE', 'การจัดการเรียนการสอน', 1),
(18, 'ประเมินผลปฏิบัติการ', 'practical-students', 'FileCheck', 'CLINICAL_STUDENT_VIEW', 'งานปฏิบัติการ', 1),
(19, 'นักศึกษาในที่ปรึกษา', 'advises', 'HeartHandshake', 'ADVISOR_STUDENT_VIEW', 'งานที่ปรึกษา', 1),
(20, 'โครงการและวิจัย', 'projectspage', 'Award', 'PROJECT_VIEW', 'โครงการ คณะ', 1),
(21, 'ข้อมูลส่วนตัว', 'profile', 'User', 'PROFILE_VIEW_SELF', 'ระบบทั่วไป', 1),
(22, 'การตั้งค่าระบบ', 'settings', 'Settings', 'SYSTEM_SETTINGS', 'ระบบทั่วไป', 1),
(23, 'การแจ้งเตือน', 'notifications', 'Bell', 'NOTIFICATION_VIEW', 'ระบบทั่วไป', 1),
(24, 'โครงการของฉัน', 'my-projects', 'Folder', 'PROJECT_MY_VIEW', 'โครงการ คณะ', 1),
(25, 'เอกสารโครงการ', 'project-docs', 'FileText', 'PROJECT_DOCS_MANAGE', 'โครงการ คณะ', 1),
(26, 'เชื่อมโยงระดับ LO', 'project-links', 'Link2', 'PROJECT_LINKS_MANAGE', 'โครงการ คณะ', 1),
(27, 'รายงานโครงการ', 'project-reports', 'BarChart3', 'PROJECT_REPORTS_VIEW', 'โครงการ คณะ', 1),
(28, 'ข้อมูลนักศึกษา', 'transcript', 'User', 'STUDENT_VIEW_TRANSCRIPT', NULL, 1),
(29, 'แฟ้มสะสมผลงาน', 'portfolio', 'FileText', 'STUDENT_VIEW_PORTFOLIO', NULL, 1),
(31, 'วิชาที่รับผิดชอบ', 'courses', 'BookOpen', 'COURSES_VIEW', 'การจัดการเรียนการสอน', 1),
(33, 'ผล CLO รายบุคคล', 'course-students', 'Users', 'COURSE_STUDENTS_VIEW', 'การจัดการเรียนการสอน', 1),
(34, 'หลักฐานการฝึกปฏิบัติ', 'evidence', 'FileCheck', 'CLINICAL_EVIDENCE_UPLOAD', 'งานปฏิบัติการ', 1),
(35, 'สรุปผลงานวิจัย 5 ปี', 'research-summary', 'Microscope', 'RESEARCH_SUMMARY_VIEW', 'งานวิจัย', 1),
(36, 'ประเมิน Performance', 'performance', 'BarChart3', 'PERFORMANCE_MANAGE', 'งานปฏิบัติการ', 1),
(37, 'รายงานระดับหลักสูตร', 'program-reports', 'FileBarChart', 'PROGRAM_REPORTS_VIEW', 'งานหลักสูตร', 0),
(38, 'ตารางงาน/ภารกิจ', 'schedule-tasks', 'CalendarCheck', 'SCHEDULE_TASKS_MANAGE', 'งานปฏิบัติการ', 1),
(39, 'บันทึกการให้คำปรึกษา', 'advise-notes', 'NotebookPen', 'ADVISE_NOTES_MANAGE', 'งานที่ปรึกษา', 1),
(40, 'แจ้งเตือนที่ปรึกษา', 'advisor-notifications', 'Bell', 'ADVISOR_NOTIFICATION_VIEW', 'งานที่ปรึกษา', 1),
(41, 'รายชื่อนักศึกษา', 'students', 'Users', 'STUDENTS_VIEW', 'การจัดการเรียนการสอน', 1),
(42, 'แหล่งฝึกภาคปฏิบัติ', 'practice-locations', 'MapPin', 'PRACTICE_LOCATIONS_VIEW', 'งานปฏิบัตการ', 1),
(43, 'คำร้องโอนย้าย', 'transfer-requests', 'ArrowRightLeft', 'TRANSFER_REQUESTS_MANAGE', 'งานที่ปรึกษา', 0),
(44, 'จัดการนักศึกษา', 'assign-students', 'UserPlus', 'STUDENT_ASSIGN', 'ระบบที่ปรึกษา', 1),
(47, 'ภาระงานการเรียนการสอน', 'dean-teaching-workload', 'BookOpenCheck', 'VIEW_DEAN_DASHBOARD', 'การบริหารคณะ', 1),
(48, 'ภาระงานวิจัย', 'dean-research-workload', 'FlaskConical', 'VIEW_DEAN_DASHBOARD', 'การบริหารคณะ', 1),
(49, 'ภาระงานบริการวิชาการ', 'dean-academic-service-workload', 'UsersRound', 'VIEW_DEAN_DASHBOARD', 'การบริหารคณะ', 1),
(50, 'ภาระงานศิลปวัฒนธรรม', 'dean-culture-workload', 'Landmark', 'VIEW_DEAN_DASHBOARD', 'การบริหารคณะ', 1),
(52, 'ประวัติการได้รับวัคซีน', 'student-vaccinations', 'BookOpen', 'STUDENT_VACCINATION', NULL, 1),
(53, 'ข้อมูลภาวะสุขภาพ', 'student-health-records', 'BookOpen', 'STUDENT_HEALTH_RECORDS', NULL, 1),
(54, 'ผลการประเมินสมรรถนะหลัก', 'student-competency-view', 'BookOpen', 'STUDENT_VIEW_COMPETENCY', NULL, 1),
(56, 'ข้อมูลสุขภาพนักศึกษา', 'advisor-health-records-view', 'BookOpen', 'VIEW_STUDENT_HEALTH_RECORDS', 'งานที่ปรึกษา', 1),
(58, 'ประเมินสมรรถนะหลัก', 'competency-items-management', 'BookOpen', 'ADMIN_COMPETENCY_MANAGE', 'งานหลักสูตร', 1),
(102, 'จัดการหลักสูตรรอบ 5 ปี', 'curriculum-cycles', 'BookOpen', 'ADMIN_CURRICULUM_CYCLE_MANAGE', 'งานหลักสูตร', 1),
(153, 'วิชาที่ลงทะเบียน', 'student-registration', 'BookOpen', 'STUDENT_COURSE_REGISTRATION', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tqf_documents`
--

CREATE TABLE `tqf_documents` (
  `id` int UNSIGNED NOT NULL,
  `subject_code` varchar(20) NOT NULL COMMENT 'รหัสวิชา',
  `subject_name` varchar(255) NOT NULL COMMENT 'ชื่อรายวิชา',
  `tqf_type` enum('มคอ.3','มคอ.4','มคอ.5','มคอ.6','other') NOT NULL COMMENT 'ประเภทเอกสาร',
  `academic_year` int NOT NULL COMMENT 'ปีการศึกษา',
  `semester` int NOT NULL COMMENT 'ภาคการศึกษา',
  `responsible_teacher` varchar(255) DEFAULT NULL COMMENT 'อาจารย์ผู้รับผิดชอบ (อ้างอิงชื่อแรก)',
  `file_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อไฟล์อ้างอิง',
  `file_path` varchar(255) DEFAULT NULL COMMENT 'พาร์ทที่อยู่ของไฟล์ (Server Path หรือ URL)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tqf_documents`
--

INSERT INTO `tqf_documents` (`id`, `subject_code`, `subject_name`, `tqf_type`, `academic_year`, `semester`, `responsible_teacher`, `file_name`, `file_path`, `created_at`, `updated_at`) VALUES
(1, '170-200', 'จุลชีววิทยาและปรสิตวิทยาของมนุษย์', 'มคอ.3', 2567, 1, 'ดร.พจอ.ภูมเดชา ชาญเบญจพิภู', 'มคอ.3 170 - 200 จุลชีววิทยาและปรสิตของมนุษย์.pdf', 'https://drive.google.com/file/d/1mzFY-9CLZmeNEwDWFpmexvt5GoentjB-/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:49:40'),
(2, '170-201', 'พยาธิสรีรวิทยาของมนุษย์', 'มคอ.3', 2567, 1, 'ดร.ณิชมล ขวัญเมือง', 'มคอ.3 170 - 201 พยาธิสรีรวิทยาของมนุษย์.pdf', 'https://drive.google.com/file/d/1M2Zq76EABf77WVEWHmyDyyLcgwoG9Tr6/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:49:44'),
(3, '170-205', 'จิตวิทยาพัฒนาการมนุษย์ตามช่วงวัย', 'มคอ.3', 2567, 1, 'ผศ.ดร.สุสารี ประคินกิจ', 'มคอ.3 170 - 205 จิตวิทยาพัฒนาการมนุษย์ตามช่วงวัย.pdf', 'https://drive.google.com/file/d/1dWjd9f9OIeJyfVtVHwVZ5CSqAkOY0C21/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:49:49'),
(4, '170-207', 'การสร้างเสริมสุขภาพและการดูแลตนเอง', 'มคอ.3', 2567, 1, 'อาจารย์สุกฤตา ตะการีย์', 'มคอ.3 170 - 207 การสร้างเสริมสุขภาพและการดูแลตนเอง.pdf', 'https://drive.google.com/file/d/15L3BZDBJsl2grB-zgcQppKGypHG8edsv/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:49:55'),
(5, '170-211', 'การพยาบาลพื้นฐาน 1', 'มคอ.3', 2567, 1, 'ผศ.ดร.สมฤดี ชื่นกิติญานนท์', 'มคอ.3 170 - 211 การพยาบาลพื้นฐาน 1.pdf', 'https://drive.google.com/file/d/1Yaecmx2Ce7AE3rd19yvkO2S4qd67n0fN/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:01'),
(6, '170-215', 'ทฤษฎีและกระบวนการพยาบาล', 'มคอ.3', 2567, 1, 'อาจารย์ธัญลักษณ์วดี ก้อนทองถม', 'มคอ.3 170 - 215 ทฤษฎีและกระบวนการพยาบาล.pdf', 'https://drive.google.com/file/d/1wxtPIg7P387HCON7W1qrYFXpG90irhtk/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:06'),
(7, '170-221', 'การประเมินภาวะสุขภาพ', 'มคอ.3', 2567, 1, 'ผศ.ดร.ศนิกานต์ ศรีมณี', 'มคอ.3 170 - 221 ประเมินภาวะสุขภาพ.pdf', 'https://drive.google.com/file/d/1JFP5eVZuulu0KNkfAuUcVzBXErd7SIrz/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:11'),
(8, '170-324', 'การพยาบาลผู้สูงอายุ', 'มคอ.3', 2567, 1, 'ดร.ปรียธิดา ชลศึกเสนีย์', 'มคอ.3 170 - 324 การพยาบาลผู้สูงอายุ.pdf', 'https://drive.google.com/file/d/1l34Li-ANtgOWlYN4Y8aF_RHdXPLHM2ri/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:16'),
(9, '170-330', 'การพยาบาลเด็กและวัยรุ่น', 'มคอ.3', 2567, 1, 'อาจารย์ธัญลักษณ์วดี ก้อนทองถม', 'มคอ.3 170 - 330 การพยาบาลเด็กและวัยรุ่น.pdf', 'https://drive.google.com/file/d/1CmTW_EjKonzWmDIXisxCnajiSNt3xwuh/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:21'),
(10, '170-331', 'ปฏิบัติการพยาบาลเด็กและวัยรุ่น', 'มคอ.4', 2567, 1, 'ดร.สุวรรณา เชียงขุนทด', 'มคอ.4 170 - 331 ปฏิบัติการพยาบาลเด็กและวัยรุ่น.pdf', 'https://drive.google.com/file/d/1dmsCAocIQ3hdbEXIIi150DuBTUELcwHE/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:25'),
(11, '170-334', 'การพยาบาลผู้ใหญ่ 2', 'มคอ.3', 2567, 1, 'ผศ.ดร.วัฒนีย์ ปานจินดา', 'มคอ.3 170 - 334 การพยาบาลผู้ใหญ่ 2.pdf', 'https://drive.google.com/file/d/1bqo2TtEIVYJau8MWrIEDG2Nb74hjQPgn/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:30'),
(12, '170-339', 'ปฏิบัติการพยาบาลผู้ใหญ่ และผู้สูงอายุ 1', 'มคอ.4', 2567, 1, 'ผศ.ดร.ดวงกมล วิรุฬห์อุดมผล', 'มคอ.4 170 - 339 ปฏิบัติการพยาบาลผู้ใหญ่ และผู้สูงอายุ 1.pdf', 'https://drive.google.com/file/d/1etmpjsypiHyT48Rm-IbEFZrLfr3aYm1d/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:34'),
(13, '170-346', 'นวัตกรรมทางสุขภาพ', 'มคอ.3', 2567, 1, 'ผศ.ดร.จรัสดาว เรโนลด์', 'มคอ.3 170 - 346 นวัตกรรมทางสุขภาพ.pdf', 'https://drive.google.com/file/d/1rVkmW1OCUSB_FTnRCCqt0X21UlL3xvOR/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:50:38'),
(14, '170-347', 'การปฐมพยาบาลและการช่วยฟื้นคืนชีพเบื้องต้น', 'มคอ.3', 2567, 1, 'ผศ.วารุณี เพไร', 'มคอ.3 170 - 347 การปฐมพยาบาลและการช่วยฟื้นคืนชีพเบื้องต้น.pdf', 'https://drive.google.com/file/d/1aYjGlqBB_SV_bNTxV9IUAwht3C11RK2w/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:51:28'),
(15, '170-431', 'ปฏิบัติการพยาบาลผดุงครรภ์ 2', 'มคอ.4', 2567, 1, 'ผศ.ภัทรพร อรัณยภาค', 'มคอ.4 170 - 431 ปฏิบัติการพยาบาลผดุงครรภ์ 2.pdf', 'https://drive.google.com/file/d/1sGyvbYOgsmAQYPS5EP1Vv7ACXnCg6vn7/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:51:34'),
(16, '170-439', 'กระบวนการวิจัยทางการพยาบาล', 'มคอ.3', 2567, 1, 'อาจารย์นฤมล อังศิริศักดิ์', 'มคอ.3 170 - 439 กระบวนการวิจัยทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1FXd9DEsc3kRHSDxug-vasdAuXOzEI4Uy/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:51:38'),
(17, '170-448', 'การรักษาพยาบาลเบื้องต้น', 'มคอ.3', 2567, 1, 'ผศ.ดร.ศนิกานต์ ศรีมณี', 'มคอ.3 170 - 448 การรักษาพยาบาลเบื้องต้น.pdf', 'https://drive.google.com/file/d/1KV1SddgE6N3DiIYqeoxUHdvwVQVEYLmU/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:51:43'),
(18, '170-449', 'ปฏิบัติการรักษาพยาบาลเบื้องต้น', 'มคอ.4', 2567, 1, 'อาจารย์เพ็ญรุ่ง นวลแจ่ม', 'มคอ.4 170 - 449 ปฏิบัติการรักษาพยาบาลเบื้องต้น.pdf', 'https://drive.google.com/file/d/1tReDsCEMNUeb0dZQVDlzId2hBvmCKHJJ/view?usp=drive_web', '2026-08-15 04:16:59', '2026-08-15 06:51:47'),
(19, '170-346', 'นวัตกรรมทางสุขภาพ', 'มคอ.5', 2567, 1, 'จรัสดาว', 'มคอ.5 170 - 346 นวัตกรรมทางสุขภาพ.pdf', 'https://drive.google.com/file/d/1B9cbzVp3MoqtRUZm0eZYed5BgCdLBASb/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:51:51'),
(20, '170-439', 'กระบวนการวิจัยทางการพยาบาล', 'มคอ.5', 2567, 1, 'นฤมล', 'มคอ.5 170 - 439 กระบวนการวิจัยทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1Ox3EIHGloZsuMoYNsKOjagTIahxcy1e9/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:51:55'),
(21, '170-448', 'การรักษาพยาบาลเบื้องต้น', 'มคอ.5', 2567, 1, 'รัฐกานต์', 'มคอ.5 170 - 448 การรักษาพยาบาลเบื้องต้น.pdf', 'https://drive.google.com/file/d/1bWR0E3Pikfc89bVM0JSbjOxAb13xHEhR/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:00'),
(22, '170-201', 'พยาธิสรีรวิทยาของมนุษย์', 'มคอ.5', 2567, 1, 'ณิชมล', 'มคอ.5 170 - 201 พยาธิสรีรวิทยาของมนุษย์.pdf', 'https://drive.google.com/file/d/13CVEK_8mmVwRK4Mgm8iZh2xY5uSm-00P/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:05'),
(23, '170-207', 'การสร้างเสริมสุขภาพ และการดูแลตนเอง', 'มคอ.5', 2567, 1, 'พิชาภรณ์', 'มคอ.5 170 - 207 การสร้างเสริมสุขภาพ และการดูแลตนเอง.pdf', 'https://drive.google.com/file/d/1svOOjsxmc6DTBsg3U3EXf9pz4ZlQx_ha/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:10'),
(24, '170-112', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 1', 'มคอ.5', 2567, 1, 'ภูมิเดชา', 'มคอ.5 170 - 112 กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 1.pdf', 'https://drive.google.com/file/d/1G_Guu0kxN59Jjj8nTclBdAh881leucIM/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:14'),
(25, '170-200', 'จุลชีววิทยาและปรสิตวิทยาของมนุษย์', 'มคอ.5', 2567, 1, 'ภูมิเดชา', 'มคอ.5 170 - 200 จุลชีววิทยาและปรสิตของมนุษย์.pdf', 'https://drive.google.com/file/d/1QPWAxDrDY65iOKTwSTwZkhpxaH4pONXV/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:18'),
(26, '170-205', 'จิตวิทยาพัฒนาการมนุษย์ตามช่วงวัย', 'มคอ.5', 2567, 1, 'สุสารี', 'มคอ.5 170 - 205 จิตวิทยาพัฒนาการของมนุษย์ตามช่วงวัย.pdf', 'https://drive.google.com/file/d/1VEcsbODLFzYzWrDc40ABM79MVmtWkV99/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:22'),
(27, '170-215', 'ทฤษฎีและกระบวนการพยาบาล', 'มคอ.5', 2567, 1, 'ธัญลักษณ์วดี', 'มคอ.5 170 - 215 ทฤษฎีและกระบวนการพยาบาล.pdf', 'https://drive.google.com/file/d/1HaOs0svEK8ktzvUU3LVhalc0mRGhBtPB/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:28'),
(28, '170-221', 'การประเมินภาวะสุขภาพ', 'มคอ.5', 2567, 1, 'ศนิกานต์', 'มคอ.5 170 - 221 ประเมินภาวะสุขภาพ.pdf', 'https://drive.google.com/file/d/1xNKXK8iLK1jpY3WKROUZV1-ZUDjiLea7/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:32'),
(29, '170-211', 'การพยาบาลพื้นฐาน 1', 'มคอ.5', 2567, 1, 'สมฤดี', 'มคอ.5 170-211 การพยาบาลพื้นฐาน 1.pdf', 'https://drive.google.com/file/d/1xNKXK8iLK1jpY3WKROUZV1-ZUDjiLea7/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:35'),
(30, '170-324', 'การพยาบาลผู้สูงอายุ', 'มคอ.5', 2567, 1, 'ปรีย์ธิดา', 'มคอ.5 170-324 การพยาบาลผู้สูงอายุ.pdf', 'https://drive.google.com/file/d/1zHrZeKuM8aqbsNTpBPvH5vTCKf_Ulsyz/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:39'),
(31, '170-330', 'การพยาบาลเด็กและวัยรุ่น', 'มคอ.5', 2567, 1, 'ธัญลักษณ์วดี', 'มคอ.5 170-330 การพยาบาลเด็กและวัยรุ่น.pdf', 'https://drive.google.com/file/d/11KPeIneVxnG5Rdh1x9juo4LP9xAVFBHG/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:45'),
(32, '170-331', 'ปฏิบัติการพยาบาลเด็กและวัยรุ่น', 'มคอ.6', 2567, 1, 'สุวรรณา', 'มคอ.6 170-331 ปฏิบัติการพยาบาลเด็กและวัยรุ่น.pdf', 'https://drive.google.com/file/d/1SX5wYKF80QLl6fJkBFkVfdJochDFtJmz/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:50'),
(33, '170-334', 'การพยาบาลผู้ใหญ่ 2', 'มคอ.5', 2567, 1, 'วัฒนีย์', 'มคอ.5 170-334 การพยาบาลผู้ใหญ่ 2 .pdf', 'https://drive.google.com/file/d/11QrCn1N10U9Oy7v3JSH3S6JCePtKclze/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:52:56'),
(34, '170-339', 'ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 1', 'มคอ.6', 2567, 1, 'ดวงกมล', 'มคอ.6 170-339 ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 1.pdf', 'https://drive.google.com/file/d/1uFFB_GX13WEVj9sztWnIiBTIgXPEPDSy/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:53:01'),
(35, '170-431', 'ปฏิบัติการพยาบาลผดุงครรภ์ 2', 'มคอ.6', 2567, 1, 'ภัทรพร', 'มคอ.6 170-431 ปฏิบัติการพยาบาลผดุงครรภ์ 2.pdf', 'https://drive.google.com/file/d/1TucQSUd9aECacwNy2GSkyy5JxvERViT3/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:53:05'),
(36, '170-449', 'ปฏิบัติการรักษาพยาบาลเบื้องต้น', 'มคอ.6', 2567, 1, 'เพ็ญรุ่ง', 'มคอ.6 170-449 ปฏิบัติการรักษาพยาบาลเบื้องต้น.pdf', 'https://drive.google.com/file/d/1L5wRh9UEsPrc0ZksTCq7aW-vzZvDLT6h/view?usp=drive_web', '2026-08-15 04:32:24', '2026-08-15 06:53:09'),
(37, '170-113', 'กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 2', 'มคอ.3', 2567, 2, 'รัฐกานต์', 'มคอ.3 170-113 กายวิภาคศาสตร์และสรีรวิทยาของมนุษย์ 2.pdf', 'https://drive.google.com/file/d/1jaIR7O5IU8BSDitjjf06tAGclsNEOW7H/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:40:45'),
(38, '170-116', 'การดูแลสุขภาพแบบผสมผสาน', 'มคอ.3', 2567, 2, 'วัฒนีย์', 'มคอ.3 170-116 การดูแลสุขภาพแบบผสมผสาน.pdf', 'https://drive.google.com/file/d/1eJJhCLGnS8lMnRBvnbkIvq9pO-KN-UbO/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:53:18'),
(39, '170-203', 'โภชนศาสตร์และโภชนบำบัด', 'มคอ.3', 2567, 2, 'สุวรรณา', 'มคอ.3 170 - 203 โภชนศาสตร์และโภชนบำบัด.pdf', 'https://drive.google.com/file/d/1IBTr_UVUj5i2Y2vcHJrXk0_VaeAh-_lx/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:40:51'),
(40, '170-212', 'การพยาบาลพื้นฐาน 2', 'มคอ.3', 2567, 2, 'สมฤดี', 'มคอ.3 170-212 การพยาบาลพื้นฐาน 2.pdf', 'https://drive.google.com/file/d/1okF_tRjutY_OHs_8xD_Pr_u5p3gHddXA/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:40:55'),
(41, '170-216', 'เภสัชวิทยาทางการพยาบาล', 'มคอ.3', 2567, 2, 'สมฤดี', 'มคอ.3 170 - 216 เภสัชวิทยาทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1DQrSunhbdsXgF44Ewkcd4i28zqwxA7d1/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:40:59'),
(42, '170-222', 'จรรยาบรรณวิชาชีพการพยาบาล และกฎหมายที่เกี่ยวข้อง', 'มคอ.3', 2567, 2, 'รุ่งนภา', 'มคอ.3 170 - 222 จรรยาบรรณวิชาชีพการพยาบาล และกฎหมายที่เกี่ยวข้อง.pdf', 'https://drive.google.com/file/d/1OOuSyao28JCWTBqGG_vRQqj9Y8OlnKnS/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:03'),
(43, '170-223', 'การบริการด้วยหัวใจความเป็นมนุษย์', 'มคอ.3', 2567, 2, 'ชัยสิทธิ์', 'มคอ.3 170-223 การบริการด้วยหัวใจความเป็นมนุษย์', 'https://drive.google.com/file/d/1IDhXXI6s6UcbJlJTOh-4SqzukuipuU57/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:06'),
(44, '170-224', 'ชีวสถิติทางสุขภาพ', 'มคอ.3', 2567, 2, 'ขวัญเรือน', 'มคอ.3 170 - 224 ชีวสถิติทางสุขภาพ.pdf', 'https://drive.google.com/file/d/1S9vIDz_QkQWyUabSkQhqZxmz4iH77E8Q/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:09'),
(45, '170-225', 'สารสนเทศสำหรับวิชาชีพ', 'มคอ.3', 2567, 2, 'รัตนาภรณ์', 'มคอ.3 170 - 225 สารสนเทศสำหรับวิชาชีพ.pdf', 'https://drive.google.com/file/d/1BH-6MYZ1Zrzbts3yt2nZgHdmVhmqM_Zg/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:12'),
(46, '170-326', 'การพยาบาลสุขภาพจิตและจิตเวชศาสตร์', 'มคอ.3', 2567, 2, 'สุสารี', 'มคอ.3 170-326 การพยาบาลสุขภาพจิตและจิตเวชศาสตร์.pdf', 'https://drive.google.com/file/d/1Kg8h4_rsxHPTPkE1ILa-uQp3wY__TrBF/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:16'),
(47, '170-327', 'ปฏิบัติการพยาบาล สุขภาพจิตและ จิตเวชศาสตร์', 'มคอ.4', 2567, 2, 'สุสารี', 'มคอ.4 170-327 ปฏิบัติการพยาบาล สุขภาพจิตและ จิตเวชศาสตร์.pdf', 'https://drive.google.com/file/d/1zWtUXwJZzZS0GJLt5gIPcxugf3GQ0grC/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:39'),
(48, '170-328', 'การพยาบาลมารดาและทารก', 'มคอ.3', 2567, 2, 'วารุณี', 'มคอ.3 170-328 การพยาบาลมารดาและทารก.pdf', 'https://drive.google.com/file/d/1GY8Qf3F5u_tejSmGiQO9WsNVz8toA5fi/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:42'),
(49, '170-329', 'การผดุงครรภ์', 'มคอ.3', 2567, 2, 'ภัทรพร', 'มคอ.3 170 - 329 การผดุงครรภ์.pdf', 'https://drive.google.com/file/d/1bBi9nkQEAgnIqKyXHJtptSKY_JUWME8f/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:46'),
(50, '170-340', 'ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 2', 'มคอ.4', 2567, 2, 'เรวัต', 'มคอ.4 170 - 340 ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ 2.pdf', 'https://drive.google.com/file/d/1ejL8mT6ZZl5j04IRdtPVe4WEgBoiee9M/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:51'),
(51, '170-344', 'การพยาบาลอนามัยชุมชน 1', 'มคอ.3', 2567, 2, 'ขวัญเรือน', 'มคอ.3 170 - 344 การพยาบาลอนามัยชุมชน 1.pdf', 'https://drive.google.com/file/d/1_kP8G49UwgJHUS-ooaQU3J-qnu8Uf43l/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:41:54'),
(52, '170-446', 'การพยาบาลอนามัยชุมชน 2', 'มคอ.3', 2567, 2, 'วิภานันท์', 'มคอ.3 170-446 การพยาบาลอนามัยชุมชน 2.pdf', 'https://drive.google.com/file/d/1jbCmKDyc1CW9gByy58uYwhM75ZA_MmXt/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:00'),
(53, '170-447', 'ปฏิบัติการพยาบาล อนามัยชุมชน 2', 'มคอ.3', 2567, 2, 'ชัยสิทธิ์', 'มคอ.3 170-447 ปฏิบัติการพยาบาล อนามัยชุมชน 2.pdf', 'https://drive.google.com/file/d/1nPbnqetLScLePOrsw5n8fBAPyD-zX0xY/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:04'),
(54, '170-452', 'การจัดการทางการพยาบาล', 'มคอ.3', 2567, 2, 'จรัสดาว', 'มคอ.3 170-452 การจัดการทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1Wwik6mYB72FyXCL-aOpe_vECg48gmd2W/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:07'),
(55, '170-455', 'ปฏิบัติการพยาบาลรวบยอด', 'มคอ.4', 2567, 2, 'วารุณี', 'มคอ.4 170-455 ปฏิบัติการพยาบาลรวบยอด.pdf ', 'https://drive.google.com/file/d/1Kkdix4xKIOzWM3Z3LYJUqFtCb-Xha6__/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:09'),
(56, '170-113', 'กายวิภาคศาสตร์และสรรวทยาของมนุษย์ 2', 'มคอ.5', 2567, 2, 'รัฐกานต์', 'มคอ.5 170-113 กายวิภาคศาสตร์และสรรวทยาของมนุษย์ 2.pdf', 'https://drive.google.com/file/d/1aUi4THQZHK8LvoGer5_y67TqE8nw14KS/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:11'),
(57, '170-116', 'การดูแลสุขภาพแบบผสมผสาน', 'มคอ.5', 2567, 2, 'วัฒนีย์', 'มคอ.5 170-116', 'https://drive.google.com/file/d/1_MdY20OrMMPxybUOHPJRpVyRgEPoRc7Q/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:14'),
(58, '170-203', 'โภชนศาสตร์และโภชนบำบัด', 'มคอ.5', 2567, 2, 'สุวรรณา', 'มคอ.5 170 - 203 โภชนศาสตร์และโภชนบำบัด.pdf', 'https://drive.google.com/file/d/12N0ahTcSfDRZhxfTnprDmnJJlZHO17IR/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:17'),
(59, '170-212', 'การพยาบาลพื้นฐาน 2', 'มคอ.5', 2567, 2, 'สมฤดี', 'มคอ.5 170-212 การพยาบาลพื้นฐาน 2.pdf', 'https://drive.google.com/file/d/1SC0DWjGhXOIXDatQhp6DFFapz_P_oyfQ/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:21'),
(60, '170-216', 'เภสัชวิทยาทางการพยาบาล', 'มคอ.5', 2567, 2, 'สมฤดี', 'มคอ.5 170 - 216 เภสัชวิทยาทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1l2kyfifeSBOYNXSjIeJ_0WvkgZ3DVEeh/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:24'),
(61, '170-222', 'จรรยาบรรณวิชาชีพการพยาบาล และกฎหมายที่เกี่ยวข้อง', 'มคอ.5', 2567, 2, 'อรทิพา', 'มคอ.5 170-222 จรรยาบรรณวิชาชีพการพยาบาล และกฎหมายที่เกี่ยวข้อง.pdf', 'https://drive.google.com/file/d/1MeQiwNduUImH4Fr72XFgKpW687cB5qle/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:31'),
(62, '170-223', 'การบริการด้วยหัวใจความเป็นมนุษย์', 'มคอ.5', 2567, 2, 'วัฒนีย์', 'มคอ.5 170 - 223 การบริการด้วยหัวใจความเป็นมนุษย์.pdf', 'https://drive.google.com/file/d/1DAt2uR9wjHFQgUwhxJduwNyJkaYwBwPi/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:33'),
(63, '170-224', 'ชีวสถิติทางสุขภาพ', 'มคอ.5', 2567, 2, 'ขวัญเรือน', 'มคอ.5 170 - 224 ชีวสถิติทางสุขภาพ.pdf', 'https://drive.google.com/file/d/1_CV3DpkqtmVNCcfpkvc4t4mzSzXQuWZp/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:39'),
(64, '170-225', 'สารสนเทศสำหรับวิชาชีพ', 'มคอ.5', 2567, 2, 'รัตนาภรณ์', 'มคอ.5 170-225 สารสนเทศสำหรับวิชาชีพ.pdf', 'https://drive.google.com/file/d/1YA1gSzETHbmm1pJ9mihlssV_i_ShM9cF/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:42'),
(65, '170-326', 'การพยาบาลสุขภาพจิตและจิตเวชศาสตร์', 'มคอ.5', 2567, 2, 'สุสารี', 'มคอ.5 170 - 326 การพยาบาลสุขภาพจิตและจิตเวชศาสตร์.pdf', 'https://drive.google.com/file/d/1tvh6YFfRl_VXBxOrxQUPuNXXn8MO_4CT/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:44'),
(66, '170-327', 'ปฏิบัติการพยาบาลสุขภาพจิตและจิตเวชศาสตร์', 'มคอ.6', 2567, 2, 'สุสารี', 'มคอ.6 170 - 327 ปฏิบัติการพยาบาลสุขภาพจิตและจิตเวชศาสตร์.pdf', 'https://drive.google.com/file/d/1J5Z2YYRwMe0hqA1No5vmQNhVjoNNGfEA/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:49'),
(67, '170-328', 'การพยาบาลมารดาและทารก', 'มคอ.5', 2567, 2, 'วารุณี', 'มคอ.5 170-328 การพยาบาลมารดาและทารก.pdf', 'https://drive.google.com/file/d/1b78Nr6Ihytrav1ayDyNHFm8FQyPYlisZ/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:52'),
(68, '170-329', 'การผดุงครรภ์', 'มคอ.5', 2567, 2, 'ภัทรพร', 'มคอ.5 170-329 การผดุงครรภ์.pdf', 'https://drive.google.com/file/d/1JhTwK74gSQnwVHCI9zsg54sPWGPyYHzb/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:54'),
(69, '170-340', 'ปฏิบัติการพยาบาลผู้ใหญ่และผสูงอายุ 2', 'มคอ.6', 2567, 2, 'เรวัต', 'มคอ.6 170-340 ปฏิบัติการพยาบาลผู้ใหญ่และผสูงอายุ 2.pdf', 'https://drive.google.com/file/d/1x9jlWlP_zL_I6Zz2wjb4PNwCvX84GoRY/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:42:58'),
(70, '170-344', 'การพยาบาลอนามัยชุมชน 1', 'มคอ.5', 2567, 2, 'ขวัญเรือน', 'มคอ.5 170 - 344 การพยาบาลอนามัยชุมชน 1.pdf', 'https://drive.google.com/file/d/1y55fZhuKRcJFswndIniR82oNOTpTRhPq/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:43:02'),
(71, '170-446', 'การพยาบาลอนามัยชุมชน 2', 'มคอ.5', 2567, 2, 'วิภานันท์', 'มคอ.5 170-446 การพยาบาลอนามัยชุมชน 2.pdf', 'https://drive.google.com/file/d/1n_drMrItjHxkMSV41QidTPfrseqJoI62/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:43:06'),
(72, '170-447', 'ปฏิบัติการพยาบาลอนามัยชุมชน 2', 'มคอ.6', 2567, 2, 'ชัยสิทธิ์', 'มคอ.6 170-447 ปฏิบัติการพยาบาลอนามัยชุมชน 2.pdf', 'https://drive.google.com/file/d/1UKQrUNHRbHLU8t9RJ7NXMAs_OR4MMnHc/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:43:08'),
(73, '170-452', 'การจัดการทางการพยาบาล', 'มคอ.5', 2567, 2, 'สุจิตราภรณ์', 'มคอ.5 170 - 452 การจัดการทางการพยาบาล.pdf', 'https://drive.google.com/file/d/1iBDpAyJCViiO1kU0pRNJo9oWK7Zd_Fvl/view?usp=drive_web', '2026-08-15 05:10:15', '2026-08-15 06:43:12'),
(74, '170-455', 'ปฏิบัติการพยาบาลรวบยอด', 'มคอ.6', 2567, 2, 'วารุณี', 'มคอ.6 170 - 455 ปฏิบัติการพยาบาลรวบยอด.pdf', 'https://drive.google.com/file/d/14O-9Fgwgy8JELoJkkyewu4g2vMIOAFZV/view?usp=drive_link', '2026-08-15 06:38:46', '2026-08-15 06:43:15'),
(75, '170-337', 'ปฏิบัติการพยาบาลมารดาและทารก', 'มคอ.6', 2567, 3, 'อาจารย์นฤมล อังศิริศักดิ์', 'มคอ.6 170 - 337 ปฏิบัติการพยาบาลมารดาและทารก.pdf', 'https://drive.google.com/file/d/1wFwtXHRCT8Yj81sz6GcD95tFlMyx_N6L/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:00'),
(76, '170-226', 'การพยาบาลผู้ใหญ่ 1', 'มคอ.5', 2567, 3, 'อาจารย์สุนันทา บุญรักษา', 'มคอ.5 170 - 226 การพยาบาลผู้ใหญ่ 1.pdf', 'https://drive.google.com/file/d/1CHHbaowvjfMsbVEbLxdySH1Or7M-IcYL/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:03'),
(77, '170-345', 'ปฏิบัติการพยาบาลอนามัยชุมชน 1', 'มคอ.6', 2567, 3, 'ดร.วราภรณ์ คำรศ', 'มคอ.6 170 - 345 ปฏิบัติการพยาบาลอนามัยชุมชน 1.pdf', 'https://drive.google.com/file/d/1eCgVgZwpzacdagkbI_X2dwLMItC8m-yg/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:06'),
(78, '170-338', 'ปฏิบัติการพยาบาลผดุงครรภ์ 1', 'มคอ.6', 2567, 3, 'ผศ.ภัทรพร อรัณยภาค', 'มคอ.6 170 - 338 ปฏิบัติการพยาบาลผดุงครรภ์ 1.pdf', 'https://drive.google.com/file/d/1W9yjlmZg--0PP7BoxJGMndehxdNlPqjj/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:09'),
(79, '170-213', 'ปฏิบัติการพยาบาลพื้นฐาน', 'มคอ.6', 2557, 3, 'ผศ.ดร.สมฤดี ชื่นกิติญานนท์', 'มคอ.6 170 - 213 ปฏิบัติการพยาบาลพื้นฐาน.pdf', 'https://drive.google.com/file/d/1XUFfv5gqtVv-cZFLAEv_7Q4Z3ZFNNt7N/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:13'),
(80, '170-337', 'ปฏิบัติการพยาบาลมารดาและทารก', 'มคอ.4', 2567, 3, 'อาจารย์นฤมล อังศิริศักดิ์', 'มคอ.4 170 - 337 ปฏิบัติการพยาบาลมารดาและทารก.pdf', 'https://drive.google.com/file/d/1g0miDjrW1x81yzqqq3ssld3ZN2KAv22l/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:16'),
(81, '170-213', 'การปฏิบัติการพยาบาลพื้นฐาน', 'มคอ.4', 2567, 3, 'ผศ.ดร.สมฤดี ชื่นกิติญานนท์', 'มคอ.4 170 - 213 ปฎิบัติการพยาบาลพื้นฐาน.pdf', 'https://drive.google.com/file/d/1HkbCmd5EBTbwIYLcEG3Be1GDxqXC5yFr/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:19'),
(82, '170-338', 'ปฏิบัติการพยาบาลผดุงครรภ์ 1', 'มคอ.4', 2567, 3, 'ผศ.ภัทรพร อรัณยภาค', 'มคอ.4 170 - 338 ปฏิบัติการพยาบาลผดุงครรภ์ 1.pdf', 'https://drive.google.com/file/d/1NSRRHlWxaj5lsRab94xj2_FN9YB0xApb/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:22'),
(83, '170-226', 'การพยาบาลผู้ใหญ่ 1', 'มคอ.3', 2567, 3, 'อาจารย์สุนันทา บุญรักษา', 'มคอ.3 170 - 226 การพยาบาลผู้ใหญ่ 1.pdf', 'https://drive.google.com/file/d/1F3gqha8KLofVPkP5bWqWa9HViOeRbob8/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:27'),
(84, '170-345', 'ปฏิบัติการพยาบาลอนามัยชุมชน 1', 'มคอ.4', 2567, 3, 'ดร.วราภรณ์ คำรศ', 'แบบรายงานการนำส่งรายละเอียดของรายวิชา มคอ.3 - 4 ปีการศึกษา 2567.pdf', 'https://drive.google.com/file/d/1kgpZS91NSZdFyjAR3pTjEGaf2gJRQTMW/view?usp=drive_web', '2026-08-15 06:48:47', '2026-08-15 06:49:30'),
(112, '123-123', 'Test', 'มคอ.3', 2569, 1, 'ผู้ช่วยศาสตราจารย์ภัทรพร อรัณยภาค', 'เทสๆ', 'https://drive.google.com/drive/u/0/folders/1Zcj54jRKUh7BO0UYfX1-kWfkzhiEu80W', '2026-09-27 13:18:11', '2026-09-27 13:18:11'),
(113, '111-111', 'อุอุ', 'มคอ.4', 2569, 1, 'ผู้ช่วยศาสตราจารย์ภัทรพร อรัณยภาค', 'อุอุ', 'https://drive.google.com/drive/u/0/folders/1Zcj54jRKUh7BO0UYfX1-kWfkzhiEu80W', '2026-09-27 15:57:23', '2026-09-27 15:57:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint NOT NULL,
  `username` varchar(100) NOT NULL COMMENT 'ชื่อผู้ใช้ (ห้ามซ้ำ)',
  `password_hash` varchar(255) NOT NULL COMMENT 'รหัสผ่านที่เข้ารหัสแล้ว (ห้ามเก็บ Plain text)',
  `role_id` bigint DEFAULT NULL COMMENT '\r\nNULL = รอ admin มอบบทบาท',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `role_id`, `status`, `created_at`) VALUES
(1, '6603400001', '$argon2id$v=19$m=65536,t=4,p=2$Sy9vM2pzS2VFeWVMZ3BFZw$pMwcXPfPsjsCXaVJYe0l8bkHXBDOHFRq4khZHwwdC4A', 3, 'active', '2026-02-02 09:35:39'),
(4, '41172011', '$argon2id$v=19$m=65536,t=4,p=2$OG1BVTlDQmxOLnJYSUZUZw$NQHVUANZkMv1nLrhmoe+vZVVl0Z7y4UTfzklK+bcQt0', 2, 'active', '2026-02-14 03:47:25'),
(5, '46172040', '$argon2id$v=19$m=65536,t=4,p=2$Zm1NLmo0QzVXU3lubkNvdA$QvL1gAiO1WgSyvkvuBWL/nYKUC3yQtnYu6x8SfDUhmY', 1, 'active', '2026-02-14 16:13:36'),
(6, '41172017', '$argon2id$v=19$m=65536,t=4,p=2$U21GVUx3L0pONnZ5MFhTZg$VX2REtf/JtWh475V7sSOsnAwcY/cVJvgMpIkwMWR+nk', 2, 'active', '2026-02-14 18:02:44'),
(12, '44172033', '$argon2id$v=19$m=65536,t=4,p=2$M28zd09UYmRmMFd1bnBnWg$DyAD5U3Cms23yDyU3DYfhkAbCTnuyxXgMrG5mV5XFrY', 2, 'active', '2026-08-03 08:33:48'),
(13, '40172006', '$argon2id$v=19$m=65536,t=4,p=2$Rk81azJKNkxRS2w0djRyWg$BjrdDmH67i8DfEfSfdU3nZ3xafNmYx6qyCq6P5n61sU', 2, 'active', '2026-08-03 08:35:28'),
(14, '123456', '$argon2id$v=19$m=65536,t=4,p=2$V0hEc3NCMDguNS9WUWd3bA$IXVGvBINDLoPFJJl0+pUw6szKNrwI5xaK0Udd8roj8o', 2, 'active', '2026-08-03 09:28:58'),
(15, '234561', '$argon2id$v=19$m=65536,t=4,p=2$Nkw2aGR0b2xVbEN4UHUuag$8yRe+B9ztmR2xb2mo+0F2qbTSlqOdEwAc8cNK5j1ePY', NULL, 'active', '2026-08-03 09:28:58'),
(16, '380018', '$argon2id$v=19$m=65536,t=4,p=2$VXJEcW95RmdTVUdSRmNydw$RdHLQXSR3hWJs4PrY15fD2i8adAcsKO4e21TneeanQk', 2, 'active', '2026-08-03 09:28:58'),
(17, '382018', '$argon2id$v=19$m=65536,t=4,p=2$Zmt0S0VXbmc1UkNuZXVDaw$ZjWAP2KPP21HnFTmhmCyJJM/1DmQsNe8Ep9OV6sL4ns', NULL, 'active', '2026-08-03 09:28:58'),
(18, '540215', '$argon2id$v=19$m=65536,t=4,p=2$eE94ZDBIbGw2Vk4zVmFMUg$U3+r1Iai2l+QRxs236oNjM0L4KrtEB1oO1K1NLUfGu0', NULL, 'active', '2026-08-03 09:28:59'),
(19, '570205', '$argon2id$v=19$m=65536,t=4,p=2$Vmw2aXhmSXpKaXlhT2tnSw$wK8qS+Vz3yOQUQdOQdLwreKQzrZpXZsUBKSSN4/0Z6s', NULL, 'active', '2026-08-03 09:28:59'),
(20, '650291', '$argon2id$v=19$m=65536,t=4,p=2$bksvN1Q1NEw3YkJnRXlidQ$1Nhjhn8GYE4AKjC1ya36TV7TpW/kIr7eD412Sft8kqY', NULL, 'active', '2026-08-03 09:28:59'),
(21, '980279', '$argon2id$v=19$m=65536,t=4,p=2$VzVkeVNoWHpqcG84SmVDRQ$2vLbr2IXh1/k4XfLEXpB1Tc/4GFfp8V2xdjHwcRo9ZI', NULL, 'active', '2026-08-03 09:28:59'),
(22, '999001', '$argon2id$v=19$m=65536,t=4,p=2$R3V1NHI1eW5lS1VqcnVDNg$wXXEZF5zRS42m0mGJLFSTTBHW741sr//CMpRhGNCeoc', NULL, 'active', '2026-08-03 09:28:59'),
(23, '999002', '$argon2id$v=19$m=65536,t=4,p=2$R2lFVTZheXU4Z3VScnMxYQ$tcHAqWBVUiN9/tmYQDe4MBio1mLVUmN4xBkxA81T+WQ', NULL, 'active', '2026-08-03 09:28:59'),
(24, '999003', '$argon2id$v=19$m=65536,t=4,p=2$ejR6Z1o5d3h2enFPQkE3aQ$7WzxxK8Pb7HdJ8BUs7/JSgsc0cnRZ6V57JepuGmQNYY', NULL, 'active', '2026-08-03 09:28:59'),
(25, '999004', '$argon2id$v=19$m=65536,t=4,p=2$c3Q2WUlsYlY2OEkuWmhOMw$x2kd68z3YYQvYsu3XxoSUUwlSJhNe7L3izC8fw9aJV8', NULL, 'active', '2026-08-03 09:29:00'),
(26, '5200009', '$argon2id$v=19$m=65536,t=4,p=2$Mk12T29yVi8ubzZUdkJhQw$xQQPd0oz9psDnOQt/1lMC8f9uz4ksP9S2PBqvptK1Bw', NULL, 'active', '2026-08-03 09:29:00'),
(27, '41172008', '$argon2id$v=19$m=65536,t=4,p=2$OFIvTlBqd3ZWYW9WbThHNw$8eSL6G0Hk+wV+AnovSBYTWo6DqVhbPVfDJ9RLyjIFbg', NULL, 'active', '2026-08-03 09:29:00'),
(28, '42172021', '$argon2id$v=19$m=65536,t=4,p=2$cEJHT25JbXpOSVJVQS9ibQ$p64SKa3dZSzczH/46Zver8LD6incu5NtMTnxnEag4x0', NULL, 'active', '2026-08-03 09:29:00'),
(29, '42172025', '$argon2id$v=19$m=65536,t=4,p=2$L1BHTm1ybkZGTjdFWUZLQg$U95g6RbCtuGA8y0Rjh0avyDe/Hp4HJlD4slE1Xht80Y', NULL, 'active', '2026-08-03 09:29:00'),
(30, '45172037', '$argon2id$v=19$m=65536,t=4,p=2$c2UzSGhVL3JXYkxlY0lzSg$LyYkuUvpPs5QxCHAXiYUK3129yjnEUkbYAoxzT2vbiE', NULL, 'active', '2026-08-03 09:29:00'),
(31, '45172038', '$argon2id$v=19$m=65536,t=4,p=2$N0VvTVVDc01xWDhhWmYzbg$GpY88EdrMFBMIX1EDlaxyp7srUqQVu+psWk5nYF1k94', NULL, 'active', '2026-08-03 09:29:00'),
(32, '47172044', '$argon2id$v=19$m=65536,t=4,p=2$cnZ2R1hxR3JWOFVBbHNadA$3tTGuna6Zgylv+bfpD0+Bd4pkTrsRLCMeaOPt0pxDAw', NULL, 'active', '2026-08-03 09:29:01'),
(33, '47172046', '$argon2id$v=19$m=65536,t=4,p=2$WExPQmJUTXZRTFJOOC9XZw$nHcXt1QLxB4Sd5QVIPX6mmKAwJ2js6uR39CuHJDavec', NULL, 'active', '2026-08-03 09:29:01'),
(34, '47172047', '$argon2id$v=19$m=65536,t=4,p=2$Vy5ST0tzZW1nSlZsVkhIcA$XAQ+MhpMzgfCzA3wBgRrIO+c/Ho92UZ4N043XpxvADU', NULL, 'active', '2026-08-03 09:29:01'),
(35, '47172049', '$argon2id$v=19$m=65536,t=4,p=2$RlVUdUJqRXFobnhWNUtSQg$kWZyBF9on0hKCwuaBHd+2jZgyiEl5eXmx7u5qc8kTL4', NULL, 'active', '2026-08-03 09:29:01'),
(36, '49172053', '$argon2id$v=19$m=65536,t=4,p=2$MDRxSVpRQUkya0Y2MkJrZg$j1LqX/S8MKJXU2vB2UIRloE7daViZgghYQ0qOejvKBI', NULL, 'active', '2026-08-03 09:29:01'),
(37, '49172054', '$argon2id$v=19$m=65536,t=4,p=2$UTJsamF1OHdGT1g0QjZKNg$8nmwGpCrb3t5Ppkc68c6Zqn3iOmowfP5la350N+XmJM', NULL, 'active', '2026-08-03 09:29:01'),
(38, '50172059', '$argon2id$v=19$m=65536,t=4,p=2$U1JmT0tmQ2dVeVhPaUtQbQ$yLhmtxlfstfoa0NfKuUWt/2pCN4N8ZVLolpxrbQg1fY', NULL, 'active', '2026-08-03 09:29:01'),
(39, '51162072', '$argon2id$v=19$m=65536,t=4,p=2$dDFzbXN1WG9QMmZxNXlzUQ$uLmAxzC6fTksIaI9syv0AI3eSKhkmhEg6A1udtSD0/c', NULL, 'active', '2026-08-03 09:29:01'),
(40, '52172065', '$argon2id$v=19$m=65536,t=4,p=2$MzdwLy5QZTBnRktGWENzNg$EUYLDC3p3/XfisrYTUd8PN7y7rnOT7Cm2f+3kYkrNqQ', NULL, 'active', '2026-08-03 09:29:02'),
(41, '53172079', '$argon2id$v=19$m=65536,t=4,p=2$Z3hmV0txbkVhcjh2ODRZcA$Wfxcho5Mam44eTWgM9/eT3xID/B44iVEH+ZLHrmTiu4', NULL, 'active', '2026-08-03 09:29:02'),
(42, '54127262', '$argon2id$v=19$m=65536,t=4,p=2$NU5OWXVQaGZGYjhiQ3g5aQ$NYmKkQ77/BopVI+ht+twBvy0XqqZ08JvuVvIo3wgvk4', NULL, 'active', '2026-08-03 09:29:02'),
(43, '54172071', '$argon2id$v=19$m=65536,t=4,p=2$Y1dSeTZjR2RJVUt2MFVwag$kMVSvlyZk+Bkuk4MuszNJkgRKnC1aWktpZR1bkgze+s', NULL, 'active', '2026-08-03 09:29:02'),
(44, '54172078', '$argon2id$v=19$m=65536,t=4,p=2$MC9WR0ZGa3VJUG1NNmhwVQ$8vnA4QeTGHjCSlxppbp8xXHmrsZrVWO3ZX96ERpovkw', NULL, 'active', '2026-08-03 09:29:02'),
(45, '54172085', '$argon2id$v=19$m=65536,t=4,p=2$bDhYQUZSOE9OUmRBNXF6MA$oTjhyYsDrNW4WTMMnDMxDy3GfZrDYfIhBJ7YqhKWBQE', NULL, 'active', '2026-08-03 09:29:02'),
(46, '56172088', '$argon2id$v=19$m=65536,t=4,p=2$NEtCSTZVTlBtRzJndHExUQ$uMOXxDBenMZ94nujOAlSdCe6IR8X/WjKHy5t7QA08IQ', NULL, 'active', '2026-08-03 09:29:02'),
(47, '56172089', '$argon2id$v=19$m=65536,t=4,p=2$MVB3SzFGTDM0OHFFNXFwMg$t/QPUPBCTvr3bz285/vPjJOQNYaSxaKFAZtWreoWxIs', NULL, 'active', '2026-08-03 09:29:02'),
(48, '56172103', '$argon2id$v=19$m=65536,t=4,p=2$Zk8yMVEwQnJ3VGZLMmRZeA$K8d6UlgXx2MKiDNaSQcHGLEIso3phuFiTOAE6hQ8oKA', NULL, 'active', '2026-08-03 09:29:03'),
(49, '56172104', '$argon2id$v=19$m=65536,t=4,p=2$eE1NbUtRVy5tMnpYZFhoZA$HIWrdE4kIXfRS9nT1blA18E+abuFP1HZQaDSbJ43Xyc', NULL, 'active', '2026-08-03 09:29:03'),
(50, '57172108', '$argon2id$v=19$m=65536,t=4,p=2$c3BBNk1KR0h0SmtmWFF1SQ$ontVF2rB/eopC4cQja+ncXVQJD3Ioypom2cLWVfiY1s', NULL, 'active', '2026-08-03 09:29:03'),
(51, '57172109', '$argon2id$v=19$m=65536,t=4,p=2$YTZRcEcxcHJwVWRCR3hQbQ$w0n9dhQKuCizBS1P0RphFHmjsgaT7hYVykk4twEeyoY', NULL, 'active', '2026-08-03 09:29:03'),
(52, '58172110', '$argon2id$v=19$m=65536,t=4,p=2$czF0ZTlLWHk2TUo1Wm45bA$9P0ADT3QNBfZl+q56/PT8ru8bmQgwmlcZxV8EbHzfag', NULL, 'active', '2026-08-03 09:29:03'),
(53, '59172119', '$argon2id$v=19$m=65536,t=4,p=2$Z3hrZkZYY1BCaDc0Yy45Qw$W6Lk1izD+DTFYLnIKnlj7UG16nXKrsBmE8jZiH9xJ1Q', NULL, 'active', '2026-08-03 09:29:03'),
(54, '59172121', '$argon2id$v=19$m=65536,t=4,p=2$NGhja1Q2cUZFT1Vnd0VJWA$VqpjCR5ytUZhICB2a3Canp1AqJNaIy6SaqQ+Gmibjq0', NULL, 'active', '2026-08-03 09:29:03'),
(55, '60172123', '$argon2id$v=19$m=65536,t=4,p=2$QTZQczE1MnBmbXU0N0JFMg$hjLSdEjdeM1JrxSGfZ64cyTfD/S62c7cC508gT+MA3s', NULL, 'active', '2026-08-03 09:29:04'),
(56, '63172128', '$argon2id$v=19$m=65536,t=4,p=2$SEltUTRxQkVPdU81Uk4wZQ$AKlfH7Sy9HO13yzp7k88Z+WS4EFWbgSdWwER9NIb7a4', NULL, 'active', '2026-08-03 09:29:04'),
(57, '63172129', '$argon2id$v=19$m=65536,t=4,p=2$bWx6SlRYWHQxZmZ0OVBlZA$xecoAEMWejc4NfSf/7/BYGf6SV1brgUI3tpbcUbX+rY', NULL, 'active', '2026-08-03 09:29:04'),
(58, '64172139', '$argon2id$v=19$m=65536,t=4,p=2$ZUx3TlJPbTRETThEN2JmLw$bujfGy3Z4iJ/ehhTbX0gPgwpNx+gm5WAkYX4N3mqzqk', NULL, 'active', '2026-08-03 09:29:04'),
(59, '65172141', '$argon2id$v=19$m=65536,t=4,p=2$dUExS0I1TVZhcmRWS0FTZw$tGguGcDjrwgnS/I24prVL7ZLt4JRk4IICqFl6XCbHWM', NULL, 'active', '2026-08-03 09:29:04'),
(60, '65172145', '$argon2id$v=19$m=65536,t=4,p=2$Z2loWG5Kc1pWWkguT3pHOQ$fPJP4GlOo0Vx+Sebb6JnJS6DQkpxMz5Jk6fj23GskRQ', NULL, 'active', '2026-08-03 09:29:04'),
(61, '66172146', '$argon2id$v=19$m=65536,t=4,p=2$aFduNDlNVi5GamtrRDhMMg$fb79+NmUusy0JZP7Othen2muRau7D70FDV+Rg87ZfiY', NULL, 'active', '2026-08-03 09:29:04'),
(62, '9003', '$argon2id$v=19$m=65536,t=4,p=2$V1lXTEtpTkNsNmFqZEtINQ$hAYOkorEOyq+MedBJP7ii5d1TufRC41yU0KKRVZFki8', NULL, 'active', '2026-09-24 07:35:50'),
(63, '9004', '$argon2id$v=19$m=65536,t=4,p=2$c3Vub2xTUUVYZGNuVlRmdw$fmYMHlo4JYvJJ9CYdKK6YFDbhVSFKoxZJDDpok3QLR8', NULL, 'active', '2026-09-24 07:35:50'),
(64, '9005', '$argon2id$v=19$m=65536,t=4,p=2$ZklsQjZBVWZYQUI3eC5naw$YIy8L1tB9AC+BP7p3iyfcQv8vUZJjYR6tgOkfGSOSl8', NULL, 'active', '2026-09-24 07:35:50'),
(66, '11111111', '$argon2id$v=19$m=65536,t=4,p=2$VGFpZ1BwZzA1dThKYks3Sg$ZiHQzCUNfwlfxj0hf5n0sLwcH+OEakl4iTYUIkAyzt4', NULL, 'active', '2026-09-24 16:28:38'),
(67, '22222222', '$argon2id$v=19$m=65536,t=4,p=2$SWZPeTBBVFBHVWFZbVFKSQ$NIGvHHcqfPtRrbL5ryNJbz/Vpwj3EtqJ8dp2uxYVthQ', NULL, 'active', '2026-09-25 08:25:16'),
(68, '6604800008', '$argon2id$v=19$m=65536,t=4,p=2$aXY1SFhhRXAwU3V0bXFwSw$E8z8Nz1mcJjyAoDgcdff3E3VI7QuF2Ib/qsr8U2vt7M', 3, 'active', '2026-09-25 08:27:54'),
(73, '33333333', '$argon2id$v=19$m=65536,t=4,p=2$cm5DWEhidG5LaklUeEJwNA$TYekHxVWeK2I2A5uGenITcylaBVpLK9X/zv/xEJey0w', NULL, 'active', '2026-09-25 12:36:44');

-- --------------------------------------------------------

--
-- Table structure for table `user_notification_settings`
--

CREATE TABLE `user_notification_settings` (
  `user_id` bigint NOT NULL,
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `grade_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `project_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `student_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

--
-- Dumping data for table `user_position`
--

INSERT INTO `user_position` (`user_position_id`, `user_id`, `position_id`, `is_primary`, `effective_from`, `effective_to`) VALUES
(1, 4, 5, 1, NULL, NULL),
(2, 5, 7, 1, NULL, NULL),
(3, 6, 1, 1, NULL, NULL),
(18, 1, 8, 1, NULL, NULL),
(96, 14, 2, 1, NULL, NULL),
(182, 12, 2, 1, NULL, NULL),
(183, 12, 6, 0, NULL, NULL),
(184, 12, 5, 0, NULL, NULL),
(185, 12, 3, 0, NULL, NULL),
(186, 12, 4, 0, NULL, NULL),
(187, 12, 9, 0, NULL, NULL),
(188, 16, 6, 1, NULL, NULL),
(189, 16, 3, 0, NULL, NULL),
(190, 16, 4, 0, NULL, NULL);

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
-- Indexes for table `advisor_transfer_request`
--
ALTER TABLE `advisor_transfer_request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_transfer_student` (`student_id`),
  ADD KEY `idx_transfer_from_advisor` (`from_advisor_id`),
  ADD KEY `idx_transfer_to_advisor` (`to_advisor_id`),
  ADD KEY `idx_transfer_status` (`status`),
  ADD KEY `idx_transfer_created_by` (`created_by`),
  ADD KEY `idx_transfer_reviewed_by` (`reviewed_by`);

--
-- Indexes for table `annual_project_report_budgets`
--
ALTER TABLE `annual_project_report_budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_report_budget_item_type_source` (`report_item_id`,`budget_type`,`source_key`),
  ADD KEY `idx_report_budget_type` (`budget_type`),
  ADD KEY `idx_report_budget_source` (`source_key`);

--
-- Indexes for table `annual_project_report_documents`
--
ALTER TABLE `annual_project_report_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_document_item` (`report_item_id`),
  ADD KEY `idx_report_document_type` (`document_type`);

--
-- Indexes for table `annual_project_report_items`
--
ALTER TABLE `annual_project_report_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_item_year` (`academic_year`),
  ADD KEY `idx_report_item_project_code` (`project_code`),
  ADD KEY `idx_report_item_row_type` (`row_type`),
  ADD KEY `idx_report_item_parent` (`parent_item_id`),
  ADD KEY `idx_report_item_batch` (`import_batch_id`);

--
-- Indexes for table `approval_requests`
--
ALTER TABLE `approval_requests`
  ADD PRIMARY KEY (`approval_request_id`),
  ADD KEY `idx_approval_requests_status` (`status`),
  ADD KEY `idx_approval_requests_type` (`request_type`),
  ADD KEY `idx_approval_requests_requester` (`requester_user_id`),
  ADD KEY `idx_approval_requests_reviewer` (`reviewed_by`);

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
-- Indexes for table `competency_items`
--
ALTER TABLE `competency_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `curriculum_clo`
--
ALTER TABLE `curriculum_clo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_curriculum_clo_subject` (`framework_id`,`subject_code`);

--
-- Indexes for table `curriculum_clo_plo`
--
ALTER TABLE `curriculum_clo_plo`
  ADD PRIMARY KEY (`clo_id`,`plo_id`),
  ADD KEY `idx_curriculum_clo_plo_plo` (`plo_id`);

--
-- Indexes for table `curriculum_clo_sub_plo`
--
ALTER TABLE `curriculum_clo_sub_plo`
  ADD PRIMARY KEY (`clo_id`,`sub_plo_id`),
  ADD KEY `idx_curriculum_clo_sub_plo_sub` (`sub_plo_id`);

--
-- Indexes for table `curriculum_cycle`
--
ALTER TABLE `curriculum_cycle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_cycle_years` (`start_year`,`end_year`);

--
-- Indexes for table `curriculum_cycle_subject`
--
ALTER TABLE `curriculum_cycle_subject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_cycle_subject_code` (`cycle_id`,`subject_code`);

--
-- Indexes for table `curriculum_documents`
--
ALTER TABLE `curriculum_documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_curriculum_document_uid` (`framework_id`,`document_uid`),
  ADD KEY `idx_curriculum_documents_subject` (`framework_id`,`subject_code`),
  ADD KEY `idx_curriculum_documents_created_by` (`created_by`);

--
-- Indexes for table `curriculum_framework`
--
ALTER TABLE `curriculum_framework`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `curriculum_plo`
--
ALTER TABLE `curriculum_plo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_plo_code` (`framework_id`,`plo_code`);

--
-- Indexes for table `curriculum_report_stats`
--
ALTER TABLE `curriculum_report_stats`
  ADD PRIMARY KEY (`stat_id`),
  ADD UNIQUE KEY `uq_type_code` (`type`,`code_name`);

--
-- Indexes for table `curriculum_subject_meta`
--
ALTER TABLE `curriculum_subject_meta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_subject_meta` (`framework_id`,`subject_code`);

--
-- Indexes for table `curriculum_subject_plo`
--
ALTER TABLE `curriculum_subject_plo`
  ADD PRIMARY KEY (`subject_meta_id`,`plo_id`),
  ADD KEY `idx_curriculum_subject_plo_plo` (`plo_id`);

--
-- Indexes for table `curriculum_sub_plo`
--
ALTER TABLE `curriculum_sub_plo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_sub_plo_year_code` (`framework_id`,`plo_id`,`year_level`,`code`),
  ADD KEY `idx_curriculum_sub_plo_plo` (`plo_id`),
  ADD KEY `idx_curriculum_sub_plo_framework` (`framework_id`);

--
-- Indexes for table `curriculum_ylo_plo`
--
ALTER TABLE `curriculum_ylo_plo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_curriculum_ylo_plo` (`framework_id`,`ylo_code`,`plo_id`),
  ADD KEY `idx_curriculum_ylo_plo_plo` (`plo_id`);

--
-- Indexes for table `degree`
--
ALTER TABLE `degree`
  ADD PRIMARY KEY (`degree_id`),
  ADD KEY `fk_degree_faculty` (`faculty_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_enrollment_student_id` (`student_id`),
  ADD KEY `idx_enrollment_subject_id` (`subject_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `idx_faculty_id_auto` (`id`),
  ADD KEY `idx_faculty_user_id` (`user_id`);

--
-- Indexes for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_license_reminders`
--
ALTER TABLE `faculty_license_reminders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_license_reminder_stage` (`faculty_id`,`license_expiry`,`stage_months`);

--
-- Indexes for table `faculty_personnel_development`
--
ALTER TABLE `faculty_personnel_development`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faculty` (`faculty_id`);

--
-- Indexes for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD PRIMARY KEY (`research_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `idx_faculty_research_reporting` (`publication_year`,`work_category`,`funding_type`,`irb_approved`);

--
-- Indexes for table `faculty_teaching_workloads`
--
ALTER TABLE `faculty_teaching_workloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faculty` (`faculty_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `fk_grades_subject` (`subject_id`),
  ADD KEY `fk_grades_student` (`student_id`);

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
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sender_user_id` (`sender_user_id`);

--
-- Indexes for table `notification_hidden`
--
ALTER TABLE `notification_hidden`
  ADD PRIMARY KEY (`notification_id`,`user_id`),
  ADD KEY `idx_notification_hidden_user` (`user_id`);

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
  ADD KEY `plo_ibfk_1` (`program_id`);

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
  ADD KEY `responsible_faculty_id` (`responsible_faculty_id`),
  ADD KEY `idx_project_responsible_faculty_id` (`responsible_faculty_id`),
  ADD KEY `idx_project_type_year` (`project_type`,`academic_year`);

--
-- Indexes for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  ADD PRIMARY KEY (`project_budget_years_id`),
  ADD UNIQUE KEY `uq_project_budget_year` (`project_id`,`fiscal_year`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_documents_project_id` (`project_id`),
  ADD KEY `idx_project_documents_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `project_end_reminders`
--
ALTER TABLE `project_end_reminders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_end_reminder_stage` (`project_id`,`end_date`,`stage_days`);

--
-- Indexes for table `project_faculty_members`
--
ALTER TABLE `project_faculty_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_faculty_member` (`project_id`,`faculty_id`),
  ADD KEY `idx_project_faculty_members_project` (`project_id`),
  ADD KEY `idx_project_faculty_members_faculty` (`faculty_id`);

--
-- Indexes for table `project_outcome_links`
--
ALTER TABLE `project_outcome_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_outcome_link` (`project_id`,`outcome_type`,`outcome_code`);

--
-- Indexes for table `project_participants`
--
ALTER TABLE `project_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_participant` (`project_id`,`student_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `project_progress_logs`
--
ALTER TABLE `project_progress_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_progress_project` (`project_id`);

--
-- Indexes for table `project_satisfaction_responses`
--
ALTER TABLE `project_satisfaction_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_project_satisfaction_student` (`project_id`,`student_id`);

--
-- Indexes for table `report_import_batches`
--
ALTER TABLE `report_import_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_import_year` (`academic_year`),
  ADD KEY `idx_report_import_source` (`source_type`),
  ADD KEY `idx_report_import_status` (`status`);

--
-- Indexes for table `research_journals`
--
ALTER TABLE `research_journals`
  ADD PRIMARY KEY (`journal_id`),
  ADD UNIQUE KEY `uq_research_journal_name` (`journal_name`);

--
-- Indexes for table `research_publications`
--
ALTER TABLE `research_publications`
  ADD PRIMARY KEY (`publication_id`),
  ADD UNIQUE KEY `uq_research_doi` (`doi`),
  ADD KEY `idx_research_publication_date` (`publication_date`),
  ADD KEY `idx_research_journal_id` (`journal_id`);

--
-- Indexes for table `research_publication_authors`
--
ALTER TABLE `research_publication_authors`
  ADD PRIMARY KEY (`publication_author_id`),
  ADD UNIQUE KEY `uq_research_publication_faculty_role` (`publication_id`,`faculty_id`,`author_role`),
  ADD KEY `idx_research_author_faculty` (`faculty_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `schedule_tasks`
--
ALTER TABLE `schedule_tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `fk_tasks_student` (`student_id`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `idx_student_id_auto` (`id`),
  ADD KEY `idx_student_user_id` (`user_id`),
  ADD KEY `fk_student_program` (`program_id`);

--
-- Indexes for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  ADD PRIMARY KEY (`mapping_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `student_clo_results`
--
ALTER TABLE `student_clo_results`
  ADD PRIMARY KEY (`result_id`),
  ADD UNIQUE KEY `uq_student_clo_result` (`student_id`,`subject_id`,`clo_id`,`academic_year`,`semester`),
  ADD KEY `idx_student_clo_results_subject_year` (`subject_id`,`academic_year`,`semester`),
  ADD KEY `idx_student_clo_results_clo` (`clo_id`),
  ADD KEY `idx_student_clo_results_assessed_by` (`assessed_by`);

--
-- Indexes for table `student_clo_sub_scores`
--
ALTER TABLE `student_clo_sub_scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_clo_sub` (`subject_id`,`student_id`,`clo_id`,`sub_plo_code`),
  ADD KEY `idx_subject_student` (`subject_id`,`student_id`);

--
-- Indexes for table `student_competency_assessments`
--
ALTER TABLE `student_competency_assessments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_student_item_year` (`student_id`,`competency_item_id`,`academic_year`);

--
-- Indexes for table `student_course_registrations`
--
ALTER TABLE `student_course_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_reg` (`student_id`);

--
-- Indexes for table `student_health_records`
--
ALTER TABLE `student_health_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_student_health_year` (`student_id`,`year_level`);

--
-- Indexes for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  ADD PRIMARY KEY (`attempt_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_project_outcome_results`
--
ALTER TABLE `student_project_outcome_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_project_outcome` (`project_id`,`student_id`,`project_outcome_link_id`),
  ADD KEY `idx_student_project_outcome_link` (`project_id`,`project_outcome_link_id`),
  ADD KEY `idx_student_project_outcome_assessor` (`assessed_by`);

--
-- Indexes for table `student_term_grades`
--
ALTER TABLE `student_term_grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_grade` (`student_id`);

--
-- Indexes for table `student_vaccinations`
--
ALTER TABLE `student_vaccinations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `idx_subject_program_id` (`program_id`);

--
-- Indexes for table `sub_plo`
--
ALTER TABLE `sub_plo`
  ADD PRIMARY KEY (`id`,`subject_id`);

--
-- Indexes for table `system_job_runs`
--
ALTER TABLE `system_job_runs`
  ADD PRIMARY KEY (`job_name`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `idx_permission` (`permission_required`);

--
-- Indexes for table `tqf_documents`
--
ALTER TABLE `tqf_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `idx_users_role_id` (`role_id`);

--
-- Indexes for table `user_notification_settings`
--
ALTER TABLE `user_notification_settings`
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
  MODIFY `advice_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `advisor_transfer_request`
--
ALTER TABLE `advisor_transfer_request`
  MODIFY `request_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `annual_project_report_budgets`
--
ALTER TABLE `annual_project_report_budgets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=520;

--
-- AUTO_INCREMENT for table `annual_project_report_documents`
--
ALTER TABLE `annual_project_report_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `annual_project_report_items`
--
ALTER TABLE `annual_project_report_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=445;

--
-- AUTO_INCREMENT for table `approval_requests`
--
ALTER TABLE `approval_requests`
  MODIFY `approval_request_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `assessments_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `audit_log_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=908;

--
-- AUTO_INCREMENT for table `competency_items`
--
ALTER TABLE `competency_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `curriculum_clo`
--
ALTER TABLE `curriculum_clo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `curriculum_cycle`
--
ALTER TABLE `curriculum_cycle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `curriculum_cycle_subject`
--
ALTER TABLE `curriculum_cycle_subject`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `curriculum_documents`
--
ALTER TABLE `curriculum_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `curriculum_plo`
--
ALTER TABLE `curriculum_plo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `curriculum_report_stats`
--
ALTER TABLE `curriculum_report_stats`
  MODIFY `stat_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `curriculum_subject_meta`
--
ALTER TABLE `curriculum_subject_meta`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT for table `curriculum_sub_plo`
--
ALTER TABLE `curriculum_sub_plo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `curriculum_ylo_plo`
--
ALTER TABLE `curriculum_ylo_plo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `degree`
--
ALTER TABLE `degree`
  MODIFY `degree_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `enrollment_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  MODIFY `record_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_license_reminders`
--
ALTER TABLE `faculty_license_reminders`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faculty_personnel_development`
--
ALTER TABLE `faculty_personnel_development`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_research`
--
ALTER TABLE `faculty_research`
  MODIFY `research_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `faculty_teaching_workloads`
--
ALTER TABLE `faculty_teaching_workloads`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `import_history`
--
ALTER TABLE `import_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

--
-- AUTO_INCREMENT for table `plo`
--
ALTER TABLE `plo`
  MODIFY `plo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `portfolio_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  MODIFY `project_budget_years_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `project_documents`
--
ALTER TABLE `project_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT for table `project_end_reminders`
--
ALTER TABLE `project_end_reminders`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_faculty_members`
--
ALTER TABLE `project_faculty_members`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `project_outcome_links`
--
ALTER TABLE `project_outcome_links`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `project_participants`
--
ALTER TABLE `project_participants`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_progress_logs`
--
ALTER TABLE `project_progress_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_satisfaction_responses`
--
ALTER TABLE `project_satisfaction_responses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_import_batches`
--
ALTER TABLE `report_import_batches`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `research_journals`
--
ALTER TABLE `research_journals`
  MODIFY `journal_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_publications`
--
ALTER TABLE `research_publications`
  MODIFY `publication_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_publication_authors`
--
ALTER TABLE `research_publication_authors`
  MODIFY `publication_author_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schedule_tasks`
--
ALTER TABLE `schedule_tasks`
  MODIFY `task_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=138;

--
-- AUTO_INCREMENT for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  MODIFY `mapping_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `student_clo_results`
--
ALTER TABLE `student_clo_results`
  MODIFY `result_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_clo_sub_scores`
--
ALTER TABLE `student_clo_sub_scores`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `student_competency_assessments`
--
ALTER TABLE `student_competency_assessments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `student_course_registrations`
--
ALTER TABLE `student_course_registrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_health_records`
--
ALTER TABLE `student_health_records`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  MODIFY `attempt_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_project_outcome_results`
--
ALTER TABLE `student_project_outcome_results`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_term_grades`
--
ALTER TABLE `student_term_grades`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_vaccinations`
--
ALTER TABLE `student_vaccinations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=328;

--
-- AUTO_INCREMENT for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  MODIFY `menu_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `tqf_documents`
--
ALTER TABLE `tqf_documents`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `user_position`
--
ALTER TABLE `user_position`
  MODIFY `user_position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

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
  ADD CONSTRAINT `advice_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `advisor_transfer_request`
--
ALTER TABLE `advisor_transfer_request`
  ADD CONSTRAINT `fk_transfer_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_from_advisor` FOREIGN KEY (`from_advisor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transfer_to_advisor` FOREIGN KEY (`to_advisor_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `annual_project_report_budgets`
--
ALTER TABLE `annual_project_report_budgets`
  ADD CONSTRAINT `fk_report_budget_item` FOREIGN KEY (`report_item_id`) REFERENCES `annual_project_report_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `annual_project_report_documents`
--
ALTER TABLE `annual_project_report_documents`
  ADD CONSTRAINT `fk_report_document_item` FOREIGN KEY (`report_item_id`) REFERENCES `annual_project_report_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `annual_project_report_items`
--
ALTER TABLE `annual_project_report_items`
  ADD CONSTRAINT `fk_report_item_batch` FOREIGN KEY (`import_batch_id`) REFERENCES `report_import_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_report_item_parent` FOREIGN KEY (`parent_item_id`) REFERENCES `annual_project_report_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`ylo_id`) REFERENCES `ylo` (`ylo_id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `curriculum_clo`
--
ALTER TABLE `curriculum_clo`
  ADD CONSTRAINT `fk_curriculum_clo_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_clo_plo`
--
ALTER TABLE `curriculum_clo_plo`
  ADD CONSTRAINT `fk_curriculum_clo_plo_clo` FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_curriculum_clo_plo_plo` FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_clo_sub_plo`
--
ALTER TABLE `curriculum_clo_sub_plo`
  ADD CONSTRAINT `fk_curriculum_clo_sub_plo_clo` FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_curriculum_clo_sub_plo_sub` FOREIGN KEY (`sub_plo_id`) REFERENCES `curriculum_sub_plo` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_cycle_subject`
--
ALTER TABLE `curriculum_cycle_subject`
  ADD CONSTRAINT `fk_curriculum_cycle_subject_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `curriculum_cycle` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_documents`
--
ALTER TABLE `curriculum_documents`
  ADD CONSTRAINT `fk_curriculum_documents_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_curriculum_documents_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `curriculum_plo`
--
ALTER TABLE `curriculum_plo`
  ADD CONSTRAINT `fk_curriculum_plo_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `curriculum_subject_meta`
--
ALTER TABLE `curriculum_subject_meta`
  ADD CONSTRAINT `fk_curriculum_subject_meta_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_subject_plo`
--
ALTER TABLE `curriculum_subject_plo`
  ADD CONSTRAINT `fk_curriculum_subject_plo_meta` FOREIGN KEY (`subject_meta_id`) REFERENCES `curriculum_subject_meta` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_curriculum_subject_plo_plo` FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_sub_plo`
--
ALTER TABLE `curriculum_sub_plo`
  ADD CONSTRAINT `fk_curriculum_sub_plo_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_curriculum_sub_plo_plo` FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_ylo_plo`
--
ALTER TABLE `curriculum_ylo_plo`
  ADD CONSTRAINT `fk_curriculum_ylo_plo_framework` FOREIGN KEY (`framework_id`) REFERENCES `curriculum_framework` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_curriculum_ylo_plo_plo` FOREIGN KEY (`plo_id`) REFERENCES `curriculum_plo` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollment_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `fk_grades_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- Constraints for table `plo`
--
ALTER TABLE `plo`
  ADD CONSTRAINT `plo_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD CONSTRAINT `portfolio_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

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
  ADD CONSTRAINT `fk_project_responsible_faculty` FOREIGN KEY (`responsible_faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  ADD CONSTRAINT `project_budget_years_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD CONSTRAINT `fk_project_documents_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_project_documents_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `project_end_reminders`
--
ALTER TABLE `project_end_reminders`
  ADD CONSTRAINT `fk_project_end_reminders_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `project_faculty_members`
--
ALTER TABLE `project_faculty_members`
  ADD CONSTRAINT `fk_project_faculty_members_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_faculty_members_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_outcome_links`
--
ALTER TABLE `project_outcome_links`
  ADD CONSTRAINT `fk_project_outcome_links_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `project_participants`
--
ALTER TABLE `project_participants`
  ADD CONSTRAINT `fk_pp_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pp_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `project_progress_logs`
--
ALTER TABLE `project_progress_logs`
  ADD CONSTRAINT `fk_project_progress_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedule_tasks`
--
ALTER TABLE `schedule_tasks`
  ADD CONSTRAINT `fk_tasks_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `fk_student_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  ADD CONSTRAINT `student_advisor_mapping_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `student_clo_results`
--
ALTER TABLE `student_clo_results`
  ADD CONSTRAINT `fk_student_clo_results_assessor` FOREIGN KEY (`assessed_by`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_clo_results_clo` FOREIGN KEY (`clo_id`) REFERENCES `curriculum_clo` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_student_clo_results_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_clo_results_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE RESTRICT;

--
-- Constraints for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  ADD CONSTRAINT `student_license_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `fk_subject_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_notification_settings`
--
ALTER TABLE `user_notification_settings`
  ADD CONSTRAINT `user_notification_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
