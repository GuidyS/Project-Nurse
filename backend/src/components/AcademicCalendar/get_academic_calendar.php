<?php
require_once __DIR__ . '/../middlewares/auth_middleware.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/academic_calendar.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

header('Cache-Control: no-store');
$now = new DateTimeImmutable('now', new DateTimeZone('Asia/Bangkok'));

// ส่งเส้นแบ่งปีการศึกษาและช่วงภาคเรียนไปด้วย เพื่อให้หน้าเว็บคิดปีการศึกษาตรงกับเซิร์ฟเวอร์เสมอ
$db = null;
try {
    $db = new Connect();
} catch (Throwable $e) {
    $db = null; // อ่านค่าตั้งค่าไม่ได้ก็ยังตอบด้วยค่าเริ่มต้นได้
}

$boundary = academicYearBoundary($db);

echo json_encode([
    'status' => 'success',
    'message' => 'ปฏิทินปีการศึกษา',
    'data' => [
        'serverNow' => $now->format('Y-m-d\TH:i:s.vP'),
        'academicYear' => currentAcademicYear($now, $db),
        'boundary' => $boundary,
        'currentTerm' => academicCurrentTerm($db, $now),
        'termRanges' => array_values(academicTermRanges($db)),
    ],
], JSON_UNESCAPED_UNICODE);
