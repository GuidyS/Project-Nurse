<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    if (empty($input['ylo_plo_matrix']) || !is_array($input['ylo_plo_matrix'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูล YLO ไม่ถูกต้อง"]);
        exit();
    }

    // validate โครงสร้าง: YLO1-4 × PLO id => {active, description}
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

    $stmt = $pdo->query("SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่เปิดใช้งาน"]);
        exit();
    }

    $data = !empty($row['mapping_json']) ? json_decode($row['mapping_json'], true) : [];
    if (!is_array($data)) {
        $data = [];
    }

    $data['ylo_plo_matrix'] = $matrix;

    // catalog ของ Sub PLO ส่งมาด้วยได้ (ใช้ตอน seed ครั้งแรก) — ไม่ส่งมา = คงของเดิม
    if (isset($input['sub_plo_catalog']) && is_array($input['sub_plo_catalog'])) {
        $catalog = [];
        foreach ($input['sub_plo_catalog'] as $sub) {
            if (empty($sub['code']) || empty($sub['plo'])) {
                continue;
            }
            $catalog[] = [
                'code' => (string)$sub['code'],
                'plo' => (string)$sub['plo'],
                'description' => (string)($sub['description'] ?? ''),
            ];
        }
        $data['sub_plo_catalog'] = $catalog;
    }

    $updateStmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
    $updateStmt->execute([
        ':json' => json_encode($data, JSON_UNESCAPED_UNICODE),
        ':id' => $row['id'],
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล YLO สำเร็จ"], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
