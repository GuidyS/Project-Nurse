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

if (empty($input['selectedStudent'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit();
}

$studentId = $input['selectedStudent'];
$comment = $input['comment'] ?? "";

// รองรับ 2 รูปแบบ:
// 1) scores: { skill:[n], attitude:[n], knowledge:[n], communication:[n] } — หน้า Performance (สเกล ~0-5)
// 2) score: number 0-100 — หน้า Practical evaluate เร็ว
if (isset($input['score']) && $input['score'] !== '' && $input['score'] !== null) {
    $overall = max(0, min(100, (float)$input['score']));
    $fiveScale = round(($overall / 100) * 5, 2);
    $skill = $fiveScale;
    $attitude = $fiveScale;
    $knowledge = $fiveScale;
    $communication = $fiveScale;
    $scoreDataJson = json_encode([
        "skill" => $skill,
        "attitude" => $attitude,
        "knowledge" => $knowledge,
        "communication" => $communication,
        "overall" => $overall,
        "score" => $overall,
        "scale" => "0-100",
        "comment" => $comment,
    ], JSON_UNESCAPED_UNICODE);
} elseif (!empty($input['scores'])) {
    $scores = $input['scores'];
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
        "scale" => "0-5",
        "comment" => $comment,
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit();
}

try {
    $db = new Connect();
    $userId = $_SESSION['user_id'];

    $sql_insert = "INSERT INTO approval_requests
        (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, payload_json, status, created_at)
        VALUES
        ('performance_eval', :user_id, 'student', :student_id, 'การประเมิน Performance', :description, :payload_json, 'approved', NOW())";

    $stmt = $db->prepare($sql_insert);
    $stmt->execute([
        ':user_id' => $userId,
        ':student_id' => $studentId,
        ':description' => $scoreDataJson,
        ':payload_json' => $scoreDataJson,
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกผลการประเมินเรียบร้อยแล้ว"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}