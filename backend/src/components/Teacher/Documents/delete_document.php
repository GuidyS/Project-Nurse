<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/tqf_document_access.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$pdo = tqfDocumentRequireDb(true);
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['document_id'])) {
        $id = $input['document_id'];
        
        // ดึงชื่อไฟล์และรหัสวิชาก่อนลบ เพื่อนำไปใส่ใน Log
        $infoSql = "SELECT file_name, subject_code, tqf_type, file_path FROM tqf_documents WHERE id = :id LIMIT 1";
        $infoStmt = $pdo->prepare($infoSql);
        $infoStmt->execute([':id' => $id]);
        $docInfo = $infoStmt->fetch(PDO::FETCH_ASSOC);

        $filePath = $docInfo ? $docInfo['file_path'] : null;

        $deleteSql = "DELETE FROM tqf_documents WHERE id = :id";
        $delStmt = $pdo->prepare($deleteSql);
        $delStmt->execute([':id' => $id]);

        // ลบไฟล์เก่าได้เฉพาะใน upload root ของระบบเท่านั้น
        if ($filePath && !preg_match('/^https?:\/\//i', $filePath)) {
            $uploadRoot = realpath(__DIR__ . '/../../../uploads');
            $absolutePath = realpath(__DIR__ . '/../../../' . ltrim($filePath, '/'));
            if ($uploadRoot !== false && $absolutePath !== false
                && str_starts_with($absolutePath, $uploadRoot . DIRECTORY_SEPARATOR)
                && is_file($absolutePath)) {
                unlink($absolutePath);
            }
        }

        // บันทึก Log เมื่อลบเอกสาร มคอ.
        $docName = $docInfo ? "{$docInfo['tqf_type']} ({$docInfo['file_name']})" : "ID: $id";
        $docCourse = $docInfo ? " รายวิชา: {$docInfo['subject_code']}" : "";
        logAudit(
            $pdo, 
            $_SESSION['user_id'] ?? null, 
            'delete', 
            'documents', 
            "ลบเอกสาร $docName$docCourse"
        );

        echo json_encode(["status" => "success", "message" => "ลบเอกสารเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["status" => "error", "message" => "ไม่ระบุ document_id"], JSON_UNESCAPED_UNICODE);
    }
} catch (PDOException $e) {
    error_log('[TQF Documents] Delete failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถลบข้อมูลเอกสารได้"], JSON_UNESCAPED_UNICODE);
}
?>
