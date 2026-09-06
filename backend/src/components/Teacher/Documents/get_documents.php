<?php

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงรายวิชาทั้งหมดมาทำ Dropdown
    $sql_courses = "SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt_courses = $pdo->query($sql_courses);
    $courses = $stmt_courses->fetchAll(PDO::FETCH_ASSOC);

    // 2. ดึงข้อมูลเอกสารจากตาราง tqf_documents
    $sql_docs = "SELECT * FROM tqf_documents ORDER BY created_at DESC";
    $stmt_docs = $pdo->query($sql_docs);
    $docs = $stmt_docs->fetchAll(PDO::FETCH_ASSOC);

    $all_documents = [];
    foreach ($docs as $doc) {
        // แมป status
        $status = 'pending';
        if ($doc['approval_status'] === 'อนุมัติแล้ว') {
            $status = 'approved';
        }

        // กำหนด URL ของไฟล์
        $fileUrl = '';
        if (!empty($doc['file_path'])) {
            if (preg_match('/^https?:\/\//', $doc['file_path'])) {
                $fileUrl = $doc['file_path'];
            } else {
                $fileUrl = 'http://localhost:8080/' . ltrim($doc['file_path'], '/');
            }
        }

        $all_documents[] = [
            'id' => (string)$doc['id'],
            'name' => $doc['file_name'],
            'type' => $doc['tqf_type'],
            'course' => $doc['subject_code'],
            'uploadedAt' => substr($doc['created_at'], 0, 10),
            'status' => $status,
            'fileUrl' => $fileUrl,
            'downloadUrl' => 'http://localhost:8080/index.php?page=download-document&id=' . $doc['id']
        ];
    }

    echo json_encode([
        "status" => "success", 
        "data" => [
            "documents" => $all_documents,
            "courses" => $courses
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>