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
    if (empty($input['clo_id']) || empty($input['description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
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

    $mappingData = loadActiveMappingData($pdo);
    $existing = null;
    foreach (listAllClosDetailed($pdo, $frameworkId) as $clo) {
        if ((int)$clo['id'] === (int)$input['clo_id']) {
            $existing = $clo;
            break;
        }
    }
    if (!$existing) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบ CLO ที่ต้องการแก้ไข"]);
        exit();
    }

    $ylo_id = $input['ylo_id'] ?? ($existing['ylo_code'] ?? null);
    $mapped_plos = derivePlosFromYlo($mappingData, $ylo_id);
    $sub_plos = filterSubPlosByAllowedPlos(
        $mappingData,
        $input['sub_plos'] ?? ($existing['sub_plos'] ?? null),
        $mapped_plos
    );

    $pdo->beginTransaction();
    $ok = updateCurriculumClo(
        $pdo,
        $frameworkId,
        (int)$input['clo_id'],
        [
            'clo_code' => $input['clo_code'] ?? null,
            'description' => $input['description'],
            'ylo_id' => $ylo_id,
            'plo_weights' => $existing['plo_weights'] ?? [],
            'weight' => $existing['weight'] ?? null,
            'status' => $existing['status'] ?? 'active',
        ],
        $mapped_plos,
        $sub_plos,
        $subjectCode ? (string)$subjectCode : null
    );
    if (!$ok) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบ CLO ที่ต้องการแก้ไข"]);
        exit();
    }
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลสำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
