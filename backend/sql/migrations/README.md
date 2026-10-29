# Project row ID

Apply `2026-10-25-project-id-auto-increment.sql` manually before deploying the
updated Project endpoints to an existing database. It assumes the supplied
`MYSQL_DATABASE.sql` structure is already installed: `project.id` is the primary
key, `project.project_id` is unique, and child tables reference `project_id`.
The migration only enables `AUTO_INCREMENT` on `project.id`; it does not renumber
existing records or change child keys. A fresh installation from the updated
dump already contains this change.

Project creation and imports now require a nonempty, unique text `project_id`.
Imports update existing projects by this code, never by project name. Do not add
the internal `id` column to import templates. The project code cannot be edited
after creation. Project progress tables are no longer required; reports use
the shared annual budget details (with `project_budget_years` as a calculated cache),
and project completion uses `project.status`.

## Remove the English project name

Deploy code that no longer reads or writes `project.project_name_en`, then apply
`2026-10-25-drop-project-name-en.sql` once to an existing database. This migration
intentionally deletes the column and its contents. It does not rename or
overwrite `project_name_th`, change project identifiers, or change child tables.
A fresh installation from `MYSQL_DATABASE.sql` already omits the column.

Project APIs use `project_name_th` for the project name. Older payloads and import
files may still contain `project_name_en`; the extra field is ignored and is not
stored. New CSV/XLSX imports do not require it, and exports never include it.
If a legacy project has no name, screens show `โครงการ #<project_id>`.

Validate migrations against DDL-only disposable databases and synthetic records.
Run frontend lint/build and PHP syntax checks, and verify create/update, import,
export, project documents, PLO/CLO, reminders, and dean dashboards. Do not use
real dump rows or send reminder email during tests.

## รวมโครงการและรายงาน (2026-10-26)

ฐานใหม่ใช้ DDL ใน `MYSQL_DATABASE.sql` ซึ่งมีเฉพาะงบเสนอ/งบใช้จริงในโมเดลใช้งาน
ห้ามนำ INSERT จาก dump จริงไปใช้ทดสอบ ฐานเดิมต้องผ่าน migration
`2026-10-26-unified-projects.sql` หนึ่งครั้ง หลังตรวจชื่อ foreign key และสำรองฐานตามขั้นตอนของผู้ดูแล
DDL ของ MySQL มี implicit commit จึงควรหยุดการเขียนระหว่างปรับ schema และคืน backup
หาก migration ไม่ครบ ห้ามรันไฟล์ซ้ำทั้งชุดโดยไม่ตรวจ schema ที่ทำสำเร็จแล้ว

migration นี้เปลี่ยน `project_id` ใน project และตารางลูกทั้งห้าเป็น VARCHAR(100)
collation `utf8mb4_0900_as_ci` รักษา PK ตัวเลขและกฎ FK เดิม รหัสตัวเลขเดิมกลายเป็นข้อความ
รหัสใหม่รักษาศูนย์นำหน้า ไม่แยกตัวพิมพ์ใหญ่เล็ก และแก้รหัสหลังสร้างไม่ได้
ปีงบประมาณของข้อมูลใหม่ตรงกับปีการศึกษา แต่ข้อมูลเก่าต่างปียังคงอยู่เพื่อให้ตรวจย้าย
XLSX ควรกำหนดคอลัมน์รหัสเป็น Text ก่อนกรอก ระบบ Export เขียนรหัสเป็นเซลล์ข้อความ

ตารางเชื่อม `project_report_links` จับคู่ master กับแถวโครงการรายงานแบบหนึ่งต่อหนึ่ง
กิจกรรมคง `parent_item_id` และ ID เดิม งบรายละเอียดอยู่ใน
`annual_project_report_budgets` แยก proposed/actual และแหล่งเงิน
`project_budget_years` เป็นยอดสรุปที่ระบบคำนวณ ห้ามแก้ยอดสรุปโดยตรง
ยอดโครงการรวมกิจกรรมแล้ว ยอดกิจกรรมต้องไม่เกินยอดแม่แยกตามประเภทและแหล่งเงิน
ไม่มีเงื่อนไขให้งบใช้จริงต้องต่ำกว่างบเสนอ ส่วนต่างอาจติดลบได้
ช่องว่างหมายถึงยังไม่ระบุ ระบบไม่มีขั้นตอนอนุมัติ และรายงานนับเอกสารครบจากเอกสารงบประมาณและสรุปโครงการที่แนบจริง

### ตรวจย้ายข้อมูลเดิม

1. แอดมินเปิด **รายงานงบประมาณและโครงการ → เปิดหน้าตรวจย้าย** แล้วเลือกปี
2. เลือก master หรือสร้างรหัสใหม่ จากนั้นเลือกรายงานต้นฉบับและจับคู่อาจารย์ด้วยตนเอง
   ตรวจปี รหัส ชื่อ ผู้รับผิดชอบ และกิจกรรม ห้ามตัดสินจากชื่อเพียงอย่างเดียว
   กิจกรรมที่ไม่มีแม่หรือมีแม่เป็นกิจกรรมอยู่ในคิวแยก ให้เลือกโครงการแม่อย่างชัดเจน
3. ตรวจยอดเดิมทีละรายการ เลือกยืนยันเป็นงบเสนอเมื่อยอดตรงกัน หรือเก็บในประวัติพร้อมเหตุผล
   ต้องยืนยันการกระทบยอดใช้จริงเสมอ ใส่ยอดที่ตรวจแล้วในรายละเอียดงบด้านล่าง
   หากยอดต้นฉบับเป็นคนละปี ให้สร้าง/เลือก master ของปีนั้นและระบุรหัสปลายทาง
   ระบบไม่ย้ายงบจัดสรรไปเป็นงบเสนอ ไม่รวมยอดสองชุด และไม่ทับยอดโดยอัตโนมัติ
4. ตรวจแหล่งเงิน งบกิจกรรม วัตถุประสงค์ KPI ลำดับ และลิงก์/วันที่เอกสารเดิม แล้วกดยืนยัน
   การจับคู่ งบ กิจกรรม เอกสาร และประวัติการตัดสินใจบันทึกใน transaction เดียว
   รหัสที่ยังมีต้นฉบับเงินรอตรวจหรือยังไม่มีคู่จะไม่ปรากฏในยอดรายงานใหม่
5. หลังคิวปีนั้นว่าง ให้ยืนยันเปิดใช้ข้อมูลร่วมรายปี หรือเลือกยืนยันปิดรอบเป็นประวัติ
   ปีข้อมูลเก่าจะอยู่สถานะ `review` จนกว่าจะยืนยัน จึงยังไม่มีการเผยแพร่ยอดใหม่
   กดยืนยันปิดรอบ เพื่อเก็บ snapshot อ่านอย่างเดียว
   backend บล็อกการแก้ master กิจกรรม งบ เอกสาร และ PLO/CLO ของปีที่ปิด
   รายงานเก็บชื่อผู้รับผิดชอบ ณ วันปิดรอบด้วย ไม่มีปุ่มเปิดรอบกลับ
6. เมื่อทุกรายการทุกปีตรวจครบ กด **ตรวจและจบการย้ายข้อมูลเดิมทั้งหมด**
   backend จะถอด `budget_allocated` จากตารางใช้งาน เฉพาะเมื่อไม่มีต้นฉบับหรือคู่รอตรวจเหลือ
   ต้นฉบับและคำตัดสินคงอยู่ใน `project_merge_audit` ไม่ลบ Audit, Import history หรือประวัติอนุมัติ

ช่วงตรวจย้ายยังคงคอลัมน์เก่าสำหรับรักษาต้นฉบับ แต่ไม่มี API หรือหน้าฟอร์มใช้งานยอดดังกล่าว
นอกจากหน้าตรวจย้าย ไม่ควรถอดคอลัมน์ด้วยมือก่อนจบการตรวจ
คำสั่งการเปลี่ยนแปลงในหน้าตรวจย้ายจำกัดเฉพาะ Admin/SuperAdmin ตาม role เดิมของระบบ

### ยุติ workflow อนุมัติ (26 ตุลาคม 2569)

หน้าและปุ่มอนุมัติถูกถอดออก API เดิมตอบ HTTP 410 รวมถึงการยืนยันรับรองหลักฐาน
ตาราง `approval_requests` และ audit log เดิมเก็บไว้เป็นประวัติ ไม่มี API อ่านหรือเขียนตารางนี้แล้ว
ไม่ต้องรัน migration สำหรับการยุติ workflow และไม่ต้องเปลี่ยนข้อมูลจริง
เอกสารเดิมประเภท `approved_budget` ถูกอ่านเป็นเอกสารงบประมาณ ส่วนเอกสารใหม่ใช้ `budget_document`
snapshot รายงานปีที่ปิดแล้วแสดงเอกสารเดิมโดยไม่ใช้สถานะอนุมัติและไม่เปลี่ยนยอดเงินที่เก็บไว้
Import/export ใช้ตัวตรวจสิทธิ์จาก `backend/src/config/admin_access.php` โดยคงขอบเขต role เดิม
ข้อมูลผ่าน IRB ในงานวิจัยยังคงเป็นข้อเท็จจริงจากหน่วยงานภายนอก ไม่ใช่ workflow ภายใน
ไม่ได้เพิ่มสิทธิ์ Teacher/Student หรือ flow เกรด/คะแนน

## Remove project descriptions (2026-10-26)

Deploy the updated Project APIs, then apply `2026-10-26-drop-project-description.sql`
to the backend database. It removes `project.description` and its contents, and can
be applied again safely. Fresh `MYSQL_DATABASE.sql` already omits this column.
Project IDs, foreign keys, strategy, report plans/objectives/KPI and budget notes
are unchanged. Existing CSV/XLSX files may retain a `description` column; project
imports ignore it, while new exports omit it. Historical audit and closed snapshots
remain immutable; Project catalogue responses omit the retired field even when
reading an older snapshot. Verify CRUD, both import formats, exports and closed
snapshots against a DDL-only disposable database before applying to application data.

## Stable project activity codes (2026-10-27)

Apply `2026-10-27-add-project-activity-code.sql` to an existing database during a
write pause immediately before enabling code that requires `activity_code`. The
migration is idempotent: it adds the case-insensitive text column,
backfills existing activity rows with `LEGACY-<id>`, and adds a unique key scoped to
`parent_item_id`. It does not change activity IDs, parents, budgets, documents, report
links, snapshots, or project codes. Do not apply it to the application database
automatically; first verify it on a DDL-only disposable database.

New project Excel templates use `project_id + activity_code` as the stable activity
identity. Missing rows never delete projects, activities, budget sources, or members.
Closed report years remain read-only and old one-sheet project imports remain accepted.
