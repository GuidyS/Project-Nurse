<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// เชื่อมต่อฐานข้อมูล (ใช้แพทเทิร์นเดียวกับไฟล์เดิมของคุณ)
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_POST['document_id']) || !isset($_FILES['file'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน กรุณาแนบไฟล์และรหัสเอกสาร");
    }

    $docId = $_POST['document_id'];
    $file = $_FILES['file'];

    // เช็ค Error ของไฟล์
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("เกิดข้อผิดพลาดระหว่างการอัปโหลดไฟล์");
    }

    // สร้างโฟลเดอร์ uploads หากยังไม่มี
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // ตั้งชื่อไฟล์ใหม่กันชื่อซ้ำ (ใช้ Timestamp + ชื่อไฟล์เดิม)
    $fileName = time() . '_' . basename($file['name']);
    $targetFilePath = $uploadDir . $fileName;

    // ย้ายไฟล์จาก Temp ไปยังโฟลเดอร์เป้าหมาย
    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        
        // อัปเดตที่อยู่ไฟล์ในฐานข้อมูล
        $sql = "UPDATE project_documents SET file_path = :file_path WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':file_path' => $targetFilePath,
            ':id' => $docId
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "อัปโหลดและบันทึกไฟล์สำเร็จ",
            "file_path" => $targetFilePath
        ]);
    } else {
        throw new Exception("ไม่สามารถย้ายไฟล์ไปยังโฟลเดอร์เซิร์ฟเวอร์ได้");
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}
?>