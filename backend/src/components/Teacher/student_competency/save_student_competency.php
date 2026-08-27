<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

function getCurrentThaiAcademicYear(): int {
    $now = new DateTime();
    $ceYear = (int)$now->format('Y');
    $month = (int)$now->format('n');
    $thaiYear = $ceYear + 543;
    return $month >= 6 ? $thaiYear : $thaiYear - 1;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array((int)($user['role_id'] ?? 0), [1, 2])) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "รูปแบบข้อมูลไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $targetStudentId = $input['student_id'] ?? null;
    $scores = $input['scores'] ?? null;

    if (!$targetStudentId || !is_array($scores) || empty($scores)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ((int)$user['role_id'] === 2) {
        $checkStmt = $db->prepare("
            SELECT 1 FROM student_advisor_mapping WHERE faculty_id = :fid AND student_id = :sid
        ");
        $checkStmt->execute([':fid' => $user['username'], ':sid' => $targetStudentId]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "คุณไม่มีสิทธิ์ประเมินนักศึกษาคนนี้"], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $assessorFacultyId = $user['username'];
    } else {
        $assessorFacultyId = $input['assessor_faculty_id'] ?? null;
        if (!$assessorFacultyId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "กรุณาระบุอาจารย์ผู้ประเมิน"], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $academicYear = getCurrentThaiAcademicYear();

    $itemIds = array_map(fn($s) => (int)($s['competency_item_id'] ?? 0), $scores);
    $itemIds = array_filter($itemIds, fn($id) => $id > 0);
    if (empty($itemIds)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบรายการประเมินที่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
    $validStmt = $db->prepare("SELECT id FROM competency_items WHERE id IN ($placeholders) AND is_scorable = 1");
    $validStmt->execute(array_values($itemIds));
    $validItemIds = array_column($validStmt->fetchAll(PDO::FETCH_ASSOC), 'id');
    $validItemIds = array_flip($validItemIds);

    $db->beginTransaction();
    try {
        $upsertSql = "
            INSERT INTO student_competency_assessments 
                (student_id, competency_item_id, academic_year, assessed_by, score)
            VALUES 
                (:sid, :item_id, :ay, :assessor, :score)
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                assessed_by = VALUES(assessed_by),
                assessed_at = CURRENT_TIMESTAMP
        ";
        $stmt = $db->prepare($upsertSql);

        $savedCount = 0;
        foreach ($scores as $s) {
            $itemId = (int)($s['competency_item_id'] ?? 0);
            $score = (int)($s['score'] ?? 0);

            if (!isset($validItemIds[$itemId])) {
                continue;
            }
            if ($score < 1 || $score > 5) {
                continue;
            }

            $stmt->execute([
                ':sid' => $targetStudentId,
                ':item_id' => $itemId,
                ':ay' => $academicYear,
                ':assessor' => $assessorFacultyId,
                ':score' => $score,
            ]);
            $savedCount++;
        }

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

    echo json_encode(["status" => "success", "message" => "บันทึกผลการประเมินเรียบร้อยแล้ว", "saved_count" => $savedCount], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}