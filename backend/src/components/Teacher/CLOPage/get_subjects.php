<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $pdo = new Connect();

    $userId = $_SESSION['user_id'];
    $isAdmin = cloAccessIsAdmin($pdo, $userId);
    // ทุกคนเห็นเฉพาะวิชาที่ตนเองเป็นผู้รับผิดชอบ รวมถึงผู้ดูแลระบบด้วย
    // (มอบหมายผู้สอนที่หน้า "จัดอาจารย์ผู้สอน")
    $myCodes = cloAccessMySubjectCodes($pdo, $userId);

    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        // รายวิชาตามหลักสูตรที่ใช้งานในระบบ (ตั้งค่าที่หน้า "จัดการหลักสูตร") — ชื่อวิชาตามหลักสูตร
        // subject_id เป็น null ได้ถ้าวิชามีเฉพาะในหลักสูตร (หน้า CLO ระบุวิชาด้วย subject_code)
        $myCodeSet = array_fill_keys(array_map('strtolower', $myCodes), true);
        $subjects = [];
        foreach ($curriculumSubjects as $subject) {
            if (!isset($myCodeSet[strtolower($subject['subject_code'])])) {
                continue;
            }
            $subjects[] = [
                'subject_id' => $subject['subject_id'],
                'subject_code' => $subject['subject_code'],
                'subject_name_th' => $subject['subject_name'],
            ];
        }
    } elseif (empty($myCodes)) {
        $subjects = [];
    } else {
        $placeholders = implode(',', array_fill(0, count($myCodes), '?'));
        $stmt = $pdo->prepare("SELECT subject_id, subject_code, subject_name_th
                               FROM subject
                               WHERE is_active = 1 AND subject_code IN ($placeholders)
                               ORDER BY subject_code ASC");
        $stmt->execute($myCodes);
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "status" => "success",
        "data" => $subjects,
        // ให้หน้าเว็บรู้ว่าควรแสดงปุ่ม "แก้ไข YLO" หรือไม่
        "is_admin" => $isAdmin,
        // หลักสูตรที่ใช้งานในระบบ (null = ยังไม่มีหลักสูตร)
        "curriculum" => activeCurriculumCycle($pdo),
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('get-subjects failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "ดึงข้อมูลรายวิชาไม่สำเร็จ"], JSON_UNESCAPED_UNICODE);
}
