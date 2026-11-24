<?php
require_once __DIR__ . '/tqf_document_access.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$pdo = tqfDocumentRequireDb();

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $sql = "SELECT file_name, file_path FROM tqf_documents WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($doc && !empty($doc['file_path'])) {
        $path = $doc['file_path'];
        $fileName = !empty($doc['file_name']) ? basename($doc['file_name']) : 'document';
        
        // If it's an external link, redirect to it
        if (preg_match('/^https?:\/\//', $path)) {
            // Check if it is a Google Drive link to convert to direct download
            if (preg_match('/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/', $path, $matches)) {
                $fileId = $matches[1];
                $downloadUrl = "https://drive.google.com/uc?export=download&id=" . $fileId;
                header("Location: " . $downloadUrl);
                exit;
            }
            // For other links just redirect
            header("Location: " . $path);
            exit;
        }

        // Local file processing
        $uploadRoot = realpath(__DIR__ . '/../../../uploads');
        $absolutePath = realpath(__DIR__ . '/../../../' . ltrim($path, '/'));
        if ($uploadRoot !== false && $absolutePath !== false
            && str_starts_with($absolutePath, $uploadRoot . DIRECTORY_SEPARATOR)
            && is_file($absolutePath)) {
            // Force download
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header("Content-Disposition: attachment; filename*=UTF-8''" . rawurlencode($fileName));
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($absolutePath));
            readfile($absolutePath);
            exit;
        }
    }
}

http_response_code(404);
echo "File not found.";
?>
