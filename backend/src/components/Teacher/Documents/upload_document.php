<?php

require_once __DIR__ . '/../../middlewares/auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true) ?: [];
// รองรับทั้ง JSON และ multipart/form-data (กรณีแนบไฟล์จริง)
$name   = $input['name']   ?? $_POST['name']   ?? '';
$type   = $input['type']   ?? $_POST['type']   ?? '';
$course = $input['course'] ?? $_POST['course'] ?? '';

// ถ้ามีไฟล์แนบจริง ให้เก็บไฟล์ลงโฟลเดอร์ uploads/documents แล้วบันทึก path จริง
$size = "-";
$filePath = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $dir = __DIR__ . '/../../../uploads/documents';
    if (!is_dir($dir)) { mkdir($dir, 0777, true); }
    $safe = uniqid('doc_') . '_' . preg_replace('/[^A-Za-z0-9._-]/u', '_', $_FILES['file']['name']);
    move_uploaded_file($_FILES['file']['tmp_name'], $dir . '/' . $safe);
    $filePath = 'uploads/documents/' . $safe;
    $bytes = (int)$_FILES['file']['size'];
    $size = $bytes >= 1048576 ? round($bytes / 1048576, 1) . ' MB' : max(1, round($bytes / 1024)) . ' KB';
}

try {
    if ($name && $course && $type) {
        $courseCode = $course;
        
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            if (!isset($data['subject_mappings'])) $data['subject_mappings'] = [];
            if (!isset($data['subject_mappings'][$courseCode])) $data['subject_mappings'][$courseCode] = [];
            if (!isset($data['subject_mappings'][$courseCode]['documents'])) $data['subject_mappings'][$courseCode]['documents'] = [];

            // สร้างเอกสารใหม่
            $new_doc = [
                "id" => "doc_" . time() . "_" . rand(100, 999),
                "name" => $name,
                "type" => $type,
                "uploadedAt" => date('Y-m-d'),
                "size" => $size,
                "status" => "pending",
                "file_path" => $filePath
            ];

            // ดันเอกสารใหม่เข้า Array ของวิชานั้นๆ
            $data['subject_mappings'][$courseCode]['documents'][] = $new_doc;

            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);
            $update_stmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
            $update_stmt->execute([':json' => $new_json, ':id' => $row['id']]);

            echo json_encode(["status" => "success", "message" => "อัปโหลดเอกสารสำเร็จ"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "กรอกข้อมูลไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>