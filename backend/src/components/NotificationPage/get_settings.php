<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

try {
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $defaults = [
        "emailNotifications" => true,
        "pushNotifications" => true,
        "gradeNotifications" => true,
        "projectNotifications" => true,
        "studentNotifications" => true,
    ];

    $stmt = $pdo->prepare(
        "SELECT email_notifications, push_notifications, grade_notifications, project_notifications, student_notifications
         FROM user_notification_settings
         WHERE user_id = :user_id"
    );
    $stmt->execute([':user_id' => $_SESSION['user_id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        echo json_encode(["status" => "success", "data" => $defaults]);
        exit();
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "emailNotifications" => (bool) $settings['email_notifications'],
            "pushNotifications" => (bool) $settings['push_notifications'],
            "gradeNotifications" => (bool) $settings['grade_notifications'],
            "projectNotifications" => (bool) $settings['project_notifications'],
            "studentNotifications" => (bool) $settings['student_notifications'],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
