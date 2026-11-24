<?php

function project_outcome_normalize_codes(mixed $values, string $label): array
{
    if (!is_array($values)) {
        throw new InvalidArgumentException("{$label}ต้องเป็นรายการรหัส");
    }

    $normalized = [];
    foreach ($values as $value) {
        if (!is_string($value) && !is_int($value)) {
            throw new InvalidArgumentException("{$label}ต้องเป็นข้อความ");
        }

        $code = trim((string)$value);
        if ($code === '') {
            continue;
        }
        if (mb_strlen($code, 'UTF-8') > 50) {
            throw new InvalidArgumentException("{$label}แต่ละรหัสต้องยาวไม่เกิน 50 ตัวอักษร");
        }

        $normalized[$code] = true;
    }

    $codes = array_keys($normalized);
    sort($codes, SORT_NATURAL | SORT_FLAG_CASE);
    return $codes;
}

/**
 * Replace only the supplied outcome types. Historical YLO rows are preserved
 * unless a caller explicitly supplies the ylo type.
 *
 * @param array<string,array<int,string>> $linksByType
 */
function project_outcome_replace_links(PDO $db, string $projectId, array $linksByType): void
{
    $allowedTypes = ['plo', 'clo', 'ylo'];
    if ($linksByType === []) {
        return;
    }

    $deleteStmt = $db->prepare(
        'DELETE FROM project_outcome_links WHERE project_id = :project_id AND outcome_type = :outcome_type'
    );
    $insertStmt = $db->prepare(
        'INSERT IGNORE INTO project_outcome_links (project_id, outcome_type, outcome_code)
         VALUES (:project_id, :outcome_type, :outcome_code)'
    );

    foreach ($linksByType as $outcomeType => $values) {
        if (!in_array($outcomeType, $allowedTypes, true)) {
            throw new InvalidArgumentException('ประเภทการเชื่อมโยงโครงการไม่ถูกต้อง');
        }

        $label = strtoupper($outcomeType) . ' ';
        $codes = project_outcome_normalize_codes($values, $label);
        $deleteStmt->execute([
            ':project_id' => $projectId,
            ':outcome_type' => $outcomeType,
        ]);

        foreach ($codes as $code) {
            $insertStmt->execute([
                ':project_id' => $projectId,
                ':outcome_type' => $outcomeType,
                ':outcome_code' => $code,
            ]);
        }
    }
}

function project_outcome_count_links(PDO $db, string $projectId, string $outcomeType): int
{
    if (!in_array($outcomeType, ['plo', 'clo'], true)) {
        throw new InvalidArgumentException('ประเภทการเชื่อมโยงโครงการไม่ถูกต้อง');
    }

    $stmt = $db->prepare(
        'SELECT COUNT(*) FROM project_outcome_links WHERE project_id = :project_id AND outcome_type = :outcome_type'
    );
    $stmt->execute([
        ':project_id' => $projectId,
        ':outcome_type' => $outcomeType,
    ]);
    return (int)$stmt->fetchColumn();
}

