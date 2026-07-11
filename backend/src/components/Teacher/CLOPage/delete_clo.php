<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}
   try {
    if (isset($input['clo_id'])) {
        $frameworkStmt = $pdo->query("SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
        $framework = $frameworkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$framework) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่เปิดใช้งาน"]);
            exit();
        }

        $mappingData = !empty($framework['mapping_json']) ? json_decode($framework['mapping_json'], true) : [];
        $targetId = (int)$input['clo_id'];
        $deleted = false;
        $subjectCodes = array_keys($mappingData['subject_mappings'] ?? []);

        if (!empty($input['subject_id'])) {
            $subjectStmt = $pdo->prepare("SELECT subject_code FROM subject WHERE subject_id = :subject_id LIMIT 1");
            $subjectStmt->execute([':subject_id' => $input['subject_id']]);
            $subjectCode = $subjectStmt->fetchColumn();
            $subjectCodes = $subjectCode ? [$subjectCode] : [];
        }

        foreach ($subjectCodes as $subjectCode) {
            $subjectData = $mappingData['subject_mappings'][$subjectCode] ?? [];
            if (empty($subjectData['clos']) || !is_array($subjectData['clos'])) continue;

            foreach ($subjectData['clos'] as $index => $clo) {
                if ((int)($clo['clo_id'] ?? 0) === $targetId) {
                    array_splice($mappingData['subject_mappings'][$subjectCode]['clos'], $index, 1);
                    $deleted = true;
                    break 2;
                }
            }
        }

        if (!$deleted) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบ CLO ที่ต้องการลบ"]);
            exit();
        }

        $updateStmt = $pdo->prepare("UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id");
        $updateStmt->execute([
            ':json' => json_encode($mappingData, JSON_UNESCAPED_UNICODE),
            ':id' => $framework['id']
        ]);

        echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำเร็จ"], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่พบ ID ที่ต้องการลบ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>