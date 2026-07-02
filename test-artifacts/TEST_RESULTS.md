# ผลการทดสอบจริง (Dynamic Test Results) — 9 โมดูล CLO/Course

ทดสอบเมื่อ: 2026-06-25 | ระบบรันบน Docker (frontend :5173, backend :8080, db :9906, phpMyAdmin :8081)
วิธีทดสอบ: ยิง API จริงด้วย session ของอาจารย์ `T001` (สคริปต์ `run_api_tests.py`, ผลดิบ `api_test_results.json`)

## สรุปภาพรวม
- ✅ โครงสร้างพื้นฐานทำงาน: Docker ขึ้นครบ 4 service, โหลด seed สำเร็จ, **ล็อกอินได้จริง** (T001 → role 2, ได้ permissions), frontend เสิร์ฟหน้า "Nursing System"
- ผลรวม endpoint: **PASS 8 | DEFECT ยืนยันแล้ว 9 จุด** (ในจำนวนนี้ 3 จุดตรงกับที่วิเคราะห์ไว้, **6 จุดเป็นบั๊กใหม่ที่เพิ่งเจอตอนรันจริง**)

## ✅ ที่ทำงานได้ (PASS)
| โมดูล | Endpoint | ผล |
|---|---|---|
| Auth | login (T001/Test@1234) | คืน user + role_id 2 + permissions ✓ |
| CLOPage | get-subjects | คืนรายวิชา 3 วิชา ✓ |
| CLOManagement | get-clo-management (ส่ง `subject_code` ถูก) | คืน CLO + PLO ของ 103-111 ✓ |
| CLOMap | save-clo-map | บันทึกลง mapping_json สำเร็จ ✓ |
| CourseStudents | get-course-students-clo (list + รายคน) | คืนรายวิชา/นักศึกษา + คะแนน CLO ✓ |
| Documents | get-documents | คืนเอกสารจาก JSON ✓ |
| MyCourses | get-teacher-courses-overview | คืนการ์ดวิชาที่ T001 สอน ✓ |

## 🐞 Defect ที่ยืนยันด้วยการรันจริง

### กลุ่ม A — บั๊กใหม่ที่เจอตอนรัน (สำคัญ, ทำให้หลายโมดูลใช้ไม่ได้)
| # | โมดูล | Endpoint | อาการจริงที่เจอ | สาเหตุ |
|---|---|---|---|---|
| A1 | CourseReports | get-report-filters, get-course-report | `Warning: require_once(.../components/config/config.php): Failed to open stream` | ไฟล์ลึก 3 ชั้นแต่ใช้ path `/../../config/config.php` (ขึ้น 2 ชั้น) ควรเป็น `/../../../` |
| A2 | CoursesPage | get-my-courses, get-course-students, update-grade | เหมือน A1 (config.php หาไม่เจอ) | path config.php ผิดชั้นเดียวกัน |
| A3 | CLOPage | get-clos, add-clo, update-clo, delete-clo | ตอบ **401 Unauthorized** ทั้งที่ล็อกอินแล้ว | ไฟล์เช็ก `$_SESSION['user_id']` แต่**ไม่ได้เรียก `session_start()`** (และ index.php ก็ไม่เรียกให้) |
| A4 | CLOManagement | save-clo-management | `Warning: require_once('./middlewares/auth_middleware.php'): Failed to open stream` | path auth_middleware ผิด |
| A5 | Documents | upload-document, delete-document | `Warning: require_once('auth_middleware.php'): Failed to open stream` | path auth_middleware ผิด (ไม่มีโฟลเดอร์) |

> หลักฐานว่าเป็นบั๊กของโค้ดไม่ใช่ที่ config.php ที่ผมสร้าง: `login` (ลึก 2 ชั้น) และ `CourseStudents` (ลึก 3 ชั้นแต่ใช้ `/../../../` ถูก) **ใช้ config.php ตัวเดียวกันแล้วทำงานได้** มีแต่ไฟล์ที่เขียน path ผิดชั้นที่พัง

### กลุ่ม B — Defect ที่วิเคราะห์ไว้ล่วงหน้าและยืนยันแล้วว่าจริง
| # | โมดูล | อาการจริง |
|---|---|---|
| B1 | CLOMap | get-clo-map → `Parse error: syntax error, unexpected token "<<"` = **merge conflict markers ค้างในไฟล์จริง** |
| B2 | Grades | get-grading-data / save-grading-data → `require_once('components/Teacher/Grades/...'): Failed to open stream` = ชื่อโฟลเดอร์จริงคือ `grading` (ตัวเล็ก) ไม่ตรง |
| B3 | CLOManagement | ส่ง `subject-code` (แบบที่ frontend ใช้จริง) → error "กรุณาระบุรหัสวิชา" เพราะ backend อ่าน `subject_code` |
| B4 | CourseStudents | save-student-clo-scores → ตอบ success แต่เป็น **stub ไม่บันทึก DB** |

## สถานะรายโมดูล (end-to-end)
| โมดูล | อ่านข้อมูล (GET) | บันทึก (POST) |
|---|---|---|
| CLOPage | ❌ 401 (session) | ❌ 401 (session) |
| CLOManagement | ✅ (param ถูก) / ❌ (param FE) | ❌ auth path |
| CLOMap | ❌ parse error | ✅ |
| CourseReports | ❌ config path | — |
| CoursesPage | ❌ config path | ❌ config path |
| CourseStudents | ✅ (คะแนนเป็นค่าสุ่ม) | ⚠️ stub |
| Documents | ✅ | ❌ auth path |
| Grades | ❌ folder name | ❌ folder name |
| MyCourses | ✅ | — |

## สิ่งที่จะเห็นบนหน้าเว็บจริง (UI) เมื่อล็อกอินด้วย T001
ทำนายจากผลทดสอบ API จริง (UI แต่ละหน้าเรียก API เดียวกับที่ทดสอบไป)
| หน้า (เมนู) | สิ่งที่จะเห็นจริง |
|---|---|
| Login | ✅ ใส่ T001 / Test@1234 → เข้าระบบได้ |
| การจัดการ CLO รายวิชา (CLOPage) | Dropdown วิชาขึ้น ✅ แต่**พอเลือกวิชา → get-clos ตอบ 401 → axios interceptor เด้งออกกลับหน้า Login ทันที** (UX พังหนัก) |
| กำหนด CLO (CLOManagement) | หน้าโหลด แต่ดึง CLO ไม่ขึ้น (param `subject-code` ผิด) → toast "ไม่สามารถดึงข้อมูลได้", ตารางว่าง, เปอร์เซ็นรวม 0% |
| CLO Map | toast error + ตารางว่าง (API คืน PHP parse error ไม่ใช่ JSON) |
| รายงานผลการศึกษา (CourseReports) | toast error, dropdown ปี/วิชาว่าง, ไม่มีกราฟ (config.php path ผิด) |
| รายวิชาที่สอน (CoursesPage) | toast "ไม่สามารถดึงข้อมูลรายวิชาได้", ตารางว่าง (config.php path ผิด) |
| ผลสัมฤทธิ์ CLO รายบุคคล (CourseStudents) | ✅ ใช้งานได้ — เลือกวิชาแล้วเห็นคะแนน CLO (แต่เป็นค่าสุ่ม) + สถานะผ่าน/ไม่ผ่าน, ปุ่ม "ให้เกรด CLO" แสดง (T001 มีสิทธิ์) |
| อัปโหลดเอกสาร (Documents) | ✅ ตารางเอกสารขึ้น (TQF 3 - 103-111) แต่กด "อัปโหลด"/"ลบ" → toast error (auth_middleware path ผิด) |
| บันทึกเกรด (Grades) | toast error, dropdown วิชาว่าง (โฟลเดอร์ Grades/grading ไม่ตรง) |
| รายวิชาที่รับผิดชอบ (MyCourses) | ✅ การ์ดวิชา 103-111/103-112 ขึ้น, ความคืบหน้า CLO 0% |

> ข้อจำกัดสภาพแวดล้อม: Chrome ที่เชื่อมผ่าน extension เป็น cloud browser เข้าถึง `localhost` ของเครื่องนี้ไม่ได้ จึงขับ browser อัตโนมัติทดสอบ UI ไม่ได้ — ตารางนี้สรุปจากผล API จริงแทน (พฤติกรรม UI ถูกกำหนดโดย API เหล่านี้ทั้งหมด)

## รอบที่ 2 — ทดสอบบนฐานข้อมูลจริงของทีม (real DB, 2026-06-26)
โหลด `MYSQL_DATABASE (26-6-2569).sql` จากทีม (41 ตาราง, 11 users, 73 subjects, **0 enrollment**, 28 sidebar menus). ตั้งรหัสผ่านทดสอบ `Test@1234` ให้:
- `46172040` (role 1 Admin, 9 สิทธิ์) ✅ ล็อกอินได้
- `41172008` (role 2 Teacher, 0 สิทธิ์) ✅ ล็อกอินได้

ผล API บนข้อมูลจริง (admin session):
| โมดูล | ผลบน real DB |
|---|---|
| get-subjects | ✅ คืน 73 วิชาจริง |
| CLOManagement get | ✅ ทำงาน (course_clos ของ 103-111 ว่าง) |
| CourseStudents get | ✅ ทำงาน (ว่าง เพราะ enrollment=0) |
| Documents get | ✅ ทำงาน |
| CLOMap | 🐞 Parse error (merge conflict) — เหมือนเดิม |
| CourseReports / CoursesPage | 🐞 config.php path error — เหมือนเดิม |
| Grades | 🐞 folder name error — เหมือนเดิม |
| CLOPage get-clos | 🐞 401 (session_start หาย) — เหมือนเดิม |
| **MyCourses** | 🆕 **HTTP 500 "Unknown column 'user_id'"** — ตาราง `faculty` จริงไม่มีคอลัมน์ `user_id` (query ไม่ตรง schema จริง) |

🆕 ข้อสังเกตเพิ่ม: real DB **ไม่มีตาราง `clo`** เลย (หน้า CLOPage ที่ใช้ `clo` table จะใช้ไม่ได้บน schema จริง), sidebar admin แสดงเมนูฝั่ง Admin (จัดการผู้ใช้/สิทธิ์/นำเข้า-ส่งออก/Audit/อนุมัติ) — ทั้ง 9 โมดูล teacher เข้าผ่าน `?page=` ได้ (admin role 1 เข้าได้ทุกหน้า)

## รอบที่ 3 — ทดสอบผ่านหน้าเว็บจริง (UI walkthrough บน real DB, 2026-06-26)
ล็อกอิน UI ด้วย Admin `46172040 / Test@1234` (เห็นชื่อจริง "ภูมเดชา ชาญเบญญาพิภู", sidebar admin โหลดครบ, หน้าจัดการผู้ใช้แสดง 11 users จริง ✅) แล้วไล่ 9 โมดูลผ่าน `?page=` ถ่าย screenshot ทุกหน้า

| # | โมดูล (`?page=`) | ผลบนหน้าจอจริง | สาเหตุ |
|---|---|---|---|
| 1 | CoursesPage (`courses`) | 🐞 หน้าโหลด แต่ 0 วิชา/0 นศ. ตารางว่าง | get-my-courses ล้ม (config.php path) |
| 2 | MyCourses (`my-courses`) | 🐞 toast **"Request failed with status code 500"** ทุกการ์ด 0 | `faculty.user_id` ไม่มีในตารางจริง |
| 3 | CLOManagement (`clo-management`) | ⚠️ โหลดได้ แต่ 0 CLO/0%/0 PLO ตารางว่าง | FE ส่ง `subject-code` ≠ BE `subject_code` + วิชา hardcode |
| 4 | CLOMap (`clo-map`) | 🐞 ว่างเปล่า "ไม่มีรายวิชาในระบบ" ไม่มีคอลัมน์ PLO (เงียบ ไม่มี toast) | PHP Parse error (merge conflict) |
| 5 | CLOPage (`clos`) | 🐞 โหลด+dropdown ได้ แต่**เลือกวิชา → toast error + โดน logout เงียบ ๆ** | get-clos 401 (ลืม session_start) + axios 401 ล้าง localStorage |
| 6 | CourseReports (`course-report`) | 🐞 โครงหน้าโหลด แต่ตัวกรอง/สถิติ/กราฟว่างหมด | get-report-filters ล้ม (config.php path) |
| 7 | CourseStudents (`course-students`) | 🐞 **เข้าหน้าไม่ได้เลย** → ตกไป ProfilePage "ไม่พบข้อมูล หรือคุณยังไม่ได้เข้าสู่ระบบ" | key หายจาก array `teacherPages` ใน Index.tsx (switch case เป็น dead code) |
| 8 | Documents (`documents`) | ✅ **โหลดถูกต้อง** การ์ด+ค้นหา+ตารางครบ (ว่างเพราะไม่มีเอกสารใน DB) | ฝั่งดูใช้ได้ (อัปโหลดจะล้มจาก auth_middleware path) |
| 9 | Grades (`grades`) | 🐞 โครงหน้าโหลด แต่ Dropdown วิชาว่าง → ใช้ไม่ได้ | get-grading-data ล้ม (โฟลเดอร์ Grades≠grading) |

**สรุป UI:** จาก 9 โมดูล — ใช้งานได้จริง 1 (Documents-ดู), เหลือ 8 หน้าพัง/ว่างจากบั๊ก backend/frontend. บั๊กเด่นที่เห็นชัดบน UI: MyCourses 500, CLOPage ทำให้ logout เอง, CourseStudents เข้าไม่ถึง (routing).

## หมายเหตุ
บั๊กกลุ่ม A (config path / session_start / auth path) เป็นบั๊กเล็กระดับ 1 บรรทัด แก้แล้วจะปลดล็อกให้ทดสอบเชิงฟังก์ชันของ CourseReports/CoursesPage/CLOPage/Documents-write ได้ครบ — แต่ผมยังไม่แก้โค้ดระบบตามที่ตกลงไว้ (รอยืนยันจากผู้ใช้)
