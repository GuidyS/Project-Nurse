# ผลการปรับปรุงปีการศึกษาและช่องค้นหา

วันที่ดำเนินการ: 26 กันยายน 2569

## พฤติกรรมที่ปรับปรุง

- ปีการศึกษาเปลี่ยนวันที่ 1 เมษายน เวลา 00:00 ตาม `Asia/Bangkok` ทั้ง PHP และ Frontend โดย Frontend ซิงก์เวลาจาก Backend และใช้เวลาแบบ monotonic ระหว่างการซิงก์
- ตรวจปฏิทินใหม่เมื่อกลับมาใช้งานหน้าเว็บ และตั้งเวลาอัปเดตเมื่อถึงวันเปลี่ยนปี ผู้ใช้ที่เลือกปีเองจะยังอยู่ปีเดิม
- ตัวกรองรายงานและโครงการรวมปีปัจจุบันที่อาจยังไม่มีข้อมูลกับปีย้อนหลังที่มีอยู่ ไม่จำกัดไว้เฉพาะรายการปีตายตัว
- รายการปีของโครงการไม่หายไปเพราะคำค้นจำกัดผลลัพธ์
- ฟอร์มสร้างโครงการและเอกสารใช้ปีปัจจุบันจากปฏิทินกลาง ไม่เปลี่ยนปีของรายการเดิมหรือปีในฟอร์มที่เปิดค้าง
- ฟอร์มแก้โครงการที่ไม่มีทั้งปีการศึกษาและปีงบประมาณจะให้ระบุปีเอง แทนการใส่ปีปัจจุบันให้เงียบ ๆ
- หน้าส่งออกใช้รายการปีจากข้อมูลจริง และแสดงชื่อ “ปีที่เข้าศึกษา” สำหรับนักศึกษาให้ตรงกับ `admission_year`
- รายงานภาระงานและหน้ารายละเอียดมิติภาระงานใช้ค่าเริ่มต้นปีเดียวกัน สรุปงานวิจัยโหมดปีการศึกษาใช้ช่วง 1 เมษายน–31 มีนาคม ส่วนโหมดปีปฏิทินยังใช้มกราคม–ธันวาคม
- สรุป 5 ปีใช้กรอบปีการศึกษาปัจจุบัน โดยไม่เพิ่มพฤติกรรมเกรดหรือคะแนน
- หน้าการคงอยู่แสดงว่าเป็นข้อมูลทุกปีที่เข้าศึกษา เพราะ API รวมข้อมูลทุกปี ไม่แสดงป้ายปี 2568 ที่ทำให้เข้าใจผิด
- ช่องค้นหารายงานหน่วงประมาณ 300 มิลลิวินาที ยกเลิกคำขอเก่า คงโฟกัสและตำแหน่งช่องค้นหา และปิด CSV/การอนุมัติจากผลลัพธ์เก่าจนกว่าข้อมูลจะตรงกับตัวกรอง
- ช่องค้นหาโครงการป้องกันผลลัพธ์เก่าทับคำค้นล่าสุด และคงรายการเดิมระหว่างอัปเดตเมื่อมีข้อมูลอยู่แล้ว
- ช่องค้นหาที่กรองในเครื่อง เช่นจัดการผู้ใช้ Audit Log เอกสาร และบันทึกให้คำปรึกษา ไม่เพิ่มคำขอ API ระหว่างพิมพ์

## ไฟล์ที่แก้หรือเพิ่มในงานนี้

รายการนี้ระบุเฉพาะส่วนงานรอบนี้ ใน workspace มีการแก้ไขอื่นอยู่ก่อนแล้วซึ่งไม่ได้ย้อนทับ

### ส่วนกลาง

- `backend/src/config/academic_calendar.php` — ฟังก์ชันปีการศึกษาและรายการปี
- `backend/src/components/AcademicCalendar/get_academic_calendar.php` — API เวลาเซิร์ฟเวอร์สำหรับผู้ที่เข้าสู่ระบบ
- `backend/src/index.php` — ลงทะเบียน `academic-calendar` และ `export-years`
- `frontend/src/lib/academicYear.ts` — คำนวณปีตามเวลาไทยและซิงก์นาฬิกา
- `frontend/src/hooks/use-academic-year.ts` — ปฏิทิน การอัปเดตข้ามปี และการรักษาปีที่ผู้ใช้เลือก
- `frontend/src/hooks/use-debounced-value.ts` — หน่วงค่าค้นหา

### หน้าจอ

- `frontend/src/components/pages/Admin/Reports.tsx`
- `frontend/src/components/pages/Admin/ExportData.tsx`
- `frontend/src/components/pages/Teacher/ProjectsPage.tsx`
- `frontend/src/components/pages/Teacher/Documents.tsx`
- `frontend/src/components/pages/Teacher/FacultyWorkloadDashboard.tsx`
- `frontend/src/components/pages/Teacher/FacultyDimensionPage.tsx`
- `frontend/src/components/pages/Teacher/ResearchSummary.tsx`
- `frontend/src/components/pages/Teacher/Retention.tsx`

### API ที่เกี่ยวข้อง

- `backend/src/components/Admin/Reports/get-reports.php`
- `backend/src/components/Admin/ExportData/get_export_years.php`
- `backend/src/components/Admin/AssignStudents/save_assign_students.php`
- `backend/src/components/Teacher/Documents/upload_document.php`
- `backend/src/components/Teacher/ProjectsPage/get_projects.php`
- `backend/src/components/Teacher/DeanDashboard/get_faculty_workload.php`
- `backend/src/components/Teacher/ResearchSummary/get_research_summary.php`
- `backend/src/components/Teacher/FiveYearSummary/get_five_year_summary.php`

### ชุดทดสอบและเอกสาร

- `frontend/package.json` — เพิ่มคำสั่งทดสอบ
- `frontend/tests/academic-year.test.mjs`
- `frontend/tests/search-browser.mjs`
- `frontend/tests/.gitignore` — ไม่เก็บผลลัพธ์ browser test ใน Git
- `backend/tests/academic-calendar-test.php`
- `backend/tests/report-access-test.php`
- `ACADEMIC-YEAR-SEARCH-PLAN.md` และเอกสารผลฉบับนี้

## ผลการตรวจสอบ

| การตรวจ | ผล |
| --- | --- |
| `npm run test:academic-year` | ผ่าน 5 tests ครอบคลุมขอบเขตวัน/เวลา 24 กรณีใน 3 timezone รายการปี และเวลาของ Backend ที่ต่างจากเครื่องผู้ใช้ |
| PHP `academic-calendar-test.php` | ผ่าน 24 กรณีวัน/เวลา และ 2 กรณีรายการปี |
| PHP `report-access-test.php` | ผ่าน 6 กรณีสิทธิ์ด้วย session จำลองและ PDO stub ไม่มีการเชื่อมฐานข้อมูล |
| Browser: รายงาน | ผ่านการหน่วงค้นหา โฟกัส ตำแหน่งช่องค้นหา ตำแหน่ง scroll คำขอตอบกลับผิดลำดับ CSV ปีเก่า ไม่มีข้อมูล API ล้มเหลว และการกู้คืน |
| Browser: โครงการ | ผ่านการตอบกลับผิดลำดับ โฟกัส และปีเริ่มต้นจากเวลา Backend |
| Browser: ส่งออก | ผ่านรายการปีเก่าย้อนหลังเกิน 5 ปี และป้ายปีที่เข้าศึกษา |
| Browser: เอกสารอาจารย์ | ผ่านปีเริ่มต้น และการรักษาปีของ draft เมื่อเวลา Backend เปลี่ยน |
| Browser: จอมือถือ | ผ่านตำแหน่งช่องค้นหาและโฟกัส พร้อมตรวจภาพหน้าจอ |
| Browser: เปิดหน้าค้างข้าม 1 เมษายน | ผ่านการเปลี่ยนปีเริ่มต้นอัตโนมัติ และการคงปีที่เลือกเองพร้อมเพิ่มปีใหม่ในตัวเลือก |
| Browser runtime errors | ไม่พบในเส้นทางที่ทดสอบ |
| `npx tsc --noEmit -p tsconfig.app.json` | ผ่าน |
| `npm run build` | ผ่าน มีคำเตือนขนาด JavaScript chunk มากกว่า 500 kB |
| `npm run lint` | ยังไม่ผ่านจากปัญหาเดิม: 1 error และ 38 warnings เท่ากับก่อนแก้ |
| `php -l` ไฟล์ PHP ของระบบที่แก้ 11 ไฟล์ | ผ่าน |
| HTTP ไม่ได้เข้าสู่ระบบ: `academic-calendar`, `admin-reports`, `export-years` | ทั้ง 3 endpoint ตอบ 401 |
| ตรวจ metadata ของ DB | พบคอลัมน์ปีที่ใช้ครบใน `student`, `project`, `annual_project_report_items`, `tqf_documents`, `student_advisor_mapping` |

Lint error เดิมอยู่ที่ `frontend/src/components/ui/textarea.tsx:5` กฎ `@typescript-eslint/no-empty-object-type` ไม่ได้แก้ไฟล์นี้เพราะอยู่นอกขอบเขต

## วิธีรันทดสอบซ้ำ

จากโฟลเดอร์ `frontend`:

```powershell
npm run test:academic-year
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npm run build
```

Browser test ต้องมี dev server ที่ `http://localhost:5173` และ Playwright พร้อม Microsoft Edge โดยทุก API request ใน browser test ถูกแทนด้วยข้อมูลจำลอง ไม่เรียกอ่าน/เขียนข้อมูลจริง

```powershell
# ถ้า Playwright อยู่ภายนอก node_modules ของโปรเจค ให้ระบุ path ของ package
$env:PLAYWRIGHT_MODULE = '<absolute-path-to-playwright-package>'
# เลือกเก็บภาพและ CSV จำลองนอก repository ได้
$env:TEST_ARTIFACTS = Join-Path $env:TEMP 'nurse-academic-search-tests'
npm run test:search-browser
```

ค่าเริ่มต้น browser คือ `msedge` สามารถใช้ `$env:BROWSER_CHANNEL = 'chrome'` หากเครื่องติดตั้ง Chrome แทน

จาก root ของโปรเจค หากมี PHP บนเครื่อง:

```powershell
php backend/tests/academic-calendar-test.php
php backend/tests/report-access-test.php
```

หรือใช้ container `php-apache` ที่รันอยู่:

```powershell
Get-Content backend/tests/academic-calendar-test.php -Raw | docker exec -i -e NURSE_BACKEND_SRC=/var/www/html php-apache php
Get-Content backend/tests/report-access-test.php -Raw | docker exec -i -e NURSE_BACKEND_SRC=/var/www/html php-apache php
```

## ความปลอดภัย ฐานข้อมูล และขอบเขตการยืนยัน

- เพิ่ม session guard ให้ API ปฏิทินและ API รายงาน พร้อมใช้ `approvalRequireAdmin` กับรายงานและรายการปีส่งออก ตามนโยบายเดียวกับระบบส่งออกเดิม ซึ่งรองรับ Admin และคณบดีตามบทบาทเดิม
- การทดสอบสิทธิ์ใช้ข้อมูลจำลอง: ไม่เข้าสู่ระบบ 401, Admin/SuperAdmin 200, Teacher ทั่วไป 403, Student 403 และคณบดีตามนโยบายเดิม 200
- ไม่เปลี่ยน cookie, CORS, password policy, owner scope ของ upload หรือข้อมูลส่วนบุคคล
- ไม่แก้ schema ไม่มี migration ไม่มี import และไม่มีการอัปเดตปีของข้อมูลเก่าในฐานข้อมูล
- ไม่พบไฟล์ schema หลักตามชื่อ `MYSQL_DATABASE.sql` หรือ `MYSQL_DATABASE (3-8-2569).sql` ใน root ของ workspace นี้ จึงเทียบเฉพาะคอลัมน์ที่เกี่ยวข้องผ่าน metadata แบบอ่านอย่างเดียว
- ไม่ทดสอบการบันทึกเอกสาร การอนุมัติ หรือ export ด้วยข้อมูลจริง ผล browser tests เป็นการยืนยัน UI และการจัดการ request ด้วย fixture ไม่ใช่การรับรองการทำงานครบทุกบทบาทกับข้อมูลจริง
- หน้าภาระงาน งานวิจัย การคงอยู่ และสรุป 5 ปีตรวจผ่าน build/type check และตรวจโค้ด แต่ยังไม่ได้ทดสอบข้อมูลจริงครบทุกหน้าจอ
- คงกฎเลื่อนชั้นปีนักศึกษาเดิมวันที่ 10 สิงหาคม เพราะเป็นกฎชั้นปี แยกจากปฏิทินรายงาน ไม่เปลี่ยนปีงบประมาณหรือปีเข้าศึกษาของรายการเดิม
- พบค่าเริ่มต้นปีของแบบบันทึกสุขภาพนักศึกษาเป็นชุดรุ่นคงที่ 2567–2570 ซึ่งต้องผูกกับรุ่น/ปีเข้าศึกษาของเจ้าของข้อมูล ไม่ควรแทนด้วยปีปัจจุบัน งานนี้ไม่ได้แก้ส่วนดังกล่าว
- ไม่เพิ่มหรือทดสอบ flow เกรด/คะแนน หน้า CourseReports และ StudentLearningOutcomes ที่เกี่ยวข้องกับผลการประเมินไม่ได้ขยายพฤติกรรม
- เวลาฝั่ง Frontend ก่อนซิงก์สำเร็จใช้เวลาเครื่องโดยคำนวณใน timezone กรุงเทพฯ เมื่อได้รับเวลาจาก Backend แล้วจะใช้อ้างอิงจาก Backend
