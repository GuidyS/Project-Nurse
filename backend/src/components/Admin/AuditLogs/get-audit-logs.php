<?php
require_once __DIR__ . '/../../../config/config.php';
header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();
    
    // กรองเอาเฉพาะ create, update, delete, role_change ตั้งแต่ SQL Level
    $sql = "SELECT a.audit_log_id as id, a.created_at as timestamp, 
                   u.username as user, u.role_id,
                   a.action_type as action, a.resource, a.details, a.ip_address as ipAddress
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.user_id
            WHERE a.action_type IN ('create', 'update', 'delete', 'role_change')
            ORDER BY a.created_at DESC
            LIMIT 100";
            
    $stmt = $db->query($sql);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $result = [];
    foreach ($logs as $log) {
        // แมปชื่อ Role ให้อ่านง่าย
        $roleStr = 'student';
        if ((int)$log['role_id'] === 1) $roleStr = 'admin';
        else if ((int)$log['role_id'] === 2) $roleStr = 'teacher';

        $result[] = [
            'id'        => (string)$log['id'],
            'timestamp' => $log['timestamp'],
            'user'      => $log['user'] ?: 'Unknown User',
            'userRole'  => $roleStr,
            'action'    => $log['action'],
            'resource'  => $log['resource'] ?: 'ระบบ',
            'details'   => $log['details'] ?: '',
            'ipAddress' => $log['ipAddress'] ?: '127.0.0.1'
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}