-- MySQL dump 10.13  Distrib 9.7.1, for Linux (x86_64)
--
-- Host: localhost    Database: MYSQL_DATABASE
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'cf009881-6f96-11f1-bdb3-fa9585fa8570:1-805';

--
-- Table structure for table `Student_License_Attempts`
--

DROP TABLE IF EXISTS `Student_License_Attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Student_License_Attempts` (
  `attempt_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `subject_code` varchar(50) DEFAULT NULL COMMENT 'วิชาที่สอบ',
  `exam_date` date DEFAULT NULL COMMENT 'วันที่สอบ',
  `result` varchar(50) DEFAULT NULL COMMENT 'ผลสอบ (ผ่าน/ไม่ผ่าน)',
  `attempt_number` int DEFAULT NULL COMMENT 'สอบครั้งที่เท่าไหร่',
  PRIMARY KEY (`attempt_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_license_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Student_License_Attempts`
--

LOCK TABLES `Student_License_Attempts` WRITE;
/*!40000 ALTER TABLE `Student_License_Attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `Student_License_Attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_ce_records`
--

DROP TABLE IF EXISTS `faculty_ce_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_ce_records` (
  `record_id` bigint NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint NOT NULL,
  `activity_name` text COMMENT 'ชื่อกิจกรรมที่ไปอบรม',
  `credits` float DEFAULT NULL COMMENT 'หน่วยกิต/ชั่วโมงที่ได้',
  `result` varchar(255) DEFAULT NULL,
  `date_attended` date DEFAULT NULL COMMENT 'วันที่ไป',
  PRIMARY KEY (`record_id`),
  KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_ce_records`
--

LOCK TABLES `faculty_ce_records` WRITE;
/*!40000 ALTER TABLE `faculty_ce_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_ce_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_research`
--

DROP TABLE IF EXISTS `faculty_research`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_research` (
  `research_id` bigint NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint NOT NULL COMMENT 'เจ้าของผลงาน',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่องานวิจัย',
  `publication_year` int DEFAULT NULL COMMENT 'ปีที่ตีพิมพ์',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ประเภท (วิจัยสถาบัน, วิจัยชุมชน)',
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Path ไฟล์ PDF',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`research_id`),
  KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_research`
--

LOCK TABLES `faculty_research` WRITE;
/*!40000 ALTER TABLE `faculty_research` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_research` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_performance`
--

DROP TABLE IF EXISTS `student_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_performance`
--

LOCK TABLES `student_performance` WRITE;
/*!40000 ALTER TABLE `student_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_performance` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-13 11:16:12
