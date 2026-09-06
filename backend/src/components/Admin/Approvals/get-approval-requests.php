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
    approvalRequireAdmin($db);

    $status = $_GET['status'] ?? 'all';
    $requestType = trim((string)($_GET['request_type'] ?? ''));
    $params = [];
    $whereParts = [];

    if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
        $whereParts[] = 'ar.status = :status';
        $params[':status'] = $status;
    }
    if ($requestType !== '') {
        $whereParts[] = 'ar.request_type = :request_type';
        $params[':request_type'] = $requestType;
    }

    $where = empty($whereParts) ? '' : 'WHERE ' . implode(' AND ', $whereParts);

    $stmt = $db->prepare("
        SELECT
            ar.approval_request_id,
            ar.request_type,
            ar.target_ref_type,
            ar.target_ref_id,
            ar.title,
            ar.description,
            ar.payload_json,
            ar.before_json,
            ar.after_json,
            ar.status,
            ar.review_note,
            ar.reviewed_at,
            ar.applied_at,
            ar.created_at,
            requester.username AS requester_username,
            reviewer.username AS reviewer_username,
            CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, '')) AS requester_full_name
        FROM approval_requests ar
        LEFT JOIN users requester ON ar.requester_user_id = requester.user_id
        LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.user_id
        LEFT JOIN faculty f ON requester.user_id = f.user_id OR requester.username = CAST(f.faculty_id AS CHAR)
        $where
        ORDER BY
            CASE ar.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
            ar.created_at DESC,
            ar.approval_request_id DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $requests = array_map(function ($row) {
        $requesterName = trim((string)($row['requester_full_name'] ?? ''));
        if ($requesterName === '') {
            $requesterName = $row['requester_username'] ?: 'Unknown requester';
        }

        $payload = approvalDecodePayload($row['payload_json'] ?? null);
        $before = approvalDecodePayload($row['before_json'] ?? null);
        $after = approvalDecodePayload($row['after_json'] ?? null);
        $documentUrl = $payload['document_url'] ?? $payload['google_drive_url'] ?? $payload['file_path'] ?? null;

        return [
            'id' => (string)$row['approval_request_id'],
            'type' => $row['request_type'],
            'targetRefType' => $row['target_ref_type'],
            'targetRefId' => $row['target_ref_id'],
            'title' => $row['title'],
            'requester' => $requesterName,
            'description' => $row['description'],
            'date' => substr((string)$row['created_at'], 0, 10),
            'status' => $row['status'],
            'reviewNote' => $row['review_note'],
            'reviewedAt' => $row['reviewed_at'],
            'appliedAt' => $row['applied_at'],
            'reviewer' => $row['reviewer_username'],
            'payload' => $payload,
            'before' => $before,
            'after' => $after,
            'documentUrl' => $documentUrl,
            'detail' => [
                'targetRefType' => $row['target_ref_type'],
                'targetRefId' => $row['target_ref_id'],
                'payload' => $payload,
                'before' => $before,
                'after' => $after,
            ],
        ];
    }, $rows);

    echo json_encode(['status' => 'success', 'data' => $requests], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>
