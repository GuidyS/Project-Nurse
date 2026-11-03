# วิเคราะห์ตารางที่ควรลบออกจากฐานข้อมูล (Clean Data)

> ⚠️ **เอกสารนี้ถูกแก้ไขภายหลัง — อ่าน [`db-cleanup-review.md`](db-cleanup-review.md) ควบคู่กันเสมอ**
>
> การทบทวนรอบสองพบว่า **3 ตารางในกลุ่ม A ด้านล่างลบไม่ได้** คือ
> `project_participants`, `project_satisfaction_responses`, `student_project_outcome_results`
> เพราะ `delete_project.php` ยังสั่ง `DELETE` ตารางเหล่านั้นอยู่ ถ้าลบทิ้ง หน้า "ลบโครงการ"
> จะพัง HTTP 500 (ยืนยันจากการทดสอบจริงแล้ว) — `db-cleanup.sql` ปิด 3 บรรทัดนั้นไว้ให้แล้ว
>
> จำนวนที่ลบได้จริงจึงเป็น **13 ตาราง (74 → 61)** ไม่ใช่ 16 ตารางตามที่เขียนไว้เดิม

**วันที่ตรวจ:** 12 ตุลาคม 2569
**ฐานข้อมูลที่ใช้ตรวจ:** `MYSQL_DATABASE` บนเครื่อง dev (Docker) — snapshot ที่ import ไว้เมื่อ 7 ต.ค.
**โค้ดที่ใช้เทียบ:** `main` ล่าสุด (commit `84ea8da`, main 0.0.7) merge เข้ากับ `test-branch`

## สรุปสั้น

ตอนนี้มี **74 ตาราง** ตรวจแล้วพบว่า **16 ตารางไม่มีโค้ดเรียกใช้เลย** ลบได้ → เหลือ 58 ตาราง

| กลุ่ม | จำนวน | ลักษณะ |
| --- | --- | --- |
| A. ลบได้ทันที | 11 | ไม่มีโค้ดเรียก + ไม่มีข้อมูล (0 แถว) + ไม่มีตารางอื่นอ้างถึง |
| B. ลบได้ แต่ควร export เก็บก่อน | 5 | ไม่มีโค้ดเรียก แต่ยังมีข้อมูลค้างอยู่ |
| C. ต้องตัดสินใจก่อน | 5 | มีเงื่อนไข — อ่านรายละเอียดข้างล่าง |
| D. เก็บไว้ | 53 | ใช้งานจริง |

> **นอกจากนี้ยังมีอีก 1 ฐานข้อมูลทั้งก้อน** ชื่อ `chk_db` (73 ตาราง 3.8 MB) ที่เป็นสำเนาโครงสร้างเดียวกับ `MYSQL_DATABASE` ทั้งหมด ถ้าไม่มีใครใช้ ลบทิ้งทีเดียวจะได้พื้นที่มากกว่าการไล่ลบตารางด้วยซ้ำ — **ถามในทีมก่อนว่าเป็นของใคร**

---

## วิธีตรวจ

1. ดึงรายชื่อตารางทั้งหมด + จำนวนแถว + ความสัมพันธ์ FK จาก `information_schema`
2. ไล่หาชื่อตารางทุกตัวในโค้ด backend (`components/`, `config/`, `index.php`) เฉพาะที่อยู่ในบริบท SQL จริง (`FROM` / `JOIN` / `INSERT INTO` / `UPDATE` / `DELETE FROM` / `CREATE TABLE`) ไม่นับที่ปรากฏในคอมเมนต์หรือข้อความ
3. แยกว่าตารางนั้น "ถูกอ่าน" "ถูกเขียน" หรือ "มีแค่คำสั่งลบตอนลบ record แม่"
4. เช็ค FK ย้อนกลับว่ามีตารางอื่นอ้างถึงหรือไม่ เพื่อกำหนดลำดับการลบ

**ทดสอบสคริปต์แล้ว** — copy ฐานข้อมูลทั้งก้อนไปเป็น DB ชั่วคราว แล้วรัน `db-cleanup.sql` กับตัวสำเนา
ผลคือลบผ่านหมดไม่ติด FK ตารางลดจาก 74 เหลือ 58 ตามที่ตั้งใจ จากนั้นลบ DB ชั่วคราวทิ้ง
**ฐานข้อมูลจริงไม่ถูกแตะเลย**

---

## กลุ่ม A — ลบได้ทันที (11 ตาราง)

ทั้งหมด **0 แถว**, **ไม่มีโค้ดอ้างถึง**, **ไม่มีตารางอื่นอ้างถึง**

| ตาราง | เหตุผล |
| --- | --- |
| `assessments` | ของเก่าในสาย PLO/YLO รุ่นแรก ถูกแทนด้วย `curriculum_*` แล้ว |
| `student_performance` | หน้า "ภาระงาน/ผลงาน" ใช้ `approval_requests` + `student` แทน ไม่เคยแตะตารางนี้ |
| `Student_License_Attempts` | ไม่มีฟีเจอร์ไหนเขียน (ชื่อตารางสะกดต่างจากตารางอื่นทั้งระบบด้วย) |
| ~~`project_participants`~~ | ⚠️ **ห้ามลบ** — `delete_project.php` ยังอ้างถึง ดู `db-cleanup-review.md` |
| ~~`project_satisfaction_responses`~~ | ⚠️ **ห้ามลบ** — คำสั่ง `DELETE` ตอนลบโครงการจะ error ทันที |
| ~~`student_project_outcome_results`~~ | ⚠️ **ห้ามลบ** — เหตุผลเดียวกัน |
| `faculty_ce_records` | ไม่มีฟีเจอร์รองรับ |
| `research_journals` | สาย "วารสาร/ผลงานตีพิมพ์" รุ่นเก่า ระบบจริงใช้ `faculty_research` |
| `research_publications` | เหมือนกัน |
| `research_publication_authors` | เหมือนกัน |
| `advisor_transfer_request` | หน้า "คำขอย้ายอาจารย์ที่ปรึกษา" ถูกลบออกใน main 0.0.7 แล้ว (ทั้ง backend และ frontend) |

## กลุ่ม B — ลบได้ แต่ควร export เก็บก่อน (5 ตาราง)

ไม่มีโค้ดอ้างถึงแล้ว แต่ยังมีข้อมูลค้าง ถ้าลบคือหายถาวร

| ตาราง | แถว | เหตุผล |
| --- | --- | --- |
| `sub_plo` | 263 | Sub PLO รุ่นเก่า ย้ายไป `curriculum_sub_plo` แล้ว |
| `student_competency_assessments` | 26 | ผลประเมินสมรรถนะที่เคยกรอกมือ ตอนนี้ระบบคำนวณจากคะแนนรายวิชาแทน |
| `curriculum_report_stats` | 9 | สถิติรายงานหลักสูตรที่ไม่มีหน้าไหนอ่าน |
| `plo` | 8 | PLO รุ่นเก่า ย้ายไป `curriculum_plo` แล้ว |
| `ylo` | 4 | YLO รุ่นเก่า ตอนนี้ YLO = `year_level` ใน `curriculum_sub_plo` |

> **ลำดับการลบสำคัญ:** `assessments` → `ylo` → `plo` เพราะผูก FK กันเป็นลูกโซ่ (`ylo → plo`, `assessments → ylo`) ถ้าลบสลับลำดับ MySQL จะปฏิเสธ

## กลุ่ม C — ต้องตัดสินใจก่อน (5 ตาราง)

| ตาราง | แถว | ประเด็น |
| --- | --- | --- |
| `competency_items` | 55 | **อย่าเพิ่งลบ** — เป็นต้นทางของการย้ายข้อมูลไป `curriculum_sub_plo` เครื่อง dev นี้ย้ายเสร็จแล้ว (มี flag `outcomes.sub_plo_from_competency_items` ใน `system_settings`) แต่ถ้าเครื่องอื่นหรือ DB จริงยังไม่ได้เปิดระบบหลังอัปเดต การย้ายจะยังไม่เกิด ลบได้ต่อเมื่อทุกเครื่องมี flag นี้แล้ว |
| `grades` | 4 | หน้า Dean Dashboard ยังอ่านอยู่ แต่ไม่มีที่ไหนเขียนแล้ว (ระบบตัด flow เกรดออกไปตาม AGENTS.md) → ต้องเลือกว่า "ตัดโค้ดที่อ่านทิ้งแล้วลบตาราง" หรือ "เก็บไว้" |
| `student_clo_results` | 0 | เหมือน `grades` — Dean Dashboard อ่านแต่ไม่มีใครเขียน ของจริงคะแนนไปอยู่ `student_clo_sub_scores` แล้ว ตอนนี้ dashboard ส่วนนี้จึงขึ้นค่าว่าง |
| `schema_migrations` | 6 | เป็นสมุดบันทึก migration แต่ไม่มีโค้ดอ่านหรือเขียนเลย มีแค่ชื่ออยู่ในลิสต์ของ `schema_audit.php` |
| `program` / `role` | 1 / 3 | ไม่มี query ตรง ๆ แต่เป็นปลายทาง FK ของ `student`, `subject`, `users` → **ห้ามลบ** ถ้าจะลบต้องรื้อ FK และคอลัมน์ด้วย ไม่คุ้ม |

---

## ขั้นตอนที่แนะนำ

1. **สำรองก่อน** (บังคับ)
   ```bash
   docker exec db mysqldump -uroot -pMYSQL_ROOT_PASSWORD MYSQL_DATABASE > backup-before-cleanup.sql
   ```
2. **export เฉพาะ 5 ตารางกลุ่ม B** เผื่อต้องย้อนดูข้อมูลเก่า
   ```bash
   docker exec db mysqldump -uroot -pMYSQL_ROOT_PASSWORD MYSQL_DATABASE sub_plo plo ylo student_competency_assessments curriculum_report_stats > legacy-tables-archive.sql
   ```
3. รัน [`db-cleanup.sql`](db-cleanup.sql) (ลบกลุ่ม A + B ตามลำดับที่ถูกต้อง)
4. แก้โค้ด 1 จุดตามข้อ "สิ่งที่ต้องแก้ในโค้ดด้วย" ข้างล่าง
5. เปิดระบบไล่เช็คทีละ role ว่าไม่มีหน้าไหนพัง

---

## สิ่งที่ต้องแก้ในโค้ดด้วย

`backend/src/components/Admin/SchemaAudit/schema_audit.php` มีลิสต์ "ตารางที่ต้องมี" ซึ่งยังระบุ `advisor_transfer_request` และ `project_participants` อยู่ ถ้าลบตารางแล้วไม่แก้ลิสต์นี้ หน้าตรวจ schema จะรายงานว่า "ตารางหาย" ทั้งที่ตั้งใจลบ

---

## เรื่องอื่นที่เจอระหว่างตรวจ (ไม่ใช่เรื่องตาราง แต่เกี่ยวกับ Clean Data)

### 1. เมนู 4 รายการชี้ไปหน้าที่ถูกลบไปแล้ว

main 0.0.7 ลบฟีเจอร์ 4 ตัวออกทั้ง backend และ frontend แต่แถวในตาราง `system_sidebar_menus` ยังอยู่ ผู้ใช้ที่มีสิทธิ์จะเห็นเมนูแล้วกดเข้าไปเจอหน้าว่าง

| menu_id | url | สิทธิ์ |
| --- | --- | --- |
| 13 | `course-report` | COURSE_REPORT_MANAGE |
| 14 | `plo-ylo-report` | CURRICULUM_REPORT_VIEW |
| 37 | `program-reports` | PROGRAM_REPORTS_VIEW |
| 43 | `transfer-requests` | TRANSFER_REQUESTS_MANAGE |

คำสั่งปิดเมนูอยู่ท้ายไฟล์ `db-cleanup.sql` (ปิดด้วย `is_active = 0` ไม่ได้ลบแถว เผื่อทีมจะเอาฟีเจอร์กลับมา)

### 2. มี 5 ตารางที่โค้ด main 0.0.7 ต้องใช้ แต่ DB เครื่องนี้ไม่มี

ฟีเจอร์ใหม่ของ main 0.0.7 อ้างถึงตารางเหล่านี้ ถ้า DB ไหนไม่มี หน้าที่เกี่ยวข้องจะ error

| ตาราง | ไฟล์ที่ใช้ |
| --- | --- |
| `faculty_personnel_development` | `ProfilePage/get_profile.php`, `ProfilePage/manage_faculty_extras.php` |
| `faculty_teaching_workloads` | เหมือนกัน |
| `practice_locations` | `PracticeLocations/practice_locations_api.php` |
| `student_course_registrations` | `Student/Transcript/transcript_api.php` |
| `student_term_grades` | `Student/Transcript/transcript_api.php` |

น่าจะอยู่ใน dump ล่าสุดของคนที่ทำฟีเจอร์นี้อยู่แล้ว — **ก่อน clean data ขอ dump ตัวล่าสุดมาเทียบอีกรอบ** เพราะ snapshot ที่ผมตรวจคือของวันที่ 7 ต.ค. ถ้า DB จริงมีตารางเพิ่มจากนี้ ผลวิเคราะห์กลุ่ม A/B อาจต้องตรวจซ้ำ

> `student_plo_mapping_records` ไม่ต้องห่วง — โค้ดสร้างให้เองอัตโนมัติด้วย `CREATE TABLE IF NOT EXISTS`

### 3. ตาราง `faculty_research` ขาด 7 คอลัมน์ที่ main 0.0.7 ต้องใช้

ยืนยันด้วยการรัน smoke test ทั้ง 156 เคส มี 2 เคสที่ขึ้น HTTP 500 คือ `get-research-summary` (role teacher และ dean)
สาเหตุคือโค้ดใหม่ `SELECT` คอลัมน์ที่ DB ชุดนี้ยังไม่มี:

`work_category`, `funding_type`, `funding_source`, `funding_amount`, `irb_approved`, `intellectual_property_status`, `award_name`

เป็นอาการเดียวกับข้อ 2 (DB เครื่องนี้เก่ากว่าโค้ด) ไม่ใช่บั๊กของโค้ด แต่ยืนยันอีกครั้งว่า **ต้องใช้ dump ล่าสุดเป็นตัวตั้งต้นในการ clean data**

---

## ตารางที่ใช้งานจริง (เก็บไว้ทั้งหมด)

**ผู้ใช้/สิทธิ์:** `users`, `role`, `position`, `position_permission`, `permissions`, `user_position`, `system_sidebar_menus`, `audit_log`

**คน:** `student`, `faculty`, `degree`, `program`, `student_advisor_mapping`, `advice_log`

**หลักสูตร:** `curriculum_framework`, `curriculum_cycle`, `curriculum_cycle_subject`, `curriculum_plo`, `curriculum_sub_plo`, `curriculum_clo`, `curriculum_clo_plo`, `curriculum_clo_sub_plo`, `curriculum_subject_plo`, `curriculum_subject_meta`, `curriculum_ylo_plo`, `curriculum_documents`, `subject`, `enrollment`, `student_clo_sub_scores`, `tqf_documents`

**โครงการ:** `project`, `project_budget_years`, `project_documents`, `project_faculty_members`, `project_outcome_links`, `project_progress_logs`, `project_end_reminders`

**รายงาน/นำเข้า:** `report_import_batches`, `annual_project_report_items`, `annual_project_report_budgets`, `annual_project_report_documents`, `import_history`

**นักศึกษา:** `portfolio`, `student_health_records`, `student_vaccinations`, `schedule_tasks`

**อื่น ๆ:** `notifications`, `notification_hidden`, `user_notification_settings`, `approval_requests`, `faculty_research`, `faculty_license_reminders`, `system_settings`, `system_job_runs`
