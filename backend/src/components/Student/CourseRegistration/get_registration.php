<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/registration_helpers.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $studentId = registrationStudentId($db, $userId);
    if ($studentId === null) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "หน้านี้สำหรับนักศึกษาเท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $cycle = activeCurriculumCycle($db);
    $subjects = registrationAvailableSubjects($db, $studentId);

    $enrolledCredits = 0;
    foreach ($subjects as $subject) {
        if ($subject['is_enrolled']) {
            $enrolledCredits += (int)$subject['credit'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "student_id" => $studentId,
            "curriculum" => $cycle,
            "current_term" => academicCurrentTerm($db),
            "term_ranges" => array_values(academicTermRanges($db)),
            "subjects" => $subjects,
            "enrolled_credits" => $enrolledCredits,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
