<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../CLOPage/clo_access_helpers.php';

function documentAccessRole(PDO $db, $userId): ?int
{
    $role = cloAccessRoleId($db, $userId);
    return in_array($role, [1, 2], true) ? $role : null;
}

function documentAccessDeleteIdentity(PDO $db, $userId): array
{
    if (documentAccessRole($db, $userId) === 1) {
        return ['admin' => true, 'faculty_id' => null, 'legacy_name' => null];
    }
    $facultyId = cloAccessFacultyId($db, $userId);
    if ($facultyId === null) return ['admin' => false, 'faculty_id' => null, 'legacy_name' => null];

    // Older records stored the display name instead of faculty_id.
    $stmt = $db->prepare("SELECT TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, '')))
        FROM faculty WHERE faculty_id = :faculty_id LIMIT 1");
    $stmt->execute([':faculty_id' => $facultyId]);
    $name = trim((string)($stmt->fetchColumn() ?: ''));
    if ($name !== '') {
        $unique = $db->prepare("SELECT COUNT(*) FROM faculty
            WHERE TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) = :name");
        $unique->execute([':name' => $name]);
        if ((int)$unique->fetchColumn() !== 1) $name = '';
    }
    return ['admin' => false, 'faculty_id' => $facultyId, 'legacy_name' => $name ?: null];
}

function documentAccessCanDelete(PDO $db, $userId, array $document, ?array $identity = null): bool
{
    $identity ??= documentAccessDeleteIdentity($db, $userId);
    if ($identity['admin']) return true;
    $owner = trim((string)($document['responsible_teacher'] ?? ''));
    return $owner !== '' && (
        ($identity['faculty_id'] !== null && hash_equals($identity['faculty_id'], $owner))
        || ($identity['legacy_name'] !== null && hash_equals($identity['legacy_name'], $owner))
    );
}
