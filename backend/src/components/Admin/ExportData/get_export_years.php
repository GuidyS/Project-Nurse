<?php
require_once __DIR__ . '/../../middlewares/auth_middleware.php';
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';
require_once __DIR__ . '/../Approvals/approval-schema.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    $db = new Connect();
    approvalRequireAdmin($db);
    // Same admin scope and columns as export-data; no student records are returned.
    $admissionYears = $db->query('SELECT DISTINCT admission_year FROM student WHERE admission_year IS NOT NULL')->fetchAll(PDO::FETCH_COLUMN);
    $projectYears = $db->query('SELECT DISTINCT academic_year FROM project WHERE academic_year IS NOT NULL')->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode([
        'status' => 'success', 'message' => 'รายการปีสำหรับส่งออก',
        'data' => [
            'students' => academicYearOptions($admissionYears),
            'projects' => academicYearOptions($projectYears),
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถโหลดรายการปีได้'], JSON_UNESCAPED_UNICODE);
}
