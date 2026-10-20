# ชุดแก้ API ของ Nurse MIS สำหรับ Hostinger

อัปเดต 20 ตุลาคม 2569 — ชุดนี้รวบรวม **ไฟล์ที่แก้และตรวจบน `nursemis.com` แล้ว** สำหรับปัญหาการเชื่อมต่อฐานข้อมูลและการอ่านข้อมูลในหน้าแจ้งเตือน, CLO Map, CLO รายวิชา และคลังเอกสาร เป็นแพตช์สำหรับเว็บ Nurse MIS ที่ติดตั้งอยู่แล้ว ไม่ใช่ backend ทั้งระบบ

ไฟล์พร้อมอัปโหลด: [`api-hostinger-fixes-20261020.zip`](api-hostinger-fixes-20261020.zip) ภายใน ZIP เริ่มที่ `api/` และไม่มีรหัสผ่านจริง, SQL dump, `.env`, `config.local.php` หรือไฟล์อัปโหลดของผู้ใช้

## ไฟล์ในชุด

| ปลายทางภายใต้ `public_html/` | จุดที่แก้ |
| --- | --- |
| `api/.htaccess` | ให้เรียก PHP ผ่าน `api/index.php` และปิดการเข้าถึง `config/`, `components/`, `cron/`, `vendor/` โดยตรง |
| `api/config/config.php` | อ่านค่า DB จาก environment หรือ `config.local.php` และสร้าง PDO ผ่าน `new Connect()` |
| `api/components/NotificationPage/get_notifications.php` | ใช้ `Connect` และชื่อ SQL parameter ไม่ซ้ำกันเมื่อปิด PDO emulated prepares |
| `api/components/NotificationPage/{get_student_notifications,send_notification,get_settings,save_settings,mark_read,delete_notification}.php` | ใช้ `Connect` แทนค่า DB ของ Docker |
| `api/components/Teacher/CLOMap/get_clo_map.php` | ใช้ `Connect` เพื่อโหลด CLO Map |
| `api/components/Teacher/CLOPage/{get_subjects,get_clos}.php` | ใช้ `Connect` เพื่อโหลดรายวิชาและ CLO |
| `api/components/Teacher/Documents/{get_documents,download_document}.php` | ใช้ `Connect`, ตรวจ session/role, สร้างลิงก์ `/api/...` แทน `localhost` และจำกัด path ดาวน์โหลดไว้ใต้ `api/uploads/` |

### โค้ดหลักที่ต้องใช้ร่วมกัน

ทุก endpoint ที่ต้องเชื่อมฐานข้อมูลควรใช้ `Connect` จาก `api/config/config.php`:

```php
require_once __DIR__ . '/../../../config/config.php';
$pdo = new Connect();
```

จำนวน `../` ขึ้นอยู่กับตำแหน่งไฟล์ เช่น endpoint ใน `NotificationPage/` ใช้ `../../config/config.php` ส่วนใน `Teacher/` ใช้ `../../../config/config.php` ให้ใช้ไฟล์จริงใน ZIP เป็นหลัก

เมื่อ `PDO::ATTR_EMULATE_PREPARES` เป็น `false` อย่าใช้ชื่อ parameter เดิมซ้ำใน SQL เดียวกัน ตัวอย่างจาก `get_notifications.php`:

```php
WHERE (n.user_id = :recipient_user_id OR n.sender_user_id = :sender_user_id)

$stmt->execute([
    ':current_user_id' => $user_id,
    ':recipient_user_id' => $user_id,
    ':sender_user_id' => $user_id,
    ':hidden_user_id' => $user_id,
]);
```

ลิงก์ API จากเว็บที่อยู่โดเมนเดียวกันใช้ path แบบ relative ต่อโดเมน:

```php
$downloadUrl = '/api/index.php?page=download-document&id=' . rawurlencode((string) $doc['id']);
```

## ตั้งค่า DB บน Hostinger

สร้าง `public_html/api/config/config.local.php` **บนโฮสต์** จาก [`config.local.example.php`](config.local.example.php) และกรอกค่าจริงจาก hPanel เท่านั้น ตัวอย่างโครงสร้างที่ไม่มี secret:

```php
<?php
return [
    'database' => [
        'host' => 'localhost',
        'port' => '3306',
        'name' => 'HOSTINGER_DATABASE_NAME',
        'user' => 'HOSTINGER_DATABASE_USER',
        'password' => 'HOSTINGER_DATABASE_PASSWORD',
    ],
];
```

ค่า `host` จริงต้องตรวจจาก hPanel ของบัญชีนั้น `config.php` ยังมีค่าเริ่มต้นของ Docker สำหรับพัฒนาในเครื่อง หากไม่มี environment หรือ `config.local.php` บน Hostinger ระบบจะกลับไปใช้ค่าเริ่มต้นดังกล่าวและเชื่อม DB ไม่ได้

## วิธีอัปเดตไฟล์

1. สำรอง `public_html/api/` ปัจจุบันก่อน และเก็บไฟล์สำรองไว้นอก `public_html/`
2. อัปโหลด ZIP ไปที่โฟลเดอร์หลัก `/files/` ใน Hostinger File Manager
3. Extract โดยเลือกปลายทาง `/files/`, ตั้งชื่อโฟลเดอร์ `public_html` และเลือก **Overwrite existing files** ผลลัพธ์ต้องเป็น `public_html/api/config/config.php` และ `public_html/api/components/...` โดยไม่สร้าง `public_html/public_html/` ซ้อนกัน
4. ตรวจว่า `public_html/api/config/config.local.php` ที่มีค่าจริงยังอยู่ ZIP นี้ไม่มีไฟล์ดังกล่าวและไม่ควรนำออกเผยแพร่
5. หาก build frontend ใหม่ ให้กำหนด `VITE_API_BASE_URL=/api` ตอน build; production ต้องเรียก `/api/index.php?page=...` บนโดเมนเดียวกัน
6. หลังตรวจแล้ว ย้าย ZIP ที่อัปโหลดออกจาก `public_html/` หากอัปโหลดไว้ในพื้นที่เว็บ

## ตรวจหลังติดตั้ง

- เปิดหน้าแจ้งเตือน, CLO Map, CLO รายวิชา และคลังเอกสารด้วยบัญชีที่ได้รับอนุญาต ข้อมูลต้องโหลดโดยไม่ขึ้น toast สีแดง
- เรียก `https://<domain>/api/index.php?page=get-documents` โดยไม่ล็อกอิน ต้องได้ HTTP `401`; เช่นเดียวกับ `get-notifications`, `get-clo-map`, `get-subjects`, `get-clos` และ `download-document`
- เปิด `https://<domain>/api/config/config.php` และไฟล์ใต้ `api/components/` โดยตรง ต้องได้ HTTP `403`
- ตรวจว่าไม่มี URL `localhost` ใน Network ของหน้า production

ในการตรวจครั้งล่าสุดบน `nursemis.com` หน้าแจ้งเตือน, CLO Map, CLO รายวิชา และคลังเอกสารโหลดได้; API ที่ทดสอบโดยไม่ล็อกอินตอบ `401` ไม่มี migration หรือ import ฐานข้อมูลในชุดนี้

## ขอบเขตที่ยังไม่รวม

- API สำหรับ **บันทึก** CLO Map และ **อัปโหลด/ลบ** เอกสารบางไฟล์ยังใช้ค่า DB ของ Docker ชุดนี้แก้ส่วนการอ่านข้อมูลที่ตรวจพบจากหน้าจอเท่านั้น ไม่ควรถือว่าปุ่มเขียนข้อมูลเหล่านั้นผ่านการทดสอบบน Hostinger
- endpoint เก่าอื่นในโปรเจกต์ยังอาจมี `mysql:host=db` ต้องตรวจและแก้ทีละ feature พร้อมตรวจสิทธิ์ backend ก่อนเปิดใช้งานจริง
- โค้ดหน้า CLO ยังมีส่วนคะแนนเดิม ทั้งที่ขอบเขตล่าสุดของโครงการตัด grade/score ออก ชุดนี้ไม่ได้เพิ่มหรือทดสอบ flow คะแนน
- ZIP นี้ต้องใช้ร่วมกับ router, helper, vendor และ schema เดิมของ Nurse MIS ไม่สามารถใช้เป็นระบบใหม่แบบ standalone ได้
