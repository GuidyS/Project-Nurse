<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$inputCloMap = json_decode(file_get_contents("php://input"), true);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    if (!is_array($inputCloMap)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ถูกต้อง"]);
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
    foreach ($inputCloMap as $courseCode => $mappedPlos) {
        if (!is_string($courseCode) || $courseCode === '') {
            continue;
        }
        if (!is_array($mappedPlos)) {
            $mappedPlos = [];
        }
        $normalizedPlos = array_values(array_unique(array_filter($mappedPlos, 'is_string')));
        saveSubjectCoursePlos($pdo, $frameworkId, $courseCode, $normalizedPlos);
    }
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO Map สำเร็จ!"], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
