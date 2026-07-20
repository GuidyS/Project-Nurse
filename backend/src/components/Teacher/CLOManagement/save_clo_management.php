<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/clo_mapping_helpers.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents('php://input'), true);

function findMaxCloId(array $mappingData): int
{
    $maxId = 0;
    foreach (($mappingData['subject_mappings'] ?? []) as $subjectData) {
        foreach (($subjectData['clos'] ?? []) as $clo) {
            $maxId = max($maxId, (int)($clo['clo_id'] ?? $clo['id'] ?? 0));
        }
    }
    foreach (($mappingData['course_clos'] ?? []) as $legacyClos) {
        foreach ($legacyClos as $clo) {
            $maxId = max($maxId, (int)($clo['clo_id'] ?? $clo['id'] ?? 0));
        }
    }
    return $maxId;
}

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
    $newClos = $input['clos'];

    $stmt = $pdo->query("SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตร"]);
        exit();
    }

    $data = !empty($row['mapping_json']) ? json_decode($row['mapping_json'], true) : [];
    if (!is_array($data)) {
        $data = [];
    }
    if (!isset($data['subject_mappings'])) {
        $data['subject_mappings'] = [];
    }
    if (!isset($data['subject_mappings'][$subject_code])) {
        $data['subject_mappings'][$subject_code] = [];
    }

    $existingClos = $data['subject_mappings'][$subject_code]['clos'] ?? [];
    if (empty($existingClos) && !empty($data['course_clos'][$subject_code])) {
        $existingClos = $data['course_clos'][$subject_code];
    }

    $existingById = [];
    foreach ($existingClos as $existingClo) {
        $id = (int)($existingClo['clo_id'] ?? $existingClo['id'] ?? 0);
        if ($id > 0) {
            $existingById[$id] = $existingClo;
        }
    }

    $nextId = findMaxCloId($data);
    $storedClos = [];
    foreach ($newClos as $clo) {
        if (!is_array($clo)) {
            continue;
        }
        $storedClos[] = convertManagementCloToStorage($clo, $existingById, $data, $nextId);
    }

    $data['subject_mappings'][$subject_code]['clos'] = $storedClos;

    if (isset($data['course_clos'][$subject_code])) {
        unset($data['course_clos'][$subject_code]);
        if (empty($data['course_clos'])) {
            unset($data['course_clos']);
        }
    }

    $updateStmt = $pdo->prepare('UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id');
    $updateStmt->execute([
        ':json' => json_encode($data, JSON_UNESCAPED_UNICODE),
        ':id' => $row['id'],
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO สำเร็จ!"], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
