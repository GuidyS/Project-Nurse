<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/clo_mapping_helpers.php';
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
    if (empty($input['subject_id']) || empty($input['description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
        exit();
    }

    $subjectStmt = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = :subject_id LIMIT 1");
    $subjectStmt->execute([':subject_id' => $input['subject_id']]);
    $subject_code = $subjectStmt->fetchColumn();

    if (!$subject_code) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบรายวิชา"]);
        exit();
    }

    $frameworkId = getActiveFrameworkId($pdo);
    if (!$frameworkId) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่เปิดใช้งาน"]);
        exit();
    }

    $mappingData = loadActiveMappingData($pdo);
    $mapped_plos = derivePlosFromYlo($mappingData, $input['ylo_id'] ?? null);
    $sub_plos = filterSubPlosByAllowedPlos($mappingData, $input['sub_plos'] ?? null, $mapped_plos);

    if (!curriculumTablesReady($pdo) || !curriculumHasRelationalData($pdo, $frameworkId)) {
        http_response_code(503);
        echo json_encode([
            "status" => "error",
            "message" => "ยังไม่ได้ migrate ข้อมูลหลักสูตรไปตาราง relational — รัน curriculum_relational_schema.sql และ migrate_mapping_json_to_tables.php",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $pdo->beginTransaction();
    addCurriculumClo(
        $pdo,
        $frameworkId,
        (string)$subject_code,
        [
            'clo_code' => $input['clo_code'] ?? null,
            'description' => $input['description'],
            'ylo_id' => $input['ylo_id'] ?? null,
        ],
        $mapped_plos,
        $sub_plos
    );
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "เพิ่ม CLO สำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
