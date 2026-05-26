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

if (!in_array($channel, $allowedChannels, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid channel"]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->beginTransaction();

    $sql = "INSERT INTO notifications (user_id, title, message, type, channel, is_read)
            VALUES (:user_id, :title, :message, 'info', :channel, 0)";
    $stmt = $pdo->prepare($sql);

    foreach ($input['student_ids'] as $student_user_id) {
        $stmt->execute([
            ':user_id' => $student_user_id,
            ':title' => $input['title'],
            ':message' => $input['message'] ?? '',
            ':channel' => $channel,
        ]);
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Notification sent"]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
