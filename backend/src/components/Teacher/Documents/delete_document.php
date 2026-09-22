<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
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

        if ($filePath) {
            $absolutePath = __DIR__ . '/../../../' . ltrim($filePath, '/');
            if (file_exists($absolutePath)) {
                unlink($absolutePath);
            }
        }

        $deleteSql = "DELETE FROM tqf_documents WHERE id = :id";
        $delStmt = $pdo->prepare($deleteSql);
        $delStmt->execute([':id' => $id]);
        
        // ลบคำร้องขอที่เกี่ยวข้อง
        $reqSql = "DELETE FROM approval_requests WHERE target_ref_type = 'tqf_document' AND target_ref_id = :id";
        $reqStmt = $pdo->prepare($reqSql);
        $reqStmt->execute([':id' => $id]);

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
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>