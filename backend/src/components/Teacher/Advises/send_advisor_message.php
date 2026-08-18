<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$advisor_user_id = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents('php://input'), true) ?: [];

$student_id = trim((string)($input['student_id'] ?? ''));
$title = trim((string)($input['title'] ?? ''));
$message = trim((string)($input['message'] ?? ''));

if (!$advisor_user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($student_id === '' || $title === '' || $message === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $db = new Connect();

    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = :student_id LIMIT 1");
    $stmt->execute([':student_id' => $student_id]);
    $student_user_id = $stmt->fetchColumn();

    if (!$student_user_id) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบบัญชีผู้ใช้ของนักศึกษาคนนี้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $payload_json = json_encode([
        'student_id' => $student_id,
        'source' => 'advisor_message',
    ], JSON_UNESCAPED_UNICODE);

    $insert = $db->prepare("
        INSERT INTO notifications (user_id, sender_user_id, title, message, payload_json, type, channel, is_read)
        VALUES (:user_id, :sender_user_id, :title, :message, :payload_json, 'info', 'in-app', 0)
    ");
    $insert->execute([
        ':user_id' => $student_user_id,
        ':sender_user_id' => $advisor_user_id,
        ':title' => $title,
        ':message' => $message,
        ':payload_json' => $payload_json,
    ]);

    echo json_encode([
        "status" => "success",
        "sent" => 1,
        "message" => "ส่งข้อความและสร้างการแจ้งเตือนเรียบร้อยแล้ว",
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
