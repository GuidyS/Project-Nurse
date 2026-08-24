<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
project_require_auth($db, ['PROJECT_LINKS_MANAGE']);
$input = project_payload();

try {
    if (!isset($input['project_id'], $input['links']) || !is_array($input['links'])) {
        project_json(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วนสำหรับการบันทึก"], 400);
        exit;
    }

    $projectId = (int) $input['project_id'];
    if ($projectId <= 0) {
        project_json(["status" => "error", "message" => "รหัสโครงการไม่ถูกต้อง"], 400);
        exit;
    }
    project_require_existing_project($db, $projectId);

    $links = $input['links'];
    $normalizeCodes = function ($value): array {
        if (!is_array($value)) {
            return [];
        }
        return array_values(array_unique(array_filter(array_map(function ($code) {
            $normalized = strtoupper(trim((string) $code));
            return preg_match('/^[A-Z0-9._-]+$/', $normalized) ? $normalized : '';
        }, $value))));
    };

    $normalizedLinks = [
        'plos' => $normalizeCodes($links['plos'] ?? []),
        'ylos' => $normalizeCodes($links['ylos'] ?? []),
        'clos' => $normalizeCodes($links['clos'] ?? []),
    ];

    $db->beginTransaction();

    $deleteStmt = $db->prepare("DELETE FROM project_outcome_links WHERE project_id = :project_id");
    $deleteStmt->execute([':project_id' => $projectId]);

    $insertStmt = $db->prepare("
        INSERT INTO project_outcome_links (project_id, outcome_type, outcome_code)
        VALUES (:project_id, :outcome_type, :outcome_code)
    ");

    foreach (['plos' => 'plo', 'ylos' => 'ylo', 'clos' => 'clo'] as $payloadKey => $outcomeType) {
        foreach ($normalizedLinks[$payloadKey] as $code) {
            $insertStmt->execute([
                ':project_id' => $projectId,
                ':outcome_type' => $outcomeType,
                ':outcome_code' => $code,
            ]);
        }
    }

    $updateStmt = $db->prepare("UPDATE project SET mapping_json = :mapping_json WHERE project_id = :project_id");
    $updateStmt->execute([
        ':mapping_json' => json_encode($normalizedLinks, JSON_UNESCAPED_UNICODE),
        ':project_id' => $projectId,
    ]);

    $db->commit();

    project_json(["status" => "success", "message" => "บันทึกข้อมูลเรียบร้อยแล้ว"]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    project_json(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
