<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

function getGradePoint($grade) {
    $gradeMap = [
        'A' => 4.0,
        'B+' => 3.5,
        'B' => 3.0,
        'C+' => 2.5,
        'C' => 2.0,
        'D+' => 1.5,
        'D' => 1.0,
        'F' => 0.0,
    ];

    return $gradeMap[$grade] ?? 0.0;
}

try {
    $db = new Connect();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $userStmt = $db->prepare("SELECT username FROM users WHERE user_id = :user_id LIMIT 1");
    $userStmt->execute([':user_id' => $_SESSION['user_id']]);
    $studentId = $userStmt->fetchColumn();

    if (!$studentId) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Student user not found"]);
        exit;
    }

    $schemaStmt = $db->prepare("
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'assessments'
          AND column_name IN ('subject_id', 'academic_year', 'semester', 'grade')
    ");
    $schemaStmt->execute();
    $columns = $schemaStmt->fetchAll(PDO::FETCH_COLUMN);
    $hasGradeColumns = count(array_intersect($columns, ['subject_id', 'academic_year', 'semester', 'grade'])) === 4;

    $results = [];

    if ($hasGradeColumns) {
        $sql = "SELECT s.subject_code AS code,
                       COALESCE(s.subject_name_th, s.subject_name_en) AS name,
                       COALESCE(s.credit, 0) AS credits,
                       COALESCE(a.grade, '-') AS grade,
                       a.semester,
                       a.academic_year AS year
                FROM assessments a
                JOIN subject s ON a.subject_id = s.subject_id
                WHERE a.student_id = :student_id
                  AND a.grade IS NOT NULL
                  AND a.grade != ''
                ORDER BY a.academic_year DESC, a.semester DESC, s.subject_code ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute([':student_id' => $studentId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($results as &$row) {
            $row['credits'] = (int)$row['credits'];
            $row['gradePoint'] = getGradePoint($row['grade']);
            $row['semester'] = (string)$row['semester'];
            $row['year'] = (string)$row['year'];
        }
        unset($row);
    }

    echo json_encode([
        "status" => "success",
        "data" => $results
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
