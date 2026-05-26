<?php

//require_once __DIR__ . '/../../../middlewares/auth_middleware.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit();
}

try {
    
    if (!empty($input['subject_id']) && !empty($input['description'])) {
        
        
        $sql = "INSERT INTO clo (subject_id, description, ylo_id) 
                VALUES (:subject_id, :description, :ylo_id)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':subject_id' => $input['subject_id'],
            ':description' => $input['description'], 
            ':ylo_id' => $input['ylo_id'] ?? null
        ]);

        echo json_encode(["status" => "success", "message" => "เพิ่ม CLO สำเร็จ"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>