# 🛠️ Configuration & Environment Setup

รายละเอียดการตั้งค่าระบบเชื่อมต่อฐานข้อมูล (Backend) และกำหนดค่าตัวแปรสภาพแวดล้อม (Frontend) สำหรับโปรเจกต์ **Nurse Management System**

---

### 1. Backend Configuration (PHP)
สร้างโครงสร้างโฟลเดอร์และไฟล์สำหรับการเชื่อมต่อฐานข้อมูลผ่าน PDO:

* ***สร้างโฟลเดอร์ config ภายใน `backend/src/` ก่อน
* **Directory:** `backend/src/config/`
* **File:** `config.php`

**Source Code:**
```
<?php
    class Connect extends PDO {
        public function __construct() {
            // 1. เพิ่ม ;charset=utf8mb4 ต่อท้ายชื่อ Database
            $dsn = "mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4";
            $username = "MYSQL_USER"; 
            $password = "MYSQL_PASSWORD";

            try {
                // ส่งค่าเข้าไปเชื่อมต่อ
                parent::__construct($dsn, $username, $password);
                
                // ตั้งค่า Error Mode
                $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                
                // 2. บังคับคำสั่งนี้เพื่อให้มั่นใจว่าภาษาไทยจะไม่เพี้ยน
                $this->exec("set names utf8mb4");
                
            } catch (PDOException $e) {
                // ถ้าเชื่อมต่อไม่ได้ ให้แสดง Error ออกมาดู
                echo "Connection failed: " . $e->getMessage();
                exit;
            }
        }
    }
?>
```

2. Frontend Environment Setup (Vite)
กำหนด URL หลักสำหรับเรียกใช้งาน API:

* **Directory:** `frontend/src/`
* **File:** `.env`

**Source Code:**
```
# Base URL สำหรับเชื่อมต่อ Backend API
VITE_API_BASE_URL = http://localhost:8080
```

---

***อย่าลืมอัปเดต database ให้เป็นล่าสุดด้วย
