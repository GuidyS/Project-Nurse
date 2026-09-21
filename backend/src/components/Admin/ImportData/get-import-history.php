<?php
// get_import_history.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../Approvals/approval-schema.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    approvalRequireAdmin($db);

    $allowedTypes = ['students', 'teachers', 'courses', 'projects'];
    $requestedTypes = [];
    if (!empty($_GET['types'])) {
        $requestedTypes = array_values(array_filter(
            array_map('trim', explode(',', (string)$_GET['types'])),
            fn($type) => in_array($type, $allowedTypes, true)
        ));
    }
    
    // ดึงข้อมูลประวัติ ล่าสุดขึ้นก่อน
    $sql = "SELECT id, type, file_name as fileName, record_count as recordCount, status, created_at as date 
            FROM import_history 
            ";
    $params = [];
    if (!empty($requestedTypes)) {
        $placeholders = [];
        foreach ($requestedTypes as $index => $type) {
            $key = ":type{$index}";
            $placeholders[] = $key;
            $params[$key] = $type;
        }
        $sql .= "WHERE type IN (" . implode(', ', $placeholders) . ") ";
    }

    $sql .= "ORDER BY created_at DESC 
            LIMIT 10";
            
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($history);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
