<?php

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['document_id'])) {
        $id = $input['document_id'];
        
        $sql = "SELECT file_path FROM tqf_documents WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $filePath = $stmt->fetchColumn();

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

        echo json_encode(["status" => "success", "message" => "ลบเอกสารเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "ไม่ระบุ document_id"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>