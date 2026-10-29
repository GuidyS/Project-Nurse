<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../middlewares/auth_middleware.php';
require_once __DIR__ . '/../../../config/config.php'; // นำเข้า Connect() ถ้าต้องการ
require_once __DIR__ . '/../../../config/audit_helper.php'; // นำเข้า Audit Helper
require_once __DIR__ . '/../../Admin/AssignStudents/assign_students_helpers.php';

$advisor_user_id = $_SESSION['user_id'];

$pdo = new Connect();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['studentId']) && !empty($input['topic']) && !empty($input['summary'])) {
        $userStmt = $pdo->prepare('SELECT username, role_id FROM users WHERE user_id = ? LIMIT 1');
        $userStmt->execute([$advisor_user_id]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !in_array((int)$user['role_id'], [1, 2, 5], true)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            exit;
        }
        if ((int)$user['role_id'] === 2) {
            $advisorType = assignStudentsResolveType('advisor');
            [$typeSql, $typeParams] = assignStudentsTypeCondition($advisorType, 'sam');
            $check = $pdo->prepare("SELECT 1 FROM student_advisor_mapping sam
                WHERE sam.student_id = :student_id AND sam.faculty_id = :faculty_id
                AND $typeSql LIMIT 1");
            $check->execute($typeParams + [':student_id' => $input['studentId'], ':faculty_id' => $user['username']]);
            if (!$check->fetchColumn()) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'นักศึกษาไม่ได้อยู่ในความดูแล'], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
        if (!in_array($input['type'] ?? 'academic', ['academic', 'personal', 'warning', 'critical'], true)) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'ประเภทบันทึกไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // หา student_id (PK) จาก student_code ที่หน้าเว็บส่งมา
        $stmt_find_std = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ? LIMIT 1");
        $stmt_find_std->execute([$input['studentId']]);
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

        // บันทึกประวัติ Log หลังเพิ่มคำปรึกษาสำเร็จ
        logAudit($pdo, $advisor_user_id, 'create', 'advise_notes', 'เพิ่มบันทึกการให้คำปรึกษา');

        echo json_encode(["status" => "success", "message" => "บันทึกการให้คำปรึกษาเรียบร้อยแล้ว"]);
    } else {
        echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
    }
} catch (PDOException $e) {
    error_log('save-advise-note failed: ' . $e->getCode());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ไม่สามารถบันทึกคำปรึกษาได้"], JSON_UNESCAPED_UNICODE);
}
?>
