<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
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

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['student_ids']) || empty($input['title'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$channel = $input['channel'] ?? 'in-app';
$allowedChannels = ['in-app', 'email', 'both'];
$type = $input['type'] ?? 'info';
$allowedTypes = ['info', 'warning', 'success', 'request'];
$category = $input['category'] ?? ($type === 'request' ? 'request' : 'student');
$allowedCategories = ['general', 'student', 'request', 'grade', 'project'];

if (!in_array($channel, $allowedChannels, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid channel"]);
    exit();
}

if (!in_array($type, $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid type"]);
    exit();
}

if (!in_array($category, $allowedCategories, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid category"]);
    exit();
}

function canReceiveNotification(array $settings, string $category): bool
{
    if ($category === 'grade') {
        return (bool) $settings['grade_notifications'];
    }

    if ($category === 'project') {
        return (bool) $settings['project_notifications'];
    }

    if ($category === 'student' || $category === 'request') {
        return (bool) $settings['student_notifications'];
    }

    return true;
}

function resolveChannel(string $requestedChannel, array $settings): ?string
{
    $canUseInApp = (bool) $settings['push_notifications'];
    $canUseEmail = (bool) $settings['email_notifications'];

    if ($requestedChannel === 'in-app') {
        return $canUseInApp ? 'in-app' : null;
    }

    if ($requestedChannel === 'email') {
        return $canUseEmail ? 'email' : null;
    }

    if ($canUseInApp && $canUseEmail) {
        return 'both';
    }

    if ($canUseInApp) {
        return 'in-app';
    }

    if ($canUseEmail) {
        return 'email';
    }

    return null;
}

try {
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $roleStmt = $pdo->prepare("SELECT role_id FROM users WHERE user_id = :user_id LIMIT 1");
    $roleStmt->execute([':user_id' => $_SESSION['user_id']]);
    $roleId = (int) $roleStmt->fetchColumn();

    if ($roleId === 3) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "Students are not allowed to send notifications"
        ]);
        exit();
    }

    $pdo->beginTransaction();

    $settingsSql = "SELECT
                        COALESCE(email_notifications, 1) AS email_notifications,
                        COALESCE(push_notifications, 1) AS push_notifications,
                        COALESCE(grade_notifications, 1) AS grade_notifications,
                        COALESCE(project_notifications, 1) AS project_notifications,
                        COALESCE(student_notifications, 1) AS student_notifications
                    FROM user_notification_settings
                    WHERE user_id = :user_id";
    $settingsStmt = $pdo->prepare($settingsSql);

    $sql = "INSERT INTO notifications (user_id, sender_user_id, title, message, type, channel, is_read)
            VALUES (:user_id, :sender_user_id, :title, :message, :type, :channel, 0)";
    $stmt = $pdo->prepare($sql);
    $sentCount = 0;
    $skippedCount = 0;

    foreach ($input['student_ids'] as $student_user_id) {
        $settingsStmt->execute([':user_id' => $student_user_id]);
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC) ?: [
            'email_notifications' => 1,
            'push_notifications' => 1,
            'grade_notifications' => 1,
            'project_notifications' => 1,
            'student_notifications' => 1,
        ];

        if (!canReceiveNotification($settings, $category)) {
            $skippedCount++;
            continue;
        }

        $resolvedChannel = resolveChannel($channel, $settings);
        if ($resolvedChannel === null) {
            $skippedCount++;
            continue;
        }

        $stmt->execute([
            ':user_id' => $student_user_id,
            ':sender_user_id' => $_SESSION['user_id'],
            ':title' => $input['title'],
            ':message' => $input['message'] ?? '',
            ':type' => $type,
            ':channel' => $resolvedChannel,
        ]);
        $sentCount++;
    }

    $pdo->commit();
    echo json_encode([
        "status" => "success",
        "message" => "Notification sent",
        "sent" => $sentCount,
        "skipped" => $skippedCount,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
