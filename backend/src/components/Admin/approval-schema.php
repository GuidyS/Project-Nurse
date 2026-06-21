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

    $db->exec("
        CREATE TABLE IF NOT EXISTS grade_change_requests (
            grade_change_request_id BIGINT NOT NULL AUTO_INCREMENT,
            approval_request_id BIGINT NOT NULL,
            student_id VARCHAR(50) NOT NULL,
            subject_code VARCHAR(50) NOT NULL,
            current_grade VARCHAR(10) DEFAULT NULL,
            requested_grade VARCHAR(10) DEFAULT NULL,
            reason TEXT DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (grade_change_request_id),
            UNIQUE KEY uq_grade_change_approval (approval_request_id),
            KEY idx_grade_change_student (student_id),
            KEY idx_grade_change_subject (subject_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS student_transfer_requests (
            student_transfer_request_id BIGINT NOT NULL AUTO_INCREMENT,
            approval_request_id BIGINT NOT NULL,
            student_id VARCHAR(50) NOT NULL,
            from_advisor_user_id BIGINT DEFAULT NULL,
            to_advisor_user_id BIGINT DEFAULT NULL,
            reason TEXT DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (student_transfer_request_id),
            UNIQUE KEY uq_student_transfer_approval (approval_request_id),
            KEY idx_student_transfer_student (student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS project_approval_requests (
            project_approval_request_id BIGINT NOT NULL AUTO_INCREMENT,
            approval_request_id BIGINT NOT NULL,
            project_id BIGINT DEFAULT NULL,
            project_name VARCHAR(255) NOT NULL,
            academic_year INT DEFAULT NULL,
            budget_requested DECIMAL(15,2) DEFAULT NULL,
            reason TEXT DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (project_approval_request_id),
            UNIQUE KEY uq_project_approval (approval_request_id),
            KEY idx_project_approval_project (project_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS document_approval_requests (
            document_approval_request_id BIGINT NOT NULL AUTO_INCREMENT,
            approval_request_id BIGINT NOT NULL,
            document_ref VARCHAR(100) DEFAULT NULL,
            document_title VARCHAR(255) NOT NULL,
            document_type VARCHAR(100) DEFAULT NULL,
            file_path VARCHAR(500) DEFAULT NULL,
            reason TEXT DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (document_approval_request_id),
            UNIQUE KEY uq_document_approval (approval_request_id),
            KEY idx_document_approval_ref (document_ref)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    seedApprovalRequests($db);
    seedApprovalRequestDetails($db);
}

function seedApprovalRequests(PDO $db): void
{
    $count = (int)$db->query("SELECT COUNT(*) FROM approval_requests")->fetchColumn();
    if ($count > 0) {
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO approval_requests
            (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, status, reviewed_by, reviewed_at, created_at)
        VALUES
            (:request_type, :requester_user_id, :target_ref_type, :target_ref_id, :title, :description, :status, :reviewed_by, :reviewed_at, :created_at)
    ");

    $seedRows = [
        ['grade_change', 2, 'assessment', '64010001-NUR101', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101', 'pending', null, null, '2024-01-15 09:00:00'],
        ['student_transfer', 3, 'student', '65010002', 'ขอรับมอบนักศึกษา', 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม', 'pending', null, null, '2024-01-14 10:30:00'],
        ['project_request', 4, 'project', 'research-skill-development', 'ขอเปิดโครงการวิจัย', 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล', 'pending', null, null, '2024-01-12 13:15:00'],
        ['document_approve', 6, 'document', 'TQF3-NUR301', 'ขออนุมัติเอกสาร', 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301', 'approved', 5, '2024-01-11 11:00:00', '2024-01-10 08:45:00'],
        ['grade_change', 7, 'assessment', '63010005-NUR401', 'ขอแก้ไขเกรด', 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401', 'rejected', 5, '2024-01-09 15:20:00', '2024-01-08 14:00:00'],
    ];

    foreach ($seedRows as $row) {
        $stmt->execute([
            ':request_type' => $row[0],
            ':requester_user_id' => $row[1],
            ':target_ref_type' => $row[2],
            ':target_ref_id' => $row[3],
            ':title' => $row[4],
            ':description' => $row[5],
            ':status' => $row[6],
            ':reviewed_by' => $row[7],
            ':reviewed_at' => $row[8],
            ':created_at' => $row[9],
        ]);
    }
}

function seedApprovalRequestDetails(PDO $db): void
{
    $db->exec("
        INSERT INTO grade_change_requests
            (approval_request_id, student_id, subject_code, current_grade, requested_grade, reason)
        SELECT ar.approval_request_id,
               CASE
                   WHEN ar.target_ref_id LIKE '64010001%' THEN '64010001'
                   WHEN ar.target_ref_id LIKE '63010005%' THEN '63010005'
                   ELSE COALESCE(SUBSTRING_INDEX(ar.target_ref_id, '-', 1), '')
               END,
               CASE
                   WHEN ar.target_ref_id LIKE '%NUR101%' THEN 'NUR101'
                   WHEN ar.target_ref_id LIKE '%NUR401%' THEN 'NUR401'
                   ELSE COALESCE(SUBSTRING_INDEX(ar.target_ref_id, '-', -1), '')
               END,
               CASE WHEN ar.target_ref_id LIKE '64010001%' THEN 'B+' ELSE 'C' END,
               CASE WHEN ar.target_ref_id LIKE '64010001%' THEN 'A' ELSE 'B' END,
               ar.description
        FROM approval_requests ar
        WHERE ar.request_type = 'grade_change'
          AND NOT EXISTS (
              SELECT 1 FROM grade_change_requests gcr
              WHERE gcr.approval_request_id = ar.approval_request_id
          )
    ");

    $db->exec("
        INSERT INTO student_transfer_requests
            (approval_request_id, student_id, from_advisor_user_id, to_advisor_user_id, reason)
        SELECT ar.approval_request_id,
               COALESCE(ar.target_ref_id, ''),
               2,
               ar.requester_user_id,
               ar.description
        FROM approval_requests ar
        WHERE ar.request_type = 'student_transfer'
          AND NOT EXISTS (
              SELECT 1 FROM student_transfer_requests str
              WHERE str.approval_request_id = ar.approval_request_id
          )
    ");

    $db->exec("
        INSERT INTO project_approval_requests
            (approval_request_id, project_id, project_name, academic_year, budget_requested, reason)
        SELECT ar.approval_request_id,
               NULL,
               'การพัฒนาทักษะการพยาบาล',
               2568,
               50000.00,
               ar.description
        FROM approval_requests ar
        WHERE ar.request_type = 'project_request'
          AND NOT EXISTS (
              SELECT 1 FROM project_approval_requests par
              WHERE par.approval_request_id = ar.approval_request_id
          )
    ");

    $db->exec("
        INSERT INTO document_approval_requests
            (approval_request_id, document_ref, document_title, document_type, file_path, reason)
        SELECT ar.approval_request_id,
               ar.target_ref_id,
               'TQF 3 รายวิชา NUR301',
               'TQF 3',
               NULL,
               ar.description
        FROM approval_requests ar
        WHERE ar.request_type = 'document_approve'
          AND NOT EXISTS (
              SELECT 1 FROM document_approval_requests dar
              WHERE dar.approval_request_id = ar.approval_request_id
          )
    ");
}

function logApprovalAction(PDO $db, string $action, int $requestId, ?int $userId): void
{
    $stmt = $db->prepare("
        INSERT INTO audit_log (user_id, action_type, resource, details, ip_address)
        VALUES (:user_id, 'update', 'อนุมัติคำขอ', :details, :ip_address)
    ");

    $stmt->execute([
        ':user_id' => $userId ?: 1,
        ':details' => $action . ' คำขออนุมัติ ID: ' . $requestId,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    ]);
}

?>
