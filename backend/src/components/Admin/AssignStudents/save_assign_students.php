<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/assign_students_helpers.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents("php://input"), true) ?: [];

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "เฉพาะผู้ดูแลระบบเท่านั้นที่มอบหมายนักศึกษาได้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $type = assignStudentsResolveType($input['advisor_type'] ?? null);
    $facultyId = trim((string)($input['faculty_id'] ?? ''));
    $studentIds = isset($input['student_ids']) && is_array($input['student_ids']) ? $input['student_ids'] : null;

    if ($facultyId === '' || $studentIds === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน (ต้องระบุอาจารย์และรายชื่อนักศึกษา)"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ตัดค่าซ้ำและค่าว่างออกก่อนตรวจโควตา
    $studentIds = array_values(array_unique(array_filter(array_map('strval', $studentIds), static fn($v) => $v !== '')));

    if (count($studentIds) > $type['limit']) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "{$type['label']} 1 ท่าน รับนักศึกษาได้ไม่เกิน {$type['limit']} คน (เลือกมา " . count($studentIds) . " คน)",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $facStmt = $db->prepare("SELECT COUNT(*) FROM faculty WHERE faculty_id = ?");
    $facStmt->execute([$facultyId]);
    if ((int)$facStmt->fetchColumn() === 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบอาจารย์ท่านนี้ในระบบ"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if (!empty($studentIds)) {
        $ph = implode(',', array_fill(0, count($studentIds), '?'));
        $chk = $db->prepare("SELECT COUNT(*) FROM student WHERE student_id IN ($ph)");
        $chk->execute($studentIds);
        if ((int)$chk->fetchColumn() !== count($studentIds)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "มีรหัสนักศึกษาที่ไม่มีอยู่จริงในระบบ"], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    [$typeSql, $typeParams] = assignStudentsTypeCondition($type, 'sam');

    $db->beginTransaction();

    // นับว่ามีนักศึกษาคนไหนถูกย้ายมาจากอาจารย์ท่านอื่นบ้าง เพื่อรายงานให้ผู้ดูแลทราบ
    // ใช้ named parameter ทั้งหมด (ผสมกับ ? ในคำสั่งเดียวไม่ได้)
    $movedCount = 0;
    if (!empty($studentIds)) {
        $studentParams = [];
        foreach ($studentIds as $i => $sid) {
            $studentParams[":s$i"] = $sid;
        }
        $ph = implode(',', array_keys($studentParams));

        $stmt = $db->prepare("SELECT COUNT(*) FROM student_advisor_mapping sam
                              WHERE sam.student_id IN ($ph) AND sam.faculty_id <> :fid AND $typeSql");
        $stmt->execute($studentParams + $typeParams + [':fid' => $facultyId]);
        $movedCount = (int)$stmt->fetchColumn();

        // ถอดนักศึกษาที่เลือกออกจากอาจารย์ท่านอื่นในประเภทเดียวกันก่อน (1 คน มีได้ 1 ท่าน)
        $del = $db->prepare("DELETE sam FROM student_advisor_mapping sam
                             WHERE sam.student_id IN ($ph) AND $typeSql");
        $del->execute($studentParams + $typeParams);
    }

    // ล้างรายการเดิมของอาจารย์ท่านนี้ในประเภทนี้ แล้วใส่ชุดใหม่ทั้งชุด
    $clear = $db->prepare("DELETE sam FROM student_advisor_mapping sam WHERE sam.faculty_id = :fid AND $typeSql");
    $clear->execute($typeParams + [':fid' => $facultyId]);

    $insert = $db->prepare("INSERT INTO student_advisor_mapping (student_id, faculty_id, advisor_type, academic_year)
                            VALUES (?, ?, ?, ?)");
    $academicYear = (int)date('Y') + 543;
    foreach ($studentIds as $sid) {
        $insert->execute([$sid, $facultyId, $type['key'], $academicYear]);
    }

    // มอบตำแหน่งให้อาจารย์อัตโนมัติถ้ายังไม่มี
    $positionGranted = false;
    if (!empty($studentIds)) {
        $positionGranted = assignStudentsGrantPosition($db, $facultyId, $type['position_id']);
    }

    $db->commit();

    $message = "บันทึกสำเร็จ — มอบหมายนักศึกษา " . count($studentIds) . " คนให้{$type['label']}";
    if ($movedCount > 0) {
        $message .= " (ย้ายมาจากอาจารย์ท่านอื่น $movedCount คน)";
    }
    if ($positionGranted) {
        $message .= " และให้สิทธิ์ตำแหน่ง{$type['label']}กับอาจารย์ท่านนี้แล้ว";
    }

    echo json_encode([
        "status" => "success",
        "message" => $message,
        "data" => [
            "assigned_count" => count($studentIds),
            "moved_count" => $movedCount,
            "position_granted" => $positionGranted,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    if (isset($db) && $db->inTransaction()) { $db->rollBack(); }
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) { $db->rollBack(); }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
