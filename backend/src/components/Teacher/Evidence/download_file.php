<?php
// download_file.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/storage.php';
require_once __DIR__ . '/../../../config/config.php';
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    
    $action = $_GET['action'] ?? 'download';
    
    $stmt = $pdo->prepare("SELECT student_id,file_data, file_path, file_name, mime_type, file_category FROM portfolio WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $user = storageCurrentUser($pdo);
    if (!$user) { http_response_code(401); echo json_encode(["error"=>"Unauthorized"]); exit; }
    $allowed = (int)$user['role_id'] === 1 || ((int)$user['role_id'] === 3 && (string)$user['username'] === (string)($row['student_id'] ?? ''));
    if (!$allowed && (int)$user['role_id'] === 2 && $row) {
        $advisorStmt = $pdo->prepare('SELECT 1 FROM student_advisor_mapping WHERE student_id=? AND faculty_id=? LIMIT 1');
        $advisorStmt->execute([$row['student_id'], $user['username']]);
        $allowed = (bool)$advisorStmt->fetchColumn();
    }
    if (!$allowed) { http_response_code(403); echo json_encode(["error"=>"Forbidden"]); exit; }

    $storageId = storageReferenceId($row['file_path'] ?? null);
    if ($storageId) {
        header('Location: index.php?page=file-access&id=' . rawurlencode($storageId) . '&disposition=' . ($action === 'view' ? 'inline' : 'attachment'));
        exit;
    }
    
    if ($row && $row['file_data']) {
        $mime = $row['mime_type'] ?: null;
        if (!$mime) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->buffer($row['file_data']) ?: 'application/octet-stream';
        }
        $safeInline = in_array($mime, ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'], true);
        $disposition = $action === 'view' && $safeInline ? 'inline' : 'attachment';
        $extension = pathinfo($row['file_name'] ?? '', PATHINFO_EXTENSION);
        if (!$extension) {
            $extension = explode('/', $mime)[1] ?? 'bin';
        }
        $filename = str_replace(["\r", "\n", '"'], '_', basename((string)($row['file_name'] ?: "evidence_{$id}.{$extension}")));

        header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="' . basename($filename) . '"');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: private, no-store');
        echo $row['file_data'];
        exit;
    }

    if ($row && !empty($row['file_path']) && !json_decode($row['file_path'], true)) {
        $fullPath = storageLegacyAbsolutePath($row['file_path']);
        if ($fullPath && is_file($fullPath)) {
            $mime = $row['mime_type'] ?: (mime_content_type($fullPath) ?: 'application/octet-stream');
            $safeInline = in_array($mime, ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'], true);
            $disposition = $action === 'view' && $safeInline ? 'inline' : 'attachment';
            $filename = str_replace(["\r", "\n", '"'], '_', basename((string)($row['file_name'] ?: basename($fullPath))));

            header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Content-Type: ' . $mime);
            header('Content-Disposition: ' . $disposition . '; filename="' . basename($filename) . '"');
            header('X-Content-Type-Options: nosniff');
            header('Cache-Control: private, no-store');
            readfile($fullPath);
            exit;
        }
    }
    
    http_response_code(404);
    echo json_encode(["error" => "File not found."]);
    exit;
} else {
    http_response_code(400);
    echo json_encode(["error" => "No ID specified."]);
    exit;
}
?>
