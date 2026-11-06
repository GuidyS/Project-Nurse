# บันทึกการเปลี่ยนแปลง — 6 พฤศจิกายน 2569

เอกสารนี้สรุปงานที่ทำในโฟลเดอร์ `MIS` และซิงก์ขึ้น branch `Frontend` ของ `GuidyS/Project-Nurse` โดยไม่แก้ branch `main` ขอบเขตล่าสุดของระบบไม่มี flow เกรด/คะแนน

## สิ่งที่ผู้ใช้จะเห็น

| ส่วน | การเปลี่ยนแปลง |
| --- | --- |
| มอบหมายนักศึกษา | อ่านปีการศึกษาก่อนเริ่ม transaction เพื่อหลีกเลี่ยง MySQL implicit commit ระหว่างบันทึก |
| CLO รายวิชา / CLO Map | แสดงข้อผิดพลาดในการโหลดและปุ่มลองอีกครั้ง แทนหน้าว่างเมื่อ API ล้มเหลว |
| เอกสารโครงการ | ปุ่มเลือกไฟล์มองเห็นและกดได้ชัดเจนทั้งตอนสร้างโครงการและแนบเอกสาร |
| ภาระงานโครงการ | รวมหน้าแยกเดิมเป็นหน้าเดียว แสดง 6 ประเภทโครงการและตารางที่กำหนดความกว้างคอลัมน์สม่ำเสมอ |
| สรุปผลงานวิจัย 5 ปี | แก้การลบที่อาจบันทึกแล้วแต่ API ตอบ error; หากผลบันทึกไม่ชัดเจน หน้าเว็บดึงข้อมูลล่าสุดกลับมาและแจ้งผู้ใช้ |
| ตัวกรองงานวิจัย | ตัวกรองประเภทงาน ทุน IRB ทรัพย์สินทางปัญญา และปี มีผลกับการ์ด กราฟ ตาราง และรายการผลงานชุดเดียวกัน |
| สลับปีปฏิทิน/ปีการศึกษา | คำนวณยอดรายปีและรายอาจารย์ครั้งเดียวต่อชุดข้อมูล แทนการไล่ทุกรายการซ้ำในทุกช่องตาราง |
| เข้าสู่ระบบ | Vite อ่าน `frontend/src/.env` ตามที่โปรเจกต์กำหนด เพื่อให้ API ไปยัง Backend; ข้อความ error แยกกรณีเชื่อมต่อ Backend ไม่ได้ |

## ไฟล์หลักที่เกี่ยวข้อง

- Frontend: `frontend/src/components/pages/Teacher/ResearchSummary.tsx`, `FacultyDimensionPage.tsx`, `FacultyWorkloadDashboard.tsx`, `CLOPage.tsx`, `CLOMap.tsx`, `ProjectsPage.tsx`, `frontend/src/components/pages/Auth/LoginPage.tsx`, `frontend/src/pages/Index.tsx`, `frontend/vite.config.ts`
- ตัวคำนวณและชุดทดสอบ: `frontend/src/lib/researchSummaryAggregation.ts`, `frontend/tests/research-summary-aggregation.test.mjs`
- Backend: `backend/src/components/Teacher/ResearchSummary/save_research_summary.php`, `backend/src/components/Teacher/DeanDashboard/get_faculty_workload.php`, `backend/src/components/Admin/AssignStudents/save_assign_students.php`, `backend/src/components/sidebar.php`

## การตรวจสอบ

- `npm run build` และ `npx tsc --noEmit -p tsconfig.app.json` ผ่าน
- `npm run lint` ผ่านโดยมี warnings เดิม 33 รายการ ไม่มี errors
- `node --test tests/research-summary-aggregation.test.mjs` ผ่าน 3 กรณีด้วยข้อมูลจำลอง
- ตรวจ PHP syntax ใน container ผ่านสำหรับไฟล์แอปที่ตรวจทั้งหมด
- Smoke test แบบไม่มี session ของ endpoint บันทึกงานวิจัยตอบ `401` ตามสิทธิ์

ยังไม่ได้ทดสอบการเพิ่ม/ลบผลงานหรือ login ด้วยบัญชีจริง และยังไม่ได้ทดสอบครบทุกบทบาทกับข้อมูลจริง เพื่อไม่แก้ไขข้อมูลอ่อนไหวในฐานใช้งาน การวัดผลความเร็ว 10,000 รายการเป็นการวัดตัวคำนวณด้วยข้อมูลจำลอง ไม่ใช่เวลาตอบสนองทั้งหน้าจอ

## ฐานข้อมูลและความปลอดภัย

- ไม่มีการรัน migration, import หรือเปลี่ยน schema ในงานนี้ ไฟล์ migration ที่เพิ่มใน branch เป็นไฟล์สำหรับตรวจและดำเนินการกับฐานเดิมตาม `backend/sql/migrations/README.md` เท่านั้น
- ไม่อัปโหลด `.env`, config จริง, ข้อมูลใน `mysql-data`, ไฟล์อัปโหลดผู้ใช้ หรือไฟล์ build/deploy
- ไฟล์อัปโหลดที่เคยถูกติดตามถูกนำออกจาก HEAD ของ branch `Frontend` แล้ว แต่ยังอยู่ในประวัติ Git เดิม การลบจากประวัติทั้งหมดต้องทำเป็นงานแยก
- ปัญหา `mapping_id` ที่ฐานข้อมูลไม่มีค่า default เคยให้เพียงแนวทางแก้ ยังไม่ได้แก้ schema ในรอบนี้
