<?php
// === เปลี่ยน Header ชุดนี้ให้เหมือนกันทุกไฟล์ ===
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// ... (โค้ดเดิมที่เหลือปล่อยไว้เหมือนเดิมได้เลยครับ)
//ทำไมหน้านี้ถึงไม่ต้องมี Allow-Methods: POST, OPTIONS ? เพราะไฟล์นี้ใช้สำหรับ ดึงข้อมูล (GET) อย่างเดียว ไม่ได้ใช้ส่งข้อมูล (POST)"
//ทำไมหน้านี้ถึงไม่ต้องมี Content-Type  เพราะเราไม่ได้ส่งข้อมูลก้อน JSON "เข้าไป" ในไฟล์นี้ เราแค่ส่งเลข ID ผ่าน URL ไปเฉยๆ
header("Content-Type: application/json; charset=UTF-8");
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
//รับค่ารหัสวิชาจาก URL ที่ React ส่งมา
$subject_id = $_GET['subject_id'] ?? 0;

try {
    // 1. CONCAT('CLO', c.clo_id) คือการเอาคำว่า CLO แปะหน้าเลข ID
    // 2. JOIN ylo และ plo เพื่อดึงชื่อ PLO/YLO มาแสดงผล
    // LEFT JOIN ทะลุจาก clo -> ylo -> plo ตาม ER
    //COALESCE(..., '-'): เป็นตัวดักว่า "ถ้า CLO นี้ยังไม่ได้ผูกกับ YLO/PLO ให้แสดงเครื่องหมายขีด (-) แทนนะ" ไม่งั้นเดี๋ยวมันจะ Error 
    $sql = "SELECT 
                c.clo_id AS id, 
                CONCAT('CLO', c.clo_id) AS code, 
                c.description,
                
                COALESCE(p.plo_no, '-') AS plo,
                COALESCE(CONCAT('YLO', y.year), '-') AS ylo,
                c.ylo_id /* ส่งไปด้วยเผื่อใช้ตอน Edit  */
            FROM clo c
            LEFT JOIN ylo y ON c.ylo_id = y.ylo_id
            LEFT JOIN plo p ON y.plo_id = p.plo_id
            WHERE c.subject_id = ?";
     //ดึงข้อมูลและส่งกลับ       
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_id]);
    //fetchAll(...) คือการกวาดข้อมูลทุกแถวที่หาเจอ มาเก็บไว้ในตัวแปร $clos
    $clos = $stmt->fetchAll(PDO::FETCH_ASSOC);
//แปลงข้อมูลทั้งหมดเป็น JSON ส่งกลับไปให้ React แสดงผลบนตาราง
    echo json_encode(["status" => "success", "data" => $clos]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>