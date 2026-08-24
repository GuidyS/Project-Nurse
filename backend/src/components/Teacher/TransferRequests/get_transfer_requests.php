<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/Approvals/approval-schema.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

function advisorContext(PDO $db, string $advisorRef): array
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

    return [
        'user_id' => $row ? (int)$row['user_id'] : (int)$advisorRef,
        'faculty_id' => $row ? (string)$row['faculty_id'] : $advisorRef,
    ];
}

function studentName(PDO $db, string $studentId): string
{
    $stmt = $db->prepare("
        SELECT TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) AS name
        FROM student
        WHERE CAST(student_id AS CHAR) = :student_id
           OR CAST(student_code AS CHAR) = :student_code
        LIMIT 1
    ");
    $stmt->execute([
        ':student_id' => $studentId,
        ':student_code' => $studentId,
    ]);
    $name = trim((string)$stmt->fetchColumn());
    return $name !== '' ? $name : $studentId;
}

function advisorName(PDO $db, string $advisorId): string
{
    $stmt = $db->prepare("
        SELECT TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) AS name
        FROM faculty
        WHERE CAST(faculty_id AS CHAR) = :advisor_id
        LIMIT 1
    ");
    $stmt->execute([':advisor_id' => $advisorId]);
    $name = trim((string)$stmt->fetchColumn());
    return $name !== '' ? $name : $advisorId;
}

function transferRow(PDO $db, array $request, array $payload, string $type, string $otherAdvisorId): array
{
    $studentId = (string)($payload['student_id'] ?? $request['target_ref_id'] ?? '');

    return [
        'id' => (string)$request['approval_request_id'],
        'studentId' => $studentId,
        'studentName' => studentName($db, $studentId),
        'otherAdvisor' => advisorName($db, $otherAdvisorId),
        'reason' => $payload['reason'] ?? $request['description'] ?? '',
        'date' => substr((string)$request['created_at'], 0, 10),
        'status' => $request['status'],
        'type' => $type,
    ];
}

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);

    $advisorRef = isset($_GET['faculty_id'])
        ? (string)$_GET['faculty_id']
        : (string)($_SESSION['username'] ?? $_SESSION['user_id'] ?? '1');
    $current = advisorContext($db, $advisorRef);

    $incoming = [];
    $outgoing = [];
    $history = [];

    $stmt = $db->prepare("
        SELECT approval_request_id, target_ref_id, description, payload_json, status, created_at
        FROM approval_requests
        WHERE request_type = 'student_transfer'
        ORDER BY created_at DESC, approval_request_id DESC
    ");
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($requests as $request) {
        $payload = json_decode((string)($request['payload_json'] ?? ''), true);
        if (!is_array($payload)) $payload = [];

        $fromFacultyId = (string)($payload['from_advisor_id'] ?? '');
        $toFacultyId = (string)($payload['to_advisor_id'] ?? '');
        $fromUserId = isset($payload['from_advisor_user_id']) ? (int)$payload['from_advisor_user_id'] : null;
        $toUserId = isset($payload['to_advisor_user_id']) ? (int)$payload['to_advisor_user_id'] : null;

        $isIncoming = $toFacultyId === $current['faculty_id'] || $toUserId === $current['user_id'];
        $isOutgoing = $fromFacultyId === $current['faculty_id'] || $fromUserId === $current['user_id'];

        if (!$isIncoming && !$isOutgoing) continue;

        if ($request['status'] === 'pending') {
            if ($isIncoming) {
                $incoming[] = transferRow($db, $request, $payload, 'incoming', $fromFacultyId ?: (string)$fromUserId);
            }
            if ($isOutgoing) {
                $outgoing[] = transferRow($db, $request, $payload, 'outgoing', $toFacultyId ?: (string)$toUserId);
            }
        } else {
            $history[] = transferRow(
                $db,
                $request,
                $payload,
                $isIncoming ? 'incoming' : 'outgoing',
                $isIncoming ? ($fromFacultyId ?: (string)$fromUserId) : ($toFacultyId ?: (string)$toUserId)
            );
        }
    }

    $students = $db->query("
        SELECT
            CAST(student_id AS CHAR) AS id,
            CONCAT(CAST(student_id AS CHAR), ' - ', TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, '')))) AS name
        FROM student
        ORDER BY student_id
    ")->fetchAll(PDO::FETCH_ASSOC);

    $advisorStmt = $db->prepare("
        SELECT
            CAST(faculty_id AS CHAR) AS id,
            CONCAT(CAST(faculty_id AS CHAR), ' - ', TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, '')))) AS name
        FROM faculty
        WHERE CAST(faculty_id AS CHAR) != :current_faculty_id
        ORDER BY faculty_id
    ");
    $advisorStmt->execute([':current_faculty_id' => $current['faculty_id']]);
    $advisors = $advisorStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "incoming" => $incoming,
            "outgoing" => $outgoing,
            "history" => $history,
            "dropdowns" => [
                "students" => $students,
                "advisors" => $advisors
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>