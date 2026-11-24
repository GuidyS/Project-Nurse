<?php
session_start();
require_once __DIR__ . '/../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    $pdo = new Connect();

    $settings = [
        ':user_id' => $_SESSION['user_id'],
        ':email_notifications' => !empty($input['emailNotifications']) ? 1 : 0,
        ':push_notifications' => !empty($input['pushNotifications']) ? 1 : 0,
        ':grade_notifications' => !empty($input['gradeNotifications']) ? 1 : 0,
        ':project_notifications' => !empty($input['projectNotifications']) ? 1 : 0,
        ':student_notifications' => !empty($input['studentNotifications']) ? 1 : 0,
    ];

    $sql = "INSERT INTO user_notification_settings (
                user_id,
                email_notifications,
                push_notifications,
                grade_notifications,
                project_notifications,
                student_notifications
            ) VALUES (
                :user_id,
                :email_notifications,
                :push_notifications,
                :grade_notifications,
                :project_notifications,
                :student_notifications
            )
            ON DUPLICATE KEY UPDATE
                email_notifications = VALUES(email_notifications),
                push_notifications = VALUES(push_notifications),
                grade_notifications = VALUES(grade_notifications),
                project_notifications = VALUES(project_notifications),
                student_notifications = VALUES(student_notifications),
                updated_at = CURRENT_TIMESTAMP";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($settings);

    echo json_encode(["status" => "success", "message" => "Notification settings saved"]);
} catch (Exception $e) {
    error_log('[Notifications] Settings save failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถบันทึกค่าการแจ้งเตือนได้"], JSON_UNESCAPED_UNICODE);
}
?>
