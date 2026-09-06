<?php
session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$projectId = $input['project_id'] ?? null;

if (!$projectId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing project_id"]);
    exit();
}

try {
    $db = new Connect();
    
    // Check if an approval request already exists
    $checkStmt = $db->prepare("SELECT approval_request_id, status FROM approval_requests WHERE target_ref_type = 'report_item' AND target_ref_id = :project_id AND request_type = 'budget_approval'");
    $checkStmt->execute([':project_id' => $projectId]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        if ($existing['status'] === 'approved') {
            echo json_encode(["status" => "success", "message" => "Budget already approved"]);
            exit();
        }
        
        // Update existing to approved
        $updateStmt = $db->prepare("UPDATE approval_requests SET status = 'approved', reviewed_by = :user_id, reviewed_at = CURRENT_TIMESTAMP WHERE approval_request_id = :id");
        $updateStmt->execute([
            ':user_id' => $_SESSION['user_id'],
            ':id' => $existing['approval_request_id']
        ]);
    } else {
        $insertStmt = $db->prepare("
            INSERT INTO approval_requests (request_type, requester_user_id, target_ref_type, target_ref_id, title, status, reviewed_by, reviewed_at) 
            VALUES ('budget_approval', :requester_id, 'report_item', :project_id, 'Budget Approval', 'approved', :reviewer_id, CURRENT_TIMESTAMP)
        ");
        $insertStmt->execute([
            ':requester_id' => $_SESSION['user_id'],
            ':reviewer_id' => $_SESSION['user_id'],
            ':project_id' => $projectId
        ]);
    }

    echo json_encode(["status" => "success", "message" => "Budget approved successfully"]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>