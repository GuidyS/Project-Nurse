<?php
// download_file.php
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    
    $action = $_GET['action'] ?? 'download';
    $disposition = ($action === 'view') ? 'inline' : 'attachment';
    
    $stmt = $pdo->prepare("SELECT file_data, file_path, file_name, mime_type, file_category FROM portfolio WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row && $row['file_data']) {
        $mime = $row['mime_type'] ?: null;
        if (!$mime) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->buffer($row['file_data']) ?: 'application/octet-stream';
        }
        $extension = pathinfo($row['file_name'] ?? '', PATHINFO_EXTENSION);
        if (!$extension) {
            $extension = explode('/', $mime)[1] ?? 'bin';
        }
        $filename = $row['file_name'] ?: "evidence_{$id}.{$extension}";

        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="' . basename($filename) . '"');
        echo $row['file_data'];
        exit;
    }

    if ($row && !empty($row['file_path']) && !json_decode($row['file_path'], true)) {
        $fullPath = '/var/www/html/' . ltrim($row['file_path'], '/');
        if (is_file($fullPath)) {
            $mime = $row['mime_type'] ?: (mime_content_type($fullPath) ?: 'application/octet-stream');
            $filename = $row['file_name'] ?: basename($fullPath);

            header('Access-Control-Allow-Origin: http://localhost:5173');
            header('Access-Control-Allow-Credentials: true');
            header('Content-Type: ' . $mime);
            header('Content-Disposition: ' . $disposition . '; filename="' . basename($filename) . '"');
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
