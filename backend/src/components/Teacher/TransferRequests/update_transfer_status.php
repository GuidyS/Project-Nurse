<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Admin/Approvals/approval-schema.php';

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$data = json_decode(file_get_contents('php://input'), true) ?: [];

if (empty($data['request_id']) || empty($data['status'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
    exit;
}

$status = (string)$data['status'];
if (!in_array($status, ['approved', 'rejected'], true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "สถานะไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);

    $db->beginTransaction();

    $stmtReq = $db->prepare("
        SELECT approval_request_id, payload_json
        FROM approval_requests
        WHERE approval_request_id = :id
          AND request_type = 'student_transfer'
        LIMIT 1
    ");
    $stmtReq->execute([':id' => $data['request_id']]);
    $request = $stmtReq->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        throw new Exception('ไม่พบคำขอย้ายที่ต้องการอัปเดต');
    }

    $reviewerId = $_SESSION['user_id'] ?? null;
    $stmt = $db->prepare("
        UPDATE approval_requests
        SET status = :status,
            reviewed_by = :reviewed_by,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE approval_request_id = :id
    ");
    $stmt->execute([
        ':status' => $status,
        ':reviewed_by' => $reviewerId,
        ':id' => $data['request_id'],
    ]);

    if ($status === 'approved') {
        $payload = json_decode((string)$request['payload_json'], true);
        if (!is_array($payload)) $payload = [];

        $studentId = (string)($payload['student_id'] ?? '');
        $toAdvisorId = (string)($payload['to_advisor_id'] ?? '');

        if ($studentId === '' || $toAdvisorId === '') {
            throw new Exception('ข้อมูลนักศึกษาหรืออาจารย์ปลายทางไม่ครบ');
        }

        $stmtCheck = $db->prepare("SELECT mapping_id FROM student_advisor_mapping WHERE student_id = :student_id LIMIT 1");
        $stmtCheck->execute([':student_id' => $studentId]);
        $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $stmtMap = $db->prepare("
                UPDATE student_advisor_mapping
                SET faculty_id = :to_advisor_id
                WHERE student_id = :student_id
            ");
            $stmtMap->execute([
                ':to_advisor_id' => $toAdvisorId,
                ':student_id' => $studentId,
            ]);
        } else {
            $stmtInsert = $db->prepare("
                INSERT INTO student_advisor_mapping (student_id, faculty_id, advisor_type, academic_year)
                VALUES (:student_id, :to_advisor_id, 'General', YEAR(CURRENT_DATE))
            ");
            $stmtInsert->execute([
                ':to_advisor_id' => $toAdvisorId,
                ':student_id' => $studentId,
            ]);
        }
    }

    $db->commit();
    echo json_encode(["status" => "success", "message" => "อัปเดตสถานะสำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
