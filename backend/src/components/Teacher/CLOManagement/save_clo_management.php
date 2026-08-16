<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/clo_mapping_helpers.php';
require_once __DIR__ . '/../CLOPage/curriculum_repository.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents('php://input'), true);

function convertManagementCloToStorage(array $clo, array $existingById, array $mappingData, int &$nextId): array
{
    $rawId = $clo['id'] ?? null;
    $cloId = null;

    if ($rawId !== null && $rawId !== '' && ctype_digit((string)$rawId)) {
        $cloId = (int)$rawId;
    }

    if ($cloId === null) {
        $cloId = ++$nextId;
    } else {
        $nextId = max($nextId, $cloId);
    }

    $existing = $existingById[$cloId] ?? [];

    $ploWeights = [];
    if (!empty($clo['plo_weights']) && is_array($clo['plo_weights'])) {
        foreach ($clo['plo_weights'] as $ploId => $weight) {
            if (is_string($ploId) && $ploId !== '') {
                $ploWeights[$ploId] = max(0, (int)$weight);
            }
        }
    }

    $legacyPlo = trim((string)($clo['plo'] ?? ''));
    if ($legacyPlo !== '' && empty($ploWeights)) {
        $ploWeights[$legacyPlo] = max(0, (int)($clo['weight'] ?? 0));
    }

    $explicitPlos = array_keys($ploWeights);
    $mappedPlos = buildCloMappedPlos($mappingData, $existing['ylo_id'] ?? ($clo['ylo_id'] ?? null), $explicitPlos);

    foreach ($mappedPlos as $ploId) {
        if (!isset($ploWeights[$ploId])) {
            $ploWeights[$ploId] = 0;
        }
    }

    $filteredWeights = [];
    foreach ($ploWeights as $ploId => $weight) {
        if (in_array($ploId, $mappedPlos, true)) {
            $filteredWeights[$ploId] = $weight;
        }
    }

    return [
        'clo_id' => $cloId,
        'clo_code' => $clo['code'] ?? ($existing['clo_code'] ?? null),
        'description' => $clo['description'] ?? ($existing['description'] ?? ''),
        'ylo_id' => $existing['ylo_id'] ?? ($clo['ylo_id'] ?? null),
        'mapped_plos' => $mappedPlos,
        'plo_weights' => $filteredWeights,
        'weight' => array_sum($filteredWeights),
        'status' => $clo['status'] ?? ($existing['status'] ?? 'active'),
        'sub_plos' => $existing['sub_plos'] ?? ($clo['sub_plos'] ?? []),
    ];
}

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    if (empty($input['subject_code']) || !isset($input['clos']) || !is_array($input['clos'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลที่ส่งมาไม่ครบถ้วน"]);
        exit();
    }

    $subject_code = $input['subject_code'];
    $frameworkId = getActiveFrameworkId($pdo);
    if (!$frameworkId || !curriculumTablesReady($pdo) || !curriculumHasRelationalData($pdo, $frameworkId)) {
        http_response_code(503);
        echo json_encode([
            "status" => "error",
            "message" => "ยังไม่ได้ migrate ข้อมูลหลักสูตรไปตาราง relational",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $mappingData = loadActiveMappingData($pdo);
    $existingClos = listClosBySubjectCode($pdo, $frameworkId, (string)$subject_code);
    $existingById = [];
    $nextId = 0;
    foreach (listAllClosDetailed($pdo, $frameworkId) as $clo) {
        $nextId = max($nextId, (int)$clo['id']);
    }
    foreach ($existingClos as $existingClo) {
        $id = (int)($existingClo['clo_id'] ?? 0);
        if ($id > 0) {
            $existingById[$id] = [
                'clo_code' => $existingClo['clo_code'] ?? null,
                'description' => $existingClo['description'] ?? '',
                'ylo_id' => $existingClo['ylo_id'] ?? null,
                'status' => $existingClo['status'] ?? 'active',
                'sub_plos' => $existingClo['sub_plos'] ?? [],
            ];
        }
    }

    $storedClos = [];
    foreach ($input['clos'] as $clo) {
        if (!is_array($clo)) {
            continue;
        }
        $storedClos[] = convertManagementCloToStorage($clo, $existingById, $mappingData, $nextId);
    }

    $pdo->beginTransaction();
    replaceSubjectClos($pdo, $frameworkId, (string)$subject_code, $storedClos);
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO สำเร็จ!"], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
