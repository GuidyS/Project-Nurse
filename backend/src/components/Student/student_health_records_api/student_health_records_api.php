<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect;

    $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 3) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $student_id = $user['username'];
    $method = $_SERVER['REQUEST_METHOD'];

    // 🔍 [GET] ดึงข้อมูลสุขภาพชั้นปีที่ 1-4
    if ($method === 'GET') {
        $query = "SELECT * FROM student_health_records WHERE student_id = :sid ORDER BY year_level ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([':sid' => $student_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        echo json_encode(["status" => "success", "data" => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 💾 [POST] บันทึกหรืออัปเดตข้อมูลสุขภาพ
    if ($method === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $records = $input['records'] ?? [];

        if (empty($records) || !is_array($records)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ไม่มีข้อมูลสำหรับบันทึก"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $upsertSql = "
            INSERT INTO student_health_records (
                student_id, year_level, academic_year, height, weight, bmi,
                overall_status, health_issue_detail
            ) VALUES (
                :sid, :y_level, :ayear, :height, :weight, :bmi,
                :ostatus, :detail
            ) ON DUPLICATE KEY UPDATE
                academic_year = VALUES(academic_year),
                height = VALUES(height),
                weight = VALUES(weight),
                bmi = VALUES(bmi),
                overall_status = VALUES(overall_status),
                health_issue_detail = VALUES(health_issue_detail)
        ";
        $stmt = $db->prepare($upsertSql);

        $db->beginTransaction();
        try {
            foreach ($records as $item) {
                $height = !empty($item['height']) ? (float)$item['height'] : null;
                $weight = !empty($item['weight']) ? (float)$item['weight'] : null;
                $bmi = null;

                if ($height && $weight && $height > 0) {
                    $heightMeter = $height / 100;
                    $bmi = round($weight / ($heightMeter * $heightMeter), 2);
                }

                $stmt->execute([
                    ':sid'     => $student_id,
                    ':y_level' => (int)($item['year_level'] ?? 1),
                    ':ayear'   => (int)($item['academic_year'] ?? (2567 + ((int)($item['year_level'] ?? 1) - 1))),
                    ':height'  => $height,
                    ':weight'  => $weight,
                    ':bmi'     => $bmi,
                    ':ostatus' => ($item['overall_status'] === 'has_health_issue') ? 'has_health_issue' : 'healthy',
                    ':detail'  => ($item['overall_status'] === 'has_health_issue') ? ($item['health_issue_detail'] ?? '') : null,
                ]);
            }
            $db->commit();
        } catch (Throwable $e) {
            $db->rollBack();
            throw $e;
        }

        echo json_encode(["status" => "success", "message" => "บันทึกข้อมูลภาวะสุขภาพเรียบร้อยแล้ว"], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}