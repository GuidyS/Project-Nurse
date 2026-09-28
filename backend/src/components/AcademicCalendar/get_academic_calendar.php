<?php
require_once __DIR__ . '/../middlewares/auth_middleware.php';
require_once __DIR__ . '/../../config/academic_calendar.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

header('Cache-Control: no-store');
$now = new DateTimeImmutable('now', new DateTimeZone('Asia/Bangkok'));
echo json_encode([
    'status' => 'success',
    'message' => 'ปฏิทินปีการศึกษา',
    'data' => ['serverNow' => $now->format('Y-m-d\TH:i:s.vP'), 'academicYear' => currentAcademicYear($now)],
], JSON_UNESCAPED_UNICODE);
