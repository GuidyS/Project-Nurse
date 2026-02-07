<?php

    require_once __DIR__ . '/../../config/config.php';

    class API {
        // แสดงข้อมูลส่วนตัว user
        function Select() {
            
            // รับค่า id หรือถ้าไม่มีให้ใช้ default (เพื่อการทดสอบ)
            $id = isset($_GET['id']);

            $db = new Connect;
            
            // เตรียม SQL
            $stmt = $db->prepare("SELECT * FROM student WHERE id = :id");
            $stmt->execute(['id' => $id]);

            // ใช้ fetch ธรรมดา (ไม่ loop) เพราะเอาแค่คนเดียว
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                // สร้าง array ก้อนเดียว (ไม่ต้องมี [] ต่อท้าย $user)
                $user = array(
                    'id' => $result['id'],
                    'title' => $result['title'],
                    'first_name' => $result['first_name'],
                    'last_name' => $result['last_name'],
                );
                
                return json_encode($user);
            } else {
                return json_encode(null); // ถ้าไม่เจอให้ส่ง null
            }
        }

        // แก้ไข profile
        function Edit() {
            
        }
    }

    $API = new API;

    // เรียกใช้ฟังก์ชันเปล่าๆ ไม่ต้องส่ง $id เข้าไป
    echo $API->Select();

?>