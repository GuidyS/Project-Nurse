<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/clo_mapping_helpers.php';
require_once __DIR__ . '/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $subject_id = isset($_GET['subject_id']) ? $_GET['subject_id'] : null;

    if ($subject_id !== null && $subject_id !== '' && ctype_digit((string)$subject_id)) {
        $subjectStmt = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = :subject_id LIMIT 1");
        $subjectStmt->execute([':subject_id' => $subject_id]);
        $subject_code = $subjectStmt->fetchColumn();

        if (!$subject_code) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $frameworkId = getActiveFrameworkId($pdo);
        if (!$frameworkId) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "ylo_matrix" => new stdClass(), "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
            $clos = listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code);
            $yloMatrix = getYloMatrixFromTables($pdo, $frameworkId);
            echo json_encode([
                "status" => "success",
                "data" => [
                    "clos" => $clos,
                    "plos" => getPloCatalogFromTables($pdo, $frameworkId),
                    "ylo_matrix" => empty($yloMatrix) ? new stdClass() : $yloMatrix,
                    "sub_plo_catalog" => getSubPloCatalogFromTables($pdo, $frameworkId),
                ],
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $mappingData = loadActiveMappingData($pdo);
        $rawClos = $mappingData['subject_mappings'][$subject_code]['clos'] ?? [];

        $clos = [];
        foreach ($rawClos as $index => $clo) {
            $clos[] = [
                "clo_id" => (int)($clo['clo_id'] ?? ($index + 1)),
                "clo_code" => $clo['clo_code'] ?? null,
                "description" => $clo['description'] ?? ($clo['clo_description'] ?? ''),
                "ylo_id" => $clo['ylo_id'] ?? null,
                "mapped_plos" => $clo['mapped_plos'] ?? [],
                "sub_plos" => $clo['sub_plos'] ?? [],
            ];
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "clos" => $clos,
                "plos" => getPloCatalog($mappingData),
                "ylo_matrix" => $mappingData['ylo_plo_matrix'] ?? new stdClass(),
                "sub_plo_catalog" => getSubPloCatalog($mappingData),
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "ylo_matrix" => new stdClass(), "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
