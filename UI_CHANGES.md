# สรุปการแก้ไข UI และ API

วันที่อัปเดต: 27 กันยายน 2026

## ไฟล์ที่แก้ไข

### 1. `frontend/src/components/layout/AppSidebar.tsx`

- เพิ่ม `sidebarIconOverrides` เพื่อกำหนดไอคอน Lucide ให้เหมาะกับเมนูแต่ละรายการและลดการใช้ไอคอนซ้ำ
- เปลี่ยนไอคอนเมนู **กำหนด CLO รายวิชา** เป็น `NotebookText`
- ทำให้เมนูด้านล่าง เช่น **ข้อมูลส่วนตัว** รองรับ `sidebarIconOverrides` เช่นเดียวกับเมนูหลัก
- ตัวอย่างไอคอนที่เปลี่ยน:
  - Transcript → `ScrollText`
  - Portfolio → `FolderOpen`
  - ประวัติการได้รับวัคซีน → `Syringe`
  - ข้อมูลภาวะสุขภาพ → `HeartPulse`
  - ประเมิน Performance → `Gauge`

### 2. `frontend/src/components/pages/ProfilePage.tsx`

- เปลี่ยนไอคอนหัวข้อ **ข้อมูลมารดา** จาก `Heart` เป็น `User` ให้เหมือนหัวข้อ **ข้อมูลบิดา**
- แก้ทั้งส่วนแสดงข้อมูลและส่วนแก้ไขข้อมูล
- ลบ import `Heart` ที่ไม่ได้ใช้งานแล้ว

### 3. `frontend/src/components/pages/Teacher/CLOPage.tsx`

- ลบไอคอน `Target` หน้าหัวข้อ **รายการ CLO**
- ลบเส้นขอบสีม่วงด้านบนของการ์ดรายการ CLO (`border-t-4 border-t-primary`)
- ลบ import `Target` ที่ไม่ได้ใช้งานแล้ว

### 4. `frontend/src/components/pages/Teacher/StudentsInfo.tsx`

- ลบวงกลมอักษรย่อหน้าชื่อนักศึกษาในตาราง โดยคงชื่อและอีเมลไว้
- ลบโค้ดส่งออกรายชื่อ CSV และ import `Download` ที่ไม่ได้ใช้งาน
- ปรับช่องค้นหาเป็น `type="search"` เพิ่มชื่อสำหรับ accessibility และขยายความกว้างเป็น `max-w-md`

### 5. `frontend/src/index.css`

- เพิ่มรูปแบบกลางสำหรับช่องค้นหาทั้งระบบ: ขอบโค้ง พื้นหลังการ์ด เงาบาง และสถานะ hover/focus ที่สอดคล้องกัน
- รองรับทั้งช่องค้นหาใหม่ที่ใช้ `type="search"` และช่องค้นหาเดิมที่มี placeholder ขึ้นต้นด้วยคำว่า “ค้น”
- เพิ่มรูปแบบกรอบหัวข้อกลางให้หน้าเดิมที่ยังไม่ได้ใช้ `app-page-header` มีกรอบเหมือนหน้า “โครงการของฉัน”

### 6. `frontend/src/components/layout/MainLayout.tsx`

- เพิ่ม class `app-page-content` เพื่อจำกัดขอบเขตการจัดรูปแบบกรอบหัวข้อไว้เฉพาะหน้าหลักหลังเข้าสู่ระบบ
- หน้า Login/Register และ dialog จะไม่ถูก selector กรอบหัวข้อใหม่นี้กระทบ

### 7. `frontend/src/components/pages/Admin/CompetencyItemsManagement.tsx`

- ลบไอคอน `ListChecks` หน้าหัวข้อ **จัดการรายการประเมินสมรรถนะหลัก**
- ลบ import `ListChecks` ที่ไม่ได้ใช้งานหลังนำไอคอนออก

### 8. ไฟล์ Backend ที่แก้ให้ตรงกับ schema ปัจจุบัน

- `backend/src/components/Teacher/Advises/get_advises.php`
- `backend/src/components/Teacher/Advises/get_student_plo_mapping.php`
- `backend/src/components/Teacher/Advises/save_student_plo_mapping.php`
- `backend/src/components/Teacher/AdviseNotes/get_advise_notes.php`
- `backend/src/components/Teacher/AdviseNotes/get_advise_students.php`
- `backend/src/components/Teacher/AdviseNotes/save_advise_note.php`
- `backend/src/components/Teacher/DeanDashboard/get_student_learning_outcomes.php`
- `backend/src/components/Teacher/ProjectAssessments/project_assessments.php`
- `backend/src/components/Teacher/TransferRequests/get_transfer_requests.php`

รายละเอียดการแก้ไข:

- เปลี่ยน query ที่อ้างคอลัมน์ `student.student_code` ซึ่งไม่มีใน schema ให้ใช้ `student.student_id`
- คงชื่อ field `student_code` เฉพาะ response alias ที่ Frontend ยังใช้อยู่
- คืนตัวกรอง `advisor_type` เพื่อแยกอาจารย์ที่ปรึกษากับอาจารย์ภาคปฏิบัติให้ถูกต้อง
- แก้การตรวจสิทธิ์เข้าถึงข้อมูล PLO ให้เทียบกับ `student_id`
- ไม่มีการแก้ schema, migration หรือข้อมูลในฐานข้อมูล

## การตรวจสอบ

### รูปแบบหัวข้อทุกหน้า

- ปรับชื่อหัวข้อหลักในกรอบให้มีขนาด `text-3xl` เท่ากันทุกหน้า
- ซ่อนไอคอนตกแต่งที่อยู่หน้าชื่อหัวข้อ โดยยังคงไอคอนภายในปุ่มคำสั่งไว้
- ปรับระยะห่างทั้งด้านบน ล่าง ซ้าย และขวาของหน้าให้ใช้ระยะจาก `MainLayout` จุดเดียว ทำให้กรอบและหัวข้อหลักเริ่มตรงกันทุกหน้า
- ลบไอคอน `ListChecks` หน้าหัวข้อ “จัดการรายการประเมินสมรรถนะหลัก” ออกจาก component โดยตรง

- ตรวจสอบชื่อไอคอนกับแพ็กเกจ `lucide-react` ที่ติดตั้งในโปรเจกต์แล้ว
- ตรวจสอบแล้วว่าไอคอน Sidebar หลังใช้ override ไม่ซ้ำกัน
- รัน `npm run build` สำเร็จ
- รัน `npm run lint` แล้ว ส่วนที่แก้ไม่มี error ใหม่ แต่ lint ทั้งโปรเจกต์ยังไม่ผ่านเพราะ error เดิมใน `frontend/src/components/ui/textarea.tsx` และ warning เดิมของโปรเจกต์
- รัน `php -l` กับไฟล์ Backend ที่แก้ทั้ง 9 ไฟล์สำเร็จ
- Smoke test แบบอ่านอย่างเดียวสำหรับ `get-advises`, `get-advise-notes` และ `get-advise-students` สำเร็จ

## หมายเหตุ

- ไม่มีการแก้ไขฐานข้อมูลสำหรับการเปลี่ยนไอคอน Sidebar การเปลี่ยนแปลงทำผ่าน Frontend override เท่านั้น
- งานปรับหน้ารายชื่อนักศึกษาภาคปฏิบัติเป็นการเปลี่ยน UI เท่านั้น ไม่มีการแก้ฐานข้อมูล สิทธิ์ หรือ flow เกรด/คะแนน
- งานแก้ HTTP 500 ปรับเฉพาะ query และตัวกรองสิทธิ์ให้ตรงกับ schema เดิม ไม่มีการแก้ข้อมูลจริงหรือเพิ่ม flow เกรด/คะแนน
- `frontend/package-lock.json` มีความแตกต่างเรื่อง newline อยู่ก่อนเริ่มงานนี้ จึงไม่รวมเป็นไฟล์ที่แก้ในรายการข้างต้น
