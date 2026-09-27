<?php
require_once __DIR__ . '/../../Auth/password_helpers.php';

function userAccountPasswordFromBirthDate(?string $birthDate): ?string {
    if ($birthDate === null || trim($birthDate) === '') {
        return null;
    }

    $ts = strtotime($birthDate);
    if ($ts === false) {
        return null;
    }

    return date('dmY', $ts);
}

function normalizeUserAccountImportKeys(array $keys): array {
    $normalized = [];
    foreach ($keys as $key) {
        $value = trim((string)$key);
        if ($value !== '') {
            $normalized[$value] = true;
        }
    }
    return array_keys($normalized);
}

function getImportedUserAccountCandidates(PDO $db, string $importType, array $keys): array {
    $keys = normalizeUserAccountImportKeys($keys);
    if (empty($keys)) {
        return [];
    }

    $config = [
        'teachers' => ['table' => 'faculty', 'column' => 'faculty_id', 'source' => 'faculty'],
        'students' => ['table' => 'student', 'column' => 'student_id', 'source' => 'student'],
    ][$importType] ?? null;

    if ($config === null) {
        return [];
    }

    $rows = [];
    foreach (array_chunk($keys, 500) as $chunk) {
        $placeholders = implode(', ', array_fill(0, count($chunk), '?'));
        $sql = "
            SELECT CAST({$config['column']} AS CHAR) AS username,
                   birth_date,
                   '{$config['source']}' AS source
            FROM {$config['table']}
            WHERE {$config['column']} IN ({$placeholders})
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute($chunk);
        $rows = array_merge($rows, $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
    }

    return $rows;
}

function ensureImportedStudentAccountLinks(PDO $db, int $userId, string $studentId): void {
    $positionStmt = $db->prepare("
        INSERT INTO user_position (user_id, position_id, is_primary)
        SELECT :user_id, 8, 1
        WHERE NOT EXISTS (
            SELECT 1
            FROM user_position
            WHERE user_id = :existing_user_id
              AND position_id = 8
        )
    ");
    $positionStmt->execute([
        ':user_id' => $userId,
        ':existing_user_id' => $userId,
    ]);

    $primaryPositionStmt = $db->prepare("
        UPDATE user_position
        SET is_primary = 1
        WHERE user_id = :user_id
          AND position_id = 8
    ");
    $primaryPositionStmt->execute([':user_id' => $userId]);

    $studentUserLinkStmt = $db->prepare("
        UPDATE student
        SET user_id = :user_id
        WHERE student_id = :student_id
          AND (user_id IS NULL OR user_id <> :same_user_id)
    ");
    $studentUserLinkStmt->execute([
        ':user_id' => $userId,
        ':student_id' => $studentId,
        ':same_user_id' => $userId,
    ]);
}

function createUserAccountsFromRows(PDO $db, array $rows, array $sourceRoleMap): array {
    $summary = [
        'created' => 0,
        'facultyCount' => 0,
        'studentCount' => 0,
        'skippedExisting' => 0,
        'skippedNoBirth' => 0,
        'skippedInvalid' => 0,
    ];

    if (empty($rows)) {
        return $summary;
    }

    $existsStmt = $db->prepare("SELECT user_id, role_id FROM users WHERE username = :username LIMIT 1");
    $insertStmt = $db->prepare("
        INSERT INTO users (username, password_hash, role_id)
        VALUES (:username, :password_hash, :role_id)
    ");

    $startedTransaction = !$db->inTransaction();
    if ($startedTransaction) {
        $db->beginTransaction();
    }

    try {
        foreach ($rows as $row) {
            $username = trim((string)($row['username'] ?? ''));
            $source = (string)($row['source'] ?? '');

            if ($username === '' || !array_key_exists($source, $sourceRoleMap)) {
                $summary['skippedInvalid']++;
                continue;
            }

            $existsStmt->execute([':username' => $username]);
            $existingUser = $existsStmt->fetch(PDO::FETCH_ASSOC);
            if ($existingUser !== false) {
                if ($source === 'student' && (int)($existingUser['role_id'] ?? 0) === 3) {
                    ensureImportedStudentAccountLinks($db, (int)$existingUser['user_id'], $username);
                }
                $summary['skippedExisting']++;
                continue;
            }

            $plainPassword = userAccountPasswordFromBirthDate($row['birth_date'] ?? null);
            if ($plainPassword === null) {
                $summary['skippedNoBirth']++;
                continue;
            }

            $insertStmt->bindValue(':username', $username, PDO::PARAM_STR);
            $insertStmt->bindValue(':password_hash', hashAuthPassword($plainPassword), PDO::PARAM_STR);
            if ($sourceRoleMap[$source] === null) {
                $insertStmt->bindValue(':role_id', null, PDO::PARAM_NULL);
            } else {
                $insertStmt->bindValue(':role_id', (int)$sourceRoleMap[$source], PDO::PARAM_INT);
            }
            $insertStmt->execute();
            $createdUserId = (int)$db->lastInsertId();

            $summary['created']++;
            if ($source === 'faculty') {
                $summary['facultyCount']++;
            } elseif ($source === 'student') {
                ensureImportedStudentAccountLinks($db, $createdUserId, $username);
                $summary['studentCount']++;
            }
        }

        if ($startedTransaction) {
            $db->commit();
        }
    } catch (Exception $e) {
        if ($startedTransaction && $db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }

    return $summary;
}

function buildUserAccountCreationMessage(array $summary): string {
    $message = "สร้างบัญชี {$summary['created']} บัญชี";
    if (($summary['facultyCount'] ?? 0) || ($summary['studentCount'] ?? 0)) {
        $message .= " (อาจารย์ " . ($summary['facultyCount'] ?? 0) . ", นักศึกษา " . ($summary['studentCount'] ?? 0) . ")";
    }
    if (!empty($summary['skippedExisting'])) {
        $message .= ", มีบัญชีแล้ว {$summary['skippedExisting']}";
    }
    if (!empty($summary['skippedNoBirth'])) {
        $message .= ", ไม่มีวันเกิด {$summary['skippedNoBirth']}";
    }
    if (!empty($summary['skippedInvalid'])) {
        $message .= ", ข้อมูลไม่สมบูรณ์ {$summary['skippedInvalid']}";
    }
    return $message;
}
?>
