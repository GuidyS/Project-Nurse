<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../CLOPage/clo_mapping_helpers.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$inputCloMap = json_decode(file_get_contents("php://input"), true);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    if (!is_array($inputCloMap)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ถูกต้อง"]);
        exit();
    }

    $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตรที่กำลังใช้งาน"]);
        exit();
    }

    $data = !empty($row['mapping_json']) ? json_decode($row['mapping_json'], true) : [];
    if (!is_array($data)) {
        $data = [];
    }
    if (!isset($data['subject_mappings'])) {
        $data['subject_mappings'] = [];
    }

    foreach ($inputCloMap as $courseCode => $mappedPlos) {
        if (!is_string($courseCode) || $courseCode === '') {
            continue;
        }
        if (!is_array($mappedPlos)) {
            $mappedPlos = [];
        }

        $normalizedPlos = array_values(array_unique(array_filter($mappedPlos, 'is_string')));

        if (!isset($data['subject_mappings'][$courseCode])) {
            $data['subject_mappings'][$courseCode] = ["clos" => []];
        }

        $data['subject_mappings'][$courseCode]['course_plos'] = $normalizedPlos;
        syncSubjectClosWithCoursePlos($data['subject_mappings'][$courseCode], $normalizedPlos);
    }

    $update_sql = "UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':json' => json_encode($data, JSON_UNESCAPED_UNICODE),
        ':id' => $row['id'],
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO Map สำเร็จ!"], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
