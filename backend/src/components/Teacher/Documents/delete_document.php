<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/document_access.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = filter_var($input['document_id'] ?? null, FILTER_VALIDATE_INT);
if ($id === false || $id === null || $id < 1) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'รหัสเอกสารไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = new Connect();
    if (documentAccessRole($pdo, $_SESSION['user_id']) === null) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT file_name, subject_code, tqf_type, file_path, responsible_teacher FROM tqf_documents WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $document = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$document) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'ไม่พบเอกสาร'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (!documentAccessCanDelete($pdo, $_SESSION['user_id'], $document)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }

    $pdo->prepare('DELETE FROM tqf_documents WHERE id = :id')->execute([':id' => $id]);

    // Legacy local files may exist. Delete only files resolved inside the upload root.
    $path = (string)($document['file_path'] ?? '');
    if ($path !== '' && !preg_match('/^https?:\/\//i', $path)) {
        $uploadsRoot = realpath(__DIR__ . '/../../../uploads');
        $absolutePath = realpath(__DIR__ . '/../../../' . ltrim($path, '/\\'));
        if ($uploadsRoot !== false && $absolutePath !== false
            && str_starts_with($absolutePath, $uploadsRoot . DIRECTORY_SEPARATOR)
            && is_file($absolutePath)) {
            unlink($absolutePath);
        }
    }

    logAudit($pdo, $_SESSION['user_id'], 'delete', 'documents',
        'ลบเอกสาร ' . $document['tqf_type'] . ' (ID: ' . $id . ') รายวิชา: ' . $document['subject_code']);
    echo json_encode(['status' => 'success', 'message' => 'ลบเอกสารเรียบร้อยแล้ว'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('delete-document failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถลบเอกสารได้'], JSON_UNESCAPED_UNICODE);
}
