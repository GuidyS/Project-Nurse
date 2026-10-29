<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/document_access.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null || $id < 1) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid document ID']);
    exit;
}

try {
    $pdo = new Connect();
    if (documentAccessRole($pdo, $_SESSION['user_id']) === null) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT file_name, file_path FROM tqf_documents WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$doc || empty($doc['file_path'])) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        exit;
    }

    $path = (string) $doc['file_path'];
    if (preg_match('/^https?:\/\//i', $path)) {
        if (preg_match('/^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i', $path, $matches)) {
            header('Location: https://drive.google.com/uc?export=download&id=' . $matches[1]);
        } else {
            header('Location: ' . $path);
        }
        exit;
    }

    $uploadsRoot = realpath(__DIR__ . '/../../../uploads');
    $absolutePath = realpath(__DIR__ . '/../../../' . ltrim($path, '/\\'));
    if ($uploadsRoot === false || $absolutePath === false
        || !str_starts_with($absolutePath, $uploadsRoot . DIRECTORY_SEPARATOR)
        || !is_file($absolutePath)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'File not found']);
        exit;
    }

    $fileName = basename((string) ($doc['file_name'] ?: 'document'));
    $fileName = str_replace(["\r", "\n", '"'], '', $fileName);
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Cache-Control: private, no-store');
    header('Content-Length: ' . filesize($absolutePath));
    readfile($absolutePath);
} catch (Throwable $e) {
    error_log('download-document failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถดาวน์โหลดเอกสารได้'], JSON_UNESCAPED_UNICODE);
}
