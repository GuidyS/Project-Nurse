<?php
//เป็นการบอกกฎเกณฑ์การเข้าใช้งาน API นี้
//(Allow-Origin: *) คือการ "เปิดประตู" ให้อนุญาตให้หน้าเว็บ React จากโดเมนไหนก็ได้เข้ามาเรียกใช้งาน API นี้ได้
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
//บรรทัดสุดท้ายกำหนดว่าข้อมูลที่จะส่งกลับไปหาหน้าเว็บจะเป็นรูปแบบ JSON และรองรับ UTF-8 (อ่านภาษาไทยได้)
header("Content-Type: application/json; charset=UTF-8");
//จัดการคำขอแบบพิเศษที่เรียกว่า OPTIONS    
// ก่อนที่ React (Axios) จะส่งข้อมูล POST มา เบราว์เซอร์จะส่งคำขอ OPTIONS มา "API นี้รองรับ POST ไหม?" บรรทัดนี้จะตอบกลับไปว่า "ได้เลย ส่งมาเลย (Code 200)" แล้วจบการทำงานทันที
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
//ดึงข้อมูลที่ React ส่งมา  React ส่งข้อมูลมาเป็นก้อน JSON  โค้ดส่วนนี้จะแกะกล่อง JSON นั้นออกมาเป็น Array ใน PHP เก็บไว้ในตัวแปร $input
$input = json_decode(file_get_contents("php://input"), true);
//เช็กว่าส่งข้อมูลสำคัญมาครบไหมเช็กว่ามีข้อมูลส่งมา ($input) และมี subject_id กับ description ครบถ้วน ถ้าส่งมาครบ ก็จะเข้าไปทำงานในปีกกา แต่ถ้าขาดอันใดอันหนึ่งจะเด้งไปที่ else ด้านล่างสุด (แจ้งเตือน Missing required fields)
if ($input && isset($input['subject_id']) && isset($input['description'])) {
    try {
        // เพิ่มข้อมูลลงตาราง clo (เก็บแค่ ylo_id ก็พอ เพราะมันโยงไปหา plo ได้เอง)
        //เขียนข้อมูลลงฐานข้อมูลจริงๆ
      
       
        $sql = "INSERT INTO clo (subject_id, description, ylo_id) VALUES (:subject_id, :description, :ylo_id)";
        //$stmt = $pdo->prepare(...) : เป็นการเตรียมคำสั่ง SQL
        $stmt = $pdo->prepare($sql);
         //$stmt->execute([...]) : นำข้อมูลที่รับมาจาก React ยัดใส่ลงไปใน SQL แล้วสั่งทำงาน
        $stmt->execute([
            ':subject_id' => $input['subject_id'],
            ':description' => $input['description'],
            ':ylo_id' => $input['ylo_id'] ?? null
        ]);
        // //$stmt->execute([...]) : นำข้อมูลที่รับมาจาก React ยัดใส่ลงไปใน SQL แล้วสั่งทำงาน
        echo json_encode(["status" => "success", "message" => "CLO added successfully", "new_id" => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
}
?>