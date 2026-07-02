# สรุปผลการทดสอบ (Test Summary Report) — Nursing MIS

**ขอบเขต:** ทดสอบการทำงาน (functional smoke test) 9 โมดูล — CLOManagement, CLOMap, CLOPage, CourseReports, CoursesPage, CourseStudents, Documents, Grades, MyCourses
**วิธีทดสอบ:** ทดสอบ API จริง (ผ่าน HTTP + session) และทดสอบผ่านหน้าเว็บจริง (UI) บน Docker
**ข้อมูล:** ฐานข้อมูลจริงของทีม `MYSQL_DATABASE (26-6-2569).sql` (41 ตาราง, 11 users, 0 enrollment)
**บัญชีทดสอบ:** `46172040` (Admin) / `41172008` (Teacher) — รหัส `Test@1234`
**วันที่:** 26 มิ.ย. 2569
**หมายเหตุ:** ระบบยังพัฒนาไม่เสร็จ 100% — รายงานนี้บอกแค่ว่าแต่ละโมดูล "ทำงานได้/ไม่ได้" และสาเหตุ

---

## 1. ผลรวม
- **ล็อกอิน + โครงระบบ (sidebar, จัดการผู้ใช้):** ✅ ทำงานได้บนข้อมูลจริง
- **9 โมดูลที่ทดสอบ:** ใช้งานได้จริง **1** โมดูล (Documents-ฝั่งดู) / ติดปัญหา **8** โมดูล
- ปัญหา 8 โมดูลกระจุกอยู่ที่ **~7 ต้นเหตุหลัก** ซึ่งส่วนใหญ่แก้ได้ระดับ 1–2 บรรทัด

## 2. ผลรายโมดูล

| โมดูล | สถานะ | อาการ |
|---|---|---|
| Documents | ✅ ผ่าน | หน้าโหลด/ค้นหา/ตารางทำงานถูกต้อง (อัปโหลด/ลบยังไม่ได้) |
| CoursesPage | ❌ ไม่ผ่าน | หน้าโหลดได้ แต่ไม่มีข้อมูล (0 วิชา/0 นศ.) |
| MyCourses | ❌ ไม่ผ่าน | Error 500 ทั้งหน้า |
| CLOManagement | ❌ ไม่ผ่าน | หน้าโหลดได้ แต่ดึง CLO ไม่ขึ้น |
| CLOMap | ❌ ไม่ผ่าน | ตารางว่าง (ไฟล์ฝั่ง server พัง) |
| CLOPage | ❌ ไม่ผ่าน | เลือกวิชาแล้วระบบเด้ง logout เอง |
| CourseReports | ❌ ไม่ผ่าน | ตัวกรอง/กราฟว่างทั้งหมด |
| CourseStudents | ❌ ไม่ผ่าน | เข้าหน้าไม่ได้เลย |
| Grades | ❌ ไม่ผ่าน | เลือกรายวิชาไม่ได้ (dropdown ว่าง) |

## 3. ต้นเหตุหลัก (root cause) — เรียงตามความรุนแรง

| # | ความรุนแรง | ต้นเหตุ | กระทบโมดูล | แนวทางแก้ |
|---|---|---|---|---|
| 1 | 🔴 สูง | ไฟล์ฝั่ง Teacher ที่ลึก 3 ชั้นเขียน path `require '../../config/config.php'` (ขึ้น 2 ชั้น) ผิด ควรเป็น `../../../` | CourseReports, CoursesPage | แก้ path เป็นขึ้น 3 ชั้น |
| 2 | 🔴 สูง | `get_clo_map.php` มี **Git merge conflict markers** (`<<<<<<< HEAD`) ค้าง → PHP parse error | CLOMap | resolve conflict / ลบ marker |
| 3 | 🔴 สูง | `index.php` route grading ชี้ `Teacher/Grades/` แต่โฟลเดอร์จริงคือ `Teacher/grading/` (Linux เป็น case-sensitive) | Grades | แก้ path ให้ตรง |
| 4 | 🔴 สูง | MyCourses query `faculty WHERE user_id=?` แต่ตาราง `faculty` จริง **ไม่มีคอลัมน์ `user_id`** | MyCourses | แก้ query ให้ join ตามคอลัมน์จริง |
| 5 | 🔴 สูง | `course-students` ไม่อยู่ใน array `teacherPages` ใน `Index.tsx` (switch case เป็น dead code) → ตกไปหน้า ProfilePage | CourseStudents | เพิ่ม `"course-students"` ใน whitelist |
| 6 | 🟠 กลาง | CLOPage endpoints เช็ก `$_SESSION` แต่ลืมเรียก `session_start()` → 401 และ axios interceptor ล้าง session → **logout เอง** | CLOPage (+ UX ทั้งระบบ) | เพิ่ม `session_start()` |
| 7 | 🟠 กลาง | `save-clo-management`, `upload-document`, `delete-document` เขียน path `auth_middleware.php` ผิด → require ล้ม | บันทึก CLO/เอกสาร | แก้ path auth_middleware |
| 8 | 🟡 ต่ำ | CLOManagement frontend ส่ง `subject-code` แต่ backend อ่าน `subject_code` + วิชา hardcode "103-111" | CLOManagement | ให้ key param ตรงกัน + ทำ dropdown เลือกวิชา |
| 9 | 🟡 ต่ำ | DB จริงไม่มีตาราง `clo` แต่ CLOPage ใช้ | CLOPage | เพิ่มตาราง / ปรับให้ใช้ source เดียวกับ CLOManagement |

## 4. ส่วนที่ยังพัฒนาไม่เสร็จ (by design — ไม่นับเป็นบั๊ก)
- Export Excel/PDF (CourseReports) แสดง toast แต่ยังไม่สร้างไฟล์จริง
- อัปโหลดเอกสาร (Documents) เก็บแค่ metadata ขนาดจำลอง ไม่เก็บไฟล์จริง + ไม่มี audit log
- คะแนน CLO รายคน (CourseStudents) เป็นค่าสุ่ม `rand()` และปุ่มบันทึกเป็น stub (ไม่เขียน DB)
- MyCourses: จำนวนนักศึกษาเป็นค่าสุ่มเมื่อไม่มี enrollment, ความคืบหน้า CLO = 0 เสมอ
- CoursesPage: คะแนนย่อย (กลางภาค/ปลายภาค/งาน) ไม่ถูกบันทึก, ปุ่ม "บันทึกทั้งหมด" ไม่ยิง API
- CLOManagement: กฎ "น้ำหนักรวม 100%" เป็นแค่ตัวเลขสีแดง ไม่บล็อกการบันทึก
- DB จริงยังไม่มีข้อมูล enrollment → หน้าที่อิงการลงทะเบียนจึงว่าง

## 5. ข้อสรุป
โครงสร้างพื้นฐาน (ล็อกอน, สิทธิ์/role, เมนู, จัดการผู้ใช้) **ทำงานได้** บนข้อมูลจริง แต่โมดูลฝั่งอาจารย์ 8/9 ยังเข้าใช้งานไม่ได้ — ส่วนใหญ่ติดบั๊กเล็ก ๆ ที่แก้ได้เร็ว (path, session_start, merge marker, ชื่อโฟลเดอร์, whitelist) ไม่ใช่ปัญหาเชิงสถาปัตยกรรม เมื่อแก้ ~7 ต้นเหตุนี้แล้ว ส่วนใหญ่น่าจะกลับมาใช้งานได้ทันที (เหลือเรื่องเติมข้อมูล enrollment และฟีเจอร์ที่ยังทำไม่เสร็จ)

> รายละเอียดเชิงเทคนิคเต็ม ๆ ดูที่ `TEST_RESULTS.md` · ชุด test case ดูที่ `Nursing_Test_Cases_CLO_Course_Modules.xlsx`
