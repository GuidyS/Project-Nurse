<?php

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;

function project_import_definitions(): array
{
    return [
        'projects' => [
            'sheet' => 'โครงการ',
            'required' => ['project_id', 'project_name_th', 'responsible_faculty_id', 'academic_year'],
            'dates' => ['start_date', 'end_date'],
            'aliases' => [
                'project_id' => ['project_id', 'รหัสโครงการ'],
                'project_name_th' => ['project_name_th', 'ชื่อโครงการ'],
                'responsible_faculty_id' => ['responsible_faculty_id', 'รหัสผู้ดำเนินโครงการ'],
                'academic_year' => ['academic_year', 'ปีการศึกษา'],
                'project_type' => ['project_type', 'ประเภทโครงการ'],
                'strategy' => ['strategy', 'ยุทธศาสตร์'],
                'status' => ['status', 'สถานะ'],
                'start_date' => ['start_date', 'วันที่เริ่มต้น'],
                'end_date' => ['end_date', 'วันที่สิ้นสุด'],
                'member_faculty_ids' => ['member_faculty_ids', 'รหัสผู้ร่วมโครงการ'],
                'plan_name' => ['plan_name', 'แผนงาน'],
                'objective' => ['objective', 'วัตถุประสงค์'],
                'kpi' => ['kpi', 'KPI'],
                'sort_order' => ['sort_order', 'ลำดับรายงาน'],
            ],
        ],
        'activities' => [
            'sheet' => 'กิจกรรมย่อย',
            'required' => ['project_id', 'activity_code', 'activity_name'],
            'dates' => [],
            'aliases' => [
                'project_id' => ['project_id', 'รหัสโครงการ'],
                'activity_code' => ['activity_code', 'รหัสกิจกรรม'],
                'activity_name' => ['activity_name', 'ชื่อกิจกรรม'],
                'responsible_person' => ['responsible_person', 'ผู้รับผิดชอบกิจกรรม'],
                'plan_name' => ['plan_name', 'แผนงาน'],
                'objective' => ['objective', 'วัตถุประสงค์'],
                'kpi' => ['kpi', 'KPI'],
                'sort_order' => ['sort_order', 'ลำดับกิจกรรม'],
            ],
        ],
        'budgets' => [
            'sheet' => 'งบประมาณ',
            'required' => ['project_id', 'source_key'],
            'dates' => [],
            'aliases' => [
                'project_id' => ['project_id', 'รหัสโครงการ'],
                'activity_code' => ['activity_code', 'รหัสกิจกรรม'],
                'source_key' => ['budget_source', 'source_key', 'แหล่งงบประมาณ'],
                'proposed' => ['budget_proposed', 'proposed', 'งบเสนอ'],
                'actual' => ['budget_spent', 'actual', 'งบใช้จริง'],
                'note' => ['budget_note', 'note', 'หมายเหตุงบประมาณ'],
            ],
        ],
    ];
}

function project_import_header_map(array $headers, array $definition): array
{
    $available = buildHeaderMap($headers);
    $map = [];
    foreach ($definition['aliases'] as $field => $aliases) {
        foreach ($aliases as $alias) {
            $key = normalizeHeader($alias);
            if (array_key_exists($key, $available)) {
                $map[$field] = $available[$key];
                break;
            }
        }
    }
    $missing = array_values(array_filter(
        $definition['required'],
        static fn(string $field): bool => !array_key_exists($field, $map)
    ));
    if ($missing) {
        $labels = array_map(static fn(string $field): string => $definition['aliases'][$field][1] ?? $field, $missing);
        throw new InvalidArgumentException("ชีต {$definition['sheet']} ขาดคอลัมน์ " . implode(', ', $labels));
    }
    return $map;
}

function project_import_row(array $values, array $cells, array $map, array $definition, int $rowNumber): ?array
{
    $record = ['__row' => $rowNumber, '__sheet' => $definition['sheet']];
    $hasValue = false;
    foreach ($definition['aliases'] as $field => $_aliases) {
        if (!array_key_exists($field, $map)) {
            $record[$field] = null;
            continue;
        }
        $index = $map[$field];
        $raw = $values[$index] ?? null;
        $text = $raw === null ? '' : trim((string)$raw);
        if ($text === '') {
            $record[$field] = null;
            continue;
        }
        $hasValue = true;
        $record[$field] = in_array($field, $definition['dates'], true)
            ? normalizeImportedDateValue($raw, $definition['aliases'][$field][1] ?? $field, $rowNumber, $cells[$index] ?? null)
            : $text;
    }
    return $hasValue ? $record : null;
}

function project_import_sheet_rows($worksheet, array $definition): array
{
    $highestColumnIndex = Coordinate::columnIndexFromString($worksheet->getHighestColumn());
    $headers = [];
    for ($column = 1; $column <= $highestColumnIndex; $column++) {
        $headers[] = $worksheet->getCell(Coordinate::stringFromColumnIndex($column) . '1')->getValue();
    }
    $map = project_import_header_map($headers, $definition);
    $rows = [];
    for ($row = 2; $row <= $worksheet->getHighestRow(); $row++) {
        $values = [];
        $cells = [];
        for ($column = 1; $column <= $highestColumnIndex; $column++) {
            $cell = $worksheet->getCell(Coordinate::stringFromColumnIndex($column) . $row);
            $cells[] = $cell;
            $values[] = $cell->getValue();
        }
        $record = project_import_row($values, $cells, $map, $definition, $row);
        if ($record !== null) $rows[] = $record;
    }
    return $rows;
}

function project_import_csv_rows(string $filePath, array $definition): array
{
    $handle = fopen($filePath, 'r');
    if ($handle === false) throw new RuntimeException('ไม่สามารถอ่านไฟล์ CSV ได้');
    try {
        $headers = fgetcsv($handle, 0, ',');
        if ($headers === false) throw new InvalidArgumentException('ไม่พบหัวตารางในไฟล์นำเข้า');
        $map = project_import_header_map($headers, $definition);
        $rows = [];
        $rowNumber = 1;
        while (($values = fgetcsv($handle, 0, ',')) !== false) {
            $rowNumber++;
            $record = project_import_row($values, [], $map, $definition, $rowNumber);
            if ($record !== null) $rows[] = $record;
        }
        return $rows;
    } finally {
        fclose($handle);
    }
}

function project_import_error(array $row, string $message): never
{
    throw new InvalidArgumentException("ชีต {$row['__sheet']} แถว {$row['__row']}: {$message}");
}

function project_import_conflict(array $row, string $message): never
{
    throw new ProjectConflict("ชีต {$row['__sheet']} แถว {$row['__row']}: {$message}");
}

function project_import_required(array $row, string $field, string $label): string
{
    $value = trim((string)($row[$field] ?? ''));
    if ($value === '') project_import_error($row, "กรุณาระบุ{$label}");
    return $value;
}

function project_import_positive_id(array $row, string $field, string $label): int
{
    $value = filter_var(project_import_required($row, $field, $label), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($value === false) project_import_error($row, "{$label}ต้องเป็นจำนวนเต็มบวก");
    return (int)$value;
}

function project_import_sort_order(array $row, string $field): ?int
{
    if (($row[$field] ?? null) === null) return null;
    $value = filter_var($row[$field], FILTER_VALIDATE_INT);
    if ($value === false || $value < 0 || $value > 2147483647) project_import_error($row, 'ลำดับต้องเป็นจำนวนเต็มที่ไม่ติดลบ');
    return (int)$value;
}

function project_import_choice(array $row, string $field, array $choices, string $label, ?string $default = null): ?string
{
    $value = trim((string)($row[$field] ?? ''));
    if ($value === '') return $default;
    $normalized = mb_strtolower($value, 'UTF-8');
    foreach ($choices as $key => $aliases) {
        foreach (array_merge([$key], $aliases) as $alias) {
            if ($normalized === mb_strtolower($alias, 'UTF-8')) return $key;
        }
    }
    project_import_error($row, "{$label}ไม่ถูกต้อง");
}

function project_import_project_type(array $row, bool $created): ?string
{
    return project_import_choice($row, 'project_type', [
        'academic_service' => ['บริการวิชาการ'],
        'culture' => ['ทำนุบำรุงศิลปวัฒนธรรม'],
        'teaching' => ['การเรียนการสอน'],
        'research' => ['วิจัย'],
        'quality_assurance' => ['การประกันคุณภาพ'],
        'other' => ['อื่น ๆ', 'อื่นๆ', 'อื่น ๆ / ยังไม่จำแนก'],
    ], 'ประเภทโครงการ', $created ? 'other' : null);
}

function project_import_status(array $row, bool $created): ?string
{
    return project_import_choice($row, 'status', [
        'active' => ['กำลังดำเนินการ'],
        'completed' => ['เสร็จสิ้น'],
    ], 'สถานะโครงการ', $created ? 'active' : null);
}

function project_import_strategy(array $row): ?string
{
    $value = trim((string)($row['strategy'] ?? ''));
    if ($value === '') return null;
    $allowed = [
        'ยุทธศาสตร์ที่ 1: Future Research & Innovation',
        'ยุทธศาสตร์ที่ 2: Future Education',
        'ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher',
        'ยุทธศาสตร์ที่ 4: Future System for Management',
        'ยุทธศาสตร์ที่ 5: Sustainable Future',
        'ยุทธศาสตร์ที่ 6: ทำนุบำรุงศิลปวัฒนธรรม',
    ];
    if (!in_array($value, $allowed, true)) project_import_error($row, 'ยุทธศาสตร์ไม่อยู่ในรายการที่รองรับ');
    return $value;
}

function project_import_members(PDO $db, array $row, int $owner): ?array
{
    if (($row['member_faculty_ids'] ?? null) === null) return null;
    $parts = preg_split('/[,;，\s]+/u', trim((string)$row['member_faculty_ids']), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    try {
        return my_project_normalize_member_faculty_ids($db, ['member_faculty_ids' => $parts], $owner);
    } catch (InvalidArgumentException $e) {
        project_import_error($row, $e->getMessage());
    }
}

function project_import_validate_faculty(PDO $db, array $row, int $facultyId): void
{
    if (!project_u_query($db, 'SELECT faculty_id FROM faculty WHERE faculty_id=?', [$facultyId])->fetchColumn()) {
        project_import_error($row, 'ไม่พบรหัสผู้ดำเนินโครงการในระบบ');
    }
}

function project_import_project(PDO $db, array $row): string
{
    try {
        $code = project_validate_code(project_import_required($row, 'project_id', 'รหัสโครงการ'));
        $year = project_u_year(project_import_required($row, 'academic_year', 'ปีการศึกษา'));
    } catch (InvalidArgumentException $e) {
        project_import_error($row, $e->getMessage());
    }
    $name = project_import_required($row, 'project_name_th', 'ชื่อโครงการ');
    if (mb_strlen($name, 'UTF-8') > 255) project_import_error($row, 'ชื่อโครงการต้องไม่เกิน 255 ตัวอักษร');
    $owner = project_import_positive_id($row, 'responsible_faculty_id', 'รหัสผู้ดำเนินโครงการ');
    project_import_validate_faculty($db, $row, $owner);

    $existing = project_u_query($db, 'SELECT * FROM project WHERE project_id=? FOR UPDATE', [$code])->fetch(PDO::FETCH_ASSOC);
    $created = !$existing;
    if ($existing) {
        $code = (string)$existing['project_id'];
        project_u_guard($db, $code);
        project_u_require_root($db, $code);
        if ((int)$existing['academic_year'] !== $year) project_import_conflict($row, 'โครงการปีใหม่ต้องใช้รหัสโครงการใหม่');
    } else project_u_lock_year($db, $year);

    $projectType = project_import_project_type($row, $created);
    $status = project_import_status($row, $created);
    $strategy = project_import_strategy($row);
    $startDate = $row['start_date'] ?? null;
    $endDate = $row['end_date'] ?? null;
    $effectiveStart = $startDate ?? ($existing['start_date'] ?? null);
    $effectiveEnd = $endDate ?? ($existing['end_date'] ?? null);
    if ($effectiveStart !== null && $effectiveEnd !== null && $effectiveEnd < $effectiveStart) project_import_error($row, 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น');
    $members = project_import_members($db, $row, $owner);
    if (!$created && $members === null) {
        $currentMembers = array_map('intval', project_u_query($db, 'SELECT faculty_id FROM project_faculty_members WHERE project_id=? ORDER BY faculty_id', [$code])->fetchAll(PDO::FETCH_COLUMN));
        $filteredMembers = array_values(array_filter($currentMembers, static fn(int $facultyId): bool => $facultyId !== $owner));
        if ($filteredMembers !== $currentMembers) $members = $filteredMembers;
    }

    if ($created) {
        $members ??= [];
        project_u_query($db, 'INSERT INTO project(project_id,project_name_th,project_type,mapping_json,responsible_faculty_id,academic_year,status,start_date,end_date,strategy) VALUES (?,?,?,?,?,?,?,?,?,?)', [
            $code, $name, $projectType, json_encode(['member_count' => count($members) + 1], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            $owner, $year, $status, $startDate, $endDate, $strategy,
        ]);
        project_u_link_new($db, $code);
        my_project_replace_faculty_members($db, $code, $members);
    } else {
        $fields = ['project_name_th=?', 'responsible_faculty_id=?'];
        $params = [$name, $owner];
        foreach (['project_type' => $projectType, 'status' => $status, 'strategy' => $strategy, 'start_date' => $startDate, 'end_date' => $endDate] as $field => $value) {
            if ($value !== null) { $fields[] = "{$field}=?"; $params[] = $value; }
        }
        if ($members !== null) {
            $fields[] = "mapping_json=JSON_SET(COALESCE(mapping_json,JSON_OBJECT()),'$.member_count',?)";
            $params[] = count($members) + 1;
        }
        $params[] = $code;
        project_u_query($db, 'UPDATE project SET ' . implode(',', $fields) . ' WHERE project_id=?', $params);
        if ($members !== null) my_project_replace_faculty_members($db, $code, $members);
    }

    $metadata = [];
    foreach (['plan_name', 'objective', 'kpi'] as $field) if (($row[$field] ?? null) !== null) $metadata[$field] = $row[$field];
    $sortOrder = project_import_sort_order($row, 'sort_order');
    if ($sortOrder !== null) $metadata['sort_order'] = $sortOrder;
    if ($metadata) project_u_metadata($db, $code, $metadata);
    return $code;
}

function project_import_resolve_project(PDO $db, array $row): array
{
    try { $requested = project_validate_code(project_import_required($row, 'project_id', 'รหัสโครงการ')); }
    catch (InvalidArgumentException $e) { project_import_error($row, $e->getMessage()); }
    try { $project = project_u_guard($db, $requested); $root = project_u_require_root($db, (string)$project['project_id']); }
    catch (ProjectConflict $e) { project_import_conflict($row, $e->getMessage()); }
    return [$project, $root];
}

function project_import_activity(PDO $db, array $row): array
{
    [$project, $root] = project_import_resolve_project($db, $row);
    try { $activityCode = project_u_activity_code(project_import_required($row, 'activity_code', 'รหัสกิจกรรม')); }
    catch (InvalidArgumentException $e) { project_import_error($row, $e->getMessage()); }
    $name = project_import_required($row, 'activity_name', 'ชื่อกิจกรรม');
    $existing = project_u_query($db, "SELECT * FROM annual_project_report_items WHERE parent_item_id=? AND activity_code=? AND row_type='activity' FOR UPDATE", [$root, $activityCode])->fetch(PDO::FETCH_ASSOC);
    $sortOrder = project_import_sort_order($row, 'sort_order');
    if ($existing) {
        $fields = ['activity_name=?', 'project_name=?'];
        $params = [$name, $name];
        foreach (['responsible_person', 'plan_name', 'objective', 'kpi'] as $field) {
            if (($row[$field] ?? null) !== null) { $fields[] = "{$field}=?"; $params[] = $row[$field]; }
        }
        if ($sortOrder !== null) { $fields[] = 'sort_order=?'; $params[] = $sortOrder; }
        $params[] = $existing['id'];
        project_u_query($db, 'UPDATE annual_project_report_items SET ' . implode(',', $fields) . ' WHERE id=?', $params);
        $id = (int)$existing['id'];
    } else {
        if ($sortOrder === null) $sortOrder = (int)project_u_query($db, 'SELECT COALESCE(MAX(sort_order),-1)+1 FROM annual_project_report_items WHERE parent_item_id=?', [$root])->fetchColumn();
        project_u_query($db, "INSERT INTO annual_project_report_items(academic_year,project_name,activity_name,activity_code,row_type,parent_item_id,responsible_person,plan_name,objective,kpi,sort_order) VALUES (?,?,?,?,'activity',?,?,?,?,?,?)", [
            $project['academic_year'], $name, $name, $activityCode, $root, $row['responsible_person'], $row['plan_name'], $row['objective'], $row['kpi'], $sortOrder,
        ]);
        $id = (int)$db->lastInsertId();
    }
    return [(string)$project['project_id'], $activityCode, $id];
}

function project_import_source(array $row): string
{
    $value = project_import_required($row, 'source_key', 'แหล่งงบประมาณ');
    if (array_key_exists($value, project_u_sources())) return $value;
    $matched = array_search($value, project_u_sources(), true);
    if ($matched === false) project_import_error($row, 'แหล่งงบประมาณไม่ถูกต้อง');
    return (string)$matched;
}

function project_import_budget(PDO $db, array $row): string
{
    [$project, $root] = project_import_resolve_project($db, $row);
    $activityCode = trim((string)($row['activity_code'] ?? ''));
    $item = $root;
    if ($activityCode !== '') {
        try { $activityCode = project_u_activity_code($activityCode); }
        catch (InvalidArgumentException $e) { project_import_error($row, $e->getMessage()); }
        $resolved = project_u_query($db, "SELECT id FROM annual_project_report_items WHERE parent_item_id=? AND activity_code=? AND row_type='activity'", [$root, $activityCode])->fetchColumn();
        if ($resolved === false) project_import_error($row, 'ไม่พบรหัสกิจกรรมในโครงการนี้');
        $item = (int)$resolved;
    }
    if (($row['proposed'] ?? null) === null && ($row['actual'] ?? null) === null) project_import_error($row, 'ต้องระบุงบเสนอหรืองบใช้จริงอย่างน้อยหนึ่งค่า');
    $source = project_import_source($row);
    $budgets = project_u_budget($db, $item);
    $cell = $budgets[$source] ?? [];
    try {
        foreach (['proposed', 'actual'] as $type) if (($row[$type] ?? null) !== null) $cell[$type] = project_u_number(project_u_cents($row[$type]));
    } catch (InvalidArgumentException $e) { project_import_error($row, $e->getMessage()); }
    if (($row['note'] ?? null) !== null) $cell['note'] = trim((string)$row['note']);
    $budgets[$source] = $cell;
    project_u_write_budget($db, $item, $budgets);
    return (string)$project['project_id'];
}

function project_import_unique_rows(array $rows, array $fields, string $label): void
{
    $seen = [];
    foreach ($rows as $row) {
        $parts = [];
        foreach ($fields as $field) $parts[] = mb_strtolower(trim((string)($row[$field] ?? '')), 'UTF-8');
        $key = implode("\x1F", $parts);
        if (isset($seen[$key])) project_import_error($row, "{$label}ซ้ำกับแถว {$seen[$key]}");
        $seen[$key] = $row['__row'];
    }
}

function processProjectWorkbook(string $filePath, PDO $db, string $fileExt): array
{
    project_u_ready($db);
    $definitions = project_import_definitions();
    $rows = ['projects' => [], 'activities' => [], 'budgets' => []];
    if ($fileExt === 'csv') {
        $rows['projects'] = project_import_csv_rows($filePath, $definitions['projects']);
    } else {
        $spreadsheet = IOFactory::load($filePath);
        $projectSheet = $spreadsheet->getSheetByName($definitions['projects']['sheet']) ?: $spreadsheet->getActiveSheet();
        $rows['projects'] = project_import_sheet_rows($projectSheet, $definitions['projects']);
        foreach (['activities', 'budgets'] as $type) {
            $sheet = $spreadsheet->getSheetByName($definitions[$type]['sheet']);
            if ($sheet !== null) $rows[$type] = project_import_sheet_rows($sheet, $definitions[$type]);
        }
    }
    if (!$rows['projects'] && !$rows['activities'] && !$rows['budgets']) throw new InvalidArgumentException('ไม่พบข้อมูลโครงการในไฟล์');
    foreach ($rows['budgets'] as &$budgetRow) $budgetRow['source_key'] = project_import_source($budgetRow);
    unset($budgetRow);
    project_import_unique_rows($rows['projects'], ['project_id'], 'รหัสโครงการ');
    project_import_unique_rows($rows['activities'], ['project_id', 'activity_code'], 'รหัสกิจกรรมภายในโครงการ');
    project_import_unique_rows($rows['budgets'], ['project_id', 'activity_code', 'source_key'], 'รายการงบประมาณ');

    $db->beginTransaction();
    try {
        $codes = [];
        foreach ($rows['projects'] as $row) { $code = project_import_project($db, $row); $codes[mb_strtolower($code, 'UTF-8')] = $code; }
        foreach ($rows['activities'] as $row) { [$code] = project_import_activity($db, $row); $codes[mb_strtolower($code, 'UTF-8')] = $code; }
        $budgetCodes = [];
        foreach ($rows['budgets'] as $row) { $code = project_import_budget($db, $row); $codes[mb_strtolower($code, 'UTF-8')] = $code; $budgetCodes[mb_strtolower($code, 'UTF-8')] = $code; }
        foreach ($budgetCodes as $code) {
            $root = project_u_require_root($db, $code);
            project_u_validate_activity_budgets(project_u_budget($db, $root), project_u_activities($db, $root));
            project_u_sync_cache($db, $code);
        }
        foreach ($codes as $code) if (!isset($budgetCodes[mb_strtolower($code, 'UTF-8')])) project_u_sync_cache($db, $code);
        $db->commit();
        return [
            'recordCount' => count($rows['projects']) + count($rows['activities']) + count($rows['budgets']),
            'rowKeys' => array_values($codes),
            'counts' => ['projects' => count($rows['projects']), 'activities' => count($rows['activities']), 'budgets' => count($rows['budgets'])],
        ];
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        throw $e;
    }
}

