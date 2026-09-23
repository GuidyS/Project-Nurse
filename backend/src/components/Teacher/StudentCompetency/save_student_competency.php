<?php
ob_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

ob_end_clean();
header("Content-Type: application/json; charset=UTF-8");

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $targetStudentId = trim((string)($input['student_id'] ?? $input['studentId'] ?? ''));
    $scores = $input['scores'] ?? $input['items'] ?? [];
    $academicYear = (int)($input['academic_year'] ?? 0);

    if ($targetStudentId === '' || empty($scores) || !is_array($scores)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($academicYear <= 0) {
        $now = new DateTime();
        $academicYear = (int)$now->format('Y') + 543;
    }

    $db->beginTransaction();

    $upsertSql = "
        INSERT INTO student_competency_assessments
            (student_id, competency_item_id, academic_year, assessed_by, score, assessed_at)
        VALUES
            (:sid, :item_id, :ay, :assessor, :score, NOW())
        ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            assessed_by = VALUES(assessed_by),
            assessed_at = NOW()
    ";
    $stmt = $db->prepare($upsertSql);

    $savedCount = 0;
    foreach ($scores as $s) {
        $itemId = (int)($s['competency_item_id'] ?? $s['id'] ?? 0);
        $score = isset($s['score']) ? (int)$s['score'] : null;

        if ($itemId > 0 && $score !== null && $score >= 1 && $score <= 5) {
            $stmt->execute([
                ':sid'      => $targetStudentId,
                ':item_id'  => $itemId,
                ':ay'       => $academicYear,
                ':assessor' => $user['username'],
                ':score'    => $score,
            ]);
            $savedCount++;
        }
    }

    $db->commit();

    logAudit(
        $db,
        $userId,
        'update',
        'student_competency',
        "อาจารย์ประเมินสมรรถนะนักศึกษา รหัส: {$targetStudentId} จำนวน {$savedCount} ข้อ (ปีการศึกษา {$academicYear})"
    );

    echo json_encode([
        "status" => "success",
        "message" => "บันทึกผลการประเมินเรียบร้อยแล้ว",
        "saved_count" => $savedCount
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}