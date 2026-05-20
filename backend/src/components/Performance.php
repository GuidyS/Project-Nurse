<?php
// ตั้งค่า Header เพื่ออนุญาตให้ Cross-Origin Resource Sharing (CORS) และตั้งค่าให้ตอบกลับเป็น JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// ตั้งค่าการเชื่อมต่อฐานข้อมูล (เปลี่ยนข้อมูลตามเซิร์ฟเวอร์ของคุณ)
$host = "localhost"; // หรือชื่อ host ของคุณ (เช่น "db" ตามไฟล์ sql)
$username = "root";
$password = "";
$database = "MYSQL_DATABASE";

try {
    // เชื่อมต่อฐานข้อมูลด้วย PDO
    $conn = new PDO("mysql:host=$host;dbname=$database;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // คำสั่ง SQL สำหรับดึงข้อมูล 
    // หมายเหตุ: โครงสร้าง SQL ด้านล่างเป็นการสมมติ join ระหว่างตาราง student และ assessments 
    // คุณสามารถปรับ Query ให้ตรงกับตารางเก็บคะแนนทักษะจริงๆ ของคุณได้
    $sql = "SELECT 
                s.student_id AS studentId,
                CONCAT(s.first_name, ' ', s.last_name) AS name,
                -- สมมติการดึงค่าคะแนนต่างๆ (คุณต้องแก้ให้ตรงกับโครงสร้างฟิลด์ของคุณ)
                4.5 AS skill, 
                4.8 AS attitude, 
                4.2 AS knowledge, 
                4.0 AS communication, 
                4.4 AS overall, 
                CURRENT_DATE() AS lastEval
            FROM student s
            -- ตัวอย่างการ JOIN ถ้ามีตารางเก็บผลคะแนน
            -- LEFT JOIN assessments a ON s.student_id = a.student_id
            LIMIT 50";

    $stmt = $conn->prepare($sql);
    $stmt->execute();

    // เก็บผลลัพธ์เป็น Array
    $performances = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // จัดฟอร์แมตข้อมูลให้ตรงกับที่ frontend ต้องการ
        $performances[] = array(
            "id" => uniqid(), // หรือใช้ ID จากตาราง
            "studentId" => $row['studentId'],
            "name" => $row['name'],
            "skill" => (float)$row['skill'],
            "attitude" => (float)$row['attitude'],
            "knowledge" => (float)$row['knowledge'],
            "communication" => (float)$row['communication'],
            "overall" => (float)$row['overall'],
            "lastEval" => $row['lastEval']
        );
    }

    // แปลง Array เป็น JSON และส่งกลับไปยัง Frontend
    echo json_encode($performances);

} catch(PDOException $e) {
    // จัดการ Error หากเชื่อมต่อหรือคิวรี่ข้อมูลไม่สำเร็จ
    echo json_encode(array("error" => "Connection failed: " . $e->getMessage()));
}
?>