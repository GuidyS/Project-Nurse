<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

$advisor_user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Connect();

    if (empty($input['studentId']) || empty($input['topic']) || empty($input['summary'])) {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
        exit();
    }

    $stmt_find_std = $db->prepare("SELECT student_id FROM student WHERE student_code = ? LIMIT 1");
    $stmt_find_std->execute([$input['studentId']]);
    $student = $stmt_find_std->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษารหัสนี้ในระบบ"]);
        exit();
    }

    $sql = "INSERT INTO advice_log (student_id, advisor_user_id, topic, log_type, advice_note)
            VALUES (:student_id, :advisor_id, :topic, :log_type, :summary)";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':student_id' => $student['student_id'],
        ':advisor_id' => $advisor_user_id,
        ':topic' => $input['topic'],
        ':log_type' => $input['type'] ?? 'academic',
        ':summary' => $input['summary'],
    ]);

    echo json_encode(["status" => "success", "message" => "บันทึกการให้คำปรึกษาเรียบร้อยแล้ว"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
