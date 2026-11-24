<?php

require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/tqf_document_access.php';

$pdo = tqfDocumentRequireDb();

try {
    // 1. รายวิชาทำ Dropdown — ตามหลักสูตรที่ใช้งานในระบบ (ยังไม่มีหลักสูตรใช้ตาราง subject แบบเดิม)
    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        $courses = array_map(
            static fn(array $subject): array => ['subject_code' => $subject['subject_code'], 'subject_name_th' => $subject['subject_name']],
            $curriculumSubjects
        );
    } else {
        $sql_courses = "SELECT subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
        $stmt_courses = $pdo->query($sql_courses);
        $courses = $stmt_courses->fetchAll(PDO::FETCH_ASSOC);
    }

    // 2. ดึงข้อมูลเอกสารจากตาราง tqf_documents
    $sql_docs = "SELECT * FROM tqf_documents ORDER BY created_at DESC";
    $stmt_docs = $pdo->query($sql_docs);
    $docs = $stmt_docs->fetchAll(PDO::FETCH_ASSOC);

    $all_documents = [];
    foreach ($docs as $doc) {
        // กำหนด URL ของไฟล์
        $fileUrl = '';
        if (!empty($doc['file_path'])) {
            if (preg_match('/^https?:\/\//', $doc['file_path'])) {
                $fileUrl = $doc['file_path'];
            }
        }

        $all_documents[] = [
            'id' => (string)$doc['id'],
            'name' => $doc['file_name'],
            'type' => $doc['tqf_type'],
            'course' => $doc['subject_code'],
            'academic_year' => $doc['academic_year'],
            'uploadedAt' => substr($doc['created_at'], 0, 10),
            'fileUrl' => $fileUrl,
            'downloadUrl' => 'index.php?page=download-document&id=' . rawurlencode((string)$doc['id'])
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
    error_log('[TQF Documents] List failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถดึงข้อมูลเอกสารได้"], JSON_UNESCAPED_UNICODE);
}
?>
