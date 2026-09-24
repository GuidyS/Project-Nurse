# AGENTS.md - กฎหลักสำหรับ Nurse MIS

## 1. บริบทโปรเจค
- ระบบนี้เป็น MIS ของคณะพยาบาล สำหรับจัดการข้อมูลภายในคณะและข้อมูลผู้ใช้งานหลายบทบาท
- ข้อมูลส่วนใหญ่เป็นข้อมูลอ่อนไหว เช่น ข้อมูลนักศึกษา อาจารย์ การให้คำปรึกษา เอกสาร portfolio รายงานผู้บริหาร audit log และ import/export
- เอกสาร requirement หลัก: `Functional-Requirement NSP02.md`
- schema/ฐานข้อมูลหลัก: `MYSQL_DATABASE (19-8-2569).sql`
- คู่มือติดตั้งเดิม: `README.md`
- กฎไฟล์อัปโหลด: `backend/src/uploads/README.md`
- ขอบเขตล่าสุด: ระบบนี้ตัดเรื่องการให้เกรด/ให้คะแนนออกแล้ว ห้ามเพิ่ม flow เกรดหรือคะแนนใหม่

## 2. เทคโนโลยีที่ใช้
| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/Radix UI |
| ไลบรารี Frontend | Axios, React Query, React Router, lucide-react, zod, xlsx, jsPDF |
| Backend | PHP 8.2 + Apache, PDO MySQL, PHP Session |
| ไลบรารี Backend | PhpSpreadsheet ผ่าน Composer |
| Database | MySQL อ้างอิง schema จาก `MYSQL_DATABASE (3-8-2569).sql` |
| Infra | Docker Compose, phpMyAdmin, timezone `Asia/Bangkok` |

## 3. รูปแบบสถาปัตยกรรม
- Frontend เป็น SPA อยู่ใน `frontend/src`
- routing หลักเริ่มจาก `frontend/src/App.tsx` และ `frontend/src/pages/Index.tsx`
- หน้าตามบทบาทอยู่ใน `frontend/src/components/pages/{Admin,Teacher,Student,Auth}`
- component กลางและ UI primitives อยู่ใน `frontend/src/components/ui`
- layout และ sidebar อยู่ใน `frontend/src/components/layout`
- API client กลางคือ `frontend/src/lib/axios.ts`
- password policy ฝั่ง client อยู่ที่ `frontend/src/lib/passwordPolicy.ts`
- Backend ใช้ `backend/src/index.php?page=...` เป็น API router
- endpoint ฝั่ง backend แยกตาม feature ใน `backend/src/components/**`
- middleware ตรวจ session อยู่ที่ `backend/src/components/middlewares/auth_middleware.php`
- การเชื่อมต่อฐานข้อมูลอยู่ที่ `backend/src/config/config.php`
- root สำหรับไฟล์อัปโหลดมีที่เดียวคือ `backend/src/uploads/`

## 4. การติดตั้งและรัน
| งาน | คำสั่ง / URL |
| --- | --- |
| รันทุก service | `docker compose up --build` |
| เปิด Frontend | `http://localhost:5173` |
| เปิด Backend API | `http://localhost:8080/index.php?page=<endpoint>` |
| เปิด phpMyAdmin | `http://localhost:8081` |
| MySQL host ใน Docker | `db:3306` |
| MySQL host จากเครื่อง host | `localhost:9906` |
| ติดตั้ง frontend dependencies | `cd frontend && npm install` |
| รัน frontend dev server | `cd frontend && npm run dev` |
| preview frontend build | `cd frontend && npm run preview` |

- ไฟล์ env ฝั่ง frontend ที่ต้องมี: `frontend/src/.env`
- ค่าที่ต้องมี: `VITE_API_BASE_URL=http://localhost:8080`
- backend config ปัจจุบันอ่านค่าเชื่อมต่อ DB จาก `backend/src/config/config.php`
- ห้าม commit secret จริงของ production ลง `config.php`, `.env`, SQL dump หรือเอกสาร

## 5. การทดสอบและตรวจสอบ
| ส่วนที่ตรวจ | วิธีตรวจขั้นต่ำ |
| --- | --- |
| lint ฝั่ง frontend | `cd frontend && npm run lint` |
| build ฝั่ง frontend | `cd frontend && npm run build` |
| syntax ฝั่ง backend | รัน `php -l` กับไฟล์ PHP ที่แก้ ถ้าเครื่องมี PHP |
| API smoke test | ตรวจ endpoint ที่กระทบผ่าน `index.php?page=...` |
| auth/session | ตรวจ login, session หมดอายุ, 401 handling, การมองเห็นตาม role |
| uploads | ตรวจชนิดไฟล์ ขนาดไฟล์ owner path และสิทธิ์ download/delete |
| import/export | ใช้ข้อมูลทดสอบเท่านั้น ห้ามใช้ dump จริงถ้าไม่ได้รับอนุญาต |

- ยังไม่พบ automated test suite โดยตรง ถ้าใช้ manual test ต้องรายงานให้ชัด
- งานที่แตะ DB ต้องเทียบ schema กับ `MYSQL_DATABASE (3-8-2569).sql`
- งานที่แตะสิทธิ์ ต้องทดสอบอย่างน้อยบทบาท Admin/SuperAdmin, Teacher และ Student เมื่อทำได้
- ห้ามเพิ่มหรือทดสอบ flow เกรด/คะแนน เว้นแต่ผู้ใช้สั่งเปลี่ยนขอบเขตกลับอย่างชัดเจน

## 6. กฎการเขียนโค้ด
- แก้เฉพาะ scope ของงานที่ได้รับมอบหมาย หลีกเลี่ยง refactor ที่ไม่เกี่ยวข้อง
- ฝั่ง PHP ให้คงรูปแบบ endpoint แยกไฟล์ตาม `backend/src/components/<Role>/<Feature>/`
- endpoint ใหม่ต้องลงทะเบียนใน `backend/src/index.php` ตาม pattern `page` switch เดิม
- SQL ที่รับค่าจากผู้ใช้ต้องใช้ PDO prepared statements เสมอ
- response ควรเป็น JSON ที่มี `status`, `message` และข้อมูล ตามรูปแบบ endpoint ใกล้เคียง
- ฝั่ง frontend ให้เรียก API ผ่าน `@/lib/axios` เพื่อรักษา cookie/session behavior เดิม
- ใช้ alias `@/` สำหรับ import ใน frontend
- ใช้ component เดิมจาก shadcn/Radix ก่อนสร้าง abstraction ใหม่
- รักษาข้อความภาษาไทยใน UI และบันทึกไฟล์เป็น UTF-8
- TypeScript config ปัจจุบันค่อนข้างผ่อนปรน ให้ปรับ type เฉพาะจุดที่ช่วยลด bug จริง
- หลีกเลี่ยงการแก้ `vendor/`, `node_modules/`, `mysql-data/`, dump ที่สร้างแล้ว หรือไฟล์อัปโหลดของผู้ใช้

## 7. กฎความปลอดภัย
| ควรทำ | ห้ามทำ |
| --- | --- |
| ปฏิบัติกับข้อมูลผู้ใช้/อาจารย์/นักศึกษาเป็นข้อมูลลับ | ห้าม paste sensitive record ลง chat, log, doc หรือ test output |
| ตรวจสิทธิ์ที่ backend endpoint เสมอ | ห้ามพึ่ง frontend `HasPermission` หรือการซ่อนปุ่มอย่างเดียว |
| รักษาพฤติกรรม PHP session cookie เดิม | ห้ามลดความปลอดภัยของ `httponly`, `samesite` หรือ Axios credentials |
| validate input และใช้ prepared SQL | ห้ามต่อ SQL จาก request value โดยตรง |
| validate upload ตามชนิด ขนาด path และ owner | ห้ามสร้าง upload root นอก `backend/src/uploads/` |
| รักษา auditability ของ admin/import/export | ห้ามลบ audit/import history โดยไม่จำเป็น |
| redact secret และข้อมูลส่วนบุคคลในรายงาน | ห้ามเปิดเผย DB password, SQL dump rows, uploaded files หรือ session IDs |
| ขออนุญาตก่อนทำ DB/import action ที่ทำลายข้อมูล | ห้าม run migration/import กับข้อมูลจริงโดยไม่ได้รับอนุญาต |

- helper เรื่อง password hashing/policy อยู่ที่ `backend/src/components/Auth/password_helpers.php`
- ห้ามลดระดับ Argon2ID hashing, rate limiting, password policy หรือ session setup
- ห้ามขยาย CORS เกิน origin ที่จำเป็นโดยไม่มีเหตุผลด้านระบบ
- endpoint สำหรับ report/export ต้องตรวจ role, ownership และขอบเขตข้อมูลอ่อนไหวเสมอ
- endpoint download/delete ต้องป้องกัน path traversal และ cross-user access

## 8. ขอบเขตฟังก์ชัน
- Admin/SuperAdmin: users, roles, reports, approvals, audit logs, import/export
- Teacher: นักศึกษาที่รับผิดชอบ, advising notes, curriculum/CLO/PLO/YLO, projects, documents, performance, tasks, evidence
- Student: profile, notifications, transcript/portfolio, document upload/download
- รายงานระดับผู้บริหารอาจมีข้อมูลสรุปที่อ่อนไหว ต้องจำกัดสิทธิ์ให้แคบ
- grade/score features อยู่นอก scope ตามคำสั่งล่าสุด แม้ไฟล์เก่าจะยังอยู่ใน repo
- ถ้าจำเป็นต้องแตะโค้ดเกรด/คะแนนเพราะงานข้างเคียง ห้ามขยาย behavior และให้แยกผลกระทบให้ชัด

## 9. path สำคัญ
| จุดประสงค์ | path |
| --- | --- |
| คู่มือติดตั้งโปรเจค | `README.md` |
| functional requirements | `Functional-Requirement NSP02.md` |
| DB dump/schema หลัก | `MYSQL_DATABASE (3-8-2569).sql` |
| Docker services | `docker-compose.yml` |
| package/scripts ฝั่ง frontend | `frontend/package.json` |
| root ของ frontend app | `frontend/src/App.tsx` |
| frontend pages | `frontend/src/components/pages/` |
| frontend UI kit | `frontend/src/components/ui/` |
| Axios client | `frontend/src/lib/axios.ts` |
| backend API router | `backend/src/index.php` |
| backend features | `backend/src/components/` |
| DB config | `backend/src/config/config.php` |
| upload policy/root | `backend/src/uploads/README.md` |

## 10. การรายงานผลหลังทำงาน
- สรุปไฟล์ที่แก้ และ behavior ที่ผู้ใช้จะเห็น
- ระบุผลกระทบด้านความปลอดภัย เช่น auth, permission, sensitive data, upload, DB หรือ report/export
- ระบุคำสั่ง test/check ที่รัน พร้อมผลลัพธ์
- ระบุ test ที่ไม่ได้รันและเหตุผล
- ระบุ DB/schema changes, migrations, import/export steps หรือ manual setup ที่ต้องทำ
- แจ้ง mismatch ระหว่างเอกสาร โค้ด และ scope ล่าสุด โดยเฉพาะ React 22 หรือการตัด grade/score ออก
- ห้ามใส่ข้อมูลส่วนบุคคลจริง credential, raw SQL dump rows, uploaded file contents หรือ session token ในรายงาน
