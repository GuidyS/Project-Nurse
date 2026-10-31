<?php
/**
 * ทำเนียบบุคลากรภายในคณะ — โหมดดูอย่างเดียว ไม่มี endpoint สำหรับแก้ไข
 *
 *   ไม่ส่ง faculty_id  → รายชื่ออาจารย์ทั้งหมดในระบบ
 *   ส่ง faculty_id     → ข้อมูลส่วนตัวของอาจารย์คนนั้นพร้อมเอกสารแนบ
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/faculty_directory_helpers.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Connect();
    facultyDirectoryRequireDean($db, $_SESSION['user_id']);

    // ตำแหน่งในคณะของแต่ละคน (อาจารย์ 1 คนมีได้หลายตำแหน่ง)
    $positionStmt = $db->query("
        SELECT u.username AS faculty_id, p.position_name
        FROM user_position up
        INNER JOIN users u ON u.user_id = up.user_id
        INNER JOIN position p ON p.position_id = up.position_id
        ORDER BY up.is_primary DESC, p.position_id
    ");
    $positionsByFaculty = [];
    foreach ($positionStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $positionsByFaculty[(string)$row['faculty_id']][] = (string)$row['position_name'];
    }

    $requestedId = trim((string)($_GET['faculty_id'] ?? ''));

    // ---------- รายละเอียดรายบุคคล ----------
    if ($requestedId !== '') {
        $stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :fid LIMIT 1");
        $stmt->execute([':fid' => $requestedId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลบุคลากรที่ระบุ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $facultyId = (string)$row['faculty_id'];
        $picture = facultyDirectoryResolveFile($row['profile_picture'] ?? null);

        echo json_encode([
            "status" => "success",
            "data"   => [
                "faculty_id"         => $facultyId,
                "name"               => facultyDirectoryFullName($row),
                "title"              => $row['title'] ?? null,
                "first_name_th"      => $row['first_name_th'] ?? null,
                "last_name_th"       => $row['last_name_th'] ?? null,
                "name_en"            => trim(($row['first_name_en'] ?? '') . ' ' . ($row['last_name_en'] ?? '')) ?: null,
                "gender"             => $row['gender'] ?? null,
                "birth_date"         => $row['birth_date'] ?? null,
                "email"              => $row['email'] ?? null,
                "phone"              => $row['phone'] ?? null,
                "current_address"    => $row['current_address'] ?? null,
                "positions"          => $positionsByFaculty[$facultyId] ?? [],
                "status"             => $row['status'] ?? null,
                "start_work_date"    => $row['start_work_date'] ?? null,
                "academic_position_date" => $row['academic_position_date'] ?? null,
                "nursing_council_no" => $row['nursing_council_no'] ?? null,
                "license_expiry"     => $row['license_expiry'] ?? null,
                "profile_picture"    => $picture['url'] ?? null,
                "documents"          => facultyDirectoryDocuments($db, $row),
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ---------- รายชื่อทั้งหมด ----------
    $rows = $db->query("
        SELECT faculty_id, title, first_name_th, last_name_th, profile_picture, status, license_expiry
        FROM faculty
        ORDER BY first_name_th ASC, last_name_th ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    $faculty = [];
    foreach ($rows as $row) {
        $facultyId = (string)$row['faculty_id'];
        $picture = facultyDirectoryResolveFile($row['profile_picture'] ?? null);

        $faculty[] = [
            "faculty_id"      => $facultyId,
            "name"            => facultyDirectoryFullName($row),
            "positions"       => $positionsByFaculty[$facultyId] ?? [],
            "status"          => $row['status'] ?? null,
            "license_expiry"  => $row['license_expiry'] ?? null,
            "profile_picture" => $picture['url'] ?? null,
        ];
    }

    echo json_encode([
        "status" => "success",
        "data"   => ["faculty" => $faculty, "total" => count($faculty)],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[FacultyDirectory] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "ไม่สามารถโหลดข้อมูลบุคลากรได้ กรุณาลองใหม่อีกครั้ง",
    ], JSON_UNESCAPED_UNICODE);
}
