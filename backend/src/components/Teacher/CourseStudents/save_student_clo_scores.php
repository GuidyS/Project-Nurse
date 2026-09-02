<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';
require_once __DIR__ . '/clo_score_helpers.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

/** ตอบกลับพร้อมปิดการทำงาน */
function cloScoreFail(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(["status" => "error", "message" => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

$user_id = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true) ?: [];

try {
    if (!$user_id) {
        cloScoreFail("Unauthorized", 401);
    }

    $subject_id = isset($input['subject_id']) ? (int)$input['subject_id'] : 0;
    if (!$subject_id) {
        cloScoreFail("ข้อมูลพารามิเตอร์ไม่ครบถ้วน");
    }

    // รองรับทั้งแบบส่งทีละรายการ (student_id/clo_id/scores) และแบบส่งเป็นชุด (entries[])
    $entries = [];
    if (isset($input['entries']) && is_array($input['entries'])) {
        $entries = $input['entries'];
    } elseif (isset($input['student_id'], $input['clo_id']) && isset($input['scores']) && is_array($input['scores'])) {
        $entries = [[
            'student_id' => $input['student_id'],
            'clo_id' => $input['clo_id'],
            'scores' => $input['scores'],
        ]];
    } else {
        cloScoreFail("ข้อมูลพารามิเตอร์ไม่ครบถ้วน");
    }

    if (empty($entries)) {
        cloScoreFail("ไม่มีคะแนนที่ต้องบันทึก");
    }

    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // โครงสร้าง CLO ของวิชา ใช้ตรวจว่า Sub PLO ที่ส่งมาผูกกับ CLO นั้นจริง
    $stmt_subject = $db->prepare("SELECT subject_code FROM subject WHERE subject_id = ? LIMIT 1");
    $stmt_subject->execute([$subject_id]);
    $subject_code = $stmt_subject->fetchColumn();
    if (!$subject_code) {
        cloScoreFail("ไม่พบรายวิชานี้");
    }

    $headers = cloScoreBuildHeaders($db, (string)$subject_code);
    if (empty($headers)) {
        cloScoreFail("รายวิชานี้ยังไม่ได้กำหนด CLO");
    }

    $headerById = [];
    foreach ($headers as $header) {
        $headerById[(int)$header['clo_id']] = $header;
    }

    // ตรวจสอบความถูกต้องของทุกรายการก่อน แล้วค่อยเขียนลงฐานข้อมูล
    $enrolledCache = [];
    $prepared = [];

    foreach ($entries as $index => $entry) {
        $student_id = isset($entry['student_id']) ? (int)$entry['student_id'] : 0;
        $clo_id     = isset($entry['clo_id']) ? (int)$entry['clo_id'] : 0;
        $scores     = isset($entry['scores']) && is_array($entry['scores']) ? $entry['scores'] : null;

        if (!$student_id || !$clo_id || $scores === null) {
            cloScoreFail("รายการที่ " . ($index + 1) . " มีข้อมูลไม่ครบถ้วน");
        }

        if (!isset($headerById[$clo_id])) {
            cloScoreFail("ไม่พบ CLO รหัส $clo_id ในรายวิชา");
        }

        if (!isset($enrolledCache[$student_id])) {
            $chk = $db->prepare("SELECT COUNT(*) FROM enrollment WHERE subject_id = ? AND student_id = ?");
            $chk->execute([$subject_id, $student_id]);
            $enrolledCache[$student_id] = (int)$chk->fetchColumn() > 0;
        }

        if (!$enrolledCache[$student_id]) {
            cloScoreFail("นักศึกษารหัส $student_id ไม่ได้ลงทะเบียนในรายวิชานี้");
        }

        $target = $headerById[$clo_id];
        $allowedCodes = array_column($target['sub_plos'], 'code');
        if (empty($allowedCodes)) {
            cloScoreFail(($target['clo_code'] ?? 'CLO') . " ยังไม่ได้ผูก Sub PLO จึงยังให้คะแนนไม่ได้");
        }

        foreach ($allowedCodes as $code) {
            if (!array_key_exists($code, $scores)) {
                continue; // ไม่ได้ส่งมา = ไม่แตะของเดิม
            }

            $raw = $scores[$code];
            if ($raw === null || $raw === '') {
                $value = null; // ล้างคะแนนกลับเป็นยังไม่ประเมิน
            } elseif (!is_numeric($raw)) {
                cloScoreFail("คะแนน Sub PLO $code ต้องเป็นตัวเลข");
            } else {
                $value = (float)$raw;
                if ($value < 0 || $value > 100) {
                    cloScoreFail("คะแนน Sub PLO $code ต้องอยู่ระหว่าง 0-100");
                }
            }

            $prepared[] = [
                'student_id' => $student_id,
                'clo_id' => $clo_id,
                'sub_plo_code' => $code,
                'score' => $value,
            ];
        }
    }

    cloScoreEnsureTable($db);
    $db->beginTransaction();

    $upsert = $db->prepare("
        INSERT INTO student_clo_sub_scores (subject_id, student_id, clo_id, sub_plo_code, score, updated_by)
        VALUES (:subject_id, :student_id, :clo_id, :sub_plo_code, :score, :updated_by)
        ON DUPLICATE KEY UPDATE score = VALUES(score), updated_by = VALUES(updated_by)
    ");

    foreach ($prepared as $row) {
        $upsert->execute([
            ':subject_id' => $subject_id,
            ':student_id' => $row['student_id'],
            ':clo_id' => $row['clo_id'],
            ':sub_plo_code' => $row['sub_plo_code'],
            ':score' => $row['score'],
            ':updated_by' => $user_id,
        ]);
    }

    $db->commit();

    // คำนวณคะแนนใหม่ของนักศึกษาทุกคนที่ถูกแก้ แล้วส่งกลับให้หน้าเว็บอัปเดตทันที
    $allScores = cloScoreLoadForSubject($db, $subject_id);
    $totalClos = count($headers);
    $result = [];

    foreach (array_keys($enrolledCache) as $student_id) {
        $studentScores = $allScores[(string)$student_id] ?? [];
        $cloScores = [];
        $subScores = [];

        foreach ($headers as $header) {
            $key = (string)$header['clo_id'];
            $entered = $studentScores[$key] ?? [];
            $subScores[$key] = (object)$entered;
            $cloScores[$key] = cloScoreCalcClo(array_column($header['sub_plos'], 'code'), $entered);
        }

        $result[(string)$student_id] = [
            'clo_scores' => (object)$cloScores,
            'sub_scores' => (object)$subScores,
            'overall' => cloScoreCalcOverall($cloScores, $totalClos),
        ];
    }

    $studentCount = count($result);
    echo json_encode([
        "status" => "success",
        "message" => "บันทึกคะแนนของนักศึกษา $studentCount คน เรียบร้อยแล้ว",
        "data" => [
            "saved_rows" => count($prepared),
            "students" => (object)$result,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
