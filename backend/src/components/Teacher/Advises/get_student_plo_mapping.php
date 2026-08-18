<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$advisorUserId = $_SESSION['user_id'] ?? null;
$studentId = trim($_GET['student_id'] ?? '');
$yearLevel = (int)($_GET['year_level'] ?? 0);

if (!$advisorUserId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

if ($studentId === '' || $yearLevel < 1) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing student_id or year_level"]);
    exit();
}

function ensureStudentPloMappingTable(PDO $db): void
{
    $db->exec("
        CREATE TABLE IF NOT EXISTS student_plo_mapping_records (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(20) NOT NULL,
            year_level INT NOT NULL,
            advisor_user_id BIGINT NOT NULL,
            mapping_json JSON NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_student_plo_mapping_lookup (student_id, year_level, advisor_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function advisorCanAccessStudent(PDO $db, int $advisorUserId, string $studentId): bool
{
    $sql = "
        SELECT 1
        FROM student s
        JOIN student_advisor_mapping sam ON s.student_id = sam.student_id
        JOIN faculty f ON sam.faculty_id = f.faculty_id
        JOIN users u ON CAST(u.username AS CHAR) = CAST(f.faculty_id AS CHAR)
        WHERE u.user_id = :advisor_user_id
          AND (
              CAST(IF(s.student_code LIKE 'TEMP-%', s.student_id, s.student_code) AS CHAR) = :student_code
              OR CAST(s.student_id AS CHAR) = :student_pk
          )
        LIMIT 1
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':advisor_user_id' => $advisorUserId,
        ':student_code' => $studentId,
        ':student_pk' => $studentId,
    ]);
    return (bool)$stmt->fetchColumn();
}

try {
    $db = new Connect();
    ensureStudentPloMappingTable($db);

    if (!advisorCanAccessStudent($db, (int)$advisorUserId, $studentId)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit();
    }

    $stmt = $db->prepare("
        SELECT mapping_json
        FROM student_plo_mapping_records
        WHERE student_id = :student_id
          AND year_level = :year_level
          AND advisor_user_id = :advisor_user_id
        ORDER BY updated_at DESC, id DESC
        LIMIT 1
    ");
    $stmt->execute([
        ':student_id' => $studentId,
        ':year_level' => $yearLevel,
        ':advisor_user_id' => $advisorUserId,
    ]);

    $mappingJson = $stmt->fetchColumn();
    $mapping = $mappingJson ? json_decode($mappingJson, true) : null;

    echo json_encode([
        "status" => "success",
        "data" => [
            "mapping" => is_array($mapping) ? $mapping : null,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
