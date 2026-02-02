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