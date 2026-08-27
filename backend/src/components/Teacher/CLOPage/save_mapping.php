<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    if (empty($input['subject_code']) || !isset($input['clos'])) {
        echo json_encode(["status" => "error", "message" => "ข้อมูลที่ส่งมาไม่ครบถ้วน"]);
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

    $pdo->beginTransaction();
    replaceSubjectClos($pdo, $frameworkId, (string)$input['subject_code'], is_array($input['clos']) ? $input['clos'] : []);
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO เรียบร้อยแล้ว!"], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
