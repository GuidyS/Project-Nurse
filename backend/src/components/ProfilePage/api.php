<?php

    require_once __DIR__ . '/../../config/config.php';

    // เริ่ม Session เพื่อให้เข้าถึง $_SESSION['user_id'] ได้
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    class API {
        function Select() {
            // [จุดเปลี่ยนสำคัญ] 
            // 1. ลองดูว่ามีการส่ง ?id=... มาไหม (กรณี Admin ดูกลุ่มคนอื่น)
            // 2. ถ้าไม่มี ให้ดูว่า Login อยู่ไหม ($_SESSION['user_id'])
            // 3. ถ้าไม่มีทั้งคู่ ให้เป็น null
            
            $id = null;

            if (isset($_GET['id'])) {
                $id = $_GET['id']; 
            } elseif (isset($_SESSION['user_id'])) {
                $id = $_SESSION['user_id']; // ดึงจากคนที่ Login อยู่
            }

            // ถ้าไม่มี ID เลย (ไม่ได้ Login และไม่ส่งค่ามา) ให้จบการทำงาน
            if (!$id) {
                return json_encode(["error" => "Unauthorized / No ID provided"]);
            }

            $db = new Connect;
            
            // Query ข้อมูล
            // หมายเหตุ: เช็คให้แน่ใจว่าในตาราง faculty คุณเก็บ user_id หรือ faculty_id ตรงกับ $_SESSION
            // ถ้า $_SESSION เก็บ user_id (จากตาราง users) SQL ควรจะเป็น:
            // "SELECT * FROM faculty WHERE user_id = :id"
            // แต่ถ้าเก็บ faculty_id ก็ใช้แบบเดิมได้เลย
            
            $sql = "SELECT * FROM faculty WHERE id = :id OR user_id = :id"; 
            // ใช้ OR เพื่อกันเหนียว เผื่อ Session เก็บค่าไหนมาก็ให้หาเจอ
            
            $stmt = $db->prepare($sql);
            $stmt->execute(['id' => $id]); 

            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $user = array(
                    'id' => $result['id'],
                    'title' => $result['title'],
                    'first_name' => $result['first_name_th'],
                    'last_name' => $result['last_name_th'],
                );
                return json_encode($user);
            } else {
                return json_encode(["error" => "User not found"]); 
            }
        }
    }

    $API = new API;

    // Headers (สำคัญมากสำหรับการทำ API)
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, POST");
    header("Access-Control-Allow-Credentials: true"); // อนุญาตให้ส่ง Cookie/Session

    // เรียกใช้ฟังก์ชัน
    echo $API->Select();

?>