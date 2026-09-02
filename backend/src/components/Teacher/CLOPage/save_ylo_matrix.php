<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

// YLO / Sub PLO เป็นข้อมูลระดับหลักสูตร — เฉพาะ admin เท่านั้น
cloAccessRequireAdmin($pdo, $_SESSION['user_id']);

try {
    if (empty($input['ylo_plo_matrix']) || !is_array($input['ylo_plo_matrix'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูล YLO ไม่ถูกต้อง"]);
        exit();
    }

    $matrix = [];
    foreach ($input['ylo_plo_matrix'] as $yloId => $plos) {
        if (!preg_match('/^YLO[1-4]$/', (string)$yloId) || !is_array($plos)) {
            continue;
        }
        $matrix[$yloId] = [];
        foreach ($plos as $ploId => $info) {
            if (!is_string($ploId) || $ploId === '' || !is_array($info)) {
                continue;
            }
            $matrix[$yloId][$ploId] = [
                'active' => !empty($info['active']),
                'description' => (string)($info['description'] ?? ''),
            ];
        }
    }

    if (empty($matrix)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูล YLO ไม่ถูกต้อง"]);
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
    saveYloMatrixToTables($pdo, $frameworkId, $matrix);

    // Optional: seed/update sub_plo_catalog rows if client sends them
    if (isset($input['sub_plo_catalog']) && is_array($input['sub_plo_catalog'])) {
        $ploIdMap = getPloIdMap($pdo, $frameworkId);
        foreach ($input['sub_plo_catalog'] as $sub) {
            if (empty($sub['code']) || empty($sub['plo']) || !isset($ploIdMap[(string)$sub['plo']])) {
                continue;
            }
            $code = (string)$sub['code'];
            $desc = (string)($sub['description'] ?? '');
            $check = $pdo->prepare(
                'SELECT id FROM curriculum_sub_plo WHERE framework_id = :fid AND code = :code LIMIT 1'
            );
            $check->execute([':fid' => $frameworkId, ':code' => $code]);
            $existingId = $check->fetchColumn();
            if ($existingId) {
                $upd = $pdo->prepare(
                    'UPDATE curriculum_sub_plo SET plo_id = :plo, description = :desc WHERE id = :id'
                );
                $upd->execute([
                    ':plo' => $ploIdMap[(string)$sub['plo']],
                    ':desc' => $desc,
                    ':id' => $existingId,
                ]);
            } else {
                $ins = $pdo->prepare(
                    'INSERT INTO curriculum_sub_plo (framework_id, plo_id, code, description, sort_order)
                     VALUES (:fid, :plo, :code, :desc, 0)'
                );
                $ins->execute([
                    ':fid' => $frameworkId,
                    ':plo' => $ploIdMap[(string)$sub['plo']],
                    ':code' => $code,
                    ':desc' => $desc,
                ]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล YLO สำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
