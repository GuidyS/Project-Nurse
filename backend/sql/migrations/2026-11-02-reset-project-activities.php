<?php
// Run manually from the backend container after a verified backup and project write pause:
// From the repository root, using a PHP runtime that can reach the configured database:
// php backend/sql/migrations/2026-11-02-reset-project-activities.php --confirm
if (PHP_SAPI !== 'cli' || !in_array('--confirm', $argv ?? [], true)) {
    fwrite(STDERR, "Refusing to run. Back up the database, pause project writes, then pass --confirm.\n");
    exit(2);
}

require_once __DIR__ . '/../../src/config/config.php';
require_once __DIR__ . '/../../src/components/Teacher/ProjectDocs/project_document_file_helpers.php';

function resetProjectActivitySnapshot(mixed $value): mixed
{
    if (!is_array($value)) return $value;
    if (($value['rowType'] ?? $value['row_type'] ?? null) === 'activity') return null;
    foreach ($value as $key => $child) {
        if ($key === 'activities') { $value[$key] = []; continue; }
        if ($key === 'totalActivities') { $value[$key] = 0; continue; }
        if ($key === 'has_sub_activities') { $value[$key] = false; continue; }
        if ($key === 'documents' && is_array($child)) {
            $value[$key] = array_values(array_filter($child, static fn($document): bool => !is_array($document) || ($document['report_document_type'] ?? '') !== 'activity_attachment'));
            continue;
        }
        $clean = resetProjectActivitySnapshot($child);
        if ($clean === null && is_int($key)) unset($value[$key]); else $value[$key] = $clean;
    }
    return array_is_list($value) ? array_values($value) : $value;
}

$db = new Connect();
$activityIds = $db->query("SELECT id FROM annual_project_report_items WHERE row_type='activity'")->fetchAll(PDO::FETCH_COLUMN);
$filePaths = [];
$documentCount = 0;
$budgetCount = 0;
if ($activityIds) {
    $placeholders = implode(',', array_fill(0, count($activityIds), '?'));
    $stmt = $db->prepare("SELECT COUNT(*) FROM project_documents WHERE report_item_id IN ({$placeholders})");
    $stmt->execute($activityIds);
    $documentCount = (int)$stmt->fetchColumn();
    $stmt = $db->prepare("SELECT COUNT(*) FROM annual_project_report_budgets WHERE report_item_id IN ({$placeholders})");
    $stmt->execute($activityIds);
    $budgetCount = (int)$stmt->fetchColumn();
    $stmt = $db->prepare("SELECT file_path FROM project_documents WHERE report_item_id IN ({$placeholders}) AND file_path IS NOT NULL");
    $stmt->execute($activityIds);
    $filePaths = $stmt->fetchAll(PDO::FETCH_COLUMN);
}
fwrite(STDOUT, "Before reset: activities=" . count($activityIds) . ", budgets={$budgetCount}, documents={$documentCount}\n");

$db->beginTransaction();
try {
    foreach ($db->query('SELECT academic_year,snapshot_json FROM project_report_snapshots FOR UPDATE')->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $snapshot = json_decode((string)$row['snapshot_json'], true, 512, JSON_THROW_ON_ERROR);
        $clean = resetProjectActivitySnapshot($snapshot);
        $stmt = $db->prepare('UPDATE project_report_snapshots SET snapshot_json=? WHERE academic_year=?');
        $stmt->execute([json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $row['academic_year']]);
    }
    foreach ($db->query('SELECT id,payload_json FROM project_merge_audit FOR UPDATE')->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $payload = json_decode((string)$row['payload_json'], true, 512, JSON_THROW_ON_ERROR);
        $clean = resetProjectActivitySnapshot($payload);
        $stmt = $db->prepare('UPDATE project_merge_audit SET payload_json=? WHERE id=?');
        $stmt->execute([json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $row['id']]);
    }
    if ($activityIds) {
        $placeholders = implode(',', array_fill(0, count($activityIds), '?'));
        $stmt = $db->prepare("DELETE FROM annual_project_report_budgets WHERE report_item_id IN ({$placeholders})");
        $stmt->execute($activityIds);
        $stmt = $db->prepare("DELETE FROM project_documents WHERE report_item_id IN ({$placeholders})");
        $stmt->execute($activityIds);
        $stmt = $db->prepare("DELETE FROM annual_project_report_items WHERE id IN ({$placeholders}) AND row_type='activity'");
        $stmt->execute($activityIds);
    }
    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    fwrite(STDERR, "Migration failed; database transaction rolled back.\n");
    exit(1);
}

foreach ($filePaths as $filePath) {
    try { project_document_delete_file((string)$filePath); }
    catch (Throwable $e) { fwrite(STDERR, "Warning: one stored activity file could not be removed safely.\n"); }
}
$remainingActivities = (int)$db->query("SELECT COUNT(*) FROM annual_project_report_items WHERE row_type='activity'")->fetchColumn();
$remainingBudgets = 0;
$remainingDocuments = 0;
if ($activityIds) {
    $placeholders = implode(',', array_fill(0, count($activityIds), '?'));
    $stmt = $db->prepare("SELECT COUNT(*) FROM annual_project_report_budgets WHERE report_item_id IN ({$placeholders})");
    $stmt->execute($activityIds);
    $remainingBudgets = (int)$stmt->fetchColumn();
    $stmt = $db->prepare("SELECT COUNT(*) FROM project_documents WHERE report_item_id IN ({$placeholders})");
    $stmt->execute($activityIds);
    $remainingDocuments = (int)$stmt->fetchColumn();
}
fwrite(STDOUT, "After reset: activities={$remainingActivities}, budgets={$remainingBudgets}, documents={$remainingDocuments}\n");
