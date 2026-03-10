<?php
// get_import_history.php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    
    // ดึงข้อมูลประวัติ ล่าสุดขึ้นก่อน
    $sql = "SELECT id, type, file_name as fileName, record_count as recordCount, status, created_at as date 
            FROM import_history 
            ORDER BY created_at DESC 
            LIMIT 10";
            
    $stmt = $db->query($sql);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($history);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}