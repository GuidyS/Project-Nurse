<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/storage.php';

$apply = in_array('--apply', $argv, true);
$cleanup = in_array('--cleanup', $argv, true);
$retryDeletes = in_array('--retry-deletes', $argv, true);
$db = new Connect();
$stats = ['candidate' => 0, 'migrated' => 0, 'external' => 0, 'missing' => 0, 'skipped' => 0, 'cleaned' => 0, 'errors' => 0];

function migrateOutput(array $stats, bool $apply, string $mode): void
{
    echo json_encode(['mode' => $mode, 'apply' => $apply, 'summary' => $stats], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
}

function migrateOne(PDO $db, array $spec, bool $apply, array &$stats): ?string
{
    $reference = trim((string)($spec['reference'] ?? ''));
    if ($reference === '' || storageReferenceId($reference)) { $stats['skipped']++; return $reference ?: null; }
    if (preg_match('/^https:\/\//i', $reference)) { $stats['external']++; return $reference; }
    $stats['candidate']++;
    $absolute = storageLegacyAbsolutePath($reference);
    if (!$absolute) { $stats['missing']++; return null; }
    if (!$apply) return $reference;

    $existingStmt = $db->prepare("SELECT storage_id FROM storage_objects
        WHERE status='active' AND legacy_source='local' AND legacy_path=:legacy_path
          AND owner_type=:owner_type AND owner_id=:owner_id AND resource_type=:resource_type
          AND (resource_id <=> :resource_id)
        ORDER BY created_at DESC LIMIT 1");
    $existingStmt->execute([
        ':legacy_path'=>$reference, ':owner_type'=>$spec['owner_type'], ':owner_id'=>(string)$spec['owner_id'],
        ':resource_type'=>$spec['resource_type'], ':resource_id'=>isset($spec['resource_id']) ? (string)$spec['resource_id'] : null,
    ]);
    $existingId = $existingStmt->fetchColumn();
    if ($existingId) { $stats['skipped']++; return storageReference((string)$existingId); }

    try {
        $file = [
            'name' => $spec['name'] ?: basename($absolute), 'type' => mime_content_type($absolute) ?: 'application/octet-stream',
            'tmp_name' => $absolute, 'error' => UPLOAD_ERR_OK, 'size' => filesize($absolute),
        ];
        $stored = storagePutUploadedFile($db, $file, [
            'owner_type' => $spec['owner_type'], 'owner_id' => (string)$spec['owner_id'],
            'resource_type' => $spec['resource_type'], 'resource_id' => (string)$spec['resource_id'],
            'access_scope' => $spec['access_scope'], 'mime_type' => $file['type'], 'allow_local_source' => true,
        ]);
        $db->prepare("UPDATE storage_objects SET legacy_path=:legacy_path, legacy_source='local', migrated_at=NOW() WHERE storage_id=:id")
           ->execute([':legacy_path' => $reference, ':id' => $stored['id']]);
        $stats['migrated']++;
        return $stored['reference'];
    } catch (Throwable $e) {
        if (isset($stored['object_key'])) storageDeleteObjectKey($stored['object_key']);
        $stats['errors']++;
        return null;
    }
}

function migrateSimpleRows(PDO $db, string $query, array $mapping, bool $apply, array &$stats): void
{
    foreach ($db->query($query)->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $newReference = migrateOne($db, [
            'reference' => $row[$mapping['column']] ?? null,
            'name' => isset($mapping['name_column']) ? ($row[$mapping['name_column']] ?? null) : null,
            'owner_type' => $mapping['owner_type'], 'owner_id' => $row[$mapping['owner_column']],
            'resource_type' => $mapping['resource_type'], 'resource_id' => $row[$mapping['resource_column'] ?? $mapping['pk']],
            'access_scope' => $mapping['access_scope'],
        ], $apply, $stats);
        if ($apply && $newReference && $newReference !== $row[$mapping['column']]) {
            $sql = "UPDATE {$mapping['table']} SET {$mapping['column']}=:reference WHERE {$mapping['pk']}=:id";
            $db->prepare($sql)->execute([':reference' => $newReference, ':id' => $row[$mapping['pk']]]);
        }
    }
}

function migrateJsonColumn(PDO $db, string $table, string $pk, string $column, string $ownerColumn, string $ownerType, string $resourceType, string $accessScope, bool $apply, array &$stats): void
{
    $rows = $db->query("SELECT $pk,$ownerColumn,$column FROM $table WHERE $column IS NOT NULL AND $column<>''")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $references = json_decode((string)$row[$column], true);
        if (!is_array($references)) $references = [(string)$row[$column]];
        $changed = false;
        foreach ($references as $index => $reference) {
            if (!is_string($reference)) continue;
            $newReference = migrateOne($db, [
                'reference'=>$reference, 'name'=>basename($reference), 'owner_type'=>$ownerType,
                'owner_id'=>$row[$ownerColumn], 'resource_type'=>$resourceType,
                'resource_id'=>$row[$pk], 'access_scope'=>$accessScope,
            ], $apply, $stats);
            if ($apply && $newReference && $newReference !== $reference) {
                $references[$index] = $newReference;
                $changed = true;
            }
        }
        if ($changed) {
            $db->prepare("UPDATE $table SET $column=:value WHERE $pk=:id")
               ->execute([':value'=>json_encode(array_values($references), JSON_UNESCAPED_UNICODE), ':id'=>$row[$pk]]);
        }
    }
}

function migrateColumnExists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare('SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=:table AND column_name=:column LIMIT 1');
    $stmt->execute([':table'=>$table, ':column'=>$column]);
    return (bool)$stmt->fetchColumn();
}

if ($retryDeletes) {
    foreach ($db->query("SELECT storage_id,object_key FROM storage_objects WHERE status='pending_delete'")->fetchAll(PDO::FETCH_ASSOC) as $object) {
        $stats['candidate']++;
        if (!$apply) continue;
        try {
            storageClient()->deleteObject(['Bucket'=>storageConfig()['bucket'], 'Key'=>$object['object_key']]);
            $db->prepare("UPDATE storage_objects SET status='deleted',deleted_at=NOW() WHERE storage_id=:id")
               ->execute([':id'=>$object['storage_id']]);
            $stats['cleaned']++;
        } catch (Throwable $e) { $stats['errors']++; }
    }
    migrateOutput($stats, $apply, 'retry-deletes');
    exit($stats['errors'] ? 1 : 0);
}

if ($cleanup) {
    $before = null;
    foreach ($argv as $arg) if (str_starts_with($arg, '--before=')) $before = substr($arg, 9);
    $maxCutoff = new DateTimeImmutable('-30 days');
    $cutoff = $before ? DateTimeImmutable::createFromFormat('Y-m-d', $before) : $maxCutoff;
    if (!$cutoff || $cutoff > $maxCutoff) {
        fwrite(STDERR, "Cleanup cutoff must be a valid date at least 30 days ago.\n");
        exit(2);
    }
    $stmt = $db->prepare("SELECT * FROM storage_objects WHERE status='active' AND migrated_at IS NOT NULL AND migrated_at < :cutoff AND legacy_source IN ('local','blob')");
    $stmt->execute([':cutoff' => $cutoff->format('Y-m-d 23:59:59')]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $object) {
        $stats['candidate']++;
        if (!$apply) continue;
        try {
            $head = storageClient()->headObject(['Bucket' => storageConfig()['bucket'], 'Key' => $object['object_key']]);
            $remoteSha = strtolower((string)($head['Metadata']['sha256'] ?? ''));
            if ((int)($head['ContentLength'] ?? -1) !== (int)$object['size_bytes'] || !hash_equals((string)$object['sha256'], $remoteSha)) {
                throw new RuntimeException('Stored object verification failed');
            }
            if ($object['legacy_source'] === 'local') {
                $path = storageLegacyAbsolutePath($object['legacy_path']);
                if (!$path || !hash_equals((string)$object['sha256'], hash_file('sha256', $path))) {
                    throw new RuntimeException('Legacy local checksum verification failed');
                }
                if (!unlink($path)) throw new RuntimeException('Legacy local file could not be deleted');
            } elseif ($object['legacy_source'] === 'blob' && $object['resource_type'] === 'portfolio') {
                $blobStmt = $db->prepare('SELECT file_data FROM portfolio WHERE portfolio_id=:id LIMIT 1');
                $blobStmt->execute([':id'=>$object['resource_id']]);
                $blob = $blobStmt->fetchColumn();
                if ($blob === false || $blob === null || !hash_equals((string)$object['sha256'], hash('sha256', $blob))) {
                    throw new RuntimeException('Legacy BLOB checksum verification failed');
                }
                $db->prepare('UPDATE portfolio SET file_data=NULL WHERE portfolio_id=:id')->execute([':id' => $object['resource_id']]);
            }
            $db->prepare("UPDATE storage_objects SET legacy_path=NULL, legacy_source='none' WHERE storage_id=:id")
               ->execute([':id' => $object['storage_id']]);
            $stats['cleaned']++;
        } catch (Throwable $e) { $stats['errors']++; }
    }
    migrateOutput($stats, $apply, 'cleanup');
    exit($stats['errors'] ? 1 : 0);
}

$jobs = [
    ["SELECT id,student_id,file_path FROM student_course_registrations WHERE file_path IS NOT NULL AND file_path<>''", ['table'=>'student_course_registrations','pk'=>'id','column'=>'file_path','owner_type'=>'student','owner_column'=>'student_id','resource_type'=>'course_registration','access_scope'=>'student_advisor_admin']],
    ["SELECT id,student_id,evidence_file_path FROM student_vaccinations WHERE evidence_file_path IS NOT NULL AND evidence_file_path<>''", ['table'=>'student_vaccinations','pk'=>'id','column'=>'evidence_file_path','owner_type'=>'student','owner_column'=>'student_id','resource_type'=>'vaccination_evidence','access_scope'=>'student_advisor_admin']],
    ["SELECT id,faculty_id,file_path FROM faculty_teaching_workloads WHERE file_path IS NOT NULL AND file_path<>''", ['table'=>'faculty_teaching_workloads','pk'=>'id','column'=>'file_path','owner_type'=>'faculty','owner_column'=>'faculty_id','resource_type'=>'faculty_workload','access_scope'=>'owner_admin']],
    ["SELECT id,faculty_id,certificate_file FROM faculty_personnel_development WHERE certificate_file IS NOT NULL AND certificate_file<>''", ['table'=>'faculty_personnel_development','pk'=>'id','column'=>'certificate_file','owner_type'=>'faculty','owner_column'=>'faculty_id','resource_type'=>'faculty_training_certificate','access_scope'=>'owner_admin']],
    ["SELECT portfolio_id,student_id,file_path,file_name FROM portfolio WHERE file_path IS NOT NULL AND file_path<>''", ['table'=>'portfolio','pk'=>'portfolio_id','column'=>'file_path','name_column'=>'file_name','owner_type'=>'student','owner_column'=>'student_id','resource_type'=>'portfolio','access_scope'=>'student_advisor_admin']],
    ["SELECT d.id,d.project_id,d.file_path,d.file_name,COALESCE(p.responsible_faculty_id,u.username,'system') owner_id FROM project_documents d LEFT JOIN project p ON p.project_id=d.project_id LEFT JOIN users u ON u.user_id=d.uploaded_by WHERE d.file_path IS NOT NULL AND d.file_path<>''", ['table'=>'project_documents','pk'=>'id','resource_column'=>'project_id','column'=>'file_path','name_column'=>'file_name','owner_type'=>'faculty','owner_column'=>'owner_id','resource_type'=>'project_document','access_scope'=>'project_member_admin']],
];
foreach ($jobs as [$query, $mapping]) {
    try { migrateSimpleRows($db, $query, $mapping, $apply, $stats); } catch (Throwable $e) { $stats['errors']++; }
}

foreach ([
    ['license_first_attempt_evidence_path','license_first_attempt_evidence_name','student_license_first'],
    ['license_within_one_year_evidence_path','license_within_one_year_evidence_name','student_license_year'],
] as [$column,$nameColumn,$resource]) {
    try {
        migrateSimpleRows($db, "SELECT student_id,$column,$nameColumn FROM student WHERE $column IS NOT NULL AND $column<>''", [
            'table'=>'student','pk'=>'student_id','column'=>$column,'name_column'=>$nameColumn,'owner_type'=>'student',
            'owner_column'=>'student_id','resource_type'=>$resource,'access_scope'=>'student_advisor_admin'
        ], $apply, $stats);
    } catch (Throwable $e) { $stats['errors']++; }
}

foreach ([
    ['profile_picture','faculty_profile_picture'], ['nursing_council_file','faculty_nursing_council'],
    ['license_file','faculty_license'], ['teaching_cert_file','faculty_teaching_certificate'],
    ['license_image','faculty_license_image'],
] as [$column,$resource]) {
    try {
        migrateSimpleRows($db, "SELECT faculty_id,$column FROM faculty WHERE $column IS NOT NULL AND $column<>''", [
            'table'=>'faculty','pk'=>'faculty_id','column'=>$column,'owner_type'=>'faculty','owner_column'=>'faculty_id',
            'resource_type'=>$resource,'access_scope'=>'owner_admin'
        ], $apply, $stats);
    } catch (Throwable $e) { $stats['errors']++; }
}

try { migrateJsonColumn($db, 'degree', 'degree_id', 'file_path', 'faculty_id', 'faculty', 'faculty_degree', 'owner_admin', $apply, $stats); } catch (Throwable $e) { $stats['errors']++; }
if (migrateColumnExists($db, 'student_health_records', 'evidence_images')) {
    try { migrateJsonColumn($db, 'student_health_records', 'id', 'evidence_images', 'student_id', 'student', 'health_evidence', 'student_advisor_admin', $apply, $stats); } catch (Throwable $e) { $stats['errors']++; }
}
if (migrateColumnExists($db, 'student_health_records', 'admission_health_check')) {
    try { migrateJsonColumn($db, 'student_health_records', 'id', 'admission_health_check', 'student_id', 'student', 'admission_health_evidence', 'student_advisor_admin', $apply, $stats); } catch (Throwable $e) { $stats['errors']++; }
}

try {
    foreach ($db->query("SELECT portfolio_id,student_id,file_name,mime_type,file_data FROM portfolio WHERE file_data IS NOT NULL AND (file_path IS NULL OR file_path='')")->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $stats['candidate']++;
        if (!$apply) continue;
        unset($stored);
        $existingStmt = $db->prepare("SELECT storage_id FROM storage_objects WHERE status='active' AND legacy_source='blob' AND resource_type='portfolio' AND resource_id=:id ORDER BY created_at DESC LIMIT 1");
        $existingStmt->execute([':id'=>(string)$row['portfolio_id']]);
        $existingId = $existingStmt->fetchColumn();
        if ($existingId) {
            $db->prepare('UPDATE portfolio SET file_path=:reference WHERE portfolio_id=:id')->execute([':reference'=>storageReference((string)$existingId), ':id'=>$row['portfolio_id']]);
            $stats['skipped']++;
            continue;
        }
        $tmp = tempnam(sys_get_temp_dir(), 'nurse-mis-');
        try {
            file_put_contents($tmp, $row['file_data']);
            $file = ['name'=>$row['file_name'] ?: 'evidence.bin','type'=>$row['mime_type'] ?: 'application/octet-stream','tmp_name'=>$tmp,'error'=>UPLOAD_ERR_OK,'size'=>filesize($tmp)];
            $stored = storagePutUploadedFile($db, $file, ['owner_type'=>'student','owner_id'=>$row['student_id'],'resource_type'=>'portfolio','resource_id'=>$row['portfolio_id'],'access_scope'=>'student_advisor_admin','mime_type'=>$file['type'],'allow_local_source'=>true]);
            $db->prepare("UPDATE storage_objects SET legacy_source='blob',migrated_at=NOW() WHERE storage_id=:id")->execute([':id'=>$stored['id']]);
            $db->prepare('UPDATE portfolio SET file_path=:reference WHERE portfolio_id=:id')->execute([':reference'=>$stored['reference'],':id'=>$row['portfolio_id']]);
            $stats['migrated']++;
        } catch (Throwable $e) {
            if (isset($stored['object_key'])) storageDeleteObjectKey($stored['object_key']);
            $stats['errors']++;
        } finally { if (is_file($tmp)) unlink($tmp); }
    }
} catch (Throwable $e) { $stats['errors']++; }

migrateOutput($stats, $apply, 'migration');
exit($stats['errors'] ? 1 : 0);
