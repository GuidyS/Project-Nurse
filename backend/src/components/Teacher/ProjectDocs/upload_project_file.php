<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// เชื่อมต่อฐานข้อมูล (ใช้แพทเทิร์นเดียวกับไฟล์เดิมของคุณ)
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    if (!isset($_POST['document_id']) || !isset($_FILES['file'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน กรุณาแนบไฟล์และรหัสเอกสาร");
    }

    $docId = $_POST['document_id'];
    $file = $_FILES['file'];

    // เช็ค Error ของไฟล์
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("เกิดข้อผิดพลาดระหว่างการอัปโหลดไฟล์");
    }

    // สร้างโฟลเดอร์ uploads ใต้ document root ของ backend
    $uploadDir = __DIR__ . '/../../../uploads/project_docs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // ตั้งชื่อไฟล์ใหม่กันชื่อซ้ำ (ใช้ Timestamp + ชื่อไฟล์เดิม)
    $originalName = basename($file['name']);
    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
    $fileName = time() . '_' . $safeName;
    $targetFilePath = $uploadDir . $fileName;
    $publicPath = 'uploads/project_docs/' . $fileName;

    // ย้ายไฟล์จาก Temp ไปยังโฟลเดอร์เป้าหมาย
    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        
        // อัปเดตที่อยู่ไฟล์ในฐานข้อมูล
        $sql = "UPDATE project_documents
                SET file_path = :file_path,
                    file_name = :file_name,
                    mime_type = :mime_type,
                    file_size = :file_size,
                    uploaded_by = :uploaded_by
                WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':file_path' => $publicPath,
            ':file_name' => $originalName,
            ':mime_type' => $file['type'] ?? null,
            ':file_size' => $file['size'] ?? null,
            ':uploaded_by' => $_SESSION['user_id'],
            ':id' => $docId
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "อัปโหลดและบันทึกไฟล์สำเร็จ",
            "file_path" => $publicPath
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("ไม่สามารถย้ายไฟล์ไปยังโฟลเดอร์เซิร์ฟเวอร์ได้");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>