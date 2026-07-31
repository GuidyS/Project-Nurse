<?php

/**
 * Relational curriculum access (Phase 2).
 * Tables are source of truth; mapping_json is backup/import only.
 */

function curriculumTablesReady(PDO $pdo): bool
{
    try {
        $pdo->query('SELECT 1 FROM curriculum_plo LIMIT 1');
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function getActiveFrameworkId(PDO $pdo): ?int
{
    $id = $pdo->query('SELECT id FROM curriculum_framework WHERE is_active = 1 LIMIT 1')->fetchColumn();
    return $id !== false ? (int)$id : null;
}

function getActiveFrameworkRow(PDO $pdo): ?array
{
    $row = $pdo->query('SELECT id, mapping_json, curriculum_year, program_name FROM curriculum_framework WHERE is_active = 1 LIMIT 1')
        ->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function curriculumHasRelationalData(PDO $pdo, int $frameworkId): bool
{
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM curriculum_plo WHERE framework_id = :fid');
    $stmt->execute([':fid' => $frameworkId]);
    return (int)$stmt->fetchColumn() > 0;
}

/** Build helper-compatible mapping array from relational tables. */
function buildMappingDataFromTables(PDO $pdo, int $frameworkId): array
{
    $plos = [];
    $ploIdByCode = [];
    $stmt = $pdo->prepare(
        'SELECT id, plo_code, name, sort_order FROM curriculum_plo
         WHERE framework_id = :fid ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $ploRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $subStmt = $pdo->prepare(
        'SELECT code, description, plo_id FROM curriculum_sub_plo
         WHERE framework_id = :fid ORDER BY sort_order ASC, id ASC'
    );
    $subStmt->execute([':fid' => $frameworkId]);
    $subsByPloId = [];
    foreach ($subStmt->fetchAll(PDO::FETCH_ASSOC) as $sub) {
        $subsByPloId[(int)$sub['plo_id']][] = $sub;
    }

    $catalog = [];
    foreach ($ploRows as $plo) {
        $ploId = (int)$plo['id'];
        $code = (string)$plo['plo_code'];
        $ploIdByCode[$code] = $ploId;
        $nestedSubs = [];
        foreach ($subsByPloId[$ploId] ?? [] as $sub) {
            $nestedSubs[] = [
                'id' => (string)$sub['code'],
                'desc' => (string)($sub['description'] ?? ''),
            ];
            $catalog[] = [
                'code' => (string)$sub['code'],
                'plo' => $code,
                'description' => (string)($sub['description'] ?? ''),
            ];
        }
        $plos[] = [
            'plo_id' => $code,
            'plo_name' => (string)($plo['name'] ?? $code),
            'sub_plos' => $nestedSubs,
            'ylo_descriptions' => [],
        ];
    }

    $matrix = [];
    $yloStmt = $pdo->prepare(
        'SELECT y.ylo_code, p.plo_code, y.is_active, y.description
         FROM curriculum_ylo_plo y
         INNER JOIN curriculum_plo p ON p.id = y.plo_id
         WHERE y.framework_id = :fid'
    );
    $yloStmt->execute([':fid' => $frameworkId]);
    foreach ($yloStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $ylo = (string)$row['ylo_code'];
        $ploCode = (string)$row['plo_code'];
        if (!isset($matrix[$ylo])) {
            $matrix[$ylo] = [];
        }
        $matrix[$ylo][$ploCode] = [
            'active' => !empty($row['is_active']),
            'description' => (string)($row['description'] ?? ''),
        ];
    }

    $subjectMappings = [];
    $metaStmt = $pdo->prepare(
        'SELECT id, subject_code, instructor_id FROM curriculum_subject_meta WHERE framework_id = :fid'
    );
    $metaStmt->execute([':fid' => $frameworkId]);
    $metas = $metaStmt->fetchAll(PDO::FETCH_ASSOC);
    $metaByCode = [];
    foreach ($metas as $meta) {
        $metaByCode[(string)$meta['subject_code']] = $meta;
        $subjectMappings[(string)$meta['subject_code']] = [
            'instructor_id' => $meta['instructor_id'] ?? null,
            'course_plos' => [],
            'clos' => [],
        ];
    }

    if (!empty($metas)) {
        $spStmt = $pdo->prepare(
            'SELECT sp.subject_meta_id, p.plo_code
             FROM curriculum_subject_plo sp
             INNER JOIN curriculum_plo p ON p.id = sp.plo_id
             INNER JOIN curriculum_subject_meta m ON m.id = sp.subject_meta_id
             WHERE m.framework_id = :fid'
        );
        $spStmt->execute([':fid' => $frameworkId]);
        foreach ($spStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            foreach ($metaByCode as $code => $meta) {
                if ((int)$meta['id'] === (int)$row['subject_meta_id']) {
                    $subjectMappings[$code]['course_plos'][] = (string)$row['plo_code'];
                    break;
                }
            }
        }
    }

    $clos = listAllClosDetailed($pdo, $frameworkId);
    foreach ($clos as $clo) {
        $code = (string)$clo['subject_code'];
        if (!isset($subjectMappings[$code])) {
            $subjectMappings[$code] = [
                'instructor_id' => null,
                'course_plos' => [],
                'clos' => [],
            ];
        }
        $subjectMappings[$code]['clos'][] = cloRowToApiArray($clo);
    }

    return [
        'plos' => $plos,
        'sub_plo_catalog' => $catalog,
        'ylo_plo_matrix' => $matrix,
        'subject_mappings' => $subjectMappings,
    ];
}

function getPloCatalogFromTables(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT plo_code, name FROM curriculum_plo
         WHERE framework_id = :fid ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $out[] = [
            'id' => (string)$row['plo_code'],
            'name' => (string)($row['name'] ?? $row['plo_code']),
            'ylo_descriptions' => [],
        ];
    }
    return $out;
}

// subPloCodeOrder() / sortSubPloCodes() นิยามไว้ที่ clo_mapping_helpers.php (ใช้ร่วมกันทั้ง 2 เส้นทาง)
require_once __DIR__ . '/clo_mapping_helpers.php';

function sortPloCodes(array $codes): array
{
    $codes = array_values(array_unique(array_map('strval', $codes)));
    usort($codes, function ($a, $b) {
        return ((int)preg_replace('/\D/', '', $a)) <=> ((int)preg_replace('/\D/', '', $b));
    });
    return $codes;
}

function getSubPloCatalogFromTables(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT s.code, s.description, p.plo_code
         FROM curriculum_sub_plo s
         INNER JOIN curriculum_plo p ON p.id = s.plo_id
         WHERE s.framework_id = :fid
         ORDER BY s.sort_order ASC, s.id ASC'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $out[] = [
            'code' => (string)$row['code'],
            'plo' => (string)$row['plo_code'],
            'description' => (string)($row['description'] ?? ''),
        ];
    }

    // เรียงตาม PLO แม่ แล้วตามเลข Sub PLO
    usort($out, function ($a, $b) {
        $ploDiff = ((int)preg_replace('/\D/', '', $a['plo'])) <=> ((int)preg_replace('/\D/', '', $b['plo']));
        return $ploDiff !== 0 ? $ploDiff : (subPloCodeOrder($a['code']) <=> subPloCodeOrder($b['code']));
    });

    return $out;
}

function getYloMatrixFromTables(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT y.ylo_code, p.plo_code, y.is_active, y.description
         FROM curriculum_ylo_plo y
         INNER JOIN curriculum_plo p ON p.id = y.plo_id
         WHERE y.framework_id = :fid'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $matrix = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $ylo = (string)$row['ylo_code'];
        if (!isset($matrix[$ylo])) {
            $matrix[$ylo] = [];
        }
        $matrix[$ylo][(string)$row['plo_code']] = [
            'active' => !empty($row['is_active']),
            'description' => (string)($row['description'] ?? ''),
        ];
    }
    return $matrix;
}

function listPloCodes(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT plo_code FROM curriculum_plo WHERE framework_id = :fid ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute([':fid' => $frameworkId]);
    return array_map('strval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

function getPloIdMap(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare('SELECT id, plo_code FROM curriculum_plo WHERE framework_id = :fid');
    $stmt->execute([':fid' => $frameworkId]);
    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $map[(string)$row['plo_code']] = (int)$row['id'];
    }
    return $map;
}

function getSubPloIdMap(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare('SELECT id, code FROM curriculum_sub_plo WHERE framework_id = :fid');
    $stmt->execute([':fid' => $frameworkId]);
    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $map[(string)$row['code']] = (int)$row['id'];
    }
    return $map;
}

function listAllClosDetailed(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT id, subject_code, clo_code, description, ylo_code, weight, status, sort_order
         FROM curriculum_clo
         WHERE framework_id = :fid
         ORDER BY subject_code ASC, sort_order ASC, id ASC'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $clos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$clos) {
        return [];
    }

    $ids = array_column($clos, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $ploStmt = $pdo->prepare(
        "SELECT cp.clo_id, p.plo_code, cp.weight
         FROM curriculum_clo_plo cp
         INNER JOIN curriculum_plo p ON p.id = cp.plo_id
         WHERE cp.clo_id IN ($placeholders)"
    );
    $ploStmt->execute($ids);
    $plosByClo = [];
    $weightsByClo = [];
    foreach ($ploStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $cid = (int)$row['clo_id'];
        $plosByClo[$cid][] = (string)$row['plo_code'];
        $weightsByClo[$cid][(string)$row['plo_code']] = (int)$row['weight'];
    }

    $subStmt = $pdo->prepare(
        "SELECT cs.clo_id, s.code
         FROM curriculum_clo_sub_plo cs
         INNER JOIN curriculum_sub_plo s ON s.id = cs.sub_plo_id
         WHERE cs.clo_id IN ($placeholders)"
    );
    $subStmt->execute($ids);
    $subsByClo = [];
    foreach ($subStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $subsByClo[(int)$row['clo_id']][] = (string)$row['code'];
    }

    foreach ($clos as &$clo) {
        $cid = (int)$clo['id'];
        // เรียงเลขให้เรียบร้อยก่อนส่งออก (ไม่ให้รายการใหม่ไปต่อท้ายแบบไม่เรียง)
        $clo['mapped_plos'] = sortPloCodes($plosByClo[$cid] ?? []);
        $clo['plo_weights'] = $weightsByClo[$cid] ?? [];
        $clo['sub_plos'] = sortSubPloCodes($subsByClo[$cid] ?? []);
    }
    unset($clo);

    return $clos;
}

function listClosBySubjectCode(PDO $pdo, int $frameworkId, string $subjectCode): array
{
    $all = listAllClosDetailed($pdo, $frameworkId);
    $out = [];
    foreach ($all as $clo) {
        if ((string)$clo['subject_code'] === $subjectCode) {
            $out[] = cloRowToApiArray($clo);
        }
    }
    return $out;
}

function cloRowToApiArray(array $clo): array
{
    $weights = $clo['plo_weights'] ?? [];
    return [
        'clo_id' => (int)$clo['id'],
        'id' => (string)$clo['id'],
        'clo_code' => $clo['clo_code'] ?? null,
        'code' => $clo['clo_code'] ?? null,
        'description' => (string)($clo['description'] ?? ''),
        'ylo_id' => $clo['ylo_code'] ?? null,
        'mapped_plos' => array_values($clo['mapped_plos'] ?? []),
        'sub_plos' => array_values($clo['sub_plos'] ?? []),
        'plo_weights' => $weights,
        'weight' => $clo['weight'] !== null ? (float)$clo['weight'] : array_sum($weights),
        'status' => (string)($clo['status'] ?? 'active'),
    ];
}

function ensureSubjectMeta(PDO $pdo, int $frameworkId, string $subjectCode, ?string $instructorId = null): int
{
    $stmt = $pdo->prepare(
        'SELECT id, instructor_id FROM curriculum_subject_meta
         WHERE framework_id = :fid AND subject_code = :code LIMIT 1'
    );
    $stmt->execute([':fid' => $frameworkId, ':code' => $subjectCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        if ($instructorId !== null) {
            $upd = $pdo->prepare('UPDATE curriculum_subject_meta SET instructor_id = :iid WHERE id = :id');
            $upd->execute([':iid' => $instructorId === '' ? null : $instructorId, ':id' => $row['id']]);
        }
        return (int)$row['id'];
    }

    $ins = $pdo->prepare(
        'INSERT INTO curriculum_subject_meta (framework_id, subject_code, instructor_id)
         VALUES (:fid, :code, :iid)'
    );
    $ins->execute([
        ':fid' => $frameworkId,
        ':code' => $subjectCode,
        ':iid' => ($instructorId === null || $instructorId === '') ? null : $instructorId,
    ]);
    return (int)$pdo->lastInsertId();
}

function replaceCloLinks(PDO $pdo, int $cloId, array $mappedPlos, array $subPlos, array $ploIdMap, array $subPloIdMap, array $ploWeights = []): void
{
    $pdo->prepare('DELETE FROM curriculum_clo_plo WHERE clo_id = :id')->execute([':id' => $cloId]);
    $pdo->prepare('DELETE FROM curriculum_clo_sub_plo WHERE clo_id = :id')->execute([':id' => $cloId]);

    $insPlo = $pdo->prepare(
        'INSERT INTO curriculum_clo_plo (clo_id, plo_id, weight) VALUES (:clo, :plo, :w)'
    );
    foreach ($mappedPlos as $ploCode) {
        $ploCode = (string)$ploCode;
        if (!isset($ploIdMap[$ploCode])) {
            continue;
        }
        $insPlo->execute([
            ':clo' => $cloId,
            ':plo' => $ploIdMap[$ploCode],
            ':w' => (int)($ploWeights[$ploCode] ?? 0),
        ]);
    }

    $insSub = $pdo->prepare(
        'INSERT INTO curriculum_clo_sub_plo (clo_id, sub_plo_id) VALUES (:clo, :sub)'
    );
    foreach ($subPlos as $code) {
        $code = (string)$code;
        if (!isset($subPloIdMap[$code])) {
            continue;
        }
        $insSub->execute([':clo' => $cloId, ':sub' => $subPloIdMap[$code]]);
    }
}

function addCurriculumClo(
    PDO $pdo,
    int $frameworkId,
    string $subjectCode,
    array $payload,
    array $mappedPlos,
    array $subPlos
): int {
    ensureSubjectMeta($pdo, $frameworkId, $subjectCode);
    $sortStmt = $pdo->prepare(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 FROM curriculum_clo
         WHERE framework_id = :fid AND subject_code = :code'
    );
    $sortStmt->execute([':fid' => $frameworkId, ':code' => $subjectCode]);
    $sortOrder = (int)$sortStmt->fetchColumn();

    $ins = $pdo->prepare(
        'INSERT INTO curriculum_clo
         (framework_id, subject_code, clo_code, description, ylo_code, weight, status, sort_order)
         VALUES (:fid, :scode, :ccode, :desc, :ylo, :weight, :status, :sort)'
    );
    $ins->execute([
        ':fid' => $frameworkId,
        ':scode' => $subjectCode,
        ':ccode' => $payload['clo_code'] ?? null,
        ':desc' => $payload['description'] ?? '',
        ':ylo' => $payload['ylo_id'] ?? null,
        ':weight' => $payload['weight'] ?? null,
        ':status' => $payload['status'] ?? 'active',
        ':sort' => $sortOrder,
    ]);
    $cloId = (int)$pdo->lastInsertId();
    replaceCloLinks(
        $pdo,
        $cloId,
        $mappedPlos,
        $subPlos,
        getPloIdMap($pdo, $frameworkId),
        getSubPloIdMap($pdo, $frameworkId),
        $payload['plo_weights'] ?? []
    );
    return $cloId;
}

function updateCurriculumClo(
    PDO $pdo,
    int $frameworkId,
    int $cloId,
    array $payload,
    array $mappedPlos,
    array $subPlos,
    ?string $subjectCode = null
): bool {
    $sql = 'SELECT id, subject_code FROM curriculum_clo WHERE id = :id AND framework_id = :fid';
    $params = [':id' => $cloId, ':fid' => $frameworkId];
    if ($subjectCode !== null && $subjectCode !== '') {
        $sql .= ' AND subject_code = :scode';
        $params[':scode'] = $subjectCode;
    }
    $stmt = $pdo->prepare($sql . ' LIMIT 1');
    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        return false;
    }

    $upd = $pdo->prepare(
        'UPDATE curriculum_clo
         SET clo_code = :ccode, description = :desc, ylo_code = :ylo, weight = :weight, status = :status
         WHERE id = :id'
    );
    $upd->execute([
        ':ccode' => $payload['clo_code'] ?? null,
        ':desc' => $payload['description'] ?? '',
        ':ylo' => $payload['ylo_id'] ?? null,
        ':weight' => $payload['weight'] ?? null,
        ':status' => $payload['status'] ?? 'active',
        ':id' => $cloId,
    ]);

    replaceCloLinks(
        $pdo,
        $cloId,
        $mappedPlos,
        $subPlos,
        getPloIdMap($pdo, $frameworkId),
        getSubPloIdMap($pdo, $frameworkId),
        $payload['plo_weights'] ?? []
    );
    return true;
}

function deleteCurriculumClo(PDO $pdo, int $frameworkId, int $cloId, ?string $subjectCode = null): bool
{
    $sql = 'DELETE FROM curriculum_clo WHERE id = :id AND framework_id = :fid';
    $params = [':id' => $cloId, ':fid' => $frameworkId];
    if ($subjectCode !== null && $subjectCode !== '') {
        $sql .= ' AND subject_code = :scode';
        $params[':scode'] = $subjectCode;
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount() > 0;
}

function saveYloMatrixToTables(PDO $pdo, int $frameworkId, array $matrix): void
{
    $ploIdMap = getPloIdMap($pdo, $frameworkId);
    $pdo->prepare('DELETE FROM curriculum_ylo_plo WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
    $ins = $pdo->prepare(
        'INSERT INTO curriculum_ylo_plo (framework_id, ylo_code, plo_id, is_active, description)
         VALUES (:fid, :ylo, :plo, :active, :desc)'
    );
    foreach ($matrix as $yloCode => $plos) {
        if (!preg_match('/^YLO[1-4]$/', (string)$yloCode) || !is_array($plos)) {
            continue;
        }
        foreach ($plos as $ploCode => $info) {
            $ploCode = (string)$ploCode;
            if (!isset($ploIdMap[$ploCode]) || !is_array($info)) {
                continue;
            }
            $ins->execute([
                ':fid' => $frameworkId,
                ':ylo' => $yloCode,
                ':plo' => $ploIdMap[$ploCode],
                ':active' => !empty($info['active']) ? 1 : 0,
                ':desc' => (string)($info['description'] ?? ''),
            ]);
        }
    }
}

function saveSubjectCoursePlos(PDO $pdo, int $frameworkId, string $subjectCode, array $ploCodes): void
{
    $metaId = ensureSubjectMeta($pdo, $frameworkId, $subjectCode);
    $ploIdMap = getPloIdMap($pdo, $frameworkId);
    $pdo->prepare('DELETE FROM curriculum_subject_plo WHERE subject_meta_id = :id')->execute([':id' => $metaId]);
    $ins = $pdo->prepare(
        'INSERT INTO curriculum_subject_plo (subject_meta_id, plo_id) VALUES (:mid, :pid)'
    );
    foreach (array_unique(array_filter($ploCodes, 'is_string')) as $code) {
        if (!isset($ploIdMap[$code])) {
            continue;
        }
        $ins->execute([':mid' => $metaId, ':pid' => $ploIdMap[$code]]);
    }

    // Trim CLO mapped PLOs to allowed course PLOs
    $allowed = array_flip($ploCodes);
    $clos = listClosBySubjectCode($pdo, $frameworkId, $subjectCode);
    foreach ($clos as $clo) {
        $mapped = array_values(array_filter(
            $clo['mapped_plos'] ?? [],
            fn($p) => isset($allowed[$p])
        ));
        $weights = [];
        foreach ($clo['plo_weights'] ?? [] as $p => $w) {
            if (isset($allowed[$p])) {
                $weights[$p] = $w;
            }
        }
        replaceCloLinks(
            $pdo,
            (int)$clo['clo_id'],
            $mapped,
            $clo['sub_plos'] ?? [],
            $ploIdMap,
            getSubPloIdMap($pdo, $frameworkId),
            $weights
        );
    }
}

function replaceSubjectClos(PDO $pdo, int $frameworkId, string $subjectCode, array $clos): void
{
    ensureSubjectMeta($pdo, $frameworkId, $subjectCode);
    $pdo->prepare(
        'DELETE FROM curriculum_clo WHERE framework_id = :fid AND subject_code = :code'
    )->execute([':fid' => $frameworkId, ':code' => $subjectCode]);

    $ploIdMap = getPloIdMap($pdo, $frameworkId);
    $subPloIdMap = getSubPloIdMap($pdo, $frameworkId);
    $sort = 0;
    foreach ($clos as $clo) {
        if (!is_array($clo)) {
            continue;
        }
        $sort++;
        $explicitId = (int)($clo['clo_id'] ?? $clo['id'] ?? 0);
        if ($explicitId > 0) {
            $ins = $pdo->prepare(
                'INSERT INTO curriculum_clo
                 (id, framework_id, subject_code, clo_code, description, ylo_code, weight, status, sort_order)
                 VALUES (:id, :fid, :scode, :ccode, :desc, :ylo, :weight, :status, :sort)'
            );
            $ins->execute([
                ':id' => $explicitId,
                ':fid' => $frameworkId,
                ':scode' => $subjectCode,
                ':ccode' => $clo['clo_code'] ?? ($clo['code'] ?? null),
                ':desc' => $clo['description'] ?? '',
                ':ylo' => $clo['ylo_id'] ?? ($clo['ylo_code'] ?? null),
                ':weight' => $clo['weight'] ?? null,
                ':status' => $clo['status'] ?? 'active',
                ':sort' => $sort,
            ]);
            $cloId = $explicitId;
        } else {
            $cloId = addCurriculumClo(
                $pdo,
                $frameworkId,
                $subjectCode,
                [
                    'clo_code' => $clo['clo_code'] ?? ($clo['code'] ?? null),
                    'description' => $clo['description'] ?? '',
                    'ylo_id' => $clo['ylo_id'] ?? null,
                    'weight' => $clo['weight'] ?? null,
                    'status' => $clo['status'] ?? 'active',
                    'plo_weights' => $clo['plo_weights'] ?? [],
                ],
                $clo['mapped_plos'] ?? [],
                $clo['sub_plos'] ?? []
            );
            continue;
        }

        replaceCloLinks(
            $pdo,
            $cloId,
            $clo['mapped_plos'] ?? [],
            $clo['sub_plos'] ?? [],
            $ploIdMap,
            $subPloIdMap,
            $clo['plo_weights'] ?? []
        );
    }

    // Avoid ALTER inside caller transactions (MySQL implicit commit).
}

function setSubjectInstructor(PDO $pdo, int $frameworkId, string $subjectCode, ?string $facultyId): void
{
    ensureSubjectMeta($pdo, $frameworkId, $subjectCode, $facultyId === null ? '' : $facultyId);
}

function getSubjectInstructorMap(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT subject_code, instructor_id FROM curriculum_subject_meta WHERE framework_id = :fid'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $map[(string)$row['subject_code']] = $row['instructor_id'];
    }
    return $map;
}

function getCoursePloMap(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT m.subject_code, p.plo_code
         FROM curriculum_subject_meta m
         INNER JOIN curriculum_subject_plo sp ON sp.subject_meta_id = m.id
         INNER JOIN curriculum_plo p ON p.id = sp.plo_id
         WHERE m.framework_id = :fid'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $code = (string)$row['subject_code'];
        $map[$code][] = (string)$row['plo_code'];
    }
    return $map;
}

function countClosBySubject(PDO $pdo, int $frameworkId): array
{
    $stmt = $pdo->prepare(
        'SELECT subject_code, COUNT(*) AS cnt
         FROM curriculum_clo WHERE framework_id = :fid GROUP BY subject_code'
    );
    $stmt->execute([':fid' => $frameworkId]);
    $map = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $map[(string)$row['subject_code']] = (int)$row['cnt'];
    }
    return $map;
}

/** Subject codes assigned to a faculty instructor. */
function getInstructorSubjectCodes(PDO $pdo, int $frameworkId, string $facultyId): array
{
    $stmt = $pdo->prepare(
        'SELECT subject_code FROM curriculum_subject_meta
         WHERE framework_id = :fid AND instructor_id = :iid'
    );
    $stmt->execute([':fid' => $frameworkId, ':iid' => $facultyId]);
    return array_map('strval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

/**
 * Load mapping for helpers: prefer relational tables when populated.
 */
function loadActiveMappingData(PDO $pdo): array
{
    $row = getActiveFrameworkRow($pdo);
    if (!$row) {
        return [];
    }
    $fid = (int)$row['id'];
    if (curriculumTablesReady($pdo) && curriculumHasRelationalData($pdo, $fid)) {
        return buildMappingDataFromTables($pdo, $fid);
    }
    $data = !empty($row['mapping_json']) ? json_decode($row['mapping_json'], true) : [];
    return is_array($data) ? $data : [];
}
