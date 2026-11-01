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
// ใช้ตัวสร้างรายการเอกสาร/รูปโปรไฟล์ชุดเดียวกับหน้า "ข้อมูลส่วนตัว"
// ข้อมูลที่คณบดีเห็นจะได้ตรงกับที่เจ้าตัวเห็นเป๊ะ ๆ
require_once __DIR__ . '/../../ProfilePage/faculty_profile_helpers.php';

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
    // ส่งข้อมูลรูปแบบเดียวกับ endpoint "profile" ทุกประการ หน้าเว็บจะได้ใช้
    // component เดียวกับหน้า "ข้อมูลส่วนตัว" ซ้ำได้เลย แค่สลับเป็นโหมดดูอย่างเดียว
    if ($requestedId !== '') {
        $stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :fid LIMIT 1");
        $stmt->execute([':fid' => $requestedId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลบุคลากรที่ระบุ"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $facultyId = (string)$profile['faculty_id'];

        $profile['pdf_documents'] = buildFacultyDocuments($db, $profile);

        $stmtWL = $db->prepare("SELECT * FROM faculty_teaching_workloads WHERE faculty_id = :id ORDER BY uploaded_at DESC");
        $stmtWL->execute([':id' => $facultyId]);
        $profile['teaching_workloads'] = $stmtWL->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $stmtPD = $db->prepare("SELECT * FROM faculty_personnel_development WHERE faculty_id = :id ORDER BY training_date DESC");
        $stmtPD->execute([':id' => $facultyId]);
        $profile['personnel_developments'] = $stmtPD->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $profile['profile_picture_url'] = !empty($profile['profile_picture'])
            ? resolveFacultyProfilePictureUrl((string)$profile['profile_picture'], $facultyId)
            : null;

        // ข้อมูลเสริมที่หน้าทำเนียบใช้ แต่ของ endpoint profile ไม่มี
        $profile['username']  = $facultyId;
        $profile['positions'] = $positionsByFaculty[$facultyId] ?? [];

        echo json_encode([
            "status" => "success",
            "role"   => "teacher",
            "data"   => $profile,
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
