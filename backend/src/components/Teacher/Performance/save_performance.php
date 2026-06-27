<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php';

$inputData = file_get_contents("php://input");
$request = json_decode($inputData, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    if (!isset($request['selectedStudent']) || !isset($request['scores'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
        exit();
    }

    $studentId = $request['selectedStudent'];
    $scores = $request['scores'];
    $comment = isset($request['comment']) ? $request['comment'] : "";

    $skill = isset($scores['skill'][0]) ? (float)$scores['skill'][0] : 0.0;
    $attitude = isset($scores['attitude'][0]) ? (float)$scores['attitude'][0] : 0.0;
    $knowledge = isset($scores['knowledge'][0]) ? (float)$scores['knowledge'][0] : 0.0;
    $communication = isset($scores['communication'][0]) ? (float)$scores['communication'][0] : 0.0;

    $overall = ($skill + $attitude + $knowledge + $communication) / 4;

    // แพ็กข้อมูลทั้งหมดเป็น JSON เพื่อเก็บลงใน description
    $scoreDataJson = json_encode([
        "skill" => $skill,
        "attitude" => $attitude,
        "knowledge" => $knowledge,
        "communication" => $communication,
        "overall" => $overall,
        "comment" => $comment
    ], JSON_UNESCAPED_UNICODE);

    $pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

    try {
        // ใช้ตาราง approval_requests แทนการสร้างตารางใหม่
        $sql_insert = "
            INSERT INTO approval_requests 
                (request_type, requester_user_id, target_ref_type, target_ref_id, title, description, status, created_at)
            VALUES 
                ('performance_eval', :user_id, 'student', :student_id, 'การประเมิน Performance', :description, 'approved', NOW())
        ";

        $stmt = $pdo->prepare($sql_insert);
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null; // ดึงคนประเมินจาก Session
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->bindParam(':description', $scoreDataJson);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "บันทึกผลการประเมินเรียบร้อยแล้ว"]);
        } else {
            throw new PDOException("ไม่สามารถบันทึกข้อมูลได้");
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
}