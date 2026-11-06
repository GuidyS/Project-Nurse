<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/clo_mapping_helpers.php';
require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';
require_once __DIR__ . '/../../../config/curriculum_outcomes.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    // รับได้ทั้ง subject_id (ตาราง subject) และ subject_code (วิชาที่มีเฉพาะในหน้า "จัดการหลักสูตร")
    $hasSubjectParam = (isset($_GET['subject_id']) && $_GET['subject_id'] !== '')
        || (isset($_GET['subject_code']) && $_GET['subject_code'] !== '');

    if ($hasSubjectParam) {
        $subject_code = cloResolveSubjectCode($pdo, $_GET);

        if (!$subject_code) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $frameworkId = getActiveFrameworkId($pdo);
        if (!$frameworkId) {
            echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "subject_ylo" => null, "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
            exit();
        }

        if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $frameworkId)) {
            outcomesEnsureSchema($pdo);

            // YLO ของรายวิชามาจากหน้า "จัดการหลักสูตร" — หน้านี้ไม่ให้เลือกเองอีกแล้ว
            $subjectYlo = outcomesSubjectYlo($pdo, (string)$subject_code);
            $subPloCatalog = $subjectYlo === null
                ? []
                : outcomesSubPlos($pdo, $frameworkId, $subjectYlo);

            // คะแนนที่แต่ละ CLO แบ่งให้ Sub PLO ไว้แล้ว
            $scoresByClo = [];
            foreach (outcomesSubjectCloScores($pdo, $frameworkId, (string)$subject_code) as $score) {
                $scoresByClo[$score['clo_id']][$score['code']] = [
                    'sub_plo_id' => $score['sub_plo_id'],
                    'max_score' => $score['max_score'],
                    'pass_score' => $score['pass_score'],
                ];
            }

            $clos = listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code);
            foreach ($clos as &$clo) {
                $clo['sub_plo_scores'] = $scoresByClo[(int)$clo['clo_id']] ?? new stdClass();
            }
            unset($clo);

            echo json_encode([
                "status" => "success",
                "data" => [
                    "clos" => $clos,
                    "plos" => getPloCatalogFromTables($pdo, $frameworkId),
                    "subject_ylo" => $subjectYlo,
                    "sub_plo_catalog" => $subPloCatalog,
                    "score_budget" => outcomesSubjectScoreBudget($pdo, $frameworkId, (string)$subject_code),
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
                "subject_ylo" => null,
                "sub_plo_catalog" => [],
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    echo json_encode(["status" => "success", "data" => ["clos" => [], "plos" => [], "subject_ylo" => null, "sub_plo_catalog" => []]], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
