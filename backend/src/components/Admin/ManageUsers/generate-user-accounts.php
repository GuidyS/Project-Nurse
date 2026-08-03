<?php
/**
 * Generate login accounts from faculty + student profiles.
 * username = faculty_id / student_id
 * password = birth_date as DDMM + Buddhist year (e.g. 1976-12-25 → 25122519)
 * role_id stays NULL for admin to assign later.
 */
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Auth/password_helpers.php';

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "ไม่มีสิทธิ์สร้างบัญชีผู้ใช้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /** @return string|null password DDMM + Buddhist year, or null if invalid */
    $passwordFromBirthDate = static function (?string $birthDate): ?string {
        if ($birthDate === null || trim($birthDate) === '') {
            return null;
        }
        $ts = strtotime($birthDate);
        if ($ts === false) {
            return null;
        }
        $day = (int)date('d', $ts);
        $month = (int)date('m', $ts);
        $beYear = (int)date('Y', $ts) + 543;
        return sprintf('%02d%02d%d', $day, $month, $beYear);
    };

    // Count skips: existing accounts + missing birth_date
    $skippedExisting = (int)$db->query(
        "SELECT (
            (SELECT COUNT(*) FROM faculty f
              WHERE EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(f.faculty_id AS CHAR)))
          + (SELECT COUNT(*) FROM student s
              WHERE EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(s.student_id AS CHAR)))
        ) AS c"
    )->fetchColumn();

    $skippedNoBirth = (int)$db->query(
        "SELECT (
            (SELECT COUNT(*) FROM faculty f
              WHERE f.birth_date IS NULL
                AND NOT EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(f.faculty_id AS CHAR)))
          + (SELECT COUNT(*) FROM student s
              WHERE s.birth_date IS NULL
                AND NOT EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(s.student_id AS CHAR)))
        ) AS c"
    )->fetchColumn();

    $candidatesStmt = $db->query(
        "SELECT CAST(f.faculty_id AS CHAR) AS username, f.birth_date AS birth_date, 'faculty' AS source
         FROM faculty f
         WHERE f.birth_date IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(f.faculty_id AS CHAR))
         UNION ALL
         SELECT CAST(s.student_id AS CHAR), s.birth_date, 'student'
         FROM student s
         WHERE s.birth_date IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM users u WHERE u.username = CAST(s.student_id AS CHAR))"
    );
    $candidates = $candidatesStmt->fetchAll(PDO::FETCH_ASSOC);

    $insertStmt = $db->prepare(
        "INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, NULL)"
    );

    $imported = 0;
    $facultyCount = 0;
    $studentCount = 0;
    $skippedInvalid = 0;

    $db->beginTransaction();
    try {
        foreach ($candidates as $row) {
            $username = trim((string)($row['username'] ?? ''));
            $plain = $passwordFromBirthDate($row['birth_date'] ?? null);

            if ($username === '' || $plain === null) {
                $skippedInvalid++;
                continue;
            }

            $hash = hashAuthPassword($plain);
            $insertStmt->execute([$username, $hash]);
            $imported++;

            if (($row['source'] ?? '') === 'faculty') {
                $facultyCount++;
            } else {
                $studentCount++;
            }
        }
        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

    $message = "สร้างบัญชีสำเร็จ {$imported} รายการ";
    if ($facultyCount || $studentCount) {
        $message .= " (อาจารย์ {$facultyCount}, นักศึกษา {$studentCount})";
    }

    echo json_encode([
        "status" => "success",
        "message" => $message,
        "imported" => $imported,
        "facultyCount" => $facultyCount,
        "studentCount" => $studentCount,
        "skippedExisting" => $skippedExisting,
        "skippedNoBirth" => $skippedNoBirth,
        "skippedInvalid" => $skippedInvalid,
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}