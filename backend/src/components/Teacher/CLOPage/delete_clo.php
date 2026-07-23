<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    if (!isset($input['clo_id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบ ID ที่ต้องการลบ"]);
        exit();
    }

    $frameworkId = getActiveFrameworkId($pdo);
    if (!$frameworkId || !curriculumTablesReady($pdo) || !curriculumHasRelationalData($pdo, $frameworkId)) {
        http_response_code(503);
        echo json_encode([
            "status" => "error",
            "message" => "ยังไม่ได้ migrate ข้อมูลหลักสูตรไปตาราง relational",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $subjectCode = null;
    if (!empty($input['subject_id'])) {
        $subjectStmt = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = :subject_id LIMIT 1");
        $subjectStmt->execute([':subject_id' => $input['subject_id']]);
        $subjectCode = $subjectStmt->fetchColumn() ?: null;
    }

    $pdo->beginTransaction();
    $ok = deleteCurriculumClo(
        $pdo,
        $frameworkId,
        (int)$input['clo_id'],
        $subjectCode ? (string)$subjectCode : null
    );
    if (!$ok) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบ CLO ที่ต้องการลบ"]);
        exit();
    }
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
