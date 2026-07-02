# คู่มือทดสอบ 9 โมดูล CLO/Course (Nursing MIS)

เอกสารนี้สรุปวิธีเตรียมฐานข้อมูลทดสอบ ผู้ใช้ทดสอบ ไฟล์ test case และข้อบกพร่องที่พบระหว่างวิเคราะห์โค้ด

## 1. ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | คำอธิบาย |
|---|---|
| `backend/nurseproject_seed.sql` | Schema ขั้นต่ำ + ข้อมูลตัวอย่าง (รองรับ login และ 9 โมดูล) |
| `test-artifacts/Nursing_Test_Cases_CLO_Course_Modules.xlsx` | Test case 58 ข้อ (รูปแบบคอลัมน์ตรงกับไฟล์เดิม) |
| `test-artifacts/Nursing_Test_Cases_CLO_Course_Modules.md` | Test case ฉบับอ่านง่าย (จัดกลุ่มตามโมดูล) |
| `test-artifacts/gen_testcases.py` | สคริปต์สร้างไฟล์ test case (แก้ไข/เพิ่มเคสแล้วรันใหม่ได้) |

## 2. ผู้ใช้ทดสอบ (รหัสผ่านเดียวกันทุกคน: `Test@1234`)

| Username | Role | ใช้ทดสอบ |
|---|---|---|
| `admin` | 1 (ผู้ดูแลระบบ) | งานฝั่ง Admin |
| `T001` | 2 (อาจารย์) | **9 โมดูล CLO/Course ทั้งหมด** |
| `6401001` | 3 (นักศึกษา) | ฝั่งนักศึกษา |

> อาจารย์ `T001` ถูก map ให้รับผิดชอบวิชา `103-111` และ `103-112` ใน `curriculum_framework.mapping_json`
> และมีนักศึกษา 6401001–6401004 ลงทะเบียนไว้แล้ว เพื่อให้ทดสอบเกรด/รายงาน/CLO ได้ทันที

## 3. วิธีโหลด SQL เข้า MySQL ใน Docker (เลือกวิธีใดวิธีหนึ่ง)

**วิธี A — โหลดอัตโนมัติตอนสร้าง DB ครั้งแรก (แนะนำถ้ายังไม่เคยรัน)**
แก้ `docker-compose.yml` ที่ service `db` เพิ่ม 1 บรรทัดใต้ `volumes:` (มี comment ไว้ให้แล้ว):
```yaml
  db:
    volumes:
      - ./backend/nurseproject_seed.sql:/docker-entrypoint-initdb.d/init.sql
      - ./mysql-data:/var/lib/mysql
```
แล้วสั่ง `docker compose up -d --build` (โหลดเฉพาะตอน `mysql-data` ยังว่าง)

**วิธี B — Import ผ่าน phpMyAdmin (GUI ง่ายสุดถ้า DB รันอยู่แล้ว)**
1. เปิด http://localhost:8081 → login: server `db`, user `root`, รหัส `MYSQL_ROOT_PASSWORD`
2. เลือกฐานข้อมูล `MYSQL_DATABASE` → แท็บ **Import** → เลือกไฟล์ `backend/nurseproject_seed.sql` → **Go**

**วิธี C — Import ผ่าน command line**
```powershell
docker compose exec -T db mysql -uroot -pMYSQL_ROOT_PASSWORD MYSQL_DATABASE < backend/nurseproject_seed.sql
```

หลังโหลดเสร็จ ลองล็อกอินด้วย `T001 / Test@1234`

## 4. ข้อบกพร่อง/จุดที่ยังไม่สมบูรณ์ที่พบจากการอ่านโค้ด (ควรตรวจระหว่างทดสอบ)

| # | โมดูล | ประเด็น | ผลกระทบ |
|---|---|---|---|
| 1 | CLOMap | ไฟล์ `get_clo_map.php` ยังมี **Git merge conflict markers** (`<<<<<<< HEAD`) ค้างอยู่ | เรียก API แล้ว PHP parse error |
| 2 | Grades | `index.php` ชี้ `Teacher/Grades/` แต่โฟลเดอร์จริงคือ `Teacher/grading/` | บน Linux container (case-sensitive) → require ไม่เจอไฟล์ → Fatal error |
| 3 | CourseStudents | คะแนน CLO มาจาก `rand(65,95)` และ `save_student_clo_scores.php` เป็น **stub** (ไม่บันทึกจริง) | ข้อมูลไม่จริง/บันทึกไม่ได้ |
| 4 | MyCourses | จำนวนนักศึกษาใช้ `rand(10,20)` เมื่อไม่มีข้อมูลจริง และ `cloProgress` = 0 เสมอ | ตัวเลขไม่จริง |
| 5 | CLOManagement | กฎ "น้ำหนักรวม 100%" เป็นแค่ตัวเลขสีแดง **ไม่บล็อกการบันทึก** + frontend ส่ง `subject-code` แต่ backend อ่าน `subject_code` | validation ไม่ครบ/ดึงข้อมูลไม่ขึ้น |
| 6 | CoursesPage | ปุ่ม "บันทึกทั้งหมด" แสดง toast สำเร็จแต่ไม่ยิง API; คะแนนย่อย (กลางภาค/ปลายภาค/งาน) ไม่ถูกบันทึก | บันทึกไม่ครบ |
| 7 | CourseReports | ปุ่ม Export Excel/PDF ยังไม่สร้างไฟล์จริง (แสดง toast เท่านั้น) | ฟังก์ชันยังไม่เสร็จ |
| 8 | Documents | อัปโหลดเก็บแค่ metadata (ขนาดจำลอง "1.2 MB") ไม่เก็บไฟล์จริง และไม่มี audit log | ไม่ตรง requirement |
| 9 | ทั่วไป | การเชื่อม DB มี 2 สไตล์ (คลาส `Connect` กับ `new PDO` ตรง ๆ) และการเช็ก session ไม่สม่ำเสมอ | ความสอดคล้องของโค้ด |

> หมายเหตุเรื่อง FR: เลขที่อ้างอิงจากไฟล์เดิม (FR009=รายวิชาที่สอน, FR028/29=CLO grade, FR030=Update CLO, FR033=รายงาน, FR034=CLO Map)
> ส่วน FR035 (CourseStudents), FR036 (Grades), FR038 (MyCourses) เป็นเลข **ที่เสนอเพิ่ม** ควร reconcile กับ master FR list ของทีมอีกครั้ง
