-- ============================================================
-- Clean Data: ลบตารางที่ไม่มีโค้ดเรียกใช้แล้ว
-- อ้างอิงผลวิเคราะห์: docs/db-cleanup-analysis.md (12 ต.ค. 2569)
--
-- !! อ่าน docs/db-cleanup-review.md ก่อน !!
--   การทบทวนรอบสองพบว่า 3 ตารางในกลุ่ม A ลบไม่ได้ (comment ไว้ให้แล้วข้างล่าง)
--   เพราะ delete_project.php ยังสั่ง DELETE ตารางเหล่านั้นอยู่ ถ้าลบทิ้งหน้า
--   "ลบโครงการ" จะพัง HTTP 500 — ยืนยันจากการทดสอบจริงแล้ว
--
-- !! ก่อนรัน ให้ backup ก่อนเสมอ !!
--   docker exec db mysqldump -uroot -pMYSQL_ROOT_PASSWORD MYSQL_DATABASE > backup-before-cleanup.sql
--
-- !! กลุ่ม B มีข้อมูลค้างอยู่ ให้ export เก็บก่อน !!
--   docker exec db mysqldump -uroot -pMYSQL_ROOT_PASSWORD MYSQL_DATABASE \
--     sub_plo plo ylo student_competency_assessments curriculum_report_stats \
--     > legacy-tables-archive.sql
-- ============================================================

USE MYSQL_DATABASE;

-- ------------------------------------------------------------
-- กลุ่ม A — ไม่มีโค้ดเรียก + 0 แถว + ไม่มีตารางอื่นอ้างถึง
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `student_performance`;
DROP TABLE IF EXISTS `Student_License_Attempts`;
-- 3 บรรทัดนี้ถูกปิดไว้หลังทบทวนรอบสอง — ดู docs/db-cleanup-review.md
-- DROP TABLE IF EXISTS `project_participants`;
-- DROP TABLE IF EXISTS `project_satisfaction_responses`;
-- DROP TABLE IF EXISTS `student_project_outcome_results`;
DROP TABLE IF EXISTS `faculty_ce_records`;
DROP TABLE IF EXISTS `research_publication_authors`;   -- ลบก่อน research_publications
DROP TABLE IF EXISTS `research_publications`;
DROP TABLE IF EXISTS `research_journals`;
DROP TABLE IF EXISTS `advisor_transfer_request`;       -- ฟีเจอร์ถูกลบใน main 0.0.7

-- ------------------------------------------------------------
-- กลุ่ม B — ไม่มีโค้ดเรียกแล้ว แต่ยังมีข้อมูลค้าง (export ก่อน!)
-- ลำดับสำคัญ: assessments -> ylo -> plo (ผูก FK กันเป็นลูกโซ่)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `assessments`;                    -- 0 แถว, FK -> student, ylo
DROP TABLE IF EXISTS `ylo`;                            -- 4 แถว, FK -> plo
DROP TABLE IF EXISTS `plo`;                            -- 8 แถว, FK -> program
DROP TABLE IF EXISTS `sub_plo`;                        -- 263 แถว, ไม่มี FK
DROP TABLE IF EXISTS `student_competency_assessments`; -- 26 แถว
DROP TABLE IF EXISTS `curriculum_report_stats`;        -- 9 แถว

-- ------------------------------------------------------------
-- ปิดเมนูที่ชี้ไปหน้าที่ถูกลบไปแล้วใน main 0.0.7
-- (ปิดด้วย is_active = 0 ไม่ลบแถว เผื่อเอาฟีเจอร์กลับมา)
-- ------------------------------------------------------------
UPDATE `system_sidebar_menus`
   SET `is_active` = 0
 WHERE `url` IN ('course-report', 'plo-ylo-report', 'program-reports', 'transfer-requests');

-- ------------------------------------------------------------
-- ตรวจผล
-- ------------------------------------------------------------
SELECT COUNT(*) AS tables_remaining
  FROM information_schema.tables
 WHERE table_schema = 'MYSQL_DATABASE';   -- ควรเหลือ 58 จากเดิม 74

-- ============================================================
-- ยังไม่รวมในสคริปต์นี้ ต้องให้ทีมตัดสินใจก่อน (ดูกลุ่ม C ในไฟล์วิเคราะห์)
--   competency_items     -> ลบได้ต่อเมื่อทุกเครื่องย้ายข้อมูลไป curriculum_sub_plo แล้ว
--   grades               -> Dean Dashboard ยังอ่านอยู่ แต่ไม่มีใครเขียน
--   student_clo_results  -> Dean Dashboard ยังอ่านอยู่ แต่ไม่มีใครเขียน
--   schema_migrations    -> สมุดบันทึก migration ที่ไม่มีโค้ดใช้
--   program / role       -> ห้ามลบ เป็นปลายทาง FK ของ student/subject/users
-- ============================================================
