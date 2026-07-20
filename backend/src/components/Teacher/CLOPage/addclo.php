<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

//require_once __DIR__ . '/../../../middlewares/auth_middleware.php';
require_once __DIR__ . '/clo_mapping_helpers.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

try {
    
    if (!empty($input['subject_id']) && !empty($input['description'])) {
        $subjectStmt = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = :subject_id LIMIT 1");
        $subjectStmt->execute([':subject_id' => $input['subject_id']]);
        $subject_code = $subjectStmt->fetchColumn();

        if (!$subject_code) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบรายวิชา"]);
            exit();
        }

        $frameworkStmt = $pdo->query("SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
        $framework = $frameworkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$framework) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่เปิดใช้งาน"]);
            exit();
        }

        $mappingData = !empty($framework['mapping_json']) ? json_decode($framework['mapping_json'], true) : [];
        if (!is_array($mappingData)) $mappingData = [];
        if (!isset($mappingData['subject_mappings'])) $mappingData['subject_mappings'] = [];
        if (!isset($mappingData['subject_mappings'][$subject_code])) $mappingData['subject_mappings'][$subject_code] = [];
        if (!isset($mappingData['subject_mappings'][$subject_code]['clos']) || !is_array($mappingData['subject_mappings'][$subject_code]['clos'])) {
            $mappingData['subject_mappings'][$subject_code]['clos'] = [];
        }

        $maxId = 0;
        foreach (($mappingData['subject_mappings'] ?? []) as $subjectData) {
            foreach (($subjectData['clos'] ?? []) as $clo) {
                $maxId = max($maxId, (int)($clo['clo_id'] ?? 0));
            }
        }

        $mapped_plos = buildCloMappedPlos(
            $mappingData,
            $input['ylo_id'] ?? null,
            $input['mapped_plos'] ?? null
        );

        $mappingData['subject_mappings'][$subject_code]['clos'][] = [
            "clo_id" => $maxId + 1,
            "clo_code" => $input['clo_code'] ?? null,
            "description" => $input['description'],
            "ylo_id" => $input['ylo_id'] ?? null,
            "mapped_plos" => $mapped_plos
        ];

        $updateStmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
        $updateStmt->execute([
            ':json' => json_encode($mappingData, JSON_UNESCAPED_UNICODE),
            ':id' => $framework['id']
        ]);

        echo json_encode(["status" => "success", "message" => "เพิ่ม CLO สำเร็จ"], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>