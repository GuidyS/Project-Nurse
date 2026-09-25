<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$student_id = $_SESSION['username'] ?? $_SESSION['user_id'] ?? null;

if (!$student_id || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized or Invalid Request"], JSON_UNESCAPED_UNICODE);
    exit();
}

function portfolio_update_validate_google_drive_link(string $url): void
{
    $trimmedUrl = trim($url);
    if ($trimmedUrl === '') {
        return;
    }

    if (!filter_var($trimmedUrl, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException("ลิงก์ Google Drive ไม่ถูกต้อง");
    }

    $parts = parse_url($trimmedUrl);
    $scheme = strtolower((string)($parts['scheme'] ?? ''));
    $host = strtolower((string)($parts['host'] ?? ''));
    if ($scheme !== 'https' || !in_array($host, ['drive.google.com', 'docs.google.com'], true)) {
        throw new InvalidArgumentException("กรุณาแนบลิงก์ Google Drive ที่ถูกต้อง");
    }
}

try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $itemId = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
    $title = trim((string)($input['title'] ?? ''));
    $type = trim((string)($input['type'] ?? 'certificate'));
    $description = trim((string)($input['description'] ?? ''));
    $googleDriveLink = trim((string)($input['google_drive_link'] ?? ''));

    if ($itemId === '' || $title === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    portfolio_update_validate_google_drive_link($googleDriveLink);

    $db = new Connect();
    $stmt = $db->prepare("SELECT portfolio_id, title, file_path FROM portfolio WHERE portfolio_id = :id AND student_id = :sid LIMIT 1");
    $stmt->execute([':id' => $itemId, ':sid' => $student_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบผลงานนี้ หรือคุณไม่มีสิทธิ์แก้ไข"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $sql = "UPDATE portfolio
            SET title = :title,
                type = :type,
                description = :description";
    $params = [
        ':title' => $title,
        ':type' => $type,
        ':description' => $description,
        ':id' => $itemId,
        ':sid' => $student_id,
    ];

    if ($googleDriveLink !== '') {
        $sql .= ",
                file_name = :file_name,
                file_path = :file_path,
                mime_type = :mime_type,
                file_category = :file_category";
        $params[':file_name'] = $title;
        $params[':file_path'] = $googleDriveLink;
        $params[':mime_type'] = 'text/uri-list';
        $params[':file_category'] = 'document';
    }

    $sql .= " WHERE portfolio_id = :id AND student_id = :sid";
    $updateStmt = $db->prepare($sql);
    $updateStmt->execute($params);

    logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'portfolio', "แก้ไขผลงาน: {$title} (ID: {$itemId})");

    echo json_encode(["status" => "success", "message" => "แก้ไขผลงานสำเร็จ"], JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
