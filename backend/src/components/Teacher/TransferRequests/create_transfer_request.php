<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/Approvals/approval-schema.php';
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];

$studentIds = !empty($data['student_ids']) && is_array($data['student_ids']) ? $data['student_ids'] : [];
if (!empty($data['student_id']) && !in_array($data['student_id'], $studentIds)) {
    $studentIds[] = $data['student_id'];
}
$studentIds = array_values(array_unique(array_filter(array_map('trim', array_map('strval', $studentIds)))));

if (empty($studentIds) || empty($data['to_advisor_id']) || !isset($data['reason'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing transfer request fields'], JSON_UNESCAPED_UNICODE);
    exit;
}

function resolveAdvisor(PDO $db, string $advisorRef): array
{
    $stmt = $db->prepare("
        SELECT u.user_id, u.username AS faculty_id
        FROM users u
        WHERE CAST(u.username AS CHAR) = :advisor_ref
           OR CAST(u.user_id AS CHAR) = :advisor_user_ref
        LIMIT 1
    ");
    $stmt->execute([
        ':advisor_ref' => $advisorRef,
        ':advisor_user_ref' => $advisorRef,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        return [
            'user_id' => (int)$row['user_id'],
            'faculty_id' => (string)$row['faculty_id'],
        ];
    }

    return [
        'user_id' => null,
        'faculty_id' => $advisorRef,
    ];
}

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);
    approvalRequireAuth($db);

    if (approvalCurrentRoleId($db) !== 2 && approvalCurrentRoleId($db) !== 1) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Only teachers can request advisor transfer'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $fromAdvisorRef = (string)($data['from_advisor_id'] ?? $_SESSION['username'] ?? $_SESSION['user_id'] ?? '');
    $toAdvisorRef = (string)$data['to_advisor_id'];
    $reason = trim((string)$data['reason']);

    $fromAdvisor = resolveAdvisor($db, $fromAdvisorRef);
    $toAdvisor = resolveAdvisor($db, $toAdvisorRef);

    if (!$fromAdvisor['user_id']) {
        throw new Exception('Requester advisor not found');
    }

    if ($fromAdvisor['faculty_id'] === $toAdvisor['faculty_id'] || ($fromAdvisor['user_id'] && $fromAdvisor['user_id'] === $toAdvisor['user_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถโอนย้ายนักศึกษาให้อาจารย์ท่านเดิมได้'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ตรวจสอบว่านักศึกษาอยู่ในความดูแลของอาจารย์ผู้ขอหรือไม่
    $stdPlaceholders = implode(',', array_fill(0, count($studentIds), '?'));
    $ownershipStmt = $db->prepare("
        SELECT DISTINCT CAST(student_id AS CHAR) AS student_id
        FROM student_advisor_mapping
        WHERE CAST(faculty_id AS CHAR) = ?
          AND student_id IN ($stdPlaceholders)
    ");
    $ownershipParams = array_merge([(string)$fromAdvisor['faculty_id']], $studentIds);
    $ownershipStmt->execute($ownershipParams);
    $validStudentIds = $ownershipStmt->fetchAll(PDO::FETCH_COLUMN);

    $invalidIds = array_diff($studentIds, $validStudentIds);
    if (!empty($invalidIds)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'พบรหัสนักศึกษาที่ไม่อยู่ในความดูแลของท่าน: ' . implode(', ', $invalidIds)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ตรวจสอบว่ามีนักศึกษาคนใดที่มีคำร้องขอโอนย้ายที่รอดำเนินการอยู่แล้วหรือไม่ เพื่อป้องกันการส่งคำขอซ้ำ
    $stmt = $db->prepare("
        SELECT approval_request_id, target_ref_id, payload_json
        FROM approval_requests
        WHERE request_type = 'student_transfer'
          AND status = 'pending'
    ");
    $stmt->execute();
    $pendingRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $pendingStudentMap = [];
    foreach ($pendingRequests as $pReq) {
        $pPayload = json_decode((string)($pReq['payload_json'] ?? ''), true) ?: [];
        if (!empty($pPayload['student_ids']) && is_array($pPayload['student_ids'])) {
            foreach ($pPayload['student_ids'] as $sid) {
                $pendingStudentMap[(string)$sid] = true;
            }
        }
        if (!empty($pPayload['student_id'])) {
            $pendingStudentMap[(string)$pPayload['student_id']] = true;
        }
        if (!empty($pReq['target_ref_id'])) {
            foreach (explode(',', (string)$pReq['target_ref_id']) as $sid) {
                $sid = trim($sid);
                if ($sid !== '') {
                    $pendingStudentMap[$sid] = true;
                }
            }
        }
    }

    $duplicateIds = array_values(array_intersect($studentIds, array_keys($pendingStudentMap)));
    if (!empty($duplicateIds)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'มีนักศึกษาบางท่านมีคำขอโอนย้ายที่รอดำเนินการอยู่แล้ว ไม่สามารถส่งคำขอซ้ำได้: ' . implode(', ', $duplicateIds)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db->beginTransaction();

    $studentCount = count($studentIds);
    $targetRefId = $studentCount === 1 ? $studentIds[0] : implode(',', $studentIds);
    $title = $studentCount === 1
        ? "โอนย้ายนักศึกษา ({$studentIds[0]})"
        : "โอนย้ายนักศึกษา ({$studentCount} คน)";

    $payload = [
        'student_ids' => $studentIds,
        'student_id' => $studentCount === 1 ? $studentIds[0] : null,
        'from_advisor_id' => $fromAdvisor['faculty_id'],
        'to_advisor_id' => $toAdvisor['faculty_id'],
        'from_advisor_user_id' => $fromAdvisor['user_id'],
        'to_advisor_user_id' => $toAdvisor['user_id'],
        'reason' => $reason,
    ];

    $requestId = approvalCreateRequest($db, [
        'request_type' => 'student_transfer',
        'requester_user_id' => $fromAdvisor['user_id'],
        'target_ref_type' => 'student',
        'target_ref_id' => $targetRefId,
        'title' => $title,
        'description' => $reason,
        'payload_json' => $payload,
    ]);

    // บันทึกระบบ Audit Log
    $studentsStr = implode(', ', $studentIds);
    logAudit($db, $fromAdvisor['user_id'], 'create', 'transfer_requests', "สร้างคำร้องขอโอนย้ายนักศึกษา {$studentCount} คน ({$studentsStr}) ไปยังอาจารย์ {$toAdvisor['faculty_id']}");

    if ($db->inTransaction()) {
        $db->commit();
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Transfer request created and sent to Admin',
        'id' => $requestId,
        'ids' => [$requestId],
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>