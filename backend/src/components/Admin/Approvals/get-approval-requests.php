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
            ar.status,
            ar.review_note,
            ar.reviewed_at,
            ar.created_at,
            requester.username AS requester_username,
            reviewer.username AS reviewer_username,
            CONCAT(COALESCE(f.title, ''), COALESCE(f.first_name_th, ''), ' ', COALESCE(f.last_name_th, '')) AS requester_full_name,
            gcr.student_id AS grade_student_id,
            gcr.subject_code AS grade_subject_code,
            gcr.current_grade,
            gcr.requested_grade,
            str.student_id AS transfer_student_id,
            str.from_advisor_user_id,
            str.to_advisor_user_id,
            par.project_id,
            par.project_name,
            par.academic_year,
            par.budget_requested,
            dar.document_ref,
            dar.document_title,
            dar.document_type,
            dar.file_path
        FROM approval_requests ar
        LEFT JOIN users requester ON ar.requester_user_id = requester.user_id
        LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.user_id
        LEFT JOIN faculty f ON requester.user_id = f.faculty_id
        LEFT JOIN grade_change_requests gcr ON ar.approval_request_id = gcr.approval_request_id
        LEFT JOIN student_transfer_requests str ON ar.approval_request_id = str.approval_request_id
        LEFT JOIN project_approval_requests par ON ar.approval_request_id = par.approval_request_id
        LEFT JOIN document_approval_requests dar ON ar.approval_request_id = dar.approval_request_id
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

        $detail = [];
        $targetRefType = $row['target_ref_type'];
        $targetRefId = $row['target_ref_id'];

        if ($row['request_type'] === 'grade_change') {
            $detail = [
                'studentId' => $row['grade_student_id'],
                'subjectCode' => $row['grade_subject_code'],
                'currentGrade' => $row['current_grade'],
                'requestedGrade' => $row['requested_grade'],
            ];
            $targetRefType = 'assessment';
            $targetRefId = trim(($row['grade_student_id'] ?? '') . '-' . ($row['grade_subject_code'] ?? ''), '-');
        } elseif ($row['request_type'] === 'student_transfer') {
            $detail = [
                'studentId' => $row['transfer_student_id'],
                'fromAdvisorUserId' => $row['from_advisor_user_id'],
                'toAdvisorUserId' => $row['to_advisor_user_id'],
            ];
            $targetRefType = 'student';
            $targetRefId = $row['transfer_student_id'];
        } elseif ($row['request_type'] === 'project_request') {
            $detail = [
                'projectId' => $row['project_id'],
                'projectName' => $row['project_name'],
                'academicYear' => $row['academic_year'],
                'budgetRequested' => $row['budget_requested'],
            ];
            $targetRefType = 'project';
            $targetRefId = $row['project_id'] ?: $row['project_name'];
        } elseif ($row['request_type'] === 'document_approve') {
            $detail = [
                'documentRef' => $row['document_ref'],
                'documentTitle' => $row['document_title'],
                'documentType' => $row['document_type'],
                'filePath' => $row['file_path'],
            ];
            $targetRefType = 'document';
            $targetRefId = $row['document_ref'];
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
