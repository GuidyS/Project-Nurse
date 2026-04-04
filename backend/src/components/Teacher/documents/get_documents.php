<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin();

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    // 1. ดึงรายวิชาทั้งหมดมาทำ Dropdown
    $sql_courses = "SELECT subject_code, subject_name_th FROM subjects WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt_courses = $pdo->query($sql_courses);
    $courses = $stmt_courses->fetchAll(PDO::FETCH_ASSOC);

    // 2. ดึง JSON เพื่อกวาดหาเอกสาร
    $sql_fw = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt_fw = $pdo->query($sql_fw);
    $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
    $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

    $all_documents = [];

    if (isset($mappingData['subject_mappings'])) {
        foreach ($mappingData['subject_mappings'] as $courseCode => $data) {
            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $doc) {
                    $doc['course'] = $courseCode; // แปะรหัสวิชากลับเข้าไปให้ React รู้
                    $all_documents[] = $doc;
                }
            }
        }
    }

    // เรียงลำดับเอกสารใหม่ล่าสุดขึ้นก่อน
    usort($all_documents, function($a, $b) {
        return strtotime($b['uploadedAt']) - strtotime($a['uploadedAt']);
    });

    echo json_encode([
        "status" => "success", 
        "data" => [
            "documents" => $all_documents,
            "courses" => $courses
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>