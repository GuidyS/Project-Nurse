<?php
// download_file.php
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
    
    $action = $_GET['action'] ?? 'download';
    $disposition = ($action === 'view') ? 'inline' : 'attachment';
    
    // Check if it exists in portfolio_images
    $stmt = $pdo->prepare("SELECT image_data FROM portfolio_images WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $img_row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($img_row && $img_row['image_data']) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->buffer($img_row['image_data']) ?: 'image/jpeg';
        $ext = explode('/', $mime)[1] ?? 'jpg';
        
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="evidence_' . $id . '.' . $ext . '"');
        echo $img_row['image_data'];
        exit;
    }
    
    // Check if it exists in portfolio_videos
    $stmt = $pdo->prepare("SELECT video_data, mime_type FROM portfolio_videos WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $vid_row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($vid_row && $vid_row['video_data']) {
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: ' . ($vid_row['mime_type'] ?: 'video/mp4'));
        $ext = explode('/', $vid_row['mime_type'])[1] ?? 'mp4';
        header('Content-Disposition: ' . $disposition . '; filename="evidence_' . $id . '.' . $ext . '"');
        echo $vid_row['video_data'];
        exit;
    }
    
    // Check if it exists in portfolio file_data
    $stmt = $pdo->prepare("SELECT file_data, file_path FROM portfolio WHERE portfolio_id = ?");
    $stmt->execute([$id]);
    $doc_row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($doc_row && $doc_row['file_data']) {
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/pdf'); // Better default for inline viewing of documents
        header('Content-Disposition: ' . $disposition . '; filename="evidence_doc_' . $id . '.pdf"'); 
        echo $doc_row['file_data'];
        exit;
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
