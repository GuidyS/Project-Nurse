<?php

//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}
   try {
    if (isset($input['clo_id'])) {
        //ขียนคำสั่งลบข้อมูล (DELETE) จากตาราง clo ตรงจุดที่ clo_id มีค่าเท่ากับ :id
       $sql = "DELETE FROM clo WHERE clo_id = :clo_id";
        //(prepare): สั่งให้ฐานข้อมูลเตรียมตัวรับคำสั่งนี้
        $stmt = $pdo->prepare($sql);
        //(execute): สั่งยิงคำสั่ง! โดยเอาค่า ID จริงๆ ที่รับมาจากหน้าเว็บไปใส่แทนที่คำว่า :id
       $stmt->execute([':clo_id' => $input['clo_id']]);

        echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบ ID ที่ต้องการลบ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
?>