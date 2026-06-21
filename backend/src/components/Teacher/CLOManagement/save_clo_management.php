<?php

require_once './middlewares/auth_middleware.php'; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$input = json_decode(file_get_contents("php://input"), true);

try {
    if (!empty($input['subject_code']) && isset($input['clos'])) {
        $subject_code = $input['subject_code'];
        $new_clos = $input['clos']; 
        
        $sql = "SELECT id, mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
        $stmt = $pdo->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $data = json_decode($row['mapping_json'], true);
            
            // ตรวจสอบและสร้างโครงสร้างคีย์ "course_clos" หากยังไม่มี
            if (!isset($data['course_clos'])) $data['course_clos'] = [];
            
            // นำ Array CLO ก้อนใหม่ บันทึกทับเฉพาะวิชาที่ส่งมา
            $data['course_clos'][$subject_code] = $new_clos;

            $new_json = json_encode($data, JSON_UNESCAPED_UNICODE);
            
            $update_sql = "UPDATE curriculum_framework SET mapping_json = :json WHERE id = :id";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->execute([
                ':json' => $new_json,
                ':id' => $row['id']
            ]);

            echo json_encode(["status" => "success", "message" => "บันทึกข้อมูล CLO สำเร็จ!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบโครงสร้างหลักสูตร"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ข้อมูลที่ส่งมาไม่ครบถ้วน"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>