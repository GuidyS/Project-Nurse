<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $userId = $_SESSION['user_id'];
    $isAdmin = cloAccessIsAdmin($pdo, $userId);
    // อาจารย์เห็นเฉพาะวิชาที่ตนเองเป็นผู้สอน
    $myCodes = $isAdmin ? [] : cloAccessMySubjectCodes($pdo, $userId);

    $curriculumSubjects = activeCurriculumSubjects($pdo);
    if ($curriculumSubjects !== null) {
        // รายวิชาตามหลักสูตรที่ใช้งานในระบบ (ตั้งค่าที่หน้า "จัดการหลักสูตร") — ชื่อวิชาตามหลักสูตร
        // subject_id เป็น null ได้ถ้าวิชามีเฉพาะในหลักสูตร (หน้า CLO ระบุวิชาด้วย subject_code)
        $myCodeSet = array_fill_keys(array_map('mb_strtolower', $myCodes), true);
        $subjects = [];
        foreach ($curriculumSubjects as $subject) {
            if (!$isAdmin && !isset($myCodeSet[mb_strtolower($subject['subject_code'])])) {
                continue;
            }
            $subjects[] = [
                'subject_id' => $subject['subject_id'],
                'subject_code' => $subject['subject_code'],
                'subject_name_th' => $subject['subject_name'],
            ];
        }
    } elseif ($isAdmin) {
        // ยังไม่มีหลักสูตรในระบบ → รายวิชาทั้งหมดจากตาราง subject แบบเดิม (admin แก้ไขได้ทุกวิชา)
        $stmt = $pdo->prepare("SELECT subject_id, subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC");
        $stmt->execute();
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
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

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
