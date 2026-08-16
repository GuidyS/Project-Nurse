<?php

function ensureApprovalRequestsSchema(PDO $db): void
{
    $db->exec("
        CREATE TABLE IF NOT EXISTS approval_requests (
            approval_request_id BIGINT NOT NULL AUTO_INCREMENT,
            request_type VARCHAR(50) NOT NULL,
            requester_user_id BIGINT DEFAULT NULL,
            target_ref_type VARCHAR(50) DEFAULT NULL,
            target_ref_id VARCHAR(100) DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            payload_json JSON DEFAULT NULL,
            status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
            review_note TEXT DEFAULT NULL,
            reviewed_by BIGINT DEFAULT NULL,
            reviewed_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (approval_request_id),
            KEY idx_approval_requests_status (status),
            KEY idx_approval_requests_type (request_type),
            KEY idx_approval_requests_requester (requester_user_id),
            KEY idx_approval_requests_reviewer (reviewed_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $payloadColumnStmt = $db->query("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'approval_requests'
          AND COLUMN_NAME = 'payload_json'
    ");
    $hasPayloadColumn = (int)$payloadColumnStmt->fetchColumn() > 0;

    if (!$hasPayloadColumn) {
        $db->exec("
            ALTER TABLE approval_requests
            ADD COLUMN payload_json JSON DEFAULT NULL AFTER description
        ");
    }

    seedApprovalRequests($db);
}

function seedApprovalRequests(PDO $db): void
{
    $count = (int)$db->query("SELECT COUNT(*) FROM approval_requests")->fetchColumn();
    if ($count > 0) {
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO approval_requests
            (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, payload_json, status, reviewed_by, reviewed_at, created_at)
        VALUES
            (:request_type, :requester_user_id, :target_ref_type, :target_ref_id, :title, :description, :payload_json, :status, :reviewed_by, :reviewed_at, :created_at)
    ");

    $seedRows = [
        ['grade_change', 2, 'assessment', '64010001-NUR101', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101', ['student_id' => '64010001', 'subject_code' => 'NUR101', 'current_grade' => 'B+', 'requested_grade' => 'A', 'reason' => 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101'], 'pending', null, null, '2024-01-15 09:00:00'],
        ['student_transfer', 3, 'student', '65010002', 'ขอรับมอบนักศึกษา', 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม', ['student_id' => '65010002', 'from_advisor_user_id' => 2, 'to_advisor_user_id' => 3, 'reason' => 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม'], 'pending', null, null, '2024-01-14 10:30:00'],
        ['project_request', 4, 'project', 'research-skill-development', 'ขอเปิดโครงการวิจัย', 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล', ['project_id' => null, 'project_name' => 'การพัฒนาทักษะการพยาบาล', 'academic_year' => 2568, 'budget_requested' => 50000, 'reason' => 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล'], 'pending', null, null, '2024-01-12 13:15:00'],
        ['document_approve', 6, 'document', 'TQF3-NUR301', 'ขออนุมัติเอกสาร', 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301', ['document_ref' => 'TQF3-NUR301', 'document_title' => 'TQF 3 รายวิชา NUR301', 'document_type' => 'TQF 3', 'file_path' => null, 'reason' => 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301'], 'approved', 5, '2024-01-11 11:00:00', '2024-01-10 08:45:00'],
        ['grade_change', 7, 'assessment', '63010005-NUR401', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401', ['student_id' => '63010005', 'subject_code' => 'NUR401', 'current_grade' => 'C', 'requested_grade' => 'B', 'reason' => 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401'], 'rejected', 5, '2024-01-09 15:20:00', '2024-01-08 14:00:00'],
    ];

    foreach ($seedRows as $row) {
        $stmt->execute([
            ':request_type' => $row[0],
            ':requester_user_id' => $row[1],
            ':target_ref_type' => $row[2],
            ':target_ref_id' => $row[3],
            ':title' => $row[4],
            ':description' => $row[5],
            ':payload_json' => json_encode($row[6], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':status' => $row[7],
            ':reviewed_by' => $row[8],
            ':reviewed_at' => $row[9],
            ':created_at' => $row[10],
        ]);
    }
}

function logApprovalAction(PDO $db, string $action, int $requestId, ?int $userId): void
{
    $resource = 'อนุมัติคำขอ';
    $targetDetail = '';
    $requestStmt = $db->prepare("
        SELECT request_type, target_ref_id
        FROM approval_requests
        WHERE approval_request_id = :request_id
        LIMIT 1
    ");
    $requestStmt->execute([':request_id' => $requestId]);
    $request = $requestStmt->fetch(PDO::FETCH_ASSOC);

    if ($request && $request['request_type'] === 'project_request') {
        $resource = 'การอนุมัติโครงการ';
        $targetDetail = ' โครงการ ID: ' . $request['target_ref_id'];
    }

    $stmt = $db->prepare("
        INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
        VALUES (:user_id, 'update', :resource, :details, :ip_address)
    ");

    $stmt->execute([
        ':user_id' => $userId ?: 1,
        ':resource' => $resource,
        ':details' => $action . ' คำขออนุมัติ ID: ' . $requestId . $targetDetail,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    ]);
}

?>
