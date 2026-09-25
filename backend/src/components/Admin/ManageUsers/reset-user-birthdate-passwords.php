<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Auth/password_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';

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

    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "ไม่มีสิทธิ์รีเซ็ตรหัสผ่านผู้ใช้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /** @return string|null password DDMM + Gregorian year, or null if invalid */
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
        $year = (int)date('Y', $ts);
        return sprintf('%02d%02d%d', $day, $month, $year);
    };

    $stmt = $db->query(
        "SELECT
            u.user_id,
            u.username,
            CASE
                WHEN s.student_id IS NOT NULL THEN s.birth_date
                WHEN f.faculty_id IS NOT NULL THEN f.birth_date
                ELSE NULL
            END AS birth_date,
            CASE
                WHEN s.student_id IS NOT NULL THEN 'student'
                WHEN f.faculty_id IS NOT NULL THEN 'faculty'
                ELSE NULL
            END AS source
         FROM users u
         LEFT JOIN student s ON u.username = CAST(s.student_id AS CHAR)
         LEFT JOIN faculty f ON u.username = CAST(f.faculty_id AS CHAR)
         ORDER BY u.user_id"
    );
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updateStmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE user_id = :user_id");
    $updated = 0;
    $studentCount = 0;
    $facultyCount = 0;
    $skippedNoBirth = 0;
    $skippedUnmatched = 0;

    $db->beginTransaction();
    try {
        foreach ($users as $user) {
            $source = $user['source'] ?? null;
            if ($source !== 'student' && $source !== 'faculty') {
                $skippedUnmatched++;
                continue;
            }

            $plain = $passwordFromBirthDate($user['birth_date'] ?? null);
            if ($plain === null) {
                $skippedNoBirth++;
                continue;
            }

            $updateStmt->execute([
                ':hash' => hashAuthPassword($plain),
                ':user_id' => (int)$user['user_id'],
            ]);
            $updated++;

            if ($source === 'student') {
                $studentCount++;
            } else {
                $facultyCount++;
            }
        }
        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

    $message = "รีเซ็ตรหัสผ่านเป็นวันเกิดปี ค.ศ. สำเร็จ {$updated} บัญชี";
    logAudit(
        $db,
        $_SESSION['user_id'],
        'update',
        'users',
        "{$message} (นักศึกษา {$studentCount}, อาจารย์ {$facultyCount}, ไม่มีวันเกิด {$skippedNoBirth}, ไม่พบข้อมูลวันเกิด {$skippedUnmatched})"
    );

    echo json_encode([
        "status" => "success",
        "message" => $message,
        "updated" => $updated,
        "studentCount" => $studentCount,
        "facultyCount" => $facultyCount,
        "skippedNoBirth" => $skippedNoBirth,
        "skippedUnmatched" => $skippedUnmatched,
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
