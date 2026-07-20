<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/approval-schema.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();
    ensureApprovalRequestsSchema($db);

    $status = $_GET['status'] ?? 'all';
    $params = [];
    $where = '';

    if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
        $where = 'WHERE ar.status = :status';
        $params[':status'] = $status;
    }

    $stmt = $db->prepare("
        SELECT
            ar.approval_request_id,
            ar.request_type,
            ar.target_ref_type,
            ar.target_ref_id,
            ar.title,
            ar.description,
            ar.payload_json,
            ar.status,
            ar.review_note,
            ar.reviewed_at,
            ar.created_at,
            requester.username AS requester_username,
            reviewer.username AS reviewer_username,
            CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, '')) AS requester_full_name
        FROM approval_requests ar
        LEFT JOIN users requester ON ar.requester_user_id = requester.user_id
        LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.user_id
        LEFT JOIN faculty f ON requester.user_id = f.faculty_id
        $where
        ORDER BY
            CASE ar.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
            ar.created_at DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $requests = array_map(function ($row) {
        $requesterName = trim($row['requester_full_name'] ?? '');
        if ($requesterName === '') {
            $requesterName = $row['requester_username'] ?: 'ไม่ระบุผู้ร้องขอ';
        }

        $payload = [];
        if (!empty($row['payload_json'])) {
            $decodedPayload = json_decode($row['payload_json'], true);
            $payload = is_array($decodedPayload) ? $decodedPayload : [];
        } elseif (!empty($row['description']) && json_decode($row['description'], true) !== null) {
            $decodedPayload = json_decode($row['description'], true);
            $payload = is_array($decodedPayload) ? $decodedPayload : [];
        }

        $detail = $payload;
        $targetRefType = $row['target_ref_type'];
        $targetRefId = $row['target_ref_id'];

        if ($row['request_type'] === 'grade_change') {
            $detail = [
                'studentId' => $payload['student_id'] ?? null,
                'subjectCode' => $payload['subject_code'] ?? null,
                'currentGrade' => $payload['current_grade'] ?? null,
                'requestedGrade' => $payload['requested_grade'] ?? null,
            ];
            $targetRefType = 'assessment';
            $targetRefId = trim(($payload['student_id'] ?? '') . '-' . ($payload['subject_code'] ?? ''), '-') ?: $targetRefId;
        } elseif ($row['request_type'] === 'student_transfer') {
            $detail = [
                'studentId' => $payload['student_id'] ?? null,
                'fromAdvisorUserId' => $payload['from_advisor_user_id'] ?? null,
                'toAdvisorUserId' => $payload['to_advisor_user_id'] ?? null,
            ];
            $targetRefType = 'student';
            $targetRefId = $payload['student_id'] ?? $targetRefId;
        } elseif ($row['request_type'] === 'project_request') {
            $detail = [
                'projectId' => $payload['project_id'] ?? null,
                'projectName' => $payload['project_name'] ?? null,
                'academicYear' => $payload['academic_year'] ?? null,
                'budgetRequested' => $payload['budget_requested'] ?? null,
            ];
            $targetRefType = 'project';
            $targetRefId = $payload['project_id'] ?? ($payload['project_name'] ?? $targetRefId);
        } elseif ($row['request_type'] === 'document_approve') {
            $detail = [
                'documentRef' => $payload['document_ref'] ?? null,
                'documentTitle' => $payload['document_title'] ?? null,
                'documentType' => $payload['document_type'] ?? null,
                'filePath' => $payload['file_path'] ?? null,
            ];
            $targetRefType = 'document';
            $targetRefId = $payload['document_ref'] ?? $targetRefId;
        }

        return [
            'id' => (string)$row['approval_request_id'],
            'type' => $row['request_type'],
            'targetRefType' => $targetRefType,
            'targetRefId' => $targetRefId,
            'title' => $row['title'],
            'requester' => $requesterName,
            'description' => $row['description'],
            'date' => substr((string)$row['created_at'], 0, 10),
            'status' => $row['status'],
            'reviewNote' => $row['review_note'],
            'reviewedAt' => $row['reviewed_at'],
            'reviewer' => $row['reviewer_username'],
            'detail' => $detail,
        ];
    }, $rows);

    echo json_encode(['status' => 'success', 'data' => $requests], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
