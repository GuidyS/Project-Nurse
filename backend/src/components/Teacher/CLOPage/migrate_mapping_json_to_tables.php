<?php
/**
 * One-shot ETL: curriculum_framework.mapping_json → relational tables.
 * Usage (inside backend container):
 *   php components/Teacher/CLOPage/migrate_mapping_json_to_tables.php
 * Or via HTTP (admin session optional — protect in production):
 *   ?page=migrate-mapping-json-to-tables
 */

if (PHP_SAPI !== 'cli') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

require_once __DIR__ . '/curriculum_repository.php';

$pdo = new PDO('mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4', 'MYSQL_USER', 'MYSQL_PASSWORD');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function clearFrameworkRelational(PDO $pdo, int $frameworkId): void
{
    // Child tables cascade from curriculum_clo / plo / subject_meta
    $pdo->prepare('DELETE FROM curriculum_clo WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
    $pdo->prepare('DELETE FROM curriculum_ylo_plo WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
    $pdo->prepare('DELETE FROM curriculum_subject_meta WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
    $pdo->prepare('DELETE FROM curriculum_sub_plo WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
    $pdo->prepare('DELETE FROM curriculum_plo WHERE framework_id = :fid')->execute([':fid' => $frameworkId]);
}

function migrateFramework(PDO $pdo, array $frameworkRow): array
{
    $frameworkId = (int)$frameworkRow['id'];
    $data = !empty($frameworkRow['mapping_json']) ? json_decode($frameworkRow['mapping_json'], true) : [];
    if (!is_array($data)) {
        throw new RuntimeException("framework {$frameworkId}: invalid mapping_json");
    }

    clearFrameworkRelational($pdo, $frameworkId);

    $ploIdMap = [];
    $sort = 0;
    $insPlo = $pdo->prepare(
        'INSERT INTO curriculum_plo (framework_id, plo_code, name, sort_order)
         VALUES (:fid, :code, :name, :sort)'
    );
    foreach ($data['plos'] ?? [] as $plo) {
        $code = (string)($plo['plo_id'] ?? $plo['id'] ?? '');
        if ($code === '') {
            continue;
        }
        $sort++;
        $insPlo->execute([
            ':fid' => $frameworkId,
            ':code' => $code,
            ':name' => (string)($plo['plo_name'] ?? $plo['name'] ?? $code),
            ':sort' => $sort,
        ]);
        $ploIdMap[$code] = (int)$pdo->lastInsertId();
    }

    $subPloIdMap = [];
    $insSub = $pdo->prepare(
        'INSERT INTO curriculum_sub_plo (framework_id, plo_id, code, description, sort_order)
         VALUES (:fid, :plo, :code, :desc, :sort)'
    );

    // Prefer top-level catalog; else nest under plos[].sub_plos
    $catalog = [];
    if (!empty($data['sub_plo_catalog']) && is_array($data['sub_plo_catalog'])) {
        foreach ($data['sub_plo_catalog'] as $sub) {
            if (empty($sub['code']) || empty($sub['plo'])) {
                continue;
            }
            $catalog[] = [
                'code' => (string)$sub['code'],
                'plo' => (string)$sub['plo'],
                'description' => (string)($sub['description'] ?? ''),
            ];
        }
    } else {
        foreach ($data['plos'] ?? [] as $plo) {
            $ploCode = (string)($plo['plo_id'] ?? $plo['id'] ?? '');
            foreach ($plo['sub_plos'] ?? [] as $sub) {
                $code = (string)($sub['id'] ?? $sub['code'] ?? '');
                if ($code === '' || $ploCode === '') {
                    continue;
                }
                $catalog[] = [
                    'code' => $code,
                    'plo' => $ploCode,
                    'description' => (string)($sub['desc'] ?? $sub['description'] ?? ''),
                ];
            }
        }
    }

    $subSort = 0;
    foreach ($catalog as $sub) {
        if (!isset($ploIdMap[$sub['plo']])) {
            continue;
        }
        $subSort++;
        $insSub->execute([
            ':fid' => $frameworkId,
            ':plo' => $ploIdMap[$sub['plo']],
            ':code' => $sub['code'],
            ':desc' => $sub['description'],
            ':sort' => $subSort,
        ]);
        $subPloIdMap[$sub['code']] = (int)$pdo->lastInsertId();
    }

    $insYlo = $pdo->prepare(
        'INSERT INTO curriculum_ylo_plo (framework_id, ylo_code, plo_id, is_active, description)
         VALUES (:fid, :ylo, :plo, :active, :desc)'
    );
    foreach ($data['ylo_plo_matrix'] ?? [] as $yloCode => $plos) {
        if (!is_array($plos)) {
            continue;
        }
        foreach ($plos as $ploCode => $info) {
            $ploCode = (string)$ploCode;
            if (!isset($ploIdMap[$ploCode]) || !is_array($info)) {
                continue;
            }
            $insYlo->execute([
                ':fid' => $frameworkId,
                ':ylo' => (string)$yloCode,
                ':plo' => $ploIdMap[$ploCode],
                ':active' => !empty($info['active']) ? 1 : 0,
                ':desc' => (string)($info['description'] ?? ''),
            ]);
        }
    }

    $insMeta = $pdo->prepare(
        'INSERT INTO curriculum_subject_meta (framework_id, subject_code, instructor_id)
         VALUES (:fid, :code, :iid)'
    );
    $insCoursePlo = $pdo->prepare(
        'INSERT INTO curriculum_subject_plo (subject_meta_id, plo_id) VALUES (:mid, :pid)'
    );
    $insClo = $pdo->prepare(
        'INSERT INTO curriculum_clo
         (id, framework_id, subject_code, clo_code, description, ylo_code, weight, status, sort_order)
         VALUES (:id, :fid, :scode, :ccode, :desc, :ylo, :weight, :status, :sort)'
    );
    $insCloPlo = $pdo->prepare(
        'INSERT INTO curriculum_clo_plo (clo_id, plo_id, weight) VALUES (:clo, :plo, :w)'
    );
    $insCloSub = $pdo->prepare(
        'INSERT INTO curriculum_clo_sub_plo (clo_id, sub_plo_id) VALUES (:clo, :sub)'
    );

    $maxCloId = 0;
    $cloCount = 0;
    foreach ($data['subject_mappings'] ?? [] as $subjectCode => $subjectData) {
        if (!is_string($subjectCode) || $subjectCode === '' || !is_array($subjectData)) {
            continue;
        }
        $insMeta->execute([
            ':fid' => $frameworkId,
            ':code' => $subjectCode,
            ':iid' => $subjectData['instructor_id'] ?? null,
        ]);
        $metaId = (int)$pdo->lastInsertId();

        foreach ($subjectData['course_plos'] ?? [] as $ploCode) {
            $ploCode = (string)$ploCode;
            if (!isset($ploIdMap[$ploCode])) {
                continue;
            }
            $insCoursePlo->execute([':mid' => $metaId, ':pid' => $ploIdMap[$ploCode]]);
        }

        $sortOrder = 0;
        foreach ($subjectData['clos'] ?? [] as $clo) {
            if (!is_array($clo)) {
                continue;
            }
            $sortOrder++;
            $cloId = (int)($clo['clo_id'] ?? $clo['id'] ?? 0);
            if ($cloId <= 0) {
                $cloId = $maxCloId + 1;
            }
            $maxCloId = max($maxCloId, $cloId);

            $insClo->execute([
                ':id' => $cloId,
                ':fid' => $frameworkId,
                ':scode' => $subjectCode,
                ':ccode' => $clo['clo_code'] ?? ($clo['code'] ?? null),
                ':desc' => $clo['description'] ?? '',
                ':ylo' => $clo['ylo_id'] ?? ($clo['ylo_code'] ?? null),
                ':weight' => $clo['weight'] ?? null,
                ':status' => $clo['status'] ?? 'active',
                ':sort' => $sortOrder,
            ]);
            $cloCount++;

            $weights = is_array($clo['plo_weights'] ?? null) ? $clo['plo_weights'] : [];
            foreach ($clo['mapped_plos'] ?? [] as $ploCode) {
                $ploCode = (string)$ploCode;
                if (!isset($ploIdMap[$ploCode])) {
                    continue;
                }
                $insCloPlo->execute([
                    ':clo' => $cloId,
                    ':plo' => $ploIdMap[$ploCode],
                    ':w' => (int)($weights[$ploCode] ?? 0),
                ]);
            }
            // Also link PLOs only present in weights
            foreach ($weights as $ploCode => $w) {
                $ploCode = (string)$ploCode;
                if (!isset($ploIdMap[$ploCode])) {
                    continue;
                }
                try {
                    $insCloPlo->execute([
                        ':clo' => $cloId,
                        ':plo' => $ploIdMap[$ploCode],
                        ':w' => (int)$w,
                    ]);
                } catch (PDOException $e) {
                    // duplicate PK — already inserted from mapped_plos
                }
            }

            foreach ($clo['sub_plos'] ?? [] as $subCode) {
                $subCode = (string)$subCode;
                if (!isset($subPloIdMap[$subCode])) {
                    continue;
                }
                $insCloSub->execute([':clo' => $cloId, ':sub' => $subPloIdMap[$subCode]]);
            }
        }
    }

    // Note: ALTER causes implicit commit in MySQL — call outside any transaction.
    return [
        'framework_id' => $frameworkId,
        'plos' => count($ploIdMap),
        'sub_plos' => count($subPloIdMap),
        'clos' => $cloCount,
        'subjects' => count($data['subject_mappings'] ?? []),
        'max_clo_id' => $maxCloId,
    ];
}

try {
    if (!curriculumTablesReady($pdo)) {
        throw new RuntimeException(
            'Relational tables missing. Run curriculum_relational_schema.sql first.'
        );
    }

    $frameworks = $pdo->query(
        'SELECT id, mapping_json FROM curriculum_framework ORDER BY is_active DESC, id ASC'
    )->fetchAll(PDO::FETCH_ASSOC);

    if (!$frameworks) {
        throw new RuntimeException('No curriculum_framework rows found');
    }

    $results = [];
    $globalMaxClo = 0;
    foreach ($frameworks as $fw) {
        if (empty($fw['mapping_json'])) {
            continue;
        }
        // Per-framework DML only (no outer transaction — DELETE/INSERT are idempotent via clear)
        $result = migrateFramework($pdo, $fw);
        $globalMaxClo = max($globalMaxClo, (int)($result['max_clo_id'] ?? 0));
        unset($result['max_clo_id']);
        $results[] = $result;
    }

    if ($globalMaxClo > 0) {
        $pdo->exec('ALTER TABLE curriculum_clo AUTO_INCREMENT = ' . ($globalMaxClo + 1));
    }

    $payload = [
        'status' => 'success',
        'message' => 'Migrated mapping_json to relational tables',
        'results' => $results,
    ];
    if (PHP_SAPI === 'cli') {
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
    } else {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, $e->getMessage() . PHP_EOL);
        exit(1);
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
