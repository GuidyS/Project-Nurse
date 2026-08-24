<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
$advisor_user_id = $_SESSION['user_id'];

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['studentId']) && !empty($input['topic']) && !empty($input['summary'])) {

        // หา student_id (PK) จาก student_code ที่หน้าเว็บส่งมา
        $stmt_find_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_find_std->execute([$input['studentId'], $input['studentId']]);
        $student = $stmt_find_std->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลนักศึกษารหัสนี้ในระบบ"]);
            exit();
        }

        $sql = "INSERT INTO advice_log (student_id, advisor_id, topic, log_type, advice_note)
                VALUES (:student_id, :advisor_id, :topic, :log_type, :summary)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':student_id' => $student['student_id'],
            ':advisor_id' => $advisor_user_id,
            ':topic' => $input['topic'],
            ':log_type' => $input['type'] ?? 'academic',
            ':summary' => $input['summary']
        ]);

        echo json_encode(["status" => "success", "message" => "บันทึกการให้คำปรึกษาเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
