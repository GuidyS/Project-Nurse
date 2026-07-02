<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT
                n.notification_id AS id,
                n.title,
                n.message,
                n.type,
                n.channel,
                CASE
                    WHEN n.sender_user_id = :current_user_id THEN 'sent'
                    ELSE 'received'
                END AS direction,
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))), ''),
                    u.username,
                    'System'
                ) AS recipient,
                n.is_read AS isRead,
                n.created_at AS createdAt
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.user_id
            LEFT JOIN student s ON CAST(u.username AS UNSIGNED) = s.student_id
            WHERE n.user_id = :filter_user_id OR n.sender_user_id = :filter_user_id
            ORDER BY n.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':current_user_id' => $user_id,
        ':filter_user_id' => $user_id,
    ]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($notifications as &$row) {
        $row['id'] = (int) $row['id'];
        $row['isRead'] = (bool) $row['isRead'];
        $row['createdAt'] = date('d/m/Y H:i', strtotime($row['createdAt']));
    }

    echo json_encode(["status" => "success", "data" => $notifications]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
