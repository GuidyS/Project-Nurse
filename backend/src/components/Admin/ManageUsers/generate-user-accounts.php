<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/user-account-import-helper.php';

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "ไม่มีสิทธิ์สร้างบัญชีผู้ใช้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $candidatesStmt = $db->query(
        "SELECT CAST(f.faculty_id AS CHAR) AS username, f.birth_date AS birth_date, 'faculty' AS source
         FROM faculty f
         UNION ALL
         SELECT CAST(s.student_id AS CHAR), s.birth_date, 'student'
         FROM student s"
    );
    $candidates = $candidatesStmt->fetchAll(PDO::FETCH_ASSOC);

    $summary = createUserAccountsFromRows($db, $candidates, [
        'faculty' => null,
        'student' => 3,
    ]);

    $message = buildUserAccountCreationMessage($summary);

    //  บันทึกเป็น 'create' และส่ง Resource 'import_data'
    logAudit($db, $_SESSION['user_id'], 'create', 'import_data', $message);

    echo json_encode([
        "status" => "success",
        "message" => $message,
        "imported" => $summary['created'],
        "facultyCount" => $summary['facultyCount'],
        "studentCount" => $summary['studentCount'],
        "skippedExisting" => $summary['skippedExisting'],
        "skippedNoBirth" => $summary['skippedNoBirth'],
        "skippedInvalid" => $summary['skippedInvalid'],
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
