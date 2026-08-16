<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
    // รับ catalog ทั้งชุด (หลักสูตรเปลี่ยนทุก 5 ปี — เพิ่ม/ลด/แก้ Sub PLO ได้)
    // แถวที่ไม่อยู่ในชุดที่ส่งมา = ถูกลบ (FK cascade จะลบ mapping CLO↔Sub ตาม)
    if (!isset($input['sub_plo_catalog']) || !is_array($input['sub_plo_catalog'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูล Sub PLO ไม่ถูกต้อง"]);
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

    $ploIdMap = getPloIdMap($pdo, $frameworkId);

    // validate + กันโค้ดซ้ำในชุดที่ส่งมา
    $incoming = [];
    foreach ($input['sub_plo_catalog'] as $sub) {
        $code = trim((string)($sub['code'] ?? ''));
        $plo = (string)($sub['plo'] ?? '');
        if ($code === '' || !isset($ploIdMap[$plo])) {
            continue;
        }
        if (isset($incoming[$code])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "รหัส Sub PLO ซ้ำกัน: " . $code], JSON_UNESCAPED_UNICODE);
            exit();
        }
        $incoming[$code] = [
            'plo_id' => $ploIdMap[$plo],
            'description' => (string)($sub['description'] ?? ''),
        ];
    }

    if (empty($incoming)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ต้องมี Sub PLO อย่างน้อย 1 รายการ"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $pdo->beginTransaction();

    $existing = [];
    $stmt = $pdo->prepare('SELECT id, code FROM curriculum_sub_plo WHERE framework_id = :fid');
    $stmt->execute([':fid' => $frameworkId]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $existing[$row['code']] = (int)$row['id'];
    }

    $inserted = 0;
    $updated = 0;
    $deleted = 0;

    // เรียงตามเลขรหัสก่อนกำหนด sort_order เพื่อให้รายการใหม่แทรกตามลำดับ ไม่ไปต่อท้าย
    uksort($incoming, function ($a, $b) {
        return subPloCodeOrder((string)$a) <=> subPloCodeOrder((string)$b);
    });

    $sort = 0;
    foreach ($incoming as $code => $data) {
        $sort++;
        if (isset($existing[$code])) {
            $upd = $pdo->prepare(
                'UPDATE curriculum_sub_plo SET plo_id = :plo, description = :desc, sort_order = :sort WHERE id = :id'
            );
            $upd->execute([
                ':plo' => $data['plo_id'],
                ':desc' => $data['description'],
                ':sort' => $sort,
                ':id' => $existing[$code],
            ]);
            $updated++;
        } else {
            $ins = $pdo->prepare(
                'INSERT INTO curriculum_sub_plo (framework_id, plo_id, code, description, sort_order)
                 VALUES (:fid, :plo, :code, :desc, :sort)'
            );
            $ins->execute([
                ':fid' => $frameworkId,
                ':plo' => $data['plo_id'],
                ':code' => $code,
                ':desc' => $data['description'],
                ':sort' => $sort,
            ]);
            $inserted++;
        }
    }

    foreach ($existing as $code => $id) {
        if (!isset($incoming[$code])) {
            $del = $pdo->prepare('DELETE FROM curriculum_sub_plo WHERE id = :id');
            $del->execute([':id' => $id]);
            $deleted++;
        }
    }

    $pdo->commit();

    echo json_encode([
        "status" => "success",
        "message" => "บันทึก Sub PLO สำเร็จ (เพิ่ม $inserted แก้ไข $updated ลบ $deleted)",
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
