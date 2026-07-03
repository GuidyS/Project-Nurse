<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

$input = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

if (empty($input['selectedStudent']) || empty($input['scores'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit();
}

$studentId = $input['selectedStudent'];
$scores = $input['scores'];
$comment = $input['comment'] ?? "";

$skill = isset($scores['skill'][0]) ? (float)$scores['skill'][0] : 0.0;
$attitude = isset($scores['attitude'][0]) ? (float)$scores['attitude'][0] : 0.0;
$knowledge = isset($scores['knowledge'][0]) ? (float)$scores['knowledge'][0] : 0.0;
$communication = isset($scores['communication'][0]) ? (float)$scores['communication'][0] : 0.0;
$overall = ($skill + $attitude + $knowledge + $communication) / 4;

$scoreDataJson = json_encode([
    "skill" => $skill,
    "attitude" => $attitude,
    "knowledge" => $knowledge,
    "communication" => $communication,
    "overall" => $overall,
    "comment" => $comment,
], JSON_UNESCAPED_UNICODE);

try {
    $db = new Connect();
    $userId = $_SESSION['user_id'];

    $sql_insert = "INSERT INTO approval_requests
        (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, status, created_at)
        VALUES
        ('performance_eval', :user_id, 'student', :student_id, 'การประเมิน Performance', :description, 'approved', NOW())";

    $stmt = $db->prepare($sql_insert);
    $stmt->execute([
        ':user_id' => $userId,
        ':student_id' => $studentId,
        ':description' => $scoreDataJson,
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกผลการประเมินเรียบร้อยแล้ว"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
