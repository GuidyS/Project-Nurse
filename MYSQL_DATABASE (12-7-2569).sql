-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jul 11, 2026 at 10:57 PM
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
(3, 6603400004, 5, 'ปรับตัวเข้ากับการเรียน', 'personal', 'ให้คำปรึกษาเรื่องการปรับตัว แนะนำเข้าร่วมกิจกรรมของคณะ', '2026-07-10 10:17:10');

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
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `review_note` text,
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `approval_requests`
--

INSERT INTO `approval_requests` (`approval_request_id`, `request_type`, `requester_user_id`, `target_ref_type`, `target_ref_id`, `title`, `description`, `payload_json`, `status`, `review_note`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 'grade_change', 2, 'assessment', '64010001-NUR101', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101', '{\"reason\": \"ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101\", \"student_id\": \"64010001\", \"subject_code\": \"NUR101\", \"current_grade\": \"B+\", \"requested_grade\": \"A\"}', 'pending', NULL, NULL, NULL, '2024-01-15 09:00:00', '2026-07-11 10:57:09'),
(2, 'student_transfer', 3, 'student', '65010002', 'ขอรับมอบนักศึกษา', 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม', '{\"reason\": \"ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม\", \"student_id\": \"65010002\", \"to_advisor_user_id\": 3, \"from_advisor_user_id\": 2}', 'pending', NULL, NULL, NULL, '2024-01-14 10:30:00', '2026-07-11 10:57:09'),
(3, 'project_request', 4, 'project', 'research-skill-development', 'ขอเปิดโครงการวิจัย', 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล', '{\"reason\": \"ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล\", \"project_id\": null, \"project_name\": \"การพัฒนาทักษะการพยาบาล\", \"academic_year\": 2568, \"budget_requested\": 50000.00}', 'pending', NULL, NULL, NULL, '2024-01-12 13:15:00', '2026-07-11 10:57:09'),
(4, 'document_approve', 6, 'document', 'TQF3-NUR301', 'ขออนุมัติเอกสาร', 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301', '{\"reason\": \"ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301\", \"file_path\": null, \"document_ref\": \"TQF3-NUR301\", \"document_type\": \"TQF 3\", \"document_title\": \"TQF 3 รายวิชา NUR301\"}', 'approved', NULL, 5, '2024-01-11 11:00:00', '2024-01-10 08:45:00', '2026-07-11 10:57:09'),
(5, 'grade_change', 7, 'assessment', '63010005-NUR401', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401', '{\"reason\": \"ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401\", \"student_id\": \"63010005\", \"subject_code\": \"NUR401\", \"current_grade\": \"C\", \"requested_grade\": \"B\"}', 'rejected', NULL, 5, '2024-01-09 15:20:00', '2024-01-08 14:00:00', '2026-07-11 10:57:09'),
(6, 'performance_eval', 10, 'student', '6603400001', 'การประเมิน Performance', '{\"skill\":4,\"attitude\":4,\"knowledge\":4,\"communication\":4,\"overall\":4,\"comment\":\"fjkdslafjkdlsa;fjs\"}', '{\"skill\": 4, \"comment\": \"fjkdslafjkdlsa;fjs\", \"overall\": 4, \"attitude\": 4, \"knowledge\": 4, \"communication\": 4}', 'approved', NULL, NULL, NULL, '2026-07-10 08:58:41', '2026-07-11 10:57:09');

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
(7, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-24 19:53:02'),
(8, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 15:09:03'),
(9, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 15:31:22'),
(10, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 15:59:35'),
(11, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 16:46:02'),
(20, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 17:52:31'),
(22, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:19:23'),
(24, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:37:41'),
(26, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:39:47'),
(27, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:48:21'),
(28, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:48:40'),
(30, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:49:34'),
(32, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:50:35'),
(33, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:50:52'),
(34, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:57:33'),
(36, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:59:10'),
(37, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 18:59:39'),
(39, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:04:57'),
(40, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:26:58'),
(41, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:27:09'),
(42, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:42:17'),
(43, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:42:32'),
(44, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:44:03'),
(45, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:44:21'),
(47, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:46:11'),
(48, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:46:31'),
(50, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:47:10'),
(52, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:47:43'),
(53, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-25 19:47:59'),
(54, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 16:43:33'),
(55, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:39:24'),
(56, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:39:42'),
(57, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:41:30'),
(58, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:41:51'),
(59, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:41:59'),
(60, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:42:06'),
(61, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:47:05'),
(62, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:50:16'),
(64, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:50:33'),
(67, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:51:25'),
(68, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:51:34'),
(70, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:56:47'),
(71, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:59:00'),
(72, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 17:59:48'),
(73, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:08:09'),
(74, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:09:44'),
(75, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:15:53'),
(76, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:18:40'),
(77, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:24:46'),
(78, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:27:01'),
(79, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:34:55'),
(80, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:39:18'),
(81, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 18:41:09'),
(82, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:05:40'),
(83, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:06:09'),
(84, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:32:39'),
(85, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:35:21'),
(86, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:37:05'),
(87, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:41:31'),
(88, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:48:22'),
(89, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:55:50'),
(90, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:56:02'),
(91, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 19:57:54'),
(92, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:15:18'),
(93, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:15:26'),
(94, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:15:53'),
(95, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:16:02'),
(96, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:16:18'),
(97, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:16:34'),
(98, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:18:07'),
(99, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-26 20:18:21'),
(100, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-28 15:04:31'),
(101, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-28 15:17:25'),
(102, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-28 15:29:45'),
(103, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 15:29:09'),
(104, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 15:34:25'),
(105, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 15:34:36'),
(106, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 15:35:00'),
(107, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 15:59:12'),
(108, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 16:33:14'),
(109, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 16:33:27'),
(114, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-29 18:51:55'),
(115, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 03:31:33'),
(116, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 06:29:58'),
(117, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 06:38:58'),
(118, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 06:39:12'),
(119, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 06:54:14'),
(120, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 07:03:52'),
(121, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 07:04:31'),
(123, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 16:21:29'),
(124, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 16:23:54'),
(125, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 17:15:37'),
(126, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-05-30 17:16:11'),
(128, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-01 19:17:59'),
(129, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-06 01:09:42'),
(130, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-06 01:10:36'),
(131, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-06 01:10:44'),
(132, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-16 17:06:57'),
(133, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-16 17:07:48'),
(136, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-16 17:11:42'),
(137, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 14:45:21'),
(138, 5, 'create', 'ผู้ใช้', 'สร้างบัญชีผู้ใช้ใหม่ (Username: 45172037)', '172.18.0.1', '2026-06-17 14:49:28'),
(140, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 14:49:54'),
(141, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:05:09'),
(142, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:06:43'),
(143, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:12:59'),
(144, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:14:35'),
(146, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:17:49'),
(149, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:26:13'),
(150, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:28:06'),
(151, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:30:42'),
(152, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 15:58:12'),
(154, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-17 16:11:21'),
(155, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-19 20:58:58'),
(156, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-19 21:00:06'),
(157, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-19 21:02:43'),
(158, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-20 15:33:18'),
(159, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 15:00:33'),
(160, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 15:37:57'),
(161, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 15:51:32'),
(162, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 16:17:27'),
(163, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 16:17:54'),
(164, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 16:18:10'),
(168, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 16:20:09'),
(171, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-21 16:21:33'),
(172, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 14:39:31'),
(173, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 14:39:58'),
(174, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:03:50'),
(175, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:05:19'),
(176, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:06:39'),
(177, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:08:07'),
(178, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:15:35'),
(179, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:27:17'),
(180, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:28:12'),
(182, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:35:50'),
(184, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 15:36:27'),
(185, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:17:16'),
(186, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:27:30'),
(187, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:40:34'),
(188, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:40:51'),
(189, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:42:15'),
(191, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 17:55:59'),
(194, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 19:30:47'),
(195, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 19:37:46'),
(196, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-22 19:48:10'),
(198, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-23 13:26:27'),
(199, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-23 16:18:47'),
(200, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-23 16:19:02'),
(201, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-23 16:22:25'),
(202, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-23 18:46:07'),
(203, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-24 11:36:50'),
(204, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 06:22:32'),
(205, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 07:19:07'),
(206, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 07:19:25'),
(207, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 17:36:54'),
(209, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 17:44:16'),
(211, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 18:05:01'),
(212, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:02:56'),
(213, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:04:17'),
(214, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:25:17'),
(215, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:35:31'),
(216, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:35:45'),
(217, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:37:56'),
(218, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:39:18'),
(219, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:40:04'),
(220, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 19:49:57'),
(221, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-26 20:49:11'),
(222, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 07:10:46'),
(223, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 07:11:30'),
(224, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 08:00:07'),
(225, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 14:27:45'),
(226, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 15:29:57'),
(227, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 15:56:09'),
(228, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 15:56:44'),
(229, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 17:15:25'),
(230, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 17:15:31'),
(232, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 17:39:24'),
(233, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 17:46:31'),
(235, 1, 'delete', 'ผู้ใช้', 'ลบบัญชีผู้ใช้ ID: 9', '172.18.0.1', '2026-06-27 17:50:17'),
(236, 1, 'delete', 'ผู้ใช้', 'ลบบัญชีผู้ใช้ ID: 11', '172.18.0.1', '2026-06-27 18:10:09'),
(237, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 18:11:01'),
(238, 1, 'delete', 'ผู้ใช้', 'ลบบัญชีผู้ใช้ ID: 2', '172.18.0.1', '2026-06-27 18:11:26'),
(239, 5, 'delete', 'ผู้ใช้', 'ลบบัญชีผู้ใช้ ID: 3', '172.18.0.1', '2026-06-27 18:19:49'),
(240, 5, 'delete', 'ผู้ใช้', 'ลบบัญชีผู้ใช้ อาภัสรา เนตรสัก 6604800008 (8)', '172.18.0.1', '2026-06-27 18:28:40'),
(241, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 46172040', '172.18.0.1', '2026-06-27 20:06:51'),
(242, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 41172011', '172.18.0.1', '2026-06-27 20:08:26'),
(243, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-27 20:09:06'),
(244, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 46172040', '172.18.0.1', '2026-06-27 21:34:07'),
(245, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-28 17:43:34'),
(246, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 11:45:45'),
(247, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 12:06:56'),
(248, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 12:07:25'),
(249, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:00:23'),
(250, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:19:27'),
(251, 4, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:19:38'),
(252, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:19:58'),
(253, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:20:20'),
(254, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 17:45:23'),
(255, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:47:11'),
(256, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 17:54:47'),
(257, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 17:59:45'),
(258, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 18:00:28'),
(259, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 19:37:47'),
(260, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 19:38:09'),
(261, 7, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 19:42:19'),
(262, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 19:44:43'),
(263, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:06:52'),
(264, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 20:08:22'),
(265, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 20:21:26'),
(266, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 20:21:51'),
(267, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:34:00'),
(268, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:38:13'),
(269, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:38:51'),
(270, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:43:35'),
(271, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 20:54:51'),
(272, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 21:03:36'),
(273, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 21:12:12'),
(274, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 21:12:23'),
(275, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-29 21:12:55'),
(276, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 21:14:04'),
(277, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 21:26:50'),
(278, 5, 'update', 'ผู้ใช้', 'แก้ไขข้อมูลบัญชี: 44172033', '172.18.0.1', '2026-06-29 21:33:38'),
(279, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-30 16:47:46'),
(280, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-30 19:46:26'),
(281, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-30 22:55:19'),
(282, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-06-30 23:12:42'),
(283, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-01 08:07:36'),
(284, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-01 09:44:31'),
(285, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-01 18:22:50'),
(286, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-01 19:17:03'),
(287, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-03 05:55:34'),
(288, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-08 10:52:04'),
(289, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-08 18:27:17'),
(290, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 08:27:36'),
(291, 1, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 09:38:57'),
(292, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 10:05:00'),
(293, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 10:05:14'),
(294, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 11:53:31'),
(295, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-10 11:54:14'),
(296, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 11:02:28'),
(297, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 11:02:55'),
(298, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:34:17'),
(299, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:35:28'),
(300, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:53:59'),
(301, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:55:02'),
(302, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:58:19'),
(303, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:59:27'),
(304, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 14:59:33'),
(305, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:04:25'),
(306, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:05:21'),
(307, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:10:42'),
(308, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:10:56'),
(309, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:11:06'),
(310, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 18:11:27'),
(311, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 19:40:59'),
(312, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:01:38'),
(313, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:02:52'),
(314, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:03:13'),
(315, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:23:56'),
(316, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:24:19'),
(317, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:41:19'),
(318, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:41:32'),
(319, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:41:39'),
(320, 6, 'update', 'ความปลอดภัย', 'เปลี่ยนรหัสผ่านสำเร็จ', '172.18.0.1', '2026-07-11 20:44:22'),
(321, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 20:44:48'),
(322, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:28:05'),
(323, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:28:39'),
(324, 5, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:30:13'),
(325, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:30:42'),
(326, 10, 'update', 'ความปลอดภัย', 'เปลี่ยนรหัสผ่านสำเร็จ', '172.18.0.1', '2026-07-11 21:31:35'),
(327, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:31:51'),
(328, 6, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:32:28'),
(329, 10, 'login', 'ระบบ', 'เข้าสู่ระบบสำเร็จ', '172.18.0.1', '2026-07-11 21:51:39');

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
(1, 2567, 'หลักสูตรพยาบาลศาสตรบัณฑิต', '{\"clos\":[{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"103-111\",\"subject_name\":\"ภาษาอังกฤษพื้นฐาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"103-112\",\"subject_name\":\"การสื่อสารภาษาอังกฤษในชีวิตประจำวัน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"103-201\",\"subject_name\":\"ทักษะดิจิทัลสำหรับศตวรรษที่ 21\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"}],\"subject_code\":\"103-202\",\"subject_name\":\"การวิเคราะห์ข้อมูลและการเรียนรู้ของเครื่องจักรเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"103-301\",\"subject_name\":\"หลักปรัชญาของเศรษฐกิจพอเพียงเพื่อการพัฒนาที่ยั่งยืน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"103-302\",\"subject_name\":\"การออกแบบการคิดเพื่อสร้างนวัตกรรมฯ\"},{\"plo_mappings\":[],\"subject_code\":\"103-302\",\"subject_name\":\"การออกแบบการคิดเพื่อสร้างนวัตกรรมและธุรกิจใหม่\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"170-108\",\"subject_name\":\"ชีวเคมี\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"}],\"subject_code\":\"170-112\",\"subject_name\":\"กายวิภาคศาสตร์และสรีรวิทยาฯ 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"}],\"subject_code\":\"170-113\",\"subject_name\":\"กายวิภาคศาสตร์และสรีรวิทยาฯ 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3}],\"subject_code\":\"170-201\",\"subject_name\":\"พยาธิสรีรวิทยาของมนุษย์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3}],\"subject_code\":\"170-208\",\"subject_name\":\"จุลชีววิทยาและปรสิตวิทยาของมนุษย์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-216\",\"subject_name\":\"เภสัชวิทยาทางการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"}],\"subject_code\":\"170-224\",\"subject_name\":\"ชีวสถิติทางสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-228\",\"subject_name\":\"พัฒนาการมนุษย์และการสร้างเสริมสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-229\",\"subject_name\":\"โภชนบำบัด\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-211\",\"subject_name\":\"การพยาบาลพื้นฐาน 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-212\",\"subject_name\":\"การพยาบาลพื้นฐาน 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-222\",\"subject_name\":\"จรรยาบรรณวิชาชีพการพยาบาลและกฎหมายที่เกี่ยวข้อง\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-226\",\"subject_name\":\"การพยาบาลผู้ใหญ่\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-227\",\"subject_name\":\"มโนมติ ทฤษฎีฯ และบริการด้วยหัวใจ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-230\",\"subject_name\":\"กระบวนการพยาบาลและการประเมินภาวะสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-231\",\"subject_name\":\"การประยุกต์ใช้ AI และเทคโนโลยีดิจิทัล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-324\",\"subject_name\":\"การพยาบาลผู้สูงอายุ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-348\",\"subject_name\":\"การพยาบาลเด็กและวัยรุ่น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-349\",\"subject_name\":\"การพยาบาลวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-350\",\"subject_name\":\"การพยาบาลสุขภาพจิตและจิตเวชศาสตร์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-351\",\"subject_name\":\"การพยาบาลมารดาและทารก\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-352\",\"subject_name\":\"การผดุงครรภ์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-353\",\"subject_name\":\"การพยาบาลอนามัยชุมชน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":6.2}],\"subject_code\":\"170-354\",\"subject_name\":\"กระบวนการวิจัยทางวิชาชีพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"}],\"subject_code\":\"170-448\",\"subject_name\":\"การรักษาพยาบาลเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-457\",\"subject_name\":\"ภาวะผู้นำและการบริหารทางการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":\"7.1\"}],\"subject_code\":\"170-232\",\"subject_name\":\"ปฏิบัติการพยาบาลพื้นฐาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-327\",\"subject_name\":\"ปฏิบัติการสุขภาพจิตและจิตเวชศาสตร์\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-331\",\"subject_name\":\"ปฏิบัติการพยาบาลเด็กและวัยรุ่น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-337\",\"subject_name\":\"ปฏิบัติการพยาบาลมารดาและทารก\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-338\",\"subject_name\":\"ปฏิบัติการผดุงครรภ์ 1\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-339\",\"subject_name\":\"ปฏิบัติการพยาบาลผู้ใหญ่และผู้สูงอายุ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-340\",\"subject_name\":\"ปฏิบัติการพยาบาลผู้ป่วยวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-355\",\"subject_name\":\"ปฏิบัติการพยาบาลอนามัยชุมชน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"2.1\"},{\"weight\":1,\"sub_plo_id\":2.3},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2}],\"subject_code\":\"170-431\",\"subject_name\":\"ปฏิบัติการผดุงครรภ์ 2\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-449\",\"subject_name\":\"ปฏิบัติการรักษาพยาบาลเบื้องต้น\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-458\",\"subject_name\":\"ปฏิบัติการจัดการพยาบาล\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.2\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"4.1\"},{\"weight\":1,\"sub_plo_id\":\"5.1\"},{\"weight\":1,\"sub_plo_id\":5.2},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":6.2},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2},{\"weight\":1,\"sub_plo_id\":8.3}],\"subject_code\":\"170-459\",\"subject_name\":\"ปฏิบัติการพยาบาลรวบยอดวิกฤตและฉุกเฉิน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2}],\"subject_code\":\"170-116\",\"subject_name\":\"การดูแลสุขภาพแบบผสมผสาน\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"6.1\"},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"}],\"subject_code\":\"170-117\",\"subject_name\":\"การดูแลสุขภาพความงามแบบองค์รวม\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":\"7.1\"},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-233\",\"subject_name\":\"การดูแลสุขภาวะผู้สูงอายุกลุ่มเปราะบาง\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":6.3},{\"weight\":1,\"sub_plo_id\":7.2},{\"weight\":1,\"sub_plo_id\":\"8.1\"},{\"weight\":1,\"sub_plo_id\":8.2}],\"subject_code\":\"170-234\",\"subject_name\":\"นันทนาการเพื่อส่งเสริมพัฒนาการเด็กฯ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":\"1.3\"},{\"weight\":1,\"sub_plo_id\":\"3.1\"},{\"weight\":1,\"sub_plo_id\":3.2},{\"weight\":1,\"sub_plo_id\":\"4.1\"}],\"subject_code\":\"170-346\",\"subject_name\":\"นวัตกรรมทางสุขภาพ\"},{\"plo_mappings\":[{\"weight\":1,\"sub_plo_id\":\"1.1\"},{\"weight\":1,\"sub_plo_id\":2.2},{\"weight\":1,\"sub_plo_id\":\"3.1\"}],\"subject_code\":\"170-347\",\"subject_name\":\"การปฐมพยาบาลและการช่วยฟื้นคืนชีพ\"}],\"plos\":[{\"plo_id\":\"PLO1\",\"plo_name\":\"PLO 1: ประยุกต์ความรู้และสาระสำคัญของศาสตร์ทางวิชาชีพการพยาบาลและการผดุงครรภ์ และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\",\"sub_plos\":[{\"id\":\"1.1\",\"desc\":\"มีความรู้ความเข้าใจศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลที่สุขภาพดี การดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย\"},{\"id\":\"1.2\",\"desc\":\"มีความรู้ความเข้าใจในสาระสำคัญของศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้สูงอายุและผู้ป่วยวิกฤต\"},{\"id\":\"1.3\",\"desc\":\"ประยุกต์ศาสตร์ทางการพยาบาลและการผดุงครรภ์และศาสตร์ที่เกี่ยวข้องในการดูแลบุคคลทั้งในภาวะปกติ ภาวะเจ็บป่วยทุกช่วงวัย ผู้สูงอายุและผู้ป่วยวิกฤต\"}],\"ylo_descriptions\":{\"year_1\":\"ใช้ความรู้ศาสตร์ที่เกี่ยวข้องพัฒนาการมนุษย์ทุกช่วงวัย\",\"year_2\":\"พื้นฐานทางวิชาชีพ ทางเลือกในการดูแลสุขภาพ, ใช้ศาสตร์พื้นฐานทางวิชาชีพในการดูแลสุขภาพ \",\"year_3\":\"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยทั่วไป\",\"year_4\":\"ใช้ศาสตร์ทางการพยาบาลและการผดุงครรภ์ในการดูแลผู้ป่วยวิกฤตและบูรณาการศาสตร์ทางการพยาบาลทุกระดับ\"}},{\"plo_id\":\"PLO2\",\"plo_name\":\"PLO 2: ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยเพื่อความปลอดภัยของผู้รับบริการ\",\"sub_plos\":[{\"id\":\"2.1\",\"desc\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์อย่างเป็นองค์รวมในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัย\"},{\"id\":\"2.2\",\"desc\":\"จัดการปัญหาและข้อขัดแย้งทางการพยาบาลได้อย่างเหมาะสม\"},{\"id\":\"2.3\",\"desc\":\"ประสานงานกับทีมสหสาขาวิชาชีพในการดูแลบุคคลที่สุขภาพดี เจ็บป่วย และวิกฤต แบบองค์รวมทุกช่วงวัยได้\"}],\"ylo_descriptions\":{\"year_1\":\"ไม่มี\",\"year_2\":\"ปฏิบัติการพยาบาลพื้นฐานในการดูแลผู้ป่วยทั่วไปโดยใช้กระบวนการพยาบาลภายใต้กฎหมายและจรรยาบรรณวิชาชีพ\",\"year_3\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยซับซ้อนโดยใช้กระบวนการพยาบาล\",\"year_4\":\"ปฏิบัติการพยาบาลและการผดุงครรภ์แบบองค์รวมในการดูแลผู้ป่วยทั่วไปและผู้ป่วยวิกฤตโดยใช้กระบวนการพยาบาล\"}},{\"plo_id\":\"PLO3\",\"plo_name\":\"PLO 3: พัฒนานวัตกรรมทางสุขภาพโดยประยุกต์กระบวนการวิจัยและเทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\",\"sub_plos\":[{\"id\":\"3.1\",\"desc\":\"นำกระบวนการวิจัยมาใช้ในการพัฒนานวัตกรรมทางสุขภาพได้\"},{\"id\":\"3.2\",\"desc\":\"ใช้เทคโนโลยีสารสนเทศทางการพยาบาลได้อย่างเหมาะสม\"}],\"ylo_descriptions\":{\"year_1\":\"มีความรู้พื้นฐานทางเทคโนโลยีและสารสนเทศ\",\"year_2\":\"มีความรู้ในการสร้างนวัตกรรมเบื้องต้น\",\"year_3\":\"สามารถสืบค้นข้อมูล วิเคราะห์แหล่งข้อมูลที่น่าเชื่อถือ และออกแบบการสร้างนวัตกรรมทางสุขภาพในแต่ละสาขาวิชา\",\"year_4\":\"บูรณาการการวิจัยและนวัตกรรมและส่งผลงานเข้าร่วมนำเสนอ\"}},{\"plo_id\":\"PLO4\",\"plo_name\":\"PLO 4: ประยุกต์ใช้ดิจิทัลในการจัดการพยาบาลได้อย่างเหมาะสม\",\"sub_plos\":[{\"id\":\"4.1\",\"desc\":\"สามารถใช้ระบบดิจิทัลทางการพยาบาลเพื่อการติดต่อประสานงานและการให้บริการผู้ป่วยได้อย่างถูกต้อง\"}],\"ylo_descriptions\":{\"year_1\":\"ไม่มี\",\"year_2\":\"มีความรู้พื้นฐานดิจิทัล\",\"year_3\":\"มีความรู้ด้านดิจิทัลทางการพยาบาล\",\"year_4\":\"ประยุกต์ดิจิทัลทางการพยาบาลมาใช้ในการดูแลผู้ป่วย\"}},{\"plo_id\":\"PLO5\",\"plo_name\":\"PLO 5: สื่อสารด้วยภาษาไทยและภาษาอังกฤษได้อย่างมีประสิทธิภาพ\",\"sub_plos\":[{\"id\":\"5.1\",\"desc\":\"ใช้ภาษาไทยในการสื่อสาร การบันทึกรายงานทางการพยาบาล การประสานงานกับทีมสุขภาพและผู้รับบริการได้อย่างมีประสิทธิภาพ\"},{\"id\":\"5.2\",\"desc\":\"ใช้ภาษาอังกฤษในการสื่อสารกับทีมสุขภาพและผู้รับบริการได้\"}],\"ylo_descriptions\":{\"year_1\":\"สามารถสื่อสารภาษาไทยภาษาอังกฤษได้\",\"year_2\":\"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล -เข้าใจศัพท์พื้นฐานทางการแพทย์\",\"year_3\":\"-ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ  และหน่วยงานที่เกี่ยวข้อง -สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\",\"year_4\":\"ใช้ภาษาไทยในการสื่อสารทางวิชาการ บันทึกทางการพยาบาล การรับส่งข้อมูลกับทีมสุขภาพ และหน่วยงานที่เกี่ยวข้อง สามารถใช้ศัพท์ทางการแพทย์ในการสื่อสาร รับส่งข้อมูลและบันทึกทางการพยาบาล\"}},{\"plo_id\":\"PLO6\",\"plo_name\":\"PLO 6: แสดงออกถึงการมีจริยธรรมและทัศนคติที่ดีต่อวิชาชีพ มีจิตสาธารณะ และมีพฤติกรรมบริการที่เป็นที่ยอมรับ\",\"sub_plos\":[{\"id\":\"6.1\",\"desc\":\"แสดงออกถึงการมีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ\"},{\"id\":\"6.2\",\"desc\":\"ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรัก และศรัทธาในวิชาชีพ\"},{\"id\":\"6.3\",\"desc\":\"สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\"}],\"ylo_descriptions\":{\"year_1\":\"-มีจิตสาธารณะบำเพ็ญประโยชน์เพื่อสังคม -สามารถปรับตัวเข้ากับสังคมและสิ่งแวดล้อมใหม่\",\"year_2\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสม -ปฏิบัติงานด้วยตรงต่อเวลา มีความรับผิดชอบ -สามารถปรับตัวเข้าสู่วิชาชีพได้\",\"year_3\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ มีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่หลากหลาย\",\"year_4\":\"-มีบุคลิกภาพและการวางตัวได้อย่างเหมาะสมในความเป็นวิชาชีพ -ปฏิบัติงานด้วยความซื่อสัตย์ เสียสละ ตรงต่อเวลา มีความรับผิดชอบ และมีความรักและศรัทธาในวิชาชีพ -สามารถปรับตัวเข้ากับสถานการณ์ที่ซับซ้อน -มีพฤติกรรมบริการเป็น-ที่ยอมรับของผู้รับ\"}},{\"plo_id\":\"PLO7\",\"plo_name\":\"PLO 7: แสดงออกถึงการเรียนรู้ด้วยตนเองอย่างต่อเนื่อง\",\"sub_plos\":[{\"id\":\"7.1\",\"desc\":\"แสดงออกถึงการแสวงหาความรู้เพิ่มเติมอย่างต่อเนื่อง\"},{\"id\":\"7.2\",\"desc\":\"สามารถสืบค้นและวิเคราะห์ความน่าเชื่อถือของข้อมูลได้อย่างเหมาะสม\"}],\"ylo_descriptions\":{\"year_1\":\"สามารถศึกษาค้นคว้าข้อมูลจากแหล่งข้อมูลต่าง ๆ\",\"year_2\":\"สามารถศึกษาค้นคว้าข้อมูลทางการพยาบาลจากแหล่งข้อมูลต่าง ๆ และวิเคราะห์ข้อมูลเบื้องต้น\",\"year_3\":\"สามารถนำข้อมูลทางการพยาบาลมาวางแผนการพยาบาล\",\"year_4\":\"สามารถเลือกและประยุกต์องค์ความรู้ทางการพยาบาลมาใช้วางแผนการพยาบาลตามสถานการณ์ที่หลากหลาย\"}},{\"plo_id\":\"PLO8\",\"plo_name\":\"PLO 8: เข้าใจหลักการ การดำเนินการ การเป็นผู้ประกอบการที่เกี่ยวกับการพยาบาลและการผดุงครรภ์ได้\",\"sub_plos\":[{\"id\":\"8.1\",\"desc\":\"ประเมินความต้องการบริการสุขภาพสอดคล้องกับสถานการณ์ปัจจุบัน\"},{\"id\":\"8.2\",\"desc\":\"ออกแบบบริการการพยาบาลและการผดุงครรภ์ได้\"},{\"id\":\"8.3\",\"desc\":\"สามารถจัดการในการเป็นผู้ประกอบการด้านการดูแลสุขภาพได้\"}],\"ylo_descriptions\":{\"year_1\":\"-\",\"year_2\":\"-\",\"year_3\":\"ประเมินความต้องการบริการสุขภาพของบุคคลและครอบครัวได้\",\"year_4\":\"-ประเมินความต้องการบริการสุขภาพของบุคคล ครอบครัว และชุมชนได้ -ออกแบบบริการการพยาบาลและการผดุงครรภ์ในการเป็นผู้ประกอบการได้\"}}],\"program_name\":\"หลักสูตรพยาบาลศาสตรบัณฑิต (ฉบับปรับปรุง)\",\"curriculum_year\":2567,\"subject_mappings\":{\"103-111\":{\"clos\":[{\"clo_id\":1,\"clo_code\":\"CLO1\",\"description\":\"เทส\",\"ylo_id\":null,\"mapped_plos\":[\"PLO1\",\"PLO5\"],\"plo_weights\":{\"PLO1\":20,\"PLO5\":30},\"weight\":50,\"status\":\"active\"}],\"course_plos\":[]},\"103-112\":{\"clos\":[],\"course_plos\":[]},\"103-114\":{\"clos\":[],\"course_plos\":[]},\"103-113\":{\"clos\":[],\"course_plos\":[]},\"103-121\":{\"clos\":[],\"course_plos\":[]},\"103-122\":{\"clos\":[],\"course_plos\":[]},\"103-123\":{\"clos\":[],\"course_plos\":[]},\"103-131\":{\"clos\":[],\"course_plos\":[]},\"103-141\":{\"clos\":[],\"course_plos\":[]},\"103-151\":{\"clos\":[],\"course_plos\":[]},\"103-201\":{\"clos\":[],\"course_plos\":[]},\"103-202\":{\"clos\":[],\"course_plos\":[]},\"103-203\":{\"clos\":[],\"course_plos\":[]},\"103-204\":{\"clos\":[],\"course_plos\":[]},\"103-205\":{\"clos\":[],\"course_plos\":[]},\"103-206\":{\"clos\":[],\"course_plos\":[]},\"103-207\":{\"clos\":[],\"course_plos\":[]},\"103-208\":{\"clos\":[],\"course_plos\":[]},\"103-209\":{\"clos\":[],\"course_plos\":[]},\"103-210\":{\"clos\":[],\"course_plos\":[]},\"103-211\":{\"clos\":[],\"course_plos\":[]},\"103-212\":{\"clos\":[],\"course_plos\":[]},\"103-301\":{\"clos\":[],\"course_plos\":[]},\"103-302\":{\"clos\":[],\"course_plos\":[]},\"170-108\":{\"clos\":[],\"course_plos\":[]},\"170-112\":{\"clos\":[],\"course_plos\":[]},\"170-113\":{\"clos\":[],\"course_plos\":[]},\"170-114\":{\"clos\":[],\"course_plos\":[]},\"170-115\":{\"clos\":[],\"course_plos\":[]},\"170-116\":{\"clos\":[],\"course_plos\":[]},\"170-117\":{\"clos\":[],\"course_plos\":[]},\"170-201\":{\"clos\":[],\"course_plos\":[]},\"170-208\":{\"clos\":[],\"course_plos\":[]},\"170-211\":{\"clos\":[],\"course_plos\":[]},\"170-212\":{\"clos\":[],\"course_plos\":[]},\"170-216\":{\"clos\":[],\"course_plos\":[]},\"170-222\":{\"clos\":[],\"course_plos\":[]},\"170-224\":{\"clos\":[],\"course_plos\":[]},\"170-226\":{\"clos\":[],\"course_plos\":[]},\"170-227\":{\"clos\":[],\"course_plos\":[]},\"170-228\":{\"clos\":[],\"course_plos\":[]},\"170-229\":{\"clos\":[],\"course_plos\":[]},\"170-230\":{\"clos\":[],\"course_plos\":[]},\"170-231\":{\"clos\":[],\"course_plos\":[]},\"170-232\":{\"clos\":[],\"course_plos\":[]},\"170-235\":{\"clos\":[],\"course_plos\":[]},\"170-236\":{\"clos\":[],\"course_plos\":[]},\"170-324\":{\"clos\":[],\"course_plos\":[]},\"170-327\":{\"clos\":[],\"course_plos\":[]},\"170-331\":{\"clos\":[],\"course_plos\":[]},\"170-337\":{\"clos\":[],\"course_plos\":[]},\"170-338\":{\"clos\":[],\"course_plos\":[]},\"170-339\":{\"clos\":[],\"course_plos\":[]},\"170-340\":{\"clos\":[],\"course_plos\":[]},\"170-348\":{\"clos\":[],\"course_plos\":[]},\"170-349\":{\"clos\":[],\"course_plos\":[]},\"170-350\":{\"clos\":[],\"course_plos\":[]},\"170-351\":{\"clos\":[],\"course_plos\":[]},\"170-352\":{\"clos\":[],\"course_plos\":[]},\"170-353\":{\"clos\":[],\"course_plos\":[]},\"170-354\":{\"clos\":[],\"course_plos\":[]},\"170-355\":{\"clos\":[],\"course_plos\":[]},\"170-356\":{\"clos\":[],\"course_plos\":[]},\"170-357\":{\"clos\":[],\"course_plos\":[]},\"170-431\":{\"clos\":[],\"course_plos\":[]},\"170-448\":{\"clos\":[],\"course_plos\":[]},\"170-449\":{\"clos\":[],\"course_plos\":[]},\"170-457\":{\"clos\":[],\"course_plos\":[]},\"170-458\":{\"clos\":[],\"course_plos\":[]},\"170-459\":{\"clos\":[],\"course_plos\":[]},\"170-460\":{\"clos\":[],\"course_plos\":[]},\"170-461\":{\"clos\":[],\"course_plos\":[]},\"170-462\":{\"clos\":[],\"course_plos\":[]}}}', 1, '2026-02-09 13:44:39');

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
-- Table structure for table `degree`
--

CREATE TABLE `degree` (
  `degree_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL COMMENT 'รหัสอาจารย์ (เชื่อมตาราง faculty)',
  `degree_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ระดับการศึกษา เช่น Bachelor, Master, Doctoral',
  `degree_name_th` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อปริญญา (ไทย)',
  `degree_name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อปริญญา (อังกฤษ)',
  `degree_abbr_th` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อย่อปริญญา (ไทย)',
  `degree_abbr_en` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อย่อปริญญา (อังกฤษ)',
  `major` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'สาขาวิชา',
  `institution_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ชื่อสถาบันที่จบ',
  `graduation_year` int DEFAULT NULL COMMENT 'ปีที่จบการศึกษา (พ.ศ. หรือ ค.ศ.)',
  `start_year` int DEFAULT NULL COMMENT 'ปีที่เริ่มศึกษา',
  `expected_grad_year` int DEFAULT NULL COMMENT 'ปีที่คาดว่าจะจบ',
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ที่อยู่ไฟล์แนบหลักฐานการศึกษา'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `grade` varchar(5) DEFAULT NULL COMMENT 'เกรดที่ได้ (A, B+, ...)',
  `status` enum('Active','Withdrawn','Dropped','Failed') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL,
  `title` varchar(50) DEFAULT NULL COMMENT 'คำนำหน้าชื่อ (นาย/นาง/ดร./ผศ.)',
  `first_name_th` varchar(100) DEFAULT NULL,
  `last_name_th` varchar(100) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `current_address` text COMMENT 'ที่อยู่ปัจจุบัน',
  `nursing_council_no` varchar(50) DEFAULT NULL COMMENT 'เลขที่บัตรสภาการพยาบาล / ใบประกอบวิชาชีพ',
  `license_expiry` date DEFAULT NULL COMMENT 'วันหมดอายุใบอนุญาตประกอบวิชาชีพ',
  `start_work_date` date DEFAULT NULL COMMENT 'วันที่เริ่มปฏิบัติงาน',
  `academic_position_date` date DEFAULT NULL COMMENT 'วันที่รับตำแหน่งทางวิชาการ',
  `profile_picture` text COMMENT 'URL รูปโปรไฟล์',
  `nursing_council_file` text COMMENT 'URL ไฟล์บัตรสภาการพยาบาล',
  `license_file` text COMMENT 'URL ไฟล์ใบอนุญาตประกอบวิชาชีพ',
  `teaching_cert_file` text COMMENT 'URL ไฟล์ใบประกอบวิชาชีพครู',
  `status` enum('Active','Retired') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Active' COMMENT 'สถานะการทำงาน (Active/Retired)',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `faculty_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `birth_date`, `email`, `phone`, `current_address`, `nursing_council_no`, `license_expiry`, `start_work_date`, `academic_position_date`, `profile_picture`, `nursing_council_file`, `license_file`, `teaching_cert_file`, `status`, `description`, `created_at`) VALUES
(54, 123456, 'นางสาว', 'อุษา', 'จันทวงศ์', 'Ousa', 'Chanthwngs', 'หญิง', '1976-12-25', NULL, '0876802992', '3333', NULL, '2028-03-23', '2009-02-09', NULL, 'https://drive.google.com/uc?id=1caZxI_46bX91yrfYOQxDy2STIAj-v37c', 'ข้อมูลบุคลากร test_Images/54.สำเนาบัตรสมาชิกสภาการพยาบาล.115206.jpg', 'ข้อมูลบุคลากร test_Images/54.สำเนาใบอนุญาตประกอบวิชาชีพ.115209.jpg', 'ข้อมูลบุคลากร test_Images/54.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.115209.jpg', 'Active', NULL, '2026-07-04 20:44:55'),
(26, 234561, 'อาจารย์', 'สุภาพร', 'แตงจุ้ย', 'Suphaphr', 'Aetngchuy', 'หญิง', '1994-08-30', NULL, '0922626443', '145 หมู่11 ซ.สวนผัก29 ถ.สวนผัก เขตตลิ่งชัน กทม', '6111283091', '2027-12-23', '2023-03-01', NULL, 'https://drive.google.com/uc?id=1AJ2mLVzvMR3AveL3vbFB-IWLYsreCX-O', 'ข้อมูลบุคลากร test_Images/26.สำเนาบัตรสมาชิกสภาการพยาบาล.114220.jpg', 'ข้อมูลบุคลากร test_Images/26.สำเนาใบอนุญาตประกอบวิชาชีพ.114224.jpg', 'ข้อมูลบุคลากร test_Images/26.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.114224.jpg', 'Active', NULL, '2026-07-04 20:44:53'),
(33, 380018, 'อาจารย์', 'พรรณี', 'ตรังคสันต์', 'Phrrni', 'Trangkhsant', 'หญิง', '1968-02-27', NULL, NULL, '63/213 บรมราชชนนี 64  แขวงศาลาธรรม เขตทวีวัฒนา กรุงเทพมหานคร', '4511050332', '2023-11-04', '2015-10-10', NULL, 'https://drive.google.com/uc?id=19xYaKu29ABLwiaMIv-3kkggQRSe9yvTn', 'ข้อมูลบุคลากร test_Images/33.สำเนาบัตรสมาชิกสภาการพยาบาล.034119.jpg', 'ข้อมูลบุคลากร test_Images/33.สำเนาใบอนุญาตประกอบวิชาชีพ.034122.jpg', 'ข้อมูลบุคลากร test_Images/33.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.034123.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(31, 382018, 'อาจารย์', 'บัวทิพย์', 'เพ็งศรี', 'Bawthiphy', 'Ephngsri', 'หญิง', '1970-10-17', NULL, '0815659852', '47/5 ม.4 ตำบลพิมลราช อำเภอบางบัวทอง จังหวัดนนทบุรี', '4511048575', '2023-08-05', '2015-10-01', NULL, 'https://drive.google.com/uc?id=1pwVOigXqjqsLaNw6raKaTtsn0RVoamIA', 'ข้อมูลบุคลากร test_Images/31.สำเนาบัตรสมาชิกสภาการพยาบาล.033704.jpg', 'ข้อมูลบุคลากร test_Images/31.สำเนาใบอนุญาตประกอบวิชาชีพ.033707.jpg', 'ข้อมูลบุคลากร test_Images/31.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.033708.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(32, 540215, 'อาจารย์', 'ศิริพร', 'สามสี', 'Siriphr', 'Samsi', 'หญิง', '1969-04-13', NULL, '0812534343', '28 หอพักพยาบาล โรงพยาบาลธนบุรี1 ซอยแสงศึกษา ถนนอิสรภาพ พรานนก เขตบางกอกน้อย กรุงเทพมหานคร', '4511075055', '2024-04-07', '2015-10-01', NULL, 'https://drive.google.com/uc?id=18cohpXHCv2rRnAtuttjp34N9RkwyYKLh', 'ข้อมูลบุคลากร test_Images/32.สำเนาบัตรสมาชิกสภาการพยาบาล.033900.jpg', 'ข้อมูลบุคลากร test_Images/32.สำเนาใบอนุญาตประกอบวิชาชีพ.033903.jpg', 'ข้อมูลบุคลากร test_Images/32.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.033904.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(52, 570205, 'นางสาว', 'นลินี', 'แสนชนะ', 'Nlini', 'Aesnchna', 'หญิง', '1980-04-01', NULL, '0829159056', '58 ถนนพระรามที่ 2 วอย 28 แยก 11 แขวงจอมทอง เขตจอมทอง กรุงเทพมหานคร 10150', NULL, '2027-12-23', '2013-09-02', NULL, 'https://drive.google.com/uc?id=1Z_hqbzznU1Gk3s1dyyeo_YMdza25VUVG', 'ข้อมูลบุคลากร test_Images/52.สำเนาบัตรสมาชิกสภาการพยาบาล.115650.jpg', 'ข้อมูลบุคลากร test_Images/52.สำเนาใบอนุญาตประกอบวิชาชีพ.115653.jpg', 'ข้อมูลบุคลากร test_Images/52.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.115653.jpg', 'Active', NULL, '2026-07-04 20:44:55'),
(20, 650291, 'อาจารย์', 'อัจรา', 'ฐิตวัฒนกุล', 'Oachra', 'Thitwathnkul', 'หญิง', '1987-09-13', NULL, '0646482795', '99/63 ม.แกรนดิโอ เพชรเกษม81 ถ.มาเจริญ แขวงหนองค้างพลู เขตหนองแขม กทม.', '5311218207', '2025-03-21', '2022-08-16', NULL, 'https://drive.google.com/uc?id=1yn-yQIIdndxy43Q8LWU-rBHMnhO7UnnH', 'ข้อมูลบุคลากร test_Images/20.สำเนาบัตรสมาชิกสภาการพยาบาล.112044.jpg', 'ข้อมูลบุคลากร test_Images/20.สำเนาใบอนุญาตประกอบวิชาชีพ.112048.jpg', 'ข้อมูลบุคลากร test_Images/20.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.112048.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(4, 980279, 'อาจารย์', 'ศิรินา', 'สันทัดงาน', 'Sirina', 'Santhadngan', 'หญิง', '1966-03-07', NULL, '0987146559', '18/1 ซ. สวนผัก ถนนราชพฤกษ์ เบตตลิ่งชัน', '5611057840', '2025-11-28', '2020-05-01', '2024-07-31', 'https://drive.google.com/uc?id=1qbG0Q-5PqHaohfDK_p8EjI3jAa24b96k', 'ข้อมูลบุคลากร test_Images/4.สำเนาบัตรสมาชิกสภาการพยาบาล.080923.jpg', 'ข้อมูลบุคลากร test_Images/4.สำเนาใบอนุญาตประกอบวิชาชีพ.080926.jpg', 'ข้อมูลบุคลากร test_Images/4.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.080927.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(35, 999001, 'อาจารย์', 'พิไลพรรณ', 'แก้วแก่นตา', 'Phiailphrrn', 'Aekwaeknta', 'หญิง', '1976-01-13', NULL, '0800769229', '675 ม.10 ต.ท่าตูม อ.ศรีมหาโพธิ์ จ.ปราจีนบุรี', '4511032299', NULL, '2016-05-01', NULL, 'https://drive.google.com/uc?id=1p1P6Uc1bF638ZmvZO06l997SfnqPPG8W', 'https://drive.google.com/open?id=1NgcS__x5fEpgKkiBs9UcZRqZTAlTniGx', 'https://drive.google.com/open?id=1xDStdB8fPg-tRIG32mD-_mJ9BN25vZL3', NULL, 'Active', NULL, '2026-07-04 20:44:54'),
(34, 999002, 'อาจารย์', 'พาจนา', 'ดวงจันทร์', 'Phachna', 'Dwngchanthr', 'หญิง', '1967-04-29', NULL, NULL, '99/85 ม.2 แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพมหานคร', '4511050318', NULL, '2005-02-01', NULL, 'https://drive.google.com/uc?id=1fYoqhgygboofzVEFHkKUVamW0RJxSWtP', 'ข้อมูลบุคลากร test_Images/34.สำเนาบัตรสมาชิกสภาการพยาบาล.035550.jpg', 'ข้อมูลบุคลากร test_Images/34.สำเนาใบอนุญาตประกอบวิชาชีพ.035553.jpg', 'ข้อมูลบุคลากร test_Images/34.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.035553.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(30, 999003, 'อาจารย์', 'นิตยา', 'วิโรจนะ', 'Nitya', 'Wiorchna', 'หญิง', '1950-02-14', NULL, '0817361147', '187/96 ซอย 17 ถนนท่าข้าม แขวงแสมดำ เขตบางขุนเทียน จังหวัดกรุงเทพมหานคร', '6111001037', NULL, '2013-05-16', NULL, 'https://drive.google.com/uc?id=1-5OT7QO4me9xO4-FRznMWNxqgF3DIXIN', 'ข้อมูลบุคลากร test_Images/30.สำเนาบัตรสมาชิกสภาการพยาบาล.033517.jpg', 'ข้อมูลบุคลากร test_Images/30.สำเนาใบอนุญาตประกอบวิชาชีพ.033520.jpg', 'ข้อมูลบุคลากร test_Images/30.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.033520.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(29, 999004, 'อาจารย์', 'สิรินัฐ', 'สินวรรณกุล', 'Sirinath', 'Sinwrrnkul', 'หญิง', '1969-09-11', NULL, NULL, '34 ร.พ.ธนบุรี1 (10A) ถนนอิสรภาพ44 บ้านช่างทองหล่อ เขตบางกอกน้อย จังหวัดกรุงเทพมหานคร', '4511070793', NULL, '2010-09-01', NULL, 'https://drive.google.com/uc?id=1hwm_h30h-344iu8i5WSvMhDAMoczCN61', 'ข้อมูลบุคลากร test_Images/29.สำเนาบัตรสมาชิกสภาการพยาบาล.033020.jpg', 'ข้อมูลบุคลากร test_Images/29.สำเนาใบอนุญาตประกอบวิชาชีพ.033023.jpg', 'ข้อมูลบุคลากร test_Images/29.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.033023.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(37, 5200009, 'นางสาว', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharthiphy', 'Chirkaychna', 'หญิง', '1975-02-15', NULL, '0928959059', '8/96 ถ.ศาลาธรรมสพน์30  แขวงศาลาธรรมสพน์  เขตทวีวัฒนา กทม. 10170', '4511034476', '2027-03-25', '2009-11-01', NULL, 'https://drive.google.com/uc?id=1lXzV92RgQQVr14z6tiaHyt5-NKQ4V2dE', 'ข้อมูลบุคลากร test_Images/37.สำเนาบัตรสมาชิกสภาการพยาบาล.015813.jpg', 'ข้อมูลบุคลากร test_Images/37.สำเนาใบอนุญาตประกอบวิชาชีพ.015816.jpg', 'ข้อมูลบุคลากร test_Images/37.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.015816.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(1, 32172021, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ทวีวัฒนา กทม', NULL, NULL, '1989-11-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(2, 37172001, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0818036865', 'ภาษีเจริญ กทม', NULL, NULL, '1994-10-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(27, 40172006, 'อาจารย์', 'เฟื่องสุข', 'ไพศาลกอบฤทธิ์', 'Efueongsukh', 'Aiphsalkobฤththi', 'หญิง', '1955-07-21', NULL, '0897865253', '102/432 ม.5 ต.บางรักพัฒนา อ.บางบัวทอง จ.นนทบุรี', '4511055434', '2027-12-23', '1998-11-01', NULL, 'https://drive.google.com/uc?id=1tksZgZsAPP1ze0N8tEUfUaz82WjDWknV', 'ข้อมูลบุคลากร test_Images/27.สำเนาบัตรสมาชิกสภาการพยาบาล.114459.jpg', 'ข้อมูลบุคลากร test_Images/27.สำเนาใบอนุญาตประกอบวิชาชีพ.114502.jpg', 'ข้อมูลบุคลากร test_Images/27.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.114503.jpg', 'Active', NULL, '2026-07-04 20:44:53'),
(3, 41172001, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0815852959', 'บางกอกใหญ่ กทม', NULL, NULL, '1998-05-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(98, 41172008, 'ผู้ช่วยศาสตราจารย์ ดร.', 'จรัสดาว', 'เรโนลด์', 'Chrasdaw', 'Eronld', 'หญิง', '1968-04-15', NULL, '00000000', NULL, '4511059 407', '2025-07-26', '1989-01-11', '2015-06-01', 'https://drive.google.com/uc?id=1n2huOJMYaC-E4WOh0Q58d9JMrYum7wDo', 'ข้อมูลบุคลากร test_Images/48.สำเนาบัตรสมาชิกสภาการพยาบาล.120509.jpg', 'ข้อมูลบุคลากร test_Images/48.สำเนาใบอนุญาตประกอบวิชาชีพ.120512.jpg', 'ข้อมูลบุคลากร test_Images/48.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.120513.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(99, 41172011, 'ผู้ช่วยศาสตราจารย์ ดร.', 'พิชาภรณ์', 'จันทนกุล', 'Phichaphrn', 'Chanthnkul', 'หญิง', '1972-07-27', NULL, '0815852959', '99/168 ชั้น 9 ซิตี้โฮมสี่แยกท่าพระ ถ.รัชดาภิเษก แขวงวัดท่าพระ บางกอกใหญ่ กรุงเทพ', '4511036515', '2024-03-29', '1998-05-01', '2015-03-06', 'https://drive.google.com/uc?id=1JJd7suviuotMBPT7FSs8agD2whvr2MBw', 'ข้อมูลบุคลากร test_Images/19.สำเนาบัตรสมาชิกสภาการพยาบาล.111647.jpg', 'ข้อมูลบุคลากร test_Images/19.สำเนาใบอนุญาตประกอบวิชาชีพ.111650.jpg', 'ข้อมูลบุคลากร test_Images/19.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.111651.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(7, 41172017, 'ผู้ช่วยศาสตราจารย์ ดร.', 'อรทิพา', 'ส่องศิริ', 'Orthipha', 'Songsiri', 'หญิง', '1951-07-22', NULL, '0818036865', '105/19 ซอยเพชรเกษม 19 แขวงปากคลอง เขตภาษีเจริญ', '4511016150', '2028-07-27', '1994-10-01', '2005-11-26', 'https://drive.google.com/uc?id=102NBXg19xtPG_cNLibiU6HiU2LtH-GY-', 'ข้อมูลบุคลากร test_Images/36.สำเนาบัตรสมาชิกสภาการพยาบาล.014704.jpg', 'ข้อมูลบุคลากร test_Images/36.สำเนาใบอนุญาตประกอบวิชาชีพ.014708.jpg', 'ข้อมูลบุคลากร test_Images/36.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.014709.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(9, 42172021, 'ผู้ช่วยศาสตราจารย์ ดร.', 'วัฒนีย์', 'ปานจินดา', 'Wathniy', 'Panchinda', 'หญิง', '1955-08-17', NULL, '0000000000', NULL, '4511077 074', '2027-12-23', '2001-10-16', '2022-10-31', 'https://drive.google.com/uc?id=17RdUG9FbFhC4-7hMvOFHWf5sb6kObmSX', 'ข้อมูลบุคลากร test_Images/49.สำเนาบัตรสมาชิกสภาการพยาบาล.120242.jpg', 'ข้อมูลบุคลากร test_Images/49.สำเนาใบอนุญาตประกอบวิชาชีพ.120245.jpg', 'ข้อมูลบุคลากร test_Images/49.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.120245.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(10, 42172025, 'อาจารย์ ดร.', 'ปรียธิดา', 'ชลศึกเสนีย์', 'Priythida', 'Chlsuekesniy', 'หญิง', '1966-07-31', NULL, '0801461617', '52 ถ.โชคชัย4ซอย50 แยก6 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ', '4511055442', '2026-05-17', '1999-07-01', NULL, 'https://drive.google.com/uc?id=1Lz7xtHQwsvpe3MKmo610S2SlThUsZwWT', 'ข้อมูลบุคลากร test_Images/42.สำเนาบัตรสมาชิกสภาการพยาบาล.015346.jpg', 'ข้อมูลบุคลากร test_Images/42.สำเนาใบอนุญาตประกอบวิชาชีพ.015349.jpg', 'ข้อมูลบุคลากร test_Images/42.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.015350.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(100, 44172033, 'ผู้ช่วยศาสตราจารย์', 'ภัทรพร', 'อรัณยภาค', 'Phathrphr', 'Oranyphakh', 'หญิง', '1953-02-16', NULL, '0814784647', '77 เพชรเกษม ซอย 40', '4511016607', '2025-08-06', '2001-10-16', '2008-07-14', 'https://drive.google.com/uc?id=11kytl6TBnEyLNZOzOz45LBKG4726L4d5', 'ข้อมูลบุคลากร test_Images/3.สำเนาบัตรสมาชิกสภาการพยาบาล.080113.jpg', 'ข้อมูลบุคลากร test_Images/3.สำเนาใบอนุญาตประกอบวิชาชีพ.080116.jpg', 'ข้อมูลบุคลากร test_Images/3.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.080116.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(101, 45172037, 'ผู้ช่วยศาสตราจารย์ ดร.', 'สุสารี', 'ประคินกิจ', 'Susari', 'Prakhinkich', 'หญิง', '1975-01-25', NULL, '0858219229', '29 ถ.ราชพฤกษ์ แขวงบุคคโล', '4511005639', '2027-12-23', '2002-11-01', '2010-08-30', 'https://drive.google.com/uc?id=1DvmZeNAYDIEqxb2F2pPlIUIuSiAI1jLT', 'ข้อมูลบุคลากร test_Images/22.สำเนาบัตรสมาชิกสภาการพยาบาล.112954.jpg', 'ข้อมูลบุคลากร test_Images/22.สำเนาใบอนุญาตประกอบวิชาชีพ.112958.jpg', 'ข้อมูลบุคลากร test_Images/22.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.112958.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(21, 45172038, 'ผู้ช่วยศาสตราจารย์ ดร.', 'สมฤดี', 'ชื่นกิติญานนท์', 'Smฤdi', 'Chuenkitiyannth', 'หญิง', '1975-05-09', NULL, '081-6148304', '525/444 หมู่บ้านทาวน์พลัสประชาอุทิศ ถนนประชาอุทิศ ทุ่งครุ ทุ่งครุ กทม 10140', '4611093778', '2027-12-23', '2002-12-02', '2015-03-06', 'https://drive.google.com/uc?id=1_p_8H6vofSiiaEK_x1XK9uqexqIGlCEy', 'ข้อมูลบุคลากร test_Images/21.สำเนาบัตรสมาชิกสภาการพยาบาล.112310.jpg', 'ข้อมูลบุคลากร test_Images/21.สำเนาใบอนุญาตประกอบวิชาชีพ.112313.jpg', 'ข้อมูลบุคลากร test_Images/21.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.112314.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(14, 45172106, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0858219229', 'ธนบุรี กทม', NULL, NULL, '2002-11-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(15, 45172115, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0816148304', 'ทุ่งครุ กทม', NULL, NULL, '2002-12-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(16, 46172023, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0626954155', 'บางบอน กทม', NULL, NULL, '2003-03-03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(17, 46172037, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0645165928', 'นครชัยศรี นครปฐม', NULL, NULL, '2003-05-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(19, 46172040, 'อาจารย์ ดร. พันจ่าเอก', 'ภูมเดชา', 'ชาญเบญจพิภู', 'Phumedcha', 'Chayebychphiphu', 'ชาย', '1964-04-07', NULL, '0626954155', '5/102 หมู่บ้านวรารมย์ ถนนบางบอน 5 แขวงบางบอน เขตบางบอน กรุงเทพ 10150', '4521050682', '2025-03-21', '2003-03-03', NULL, 'https://drive.google.com/uc?id=1nqUnmZPMKxvtp58XxbOJA30mFnsrM68F', 'ข้อมูลบุคลากร test_Images/47.สำเนาบัตรสมาชิกสภาการพยาบาล.120829.jpg', 'ข้อมูลบุคลากร test_Images/47.สำเนาใบอนุญาตประกอบวิชาชีพ.120832.jpg', 'ข้อมูลบุคลากร test_Images/47.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.120832.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(22, 47172038, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0815809893', 'เพชรเกษม 39 กทม', '4511078893', '2027-12-23', '2004-10-10', '2015-03-06', NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(23, 47172044, 'อาจารย์ ดร.', 'สุวรรณา', 'เชียงขุนทด', 'Suwrrna', 'Echiyngkhunthd', 'หญิง', '1973-02-01', NULL, '0645165928', '27 หมู่ 1 ต.พะเนียด อ.นครชัยศรี จ.นครปฐม', '4511007784', '2024-03-29', '2003-05-01', NULL, 'https://drive.google.com/uc?id=1873hqWR7woVu9DDMW62peMBHB3g1nq8s', 'ข้อมูลบุคลากร test_Images/15.สำเนาบัตรสมาชิกสภาการพยาบาล.084249.jpg', 'ข้อมูลบุคลากร test_Images/15.สำเนาใบอนุญาตประกอบวิชาชีพ.084252.jpg', 'ข้อมูลบุคลากร test_Images/15.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.084253.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(24, 47172046, 'ผู้ช่วยศาสตราจารย์', 'วารุณี', 'เพไร', 'Waruni', 'Ephair', 'หญิง', '1972-08-06', NULL, '0832347470', '318 เพชรเกษม 54 แยก 3 แขวงบางด้วน เขตภาษีเจริญ กรุงเทพ 10160', '4711186486', '2027-12-23', '2004-06-01', '2012-03-06', 'https://drive.google.com/uc?id=1WnAMTUhLQr6o922AuVoghx2Bxy7ieBlW', 'ข้อมูลบุคลากร test_Images/43.สำเนาบัตรสมาชิกสภาการพยาบาล.020201.jpg', 'ข้อมูลบุคลากร test_Images/43.สำเนาใบอนุญาตประกอบวิชาชีพ.020205.jpg', 'ข้อมูลบุคลากร test_Images/43.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.020205.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(25, 47172047, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ชนิดา', 'มัททวางกูร', 'Chnida', 'Maththwangkur', 'หญิง', '1971-09-21', NULL, '0870434000', '47/2', '4511069513', '2027-12-23', '2004-07-01', '2019-06-13', 'https://drive.google.com/uc?id=1joP5gdCjeF_vwjd4pwgfWP1vtMHOQy-z', 'ข้อมูลบุคลากร test_Images/23.สำเนาบัตรสมาชิกสภาการพยาบาล.113246.jpg', 'ข้อมูลบุคลากร test_Images/23.สำเนาใบอนุญาตประกอบวิชาชีพ.113249.jpg', 'ข้อมูลบุคลากร test_Images/23.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.113250.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(11, 47172049, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ศนิกานต์', 'ศรีมณี', 'Snikant', 'Srimni', 'หญิง', '1975-03-01', NULL, '0815809893', '39/72 ไอคอนโดเพชรเกษม 39', '4511078893', NULL, '2004-10-10', NULL, 'https://drive.google.com/uc?id=1d75kQbWnbEfPcuIIbPeVEsARyjVyTmHX', 'ข้อมูลบุคลากร test_Images/11.สำเนาบัตรสมาชิกสภาการพยาบาล.083315.jpg', 'ข้อมูลบุคลากร test_Images/11.สำเนาใบอนุญาตประกอบวิชาชีพ.083319.jpg', 'ข้อมูลบุคลากร test_Images/11.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.083319.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(38, 49172053, 'อาจารย์', 'พรพิมล', 'ภูมิฤทธิกุล', 'Phrphiml', 'Phumiฤththikul', 'หญิง', '1959-04-20', NULL, '0849122468', '18/23 หมู่บ้านตะวันฉาย หนองแขม กรุงเทพฯ', '5511168672', '2027-12-23', '2006-03-16', NULL, 'https://drive.google.com/uc?id=1aqvr313xS63kdlSuNR-I6uYZ4jXjpdPc', 'ข้อมูลบุคลากร test_Images/38.สำเนาบัตรสมาชิกสภาการพยาบาล.014436.jpg', 'ข้อมูลบุคลากร test_Images/38.สำเนาใบอนุญาตประกอบวิชาชีพ.014439.jpg', 'ข้อมูลบุคลากร test_Images/38.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.014439.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(53, 49172054, 'อาจารย์', 'สุนันทา', 'บุญรักษา', 'Sunantha', 'Buyraksa', 'หญิง', '1975-05-10', NULL, '00000000', '19/1 ม 1 ต.สระลงเรือ อ.ห้วยกระเจา  จ.กาญจนบุรี', '6511108 587', '2027-12-23', '2006-08-01', NULL, 'https://drive.google.com/uc?id=1O0HewXyY8pLusOpbJhrU9rUCpOdbqTad', 'ข้อมูลบุคลากร test_Images/53.สำเนาบัตรสมาชิกสภาการพยาบาล.115430.jpg', 'ข้อมูลบุคลากร test_Images/53.สำเนาใบอนุญาตประกอบวิชาชีพ.115434.jpg', 'ข้อมูลบุคลากร test_Images/53.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.115435.jpg', 'Active', NULL, '2026-07-04 20:44:55'),
(6, 50172059, 'อาจารย์์', 'ลัญชนา', 'พิมพันธ์ชัยยบูลย์', 'Laychna', 'Phimphanthchayybuly', 'หญิง', '1982-06-16', NULL, '0801635444', '864/188 the niche id บางแค แขวง/เขตบางแค กรุงเทพ 10160', '5211180156', '2028-03-18', '2007-07-01', NULL, 'https://drive.google.com/uc?id=13ory991sStiiW-IidEBl-ahxOFvyeZzO', 'ข้อมูลบุคลากร test_Images/6.สำเนาบัตรสมาชิกสภาการพยาบาล.082022.jpg', 'ข้อมูลบุคลากร test_Images/6.สำเนาใบอนุญาตประกอบวิชาชีพ.082025.jpg', 'ข้อมูลบุคลากร test_Images/6.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.082026.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(45, 51162072, 'อาจารย์', 'เพ็ญรุ่ง', 'นวลแจ่ม', 'Ephyrung', 'Nwlaechm', 'หญิง', '1973-01-20', NULL, '0816251474', '219 ซอยเทอดไท 63/2 ถนนเทอดไท บางหว้า ภาษีเจริญ กทม10160', '6611103761', '2027-12-23', '2008-08-04', NULL, 'https://drive.google.com/uc?id=1aJ_tfI4dAkn8KeraBcZyspPQ7B4UxQ_H', 'ข้อมูลบุคลากร test_Images/45.สำเนาบัตรสมาชิกสภาการพยาบาล.014052.jpg', 'ข้อมูลบุคลากร test_Images/45.สำเนาใบอนุญาตประกอบวิชาชีพ.014056.jpg', 'ข้อมูลบุคลากร test_Images/45.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.014056.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(18, 52172065, 'อาจารย์ ดร.', 'สุลีมาศ', 'อังศุเกียรติถาวร', 'Sulimas', 'Oangsuekiyrtithawr', 'หญิง', '1974-08-14', NULL, '0869954040', '18/241 ลุมพินีวิลล์คอนโดบางแค', '4511009866', '2024-03-30', '2009-11-16', NULL, 'https://drive.google.com/uc?id=1NGZ3VT9Y0Tp303CU2HPo_uFWz-2VtQa2', 'ข้อมูลบุคลากร test_Images/18.สำเนาบัตรสมาชิกสภาการพยาบาล.085023.jpg', 'ข้อมูลบุคลากร test_Images/18.สำเนาใบอนุญาตประกอบวิชาชีพ.085026.jpg', 'ข้อมูลบุคลากร test_Images/18.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.085026.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(36, 52172066, 'นาง', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharnthip', 'Jirakanjana', 'หญิง', '1975-02-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 53172001, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ร.พ.ธนบุรี1 กทม', '4511070793', '2027-12-23', '2010-09-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(5, 53172079, 'อาจารย์', 'สุธิดา', 'พรมรัศมี', 'Suthida', 'Phrmrasmi', 'หญิง', '1981-03-02', NULL, '0863297163', '160/134 แกรนริเวอร์เทาวน์เวอร์ ซ. พิบูลย์สงคราม 15 ถ. พิบูลย์สงคราม ต. สวนใหญ๋ อ. เมือง จ. นนทบุรี', '5611207472', '2023-08-05', '2010-11-16', NULL, 'https://drive.google.com/uc?id=1bP3BrXVQiIeI9LZKI4br5FNgzyvg31qK', 'ข้อมูลบุคลากร test_Images/5.สำเนาบัตรสมาชิกสภาการพยาบาล.081739.jpg', 'ข้อมูลบุคลากร test_Images/5.สำเนาใบอนุญาตประกอบวิชาชีพ.081743.jpg', 'ข้อมูลบุคลากร test_Images/5.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.081744.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(13, 54127262, 'อาจารย์', 'ธัญลักษณ์วดี', 'ก้อนทองถม', 'Thaylaksnwdi', 'Konthongthm', 'หญิง', '1986-09-15', NULL, '0897210113', 'คอนโดลุมพินีเพลสบรมราชชนนี ปิ่นเกล้า ตลิ่งชัน กทม', '5211209369', '2023-10-28', '2011-10-03', NULL, 'https://drive.google.com/uc?id=1Zm5Qq1dTXjAQVLN_dABYY-KFA0Nrl7lu', 'ข้อมูลบุคลากร test_Images/13.สำเนาบัตรสมาชิกสภาการพยาบาล.083726.jpg', 'ข้อมูลบุคลากร test_Images/13.สำเนาใบอนุญาตประกอบวิชาชีพ.083729.jpg', 'ข้อมูลบุคลากร test_Images/13.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.083729.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(41, 54172002, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0819160919', '151 ปิ่นเกล้า กทม', '4511002485', NULL, '2011-01-11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(42, 54172003, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0879549929', 'บางบอน กทม', NULL, NULL, '2011-05-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(43, 54172071, 'อาจารย์ ดร.', 'วราภรณ์', 'คำรศ', 'Wraphrn', 'Khamrs', 'หญิง', '1983-08-09', NULL, '0873711369', '107/34 หมู่บ้านเลอร์พาร์ค ซอยเทียนทะเล28 แขวงท่าข้าม เขตบางขุนเทียน กทม 10150', '6411198208', '2027-12-23', '2011-12-16', NULL, 'https://drive.google.com/uc?id=1YCUnwuJfnQDJmZachO3w966obH4-ieEd', 'ข้อมูลบุคลากร test_Images/16.สำเนาบัตรสมาชิกสภาการพยาบาล.084459.jpg', 'ข้อมูลบุคลากร test_Images/16.สำเนาใบอนุญาตประกอบวิชาชีพ.084502.jpg', 'ข้อมูลบุคลากร test_Images/16.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.084502.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(28, 54172078, 'ผู้ช่วยศาสตราจารย์ ดร. เรือเอกหญิง', 'วิภานันท์', 'ม่วงสกุล', 'Wiphananth', 'Mwngskul', 'หญิง', '1977-04-27', NULL, '0879549929', '42 ถนนบางขุนเทียน แขวงบางบอน เขตบางบอน กทม.', '4711178169', '2027-12-23', '2011-05-01', '2021-03-10', 'https://drive.google.com/uc?id=1E2SjA2FNZyho64fD-xlhnxeyRLWSPA66', 'ข้อมูลบุคลากร test_Images/28.สำเนาบัตรสมาชิกสภาการพยาบาล.114734.jpg', 'ข้อมูลบุคลากร test_Images/28.สำเนาใบอนุญาตประกอบวิชาชีพ.114739.jpg', 'ข้อมูลบุคลากร test_Images/28.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.114739.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(46, 54172084, 'นางสาว', 'ธัญลักษณ์วดี', 'ก้อนทองถม', NULL, NULL, 'หญิง', '1986-09-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 54172085, 'อาจารย์', 'อัมพร', 'คงจีระ', 'Oamphr', 'Khngchira', 'หญิง', '1951-04-16', NULL, '0819160919', '151 the trust residence ปิ่นเกล้า แขวงอรุณอมรินทร์ เขตบางกอกน้อย กรุงเทพ', '4511002485', '2027-12-23', '2011-01-11', NULL, 'https://drive.google.com/uc?id=1ECqJDA5qXeauQteZxfD15vHsTLZAFyxw', 'ข้อมูลบุคลากร test_Images/7.สำเนาบัตรสมาชิกสภาการพยาบาล.082259.jpg', 'ข้อมูลบุคลากร test_Images/7.สำเนาใบอนุญาตประกอบวิชาชีพ.082303.jpg', 'ข้อมูลบุคลากร test_Images/7.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.082303.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(48, 54172120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0897210113', 'ปิ่นเกล้า ตลิ่งชัน', NULL, NULL, '2011-10-03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(49, 54172124, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0873711369', 'บางขุนเทียน กทม', NULL, NULL, '2011-12-16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(50, 56172005, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0863251189', 'ตลาดพลู กทม', NULL, NULL, '2013-01-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(51, 56172088, 'อาจารย์', 'วิวรรณา', 'คล้ายคลึง', 'Wiwrrna', 'Khlaykhlueng', 'หญิง', '1973-10-07', NULL, '0895212345', '29 ซอยเทอดไท55 ถนนเทอดไท แขวงปากคลองภาษีเจริญ เขตภาษีเจริญ กรุงเทพมหานคร 10160', '4511013331', '2027-12-23', '2013-03-01', NULL, 'https://drive.google.com/uc?id=1xx4kOk-muqL_M5BzWv4d6i1DgqrnGp_a', 'ข้อมูลบุคลากร test_Images/51.สำเนาบัตรสมาชิกสภาการพยาบาล.032748.jpg', 'ข้อมูลบุคลากร test_Images/51.สำเนาใบอนุญาตประกอบวิชาชีพ.032752.jpg', 'ข้อมูลบุคลากร test_Images/51.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.032752.jpg', 'Active', NULL, '2026-07-04 20:44:55'),
(8, 56172089, 'นางสาว', 'สุจิตราภรณ์', 'ทับครอง', 'Suchitraphrn', 'Thabkhrong', 'หญิง', '1995-10-02', NULL, '0863251189', '1435/4 ถนนริมทางรถไฟ แขวงตลาดพลู', '4511050062', '2027-12-23', '2013-01-05', NULL, 'https://drive.google.com/uc?id=1auCWBF3365DVRxEU7ZR4po7uFY2UYb7i', 'ข้อมูลบุคลากร test_Images/8.สำเนาบัตรสมาชิกสภาการพยาบาล.082514.jpg', 'ข้อมูลบุคลากร test_Images/8.สำเนาใบอนุญาตประกอบวิชาชีพ.082517.jpg', 'ข้อมูลบุคลากร test_Images/8.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.082517.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(55, 56172103, 'อาจารย์', 'รัฐกานต์', 'ขำเขียว', 'Rathkant', 'Khamekhiyw', 'หญิง', '1984-12-10', NULL, '0874261515', '225/8 หมู่บ้านรุ่งกานต์ 7 ตำบลบางบัวทอง อำเภอบางบัวทอง จังหวัดนนทบุรี 11110', '5111205212', '2027-12-23', '2013-06-01', '2024-08-07', 'https://drive.google.com/uc?id=1elyf7BVBYfGCduTRsJ2xuffMBHT8AzpX', 'ข้อมูลบุคลากร test_Images/2.สำเนาบัตรสมาชิกสภาการพยาบาล.073955.jpg', 'ข้อมูลบุคลากร test_Images/2.สำเนาใบอนุญาตประกอบวิชาชีพ.074000.jpg', 'ข้อมูลบุคลากร test_Images/2.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.074000.jpg', 'Active', NULL, '2026-07-04 20:40:15'),
(56, 56172104, 'อาจารย์ ดร.', 'ณิชมล', 'ขวัญเมือง', 'Nichml', 'Khwayemueong', 'หญิง', '1972-03-19', NULL, '0894595043', '145 หมู่11 ซ.สวนผัก29 ถ.สวนผัก เขตตลิ่งชัน กทม', '4511017614', '2027-12-31', '2013-05-01', NULL, 'https://drive.google.com/uc?id=1USqFiHXgoLACo41OpaS6Tfe2a5DERSve', 'ข้อมูลบุคลากร test_Images/25.สำเนาบัตรสมาชิกสภาการพยาบาล.113906.jpg', 'ข้อมูลบุคลากร test_Images/25.สำเนาใบอนุญาตประกอบวิชาชีพ.113909.jpg', 'ข้อมูลบุคลากร test_Images/25.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.113910.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(57, 56172121, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0894595043', 'ตลิ่งชัน กทม', NULL, NULL, '2013-05-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(58, 56172130, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0895212345', 'ภาษีเจริญ กทม', NULL, NULL, '2013-03-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(59, 56172131, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0829159056', 'จอมทอง กทม', NULL, NULL, '2013-09-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(60, 57172019, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0851248147', 'บางกรวย นนทบุรี', NULL, NULL, '2014-08-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(61, 57172108, 'อาจารย์', 'นฤมล', 'อังศิริศักดิ์', 'Nฤml', 'Oangsirisakdi', 'หญิง', '1985-02-04', NULL, '0851248147', '79/299 ม.ศุภาลัยวิลล์ ต.ศาลากลาง อ.บางกรวย จ.นนทบุรี', '5011200055', '2027-12-31', '2014-04-01', NULL, 'https://drive.google.com/uc?id=1x6gI8B5uHFWFFLyXtJTvwFw39pYEep23', 'ข้อมูลบุคลากร test_Images/10.สำเนาบัตรสมาชิกสภาการพยาบาล.083100.jpg', 'ข้อมูลบุคลากร test_Images/10.สำเนาใบอนุญาตประกอบวิชาชีพ.083103.jpg', 'ข้อมูลบุคลากร test_Images/10.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.083103.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(62, 57172109, 'ผู้ช่วยศาสตราจารย์ ดร.', 'ดวงกมล', 'วิรุฬห์อุดมผล', 'Dwngkml', 'Wirulhoudmphl', 'หญิง', '1966-04-22', NULL, '0899252193', '106/101 ถ.เอกชัย แขวลบาวบอน เขตบางบอน', '5711254926', '2024-07-27', '2014-06-01', NULL, 'https://drive.google.com/uc?id=1-lOS-Wqk9T535DDJ1Xu70kTSF-nirLMV', 'ข้อมูลบุคลากร test_Images/39.สำเนาบัตรสมาชิกสภาการพยาบาล.014946.jpg', 'ข้อมูลบุคลากร test_Images/39.สำเนาใบอนุญาตประกอบวิชาชีพ.014949.jpg', 'ข้อมูลบุคลากร test_Images/39.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.014950.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(63, 57172115, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0899252193', 'บางบอน กทม', NULL, NULL, '2014-06-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(64, 58172003, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0909696157', 'สามพราน นครปฐม', NULL, NULL, '2015-01-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(65, 58172110, 'อาจารย์', 'สุกฤตา', 'ตะการีย์', 'Sukฤta', 'Takariy', 'หญิง', '1980-01-26', NULL, '0909696157', '28/1 ม.2  ต.ท่าตลาด อ.สามพราน จ.นครปฐม 73110', '4811193884', '2025-11-28', '2015-01-15', NULL, 'https://drive.google.com/uc?id=1psBPO920WMSZC76B4F_L8wSan3t8fN0m', 'ข้อมูลบุคลากร test_Images/9.สำเนาบัตรสมาชิกสภาการพยาบาล.082847.jpg', 'ข้อมูลบุคลากร test_Images/9.สำเนาใบอนุญาตประกอบวิชาชีพ.082850.jpg', 'ข้อมูลบุคลากร test_Images/9.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.082850.jpg', 'Active', NULL, '2026-07-04 20:43:29'),
(66, 58172114, 'นางสาว', 'ศิริพร', 'สามสี', 'Siriporn', 'Samsri', 'หญิง', '1969-03-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 58172129, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0815659852', 'บางบัวทอง นนทบุรี', NULL, NULL, '2015-10-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(68, 58172130, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0812534343', 'รพ.ธนบุรี1 กทม', NULL, NULL, '2015-10-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(69, 58172131, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ทวีวัฒนา กทม', NULL, NULL, '2015-10-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(70, 59172119, 'อาจารย์', 'ชัยสิทธิ์', 'ทันศึก', 'Chaysiththi', 'Thansuek', 'ชาย', '1972-04-30', NULL, '0879881114', '142/23 ม.1 ต.แพรกยา อ.เมือง จ.สมุทรปราการ 10280', '4311158065', '2028-07-27', '2016-10-01', NULL, 'https://drive.google.com/uc?id=1bwBv9IX269alpJcPN2jvhn87b253GC57', 'ข้อมูลบุคลากร test_Images/17.สำเนาบัตรสมาชิกสภาการพยาบาล.084801.jpg', 'ข้อมูลบุคลากร test_Images/17.สำเนาใบอนุญาตประกอบวิชาชีพ.084805.jpg', 'ข้อมูลบุคลากร test_Images/17.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.084806.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(71, 59172120, 'นาง', 'พิไลพรรณ', 'แก้วแก่นตา', NULL, NULL, 'หญิง', '1976-01-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 59172121, 'อาจารย์', 'ระชี', 'ดิษฐจร', 'Rachi', 'Disthchr', 'หญิง', '1955-11-16', NULL, '0869755634', '146 ซ.สุขุมวิท 62 ต.บางจาก อ.พระโขนง กรุงเทพฯ 10260', '4511012136', '2027-12-23', '2016-11-01', NULL, 'https://drive.google.com/uc?id=10OJ3-dzXbX-myVOmccENNAMR910U3fpL', 'ข้อมูลบุคลากร test_Images/24.สำเนาบัตรสมาชิกสภาการพยาบาล.113627.jpg', 'ข้อมูลบุคลากร test_Images/24.สำเนาใบอนุญาตประกอบวิชาชีพ.113630.jpg', 'ข้อมูลบุคลากร test_Images/24.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.113631.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(73, 59172124, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0879881114', 'สมุทรปราการ', NULL, NULL, '2016-10-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(74, 59172126, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0869755634', 'พระโขนง กทม', NULL, NULL, '2016-11-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(75, 59172132, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0800769229', 'ปราจีนบุรี', NULL, NULL, '2016-05-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(76, 60172120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0847083511', 'บางพลี สมุทรปราการ', NULL, NULL, '2017-02-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(77, 60172123, 'อาจารย์', 'ขวัญเรือน', 'ก๋าวิตู', 'Khwayerueon', 'Kawitu', 'หญิง', '1985-06-19', NULL, '0847083511', '206/4 The village bangna3 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ', '5111207345', '2024-07-25', '2017-02-02', NULL, 'https://drive.google.com/uc?id=1qf6sC-ZthUNaS6ntboBTHYlcPTChtwip', 'ข้อมูลบุคลากร test_Images/41.สำเนาบัตรสมาชิกสภาการพยาบาล.013725.jpg', 'ข้อมูลบุคลากร test_Images/41.สำเนาใบอนุญาตประกอบวิชาชีพ.013728.jpg', 'ข้อมูลบุคลากร test_Images/41.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.013728.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(78, 62172003, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0868046982', 'นครปฐม', NULL, NULL, '2019-02-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(79, 63172128, 'อาจารย์', 'เรวัต', 'แย้มสุดา', 'Erwat', 'Aeymsuda', 'ชาย', '1959-04-28', NULL, '0814463037', '109/170 หมู่2 ต.มหาสวัสดิ์ อ.บางกรวย จ.นนทบุรี', 'อ.1/21510', NULL, '2020-01-01', NULL, 'https://drive.google.com/uc?id=1HcurGQ_0JKN-s4zn6PX7FPmR7hie1KI3', 'ข้อมูลบุคลากร test_Images/46.สำเนาบัตรสมาชิกสภาการพยาบาล.035305.jpg', 'ข้อมูลบุคลากร test_Images/46.สำเนาใบอนุญาตประกอบวิชาชีพ.035309.jpg', 'ข้อมูลบุคลากร test_Images/46.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.035309.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(80, 63172129, 'นางสาว', 'รัตนาภรณ์', 'นิวาศานนท์', NULL, NULL, 'หญิง', '1992-03-24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'เปลี่ยนนามสกุล', NULL),
(81, 63172131, 'นางสาว', 'พาจนา', 'ดวงจันทร์', NULL, NULL, 'หญิง', '1967-04-29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 63172132, 'นาง', 'บัวทิพย์', 'เพ็งศรี', 'Buatip', 'Phengsri', 'หญิง', '1970-10-17', NULL, '0814463037', 'นนทบุรี', NULL, NULL, '2020-01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 63172133, 'นางสาว', 'พรรณี', 'ตรังคสันต์', NULL, NULL, 'หญิง', '1968-02-27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 64172123, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0840583508', 'เพชรเกษม 48 กทม', NULL, NULL, '2021-03-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(85, 64172139, 'นางสาว', 'สุภาภรณ์', 'ศรีฟ้า', 'Suphaphrn', 'Srifa', 'หญิง', '1985-11-12', NULL, '0840583508', '131 ซ เพชรเกษม 48 แยก 24 แขวงบางแวก เขตภาษีเจริญ กทม 10160', '5111207470', '2028-07-02', '2021-03-01', NULL, 'https://drive.google.com/uc?id=1noxVEzgrQHZ9nXUbfT4hhubvxi-UGrKe', 'ข้อมูลบุคลากร test_Images/14.สำเนาบัตรสมาชิกสภาการพยาบาล.084047.jpg', 'ข้อมูลบุคลากร test_Images/14.สำเนาใบอนุญาตประกอบวิชาชีพ.084050.jpg', 'ข้อมูลบุคลากร test_Images/14.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.084052.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(86, 65172134, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0646482795', 'หนองแขม กทม', NULL, NULL, '2022-08-16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(87, 65172136, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0865133653', 'จอมทอง กทม', NULL, NULL, '2022-12-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(88, 65172138, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0949629947', 'ภาษีเจริญ กทม', NULL, NULL, '2022-08-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(44, 65172141, 'อาจารย์', 'นฐมน', 'บุญล้อม', 'Nthmn', 'Buylom', 'หญิง', '1972-02-28', NULL, '0949629947', 'มัลเบอรี่เพลส  118/8-9 ถ.เพชรเกษม แขวงบางหว้า เขตภาษีเจริญ  กรุงเทพฯ', '4511014607', '2027-12-23', '2022-08-01', NULL, 'https://drive.google.com/uc?id=1Ec2xvmzkH5sgnPl7U1p_rl6pRRQzs6VR', 'ข้อมูลบุคลากร test_Images/44.สำเนาบัตรสมาชิกสภาการพยาบาล.034636.jpg', 'ข้อมูลบุคลากร test_Images/44.สำเนาใบอนุญาตประกอบวิชาชีพ.034639.jpg', 'ข้อมูลบุคลากร test_Images/44.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.034641.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(89, 65172142, 'นาง', 'อัจรา', 'ฐิตวัฒนกุล', NULL, NULL, 'หญิง', '1987-09-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 65172145, 'อาจารย์', 'ปรมัตถ์', 'กิจจานุกิจวัฒนา', 'Prmatth', 'Kichchanukichwathna', 'หญิง', '1987-04-28', NULL, '0865133653', '581/943 เดอะนิชไอดีพระราม 2 เฟส 2', '5211209760', '2027-12-20', '2022-12-01', NULL, 'https://drive.google.com/uc?id=1XaNNEA8x7lgMO-YblrQGRtbM8g0Wvjsr', 'ข้อมูลบุคลากร test_Images/40.สำเนาบัตรสมาชิกสภาการพยาบาล.013343.jpg', 'ข้อมูลบุคลากร test_Images/40.สำเนาใบอนุญาตประกอบวิชาชีพ.013347.jpg', 'ข้อมูลบุคลากร test_Images/40.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.013347.jpg', 'Active', NULL, '2026-07-04 20:44:54'),
(90, 66172146, 'นางสาว', 'สุธาทิพย์', 'กัลยา', 'Suthathiphy', 'Kalya', 'หญิง', '2000-01-22', NULL, '0893724113', '921/8  ซอยเพชรเกษม 4  ถนนเพชรเกษม  แขวงวัดท่าพระ  เขตบางกอกใหญ่  กรุงเทพมหานคร 10600', NULL, NULL, '2023-05-18', NULL, 'https://drive.google.com/uc?id=1pHcvF34hbZRXweT-3BgNVUmTADlkGtJP', 'ข้อมูลบุคลากร test_Images/50.สำเนาบัตรสมาชิกสภาการพยาบาล.115955.jpg', 'ข้อมูลบุคลากร test_Images/50.สำเนาใบอนุญาตประกอบวิชาชีพ.115959.jpg', 'ข้อมูลบุคลากร test_Images/50.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.115959.jpg', 'Active', NULL, '2026-07-04 20:44:55'),
(91, 66172147, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0922626443', 'ตลิ่งชัน กทม', NULL, NULL, '2023-01-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 06:07:58'),
(92, 66172148, 'นาง', 'รุ่งนภา', 'พรหมแย้ม', NULL, NULL, 'หญิง', '1963-05-03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 66712147, 'นางสาว', 'เกวลี', 'เชียรวิชัย', NULL, NULL, 'หญิง', '1990-09-06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 6317212129, 'อาจารย์', 'รัตนาภรณ์', 'นิวาศานนท์', 'Ratnaphrn', 'Niwasannth', 'หญิง', '1992-03-24', NULL, '0868046982', 'หมู่บ้านร้อยพฤกษาเลควิว  223/169 ซอย11 หมู่ 10 ต. นครปฐม อ เมืองนครปฐม จ.นครปฐม', '51811261753', '2025-07-26', '2019-02-01', NULL, 'https://drive.google.com/uc?id=1Yb5w7soKR-wXjXupTQJbZbgtwYw73HDB', 'ข้อมูลบุคลากร test_Images/12.สำเนาบัตรสมาชิกสภาการพยาบาล.083524.jpg', 'ข้อมูลบุคลากร test_Images/12.สำเนาใบอนุญาตประกอบวิชาชีพ.083527.jpg', 'ข้อมูลบุคลากร test_Images/12.เอกสารรับรองผ่านการอบรมหลักสูตรการสอนทางพยาบาล.083528.jpg', 'Active', NULL, '2026-07-04 20:43:30'),
(94, 6604800008, 'นางสาว', 'อาภัสรา', 'เนตรสัก', 'Arpatsara', 'Netsak', 'หญิง', '2004-01-01', 'example@gmail.com', '0123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-21 10:16:07');

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
-- Table structure for table `faculty_research`
--

CREATE TABLE `faculty_research` (
  `research_id` bigint NOT NULL,
  `faculty_id` bigint NOT NULL COMMENT 'เจ้าของผลงาน',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่องานวิจัย',
  `publication_year` int DEFAULT NULL COMMENT 'ปีที่ตีพิมพ์',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ประเภท (วิจัยสถาบัน, วิจัยชุมชน)',
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Path ไฟล์ PDF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
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
(1, 5, 'teachers', 'ข้อมูลอาจารย์ 2568_คณะพยาบาล มหาวิทยาลัยสยามเเก้ (csv)(test).csv', 43, 'success', NULL, '2026-02-27 12:38:02'),
(2, 5, 'students', 'student_performance.csv', 0, 'success', NULL, '2026-06-23 21:39:12'),
(3, 5, 'teachers', 'student_performance.csv', 0, 'success', NULL, '2026-06-23 21:57:43'),
(4, 5, 'courses', 'สรุปงบแผนคณะพยาบาลศาสตร์ ปี 2566.xlsx', 0, 'failed', 'SQLSTATE[HY000]: General error: 1366 Incorrect integer value: \'\\xE0\\xB8\\x84\\xE0\\xB8\\x93\\xE0\\xB8\\xB0\\xE0\\xB8\\x9E\\xE0\\xB8\\xA2\\xE0\\xB8\\xB2\\xE0\\xB8\\x9A\\xE0\\xB8\\xB2\\xE0\\xB8\\xA5\\xE0\\xB8\\xA8\\xE0\\xB8\' for column \'faculty_id\' at row 1', '2026-06-23 21:59:10'),
(5, 5, 'teachers', 'สรุปงบแผนคณะพยาบาลศาสตร์ ปี 2566.xlsx', 0, 'failed', 'SQLSTATE[HY000]: General error: 1366 Incorrect integer value: \'\\xE0\\xB8\\x84\\xE0\\xB8\\x93\\xE0\\xB8\\xB0\\xE0\\xB8\\x9E\\xE0\\xB8\\xA2\\xE0\\xB8\\xB2\\xE0\\xB8\\x9A\\xE0\\xB8\\xB2\\xE0\\xB8\\xA5\\xE0\\xB8\\xA8\\xE0\\xB8\' for column \'faculty_id\' at row 1', '2026-06-23 21:59:49'),
(6, 5, 'projects', 'สรุปงบแผนคณะพยาบาลศาสตร์ ปี 2566.xlsx', 0, 'failed', 'SQLSTATE[42S22]: Column not found: 1054 Unknown column \'project_code\' in \'field list\'', '2026-06-23 22:07:12'),
(7, 5, 'projects', 'Nursing_Manual_Test.xlsx', 0, 'failed', 'SQLSTATE[42S22]: Column not found: 1054 Unknown column \'project_code\' in \'field list\'', '2026-06-30 20:04:54'),
(8, 5, 'courses', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 20:18:16'),
(9, 5, 'projects', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 20:18:26'),
(10, 5, 'projects', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 20:45:16'),
(11, 5, 'projects', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 21:09:12'),
(12, 5, 'projects', 'subject-import-test.xlsx', 0, 'failed', 'โครงสร้างไฟล์ไม่ตรงกับประเภท projects: ขาดคอลัมน์ project_id, project_name_th, project_name_en, mapping_json, responsible_faculty_id, academic_year', '2026-06-30 21:20:34'),
(13, 5, 'projects', 'project_import_test.xlsx', 0, 'success', NULL, '2026-06-30 21:20:56'),
(14, 5, 'projects', 'project_import_test.xlsx', 1, 'success', NULL, '2026-06-30 21:21:54'),
(15, 5, 'courses', 'project_import_test.xlsx', 0, 'failed', 'โครงสร้างไฟล์ไม่ตรงกับประเภท courses: ขาดคอลัมน์ subject_id, subject_code, subject_name_th, subject_name_en, credit, credit_desc, is_active, program_id, department, subject_type, year_level, semester', '2026-06-30 21:25:36'),
(16, 5, 'courses', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 21:26:27'),
(17, 5, 'courses', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 21:33:49'),
(18, 5, 'courses', 'subject-import-test.xlsx', 0, 'success', NULL, '2026-06-30 21:35:26'),
(19, 5, 'projects', 'project_import_test.xlsx', 1, 'success', NULL, '2026-06-30 21:36:15'),
(20, 5, 'courses', 'subject-import-test.xlsx', 0, 'failed', 'SQLSTATE[HY000]: General error: 1364 Field \'subject_id\' doesn\'t have a default value', '2026-06-30 21:37:06'),
(21, 5, 'courses', 'project_import_test.xlsx', 0, 'failed', 'โครงสร้างไฟล์ไม่ตรงกับประเภท courses: ขาดคอลัมน์ subject_code, subject_name_th, subject_name_en, credit, credit_desc, is_active, program_id, department, subject_type, year_level, semester', '2026-06-30 22:03:53'),
(22, 5, 'courses', 'subject-import-test.xlsx', 0, 'failed', 'SQLSTATE[42S22]: Column not found: 1054 Unknown column \'subject_code\' in \'field list\'', '2026-06-30 22:03:59'),
(23, 5, 'courses', 'subject-import-test.xlsx', 0, 'failed', 'SQLSTATE[HY000]: General error: 1364 Field \'subject_id\' doesn\'t have a default value', '2026-06-30 22:25:36'),
(24, 5, 'courses', 'subject-import-test.xlsx', 0, 'failed', 'SQLSTATE[HY000]: General error: 1364 Field \'subject_id\' doesn\'t have a default value', '2026-06-30 22:26:35'),
(25, 5, 'courses', 'subject-import-test.xlsx', 0, 'failed', 'SQLSTATE[23000]: Integrity constraint violation: 1048 Column \'subject_id\' cannot be null', '2026-06-30 22:28:54'),
(26, 5, 'courses', 'subject-import-test.xlsx', 1, 'success', NULL, '2026-06-30 22:31:27'),
(27, 5, 'projects', 'project_import_test.xlsx', 0, 'failed', 'SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry \'2\' for key \'project.PRIMARY\'', '2026-06-30 22:32:14'),
(28, 5, 'courses', 'subject-import-test.xlsx', 1, 'success', NULL, '2026-06-30 22:35:04'),
(29, 5, 'projects', 'project_import_test.xlsx', 1, 'success', NULL, '2026-06-30 22:35:34'),
(30, 5, 'projects', 'project_import_test.xlsx', 1, 'success', NULL, '2026-06-30 22:39:33'),
(31, 5, 'projects', 'project_import_test.xlsx', 3, 'success', NULL, '2026-06-30 22:41:52'),
(32, 5, 'projects', 'project_import_test.xlsx', 3, 'success', NULL, '2026-06-30 22:45:44');

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
(17, 5, 10, 'โหลๆเทสๆอุอุอุ', 'อุอุอุอุอึอึอึอึอึ', NULL, 'request', 'in-app', 0, '2026-07-11 11:08:42');

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
(50, 'STUDENTS_INFO_VIEW', 'ADVISOR', 'ดูข้อมูลนักศึกษาในที่ปรึกษา'),
(51, 'PERFORMANCE_MANAGE', 'PRACTICAL', 'จัดการผลประเมิน Performance'),
(52, 'SCHEDULE_TASKS_MANAGE', 'PRACTICAL', 'จัดการตารางงานและงานฝึกปฏิบัติ');

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
(20, 6603400001, 'หลักฐาน1', 'photo', NULL, 'แมวต้ม.jpg', NULL, 0xffd8ffe000104a46494600010101004800480000ffe201d84943435f50524f46494c45000101000001c800000000043000006d6e74725247422058595a2007e00001000100000000000061637370000000000000000000000000000000000000000000000000000000010000f6d6000100000000d32d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000964657363000000f0000000247258595a00000114000000146758595a00000128000000146258595a0000013c00000014777470740000015000000014725452430000016400000028675452430000016400000028625452430000016400000028637072740000018c0000003c6d6c756300000000000000010000000c656e5553000000080000001c007300520047004258595a200000000000006fa2000038f50000039058595a2000000000000062990000b785000018da58595a2000000000000024a000000f840000b6cf58595a20000000000000f6d6000100000000d32d706172610000000000040000000266660000f2a700000d59000013d000000a5b00000000000000006d6c756300000000000000010000000c656e5553000000200000001c0047006f006f0067006c006500200049006e0063002e00200032003000310036ffdb00430006040506050406060506070706080a100a0a09090a140e0f0c1017141818171416161a1d251f1a1b231c1616202c20232627292a29191f2d302d283025282928ffdb0043010707070a080a130a0a13281a161a2828282828282828282828282828282828282828282828282828282828282828282828282828282828282828282828282828ffc200110802ca02df03012200021101031101ffc4001b00000301010101010000000000000000000001020304050607ffc400190101010101010100000000000000000000000102030405ffda000c03010002100310000001f9ad2b526b5b303a05e73a039ce949ce740739d01cc748731d21cc740731d01ceba51ceba51cc740732e80e65d28e75d08c0dc39cdc3037460ba1181ba315ba31360c0d831360c4d831360c4d9989b0606c18add18add189b2315ba315b23136464b6464b60c4d4325b28c8d43235466b546668199a33d3df2e8aad0d082dae668199a0666826668199a0b9ad48c96a191aaac8d5264b5464b5464b59215866b40cd68199619ad0335a066b40cd681996199610ac20b0929905b2168199619961996199619ad119ad0335a2215910ac2168882d12ac20a082d10e825d077f473f456da45cac315d8812c80b21ad10259016a42920648524918812150842040922890a528b5016a418a4a528b52144a289631229c328414a428cc2d4a2ccd1a19c9a9886ab3468641a2cc345991a2cc34330b330b330d100000c6776f86f5be99e934da69b03b0006034869943043621a5432120a40d25548a6a494c2152246093053522184aa421a10d0952134c000180002689291234254131a4440d5134125040c218e215a057248c20a071a40868181ddd186f6ef71a4ac04d81d03250612502184d0221a690d48952d1008a6e5167a49334a240a42624d02010d093424d0800000004c13001821a08b421a12a44cda215c92a94206254aa46123412c246e2460f3d72000003bfa30e85dae34941cd9d0d50984d03110c543100152a421a44356934925356255290aa44012008612a904da3375224d093043043400054d00c09a448c14b01344a60952255a332a604c10c14d159d0813210d0f3d3304c10c3bfa30de5dee2d5cd09b50e934e698122548549d201402854a12a44a6ac99a5624d2297224d080000130400a349255a20a421a10c10c258c6d304d09548930134494095a215a3356881a12a4200454890424d151a412304c0efdf0e8ceb6b8b1b1d9b8c5430008001360950b2da400a1395535364ab949569615248549246008b50d02690421a014d04820000189a61535026a94da2060860ad6c679d214dc999488561997248d424c12a08290469024d5001dfd1cfd18d6f71636aab702069800200600c4c498b23560aa554d2b12132e5a59549662e51008952013a06853484008a52a96910d50c2268600c06528b82468028d5560263265a09a9137ebc7931f75e61f2b1d18903040509c959eb9c4aa4200f43a39fa33adae2c7499b800d14da709300602680050104d22552b2152b102526a453531252d65261340000a692cb0944040d320000034ca18219531a490a817465d0618d4963466c013da3d2fb9e1f732be6dd2fe71e17e93f9f5724d4d826a8548a8d223354891877f473f4675bde76554d1b8c54311310e5b10ca432134125150ad095226695202262e491a09a572868135401344d2101648d448da48325d2a9a550da609aba49a914d24d6b4c2b9dad0acf4c40087ecf91f5f97d1ef2e686a6a7e2fedfccafcca7ab9ee7357224c2d5063348498777473f4675b5cd8ee2ce840000d340c648d500000082041490a92192aa452d129821a640013568c3354d4d886ec856966952414a22d3131898c43099a445ad4df87bb82a76cf7318a904dc75fdcfccfd9e2f4354aa68d223449f9cf8ff5ff002499cd2b606acd8a239a6e04c2bb7a30e8c6b6b8d06d33a000006086d2aa49826a0001342029469024d524e689720d3912a1255c82a5355b75fd447c365f65f3367181a8f4cba65e53a39ca9b8441bf3e581d539e78539e9ddcdeb8e5cd3d99c9cfd5cfd7d7b67c7df1cb8f26bd186b5ce83a7535cfd697e8bdde4ede7aaa55486f5338da6bc1f80fd23f3c4e3553a48d1d0dd471c6b9080aeee8c3a3176d2340017a0600034c24a092a473484c4302a46428a9a49cd24d04d4a026804c5201f6727b72fd17a1950fe5be9f82be067b792c8d2265f478ba5af3ce9099f573f4f0f2f3d42d6bab97a72e7c34cf6e6bb9df9ef5bd375a73e3872e91d7aedcfd5c9ae998cdf5bfadf0becf1aebd635cdaa2b59451b911ac4bc5f9dfe97f067cec52dc94d1d5a46d270e5be240c3bfa39fa73adae74a4323718a9850c709304a812684996a19120c99b9b20a552a912aa5943400c45069f5be4fd662a4834c77d2bf3ef37ebfe46c95574bbf83b172c3bb8e4cbab9ba787979937ad6f87472f3e5d5cdbe37514b6defa9a7cf8f03d67a75d31b8e7cb9758f5bb7d0f53e879fb31aad72d0d446f344ad66b3254f90faff009b3e1235cf525549d7be1d59c7065d38e6626893aba79fa75db7b8d28191d032d450934396465895225b099d09736d123448d0a6a351268269592ad4b2c79c1b65ece73f47d99a9556551b5e2ebc7f90fb4f8f31d73db52e3a79d7af8fa1a799d19ae7cf53258e6e19d7b1be158c6b39cc9dc52e9d71d39fab9f1c79b486b5facf2fe95e8d6a1cd6978da6ef03a67a0c16a74ac034f9ff007380fcd31ede42274567575f3766670e3be333994671bf473f4f6f5efa4680a8376dd2192a6980e410c4304308548954aa552889d26c534aa26e6c49a836cb7f2f84ea5f6b1f1cbeee6efe18fb823e20fb667c473fe81e39f224675d6e7b2ce4adf73cc5bf11bae70e87ca4bd4b9c4e930ec9a47b1b66fcfdfba65e05fbfe949f26fece65f8e3ec297e38fb3b67e25fdb3dbe20fb7cb53e317dad9f0efede6bf3dcefc2af64f1063e871a7aebe773f4f36fa213cf2e8e9e7e8ebebdf5cf40a4ce94c51a700142a44aa04220004a8b6154dca9a9954da2554e939e91732db85b65af97c3ef7d5793ec77f59359ce964d0a74467c1e9667e7d8fb7e35a754ef66b66e9cbe57d2f9f1e31e8ccbe7576f44bc0fe93697e77d9ededc59d76a4e73a1d617a29335aacdc9e8443a2c4c34734526d6911a67a7e7fe0fbde1e99a69cfdfa5bf2e7e4f27a1c7d3a60c31c7a7a79ba7a7a7a34cf41b4ce863501c21a04c495495148045a952494cb2552266e25535364a6b500216d8efe5f0fde76f2f57a3d7386d867a2d39ea5eb7969ac8a94bcbf33f5d84bf31ea7a1bc797b7a44719d665e5e5eac66f07474d03a7b905a855215515b8e6e6920c506c45164ab44812b13a22d69f23f35fa07c157979dcde7f45dbcbe973e7e2f07ade7efaf14eb19e1bf4f3f46fd3d1a67a0da6bd2304d88c0892954aa54864b2ae001548cb266d44cda599a1329d275336c16f8e9e5f17e85d3cdd3e8f5465b467ae4eab29d02e6922690c131d8d32a22f2e16b3bc39eeb4e6d6ba2f3d3d18716ac88bcf85abc35db513eb10d43122882ad221019a09c006d3f27f5dc95f9561ecf8d79fd37b1e47b9cf9f91e77b1e6ebaf998f5f3e7869d3cfd3d3d3be99e8369af535425484528452b2468040e692a4d54aa5624d4a91229a44aa9b65a685cdf97c1fa074f374fa7d5396b867ace9cdae35b83d60549402072ca416465ae5c6bcb558df3ea5cb5a6274c7438bed998d165cd62e776a95d159e3c137df8f939b7ecdf8751ef6de1774cfa445eb9a1800067a635f07f3bf5ff37ae7ed7bfe17d073c79de77ade7eba793cfdfc93847473f475f4f4699e94daa3a58409aa4304c043421824d0932a53424d58a6d4b0aa499a959070f68d7cbe0fbae9e6e9f4fa8e7e8c5d796f29e7d3d179e979b42142f3f37af2f178274fa9dbe37d03e9df95d933d414cc2b2339da730b9ad06aba215ce11cefc9759f333f36df4bd2f97face9cfab3f6aa3e6fabd3c71ae8e8e7e9d734ae6c82973a67ace6fcefcb7e81f39ac727d0f87ef3971f0fa7c77a795c7e9f24e3e6f4f2f4fa3bf4699e94ea6a3a81880d00000010314c54a749391080968498296889a424c97b96f9793c3f67d3cdd3e9f51169d3932eb31a9da5a0d11cfe4fa5e3e6f93e7e97abc9b7b81c5eafcfde77f63dff2fee31da26c83421885cdf62c76e6e7af3fc4f5bcfe5d78bcff007b0e9cbe53efbe1fafb72fd26bc1f6e2b2db3e5d16f8efd32c1684b5caa4d62cf9de8e599f31ecf97eab8e3cbdbcdaebe7727a1c99e3e074f374fafb74699e83a9a3a80002804342013100205020126a926848053531234409cbe96785793c5f77d1c7d7e9f554d2ba8294a8081359bc5e37b7e5c7c5fb7e761d71fa469e0fba7cefcd7dbfcf72eb9fd1fcd7d01ec6b86ecb4dd89b371b4f69e6e9e4e7ae16bb7cfbf2f1f5f9b78f07e77edf9bae30fa4e0f464d2539adae5ece5678b4b37c35a38bd4596d933f37eb793eb4e7186f8eba71f1f672ce3f37d3cbd3ebedd3a65a155175d4086206009391a40d0c91cc3258926484d342092609722b8ebc68cfb793c9e2fb3efe4ebf47aa9237a68254040830c7caf732af8cf3bedb9f78e6f633e9cccbccf678e6fc7eddb55eae8c3729a7d72345508a5cdd3873d79bdbcd7caf64bbb3967b16b39568a33d46ae662572df2d4ba7050fa64cf4867e67d4f2fd5cf39c76c77d38f93b3933c7e67a79ba7d7dba34cee9e99d9d72c12a90105297008a72e4a402480121cd22539853532a4d29dfc7e861af0fafe6f93c5f65d186fe8f58d0d0064498e74eb92d7b1e1aeb3699d70959a42d4335ace2c34b9dd5cbeb188b2a49cd327cfcf75a61bc5dcdf4c851bcca33e5aa987cea2de52e8d44d94c0dc22e53e63d5f2bd6c728c77c37d39397ab973c7e5fa79ba7d5dfa34cec77147592170201304d012c6828121a012684821452952696411bfabe6fb3cdeafcc7d5fca79bc5f65bf3efd3d6c9537531cf9d698650dedb65bd95b65a5c6823796e5ea538351e6f3c6832396fa6f9f5b9a42b1a539af97a72c6f2d311bebdb8f6df2de328ad2337ceddc688e87a803dc00b013d04d27cbfade4faf8e518ed8efa71f2f5f2638fcb74f374fafbf4699691551475081a084d3040213101a09a100134894d424e6525cd4d4d1dbeb78deb72bddf3fef783e6f17d969953dae4875cb9b4e654b0bd3bf5c6f59e8e8e3e967602e469d005465a638dc266777b63ab340a667333ceade752c4ed2b1b65aa58eee72362ccae8a4c101156456e534748438ccf9af5fc8f5b3c671db1df5e4e4ebe4c71f96e8e7e8f577e8d33b87716752684359324aa49884002a00a49cc022927304d22539684cb35f53c8eee37e87e7bdcf0bcbe2fada8d2fbe65f33a4f269c76e7bf1f6ea7a165ef0ba39f567aaf3d6c5456a4952b8f3eb873e8ef3bceef4cad8d618ce11be78d674396e96966774ee66996033400b007b2561946d1125842b9ce7e6bd7f23d6719c76c37d79793ab931c7e63a39fa3d5dfa2e2e1e99d9d4804322460868435401493409ac92a5a4cb412e469cb4e421f7727a3c6f7f91ea795e5f17d3d619dfa1d3966f5be7e5e8c2b3f438faf59ef92351573b67d3ebf27af78f41e3a6e524b379f9ba3979f5a78563a7469cfa33d0f377353330e5995eb1adc26cd10a32d0c44dccb4daaa6bbe583d255a899b982348c4f96f5bcaf5b1cf3c77c75d38f97af931c7e5fa39fa3d3dfa2e2c77171d53489681881cb04a9086b4139800042a52d0a69081086b377f4fcbf4b96bafc8f4bcbf2f8bd49cf7d7d0bd328bbdb37d7bcf16fd35ac8ba1a713ebcf597b67dbd326955a88b9cde3e0eff003b9f69d79b4e7dbab5c76ce745115539bad75cfaf7c9e83df392833cf65cae4f408b1f49433ac60500090b279d4627ccfade4faf8e79e3be1be9c7cbd7c9cf8fcb7473f47a3bf45e7a41a67674aa426900ac413548010a9cb0413026aa46849c820013cddbd5f2bd6e5ae8f17dcf13cbe3ebd719d7bfb35c3bb54d365d31852ceceb396ce859f3ef3ddd7e075759ec6de7779acb51c5e4fade573e9c3a611cfb7b1d5e7766377e7f57916f4fa5e5fbdd39efb2aebe663352554e2ca6b9d60d131f48da7a3028005159e2c6371c9e0fafe4faf786786f86faf2727572f2e3f2dd1cfd1e8efbdc5c3bcf4aea9a904d0310e5948004d00d09344ab904e449c92980e75cebbbd6f37d2e37a7e77e97e73cbe3ece7f478f7ee5e8f9ddbb7a043de673d113a4eaa7275f274c7274736bd67b3d7e5f59d66550737492f97cbedf1f3edc3661cbbf5e1a695a7a7c7dbd7cd6d3ebc5816a1912a8ca584000380b25d501a2cf49cdc6759e53e6fd6f23d7718e7df0d75e3e5eae4e7cbe5fa39fa3d1dba2e2c34cf43a5304829300040000024d09340891cb424d90ae45d9cbe872d75eaf5e7aeef99fa9f96f378bddc7d0cba7bb9340db579deb2ee4ad2b184de33e9eb33e973bcefb70b3d0391cbd158e90bcfede1e7d39393af8f1e8dbafcff42ceeebe5e9df9edc9bc5397a30040421912511050263a606845464a2a393e6fd7f23d771cf0df0d75e3e4ebe4e5cbe5fa39fa3d5dba2e2c2e343a073009d09a0004c013448ca954a145c881503909a98aefe2eee3aedbe7ae7af4bc1f4bcbe1e1fb0cf7ae9ecf233f479b5aca967b9a42ad4541a697c93acf4f2f263a74f461d67469c6e3d3e8f33ace8c34bcebcfe4f531c74f3bbb9fa17ab6c34b8d6f2d359ab8ab9b25d349146706e60e365991a3ceaac4511718465ae3c6fcffafe4fafbe19f3f473ebaf271f67272e3f2dd1cfd1eaefd179d8ee28ea968001a00000100200094d026891829b9a99a595757269cf5ddd1c1dbcf7d9e47b3e371f07daed8efd7d5cfc1dfe75d71439d5d74e7c753b4e0eaabc35cf79e5e9d7a69678f39d3b1b95d11a43d26a0cb4cf3be616737d5b716d67669c5a33d4f9dd9d0f0a4bc9c0d20ba8b1b290a2862410e315e74b0f9df5fc8f5af08e7e8e7d75e4e4eae4e7c7e5ba79ba3d5dfa2f3d02e2cea4281a2813801534011484d00910d0120a9a4ea46645c3c6b5ece1f4b1adfccf67c6f3f87eb7bbc3eeebe9ebe4ae7d6f1e4e89d38ebb37ae6bdf9c4666a6dc13c7a97e972fa94cc99d47107a5a70f465a66b19a9c1e4d6da60ce9ae40efae1d0eb5ced379c734e9be1b3b2f9753a36e6d53a8968e673ceb4593cb41399f9bf5fc8f59c630db0bd79393af939f1f95e9e6e9f5f7df4cf40b867502c982d013c842d291200a1a414a4192e9268113402875159bd1e9f99d78be9f8bdfe779bc3ee76f9de8f6f56ef4e8def8d76f3698e3b44bc78f7671c5876f2572b3b7537a7cdb9a5c6113d1c9d2746fc951be524d6669d1358df7e87967aa1e66be852706bdad38f0f4f03cd8efcce7d9d95acda6af222b1a25ce9dc3ba999f9af5bc8f533ca71db0d74e4e5eae5e7c7e57a39fa3d7dfa34cee18aaba1322692aa4880000042201a042a680954aa41020a7ae7d98ab6a51af0f771f9bc3eb77e5bfa3d7e874f9bd3ad74453d2236cf379b3e9ca3838bd2e638bb9d6a61ccaa9f2f46069a65a45dc6cab47b4afa63a25d6e48d1e77734d3400559eb15846f262ec25a981499b559ef57a2a08d33c67e63d3f2fd3cf39c76c75be5e4ebe5c71f94e8e7e8f4f7e8d33b1dc51d09cd39644b600104304c98a11490a9a684354801268bf53cef73233e8c43cceff3bcde1f64e3bf47afbfb3c9ead6fd9bf377ae93066992ca2b34ea793a78132e8cb4233df35cb45a1a6f9ea6bb4ed9ab5933ad1e01bd72dd9d55cd7aceef166b19c9a4c49533054a3228d315f446b6b0108a8c4f98f4bccf4e729cb6cb7d39793af971c7e4fa39ba3d1dfa34cb41d4557421452140e2e930091438a0405098099500a98804115ecf8bd587b3c5d9cd5cfcbd9c9e7f0f65e77e8f5efd3c9777df5c0ebb1728751cfa46bb67a567c1d5c49578e85e6f28bbc6ce8d39745efd79375dd66b36a5665ebc769db7cfa59bbcea9c5660a1172105abc9ed1b4b4c25113824a719f9cf538bd2e9cf2c7ab9f7be3e4ebe5e7c7e47a39fa3d1df7b8b1d451b8801a806800a10400026aa1b4396080a4aa2813cafd2e2f639deae4f478b538f8bbf8b8787a2f8893bdf00be8d79a57a8fca4bebe9e209f418f8a1e9c79ccf474f283d39f38af45f9a47a7a7901efeff0034e5fa63e683e932f011ed3f103e8b6f9867d5dfc8b3ebf3f9467d3af980faabf9271f5d7f2047d9d7c50bf6e7c411f6cbe25e6fd9dfc57a5abe9f4f2767abbc1a735d795cbd5c9c397c8f4f3747a7b6f716300000050d086903100229a10d0a9a10d08abcecd76c77cb4d21ccd4a9cf3a79b937d79b5defa74e5d17a6b9ddbd0b10d96616a55866e154928d086222af3a5db4c745db4c6e357992e8668d2b166f58559bd6149a99b2a52a6891894503874aa5a6aa130b672d70c4e6e4e9e4e7c7e53a39ba3d7df7d33b18000402001026800a0100009aa100801d4dc6bbe3be5a50d22348c7191298d6f1abadaf0abadab9d9bbc03a1f3b373155ac6725998964234330d5e4e5df4e6b3a6f9a97a1f3b8d9628d9f3b3a6b968ebae4a4eb7ca5749cc97aa7983af3c5c9d4f99af557254753e572f49cea37cf1cb3239b4e7c73f99e8e7e8f6fa76d33b18000409a004341400200400014934000f4cf48df7c3a32d5aa4cf3d72c71cd54e39372e4aa87544b5a2594e19491424862118856206e59759b975acd9a3cdc5128a242ab3a34acaab5202c816c823479d33a38716f372e840590b2acde719e1b629fffc4002f100002020102050402020300030101000000010211031012041320313221303340223405504142601423442435ffda00080101000105024848a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a2b5a2b4a28a28a28a28a28a28af66b4a2beaa4245145145145145145145145145145145145145145145145145145145145145145145145145145145145145145145145145695a514514514514514515eda1091451451451451451451451451451451451457551451457457f68842ff009a4217fcd210b58e3de720e41c8390720e41c8390720e41c8390720e41c83908e41c83908e41c847211c8392724e49c9394724e49ca394728e51ca3947291ca394728e59ca39472ce59cb396728e51ca394728e51cb39672ce59cb39672ce59b0d86c361b0d86c361b0d86c369b4d86c369b0da6d146974a10b5c5e3ff0021fe9d2888b5c5dbfe43fd3a5085ae2edff21fe9d2842d7176ff0090ff004e94216b8bc7fe43fd3a5085ae1f1ff90ff4e94445ae2edff21fe9d2842d717fc8af0e94216b87b7f7a97d3ff5e94216b87c7fbc4761fd2ff5e94216b87c7fbc8a25eced638fb2bc7a5085ae1f1feed2d1f5a5670dc2b9b8f01e9c4f09b54e34faff00d7a5085ae1f1feed225a21f4f05837bc18541519a0a50e3f06d975af1e94216b87c7fb15ecc7bb1e887d18a3be5c0e1db12f4e3716e8e686d9f547c5f4a10b5c3e3fd8af6604ba1f47038ee585546f59ab5fc8e0a1f543b3e94216b87c7fb15ecc57a4f45d315ebc043d176e8e331ee8668ed9f4c07d2842d70f8ff7313fc4b444ba3878dcf85854574e4571fe461593a71921f4210b5c3e3fd4d7d0c689f662d25d1c063f582a5d2cfe4f10fa7192e94216b87c7fa246c1ae9a18bdec6bd320c8e8f5c6ae5c163a5d7fc847f0c9e5d18890fa1085ae1f1fe8b86c0e6e1c22db9b83466c5b5eb132217446366c46c1ad540da8942b487692b36236227e9aa383c772c2a92ebe315c332fcfa30931f4210b5c3dbfa1c38b7cb86c2a1124b71c6e064953d22fd7baaf51e90ec291dd11449de9090d7e489bad224dfae9056f83c542175e75f8f191ac9d183bcc974210b5c3dbfa04705eb28f62ce25fe39ab76b8dd938e8f4878bd318fbbf1d23ddad32778e92efa7090b7863485d4c9faafe4a1f97470fde64ba1085ae1edfd0638dbe0f0ed4deb921ba1c563709eb174774c7a47c5e98c9793f1d23df49f781665d22ace0f111421753d3f9488fa386f298c7aa10b5c3dbfa0e0716e6bd13d169fc963f46b44ac68c7da489691f1d3c6227e8f48210c9a123fce611c2e3b961852d17b1fc9afc5f7d786f29921ea888b5c3dbefe38ee97078f6425a2d78f7f8cb480d1074cc8b48bf4f42d1277aa3d0948c648bd1b464766185be1b1525aaf63f918fe12efaf0be53243d51116b87b7dfe062b72c9139911c90a48df137c4e336ca135ea4749a3193435ad15d0ca21da47f9ff0012ef4709020e296e89ba26f89cc89cc89cc89cc89cc89cc89cc89cc89c538cb1e75f9d32994ce157e73243d51116b87b7dd5a471e4ae56539598e5e539594e56539594e5e527094745a537a7ae9e87a1e87a168f42d1e9a2451b4a66d1639339590e5e439794e5e539594e56539594e56539594e56539594e56539594e5e527e8f744dd12e02a264ba1085ae0edf751861be7861b614514515af1b04e3354c832249115e9957b14638590c5e9ca3927285848428ae85a514568b5978ff0027f2ebc3fc5325d0842d7076fb2fa176e02162f63895f8e6f2111d226581255d091b0e5b218cc3888c0d86c361b4a28a28aeaae8976fe4fe5d785f0c8898f54216b83b7dd47010ac7adf4ca36b8cc14c485111188e24f17af28e51ca316164701ff8e2c042142fa73f1fe417fed6b5e0fc72226896a842d7076fbb13855ffa8632c4c5d1961b965c1528622387d3902c42c63c4896139272486348ad2beabedc6e2fcb2aa25a705db2226892d5085ae0edf76270ff0010c96884fa6504c58c4ba5eabecf150dd1e29549e9c01344d1243d1085ae0edf76270ff10c68a284bdd658baefe9356bf90e189aa67f1c4d191134486210b5c1dbeea307c431fd07a217431e8baacb2fdae221ba1c663db33f8cef32689a25a210b5c1dbeea307c631962f7a5a2174b191d6c721cce61cc378a427ec4fc78ff36bd7f8cef22689a2486210b5c1dbef60f8c64b48bf6dead15d0ba2485aca44f28f29cc66f673191ca42645df5cfb71b0f5c8a8fe37ce44c9a268684216b83b7dc5dffce0f8f4969117431c8790794594532fd85d4d939d197293c84656638d8b0592c272c818fae471503340fe3be46491344d0d0888b5c1e3f723de7e93c1f1e92242645f448c933265a279fd571063ce4729198bdc9b32e426fd723a3065fcb86b23d9a1c112898fad99216b88c4705e99d922689a1a1085ae0f1fb9c2c2e59fe6c1f168c68da63e8c8653315638321b918f290ca6398bda919a46476e8e261f8f0de997859216b331fb39a1670eab8b192248684216b83c7ee707df89f9f07c7d15d390ceccd928c1f98b032583d3245c250c861c86297b53ed94d86c32c2d66c6e12e1f8868e1733645de9221eccbb43f7864890c4445ae0f1fb9c33a79fd7360f8fd9c867388f2fe3eaa14d4a09ae2f0928b8be1d985fa47d864c7df6fa388d19b15a9e26a7c1dd4358f6f6191fdf19224311116bc3f8fdc83a72772e1dff00ebf6666547150f5c1269f0b374a4710accb8cc6a9e121ec33268bb389280e23c2af0e3a16885a32fa991fdf19224311116b83c7eda121f7e1be3f6648cb13363b2385a970d169449ab3240da63f421ec327a41e8d0e072c51a28a16afad8bf7f491218888b5e1fc7ede34512f2e1fe3f6a504c9e0160230a1219289cb1448fb3224880bd86cbf618bf7f491218888b5e1fc7ede3d27e783e2ebb13eba36946df69bd175dfb6fb47f7f491218888b5e1fc7ed47bc4c50dc67559b07c5d4d97ea84c5f458d8842e9bf71f68fefe9224311116b83c7ed6331c4c31a8f13fb187e3e86c6c6c45085ec3f658c42627a58d97aaf69f68fef8c91218888b5e1fc7ed63462441fa713fb187e3d5b1c86cb23a2f65eabadea9965f42f6e5da3fbe3244862222d787f1fb58c80999fe7c5f1e8d9290d96223a262f61eaba6cbd1eab5a2bdc911fdf19224311116bc3f8fda818c81c47cf8fe3d1922436458b4447ad8fa16afa6b45efd8c8fefe922431085ae0f1fb5166397a62edc4fcf0f0d19326c6cc62d1098baa43e85abe8451457d18fefe922431085af0fe3f6e0cc2ce27e7c7e1a49926647a6242d511ea9f4ae8ad57bf451450c8fef8c91218842d7078fda46320ccff002e37f86e370c98f4c658d9b85221213e998fa175afa6fb47f7f491218842d7078fd17eca31a1232fc917f8391b8b27a220225a222262917acc6cb16885a597aae9b3717ee3ed1fdfd24486210b5c1e3f6a263ed665f3ddf888b194511d1942424242425ae41e8842d1f42174d1b4af71f687ef8c91218842d7078fda443b193c9086f444514289b4da6d288915d0cc848b22c5ab6596455897d47da1fbe324486217460f1fb5131f6a32f9aecb48c4512a8b148dc6e371626291b85a3329364a442642458d993211c96f1fa915f51b2c87ef8c91218888b5c1dba17d6898fb2337c9fe2c8322218d15a2d26e8dec84c80b5c88c91251628b318992322f5c18cc51fa8c7a43f7c64890c4445ae0f1fb28c51b31c0da67f976fe2d11f431bd5eb1d27a6331965963271b258871d2f4940c3123f51eb0fdf19224311116bc3f8fd989888cc4711f37fa328c7a5f42193198ec8591e8a2489122c8bd202facfb43ff00e80c91218888b5e1fc7ece3428914411c47ce97e1b4da2eb6558b10b1a1444ba65da64c6419131fd797687ef8c91218888b5e1fc7ec23188890edc4fec417e125a597ad9b8dc21174730e68b29cc378a5a489922440810faec87ef8c91218842d7078fd4ae889022cde62c8713f3e2f8a687a22cbe9dc3993c8731906290a44645e928928928091022597f518c87ef8c91218842d787f1fb10222d31f7cff362f89a250287d563744a7a420245899162627a344914405a2ebb2cdc5965fb0c643f7c64890c4216b83c7ec2232148891467f9b0fc648c8c722c4597ac8a31c0a252a17a89115d2c622c4cb2f4b2f4b2fde643f7c6489121085ae0f1fb28440819fe6c3f1133221c4ad24c444b3b9181e894f209ee715a2e9648b13116265965963e85edb23fbe324486210b5c1e3f6e02919be4c393f04c91324f4628d8a06dd6e8c990ee618fa6966e22f5b265899659b8dc6e371b8dc6e371b8b2c4c4fd8ff11fdf19224484216b83c7ed2312b140cabff662f1522c90d1b058c8c07e8391659927a618d9d96ed1c8b20cb2c6c93d1745f4bd13108447a1b2cbd3fc47f7c6489121085ae0f1fb284637e8a466f921e3028da6c36e8d9218c93d22acc6a9499125e85fac48963637aa89b4da6d361b451144d8389b4a10842168fa223ed1fdf1922631085ae0f1f6efde4222c4cc9e78dfa41911218c651b4712489698e3a77689c8422cb2f4a231140da6d361b0da6d2b468a369450b5b2f5484485fbfa4890c4216b87b7d98884227e58d3ac6404328da388e2344d124461ea9137a33fcae9485122bda6514515d6b567ff0070c91218842d7076fb3189b4a113f3878a64642917a58d8c64894484497a137ea8968b45a2424217d4485ab3ff00bb491218842d7078fd8898a26d369465f38cbf1dc464424291b8be863d3231692d511d23aa2cb2cb2cbd6cbf66285d123ffbb46486210b5c1e3eddeafdac7df12f46cdc6f26ee49fa589901313371b8721c8bd192efa3d508447a6cb2cb2cb2cb2cb2fa90ba65dbffbb46486210b5c3e3f613a387c9b948968fbaec222cb379b8dc5962d243d174a626459659658d9627ef2ea7d97ef68c90c4216b87c7ec231fa35eaa4b49775d8459b8bd6c4446c9c8bf61111697a3658a427d2fa968ba98b14ff00f33648d9225e8486210b5c3e3f622628897a4f49775d8b2fa933750e437d0fa2c4c8b132cb2c6f4b14852371658fa91659b8dc8dc596880b37ff00a1cd929b4e7f96290c4216b87c7eabd608c3036991144fb9ea7a96cb65b2d96cb66e91722e45b2d9722e45c8b91722e45c8fc8b91ba66e99ba66e99ba65ccb9172374cdd337643764376537653765376437653765376637e637e637663766376637e639994e13889231c21ccda8f4324a318486210bed21696cdccb65ea842fa6bee5228a19218842fb2842f6532cb2cb2cb2fdd5d565965965965f43ee21e9fe74af55d0c91218842fb2842f6acb2cb2cb2cb2cbf6acb2cb2cb2cb2cb2cb2cb2cba6dda6fd770a437a5fe57eb765add16262922c6fd2722431085f65085d0fd8b2cb2cb2cb2fdab2cb2cb2cb2cb2cb2cb2cb2cb2cb2f4b2cb2cb2cb2cb2c6c9318842fb2842d58fee5965965eb65965965965965f4d9659659658d8c6217da4216aff00ba633fffc40029110002010205050100030101010000000000010211310310121320041430324021225051704160ffda0008010301013f01ff00e7ebc2a54aff004ef9d3fa77fd7317f5ac5ff177c69ff0f9e26837c52d44b1682c62a3c62189abfa7c736d6920e9f8614757eb3163f951cff89871497e916bff003fa7c737169211ad59852d3f8cc5926a838ff120d38fe91fc9fe09785b2a57e27248dc89b9137226e44dc89b9137626ec49b8c8a408ce089e8645411ae04b4321a10b1626ec4dd89bb137626e44dc89bb13762375b655f8ba923d3d51db1db1db1db1db1db1db1db1db1db1db1da9da1da1da9da9da9db1db1db1db1db1db12e9e88c15fc4686be2ea2e42de0a654299d73af39d8c0f518fe2ea2e42df44ec607a8c97c58f7216f13e7428538e258e9fd464be2ea2e42c2e6b37c544a2c9ae3896303d464b8d4a95f054ae5d45c8588f0450a21ae69151cc522a32b9cec607a8c97c5d45c85b2af0a9ab9ac98c4578cac607a8c97c5d45d10b7262627c964f8d0a652b181ea325f17517442dc9e4b92e14e15ca56303d464be2ea2e885b3a141f8282f14ac607a8c97c5d45d10b1412cdf048a0d668a0d14e72b183ea325f17517461db8be0b27cebca56307d464be2ea2e8c3f5cdf28e4f83657c12b183618fe2ea2e8c3f5cdf1447268a1418fc2ec607a8c97c28ea7d910f5c9b2a546f8472650a12657c2ec60fa8c7f0a3a9f6461d87e04c8b28509ba0df8a56306c31fc28ea6e887a8f83e3079326fc6ec60d863f8ba9ba2161f07c60c5224c7e3958c1b0c7f02cba8b907f83f0a2a547e3958c1b0c7f02cba8b91b78d79656306c31fc0b2ea2e42de35c29e1958c1b0c7f17517216f354af8676307d463f8ba8b90b7d12b183618fe2ea2e42de35957c72b183ea31fc5d45c85bc6bcb2b183618fe2ea13163491dc33b86771237e46fc8df91bf237e46fc8df91bf2ff0df91bf237e46fcbfc37a5fe1bf237e46fc8df97f877123b86770c8e355d190b7ee52f818f24b2a142997e73fc3f0fce3428532a64c7f03195148d46a351a8d46a351a8d46a351a8d46a351a8d46a351a8d46a351a8d46a1bf8192caa54a952a54a95cebc6a578d4a952a54ae5fffc4002411000201030500030101010000000000000001110203101213203140213050227032ffda0008010201013f01ff000c5f9cbf397e72ff005a7f9ac7ef5c6aaf49ba2725571215d24774a6b9c3fc5bbd9a5414b2da9ecb94fc0eafe4a295026b0dfe2ddecd4a0a114382e55f069fe4a2a9502f8a86fe96c927e98fa5b835a35a35a35a35a35a3711b88a9d3511489d28ab4b12a4d548f48b4a1d48d48d4855235235235235235a1b9fae7e9bc2b326c9b26c9b26c9b06c1b06c1b06c9b46d9b66d9a0d06815b36cda364d91da2df587e2bdd8bae3249a8d46a351a8d588208230b0b2fa2de1fdeb37bb1743279ea2482308820834918597d147587e2bdd8ba1f3ab08a463287c2491f07d1461f8af7653d0f8ce2acd2c92a10993ca4927e0a49e0fefbbd94f43fa20820440d0b1a46b0910358929eb8b17dacb9d8bae0f10470812122bc5222ac218f0ca3af1b2ef652fe383c21e510258af1492362c5551a84328ebc6cbbd94759918b8d3992ac2cc8ea1b92045451d78ea2e7653d0d92492262c4152c2648ea1d448b0d8de630ca7c6cb86a249ca24d46a2aab126a1b2491563af82c40ca30fc2cbbc111c5e5f28232892a28eb0fc35170595c230f846608c40a9349a70cb7d61f86b2e0b29652c3e6911942e15147587e1a8b82c2ca12c318f82a4548d1040a91659516fa18fc3517042165658c6b2909618d0911c19516bfe463f03197042c3c53c18c78a784726545ae863f054f17042cc14f06323085c63832a2d7431f82ac5c12c22042e2f94e278d4c65ae863f03c5c17585e4918cb5d0c7f7b18cb853d719f0bc3e8b7d0c7e064174a7a208e0bc4cb7d0c7e078bdd94af8e11e4aba2df431f8517bb29ebd1532df431f8517bb175e775125a5f031fdec9117a45759bacdd66eb3759bacdd66eb3759bacdd66f33799bacdc66eb3719bb51bacdda8dda8dd66e335b2dd5f3f2533031fe4c1197e2789249249249249249249249249249351a89351a8d46a357898fc13f6ff00ffc4002f100000030605030305010101000000000000010203303140507211323381924160911021711220224261805170ffda0008010100063f02ff0068a8cd6d0bdce0a1a8d790d46bc86ab5e4355af21aad790d56bc86ab5e4351b721a8d790d46dc86a36e4351af21a8d790d46bc86a35e4351af21a8db90d46dc86a35e4351b721a8d790d46bc86a35e4351af21a8d790d46bc86a35e4351af219daf219da7219da7219da7219da721a8d390d469c86a34e4351a7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7219da7919da7919da7219da7919da7219d7e4675f919d7e4675f919d7e4675f919d7e4675f919d7e4675f91997e4665f919d7e4665f91997e4665f919d7e4665f91997e4665f91997e4638a8f776ab8fb71571f689bb55c7da26ed571f689bb55c7da27f2ed571f689fcbb55c7da26ed50cdda26ed571f689bb55c7da26ed571f689bb55c7d8f0f4c1c1bb55c7d906312706ed571f6297d860ca49571f6519fde6ed571f6518329155c7db8ab8fb2f19155c7d86532ab8ebbecf8c1c82ae3a362ff1f5c0e50e41571f6e2ae3a163f61d59571d071fbb1aaaae3ac7b511571d03131111112112112111198c444844844844844444444444444441c82ae3a07b118ea3a8818818818818818fc8a4e1e9010103103103103105082841420620a1031031031031031f90e83a0e80b076ab8e805514bb55c73f8d492ed571d2712a413b55c73e9a925daaf39e209a925daef39e209a799faa7776bbce7d3f1503f44bb5de73e9a927776ab8e7d3524eeed571cfa6a49dddaae39d2f44d48b776ab8e78c26864ff0f976ab8e78c2685890c1f9eeed571cf184d0fd9f9eeed571cfa6a47bbb55c73e5523dddaae39f4d48f776ab8e7d3523dddaaf39ec026a47bbb55e73c613f1523dddaaf39e309f8a91eeed571cf184d48f776ab8e78c26a5e5daae39e309f8a91eeed571cf184d48f776ab8e78c1548f776ab8e78c1548f776ab8e78c1548f776ab8fb44f776ab8e78ea67bbb55c73c7533dddaae39e305523dddaae39e305523dddaae39e502a91eeed571cf281548f776ab8e78c26a47bbb55c73c613523dddaaf39e309a91eeed579cf184d48f776abce78c26a47bbb55e73c60aa47bbb55e73c60aa47bbb55e73c60aa47bbb55c73c7533dddaae39f2a91eeed571cf9548f776ab8e78ea67bbb55c735855cf776ab8e6bdaaff57d27808080f770ab8fb470c3f1fa710afe0e831f670ab8e8f1117dd4751d4751d4751d7d7a8ea3f61fb0ea3a8898898fd87ec3f61fb08a845422a1150ea3e96b8e1ff463f574c30198661f4a7de85111311ffc1a223f6188fb7ac7edfef666c08b121ed802878f42f43112fe83f48908fb0d863fc1fc07effe17ffc4002b10000202010304020300020301010000000001101120213031415161f071a14091c181b150e1f1d160ffda0008010100013f21805ff10000000000145495bc000a28a28a28a2a15251451451451451456145145145482fff0003ff00ff00ff00a000000000a856e80051451451451451420b02fc8000000a28a28ac8145150a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a28a8ac2a68a28a28a28a28adca2b7a8adeadcac28aff8ccff00fc2e516b45aaa1229eff00e14f7ff0a7aff853d7fc29ebfe14f5ff000a7aff0087abfea53dff00c3d5ff0053d5ff0053d7ff00529eff00e14f7ff0a7bff87a7ffe14f6ff000a7b7f87b7ff00e14f6ff0f4ff00fc8153d1fc2be9fe0d7d1fc2be8fe0d3d1fc2be8fe14250cd70ddd5515610a98644ca6593222280a0280a0280a01aec45589c337f8777766666e83b881899969fe5365947b0eff0084f370f2783fc165152e5e4f172f15cbe7662dadde15b4e1cb2b26b69fe13c9eeafb3672fc7d3870ff00e1595baf1ff66ce51eefbfe435b8ff0006bf1eb1ff0066ce51ecfbfe23c18e5ec3c5ecac1edd159d0f3ff436728f47df2adf72c72f65a87b6b07b8c7f8e228f77de166b71e0e5ed31adb5b9450d4b456eafb36728b35d1b7056759d64ff0a8a2b62b27b143450f69e3f616ce51ebfb8bf05cbc18f37b2f66f07c159583552f0ace8a28a17dcb6728f4fdc5f82f2631ed3c1edd6d25b380dacb9a2868ad95f72d9ca3d3f717e13970e58f65e4cac964f1a10da450e1ca4583172343cfed0f6328f4fdff0015e4f262c58a197b294b1e25d21ed8863c18da098da3e487b3418e61ac5962fb87b1947a7eff0084e5ac1c3db783d858b43948d01a132d6b6858a4701215a8e7a341a1e347da1ec651e9fbfe05e2f27f9878258d087d73e950a628506c4998e063c793e60f3ca3d3f7df78218e5c3df7f8070ba8fa0f91096872946a94578e1659a2c251cb2fb5179e51ecfbeebc2b072e1ee3c1e4d1589c38a2a0d083e0eb3621a566959eb08efb3f38b1479e51ecfbfe4387b8e5e0f159384b63d0b6a21325511c2588b146a4563d5b2651eefbecd6d3c5c3d94387910d456cb28b1dcd5d4a394a45b668a94296706a439d85c5798bcf28f65dff000dcbc1cb451582099ae07ac780b4e0f0ac5cd44e12b394d32842428a2868a2c61298639eb160f2ca3d9f7fc472e1e7d46246b05a1cd149d0c761acd1b839521e41f631aa123a8c5dd1da97075120bbec480b24289d4e960e755031cf36245e5947baefb487b0c72f6b92a5085dcb2a50bb6868135062e8121256ddb18a36b52a561bf08b3b02d14a4522db6334873957a2b216945091450d0cb1e0cf0e6120f2ea3dd77d97b4e1e2f6094686852cd05afd8b98a1c52d4eb623938e151e88f51cd8d312d06296caa42428ad2a842094b92da50cc7c8e790583cb28f75df6aa1ec3ceb0a28a3453b2281312b2b03158dc517a3439cdc9c71878470ba45d0672894c682d54faaad14605963658c3e0e6390e790414428ac328f5fde6b0a28a9ad868acee51d4a565a09425d20a696c8511787263dc15a723e5895b83965d415a71af6cd4e16bd0621f03a04b29ad084c2c4ca6351ad398638e710410a2b08a3d377122b61cd6cb1e3528ae42536b5390f9828d409ac732f469472a3a10b51669909d0c9f233a143859c85af5285392de838a8b41294282c5a1a1edd8b4e3e471ca2092ac228f7fdf7a8793d9a28a2145524fd8d9d036ffb1ff6e3ff0068f13f6230d214314c5d45a94bb435f25ea0a28b763e053ec531588cb5f0698a82414276f812a9a8fe803ff68ffda17fd80bb0fd9e27ecf13f6789fb3c5fd9e2fecf17f6789fb35c10d4f487da3c47898c5a97b426c1147bfefbef163d94d0a1cb543c27c1975557f9417c8e864288934ca61aae6162c5c0b816153195a22fd8b0d2e0b8e11c495a6ecd36444ecaeef5a345c44fc8fba3ca3cc2e4d5f50b1796509eff005285150b6a868a1cd60f0e23d0ba0b428af62a54f894ec52ec52ec39e83182bb3b832350b852c6b2a1587b1da9f13e07c4d7e052f053b0d4242142429d869d87f10a5d8a422b0b41cebf4e82c5e5947afefb143da72f251515ed0718628a9737a390484d4712b42ea588b450d145a2717606dad0e3d05a450a14178e52a8534124871ce36a1cea57bc409258651ebfbcd66d66f1a1c3c782281c31b104e1a284310f6ab41269d38dfd85636cb5705e2cba0d8b0c3e0bd702f128e8210428ace8ad8a3987b6d0729d5efd241351e3947afef0b27178b8714352e1e3c1157c52790d2c5bf42c741b6ad0ae8178147413d50e7415d8a7612763a60aa542b04567451592db17dc58e50b7f13c086b1ca3d6f7c68ac2a1ecb870f1e63ea4b9431a05c387baa128a514560ad92143dfb47d4739392e9f1735ac20f0ca3dcf7ddac9c328a1a18f1be8641a05b2cb86a10610a18cb104c5f80ba043a1168a397c7fd301931651ee7bcd62f17b6e1a28a8e6be72816db19d2298f050c4104e861617804f650e2843ea7d07fe849a41ac328f53df7e8ac1cb87851c97c9f5a4fa41b698c7c8849b098a1a10e4308b1c05a1c0921bb63985d7093f57fa0b85498651ebfb8b698a5e2c70e1a950b95f27d6c0ebb459706b511645284f51b139c37a0b5cb15d19e62c85220b8a19f317b32d1f47fd041338b28f5fdc50f69e0f172c78554a7d68707c9c8e028630842d7512ba9e42f15cd1cb450d15ae26245054e4d4e4f29779126815a2c9965c9c71b85b45a99afc0949f1fe82e9b14d10f83dbf7dd783c5c31e1ac9344fad0c5d062b65ca58f505a1a35793cc5e8531af0a284b165113db15cbaa2b50b410d6a8ec04f6c2d1451505b8a6f41687ad209987947b7ef0f6de0e1cb8631cf362d2bc9f5278968f5094b5c4fc8cf51b9e9ceb47773cc5e35acd431a91a109ace811a1b2aea43a6b48684d05cd8d1aa3e19fc0c5172ac8e87b7ef159b2cb1e0f618f1fed1f5a58d41296314a65a16fa21ce83d7088798e22d45e4a1c5ab41eb15215e4296da8856a25238e1658e589a85af4703820a2e111d0f6fde2f370e1963970e58c70c51ed63c9f5a5958b8f0628ad6e8edc504e43488f88da0b1527a4258f1456aa621c687152263e858f5164d965970ce27b1e312bae111d0f4fdf75ed31c31887586b259f10b618a2299ac62c2b29b52e502f7c0f37d11c0e9b0e22e45b37c0b631c21a50c534430c5884219d67d0ff004c4f3c228f6fdf370f072f618c709652a0faa29b1e37a1da8c568be2120b14a25af889f485996d1c334ca12c494b16184121b1a28484219c4f63c43979e1147a7ef1793c9c37a09cdc3658c6314a4095f145ecf2a85be114be2729a0e6262b16942c9c3544698d1454a43758aa12c389ec78872f3c228f5fdf3b1e165978b2a1c395c8a5095fe47d4cd8f540a68a950a8d04a8593637152622121228ac0d8d096cde878872f3ca7adefb6e5e1658d8c6cbc12c2d218c5c791f4326e364d0362a5b1b1314d9631e261a0a18d8c58a122845657a9e21cbcf29ef7be0d972cb2c6f698e1c33532e2d4fbb8e5e066a62099138706c4c4cb1c3659c0e780931c8b7816cdf4bfd313cf09d23d6f79bc5eeb9b2e35ca284e93eec659659a533cc6427059b630d898c296cb2c584e241b0e358216d1f4bfd313cf29e9fbec3d979b84748fa21a6bf90fad17032878cb5b38099adb1630c4309cb6383a0850a552242132cb2e529e07d2ff4c4f3ca7a7ee3fc172e5c21f543682589fb4fac3658f254cd61f4458e30b33450a4c618a2ae0b98228a28a28a28a8b2c4cb186d0e5f5c43979e399eff00bc3dab2f0b1cb973451a0350fb318c4c71a1b58d671c134d150d4308429312508308a096cd0d17a965c33d8f10e5e586433d7f7fc0b9783c11a48d047d91ff00543d2574665d0a10ea4a5c58850d0c686285816cd14343c21343d8f1b2790cf6fdf75e2c7c43c5c3a0a521ec9abe31b8d871a8d625a9a442b8eb4378a59cce4213131852c72456372b1a1cf31ec7818f3790cf6fdf65ec56072cb85345448495f189107a051a123c27c877656cd285e1196131861b1c1675144a58e6262164ca8e63d8f031e6f219edfbc32e74cdca1c387833ac841b585fa02b6e2c6a1945751706acc4450e0fa97844c61b2c4e2a54b430a148484b619cc7a1e313cf0ca3dbf710e6cacd972f070e7a9d316a739c54cb6e28a1a0812151a8ea24ca120da8f542f622e620c158b650b27163ea3d8f12e11e73a147b7ee3b35c2deebc5cf40aa4dc43095ac0ed06a45455157c8aa12622866a4921594f51c0bd45225832f159b1c4c7b1e25c23cf08a3dff007965b837b2f0ac2e51ce3d6a3749ccb85b1058b942d8d0d0ae1acb36a6cb86c4419a56b07163d8b1d94890b065151456c3928f43c4b8479e110cf6fde2f0d0acd8863965c39e624688aa85a1fac56e0d310e5420d151c59682593589482962d0479458515a099d15b6c41a1aa47a1e317cf08867afef0f1a7b4e5c3962ea6889ad1f6cafd02bb130b45e92a1216282bbe20a11612624543445a349ca042eeecb2e160ca147a1e07b0f10cf5fdf0add65c3c5725c548d6348fbc5df08f5ea2412509091746a195dc8a741021094a8b9383d48416e5145142c1c721ea781ec3c433d7f7df70e5e0ce62702e825383ec1faf35862a08a659a46a3b0cec512a0e8c6354568d858fa1ca6e51e4265fe131c7167a9e365f28f7fde5ef328ac0e391c8d13432cd0fb627e889595231650908d0798a1e8cb98dc46bd62b4a0a9c5b58216216e29638368cf53c6cbe51ebfb8cbdcb2e1c5e163938c683aedee7d42f513a9a0b1150f4458a439bd0d5b1bcb291c078e81eaa0d21ea34450821459658c30f04b852c72fb9e317cf0ca3def71fe0bcf4b927b358fb07d29d135ca952ee6c75d8a884060c856884218ba09a8d42848a17042c618b842454214d8c70f53c62f961947bdefb9793c5c28e91f487dd3ea49cd0d10ba859b380c3b1dd10abe071d628a143630fac86f22c0ca062cb2c6132e14b1b1b8e07b9e366f28f73dff0006f171450b413d4e25635b8d2bc164190aa1b39465d14452290d10e922c5362a84c5451b46cb186908a5104148f90e050a8b708b2c6cb963dcf1b65bdef7dc72f1bc2cb8e6521455f29a3e31d4362e35978108749845ba23565ab62077140a49ec28984d970ecb17030d0e4270dc8416a31ee781ec3651ef7bc56fd8f0bc1a150d082ffa6086b128d10f41c5988681d432d092af412dea3d0761c0614c9896a591b89c4c20d3c23f03c63f02c2b82418b8b84241ea781ec0e50feaf58bc6cb1c58e5785979728d11b587e8a24b810e620cb8158ba0d6b17086c1a91741c58642f62915ec54a0904a242835132e1412131c951a1c0f63c0d8f37947bfef0c4597f8a82606a5f8128693594ec2bb64262b4292a17236837702158945d1562585152d0830e450c6cb2c42cf117b3c6c9e51ebfbed363c1bc5e2b92e2e5932e2eb2bfe210a7d584c78014b0a06a1684d23504e294151ce29962626278318c72d9638eb1250a388bd9e21e6f28f4fdc72c58b4545ee25b1cc61ea1511a5cfd117b190e960318821c23a66a625a0850c5104209090d8041408b1862c6c6cb1b2cb140b8703d1f10f67ef47de1cacaca8a9c317b0e2a2f0341a28932820e198d85570a6b3a1c0d61084878c29b95041041c0e43636588484145165c0bd1e36eef67dcb8bc996370b486af658cd48d41c8b436a339ce214e5138ef0e674388fa9706c6e1600281cc280989898e1b1b2cb8424242e82583630f53c6cfca3d9f7c19627b572f3234b17d535868e53884c6d05496cb1068a0450f51621b1884c4c71862e17853484c4cb1b186cb95048e32e19c0beeabaff83c93c915b5234f63decfb8f2bcd97165e0deb3c8b9a281cd8e17d02705045962702a8bdf230b1163165978213dcaf729dc69158a8570a412941945a134268545048252b134ee547dc29565bfd06ee8474a5aba94fd74b5455ed6d2d35b1ef45dc762cacbc5958562439b1d5626ae0d5184d46a58b8be5679d9e7679d9e71e41e667919f29f29f21f39f31e467c87c87c85f733cecf20f38f38f38b64179d9e6679c798f9c798798f9a3a89f38f30f20f260899510ec6a36a82fcebaedc21b535d7cf055af9d55d969acf6fd6fb96597e4bf25965965bee5f92fc96fbb2fc965bee5bee5bee58a0821771fb3ff587de7ecb7765ea270a7829d90abb2fd16bb2fd16bb2fd16bb2fd1a765fa34ecbf469d97e875d90ebb21d0f2428217c0abb234ec8d3b234ec8d3b234ecbf469d97e855d90abb21576469d91a76469d91a78342cb2cb2e108452ec78914ec34ec691ff00329601431c262627020b242c6c6c6c6cb2f0b13184c4c4cb2f104105058ff963d126dd1a294b2b8d1c5f26a4ff008255791725522d69cb2bad345d95576d25dc5a8ad6851d684d8b5756afb0b54fc1d39d6ae8ead754ae8aad2fe03e34bf2c286384c4c4c4c5b20061b2cb2cb2cb13131041059814104105a5f77a0ea75e0c47087966b5b358baad556bfe4536ab9e3c1a8975dfad0de8fa95b934bb363bf72b970c6b45a5c5316b7a555ff828ad0ef62d3e0bb3a9429a7cba95ead7450bbab5a345d6c43bd1a7c2ec30f825f8eb008a1e04c4c4cb2f60030d965965965965882082cc020822b3c09ed03dcc1b04bf1d61d6039b2cb2cb2cb2cb2cb1b2cb2cbc2cb1313131620b2e0820b30165965e60380e34a85f8eb0ea4c7bcf650a10850f142859ad9638f23fffda000c0301000200030000001050d33cd7cf31c49b14528630528f04534500a00000e00b1450440c81462c5a2996bba22967df3df7c4ba825730d0851c218618408a1cf08610a20a3cf3811a79699aaa6b243637bbdfbef3dd3bd7aec32061041c42473c838d2cc38834224b00e38d9aeaac9633056a3f8740d70c158c8e54714b2820c800024f28334f2cd3ca12f38c00a96d28c3ada01182fcd8fcc69ecbe1c7c41a70801842c23cb1c30cc3c22453813e69802c71822429c81bd57da76b73beaf465c834a0081cf34c14f34728f38838038714d9ea889067beeb4957feb8c18e34a41921d9c4cf00f30f3063c90cf38b0c010320b1cc28d00d0efa2ea26ff008f6f4d1e3cb7cd6d66f290f232c73c73833ce28784c3080ce28a28832f92bba53ca43ec71e975222a172f4f47d74ecac00455b3c09a22b0428304d3c13a518fbc51ecbe06fdf7bcae537cc9b24fd3551b0a20a50ba0d6e7beea4618b3c00c5bf0687bcc2f8faf4f07c3c76fdbefaf74d1ad35d9d9c51b06a9ca93aaeccd7d2833f1faa7883dcab6def73259fdfeebfff006cb05a94966f39c1fc46456afa0a2b6a6800a1960b2268c0903fb4d5b77b2c5d53caf0fddfb141b58f220844693116c5d835e73f73c52f32d96e8d329bcd437313e3dc35674f37e7fd785e0bbe58a524a3826c4079fc6a093882b38e9453997d0d1ff39cf73ab78ebe061a066a821b07c660d0b95be76f1c867fad5582dd4b20bd8a2edfefdce373487baeb861f9592f8fe0e5e85d0df3ab3afb36792e06b4503502f982367f35e3fc9bbe3f1a4aecf3dcd61440e8c11e9c3dd1f9701caab1d32e60ff0087ef69fdd165b577cddf9a02c3f3b331430de064fe8d4131fceea2985d27b2b47d1ef74405e46cb4d35bff00997a80cc97bd1fec89d2497dde0d3322565c97e93e17f015b70b5f76e37a81cf3afc6f850956bbe449ef1d6c0d01f73b1fd84e68b048ff0034f80e65f9bd4d46c3bfcdf2d9f671f61f62b7a95e60c3d5ff00fb1fc3fd3b4888d2b9674bd934ebf777fc7c1ed5ef47fde3ae5439c42342174eefaddb9f37939d400e23c6bbecfb0ebfac5dc6bb475c37fef7622008090108518300679bd8f87b4f64f2aaee5fe8506506ce0448275737d3ec96992804508b269f0b3c5a275e53fa3ffe5c51fc439394ab4be8d8c25c1e9546a29838a60010030c636ac3910d9b8926190bc4e1b4d759b9cb0006dd079f3dfa416052230c8491c618fbc530320430ccf3dbdafef6304d70fae7e6fc8e2b6911cc0a7597759d69c8688a6ba58e10c43068807705ce81c9940d57bdfdef7d212a6a6c6768992baa7fa77c2e9a662ee08e04e821850aa5ad730bede66969a48f84a0c171a02ce24ba6d7c8581152ef14fb8c0cf24fa4a93b9df9d94fe504ca262b2a115672fa0034d0db92bf05e1d4d516a1a43c43cc2c9a8f0b44aab118537b5929589f93e5e272c9092fdb1cad940e8ee4596990d38d36c22cac5b6b67401f443a25e6e9b8fd973211067a5baf550200e30a92150a88c01a900508394806e9364cf5f5e377350e61cbf7d3df00914cff00d0200cfbbd0b0b27b4512e3c7b6236716cd8f4a55feb2217f3679475356ac40818b3afb21082754a4f804b2e24b30f2eb8ed9a8e3a5e7302b49c8161fa4fde573be40aa9aaf0c01df2d21e500536a0480c5b0c9ef14f2f3d63b6297f0f3185a2e1a2e3f392c857ed00391fb179150c408d3072cda4d2cc94e9578642fb0f4b2018c122e14909ac87cf4de663b4246c8d928f06810b3a51458afacce144eac3467eda5ea69c3d5d41d3067596959971d1efbe3a28b32d1a704eb608c48ceffbfb27b590cd12a8a8c8694a5525dd635bcd72fbf8e96b406a06c362960a24922aef6edd372ac3ea1cbdac0bf2457336d7b0c0801cec2d8a8d3ca68b04be518b8079e22a1a5fcad9ea24f9c35b120917989e89fbe58cc3be9b75fa5138ab142b8e3849e78832ce89ab574a8200b67c39ff007904e993cd1230cd9b7cfbf275d8922a6b90c884a6d9a6ac034f99013544b5afa2834b0216fcd46d976c5b206d7cb7febb60b2d94202a967165a8ea50d661b11d021635d02f148e6faa50e2dff00ebfd74fdb37386cb23a6fba1b2c0acb6be44d50e2aa63a432994d5ab92bfea48e362f0580d720bbe0a6fa25ae7aefbea3e081058bf2fa3e9aa90f3da0ce0712ffe8eb946c39b26e147110fffc4002211000300020105010101010000000000000001111031202130516171405041a1ffda0008010301013f10e0ff009908421383fe2a46882ac544104157f151a6122741e26109fc4582425884210786bf9052f163fe30fb0ff86c4bb2cd90687fc5a2e0cff72d613e09107fa90fb1381e65284a0c7dd4884fc179b1e10941b2947c1110d21f182c3c4fc2c59a3c25862272a5e4b0f379ae538acb794318b0d0c5275123da14950a7829b8c6a9562d68f030b370fb0b9ce4d972b8263c27548a16d2314cc14a439c962836e042441f2a52f3a5e6c7958787c1e34c840c052c2203cc47409d06c490c689c64fb7ae0c6ca421b93dc2f31ee3dc7b8f71ec3d82f8d890f621898dfee32ad8e704654ca6d3c93de3f38fc87b0f71ee3da7b44f5863e05884270b88358a53692148748f247923c91e4fb23c91e48f24f927c93e44affd23c91e49f224f24791af927c93e49f24f91af93aa267fdfdb2d930c5879d06b122660d1304b04345c297999b04ff00a17b3a2c5c510f29d26910f286c4f090fa14a358586ca52f0de3f5fd35e05cd31f06421acd221ac258621090831328d62b29e69c369b7e9af24ccc21e170669348835d38cc131b106858879c4822e4a759b7e9af0265e0294a5294bc0d6691ba8e0f0944b83c268a5ca3a146a8595351bae09e16b9bbebe152f791acd2262c9398aea1ba3cb65371be835c1fa8837858de6cfbdda7242969cacb4c831946f36f0684844164dc6cfbddaf08416369122089841283147c6c7842090a2186cdc6cfbf865c36bca6c106b14441a2609068688244161b11b8d9f7f04971cbd392941e0d109816024242107504a8835962e86c377d35ef914a278c9d22424363e2512c60908a36378b778413a8d9f59a77c884109093a05931e289e0c4c22e062e694a5361bfe9a77e84c62c64e812c30c6379293210e8e46f144cdc6cfa69f814de43517030f01e1383895420ac718184cb87c771b3e9a7e1a36c4d230d88687c245322121478451be2909d46dfaff0a8596d5922e1729cc08685385e498fd66dfbf8542174c26e9e0bc906740aa3727651b0dff7f0ab2d27423658f8bc1174841ac4cbe08da6ff00bf8941e8d46ae0c7c50c518c8421063ca46d37fd34fc148629a8d3c5ae2b825c1ae0f0961ba8dff4d3f0508a3f40fd252972f8242162316cbc265a30bd5f7f128a3f41a734a5e344c441e2e2970b14d86dfbf8bb8d269edb09e0d8f92210dc6cfbf8998d268ef1f359dc234f7c9a7e1c18c34d0b243d27a4f41ea3d47a0f41e83d02f0e17a4f49e9c89e83d07a311780f49e91f20b07afc43313a204911e082088822222222222212f0278104444444441024f045e083a2187fda8e02e43ce0bb07efbe1701b131451451451452898a5294a28a2652945145163619fffc4002411010101000202020301010101010000000100111021203130614051714150b16081ffda0008010201013f10ff00e75ff8fbe6fc2dfcccb2cf3782db6db6db2c3f939f2a9e37cb7fe1ef27c4ff00904b6db1c6f81cedbf967ca7cbbf36dbf8671bcefe22cbc0c7c0f8e4fe331e0ca3822df37e2278cb3c163cf6df32ee2ce73cd8b383c48f359e4b0cb1fb41ff0048469c092e3643613a38fb298e37e179486de03938df1588f1f54f67273489ac03449d226992e16e706c44c72b6dbc131c2c4f5c13c0f9b1c0f2deabd195589e30382540d5cd5622de0b6db27c763924de1eb878238d87de7f7cfedbedbef8fdf7df7db7db7fb11fbe3306ff000303b59cb3609e9bd8d95fedf647ece07d97db7dd1fbefb625a70bf06f0de587c36b84c376feafeefeafea37fedfd5fd5fdd9fdd83fdb3fb93fb9fb4fde7ef7f77f71f7becbfbb6ffb0bf71fb3666ec733243c58b79ce52dc8ef86f55eae72c8e4664d99aeaf76e63c19e011c5e8cf91e0f37c1e98f4e070596ed919738104ce61090cc6149d64e432ed7ba7c5b3cfbf0d9781b6dbd3cc0b658824977129e91d208f07b938c48bb7045ec9752f932ce0f14b2cce1bd37a210dbc7440b6eed8deacdb29012e9c2bb59d8339331587d4c5e0e0596596596473926c137aef4732d978d93783144dbb16528ed8d589c8d42c4bd65365e443e67aef549241c8dcdce32787d31cb6ecd8b196771b01325bd25197f054ba5d697c03c113c768e01ea32772c89a436dcb3274dda1d7033f857d25d25b662de03d4ed8ccbbe0b13192163319e348430eb819f9b6db657aae8381abe52b2ef6043dda48b0b58d4494c8f84ee0884748f5249e3b6db6f92c4f1f723a135e01748cc52ea65ac3386bcac4a996ac4700857a43a93c04dbf0e41246f687ab781c02cb2c6165909d2f7658c1c99128192eb89f013e271bc659c3749f77a471efc86f04e4493320e0402c4726d16317381f013e0738ef8b2bdef48836c380e0c84930db249c1eb3b0b7761649243a8d4f16f80f0c7832def7bde911db2c870647210e0836d39061ab2870f05d43770e1bce719659659e2cf0f6bd21096230731c09073d9091e021d4332938dffb791967c24dd67ddee5e9c4e078c11e071384d9996db0f021d37fefc5719c1f1bc0dec47ae0591067808cc0bacade52781c9f57bffbf833cc765d5043808788b2c888626962de0b6e8969f81e70dde4bd8e2ce044783259647c2f49ec3abdff00d9f8b781efc88e4217b5e9820e0620ed93c3659e19e6c876baff00fb9f88e0f7cef81c24261c63d221138392f0f0fc2b2597af98678adbc1cbc321d2ea41c24c08e72678de72cb2c9960925f003df1adaf01e2cf0f55eb8f0cf267818b39666d96e8e21e262c826393965e1ea8f58f89b24e0721b65259b25ce0744877218791b786393953da71d0904ccbe9be9bebbe9be9be9be9bebbebbebbe9be9be9bebbe8bebbe8be99fd17d17d32dfe4a7f9c37fa2583b2f9999963bf70161616161197561617561612139757575756161612122c5870997e66de5b1e5f9f37f9cc77c1e06bbb7e67c0adb6db6de76db6db5b6db6d5b6db6cbc6db2cbcff00ffc40028100101010003000104010403010100000001001110213141205161719181a1c1f0b1d1e1f130ffda0008010100013f10e07ae38f7ffeff00ff00bc7ae3a9535afe33f8cbb5c356be9063f41ead5bff00f2007e9f40fd67f1e2fe37f5fd1d52e63c3b976eddbb76ed7dad7db865964eb8bf85fa5fa5fa5d9c7d513f4bf4bf4bf4bf4bf4bf4bf4bf4bf4bf4bf4bf4bf4bf49fc2fd27f091f6e4631fc26b1af3dfa7ffacd6bc7fad9fb5facd7f7ff00f0fe7d07fadfd73c867e97eb31aae0cc7e7833fa2fe8e1afb5fa4fe1c5e7febcff00af1fd79de8ba2fd2fd2fd2fd2fd2fd2fd2fd2fd2fd2fd2fd27f0bf4b5f6b5f6b5f6b5f695f69fc27818fe33733f8cfe33f84fe13f858fb5fa5faf179ad7f1e2f03cfcfff0088fbc6f3dfa3da9fb4fe3358fe3c133c878de27831f6bf49fa762f2847482cff00f30032cb2cb2cb24924fc4931892497cf1d5927e243ed27e2c3ed67e24fc48fb4cc924b2cb2cb2cb20b2ce196592496592596493124926332cb2492c92c92cb24b2cb3f167e2cbe3ce4591df3fd6fea5fd4bfa97f52fea5fd49fd96969f7e34fb929f73f9b4fb9fcca7dc9fd93fd2fd897f33fb99fe93fb9bf8b65253ee5d7dc9fd93fd2fe3f99fe9fcccf0f397f5bafbfd07ef8ebe9cbfa93fd38fea4f575f79fddd7dc93f3c27092739f993e86784e120e32f8fd1be2f2849980e0064879f561820924cd3678a3b3566acf3c71caf3d764fcfc10cd934cff00a5ff00123e5cf1a1664831365fe97feaff004fff0051bcff0077eac7fbbfc58ff67f891fe8ff0017fa0ffa8f97fd1fa9ff0061fe27e3ff0067eacffabfc4e3fd5ff167e7fd5fabfd07fd48ff0057f8b3fe8ff107fd9fe2cffa3fc59ff47f89c3fddfda3fd37f8bfd37fd5fedbfeaff004dff0057fa6ffa8475feafd59ff5ff008b1febff00163fddfe2c7fbffc48ff0047f897f1feff00d5bff7ff00890ff7ff00c5aff7ff008b5fecff0016bfd9fe25effb3fb4bff47f897fe8ff0016bfd1fe257fb3fc5aff007ff8b5feaff12c7fddfda13fefff008bcffb7fb4ff00a3ff0057fbbff37fabff0037fbbff37fbbff003120e100d8ef7e33e8ce3e3c7cf0f8fa2ec82c92cb2cfa0fa5776ecccccdeb8327290425fa07b3c2593c1e7d01f48d9edf406c99647964b21d5f364df108f6f88756593edf17f63ff86ce738f8f0f3c3e2ff0051f7e33938f266d9644c999e1e33a93824a7de3b704b2784d3832c92c9e1fa01304b0fd1b3dd92c96709b275192ce7e63a412496752416753ecf09dcfc5fd87fe199fa0f1f3c13abfd2fdfe80b386c824b1d8924b2c92783bfa27d84df37c5bdf0cf0df32f0cf0f2916db24191f4a753ec79249c3099933277c6492592596f06c920f23fb1ff00867e9f8c63d43a9871c0e020b0b0932cb2cfa19993648e99c6c9381993b9f2f9e138db6c870c93bf43f50490704ce1378d92c9c99924b27db38492cb24fb70eace1eec83bbf1ff0087e8ce0f9c7c9789f38b0360b38d9627838c92cb3e8484db3f409c33be12c93838e3c3643bb2cfa3391c65f1cb38f9e1924eacb26313b98992ce032dee1ea6c832cbfd8fc3f50e22f13e7060c4fc701c3326cb2de1be6c9b2c919e4fd43e7e84b384de456cfb65967d19c3e5870cdf3c24db66cf565e2126c1cbc66fb216756470c7f69ff0d9df1967d23c7d5e022d997827511cb2593e4bc7cf859c78271eaf9e3386cb2c92f5c1924164f01659d4f2264b266c924923b474e0cee4bba624f2bc249d4cdb6dfd87fe1b3bb2cb2cbe3c45e38f15818eb5efbd33df3bef7b8997911364c09f3e8ce09c24937ce199659e1f678dfa36d9f64ee75318913f4b038278f1c31ce411d3903a936666784b2ce1f33e4d97fa2fb37cf196597ae3f0bc4f9f468ce0989827ce323dfa321330b24b210c924b2cb3f1c87ab36ce127a9727b844fd04c3c0349248769fa0d964d8a3ed91ee492662709c33e70633c473fdae9b3bbe3ea443a93a8fd0465924596490756599c6db2ca6f9924b21caf9336cb0cf7671abb961e1f126c93ce593044246767c9e32ce53059d564f4476493e80624fd2df177ff007ba64eef8fa3d71f05e27ce04531164c5b1c1e59333125909f6db52f5299217ae520e1eec9c812419c277046627049d59dc2f21eef6c2431e09c86b761678f9b3588b81259231e422fa597d0cb26cea1fc5ff86e8cfd1eb9bc4f91a812444c967d04f0c9133ecb32eede1249ba166cf51379287564f09c997499b36459d5913f40ba653e701b328de0e56b25af0c9000eacf8518c027f2b3debf72243ce04be39f113bfeaffc30ee67ea43abe38509896226cb38d979cb24877327067d2f333ec4ded91c24f04896ec4975c644f3c386cba2127565dd65ab1e8b6da184eed92592b5f725e0e403a4a80a2583fa592fe783f48e81f6ff00c31ee4939f3cfe27ce1438db782f8e1b7862c9782cb7b309926f896ef65933659cb33cacbd4d9659c3c0ef86ce3c3249659c40ced9df378977c9383e6c8c1a11c324f9685988766912186e91efe812ddff004bfe1863f432f17be23abe38d32cb2c88be2638ceac8e997abd49c3b0bd706c84f5c3d6c9260e198be6678c849d49cfc70937be03649e1859ddeacbb52d51d6ce3d5c89c57cac327c5a756f0340f61f00ee18893492787cbbfe87fc30ef83c67d0bc4f91fa60f393d7d2cb24e09c37ae365d4bc761979649e5f3e83c0f6cea4eecd82d2674986ddbc71ab3b8d2580dde91edd84f27ca78639f7b341db10126b7c4c3b2e94f0c88198cc9337c477f6ff86ee8ccfd2fc47f8e30cfa32c8209bce09f38db786597a9b2781f37ce79cb397cb2c93866d90ea483bb3a8773e42ef0c380892f25c609c6d9c35ba096757ccc426275167fb5e104c671fde8ba8186ce2664e0ff007ff861db0ebea4c3ae60d8e0be262c8d1dc9dc1d7d0f1b36e5eb867e813a83e9c986c1095c97705926cacdb11bb716757abe2c8b2cb249f187733f50965d6dac0071bc68f5606c8cc3e23d1c8d9eddc852400f261cfb4c93c6dfd5fe187b779f6cfa1f3799f27d7ca6238225bd99be2f99fa0753ef2659657b070099c47b2e13ddb5ad212e967047b0de92f6dea3d70df17ed04719d4a64762609b5fa43b60add49eccb2600dd6062759b67871cea3bcd79c36b7f1b677f3c14f037fabfc37b431bd7d4fc5f1cd1bc1ed8db0cb0c336f04cf2f90ef78783c71d839f27c920ea45c8babab0826e477c8c6dd093d71bdc8205d20757b869d489c6a5e10fdebd183f36887de1cd7092e6613d27c4b2c7cccb2f80b633b0c9a26fd5a3dda374db2baccbbb7463818c8773663e243277b0e0f0343f3fe1e01ddea78f071f30eacebe86b2ceeeb24b2cb3878e0f619e123e819709b2671b1692f57cc1a09923ad920371188557c90a5a3efead05d65f33630b130fbcec3747065ff001c6c9be6a437cee4110fb9389a9351fb4ff33f28c678dd45e57b3b6ada136c53cb086eb68f3d84c0e03e83e88636373d2f219adee7d9e06ffb7c37b423dcfbc0e88c3a8753e72d04916ded9642f9bc9b26265e4f064ea67c96db91c23b0df24f125510e47aeb8384814dc4327b7673b0b71fc96093a324199756f761fd974fddc3573233f37467c96646e9aeef9732cb1495986c8ad324e1a54f983a50ef9808383e70c97ce5d1ff003b17709e06ff00b7c37a423dc9dd97c6f8c7c859d30efe165b6c164f27693e93c3e49c19249924fa1ec43bca21ec1da0d900956c51e0f69d598fa6659be520fda70ff258be5ed7c5effabfbae0eb67abf70daf525a50ea748ff5a2d1b4041d1c2a00ef70b2ac3cb2667443bbe10e7038a9ce15b7a90750c9ea4e3b07effe2ee4e2f49edc3e31f23e424e98d4cb38041275f404ce1d599641236772753cc4924926fcc8d883b813d6097ae109ac04b58cfef6164379b2281e03159d5907d889d438c3e6eaa27f5acc02ebaded9555b0dcaf7cbd93ad87c4bacf09e377518f22f85d8bbc0250f47ac819991d744f25d9c3c0661be60c1b45cf887f25eef131fe07fe2ec6ec6f49e01d97c210eace9e320b16591659f432092c905ec9dcf92493e4b833259d4f7b3852082bb74198becf118630a9224b06f2ceee8fa8fcedc7e5d5e1a908f6ccc555c23c192bf7a3cb3b9910fd4817c841017f34dd45d2053491fb8b00f109eb7b8f476f560208f6117ae0164175025f6e2d1d64854ef67c091d2fc3ff0017a5dd09387a2f85e21d5f1c4875c65904165925965904c396493c7cde67d934b32d97878136add007e58f9611aebf9ed2101fbfc081ff00a175ff008d272bf86731f7bbbcb00c4e993fce598202cc3816b3125fc0ca7cad7dd65f2fe2fc0ff16478ff00123e1841aa1847572d7c628eae9611f94927a782e47ceefd219ff02ecff0207fd483ff005aff00e3a3ff003d7ff2d1ff0092bff9abff009a943fc6898671eb60747bfb4e777fc4fddff13ff9d3cd0e9ed261b1e19643c87643abc49d47861659641b64975258d9659cd9cb21845cb3ef27523264e9c316de207c1ab0afcb0271ff00be41ff000b1f2aff00329ffb5fed37faacf9aa7e9b1155fb203e4b474c95ea7d02d82046cdf2c69c5bf8597da5bed01f69fc1647c46df12c7a58ba093d8c97ed577bda3e6655dd30dacfe97f682bfdd6ff0049bfd56d7fec6ff71bfdc6fb1fcadffd06ff00e9b3b75fcacfc3fcaddbfe56d05c7f77547c9f9438de1a094765ec3f2ba1be53e0f2f8decbc43ab3ab4e18167048367537906de59bca6fd00325ee491333c76623720686c60dcfb4e7e3f89d7c3f89f88fed60ff00c5fe823ed3f8bf1bf89c11b9d43ce996309c8c3ab1d85f1f3bfbecc2f73efcdfcdfd6f9f99214883b846edb03fe1673fe9073feb27c85869ed1bfa8c3cff0011fd8fe20fc17e02fb8167ec5f202fc288789029888f785f8976785d44371bc433b9fe5b7f2cafdd8687dd7fe57b47dbdbc17c6f643abc4f90b99790f7c24126f01b791d92a5ef1932cc7a927cbd4924deacd884182c15f28609877624244993bf160ad72d0099dc4939a24037806307cc8ce7a4ea26dbdf25cf2dfda67e58fa2d3ead4334d3d2362777e123ecdf68887c464953be39231042cfc49a791b7978844ceb859fa989c3dd8d9930fea9ff002bb1b1d8e3378be37b21d427ce7c0d8ed658d9792cdd1064bc673e26666ecc327cbac9041c77fccdd07e84174b37d83efc1ef9c0c661da75761b5991b5ef3ab0ef8b1625948499aa7441f7ed2cff00a4cf0fed7e37f8bd4dfce4a7bfdb1fdb133a438c80f0b16360eba9384b2ce5c838186d9ecc9f9c1e8f727f3d40764bf7e061fc3ff2bdeee6c61c78f8dec875093ae1c0864c79c1db270f383046484396753c04cb738fc5eacb386f2fe6fd9831d13eac98c3edb1eda752d9082d0acc03f3f277952bc6c1d2f50e38f1041f336b7ff9b7b8201d041fb48fb71212321d4c7ab7e80e4664701ddf1663f16c33a96f0246b2f8b23f7ff81beedefd5dcf125f1bdde6f17c70407d0cd46c9b2700de1f10cc9d4fbc3339e0c3be1793fc87fcdd33fb6787c13b396c2357c706d006de111f8410f2c1f16ce474810058d882c9ea7a8652be236596410585933f4be58f1d22c323b07569fe8f4da899f17bf564ac961ddef8f92f13e700659041df19277273bd59b3c9f24ef990d98f0877c162c963fb1ff37f6bbe2e8db3b77f88fc398dea66cb2387cba4f6974b572eb782750eeeb3889e2536596175f433c6fd0cb1edeaafb3387cdf7bb87fb6aea6ec6f5be58771ee31f21d49d4380670f9e3acbae19241043a9e17ae5924ea78f327034c102da3f4bfe6fed1643bbcc70038db4fa02c9eb8beed8f5ea41e07b2c2dd849f1745a3bb625d58f0b9ef17167e5b0fcc2beca4cf05bcefe1b919199b75430dff005fb5d2def76259eddf7a8de4bc4f9c40104df33b77633c7c47528f9c24c62492703c9cba4bbc3d9f60ea20fe35fdb63de3843b5b10c3dcfd043c78bace762c208595af0ce0e8ba4d7a947488b180e9bb7db1bdb38e9be4de5bc9ce53fc44cbefab0386837a5dcb773c63be3e4bc4f8c38e024b3198ce124e0770b3e83c2de2585bbc32d24c975e01b1fe27fcdfdb61c2f17ce5ce18ec70f3a5a7de07de75e5d8e207884cc9b3c5a90cb26dd91c37962a0de88ca42eb1475b1f62c0dd24eb5ee5c3b7ed78cb3e86e1f8ba67bb4bf5c43d0dd2deb7af5765eb89ea13e30db823e916f0cb12b659eee84f933242c92e9c3e780a0fbce07e4ff9bfb6c43a783f94be1760dea78625eab21e2520b0fe508bec7b059c1aba221610dbc1dbb7bbef26e88ea23ebe997b2649f33e86cede9273db975412d104932c2b6d9fd49d4987c1c05ab4dbb5bdaedf393cf0f4e0427abd92cb384b24b20859241c5f27ce3e38646d33277047106bb6e0f84bfb2c7b2eaec330cfdb7fc847b2ddac57b5a503d39604d7f36a8c627674ef184e912592327bf961116496416c6abe4daf7fab545cb75d65eeccbcf6cffbdee8bb482079888116703c5db185a21f16ec4e93f081b74b7a5eb7679cfe78274f021c0e324fa72c2c67bc32f0ceb83e5aefd0ae01309bdbb8ca3005d7f466c86aea24e967d0904f872f92ed2c221c36c62ec3c4acb1ca457b7139bda30771927d193c88751bca2c7a912d7b3641bf05d03c06cd7f721da2d81ba17630412124c74462484acdbf4449ba6376f6bb9ea73bcf07d71e0cc4c8fa567235f2077b6deb8332db6cfb3e4b786f724f45ec8cefdec7acfedbcf721db0fc4413e70acd5b410a8b2028c09de50ee509a12a87a93a6ce02f51a363e8c85979941b44ab520f842c26f51c69dc6220753129fbec2df9b490d3eb670b82b66f0da7e5b25f89ed0ba9bde3de1e2f3c1f5c68445dfa365c96c5d2191019756ecd8e35cfa942657a8057ddbf324fed3ff16f026645f3c786f0c36d3476773f54fcc029f849b06e4668095baf6726add1df6647778e320821c788bb63673abbea38bd5b017597706d3de9cb26bb9dd919ccb1dd9eb85ea293f7b3bec43b218cf192c2fc4be43a8f6c4eeee5eaf178383ebeb51b24de378eb839906b264cf0f93c7a87cccaf528d0fbdfd465d09f0ffc4f4e12493e8f113b3899909d0c4c463f79c0a7b9c77db53d6cca93cf39b69b5e510208820e1757bcf6987518d0b0deaea1205d57ef063ac808125255eee8c96c789ef2de1e23dc7afeabd51dbc711edebc7e179e0f8fd7e30ea3a6513f402132f0cf0cfa9752b7be330f5ddd3fabfcc5dbe31799b7382e7e67ccfbce89ec1f1656f603a66fdad0623adf8bb5fc459d10ff00520a0cb630f5082c88e3fc2d8fd4d939b2f7099939f88c8e7018f736f7625e1c3db06f20701d43b3f8bfb5fa1fe57b70f05e383e3fafa1c09696f0f65ebe8d985af03b3b9972ecdf3657794ba9435b64d09eb60cfcdfd35870e1bcf96cb8fb6ec3d77e5a580b2abd163bff001b386659179edd0237a5ac52308cba71bc12e4fa8e8c8f489499069262649b7670309d4770720387cbdff57f692730f6354ba39179b124ea2d8782b6d97abd5e26293616f71ba4b0d93253245c64d86ced00ba87d9fd86f8396259e1ed8fa87ef218e9b2c7da75f1664ead1f2cbe24fc42251e5b1c6dd96041896c8de1f4e2992ce2d2665d83208208e18f6fd5fd94bc7c5f3e6782f30f92f52c84338cf9263df1b0f7396db78b63b6f13c2a43df380270c2744d9a4b8d91660439ceafc1d3fb4df07d1b19f30f66da29fef396b6db0d90b25c7b8b83b271dcb9ccbb59424d7bb77d8b2464bbbc9190c44edbc59b0cc1638393dbf57f692979bc5f28452e8e0784bd4f690c36e10ad8bdb25c9a1916e4bc3e71813c2e011ea364302419a42cceeff77f37f6cff8b7a2db671007b777b767b09c8bbac1d45b0c3c3b39709ec71d25bc9da3da11041f7e028210f646da4178e1705967397b7eb947c5e2f970a9745f188f9c25ac32b2ceaf218bcd904f0db6ccb2cca5ea4b663daf72d43f9e1b4538cc72ff007b2fe07fc58fbc9fbc9b3e8c81edbbbb3bf5741893d9833ee2d8be2257249e7d9f66d9756cbc1d1909ddd6b77ad8361264c9a923b186d47a80d96470f9c6317a7eb9c7c5e2f972bc13f21eb85d7cc499838f136db3c33c0ea2665eedea5257cdf09e3fb58a7da378cb4b167eacb3dac06d895eb7c7b2cf4166da09ed9d59c1c3e4f89eecb2ecbaa3d96ea618dbd5bbdac6fba689252cd2771c78de3e8020ef26497afeb8c5bc5e2f9723c12f21eadea731432cbd41cb3659659cedbd7078f77c4f65eacce39fecb73b7f06c2083f4e21bb5a6cfdd9e77c4e8380f5761c4b4b6d8e1f27775ec438de2f89f4deb7aba30f5384a0864f84621f50cc4c8cc6e19e26ecfc47f8e5bcde2f94b83c9798f2f1c4810ce0fa199b6783667c8aa6deef53d5b2976dc6d5fb4669103f51837fa4ff0089b7dcb11c7bb5b13f0713b0bca49623c6cf01b1c09d441bb16576e1e2f8bcb7b49dcfb76b42d4c8083edc210701271f324eac8964365a66f0fea5fc72bc5752f6f7e1e4bcde2f0df2388f77593d4adadbc6c49241dcc93adb38f13bb6cf7c32c92eb6a3625e757dd4d7f57fe243260b2dbaf3e6c305eb3b8d99998deed1ec8c2087713796f5394c8f780748696f774f7864a2c8659c1f41072690304b13dac1757f672b78bc5f2bdf0f25e7878fa34576dea58eef1e338df8b3bbf09d8642eae9220de21eecdb27a9777a230bb1dda6df9bf41efba907b222b6e71bef719809909cfb6964f4de2413b7c592e720c5976f4f28cb652cb1cb7be23be012e43bc7484781b0596493075c60c607f1f2be2f943be1e4bcf0f12a9b0ec975965bd4843cbf36eccdb17dcc3ed6756671f9b7a923693bbd6d72dbaa533ed60ff9b607e3ff00168f6350899a3b25db7449f48e92490403385a88d93a97a9f6dddc1bddb37d029dbd90c1bc3c3b8265612adb3339459ca72261c01bfae46c7a61d47dbd3c3c979e1e381036191da194f9bf09c4f6cc9e17b8f79a5d3824bedc2eaf99bde04f65807eac0b6fca9101f85f24c31ee0ccb2654ea52606dd45d12362dee1e9b64903380eb7418bdc829eddcf4bf2bc581745db0e558af760791d249383760f9b079627301dfd2e5b78e276973a87b1eaf9733c978e0f9f42992e586def5027bc64da0796eb79e1b6cad9f796701b2c8f3faa6a6704bd7dd97ebc2c86b60697c4b6a6cfec4b7c9ef966ec85f8be291ae893421c14b0eb21075744f06ec59ce8b2edd09c59ddedba670fb440d8647dac924b38cb3ffc60c98f084a9d72be5ccf273377b83e0df9449d7769f100c3becdb365e4f72413d4b3c36659eee90c1dc45d59b252187f9bfb5213ad82833cb47c9424a8c99c3b87ef65f994dd61182f739f65a6c797865d36e49b77a8de9626dc8cabf17753b46819588ea31c4125f12983f48facf260ea5776feca5f395f2e6fc2f1789fa3c69e4b1e4bbee0b49dd899e73be0adf12cc7a9f27ae0bb6e4fb8beac83a60e88c33f6c29fa48476871b662c6d0e13111c3848792ce1137dc7e3390206c25e59031754b57900c20862e892d3743a90116536c8fd727c98cf006f0206707d2a7775bdec7f8e5f2f1c4fd9f0fc2f1f49a38957de03beec5203abbde36786f1767bbdb6b246399c6312990d1286c01f2f06c17e61a9f716212e8429fbcfa38f7b3bbb5d1107714b6766463b133e606fb61b1151746cbe17e3bbb2d28769dfe2021800659dfebe8c927832c826eadb783e81db6c32fe397c95e2f9cbb4e5e722e04de190dec9be31f7a477e925bcb3bbc5afda5fc4b64ba4ab1d425c64bdbb188059d7822d73ecb706424b8d8ea9e93df271378b6bf307d20b706047bb5cdd91f124ced0ea1d75763089a0435eafb70c0be623e8666db663c0328be248ccee5fdacf894af95f3fdf1f85e7e9046c9e196a4a7d4fb6c4b2ebf12ec9cb592c93b86c1475dc3af57dffcc3ef6e81f6be2be31f841f8b2e88dc8877c41f6b02642e902ded12608a666461e3048139b0b1a947b6d974e4f52c123c16fd0cf1937698420ef978bc0fede7c42f17caf9fef8fc2f3c3c4b8232b6acc24b3696f0ca4c8e79c2ea126484b4960f4b63dd89675c09af9f1b3f1757cb55a5b582cc37db655d4a3ac1d377c87a0bf55be3a93b0c2e29b2d73c5f361ac9a3525823fbc7e56c31cb3059659c67072b8ae13afede5f3878ba6df3fddecbdf33e7126e5b28e189b22f2596772cd9ea4cebe611f326debd9ead3e4a9ec34b241666d43774ff00a9fe57847c65c5c84bd5a5867b20f257e652fb69ede26093f0361f095bb19c4ee4e2becc06bc1ac3c966d3bb133cc2d2fc78062dd8e92972cc2c3692f0b96f72e1e1ea7d718b7f4cb1bc5f3be7fbbd97be67ce04e93576cce76dbdb2667d9c1c36f12f730567cb3bba92d646d95fe9388334a5ba07c1f1be2ae87a8df64c8f6bb3109f85f92ed56c3aeadcfece208d87525a0c981b17cc8581ee155f69c4bbbb5d978e03dc7020f987ef0fde01f637f31f9dbfbdb619436ca50ea1d30cfd32f97cef17cef6bd97be67c9c05645f3c25904f52cf0c9a4f0c2cb27c99e897593001ef39d0c73f5aeedf8d9d590601b7b77097dbe75b2f5967a4b23a64b4efda65c0b6e8bae3322f17bb4e85bbb9bae22766e47abb911c365f31b016e7514ed693f9dd532f52db21af01018418f2598e5d5e5bfb397ce6f9f07b2f7c14bd70032b1bc6dbc6cb3cb759f2deecb387cdbc3c0251565a2766fa67bfa97f6f9f20e3c23b9b63ec83ecc3d335f3974edeca7916ccb4467d80c8762859f16736ce96425665cba6d36ca6b7d93ef673b7dba7a61c3643e635eb067b23ef677d930c303e23b8c5b2e0ec9876be37da5f2f0f1f9de99f64fbe47c8c87261ba90b387967ab6deaf9b662e93f412211c747734f532cdb30efb21fd559764308c482bab65cb6f491f6463ff005239dfc81f8252b6aaada7deab0863b6fe0bb0c8fb2cae0c9c17ac45bb2b6523f96fba8c7a6dbe6597f797f797917ef0f7d81f98e9d32e136da83253db27174ccf65bdaebfae57a9fbc7e77a7f73ec9f77889e3259b2c9f61ebe861b304da8924c27a99bc2e44f576c10589be58f522c7e47f9588c01ea57cc1b27d5a7a5a3d903e59820cea6b9359349d4a9ad821d582c3a2d184be58c736dfbb39d97458bedbbd5ac3aee7af217ef0bf789f3c61377f9bf6487de1efb21f36e70394d89eacf85e2b04715fd9cf8e6f9de9fddecbdde7832e004ccb672f8b2c973d977c9dbbb425ee319eb87692c9263b0e5b6c9b1d480afb596a7e65c87e1050de27e58cf648f513e05e03c923dcd685d310d75f641c34d81efb18c5d8435ee4d2ec76c20cf6e9ead8ea4af72a24065bcf27ed32bef6c9cf890f92e773ab86cd893e464df23c5d582436be2dddf1e9baa9caba9cfabd37b9f64fbe66e861b0ad95b3bb7387a9ec39242fb10eb3e5a95b6dea6317ab6597b8f38bd138cdba7db67f98437e04685a3c833cb13c83aea75f1b4f762d61d8e62ad3058829dca3af85debf31d6bc1b4bb6612426d64f76af910690075184dbe23ed43f887f107e2cbe2ebb6db67bd8a01f377584756363e4b67bbbc9bdd897a1756fc4f44fae3edbddecbdde783e4660c965978e0b0f72dbb2490127dadb2d26f899b6792d52c72306f11f7b529f0951a4584aec585e4cbe042df222dd6d06dbcc0762deb79362ad88f9266a481915a65b88fa808082058b2c228de2df898ba5d0b16771daed0bec07c597b71ddc25d4af9deaf73ef99f2171e17b961e5220977d46c7447bb69e5b6db39633876ef83a0b119ec17c7003075001f997c1f1761b09f333e300fcd87068fb3ea7d368b378806a770b3233f7b60dd423becb2d20add36ef9c613c10658bf3f29bd4270230fbc0bab4b39dfccb5b20dc16b8f0312def749778f887b7bbd717d4a7ce446cf04db1c3e48beda2d91997a599c333bc33c2e365e4a0ca324c021acfbd98efc2d3a31be6f2ee04f73d2d33b1723030cba5d2883bbe441b68f643191e0377f1e561ce77bf2f09a25cc29d70fb4b3877b2b6d369dd810499c7ac73af3786f77ae3e61b7a78f1931b36272de1dbb9c1dc87b7a46dcb089f1c292fdb8781b0a0623ef62bdcf5a6f85b37bd6137defbcba5ddf732276f033f7b5e334ed97b3b3efddb4db04ad09e961ac708e177626d88f67a9cb3f9c61e7ba398790675f0bab5c1b96670dc9e05db869247a6f2c7bbd71f30db2e385bc4b16323b12ce1d12431d7202dc9ee6386594e7d88bac0162d9371d8647f61367d596427cdd3e6fcb69f9b6f184fadb6064d0ed1f05755dd08cc210bbeebe0234a90bb60baed7894bd732d7a4c3e88d91c32dd8ddcd6ee1c2c7dbc5eef779bccadf78632cb309191db837b9725df66279f2c5eb390e5e186a4c826b671f6ec23baaf14ff00838b19f7d7ef0dbbfde33775a44dd609edb80c4abb793c2ea9f72783f25dbed9da5b09ed37a2e8db21b03eb9fc5d1c3d9c06cde0778043ce14b2ed96a335bd3ff5c99df0f6f71f60132f17b6f45e7897c3c50b2dfb5af1d5b9e4295665879485a5872629fbdbce1897bf6f61b88b74004338beefe61fe8410206d265883f7877d83ef12773267f74c7dbf2991d21cf49edec7e44407de187ef0cee6df0bf02fb98bef3dfd2d9ec7f28b37677ccff0099cfb497d8929bec69edf7d7dc4bf091f921fc90fe6e9edbb3d9317f994f8b4651ef07ed228f5f8fef5e432e9c07d9ff00774d0021bbbf3773c123a18de2f6cbbbcf1387e325af269e926fc40fdafe93fa95214ab5bdb2c809e5d3e24fc5fd24d7c9fc2ce3a426cbed748210c3ac1f6fe26df4ff001377d32991090cd3abb7d6fc8c0bea7d18dcefc59f613fadbf54d18fccdfe665d0c3ee47e57f85b7fd17e49f9a6ff3c3419283e0e06c7e7be43fc27e67860bca07cbdfce1e3e3a627ffa77dcfefdff00d46478bfad8ffe9c8ffef1ff00d795ff00de3edbfcdfef37fbcc5f97f9beebfdf1266758e0be8d9f83ac380eb9f3ef73cbd770f6fc4187a2f61f7f6479622eee6baade1bdb7a39ce0ebceb5dead7eeff0036bf77f9bf23f9b5f77f995f77f995f77f32beefe657ddfe6d7ddfe6d7ddfe657ddfe6fc8fe657ddfcdafbbf9bff00a12beefe657ddfe6fc8fe6fc8fe6ecf5fcc2fbbfccfbbf48bec7f175f3afd423a1fd29ff00d1c8f57faa3ff4235dbb8b7c266787f13d79fc25ff008097fe447fe3affe3a7ff1d3bffad3ff00ce93ff00321ff8087fe0807c3f899be1fc4fb33cafd59fb103ec7f167ec7f113ecfe23f2fe0807fd17fa09ff00e02ff4059ff9d1ff00cebff984bff012ff00c11ffc17fa0bfd013f87f097ec3f89fb657e666ad5afdf86207d8fe230f1fc46bbddf7cbf0afb14c0e19c4fbbdf39f533336db6cb6fd2ccf2f5c7cfd02b78bbb8f0baefcb13f7bf78fcb97a797ec9e0db6d8fa81e97f79fcafdafda3f2bf2f28437e76fb2c04ecc27edb794af7a9d1f6fe6ce150e3f01fcc946e2a581ccdfe7c80cd5c7306ff00583a5575d2632d0743f97276b91df832c9d800e87c7cea068641f96ef9932907f2f7adea78141808f76433370ededde08035dff8b7ec7f52c901d381fd83f99f60e3d3f1fd6f49f77ae6f1f4edbc3f46ff00f82cb6c5eb89e8875675cbbf500842fef1f94429f9cf31448e18fa402e20e038dafe77ef13f2f18f0e001d1877cdf620383263bf13a011f2dfbf8c8c3aa533bfe46c5c99f879ad3cfb498362f907afc97aabf7b1a6f5d85b06fedf7bbfa27da6e1eff783d04441d8fb47e33d860e08febd918bd7047b98bb6cbd606b9f8ead26aaea371f6b08700fb15fe9edd2618f93bb99fc58830266e07dff00bdab61533b5bdeff007e3ecbdf2aeadb6db6d9787e878db6db78679f4739e88745e23c16dfa013ac3851c04fde3f29fcefcbc2bb7c356edc7df17ee5f63e95de0fdafdafc97e5e0fc91d3dbcf4cbfbdfbd8b1f309e756bef1f7c08853f2bf6bf69fcaf6eef6e0eebd7378e76de3786dbbe19fade7d7010f23d49d43ae4d86210e97ed7ed6a1c71fef3c5fda7f2bf6bf6b7f36fe6dfcc623b7d08847219bb71f4053e8efda3f28a51c7df1f9463e79d8f32eee2f5c7cfd57eb67e8787ea3d1782f1378e3f1e0e4e488fff0011f51f378bc702f5cbf4070f8e5e0f791c9333c7cf0f6bffd9, 'image/jpeg', 'image', 0, '2026-07-10 09:31:47', '2026-07-10 09:31:47');

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
(7, 'เลขา'),
(8, 'นักศึกษา');

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
(1, 2),
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(1, 4),
(2, 4),
(3, 4),
(4, 4),
(5, 4),
(6, 4),
(7, 4),
(8, 4),
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
(6, 14),
(5, 17),
(5, 18),
(5, 19),
(5, 20),
(5, 21),
(5, 22),
(4, 23),
(4, 24),
(7, 25),
(7, 26),
(7, 27),
(7, 28),
(7, 29),
(5, 30),
(7, 30),
(6, 32),
(6, 33),
(1, 34),
(6, 34),
(1, 35),
(8, 36),
(8, 37),
(5, 44),
(5, 45),
(3, 46),
(3, 47),
(3, 48),
(3, 49),
(3, 50),
(4, 51),
(4, 52);

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
  `project_name_th` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `project_name_en` varchar(255) DEFAULT NULL,
  `description` text,
  `mapping_json` json DEFAULT NULL,
  `responsible_faculty_id` bigint DEFAULT NULL COMMENT 'อาจารย์ผู้รับผิดชอบโครงการ',
  `academic_year` int DEFAULT NULL,
  `status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`project_id`, `project_name_th`, `project_name_en`, `description`, `mapping_json`, `responsible_faculty_id`, `academic_year`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, 'โครงการพัฒนาทักษะการเขียนโปรแกรมเว็บแอปพลิเคชันยุคใหม่', 'Modern Web Application Development Skill Project', NULL, '{\"clos\": [\"CLO1\", \"CLO2\"], \"plos\": [\"PLO1\", \"PLO3\"], \"ylos\": [\"YLO1\", \"YLO2\"]}', NULL, NULL, 'active', NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(2, 'โครงการประกวดนวัตกรรมซอฟต์แวร์เพื่อชุมชนและสังคม', 'Software Innovation for Community and Society Contest', NULL, '{\"clos\": [\"CLO3\", \"CLO4\"], \"plos\": [\"PLO2\", \"PLO4\"], \"ylos\": [\"YLO3\"]}', NULL, NULL, 'active', NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(3, 'โครงการอบรมเชิงปฏิบัติการด้านความมั่นคงปลอดภัยไซเบอร์เบื้องต้น', 'Introduction to Cybersecurity Workshop', NULL, '{\"clos\": [\"CLO1\", \"CLO4\"], \"plos\": [\"PLO1\", \"PLO5\"], \"ylos\": [\"YLO2\", \"YLO4\"]}', NULL, NULL, 'active', NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30');

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
(1, NULL, 'ข้อเสนอโครงการวิจัย AI', 'โครงการพัฒนาระบบ AI สำหรับการศึกษา', 'proposal', '2026-06-01', 'approved', '/uploads/docs/ai_proposal.pdf', NULL, NULL, NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(2, NULL, 'รายงานความก้าวหน้า ไตรมาส 1', 'โครงการพัฒนาระบบ AI สำหรับการศึกษา', 'progress', '2026-06-15', 'pending', '/uploads/docs/ai_progress_q1.pdf', NULL, NULL, NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(3, NULL, 'สรุปงบประมาณการจัดซื้ออุปกรณ์', 'โครงการปรับปรุงห้องปฏิบัติการคอมพิวเตอร์', 'financial', '2026-06-20', 'approved', NULL, NULL, NULL, NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(4, NULL, 'รายงานสรุปผลการดำเนินงาน', 'โครงการค่ายอาสาพัฒนาชนบท', 'summary', '2026-06-25', 'pending', '/uploads/docs/camp_summary.pdf', NULL, NULL, NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30'),
(5, NULL, 'ข้อเสนอโครงการประกวดนวัตกรรม', 'โครงการประกวดนวัตกรรมสีเขียว 2026', 'proposal', '2026-07-01', 'pending', NULL, NULL, NULL, NULL, NULL, '2026-07-11 13:34:30', '2026-07-11 13:34:30');

-- --------------------------------------------------------

--
-- Table structure for table `project_outcome_links`
--

CREATE TABLE `project_outcome_links` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `outcome_type` enum('plo','ylo','clo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `outcome_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_outcome_links`
--

INSERT INTO `project_outcome_links` (`id`, `project_id`, `outcome_type`, `outcome_code`, `created_at`) VALUES
(1, 1, 'plo', 'PLO1', '2026-07-11 13:35:04'),
(2, 1, 'plo', 'PLO3', '2026-07-11 13:35:04'),
(3, 2, 'plo', 'PLO2', '2026-07-11 13:35:04'),
(4, 2, 'plo', 'PLO4', '2026-07-11 13:35:04'),
(5, 3, 'plo', 'PLO1', '2026-07-11 13:35:04'),
(6, 3, 'plo', 'PLO5', '2026-07-11 13:35:04'),
(8, 1, 'ylo', 'YLO1', '2026-07-11 13:35:04'),
(9, 1, 'ylo', 'YLO2', '2026-07-11 13:35:04'),
(10, 2, 'ylo', 'YLO3', '2026-07-11 13:35:04'),
(11, 3, 'ylo', 'YLO2', '2026-07-11 13:35:04'),
(12, 3, 'ylo', 'YLO4', '2026-07-11 13:35:04'),
(15, 1, 'clo', 'CLO1', '2026-07-11 13:35:05'),
(16, 1, 'clo', 'CLO2', '2026-07-11 13:35:05'),
(17, 2, 'clo', 'CLO3', '2026-07-11 13:35:05'),
(18, 2, 'clo', 'CLO4', '2026-07-11 13:35:05'),
(19, 3, 'clo', 'CLO1', '2026-07-11 13:35:05'),
(20, 3, 'clo', 'CLO4', '2026-07-11 13:35:05');

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
  `period_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `planned_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `actual_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `logged_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `student_code` varchar(20) NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'เชื่อม Users',
  `program_id` bigint DEFAULT NULL,
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
  `status` enum('Active','Graduted','Dropout','Retired') NOT NULL DEFAULT 'Active',
  `home_phone` varchar(20) DEFAULT NULL COMMENT 'โทรศัพท์บ้าน',
  `home_address` text COMMENT 'ที่อยู่ตามทะเบียนบ้าน',
  `graduation_date` date DEFAULT NULL,
  `dropout_date` date DEFAULT NULL,
  `dropout_reason` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_card_number` varchar(13) DEFAULT NULL,
  `admission_year` int NOT NULL DEFAULT '2567',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `skill_score` decimal(3,2) DEFAULT '0.00' COMMENT 'คะแนนทักษะ',
  `attitude_score` decimal(3,2) DEFAULT '0.00' COMMENT 'คะแนนทัศนคติ',
  `knowledge_score` decimal(3,2) DEFAULT '0.00' COMMENT 'คะแนนความรู้',
  `comm_score` decimal(3,2) DEFAULT '0.00' COMMENT 'คะแนนการสื่อสาร',
  `overall_score` decimal(3,2) DEFAULT '0.00' COMMENT 'คะแนนรวม',
  `last_eval_date` timestamp NULL DEFAULT NULL COMMENT 'วันที่ประเมินล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `student_id`, `student_code`, `user_id`, `program_id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `nickname`, `gender`, `year_level`, `gpa`, `birth_date`, `hometown_province`, `height`, `weight`, `bmi`, `email`, `phone`, `status`, `home_phone`, `home_address`, `graduation_date`, `dropout_date`, `dropout_reason`, `description`, `created_at`, `id_card_number`, `admission_year`, `updated_at`, `skill_score`, `attitude_score`, `knowledge_score`, `comm_score`, `overall_score`, `last_eval_date`) VALUES
(1, 6603400001, 'TEMP-1', NULL, NULL, 'นางสาว', 'ญาณันธร', 'โอนอิง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Dropout', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-07-11 20:20:00', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(3, 6603400002, 'TEMP-2', NULL, NULL, 'นางสาว', 'จุรีพร', 'ผลพรต', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Graduted', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-07-11 20:20:27', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(5, 6603400004, 'TEMP-3', NULL, NULL, 'นางสาว', 'ศิริพรรณ', 'ทองอ่อน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Retired', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-07-11 20:20:32', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(6, 6603400005, 'TEMP-4', NULL, NULL, 'นางสาว', 'ตะวัน', 'รีฮุง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(7, 6603400006, 'TEMP-5', NULL, NULL, 'นางสาว', 'บัณฑิตา', 'ยุดา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(8, 6603400007, 'TEMP-6', NULL, NULL, 'นางสาว', 'ประภาภรณ์', 'จงเจริญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(9, 6603400008, 'TEMP-7', NULL, NULL, 'นางสาว', 'ปวีณา', 'ม่วงชุ่ม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(10, 6603400009, 'TEMP-8', NULL, NULL, 'นางสาว', 'ศินาภรณ์', 'ทองเชิด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(11, 6603400010, 'TEMP-9', NULL, NULL, 'นางสาว', 'กฤตพร', 'รุณรังษี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(14, 6603400011, 'TEMP-10', NULL, NULL, 'ว่าที่ร้อยตรีหญิง', 'ปวีณา', 'เย็นขาว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(15, 6603400012, 'TEMP-11', NULL, NULL, 'นางสาว', 'ศรุตา', 'พันธ์ครู', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(16, 6603400013, 'TEMP-12', NULL, NULL, 'นางสาว', 'ภัคธีมา', 'โลหิตานนท์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(17, 6603400014, 'TEMP-13', NULL, NULL, 'นาย', 'พิพัฒน์', 'คุโนภาต', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(22, 6603400015, 'TEMP-14', NULL, NULL, 'นางสาว', 'ณัฐชา', 'พิณราช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(23, 6603400016, 'TEMP-15', NULL, NULL, 'นาย', 'ณัฐสิทธิ์', 'ปัญญาอุทัย', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(24, 6603400017, 'TEMP-16', NULL, NULL, 'นางสาว', 'จิราวัช', 'พระนา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(25, 6603400018, 'TEMP-17', NULL, NULL, 'นางสาว', 'พลอยชมพู', 'เรืองเดช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(27, 6603400019, 'TEMP-18', NULL, NULL, 'นางสาว', 'ฐานวดี', 'ปุนมาปัด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(28, 6603400020, 'TEMP-19', NULL, NULL, 'นางสาว', 'สุธาสินี', 'สาธุชาติ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(29, 6603400021, 'TEMP-20', NULL, NULL, 'นางสาว', 'ณัฐนันท์', 'ศรีม่วง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(31, 6603400022, 'TEMP-21', NULL, NULL, 'นางสาว', 'โยษิตา', 'จิตรีชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(32, 6603400023, 'TEMP-22', NULL, NULL, 'นางสาว', 'กมลทิพย์', 'อาลัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(34, 6603400024, 'TEMP-23', NULL, NULL, 'นาย', 'มารุต', 'กรุณา', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(35, 6603400025, 'TEMP-24', NULL, NULL, 'นางสาว', 'ณรินทร์ดา', 'วงค์บุญมา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(36, 6603400026, 'TEMP-25', NULL, NULL, 'นางสาว', 'วรัญญา', 'บุญเชิญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(38, 6603400027, 'TEMP-26', NULL, NULL, 'นางสาว', 'กุสุมา', 'สมแวง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(39, 6603400028, 'TEMP-27', NULL, NULL, 'นางสาว', 'จิรฐา', 'พิทักษา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(41, 6603400029, 'TEMP-28', NULL, NULL, 'นางสาว', 'วิลาลักษณ์', 'กล่อมใจ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(42, 6603400030, 'TEMP-29', NULL, NULL, 'นาย', 'นพเกล้า', 'นพพันธ์ศิริ', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(43, 6603400031, 'TEMP-30', NULL, NULL, 'นาย', 'ทัศนา', 'ขันตรี', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(44, 6603400032, 'TEMP-31', NULL, NULL, 'นางสาว', 'สุนันญา', 'มะโนเเสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(45, 6603400033, 'TEMP-32', NULL, NULL, 'นางสาว', 'ศศิวิมล', 'เพ็งอุดม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(46, 6603400034, 'TEMP-33', NULL, NULL, 'นางสาว', 'ณัชชา', 'คุ้มคงกระจ่าง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(48, 6603400035, 'TEMP-34', NULL, NULL, 'นางสาว', 'สุปรียา', 'ศรีละบุตร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(49, 6603400036, 'TEMP-35', NULL, NULL, 'นางสาว', 'ศุภิกา', 'สว่างภพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(55, 6603400037, 'TEMP-36', NULL, NULL, 'นางสาว', 'อรอมล', 'คุณสมบัติ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(66, 6603400038, 'TEMP-37', NULL, NULL, 'นางสาว', 'ปรียานุช', 'ผ่านละคร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(67, 6603400039, 'TEMP-38', NULL, NULL, 'นางสาว', 'ปาริสชา', 'ดอกพุดตาน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(70, 6603400040, 'TEMP-39', NULL, NULL, 'นางสาว', 'นภัสนันท์', 'ดีประชีพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(71, 6603400041, 'TEMP-40', NULL, NULL, 'นางสาว', 'ชลดา', 'อุคำ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(72, 6603400042, 'TEMP-41', NULL, NULL, 'นางสาว', 'อริสา', 'บุญแยง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(73, 6603400044, 'TEMP-42', NULL, NULL, 'นางสาว', 'เพ็ญพิชชา', 'รามศิริ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(78, 6603400046, 'TEMP-43', NULL, NULL, 'นางสาว', 'นริศรา', 'ไทยอุดม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(85, 6603400047, 'TEMP-44', NULL, NULL, 'นาย', 'รัชวัฒน์', 'สุรภีร์', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(86, 6603400048, 'TEMP-45', NULL, NULL, 'นางสาว', 'ขนิษฐา', 'มุธุสิทธิ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(87, 6603400049, 'TEMP-46', NULL, NULL, 'นางสาว', 'วนิชชา', 'นาสานนิวัฒน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(88, 6603400050, 'TEMP-47', NULL, NULL, 'นางสาว', 'ดวงหทัย', 'บัวกล้า', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(89, 6603400051, 'TEMP-48', NULL, NULL, 'นางสาว', 'ปาริชาต', 'เชื้อตาอ่อน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(90, 6603400052, 'TEMP-49', NULL, NULL, 'นางสาว', 'จิราวรรณ', 'พุก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(92, 6603400053, 'TEMP-50', NULL, NULL, 'นางสาว', 'อรนุช', 'เลี่ยนเพชร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(93, 6603400054, 'TEMP-51', NULL, NULL, 'นางสาว', 'วราภรณ์', 'พุ่มแย้ม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(94, 6603400055, 'TEMP-52', NULL, NULL, 'นางสาว', 'ธิดาพร', 'พิกุลทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(95, 6603400056, 'TEMP-53', NULL, NULL, 'นางสาว', 'ณัฐพร', 'พุ่มไสว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(97, 6603400057, 'TEMP-54', NULL, NULL, 'นางสาว', 'ศุภัชญา', 'โพธิ์ทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(98, 6603400058, 'TEMP-55', NULL, NULL, 'นางสาว', 'สุกัญญา', 'ช่องงาม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(104, 6603400061, 'TEMP-56', NULL, NULL, 'นางสาว', 'วิภาดา', 'คิดดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(105, 6603400062, 'TEMP-57', NULL, NULL, 'นาย', 'ธนากร', 'โฆษิวากาญจน์', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(107, 6603400063, 'TEMP-58', NULL, NULL, 'นางสาว', 'ชุติมา', 'หาทรัพย์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(108, 6603400064, 'TEMP-59', NULL, NULL, 'นางสาว', 'ฐิติรัตน์', 'เหล่าสูง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(109, 6603400065, 'TEMP-60', NULL, NULL, 'นางสาว', 'ฌานิศา', 'บุญพุฒ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(110, 6603400066, 'TEMP-61', NULL, NULL, 'นางสาว', 'สิริญญา', 'คำชั่ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(2, 6603400067, 'TEMP-62', NULL, NULL, 'นางสาว', 'ดวงรัตน์', 'ครุฑธา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(4, 6603400068, 'TEMP-63', NULL, NULL, 'นางสาว', 'ณฐินี', 'สายจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(12, 6603400069, 'TEMP-64', NULL, NULL, 'นางสาว', 'กัญชพร', 'สายแปง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(13, 6603400070, 'TEMP-65', NULL, NULL, 'นางสาว', 'นฤมล', 'อ่อนทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(18, 6603400071, 'TEMP-66', NULL, NULL, 'นางสาว', 'นฤมล', 'ทำลา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(19, 6603400072, 'TEMP-67', NULL, NULL, 'นางสาว', 'สุชญา', 'ทองเนื้อแปด', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(20, 6603400073, 'TEMP-68', NULL, NULL, 'นางสาว', 'ศิรประภา', 'เมาตะยา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(21, 6603400074, 'TEMP-69', NULL, NULL, 'นางสาว', 'พลอยชมพู', 'สุยังกูล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(26, 6603400075, 'TEMP-70', NULL, NULL, 'นาย', 'จตุรวิทย์', 'สาแก้ว', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(30, 6603400076, 'TEMP-71', NULL, NULL, 'นางสาว', 'พิลาสินี', 'จิตต์อุทัศน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(33, 6603400077, 'TEMP-72', NULL, NULL, 'นางสาว', 'ธัญณิชา', 'ท่วมไธสง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(37, 6603400078, 'TEMP-73', NULL, NULL, 'นางสาว', 'พิยดา', 'ม่วงสุข', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(40, 6603400079, 'TEMP-74', NULL, NULL, 'นางสาว', 'น้ำมนต์', 'พงษ์บุบผา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(47, 6603400080, 'TEMP-75', NULL, NULL, 'นางสาว', 'ณัฏฐณิชา', 'ภูมิกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(50, 6603400081, 'TEMP-76', NULL, NULL, 'นางสาว', 'เพ็ญนภา', 'ชฎาแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(51, 6603400082, 'TEMP-77', NULL, NULL, 'นางสาว', 'ณิชาพัฒน์', 'จำบุญ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(52, 6603400083, 'TEMP-78', NULL, NULL, 'นางสาว', 'ศุกลภัทร', 'สุพรรณ์คำ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(53, 6603400084, 'TEMP-79', NULL, NULL, 'นาย', 'ศตพล', 'เกษแก้ว', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(54, 6603400085, 'TEMP-80', NULL, NULL, 'นางสาว', 'ดวงพร', 'อาศัยนา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(56, 6603400086, 'TEMP-81', NULL, NULL, 'นางสาว', 'ญาณิน', 'ทินกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(57, 6603400087, 'TEMP-82', NULL, NULL, 'นางสาว', 'ปพิชญา', 'พัวอุดมจินดากุล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(58, 6603400088, 'TEMP-83', NULL, NULL, 'นางสาว', 'สาธิตา', 'ปลอดโปร่ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(59, 6603400090, 'TEMP-84', NULL, NULL, 'นางสาว', 'ภัททิยา', 'บงภูเขียว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(60, 6603400091, 'TEMP-85', NULL, NULL, 'นางสาว', 'ภัทรานิษฐ์', 'แก้ววิชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(61, 6603400092, 'TEMP-86', NULL, NULL, 'นางสาว', 'ไปรยา', 'แสนแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(62, 6603400093, 'TEMP-87', NULL, NULL, 'นางสาว', 'อนุธิดา', 'คำบุตรดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(63, 6603400094, 'TEMP-88', NULL, NULL, 'นางสาว', 'ปาลิดา', 'กล่อมฤกษ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(64, 6603400095, 'TEMP-89', NULL, NULL, 'นางสาว', 'วรรณพร', 'อะโนมา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(65, 6603400096, 'TEMP-90', NULL, NULL, 'นางสาว', 'สุธาสินี', 'โคกวิไล', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(68, 6603400097, 'TEMP-91', NULL, NULL, 'นางสาว', 'อรวรรณ', 'พาบุ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(69, 6603400098, 'TEMP-92', NULL, NULL, 'นางสาว', 'สิริพรรณ', 'บุญช่วย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(74, 6603400099, 'TEMP-93', NULL, NULL, 'นางสาว', 'กฤตยา', 'ปะสาวะเท', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(75, 6603400100, 'TEMP-94', NULL, NULL, 'นางสาว', 'นฤมล', 'สรรพโภชน์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(76, 6603400102, 'TEMP-95', NULL, NULL, 'นางสาว', 'วรัญญา', 'มีประเสริฐ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(77, 6603400104, 'TEMP-96', NULL, NULL, 'นางสาว', 'นันทน์ณัฏฐ์', 'แซ่โซ้ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(79, 6603400105, 'TEMP-97', NULL, NULL, 'นางสาว', 'รวิมล', 'ดวงคำจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(80, 6603400106, 'TEMP-98', NULL, NULL, 'นางสาว', 'กาญจนา', 'ทะวาแสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(81, 6603400107, 'TEMP-99', NULL, NULL, 'นางสาว', 'จิรวรรณ', 'พลชู', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(82, 6603400108, 'TEMP-100', NULL, NULL, 'นางสาว', 'นภสร', 'อินภูวา', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(83, 6603400109, 'TEMP-101', NULL, NULL, 'นางสาว', 'รุ่งนภา', 'ถวิลเดช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(84, 6603400110, 'TEMP-102', NULL, NULL, 'นางสาว', 'วรัทยา', 'คำน้อย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(91, 6603400111, 'TEMP-103', NULL, NULL, 'นางสาว', 'สุกัญญา', 'พรประไพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(96, 6603400112, 'TEMP-104', NULL, NULL, 'นางสาว', 'โชษิตา', 'แม้นอินทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(99, 6603400113, 'TEMP-105', NULL, NULL, 'นางสาว', 'สุภัชชา', 'งามเลิศ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(100, 6603400114, 'TEMP-106', NULL, NULL, 'นางสาว', 'นฤมล', 'ขอดทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(101, 6603400115, 'TEMP-107', NULL, NULL, 'นางสาว', 'พรพิมล', 'สังสีราช', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(102, 6603400116, 'TEMP-108', NULL, NULL, 'นางสาว', 'เปรมิกา', 'โพธิ์ชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(103, 6603400117, 'TEMP-109', NULL, NULL, 'นางสาว', 'นิลุบล', 'นนท์ลุ่น', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(106, 6603400118, 'TEMP-110', NULL, NULL, 'นางสาว', 'นภารัตน์', 'ปุรัมภะ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(111, 6603400119, 'TEMP-111', NULL, NULL, 'นางสาว', 'ธีมาพร', 'สุนทร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(112, 6603400120, 'TEMP-112', NULL, NULL, 'นางสาว', 'ณัฐชา', 'ภูสีดวง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(113, 6603400121, 'TEMP-113', NULL, NULL, 'นางสาว', 'ปวริศา', 'บุตรตะวงค์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(114, 6603400122, 'TEMP-114', NULL, NULL, 'นางสาว', 'นฤมล', 'ขุนภักดี', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(115, 6603400123, 'TEMP-115', NULL, NULL, 'นางสาว', 'กัญญาณัฐ', 'อินต๊ะสาร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(116, 6603400124, 'TEMP-116', NULL, NULL, 'นางสาว', 'จิดาภา', 'ไชยสาร', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(117, 6603400125, 'TEMP-117', NULL, NULL, 'นางสาว', 'จิดาภา', 'เชื้อทอง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(118, 6603400126, 'TEMP-118', NULL, NULL, 'นางสาว', 'นิภาวรรณ', 'สืบทายาท', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(119, 6603400127, 'TEMP-119', NULL, NULL, 'นางสาว', 'นริศรา', 'จวงกระโทก', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(120, 6603400128, 'TEMP-120', NULL, NULL, 'นาย', 'ภาธร', 'ธงศรี', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(121, 6603400129, 'TEMP-121', NULL, NULL, 'นาย', 'ประภวิษณุ์', 'พรหมบุตร', NULL, NULL, NULL, 'ชาย', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(122, 6603400130, 'TEMP-122', NULL, NULL, 'นางสาว', 'ดวงแข', 'สลับแสง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(123, 6603400132, 'TEMP-123', NULL, NULL, 'นางสาว', 'ศิริญญา', 'สุภาพ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(124, 6603400133, 'TEMP-124', NULL, NULL, 'นางสาว', 'ภคมน', 'เชื้อคำเพ็ง', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(125, 6603400134, 'TEMP-125', NULL, NULL, 'นางสาว', 'กรนันท์', 'นันทเสน', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(126, 6603400135, 'TEMP-126', NULL, NULL, 'นางสาว', 'ปรีณาพรรณ', 'ภานุวัฒนวงศ์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(127, 6603400136, 'TEMP-127', NULL, NULL, 'นางสาว', 'หทัยรัตน์', 'ชุมจันทร์', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(128, 6603400137, 'TEMP-128', NULL, NULL, 'นางสาว', 'ชมพูนุช', 'ลาพรม', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(129, 6603400138, 'TEMP-129', NULL, NULL, 'นางสาว', 'ฐิติณัชชา', 'ลาดแก้ว', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(130, 6603400139, 'TEMP-130', NULL, NULL, 'นางสาว', 'โสภิตา', 'แสวงกิจ', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(131, 6603400140, 'TEMP-131', NULL, NULL, 'นางสาว', 'ศรีวิกา', 'โรจน์เจริญชัย', NULL, NULL, NULL, 'หญิง', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2567, '2026-06-27 21:27:39', 0.00, 0.00, 0.00, 0.00, 0.00, NULL);

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
(1, 6603400001, 46172040, 'หลัก', 2567),
(2, 6603400002, 46172040, 'หลัก', 2567),
(3, 6603400004, 46172040, 'หลัก', 2567),
(4, 6603400005, 46172040, 'หลัก', 2567),
(5, 6603400006, 46172040, 'หลัก', 2567),
(6, 6603400007, 46172040, 'หลัก', 2567),
(7, 6603400008, 46172040, 'หลัก', 2567),
(8, 6603400009, 46172040, 'หลัก', 2567),
(16, 6603400010, 41172008, 'หลัก', 2567),
(17, 6603400011, 41172008, 'หลัก', 2567),
(18, 6603400012, 41172008, 'หลัก', 2567),
(19, 6603400013, 41172008, 'หลัก', 2567);

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
(73, '170-462', 'การฝึกปฏิบัติการพยาบาลเลือกสรร', 'Elective Practicum in Nursing', 2, '2(0-8-0)', 'การเลือกฝึกปฏิบัติงานในหอผู้ป่วยหรือสาขาวิชาที่นักศึกษาสนใจเป็นพิเศษ เพื่อเพิ่มพูนทักษะและความมั่นใจก่อนจบการศึกษาเป็นพยาบาลวิชาชีพ', 1, 1, NULL, 'หมวดวิชาเฉพาะเลือก', 4, 2),
(74, '101-111', 'ดกสฟดหก', 'jfkdlaf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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
(13, 'รายงานรายวิชา (มคอ.)', 'course-report', 'FileBarChart', 'COURSE_REPORT_MANAGE', 'งานหลักสูตร', 1),
(14, 'รายงานวิเคราะห์ PLO/YLO', 'plo-ylo-report', 'TrendingUp', 'CURRICULUM_REPORT_VIEW', 'งานหลักสูตร', 1),
(15, 'สรุปข้อมูลสะสม 5 ปี', 'five-year-summary', 'CalendarDays', 'COURSE_REPORT_EXPORT', 'งานหลักสูตร', 1),
(16, 'วิชาที่รับผิดชอบ', 'my-courses', 'BookOpen', 'MY_COURSES_VIEW', 'การจัดการเรียนการสอน', 1),
(17, 'จัดส่งคลังเอกสาร', 'documents', 'FolderPlus', 'DOCUMENTS_MANAGE', 'การจัดการเรียนการสอน', 1),
(18, 'ประเมินผลปฏิบัติการ', 'practical-students', 'FileCheck', 'CLINICAL_STUDENT_VIEW', 'งานปฏิบัติการ', 1),
(19, 'นักศึกษาในความดูแล', 'advises', 'HeartHandshake', 'ADVISOR_STUDENT_VIEW', 'งานที่ปรึกษา', 1),
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
(30, 'แดชบอร์ดอาจารย์', 'teacher-dashboard', 'LayoutDashboard', 'TEACHER_DASHBOARD_VIEW', 'การจัดการเรียนการสอน', 1),
(31, 'รายวิชา', 'courses', 'BookOpen', 'COURSES_VIEW', 'การจัดการเรียนการสอน', 1),
(32, 'จัดการ CLO', 'clo-management', 'Target', 'CLO_MANAGEMENT_VIEW', 'งานหลักสูตร', 1),
(33, 'ผล CLO รายบุคคล', 'course-students', 'Users', 'COURSE_STUDENTS_VIEW', 'การจัดการเรียนการสอน', 1),
(34, 'หลักฐานการฝึกปฏิบัติ', 'evidence', 'FileCheck', 'CLINICAL_EVIDENCE_UPLOAD', 'งานปฏิบัติการ', 1),
(35, 'จัดการผลการเรียน', 'grades', 'GraduationCap', 'GRADES_MANAGE', 'การจัดการเรียนการสอน', 1),
(36, 'ประเมิน Performance', 'performance', 'BarChart3', 'PERFORMANCE_MANAGE', 'งานปฏิบัติการ', 1),
(37, 'รายงานระดับหลักสูตร', 'program-reports', 'FileBarChart', 'PROGRAM_REPORTS_VIEW', 'งานหลักสูตร', 1),
(38, 'ตารางงาน/ภารกิจ', 'schedule-tasks', 'CalendarCheck', 'SCHEDULE_TASKS_MANAGE', 'งานปฏิบัติการ', 1),
(39, 'บันทึกการให้คำปรึกษา', 'advise-notes', 'NotebookPen', 'ADVISE_NOTES_MANAGE', 'งานที่ปรึกษา', 1),
(40, 'แจ้งเตือนที่ปรึกษา', 'advisor-notifications', 'Bell', 'ADVISOR_NOTIFICATION_VIEW', 'งานที่ปรึกษา', 1),
(41, 'รายชื่อนักศึกษา', 'students', 'Users', 'STUDENTS_VIEW', 'งานที่ปรึกษา', 1),
(42, 'ข้อมูลนักศึกษาในที่ปรึกษา', 'students-info', 'UserSearch', 'STUDENTS_INFO_VIEW', 'งานที่ปรึกษา', 1),
(43, 'คำร้องโอนย้าย', 'transfer-requests', 'ArrowRightLeft', 'TRANSFER_REQUESTS_MANAGE', 'งานที่ปรึกษา', 1);

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
(4, '41172011', '$2y$10$3K1ZE8cjAfEJKOeV1CrjJ.XzEObB75V3KBpWjDk/X6DaCg1ihyaiC', 2, '2026-02-14 03:47:25'),
(5, '46172040', '$argon2id$v=19$m=65536,t=4,p=2$NGg3OVphSXFnZXd3ZFhDSQ$hnaWnTLwU18Bt0t0V2cbLQTYcMbtYDXGcaehPqiwtLw', 1, '2026-02-14 16:13:36'),
(6, '41172017', '$argon2id$v=19$m=65536,t=4,p=2$TEl6M0ZneWZIQ3M2aC9KVA$gD3atvhPqWg11/+d1f4RHCSptmHCHwNmPzAAV32XBq0', 2, '2026-02-14 18:02:44'),
(7, '63172133', '$2y$10$X7qXABiTtnCl1xSbziwsc.VkyWBv7sDqou6Iu6ChatJAvoIevCFp6', 2, '2026-03-01 18:20:12'),
(10, '44172033', '$argon2id$v=19$m=65536,t=4,p=2$d1dFb3pZdHFxRnF3UWp5cQ$W8EKtVMyucG1rJbFuesGqWmNgcqZC7Kr+gFNXU1X/Mo', 2, '2026-05-25 17:51:02');

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
(5, 7, 6, 1, NULL, NULL),
(18, 1, 8, 1, NULL, NULL),
(34, 10, 6, 1, NULL, NULL),
(35, 10, 3, 0, NULL, NULL),
(36, 10, 5, 0, NULL, NULL),
(37, 10, 4, 0, NULL, NULL);

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
-- Indexes for table `curriculum_framework`
--
ALTER TABLE `curriculum_framework`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `curriculum_report_stats`
--
ALTER TABLE `curriculum_report_stats`
  ADD PRIMARY KEY (`stat_id`),
  ADD UNIQUE KEY `uq_type_code` (`type`,`code_name`);

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
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `idx_faculty_id_auto` (`id`);

--
-- Indexes for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty_research`
--
ALTER TABLE `faculty_research`
  ADD PRIMARY KEY (`research_id`),
  ADD KEY `faculty_id` (`faculty_id`);

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
  ADD UNIQUE KEY `uq_project_budget_year` (`project_id`,`fiscal_year`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_documents_project_id` (`project_id`);

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
-- Indexes for table `report_import_batches`
--
ALTER TABLE `report_import_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_import_year` (`academic_year`),
  ADD KEY `idx_report_import_source` (`source_type`),
  ADD KEY `idx_report_import_status` (`status`);

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
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `idx_student_id_auto` (`id`);

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
  MODIFY `advice_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `approval_request_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `assessments_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `audit_log_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=330;

--
-- AUTO_INCREMENT for table `curriculum_report_stats`
--
ALTER TABLE `curriculum_report_stats`
  MODIFY `stat_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `faculty_ce_records`
--
ALTER TABLE `faculty_ce_records`
  MODIFY `record_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_research`
--
ALTER TABLE `faculty_research`
  MODIFY `research_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `import_history`
--
ALTER TABLE `import_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `plo`
--
ALTER TABLE `plo`
  MODIFY `plo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `portfolio_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `program`
--
ALTER TABLE `program`
  MODIFY `program_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  MODIFY `project_budget_years_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_documents`
--
ALTER TABLE `project_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `project_outcome_links`
--
ALTER TABLE `project_outcome_links`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `project_participants`
--
ALTER TABLE `project_participants`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_progress_logs`
--
ALTER TABLE `project_progress_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_import_batches`
--
ALTER TABLE `report_import_batches`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  MODIFY `mapping_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  MODIFY `attempt_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_sidebar_menus`
--
ALTER TABLE `system_sidebar_menus`
  MODIFY `menu_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_position`
--
ALTER TABLE `user_position`
  MODIFY `user_position_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

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
  ADD CONSTRAINT `plo_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE;

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
-- Constraints for table `project_budget_years`
--
ALTER TABLE `project_budget_years`
  ADD CONSTRAINT `project_budget_years_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD CONSTRAINT `fk_project_documents_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

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
-- Constraints for table `student_advisor_mapping`
--
ALTER TABLE `student_advisor_mapping`
  ADD CONSTRAINT `student_advisor_mapping_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `Student_License_Attempts`
--
ALTER TABLE `Student_License_Attempts`
  ADD CONSTRAINT `student_license_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

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
