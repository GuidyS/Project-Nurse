-- =====================================================================
--  DB Cleanup Phase 4 (ตาม dbcleanup.md) — รันบน dump 12-7-2569
--  Phase 1-3 ทีมทำไปแล้วใน dump นี้ (approval รวมเป็น payload_json,
--  avisor_notifications ยุบเข้า notifications, portfolio backup ถูกลบ)
--
--  Phase 4: ลบตารางว่างที่ไม่มีโค้ดอ้างอิง (ตรวจโค้ดแล้ว 2026-07-13):
--   - Student_License_Attempts : ไม่มีโค้ดอ้าง, ว่าง, ชื่อผิด convention (plan: drop)
--   - faculty_ce_records       : ไม่มีโค้ดอ้าง, ว่าง (plan: drop)
--   - faculty_research         : ไม่มีโค้ดอ้าง, ว่าง (plan: drop)
--   - student_performance      : ไม่มีโค้ดอ้าง — Performance API ใช้ approval_requests
--                                + คอลัมน์สรุปใน student (latest-only) (plan: drop)
--  คงไว้: assessments (ProgramReports ใช้), degree (one-to-many ต่อ faculty ตามแผน),
--         project_budget_years/participants/progress_logs (โค้ด Project ใช้),
--         annual_project_report_* + report_import_batches (ห้ามยุบตามแผน),
--         user_notification_settings (NotificationPage ใช้),
--         role/permission/position/user ทั้งหมด (ห้ามแตะตามคำสั่ง)
-- =====================================================================
USE `MYSQL_DATABASE`;

DROP TABLE IF EXISTS `Student_License_Attempts`;
DROP TABLE IF EXISTS `faculty_ce_records`;
DROP TABLE IF EXISTS `faculty_research`;
DROP TABLE IF EXISTS `student_performance`;

SELECT COUNT(*) AS tables_after FROM information_schema.tables WHERE table_schema = 'MYSQL_DATABASE';
