# ทบทวนรายการตารางที่จะลบ — มุมมองแดชบอร์ดคณบดี

**วันที่ทบทวน:** 12 ตุลาคม 2569
**อ้างอิง:** [`db-cleanup-analysis.md`](db-cleanup-analysis.md), [`db-cleanup.sql`](db-cleanup.sql), dump `MYSQL_DATABASE.sql` (12 ต.ค., ก่อน commit main 0.0.7) และโค้ด `main` 0.0.7
**เอกสารประกอบ:** [`Dean-Dashboard-Proposal.docx`](Dean-Dashboard-Proposal.docx) (ข้อเสนอหน้าคณบดี 10 หน้า), [`future-tables-schema.sql`](future-tables-schema.sql)

## สรุปสั้น

ไฟล์ `db-cleanup-analysis.md` เสนอให้ลบ 16 ตาราง (กลุ่ม A + B) ผลการทบทวนเพื่อเผื่อการใช้งานกับแดชบอร์ดคณบดีในอนาคต:

| ผลการทบทวน | จำนวน | ตาราง |
| --- | --- | --- |
| ✅ **เปลี่ยนเป็นเก็บไว้** | 4 | `project_participants`, `project_satisfaction_responses`, `student_project_outcome_results`, `schema_migrations` |
| 🗂️ ลบได้ แต่เก็บโครงสร้างไว้ในไฟล์ | 7 | `Student_License_Attempts`, `faculty_ce_records`, `research_journals`, `research_publications`, `research_publication_authors`, `advisor_transfer_request`, `curriculum_report_stats` |
| 🗑️ ลบได้ (มีของใหม่แทนแล้ว) | 6 | `assessments`, `student_performance`, `plo`, `ylo`, `sub_plo`, `student_competency_assessments` |
| 🔧 ลบได้หลังแก้โค้ด | 2 | `student_clo_results`, `grades` |
| ⏳ ลบเมื่อทุกเครื่องย้ายข้อมูลแล้ว | 1 | `competency_items` |
| 🔒 ห้ามลบ | 2 | `program`, `role` |

**ลบในรอบนี้ 13 ตาราง** (74 → 61) และลบเพิ่มอีก 3 ตารางเมื่อแก้โค้ดและย้ายข้อมูลครบ (61 → 58)

> ยอดสุดท้ายยังเป็น 58 ตารางเท่ากับไฟล์เดิม แต่สลับชุด: **เก็บ 3 ตารางโครงการไว้** และลบ `grades`, `student_clo_results`, `competency_items` แทน หลังแก้โค้ดที่อ้างถึงแล้ว

---

## หลักคิด

1. **ตารางที่ว่าง (0 แถว) และไม่มีโค้ดเรียกใช้ ลบไปก็ไม่เสียข้อมูล** สิ่งที่หายมีแค่โครงสร้าง ซึ่งเก็บเป็นไฟล์ได้ จึงไม่ต้องเก็บตารางค้างไว้ในฐานข้อมูลเผื่ออนาคต
2. โครงสร้างของตารางที่อาจได้ใช้อีกถูกเก็บไว้ใน [`future-tables-schema.sql`](future-tables-schema.sql) แล้ว (CREATE TABLE + Index + FK) ถ้าต้องการใช้ ให้รันเฉพาะตารางนั้น
3. ตารางที่ **มีข้อมูลค้าง** ต้อง export ก่อนลบเสมอ
4. ตารางที่ **ตรงกับตัวชี้วัดที่แดชบอร์ดคณบดีต้องใช้ และโค้ดยังอ้างถึงอยู่** ให้เก็บไว้ในฐานข้อมูล

---

## ✅ เปลี่ยนเป็นเก็บไว้ (4 ตาราง)

| ตาราง | กลุ่มเดิม | แถว | เหตุผล |
| --- | --- | --- | --- |
| `project_participants` | A | 0 | จำนวนนักศึกษาที่เข้าร่วมโครงการเป็นตัวชี้วัด QA ของโครงการและกิจกรรมพัฒนานักศึกษา `project_faculty_members` เก็บเฉพาะอาจารย์ จึงใช้แทนกันไม่ได้ |
| `project_satisfaction_responses` | A | 0 | ทุกโครงการต้องรายงาน % ความพึงพอใจ และ `delete_project.php` ยังอ้างถึงตารางนี้อยู่ |
| `student_project_outcome_results` | A | 0 | ใช้วัดว่าโครงการช่วยให้นักศึกษาบรรลุ PLO ที่ผูกไว้ใน `project_outcome_links` หรือไม่ ทำให้ครบวงจร โครงการ → PLO |
| `schema_migrations` | C | 6 | หลายจุดในโค้ดเพิ่มคอลัมน์ตอนรันระบบ เช่น คอลัมน์ `license_*` ใน `student` จาก `get_profile.php` จึงควรเริ่มบันทึก migration ลงตารางนี้ ไม่ควรลบ |

> 3 ตารางโครงการจะมีประโยชน์จริงเมื่อมีหน้ากรอกผู้เข้าร่วมและแบบประเมินความพึงพอใจ ซึ่งแดชบอร์ดคณบดีหน้า “โครงการและงบประมาณ” ต้องใช้

## 🗂️ ลบได้ แต่เก็บโครงสร้างไว้ใน `future-tables-schema.sql` (7 ตาราง)

| ตาราง | แถว | ของที่ใช้แทน | กรณีที่อาจต้องกลับมาใช้ |
| --- | --- | --- | --- |
| `Student_License_Attempts` | 0 | คอลัมน์ `license_first_attempt_passed` และ `license_within_one_year_passed` ใน `student` (ใหม่ใน 0.0.7) | ถ้าคณะต้องการวิเคราะห์ผลสอบใบประกอบวิชาชีพ **รายวิชาสอบ** หรือดูประวัติการสอบทุกครั้ง |
| `faculty_ce_records` | 0 | `faculty_personnel_development` (ใหม่ใน 0.0.7) | ตารางใหม่ไม่มีช่อง **หน่วยคะแนน** ที่ใช้ต่ออายุใบอนุญาต → **แนะนำเพิ่มคอลัมน์ `credits` ในตารางใหม่** แทนการกลับไปใช้ตารางเก่า |
| `research_journals` | 0 | `faculty_research` | ถ้าต้องการทะเบียนวารสารกลาง (ฐาน TCI / Scopus) แยกจากผลงาน ตอนนี้ระดับฐานเก็บใน `faculty_research.category` |
| `research_publications` | 0 | `faculty_research` (0.0.7 เพิ่มทุน, IRB, ทรัพย์สินทางปัญญา, รางวัลแล้ว) | ไม่น่าต้องกลับมา |
| `research_publication_authors` | 0 | `faculty_research` (first_author_id, corresponding_author_id, co_author_ids) | ถ้าต้องการนับผลงานต่ออาจารย์แบบแม่นยำ (co_author_ids เป็นข้อความ query ยาก) |
| `advisor_transfer_request` | 0 | — (ฟีเจอร์ถูกลบใน 0.0.7) | ถ้าทีมนำฟีเจอร์คำขอย้ายอาจารย์ที่ปรึกษากลับมา |
| `curriculum_report_stats` | 9 | — | **export ข้อมูลก่อนลบ** ค่า achieved_score เป็นค่าค้าง ส่วนค่าเป้าหมาย (target) แนะนำให้ไปอยู่ในตาราง KPI Target ใหม่ที่ใช้ได้กับตัวชี้วัดทุกด้าน |

## 🗑️ ลบได้ — มีของใหม่แทนแล้ว (6 ตาราง)

เห็นด้วยกับ `db-cleanup-analysis.md` แดชบอร์ดคณบดีใช้ข้อมูลจากตารางชุดใหม่ทั้งหมด

| ตาราง | แถว | ใช้ของใหม่ |
| --- | --- | --- |
| `assessments` | 0 | `curriculum_*` + `student_clo_sub_scores` |
| `student_performance` | 0 | — |
| `plo` | 8 | `curriculum_plo` (export ก่อน) |
| `ylo` | 4 | `curriculum_sub_plo.year_level` (export ก่อน) |
| `sub_plo` | 263 | `curriculum_sub_plo` (export ก่อน) |
| `student_competency_assessments` | 26 | คำนวณจากคะแนน Sub PLO ผ่าน `competency_result_helpers.php` (export ก่อน) |

> **ลำดับการลบสำคัญ:** `assessments` → `ylo` → `plo` (FK ลูกโซ่ เหมือนในไฟล์เดิม)

## 🔧 ลบได้หลังแก้โค้ด (2 ตาราง)

| ตาราง | แถว | ต้องแก้อะไรก่อน |
| --- | --- | --- |
| `student_clo_results` | 0 | `Teacher/DeanDashboard/get_student_learning_outcomes.php` ยังอ่านตารางนี้ **หน้าผลลัพธ์การเรียนรู้ของคณบดีจึงว่างตลอด** ต้องเปลี่ยนไปคำนวณจาก `student_clo_sub_scores` ผ่าน `competency_result_helpers.php` (ตัวเดียวกับหน้านักศึกษา) แล้วจึงลบ |
| `grades` | 4 | `Teacher/DeanDashboard/get_dean_dashboard.php` แท็บ “KPI คณะ” ยังอ่านตารางนี้ ให้ตัดกราฟเกรดออกตามขอบเขตใน AGENTS.md ถ้าทีมยังต้องการดู GPA ให้ใช้ `student_term_grades` (ใหม่ใน 0.0.7) แทน |

## ⏳ ลบเมื่อทุกเครื่องย้ายข้อมูลแล้ว (1 ตาราง)

| ตาราง | แถว | เงื่อนไข |
| --- | --- | --- |
| `competency_items` | 55 | ตามไฟล์เดิม — ลบได้เมื่อทุกเครื่องมี flag `outcomes.sub_plo_from_competency_items` ใน `system_settings` |

## 🔒 ห้ามลบ (2 ตาราง)

`program`, `role` — เป็นปลายทาง FK ของ `student`, `subject`, `users` และ `program` ยังใช้แยกหลักสูตรในแดชบอร์ดได้ ถ้าคณะมีหลายหลักสูตรในอนาคต

---

## สิ่งที่ต้องแก้ใน `db-cleanup.sql`

ลบ 3 บรรทัดนี้ออก (หรือ comment ไว้) เพื่อ **ไม่ลบ** ตารางโครงการ:

```sql
-- DROP TABLE IF EXISTS `project_participants`;
-- DROP TABLE IF EXISTS `project_satisfaction_responses`;
-- DROP TABLE IF EXISTS `student_project_outcome_results`;
```

`schema_migrations` ไม่ได้อยู่ในสคริปต์ลบอยู่แล้ว ไม่ต้องแก้

ส่วน `schema_audit.php` ให้ถอดเฉพาะ `advisor_transfer_request` ออกจากลิสต์ “ตารางที่ต้องมี” (**คง `project_participants` ไว้**)

---

## ขั้นตอนที่แนะนำ

1. **ขอ dump ล่าสุดจากทีม** แล้วตรวจจำนวนแถวซ้ำ (dump ที่ใช้ทบทวนคือก่อน commit 0.0.7)
2. **สำรองฐานข้อมูลทั้งก้อน** และ export ตารางที่มีข้อมูล (`plo`, `ylo`, `sub_plo`, `student_competency_assessments`, `curriculum_report_stats`) ตามขั้นตอนในไฟล์เดิม
3. **แก้ `db-cleanup.sql`** ตามหัวข้อข้างบน แล้วรัน → ลบ 13 ตาราง
4. **แก้โค้ดหน้าคณบดี** (`get_student_learning_outcomes.php`, `get_dean_dashboard.php`) แล้วจึงลบ `student_clo_results` และ `grades`
5. เมื่อทุกเครื่องย้ายข้อมูลครบ จึงลบ `competency_items`
6. เปิดระบบไล่เช็คทีละ role โดยเฉพาะหน้าคณบดีและหน้าโครงการ

---

## ตารางที่ควรเพิ่มในอนาคต (เพื่อแดชบอร์ดคณบดี)

| ตาราง / คอลัมน์ | ใช้ทำอะไร |
| --- | --- |
| `faculty_kpi_targets` (kpi_code, year, target) | แสดง Target vs Actual ของ PLO, ใบประกอบวิชาชีพ, วิจัย, งบประมาณ (แทน `curriculum_report_stats`) |
| `kpi_snapshots` | เก็บตัวเลขรายปี เพื่อดูแนวโน้มย้อนหลัง เพราะ `student.status` ถูกเขียนทับ |
| ภาวะการมีงานทำ / ความพึงพอใจผู้ใช้บัณฑิต | ตัวชี้วัด QA หลักที่ยังไม่มีในระบบ |
| `faculty.academic_rank` | ตำแหน่งวิชาการจริง แทนการเดาจากคำนำหน้า |
| `faculty_personnel_development.credits` | ติดตามหน่วยคะแนนต่ออายุใบอนุญาต (แทน `faculty_ce_records`) |
| วันหมดอายุ MOU ใน `practice_locations` | แจ้งเตือน MOU แหล่งฝึกใกล้หมดอายุ |

> เรื่องฐานข้อมูล `chk_db` ทั้งก้อน ยังคงต้องถามทีมก่อนตามไฟล์เดิม
