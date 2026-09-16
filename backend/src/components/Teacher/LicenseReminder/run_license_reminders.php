<?php
// แอดมินสั่งเช็กใบประกอบวิชาชีพใกล้หมดอายุทันที (ไม่ต้องรอรอบอัตโนมัติ)
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/license_reminder_helpers.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "เฉพาะผู้ดูแลระบบเท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ส่งอีเมลอาจใช้เวลา ไม่ต้องล็อก session ของผู้ใช้ไว้ระหว่างนั้น
    session_write_close();

    $summary = licenseReminderProcess($db);
    licenseReminderRecordRun($db, $summary);

    echo json_encode([
        "status" => "success",
        "data" => array_merge($summary, ["smtp_configured" => appMailerIsConfigured()]),
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
