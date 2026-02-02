<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$database = new Database();
$db = $database->getConnection();
$input = json_decode(file_get_contents("php://input"), true);

if ($input && !empty($input['student_ids']) && !empty($input['title'])) {
    try {
        $db->beginTransaction();

        $sql = "INSERT INTO notifications (user_id, title, message, type, is_read) 
                VALUES (:user_id, :title, :message, 'info', 0)";
        $stmt = $db->prepare($sql);

        // วนลูปส่งให้นักศึกษาทุกคนที่ถูกเลือก (student_ids คือ array ของ user_id นักศึกษา)
        foreach ($input['student_ids'] as $student_user_id) {
            $stmt->execute([
                ':user_id' => $student_user_id, // ส่งให้ User ID ของนักศึกษาคนนั้น
                ':title' => $input['title'],
                ':message' => $input['message']
            ]);
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "ส่งแจ้งเตือนสำเร็จ"]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
}
?>