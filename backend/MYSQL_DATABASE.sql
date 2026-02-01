-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jan 30, 2026 at 01:26 PM
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
-- Table structure for table `degree`
--

CREATE TABLE `degree` (
  `id` int NOT NULL,
  `degree_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_uni` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_faculty` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_year` year NOT NULL,
  `degree_rank` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `id` int NOT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `faculty` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name_th` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name_th` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name_en` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name_en` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `gender` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `birth_date` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `license_no` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `member_no` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `position` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `other_degrees***` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `degrees` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `is_course_leader` tinyint(1) NOT NULL DEFAULT '0',
  `is_program_leader` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `assign_duration` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('Active','Retire','OnLeave') COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `gender`, `birth_date`, `license_no`, `member_no`, `email`, `phone`, `role`, `position`, `other_degrees***`, `degrees`, `is_course_leader`, `is_program_leader`, `start_date`, `assign_duration`, `status`, `description`, `created_at`, `updated_at`) VALUES
('41172008', 'นาง', 'จรัสดาว', 'เรโนลด์', 'Jaratdao', 'N/A', 'female', '15/4/2511', '4511059407', '', '2', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '15/3/2541', '27 ปี ', '', 'มี 2 นามสกุล', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('41172011', 'นางสาว', 'พิชาภรณ์ ', 'จันทนกุล', 'Pichaporn', 'Janthanakul', 'female', '27/7/2515', '4511036515', '50436', '3', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/6/2541', '27 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('41172017', 'นางสาว', 'อรทิพา', 'ส่องศิริ', 'Orntipa', 'Songsiri', 'female', '22/7/2494', '4511016150', '', '1', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/10/2537', '31 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('42172021', 'นาง', 'วัฒนีย์ ', 'ปานจินดา', 'Wattanee', 'Panjinda', 'female', '17/8/2498', '4511077074', 'อ.1/1710', '4', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/1/2542', '26 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('42172025', 'นาง', 'ปรียธิดา', 'ชลศึกเสนีย์', 'N/A', 'N/A', 'female', '31/7/2509', '4511055442', '', '5', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/7/2542', '26 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('44172033', 'นางสาว', 'ภัทรพร', 'อรัณยภาค', 'N/A', 'Arunyaphaga', 'female', '16/2/2496', '4511016607', '', '6', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '16/10/2544', '24 ปี ', '', 'ชื่อภัทรา หรือ ภัทรพร', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('45172037', 'นาง', 'สุสารี', 'ประคินกิจ', 'Susaree', 'Prakhinkit', 'female', '25/1/2518', '4511005639', '', '7', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/11/2545', '23 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('46172038', 'นางสาว', 'สมฤดี', 'ชื่นกิติญานนท์', 'N/A', 'N/A', 'female', '9/5/2518', '4611093778', '', '8', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/12/2545', '22 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('46172040', 'พ.จ.อ.', 'ภูมเดชา', 'ชาญเบญจพิภู', 'N/A', 'N/A', 'male', '7/4/2507', '4521050682', '', '9', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/3/2546', '22 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('47172044', 'นาง', 'สุวรรณา', 'เชียงขุนทด', 'Suwanna', 'N/A', 'female', '1/2/2516', '4511007784', '', '10', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/5/2547', '21 ปี ', '', 'เปลี่ยนนามสกุล', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('47172046', 'นาง', 'วารุณี', 'เพไร', 'Warunee', 'N/A', 'female', '6/8/2519', '4711186486', '47789', '11', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/6/2547', '21 ปี ', '', 'เปลี่ยนนามสกุล', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('47172047', 'นางสาว', 'ชนิดา', 'มัททวางกูร', 'Chanida', 'Mattavangkul', 'female', '21/9/2514', '4511069513', '', '12', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/7/2547', '21 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('47172049', 'นางสาว', 'ศนิกานต์', 'ศรีมณี', 'N/A', 'N/A', 'female', '1/3/2518', '4511078893', '', '13', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/10/2547', '21 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('49172053', 'นาง', 'พรพิมล', 'ภูมิฤทธิกุล', 'N/A', 'N/A', 'female', '20/4/2502', '5511168672', '', '15', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '16/3/2549', '19 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('49172054', 'นางสาว', 'สุนันทา', 'บุญรักษา', 'N/A', 'N/A', 'female', '10/5/2518', '5311108587', '', '16', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/8/2549', '19 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('51172062', 'นางสาว', 'เพ็ญรุ่ง', 'นวลแจ่ม', 'N/A', 'N/A', 'female', '20/1/2516', '6611103761', '76117', '17', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/8/2551', '17 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('52172066', 'นาง', 'ธารทิพย์', 'จิรกัญจนะ', 'Tharnthip', 'Jirakanjana', 'female', '15/2/2518', '4511034476', '', '18', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/11/2552', '16 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('54172071', 'นางสาว', 'วราภรณ์', 'คำรศ', 'Waraporn', 'Khamros', 'female', '9/8/2526', '6411198208', '115533', '20', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/12/2553', '14 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('54172075', 'นางสาว', 'สิริณัฐ', 'สินวรรณกุล', 'Sirinut', 'Sinvonnagul', 'female', '11/9/2512', '4511070793', '', '19', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/9/2553', '15 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('54172078', 'รอ.หญิง', 'วิภานันท์', 'ม่วงสกุล', 'Wipanun', 'Muangsakul', 'female', '27/4/2520', '4711178169', '', '21', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/5/2554', '14 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('54172084', 'นางสาว', 'ธัญลักษณ์วดี', 'ก้อนทองถม', 'N/A', 'N/A', 'female', '15/9/2529', '5211209369', '137583', '22', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/10/2554', '14 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('54172085', 'นางสาว', 'อัมพร', 'คงจีระ', 'Amporn', 'Kongjeera', 'female', '16/4/2494', '4511002485', '', '23', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/12/2554', '13 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('56172088', 'นาง', 'วิวรรณา', 'คล้ายคลึง', 'N/A', 'N/A', 'female', '7/10/2516', '4511013331', '55314', '24', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/3/2556', '12 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('56172089', 'นางสาว', 'สุจิตราภรณ์', 'ทับครอง', 'N/A', 'N/A', 'female', '2/10/2508', '4511050062', '', '25', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/5/2556', '12 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('56172103', 'นางสาว', 'รัฐกานต์', 'ขำเขียว', 'N/A', 'N/A', 'female', '10/12/2527', '5111205212', '', '27', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/7/2556', '12 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('56172104', 'นางสาว', 'ณิชมล', 'ขวัญเมือง', 'N/A', 'N/A', 'female', '19/3/2515', '5011200055', '47562', '26', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/7/2556', '12 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('57172108', 'นางสาว', 'นฤมล', 'อังศิริศักดิ์', 'N/A', 'N/A', 'female', '4/2/2528', '5011200055', '126375', '28', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/4/2557', '11 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('57172109', 'นางสาว', 'ดวงกมล', 'วิรุฬห์อุดมผล', 'N/A', 'N/A', 'female', '22/4/2509', '5711254926', '', '29', 'N/A', 'user', 'ผศ.', 'N/A', 'N/A', 0, 0, '1/6/2557', '11 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('58172110', 'นางสาว', 'สุกฤตา', 'ตะการีย์', 'N/A', 'N/A', 'female', '26/1/2523', '4811193884', '115510', '30', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '15/1/2558', '10 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('58172114', 'นางสาว', 'ศิริพร', 'สามสี', 'Siriporn', 'Samsri', 'female', '13/3/2512', '4511075055', '', '31', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/10/2558', '10 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('59172119', 'นาย', 'ชัยสิทธิ์', 'ทันศึก', 'N/A', 'N/A', 'male', '30/4/2515', '4311158065', '', '35', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/10/2559', '9 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('59172120', 'นาง', 'พิไลพรรณ', 'แก้วแก่นตา', 'N/A', 'N/A', 'female', '13/1/2519', '4511032299', '74109', '34', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/5/2559', '9 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('59172121', 'พ.ต.อ.หญิง', 'ระชี', 'ดิษฐจร', 'Rachee', 'Ditachorn', 'female', '16/11/2498', '4511012136', '', '36', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/11/2559', '9 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('60172123', 'นางสาว', 'ขวัญเรือน', 'ก๋าวิตู', 'N/A', 'N/A', 'female', '19/6/2528', '5111207345', '129959', '37', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/2/2560', '8 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('63172128', 'นาย', 'เรวัต', 'แย้มสุดา', 'Raywat', 'Yaemsuda', 'male', '28/4/2502', '4521023170', 'อ.1/21510', '39', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '2/1/2563', '5 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('63172129', 'นางสาว', 'รัตนาภรณ์', 'นิวาศานนท์', 'N/A', 'N/A', 'female', '24/3/2535', '5811261753', '', '38', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/2/2562', '6 ปี ', '', 'เปลี่ยนนามสกุล', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('63172131', 'นางสาว', 'พาจนา', 'ดวงจันทร์', 'N/A', 'N/A', 'female', '29/4/2510', '4511050318', '', '14', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/2/2548', '20 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('63172132', 'นาง', 'บัวทิพย์', 'เพ็งศรี', 'Buatip', 'Phengsri', 'female', '17/10/2513', '4511048575', '', '32', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/10/2558', '10 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('63172133', 'นางสาว', 'พรรณี', 'ตรังคสันต์', 'N/A', 'N/A', 'female', '27/2/2511', '4511050332', '', '33', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '10/10/2558', '10 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('64172139', 'นางสาว', 'สุภาภรณ์', 'ศรีฟ้า', 'Supaporn', 'Srifa', 'female', '12/11/2528', '5111207470', '', '40', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/3/2564', '4 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('65172142', 'นาง', 'อัจรา', 'ฐิตวัฒนกุล', 'N/A', 'N/A', 'female', '13/9/2530', '5311218207', '', '41', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/8/2565', '3 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('66172148', 'นาง', 'รุ่งนภา', 'พรหมแย้ม', 'N/A', 'N/A', 'female', '3/5/2506', '4511053132', '', '43', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/12/2566', '1 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
('66712147', 'นางสาว', 'เกวลี', 'เชียรวิชัย', 'N/A', 'N/A', 'female', '6/9/2533', '5611243227', '164439', '42', 'N/A', 'user', 'อาจารย์', 'N/A', 'N/A', 0, 0, '1/11/2566', '2 ปี ', '', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `other_degree`
--

CREATE TABLE `other_degree` (
  `id` int NOT NULL,
  `degree_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_uni` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_faculty` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `grad_year` year NOT NULL,
  `degree_rank` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plo`
--

CREATE TABLE `plo` (
  `id` smallint NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `sub_plo_id` smallint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `description`) VALUES
(1, 'คณบดี', NULL),
(2, 'อาจารย์ประจำ', NULL),
(3, 'อาจารย์ประจำหลักสูตร', NULL),
(4, 'อาจารย์ที่ปรึกษา', NULL),
(5, 'อาจารย์ภาคปฏิบัติ', NULL),
(6, 'อาจารย์ผู้รับผิดชอบหลักสูตร', NULL),
(7, 'อาจารย์ผู้รับผิดชอบโครงการ', NULL),
(8, 'อาจารย์สมมติ', NULL),
(9, 'นักศึกษา', NULL),
(10, 'เลขา/เจ้าหน้าที่', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `position_permissions`
--

CREATE TABLE `position_permissions` (
  `position_id` int DEFAULT NULL,
  `permission_name` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `position_permissions`
--

INSERT INTO `position_permissions` (`position_id`, `permission_name`) VALUES
(1, 'dashboard.main.view'),
(1, 'report.finance_sensitive.view'),
(1, 'dashboard.main.export'),
(1, 'dashboard.notification.manage'),
(2, 'teaching.students.view_own'),
(2, 'teaching.students.export_own'),
(2, 'grade.own_course.update'),
(2, 'notification.students.send'),
(2, 'report.course_ploylo.view_own'),
(2, 'course.documents.upload'),
(8, 'public.info.view'),
(4, 'advising.students.view_own'),
(4, 'advising.advice_note.update'),
(4, 'advising.notification.manage'),
(4, 'advising.files.upload'),
(4, 'advising.assign.request'),
(7, 'project.own.view'),
(7, 'project.document.create'),
(7, 'project.document.update'),
(7, 'project.document.upload'),
(7, 'project.own.edit'),
(7, 'project.plo_ylo_clo.link'),
(7, 'project.report.create'),
(7, 'project.report.export'),
(3, 'curriculum.course_students.view'),
(3, 'curriculum.course_grade.define'),
(3, 'curriculum.course_grade.update'),
(3, 'curriculum.clo.define'),
(3, 'curriculum.clo.update'),
(3, 'curriculum.course_report.create'),
(6, 'curriculum.plo_ylo_clo.view_all_years'),
(6, 'curriculum.clo_map.edit'),
(6, 'curriculum.summary_5y.export'),
(6, 'curriculum.course_instructor.manage'),
(5, 'practicum.students.view'),
(5, 'practicum.performance.update'),
(5, 'practicum.tasks.assign'),
(5, 'practicum.evidence.upload'),
(10, 'system.data.crud'),
(10, 'system.roles.manage'),
(10, 'system.data.import'),
(10, 'system.data.export'),
(10, 'system.requests.approve'),
(10, 'system.audit_log.view'),
(10, 'system.management_report.create'),
(10, 'system.notification.manage'),
(9, 'student.profile.view_self'),
(9, 'student.portfolio.upload'),
(9, 'student.records.export'),
(9, 'student.notification.receive');

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

CREATE TABLE `program` (
  `id` bigint NOT NULL,
  `program_name_th` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `program_name_en` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `program_year` int NOT NULL,
  `created_at` date NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'SuperAdmin'),
(2, 'Admin'),
(3, 'Teacher'),
(4, 'Student');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int DEFAULT NULL,
  `permission_name` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_name`) VALUES
(1, 'profile.view'),
(1, 'profile.edit'),
(1, 'course.view'),
(1, 'course.create'),
(1, 'course.modify'),
(1, 'course.approve'),
(1, 'grade.view'),
(1, 'grade.edit'),
(1, 'user.manage'),
(1, 'settings.manage'),
(2, 'profile.view'),
(2, 'course.view'),
(2, 'course.create'),
(2, 'course.modify'),
(2, 'course.approve'),
(2, 'grade.view'),
(2, 'grade.edit'),
(2, 'user.manage'),
(3, 'profile.view'),
(3, 'profile.edit'),
(3, 'course.view'),
(3, 'course.create'),
(3, 'course.modify'),
(3, 'grade.view'),
(3, 'grade.edit'),
(4, 'profile.view'),
(4, 'course.view'),
(4, 'grade.view'),
(1, 'system.data.crud'),
(1, 'system.roles.manage'),
(1, 'system.data.import'),
(1, 'system.data.export'),
(1, 'system.requests.approve'),
(1, 'system.audit_log.view'),
(1, 'system.management_report.create'),
(1, 'system.notification.manage'),
(3, 'teacher.profile.view_self'),
(4, 'student.profile.view_self');

-- --------------------------------------------------------

--
-- Table structure for table `section`
--

CREATE TABLE `section` (
  `id` smallint NOT NULL,
  `section_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `credit` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section`
--

INSERT INTO `section` (`id`, `section_name`, `credit`) VALUES
(1, 'วิชาทั่วไป', 27),
(2, 'วิชาเฉพาะ', 96),
(3, 'วิชาเลือกเสรี', 6);

-- --------------------------------------------------------

--
-- Table structure for table `select_subject`
--

CREATE TABLE `select_subject` (
  `id` smallint NOT NULL,
  `select_subject_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `select_subject`
--

INSERT INTO `select_subject` (`id`, `select_subject_name`) VALUES
(1, 'บังคับ'),
(2, 'เลือก'),
(3, 'ทฤษฎี'),
(4, 'ปฏิบัติ');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` bigint NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `gender` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `position` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('Active','Graduated','Withdraw','Dropped') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Active',
  `status_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_reason` text COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `title`, `first_name`, `last_name`, `gender`, `role`, `position`, `status`, `status_date`, `status_reason`, `description`) VALUES
(6604800003, 'นางสาว', 'พรณุมาศ', 'อ่อนน้อม', 'female', 'user', 'student', 'Dropped', '2025-12-02 19:42:36', '', ''),
(6604800008, 'นางสาว', 'อาภัสรา', 'เนตรสัก', 'female', 'user', 'student', 'Withdraw', '2025-12-02 19:52:38', '', ''),
(6604800015, 'นางสาว', 'สิมิลัน', 'วิยาภรณ์', 'other', 'user', '', 'Withdraw', '2025-12-03 16:25:36', '', ''),
(6703400001, 'นาย', 'เกตุกิตติ', 'ดอกคำ', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400003, 'นางสาว', 'ญาตาวี', 'นามวงศ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400004, 'นางสาว', 'พัชรพร', 'พาแก้ว', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400005, 'นางสาว', 'ชนินาถ', 'ไกรสีทุม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400006, 'นางสาว', 'ณัฏฐธิดา', 'อินเพ็ญ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400007, 'นางสาว', 'กมลลักษณ์', 'พันลา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400008, 'นางสาว', 'ชาลิณี', 'น้อยจันทร์วงษ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400009, 'นางสาว', 'สุภาวดี', 'มณีจันทร์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400010, 'นางสาว', 'ปาลิตา', 'ประนิล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400011, 'นางสาว', 'ปิยพร', 'ผลดี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400013, 'นางสาว', 'ชัญญภัทร', 'บุญเรือ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400014, 'นางสาว', 'จิรวรรณ', 'ไชยดำ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400015, 'นางสาว', 'กชพรรณ', 'ทัพที', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400016, 'นางสาว', 'ทัศน์วรรณ', 'ภารวงค์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400017, 'นางสาว', 'สุธาธิณี', 'สุขเกษม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400018, 'นางสาว', 'ลักษิกา', 'เจษฎาลักษณ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400019, 'นางสาว', 'รุจีรัตน์', 'ทับไกร', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400020, 'นางสาว', 'วรัทยา', 'มะปะเภา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400021, 'นางสาว', 'วนันท์ชนา', 'แท่นเกิด', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400022, 'นาย', 'มนัญชัย', 'ไชยยอดแก้ว', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400023, 'นางสาว', 'สุกัญญา', 'สังข์คำ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400024, 'นางสาว', 'พิริษา', 'คุณนา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400025, 'นางสาว', 'วชิรา', 'เสนารินทร์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400026, 'นางสาว', 'ชาคริยา', 'นิลสินที', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400027, 'นางสาว', 'ชัญญา', 'ฉายพึ่ง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400028, 'นางสาว', 'กัลยารัตน์', 'พุ่มพวง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400029, 'นางสาว', 'กัญญารัตน์', 'เอียดนุช', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400030, 'นางสาว', 'ญาณินท์', 'ลักษณประวัติ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400031, 'นางสาว', 'รัญชนา', 'พรมทา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400032, 'นางสาว', 'จิรัชญา', 'ชายสงคราม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400033, 'นาย', 'ระพีพัฒน์', 'บุญชู', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400034, 'นาย', 'ธนภัทร์', 'ปทุมเพชร', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400035, 'นางสาว', 'อดิศา', 'กองทอง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400036, 'นาย', 'กฤตเมธ', 'อิฐรงค์', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400037, 'นางสาว', 'ธนาพร', 'สังข์ทอง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400038, 'นางสาว', 'หญิง', 'สาระพันธ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400039, 'นางสาว', 'นิลรดา', 'ปทุมเพชร', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400040, 'นางสาว', 'นัทธมน', 'ปองไป', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400041, 'นางสาว', 'เมริษา', 'เรียงเงิน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400042, 'นางสาว', 'ธัญชนก', 'เวียงนนท์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400043, 'นางสาว', 'สมฤทัย', 'ญาติโสม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400044, 'นางสาว', 'สุนิสา', 'ใยโนนตาด', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400045, 'นางสาว', 'จิราพร', 'คุ้มเขตต์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400046, 'นางสาว', 'สรัญรัชญ์', 'วีระเดช', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400047, 'นางสาว', 'กมลชนก', 'เพชรคง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400048, 'นางสาว', 'ชาลิสา', 'สุขแก่น', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400049, 'นางสาว', 'ไข่มุก', 'ชมภูบุตร', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400050, 'นางสาว', 'อาริยา', 'เวียงวิเศษ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400052, 'นางสาว', 'ลภัสรดา', 'บุญศิลธรรม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400053, 'นางสาว', 'รัชนีพร', 'สวมเเก้ว', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400054, 'นางสาว', 'ชวินนุช', 'โมสืบแสน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400056, 'นาย', 'ก้องภพ', 'กุลจิราชานนท์', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400057, 'นางสาว', 'สุภาภรณ์', 'กำรัมย์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400058, 'นาย', 'พงศธร', 'ชาญณรงค์', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400059, 'นาย', 'โดมินิก', 'ลีราซัน', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400060, 'นางสาว', 'อาทิตยา', 'โง่นแน่น', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400061, 'นางสาว', 'ขวัญจิรา', 'นามโยธา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400062, 'นางสาว', 'กุลธิดา', 'ร่างเจริญ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400063, 'นางสาว', 'กฤติมาพร', 'ดานชัยภูมิ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400064, 'นางสาว', 'ปวีณ์ธิดา', 'อิ่มศิริ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400065, 'นางสาว', 'ณัฐธิดา', 'แปลงดี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400066, 'นางสาว', 'อรทัย', 'บุตรดาวงษ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400067, 'นางสาว', 'รติกานต์', 'เทียบทับ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400068, 'นางสาว', 'เสฏฐิกัลยา ', 'เผ่าเพ็ง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400069, 'นางสาว', 'แพรวา', 'แดงอุทัย', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400070, 'นางสาว', 'ณัฐณิชา', 'เชิงไกรยัง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400071, 'นางสาว', 'ภัทรพร', 'สืบวสุธากุล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400072, 'นางสาว', 'วรัญญา', 'มะติยะภักดิ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400073, 'นางสาว', 'วรวรรณ', 'ช่อมะลิ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400074, 'นางสาว', 'ไปรยา', 'ซื่อสัตย์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400075, 'นางสาว', 'วราภรณ์', 'ชูรัตน์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400076, 'นาย', 'ณัฐพงษ์', 'ซ่อนกลิ่น', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400077, 'นางสาว', 'อภิญญา', 'ไวว่อง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400078, 'นางสาว', 'ปวีณา', 'เกิดกระโทก', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400079, 'นาย', 'ภาณุพงค์', 'แก้วพานิช', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400080, 'นางสาว', 'ปิ่นวณัฐ', 'สมสาย', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400081, 'นางสาว', 'นิรัตชา', 'มิตมาต', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400082, 'นางสาว', 'ปณิตา', 'อ้นสุวรรณ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400083, 'นาย', 'กรพิพิชช์', 'วศินะเมฆินทร์', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400084, 'นางสาว', 'ดาราพร', 'เอกปัญญากุล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400085, 'นางสาว', 'ธิดารัตน์', 'แสวงผล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400086, 'นางสาว', 'ชลธิชา', 'ชมภูนุช', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400087, 'นางสาว', 'เกศวรินทร์', 'ลาภเกิด', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400088, 'นางสาว', 'สุภาพร', 'โคตรวงทอง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400089, 'นางสาว', 'ทักษพร', 'พิมโกทา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400090, 'นางสาว', 'อารยา', 'สุภาพ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400091, 'นางสาว', 'ลฎาภา', 'หอมสกุล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400092, 'นางสาว', 'ชลิสา', 'บุญส่ง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400093, 'นางสาว', 'วัชนิดา', 'เตียวสกุล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400094, 'นางสาว', 'สุดารัตน์', 'ช่วยบำรุง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400095, 'นางสาว', 'จุไรรัตน์', 'สุมาริธรรม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400096, 'นางสาว', 'พัชชาภา', 'ฦาชา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400097, 'นางสาว', 'จุฬาลักษณ์', 'สหุนัน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400098, 'นางสาว', 'นันท์มนัส', 'ทิพย์เจริญศรี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400099, 'นางสาว', 'ญาณิศา', 'คอกขุนทด', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400100, 'นางสาว', 'จีรภรณ์', 'นิลสว่าง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400101, 'นางสาว', 'กุลยา', 'ครูพิพรม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400102, 'นางสาว', 'กมลวรรณ', 'พวงทาผา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400103, 'นางสาว', 'อริสา', 'รองทอง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400104, 'นางสาว', 'สวรส', 'โตใหญ่', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400105, 'นางสาว', 'สุทธิกานต์', 'สังข์วีระ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400106, 'นางสาว', 'ธันยพร', 'ภากัน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400107, 'นางสาว', 'อโรชา', 'เวฬุวนารักษ์', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400109, 'นางสาว', 'ภาวิณี', 'ยัดดี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400110, 'นางสาว', 'เจนจิรา', 'เที่ยงภักดี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400111, 'นางสาว', 'ปานระพี', 'ชูศรีทอง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400112, 'นางสาว', 'กัญญาพัชร', 'ปุยเงิน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400114, 'นางสาว', 'พิมพ์ลภัส', 'ศรียา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400115, 'นางสาว', 'ภัทราพร', 'ศรีชนะ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400116, 'นางสาว', 'ณัฐนันท์', 'แก้วประสาน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400117, 'นางสาว', 'นพวรรณ', 'บุญลคร', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400118, 'นางสาว', 'วาสนา', 'ระยับศรี', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400120, 'นางสาว', 'ปุณณนุช', 'จาบกัน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400121, 'นางสาว', 'วรัทยา', 'เหลือผล', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400122, 'นางสาว', 'อินทิรา', 'มาลำโกน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400123, 'นางสาว', 'เยาวลักษณ์', 'ทรงถิ่น', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400124, 'นางสาว', 'ปณิตา', 'ไตรโสม', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400125, 'นาย', 'ธนภัทร', 'บุตรละคร', 'male', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400126, 'นางสาว', 'กชกร', 'ไทรสังขเชวงสิน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400128, 'นางสาว', 'โยษิตา', 'ปัดเทสัง', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400129, 'นางสาว', 'ธัญพร', 'เมียงแก', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400130, 'นางสาว', 'ธัญชนก', 'แสงเงิน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400131, 'นางสาว', 'ภัทราพร', 'พลทำ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400132, 'นางสาว', 'ประวรรณรัตน์', 'โคคำ', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400133, 'นางสาว', 'พิชญาภา', 'ดิษประธูป', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400134, 'นางสาว', 'อรวรา', 'พรหมพุทธา', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', ''),
(6703400135, 'นางสาว', 'กาญจนพัฒน์', 'สระทองเทียน', 'female', 'user', '', 'Active', '2025-11-21 07:06:39', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` bigint NOT NULL,
  `section_id` smallint NOT NULL,
  `subject_group_id` smallint NOT NULL,
  `select_subject_id` smallint NOT NULL,
  `subject_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `subject_name_th` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `subject_name_en` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `credit` int NOT NULL,
  `detail` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_group`
--

CREATE TABLE `subject_group` (
  `id` smallint NOT NULL,
  `subject_group_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `credit` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_group`
--

INSERT INTO `subject_group` (`id`, `subject_group_name`, `credit`) VALUES
(1, 'languege', 6),
(2, 'century21', 6),
(3, 'entrepreneurship', 6);

-- --------------------------------------------------------

--
-- Table structure for table `sub_plo`
--

CREATE TABLE `sub_plo` (
  `id` smallint NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `subject_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role_id`, `created_at`) VALUES
(1, '41172008', '$2y$10$qdiWZO/kpfluM2k8BNbQFOICYuGbQYdVGFKd4lwvfP6rozGhAAzci', 3, '2026-01-08 13:37:00'),
(2, '6604800003', '$2y$10$6HQSmvzsj4Z8d6Hixq0jUOLpxiDMXqInuykOJogtnT8nhG5PmcuoK', 4, '2026-01-08 15:08:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `degree`
--
ALTER TABLE `degree`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- Indexes for table `other_degree`
--
ALTER TABLE `other_degree`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plo`
--
ALTER TABLE `plo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `position_permissions`
--
ALTER TABLE `position_permissions`
  ADD KEY `position_id` (`position_id`);

--
-- Indexes for table `program`
--
ALTER TABLE `program`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `section`
--
ALTER TABLE `section`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `select_subject`
--
ALTER TABLE `select_subject`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `FK_section` (`section_id`),
  ADD KEY `FK_select_subject` (`select_subject_id`),
  ADD KEY `FK_subject_group` (`subject_group_id`),
  ADD KEY `FK_program` (`id`);

--
-- Indexes for table `subject_group`
--
ALTER TABLE `subject_group`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_plo`
--
ALTER TABLE `sub_plo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_subject` (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `position_permissions`
--
ALTER TABLE `position_permissions`
  ADD CONSTRAINT `position_permissions_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `FK_program` FOREIGN KEY (`id`) REFERENCES `program` (`id`),
  ADD CONSTRAINT `FK_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`id`),
  ADD CONSTRAINT `FK_select_subject` FOREIGN KEY (`select_subject_id`) REFERENCES `select_subject` (`id`),
  ADD CONSTRAINT `FK_subject_group` FOREIGN KEY (`subject_group_id`) REFERENCES `subject_group` (`id`);

--
-- Constraints for table `sub_plo`
--
ALTER TABLE `sub_plo`
  ADD CONSTRAINT `FK_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
