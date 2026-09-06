<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/curriculum_repository.php';
require_once __DIR__ . '/clo_access_helpers.php';

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

    if ($isAdmin) {
        // admin เห็นและแก้ไขได้ทุกวิชา
        $sql = "SELECT subject_id, subject_code, subject_name_th FROM subject WHERE is_active = 1 ORDER BY subject_code ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // อาจารย์เห็นเฉพาะวิชาที่ตนเองเป็นผู้สอน
        $myCodes = cloAccessMySubjectCodes($pdo, $userId);

        if (empty($myCodes)) {
            echo json_encode([
                "status" => "success",
                "data" => [],
                "is_admin" => false,
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        $placeholders = implode(',', array_fill(0, count($myCodes), '?'));
        $sql = "SELECT subject_id, subject_code, subject_name_th
                FROM subject
                WHERE is_active = 1 AND subject_code IN ($placeholders)
                ORDER BY subject_code ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($myCodes);
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "status" => "success",
        "data" => $subjects,
        // ให้หน้าเว็บรู้ว่าควรแสดงปุ่ม "แก้ไข YLO" หรือไม่
        "is_admin" => $isAdmin,
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
