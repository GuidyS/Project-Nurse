<?php

require_once __DIR__ . '/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$subject_code = $_GET['subject_code'] ?? null;

try {
    if (!$subject_code) {
        echo json_encode(["status" => "error", "message" => "Subject code is required"]);
        exit();
    }

    $frameworkId = getActiveFrameworkId($pdo);
    if (!$frameworkId) {
        echo json_encode(["status" => "error", "message" => "No active curriculum framework found"]);
        exit();
    }

    if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
        echo json_encode([
            "status" => "success",
            "data" => listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code),
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $mapping_data = loadActiveMappingData($pdo);
    $subject_clos = $mapping_data['subject_mappings'][$subject_code]['clos'] ?? [];
    echo json_encode([
        "status" => "success",
        "data" => $subject_clos,
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
