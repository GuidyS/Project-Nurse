# ติดตั้ง Nurse MIS บน Hostinger Web/Cloud Hosting

แพ็กเกจนี้ใช้โดเมนเดียว: หน้าเว็บที่ `/` และ PHP API ที่ `/api/index.php?page=...` บน Apache/PHP ไม่ต้องรัน Docker หรือ Node.js บนโฮสต์

## สร้างไฟล์อัปโหลด

บนเครื่องพัฒนา ให้ติดตั้ง frontend dependencies (`npm ci` ใน `frontend/`) แล้วรันจาก root โปรเจกต์:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\hostinger\build-package.ps1
```

จะได้ `deploy/hostinger/output/nurse-mis-hostinger-webroot-<timestamp>.zip` ภายในเป็น **เนื้อหาที่ต้องอยู่ใน `public_html/` โดยตรง** (`index.html`, `.htaccess`, `api/` ฯลฯ) ไฟล์ตัวอย่างการตั้งค่า DB อยู่ในโฟลเดอร์ผลลัพธ์ที่แตกไว้บนเครื่องเท่านั้น แพ็กเกจไม่มีไฟล์อัปโหลดเดิม, SQL dump, `.env`, หรือรหัสผ่านจริง ส่วน backend `vendor/` ติดไปด้วย จึงไม่ต้องรัน Composer บน Hostinger

## ก่อนนำขึ้นโฮสต์

1. ตรวจว่าแผน Hostinger รองรับ Apache `.htaccess`, PHP **8.2 ขึ้นไปแบบ 64-bit**, MySQL และส่วนขยาย `pdo_mysql`, `mbstring`, `gd`, `zip`, `xml`, `dom`, `simplexml`, `xmlreader`, `xmlwriter`, `fileinfo`, `iconv`, `zlib` และ `openssl` (ถ้าใช้อีเมล) เลือกค่า PHP ที่ hPanel → PHP Configuration
2. ตั้ง HTTPS/SSL สำหรับโดเมน และเลือกโฟลเดอร์เว็บไซต์ที่ใช้ `public_html` หากเป็น subdomain ให้ใช้ document root ของ subdomain นั้นแทน
3. สร้างฐานข้อมูล MySQL และผู้ใช้ DB ใน hPanel จากนั้นนำ **schema/ข้อมูลที่ได้รับอนุมัติ** เข้าผ่าน phpMyAdmin แยกต่างหาก ห้ามนำ `db-cleanup.sql` ไปใช้เป็น schema ปัจจุบัน และห้าม import dump จริงโดยไม่ตรวจสิทธิ์/การสำรองข้อมูล
4. ไฟล์ schema หลัก `MYSQL_DATABASE.sql` / `MYSQL_DATABASE (3-8-2569).sql` ไม่มีอยู่ใน workspace ที่ใช้สร้างแพ็กเกจนี้ จึงไม่ได้รวมใน ZIP และยังตรวจความเข้ากันได้ของ schema ไม่ได้

## อัปโหลด

1. อัปโหลด ZIP ไปยัง Hostinger File Manager แล้ว Extract โดยตั้ง folder name เป็น `public_html` และ destination เป็นโฟลเดอร์หลัก `/files/` พร้อมเลือก Overwrite existing files (สำรองเว็บเดิมก่อน) ต้องได้ `public_html/index.html`, `public_html/.htaccess`, `public_html/api/index.php` และ `public_html/api/.htaccess` โดยตรง อย่าสร้าง `public_html/public_html/` ซ้อนกัน
2. คัดลอก `config.local.example.php` เป็น `public_html/api/config/config.local.php` แล้วกรอก host, port, ชื่อ DB, ผู้ใช้ และรหัสผ่านจริงจาก hPanel **บนโฮสต์เท่านั้น** ไฟล์นี้ถูก `.htaccess` ปิดการเข้าถึงผ่านเว็บ ห้ามใส่ค่าจริงใน ZIP หรือ commit
3. ตั้ง timezone PHP เป็น `Asia/Bangkok` และปรับ `upload_max_filesize` อย่างน้อย 50 MB, `post_max_size` อย่างน้อย 120 MB, `max_file_uploads` อย่างน้อย 50 ผ่าน PHP Configuration ตามความจำเป็นของงานอัปโหลด
4. ให้ PHP เขียนใน `api/uploads/` และโฟลเดอร์ย่อยได้ ใช้สิทธิ์ที่จำเป็นตามบัญชีโฮสต์ หลีกเลี่ยง `777`
5. หากต้องการส่งอีเมล ต้องจัดค่า `SMTP_*`, `APP_URL` และ `PROJECT_REMINDER_EMAIL` ให้ process PHP อ่านผ่าน environment ของโฮสต์ได้ โค้ดปัจจุบันยังไม่มีไฟล์ config สำหรับ SMTP บน shared hosting; หาก Hostinger ไม่เปิดให้ตั้ง environment ค่า SMTP จะยังใช้ไม่ได้ แต่แจ้งเตือนในระบบยังทำงานได้

## ตรวจหลังอัปโหลด

- เปิด `https://<domain>/` ต้องเห็นหน้าล็อกอิน และ refresh หน้าได้
- เปิด `https://<domain>/api/index.php?page=login` ต้องได้ JSON หรือข้อความจาก endpoint ไม่ใช่ source PHP
- เปิด `https://<domain>/api/config/config.php` และ `/api/components/Auth/login.php` ต้องได้ 403
- ทดสอบ login และ logout ด้วยบัญชีทดสอบของ Admin/SuperAdmin, Teacher, Student รวมทั้ง session หมดอายุและการอัปโหลด/ดาวน์โหลดเอกสารที่ได้รับอนุญาต
- ทดสอบ import/export ด้วยข้อมูลทดสอบเท่านั้น และตรวจ audit log

## ข้อจำกัดและความปลอดภัย

- แอปเดิมใช้ URL ไฟล์อัปโหลดแบบตรง (`/api/uploads/...`) หลายจุด ดังนั้นไฟล์ที่อยู่ในหมวดอื่นนอกจาก `imports` ยังอาจเปิดได้โดยผู้ที่ทราบ URL แม้ไม่มี session **อย่านำข้อมูลส่วนบุคคลจริงขึ้น production จนกว่าจะปรับ endpoint ดาวน์โหลดให้ตรวจสิทธิ์และปิดการเสิร์ฟไฟล์โดยตรง**
- ไม่มีไฟล์อัปโหลดเดิมในแพ็กเกจ หากเป็นการย้ายระบบจริงต้องย้ายด้วยขั้นตอนเฉพาะที่ได้รับอนุญาตและรักษา owner/path ของไฟล์
- งาน cron `api/cron/*.php` ถูกปิดจากเว็บ หากต้องการตั้ง Hostinger Cron Jobs ให้เรียก PHP CLI ไปที่ไฟล์ดังกล่าวโดยตรงหลังตรวจสิทธิ์และ path ของบัญชีโฮสต์
- `README.md` เดิมระบุไฟล์ env ที่ `frontend/src/.env` แต่ตัวแปร Vite ควรอยู่ที่ `frontend/.env` หรือ process environment; build script นี้กำหนด `VITE_API_BASE_URL=/api` ผ่าน process environment โดยตรง
- ขอบเขตล่าสุดตัด grade/score ออก แพ็กเกจนี้ไม่ได้เพิ่ม flow ดังกล่าว แต่ยังมีไฟล์เก่าใน backend ที่ควรตรวจแยกก่อนใช้งานจริง
