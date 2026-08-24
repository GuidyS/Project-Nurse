<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$advisorUserId = $_SESSION['user_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

if (!$advisorUserId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$studentId = trim($input['student_id'] ?? '');
$yearLevel = (int)($input['year_level'] ?? 0);
$mapping = $input['mapping'] ?? null;

if ($studentId === '' || $yearLevel < 1 || !is_array($mapping)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing student_id, year_level, or mapping"]);
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
          AND CAST(s.student_id AS CHAR) = :student_id
        LIMIT 1
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':advisor_user_id' => $advisorUserId,
        ':student_id' => $studentId,
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

    $mappingJson = json_encode($mapping, JSON_UNESCAPED_UNICODE);
    if ($mappingJson === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid mapping JSON"]);
        exit();
    }

    $existingStmt = $db->prepare("
        SELECT id
        FROM student_plo_mapping_records
        WHERE student_id = :student_id
          AND year_level = :year_level
          AND advisor_user_id = :advisor_user_id
        ORDER BY updated_at DESC, id DESC
        LIMIT 1
    ");
    $existingStmt->execute([
        ':student_id' => $studentId,
        ':year_level' => $yearLevel,
        ':advisor_user_id' => $advisorUserId,
    ]);
    $existingId = $existingStmt->fetchColumn();

    if ($existingId) {
        $stmt = $db->prepare("
            UPDATE student_plo_mapping_records
            SET mapping_json = :mapping_json,
                updated_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':mapping_json' => $mappingJson,
            ':id' => $existingId,
        ]);
        $recordId = (int)$existingId;
    } else {
        $stmt = $db->prepare("
            INSERT INTO student_plo_mapping_records
                (student_id, year_level, advisor_user_id, mapping_json, created_at, updated_at)
            VALUES
                (:student_id, :year_level, :advisor_user_id, :mapping_json, NOW(), NOW())
        ");
        $stmt->execute([
            ':student_id' => $studentId,
            ':year_level' => $yearLevel,
            ':advisor_user_id' => $advisorUserId,
            ':mapping_json' => $mappingJson,
        ]);
        $recordId = (int)$db->lastInsertId();
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "id" => $recordId,
            "student_id" => $studentId,
            "year_level" => $yearLevel,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>