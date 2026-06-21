<?php
require_once __DIR__ . '/../../config/config.php';
header("Content-Type: application/json");

try {
    $db = new Connect();
    
    // ดึงข้อมูล 100 รายการล่าสุด พร้อม Join หาชื่อ username และ role
    $sql = "SELECT a.audit_log_id as id, a.created_at as timestamp, 
                   u.username as user, u.role_id,
                   a.action_type as action, a.resource, a.details, a.ip_address as ipAddress
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY a.created_at DESC
            LIMIT 100";
            
    $stmt = $db->query($sql);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach($logs as $log) {
        // แปลง Role ID เป็น String
        $roleStr = 'student';
        if ($log['role_id'] == 1) $roleStr = 'admin';
        else if ($log['role_id'] == 2) $roleStr = 'teacher';

        $result[] = [
            'id' => (string)$log['id'],
            'timestamp' => $log['timestamp'],
            'user' => $log['user'] ?: 'Unknown User',
            'userRole' => $roleStr,
            'action' => $log['action'] ?: 'update',
            'resource' => $log['resource'] ?: 'ระบบ',
            'details' => $log['details'] ?: '',
            'ipAddress' => $log['ipAddress'] ?: '127.0.0.1'
        ];
    }

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}