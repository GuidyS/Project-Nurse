<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

// ตั้งค่า Header สำหรับ API
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// ตรวจสอบสิทธิ์การเข้าถึง
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([]); 
    exit();
}

try {
    $db = new Connect();

    //  ระบบลบ Log อัตโนมัติ (เก่าเกิน 90 วัน)
    try {
        $db->exec("DELETE FROM audit_log WHERE created_at < (NOW() - INTERVAL 90 DAY)");
    } catch (Exception $cleanupError) {
        error_log('Audit log cleanup failed: ' . $cleanupError->getMessage());
    }

    //  เตรียม Query ค้นหา "ชื่อ-นามสกุล" จากรหัส (ทั้งนักศึกษาและอาจารย์)
    $stmt_find_name = $db->prepare("
        SELECT fullname FROM (
            SELECT student_id as id, CONCAT(IFNULL(title, ''), IFNULL(first_name_th, ''), ' ', IFNULL(last_name_th, '')) as fullname FROM student
            UNION
            SELECT CAST(faculty_id AS CHAR) as id, CONCAT(IFNULL(title, ''), IFNULL(first_name_th, ''), ' ', IFNULL(last_name_th, '')) as fullname FROM faculty
        ) as all_users WHERE id = :id LIMIT 1
    ");

    //  ดึงข้อมูลประวัติการใช้งานจากฐานข้อมูล
    $sql = "SELECT a.audit_log_id as id, a.created_at as timestamp, 
                   u.username as user, u.role_id,
                   a.action_type as action, a.resource, a.details, a.ip_address as ipAddress
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY a.created_at DESC
            LIMIT 500";
            
    $stmt = $db->query($sql);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach($logs as $log) {
        
        $roleStr = 'นักศึกษา';
        if ($log['role_id'] == 1) $roleStr = 'ผู้ดูแลระบบ (Admin)';
        else if ($log['role_id'] == 2) $roleStr = 'อาจารย์';
        else if ($log['role_id'] == 5) $roleStr = 'คณบดี';

        // ส่ง Action กลับเป็นคำดั้งเดิมให้ระบบ Frontend แสดงป้ายสี (สร้าง, แก้ไข, ลบ)
        $actionRaw = strtolower($log['action']);

        //  แปลงคำภาษาอังกฤษ (Resource) เป็นภาษาไทย
        $resourceTh = $log['resource'];
        switch (strtolower($log['resource'])) {
            // หมวดหมู่ดั้งเดิม 
            case 'approval_request':
            case 'approvals': $resourceTh = 'จัดการคำร้องขอ'; break;
            case 'competency_items': 
            case 'student_competency': $resourceTh = 'ประเมินสมรรถนะ'; break;
            case 'roles management':
            case 'roles_management': $resourceTh = 'จัดการสิทธิ์'; break;
            case 'profile': $resourceTh = 'ข้อมูลส่วนตัว'; break;
            case 'portfolio': $resourceTh = 'แฟ้มสะสมผลงาน'; break;
            case 'student_vaccinations': $resourceTh = 'ประวัติวัคซีน'; break;
            case 'student_health_records': $resourceTh = 'ประวัติสุขภาพ'; break;
            case 'assign_instructors': $resourceTh = 'มอบหมายผู้สอน'; break;
            case 'assign_students': $resourceTh = 'มอบหมายนักศึกษา'; break;
            case 'project_documents': 
            case 'project_docs': $resourceTh = 'เอกสารโครงการ'; break; 
            case 'clo_management': 
            case 'clos': $resourceTh = 'จัดการ CLO'; break; 
            case 'clo_map': $resourceTh = 'กระจายความรับผิดชอบ'; break;
            case 'grades': $resourceTh = 'ผลการเรียน'; break;
            case 'performance_eval': $resourceTh = 'ประเมินการปฏิบัติงาน'; break;
            case 'users': 
            case 'user': $resourceTh = 'บัญชีผู้ใช้'; break;
            case 'evidence': $resourceTh = 'หลักฐานนักศึกษา'; break;
            case 'schedule_tasks': $resourceTh = 'ตารางนัดหมาย'; break;
            case 'transfer_requests': $resourceTh = 'คำร้องโอนย้าย'; break;
            case 'advise_notes': $resourceTh = 'ให้คำปรึกษา'; break;
            case 'notifications': $resourceTh = 'การแจ้งเตือน'; break;
            case 'reports': $resourceTh = 'รายงานระบบ'; break;
            
            // หมวดหลักสูตร 
            case 'curriculum': $resourceTh = 'ข้อมูลหลักสูตร'; break;
            case 'curriculum_subjects': $resourceTh = 'รายวิชาในหลักสูตร'; break;
            case 'curriculum_cycles': $resourceTh = 'รอบหลักสูตร'; break;
            case 'curriculum_plo': $resourceTh = 'จัดการ PLO'; break;
            case 'curriculum_ylo': $resourceTh = 'จัดการ YLO'; break;
            
            // หมวดทั่วไปและของวันนี้ 
            case 'project':
            case 'projects': $resourceTh = 'โครงการ'; break;
            case 'my_projects': $resourceTh = 'โครงการของฉัน'; break; 
            case 'project_assessments': $resourceTh = 'ประเมินผลโครงการ'; break; 
            case 'documents': $resourceTh = 'เอกสาร มคอ.'; break; 
            case 'import_data': $resourceTh = 'นำเข้าข้อมูลระบบ'; break; 
            case 'course_students': $resourceTh = 'จัดการนักศึกษาในรายวิชา'; break; 
            case 'subjects':
            case 'subject': $resourceTh = 'รายวิชา'; break;
            case 'students':
            case 'student': $resourceTh = 'ข้อมูลนักศึกษา'; break;
            case 'faculty':
            case 'teachers':
            case 'teacher': $resourceTh = 'ข้อมูลอาจารย์'; break;
            case 'settings': $resourceTh = 'การตั้งค่าระบบ'; break;
            case 'system': $resourceTh = 'ระบบ'; break;
        }

        $details = $log['details'] ?: '';
        
        // ลบข้อความในวงเล็บภาษาอังกฤษทิ้งจากรายละเอียด เพื่อไม่ให้แสดงซ้ำซ้อน
        $details = preg_replace('/^\[[a-zA-Z0-9_]+\]\s*/', '', $details);
        // ตัดข้อความ "(user_id=XX)" ทิ้งไปเลย เพื่อความสวยงาม
        $details = preg_replace('/\s*\(user_id=\d+\)/', '', $details);

        //  ดึงชื่อและนามสกุลมาต่อท้ายรหัสอัตโนมัติ
        if (preg_match('/([0-9]{8,15})/', $details, $matchId)) {
            $foundId = $matchId[1];
            try {
                $stmt_find_name->execute([':id' => $foundId]);
                $foundName = $stmt_find_name->fetchColumn();
                if ($foundName) {
                    $details = preg_replace('/\b' . $foundId . '\b/', $foundId . ' (' . trim($foundName) . ')', $details, 1);
                }
            } catch (Exception $ex) {}
        }

        //  แปลงข้อความภาษาอังกฤษเก่าๆ ให้เป็นภาษาไทย
        if (preg_match('/approve approval request ID:\s*(\d+)/i', $details, $m)) {
            $details = "อนุมัติคำร้องขอ (ID: {$m[1]})";
        }
        if (preg_match('/reject approval request ID:\s*(\d+)/i', $details, $m)) {
            $details = "ปฏิเสธคำร้องขอ (ID: {$m[1]})";
        }
        if (preg_match('/create approval request ID:\s*(\d+)\s*-\s*Created approval request:\s*(.*)/i', $details, $m)) {
            $topic = trim($m[2]);
            if (stripos($topic, 'student transfer') !== false) $topic = 'ขอโอนย้ายที่ปรึกษา';
            $details = "สร้างคำร้องขอ (ID: {$m[1]}) - เรื่อง: {$topic}";
        }

        // ดักจับข้อความ Export (ส่งออก)
        if (preg_match('/export approval request ID: \d+ - category=(\w+); format=(\w+); rows=(\d+)/i', $details, $matches)) {
            $categoryTh = $matches[1];
            if (strtolower($categoryTh) === 'projects') $categoryTh = 'โครงการ';
            elseif (strtolower($categoryTh) === 'teachers') $categoryTh = 'อาจารย์';
            elseif (strtolower($categoryTh) === 'students') $categoryTh = 'นักศึกษา';
            
            $details = "ส่งออกข้อมูล (หมวดหมู่: {$categoryTh}, รูปแบบไฟล์: " . strtoupper($matches[2]) . ", จำนวน: {$matches[3]} รายการ)";
            $actionRaw = 'export';
        }
        elseif (stripos($details, 'export') !== false) {
            $details = str_ireplace('export', 'ส่งออกไฟล์', $details);
            $details = str_ireplace('format=', 'รูปแบบ: ', $details);
            $details = str_ireplace('rows=', 'จำนวนรายการ: ', $details);
            $actionRaw = 'export';
        }
        
        // ดักจับข้อความ Import (นำเข้าข้อมูล) เพื่อสั่งเปลี่ยนป้ายที่หน้าเว็บให้เป็น 'import'
        elseif (strtolower($log['resource']) === 'import_data' || stripos($details, 'import') !== false) {
            $details = str_ireplace('import', 'นำเข้าข้อมูล', $details);
            $details = str_ireplace('format=', 'รูปแบบ: ', $details);
            $details = str_ireplace('rows=', 'จำนวนรายการ: ', $details);
            $details = str_ireplace('success=', 'สำเร็จ: ', $details);
            $details = str_ireplace('failed=', 'ล้มเหลว: ', $details);
            $actionRaw = 'import'; 
        }

        $result[] = [
            'id' => (string)$log['id'],
            'timestamp' => $log['timestamp'],
            'user' => $log['user'] ?: 'Unknown User',
            'userRole' => $roleStr,
            'action' => $actionRaw,
            'resource' => $resourceTh ?: 'ระบบ',
            'details' => $details,
            'ipAddress' => $log['ipAddress'] ?: '127.0.0.1'
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([]);
}
?>