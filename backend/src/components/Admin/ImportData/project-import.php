<?php

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;

function project_import_definitions(): array
{
    return [
        'projects' => [
            'sheet' => 'โครงการ',
            'required' => ['project_id'],
            'dates' => ['start_date', 'end_date'],
            'aliases' => [
                'project_id' => ['project_id', 'รหัสโครงการ'],
                'project_name_th' => ['project_name_th', 'ชื่อโครงการ'],
                'responsible_faculty_id' => ['responsible_faculty_id', 'รหัสผู้ดำเนินโครงการ', 'รหัสอาจารย์ผู้รับผิดชอบ', 'ผู้ดำเนินโครงการ'],
                'academic_year' => ['academic_year', 'ปีการศึกษา'],
                'project_type' => ['project_type', 'ประเภทโครงการ'],
                'strategy' => ['strategy', 'ยุทธศาสตร์'],
                'status' => ['status', 'สถานะ', 'สถานะโครงการ'],
                'start_date' => ['start_date', 'วันที่เริ่มต้น'],
                'end_date' => ['end_date', 'วันที่สิ้นสุด'],
                'member_faculty_ids' => ['member_faculty_ids', 'รหัสผู้เข้าร่วมโครงการ', 'รหัสผู้ร่วมโครงการ', 'ผู้เข้าร่วมโครงการ', 'ผู้ร่วมโครงการ'],
                'plo_codes' => ['plo_codes', 'รหัส PLO'],
                'clo_codes' => ['clo_codes', 'รหัส CLO'],
                'plan_name' => ['plan_name', 'แผนงาน'],
                'objective' => ['objective', 'วัตถุประสงค์'],
                'kpi' => ['kpi', 'KPI'],
                'sort_order' => ['sort_order', 'ลำดับรายงาน'],
                'activity_name' => ['activity_name', 'ชื่อกิจกรรม'],
                'google_drive_url' => ['google_drive_url', 'ลิงก์ Google Drive'],
                'university_proposed' => ['university_proposed', 'มหาวิทยาลัยสยาม - งบเสนอ'],
                'university_actual' => ['university_actual', 'มหาวิทยาลัยสยาม - งบใช้จริง'],
                'university_note' => ['university_note', 'มหาวิทยาลัยสยาม - หมายเหตุ'],
                'thonburiHospital_proposed' => ['thonburiHospital_proposed', 'โรงพยาบาลธนบุรี - งบเสนอ'],
                'thonburiHospital_actual' => ['thonburiHospital_actual', 'โรงพยาบาลธนบุรี - งบใช้จริง'],
                'thonburiHospital_note' => ['thonburiHospital_note', 'โรงพยาบาลธนบุรี - หมายเหตุ'],
                'nursingFaculty_proposed' => ['nursingFaculty_proposed', 'คณะพยาบาลศาสตร์ - งบเสนอ'],
                'nursingFaculty_actual' => ['nursingFaculty_actual', 'คณะพยาบาลศาสตร์ - งบใช้จริง'],
                'nursingFaculty_note' => ['nursingFaculty_note', 'คณะพยาบาลศาสตร์ - หมายเหตุ'],
                'external_proposed' => ['external_proposed', 'หน่วยงานภายนอก - งบเสนอ'],
                'external_actual' => ['external_actual', 'หน่วยงานภายนอก - งบใช้จริง'],
                'external_note' => ['external_note', 'หน่วยงานภายนอก - หมายเหตุ'],
                'unspecified_proposed' => ['unspecified_proposed', 'ยังไม่ระบุแหล่งเงิน - งบเสนอ'],
                'unspecified_actual' => ['unspecified_actual', 'ยังไม่ระบุแหล่งเงิน - งบใช้จริง'],
                'unspecified_note' => ['unspecified_note', 'ยังไม่ระบุแหล่งเงิน - หมายเหตุ'],
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
    $record = [
        '__row' => $rowNumber,
        '__sheet' => $definition['sheet'],
        '__present_fields' => array_fill_keys(array_keys($map), true),
    ];
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
    return project_import_faculty_id_value($row, project_import_required($row, $field, $label), $label);
}

function project_import_faculty_id_value(array $row, string $value, string $label): int
{
    $value = trim($value);
    if (!preg_match('/^(\d+)(?:\s*(?:-|–|—|·)\s*.+)?$/u', $value, $matches)) {
        project_import_error($row, "{$label}ต้องเป็นรหัสจำนวนเต็มบวก หรืออยู่ในรูป รหัส - ชื่อ-นามสกุล");
    }
    $facultyId = filter_var($matches[1], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($facultyId === false) project_import_error($row, "{$label}ต้องเป็นจำนวนเต็มบวก");
    return (int)$facultyId;
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
        'other' => ['อื่น ๆ', 'อื่นๆ', 'อื่น ๆ / ยังไม่จำแนก', 'อื่นๆ/ยังไม่จำแนก', 'อื่น ๆ/ยังไม่จำแนก'],
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
    if (!isset($row['__present_fields']['member_faculty_ids'])) return null;
    $value = trim((string)($row['member_faculty_ids'] ?? ''));
    if ($value === '') return [];

    $parts = preg_split('/[,;，\r\n]+/u', $value, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    if (count($parts) === 1 && preg_match('/^\d+(?:\s+\d+)+$/', trim($parts[0]))) {
        $parts = preg_split('/\s+/', trim($parts[0]), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }
    $facultyIds = array_map(
        static fn(string $part): int => project_import_faculty_id_value($row, $part, 'รหัสผู้เข้าร่วมโครงการ'),
        $parts
    );
    try {
        return my_project_normalize_member_faculty_ids($db, ['member_faculty_ids' => $facultyIds], $owner);
    } catch (InvalidArgumentException $e) {
        project_import_error($row, $e->getMessage());
    }
}

function project_import_outcome_codes(array $row, string $field, string $label): ?array
{
    if (!isset($row['__present_fields'][$field])) return null;

    $parts = preg_split('/[,;，\r\n]+/u', trim((string)($row[$field] ?? '')), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    try {
        return project_outcome_normalize_codes($parts, $label . ' ');
    } catch (InvalidArgumentException $e) {
        project_import_error($row, $e->getMessage());
    }
}

function project_import_resulting_outcome_count(PDO $db, string $projectId, string $type, ?array $importedCodes, bool $created): int
{
    if ($importedCodes !== null) return count($importedCodes);
    return $created ? 0 : project_outcome_count_links($db, $projectId, $type);
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
    $effectiveProjectType = $projectType ?? (string)$existing['project_type'];
    $status = project_import_status($row, $created);
    $strategy = project_import_strategy($row);
    $startDate = $row['start_date'] ?? null;
    $endDate = $row['end_date'] ?? null;
    $effectiveStart = $startDate ?? ($existing['start_date'] ?? null);
    $effectiveEnd = $endDate ?? ($existing['end_date'] ?? null);
    if ($effectiveStart !== null && $effectiveEnd !== null && $effectiveEnd < $effectiveStart) project_import_error($row, 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น');
    $members = project_import_members($db, $row, $owner);
    $ploCodes = project_import_outcome_codes($row, 'plo_codes', 'PLO');
    $cloCodes = project_import_outcome_codes($row, 'clo_codes', 'CLO');

    if ($effectiveProjectType !== 'academic_service') {
        $resultingLinkCount = project_import_resulting_outcome_count($db, $code, 'plo', $ploCodes, $created)
            + project_import_resulting_outcome_count($db, $code, 'clo', $cloCodes, $created);
        if ($resultingLinkCount > 0) {
            project_import_conflict($row, 'เชื่อม PLO/CLO ได้เฉพาะโครงการบริการวิชาการ หากเปลี่ยนประเภทต้องเว้นช่องรหัส PLO และ CLO ให้เป็นค่าว่างทั้งสองช่อง');
        }
    }

    if (!$created && $members === null) {
        $currentMembers = array_map('intval', project_u_query($db, 'SELECT faculty_id FROM project_faculty_members WHERE project_id=? ORDER BY faculty_id', [$code])->fetchAll(PDO::FETCH_COLUMN));
        $filteredMembers = array_values(array_filter($currentMembers, static fn(int $facultyId): bool => $facultyId !== $owner));
        if ($filteredMembers !== $currentMembers) $members = $filteredMembers;
    }

    if ($created) {
        $members ??= [];
        project_u_query($db, 'INSERT INTO project(project_id,project_name_th,project_type,responsible_faculty_id,academic_year,status,start_date,end_date,strategy) VALUES (?,?,?,?,?,?,?,?,?)', [
            $code, $name, $projectType, $owner, $year, $status, $startDate, $endDate, $strategy,
        ]);
        project_u_link_new($db, $code);
        my_project_replace_faculty_members($db, $code, $members);
    } else {
        $fields = ['project_name_th=?', 'responsible_faculty_id=?'];
        $params = [$name, $owner];
        foreach (['project_type' => $projectType, 'status' => $status, 'strategy' => $strategy, 'start_date' => $startDate, 'end_date' => $endDate] as $field => $value) {
            if ($value !== null) { $fields[] = "{$field}=?"; $params[] = $value; }
        }
        $params[] = $code;
        project_u_query($db, 'UPDATE project SET ' . implode(',', $fields) . ' WHERE project_id=?', $params);
        if ($members !== null) my_project_replace_faculty_members($db, $code, $members);
    }

    $outcomeReplacements = [];
    if ($ploCodes !== null) $outcomeReplacements['plo'] = $ploCodes;
    if ($cloCodes !== null) $outcomeReplacements['clo'] = $cloCodes;
    project_outcome_replace_links($db, $code, $outcomeReplacements);

    $metadata = [];
    foreach (['plan_name', 'objective', 'kpi'] as $field) if (($row[$field] ?? null) !== null) $metadata[$field] = $row[$field];
    $sortOrder = project_import_sort_order($row, 'sort_order');
    if ($sortOrder !== null) $metadata['sort_order'] = $sortOrder;
    if ($metadata) project_u_metadata($db, $code, $metadata);
    return $code;
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

function project_import_master_budget(PDO $db,string $code,array $row): int
{
    $root=project_u_require_root($db,$code); $budgets=project_u_budget($db,$root); $count=0;
    foreach (array_keys(project_u_sources()) as $source) {
        $proposed=$row[$source.'_proposed']??null; $actual=$row[$source.'_actual']??null; $note=$row[$source.'_note']??null;
        if ($proposed===null && $actual===null && $note===null) continue;
        $cell=$budgets[$source]??[];
        try {
            if ($proposed!==null) $cell['proposed']=project_u_number(project_u_cents($proposed));
            if ($actual!==null) $cell['actual']=project_u_number(project_u_cents($actual));
        } catch (InvalidArgumentException $e) { project_import_error($row,$e->getMessage()); }
        if ($note!==null) $cell['note']=trim((string)$note);
        $budgets[$source]=$cell; $count++;
    }
    if ($count>0) { project_u_write_budget($db,$root,$budgets); project_u_sync_cache($db,$code); }
    return $count;
}

function project_import_is_activity_row(array $row): bool
{
    return ($row['activity_name']??null)!==null || ($row['google_drive_url']??null)!==null;
}

function project_import_validate_activity_row(array $row): void
{
    $name=trim((string)($row['activity_name']??'')); $url=trim((string)($row['google_drive_url']??''));
    if ($name==='' || $url==='') project_import_error($row,'แถวกิจกรรมต้องระบุชื่อกิจกรรมและลิงก์ Google Drive ให้ครบ');
    $activityFields=['activity_name','google_drive_url'];
    foreach (array_keys($row['__present_fields']??[]) as $field) {
        if ($field==='project_id' || in_array($field,$activityFields,true)) continue;
        if (($row[$field]??null)!==null) project_import_error($row,'แถวกิจกรรมกรอกได้เฉพาะรหัสโครงการ ชื่อกิจกรรม และลิงก์ Google Drive');
    }
    try { project_u_google_drive_url($url); } catch (InvalidArgumentException $e) { project_import_error($row,$e->getMessage()); }
}

function processProjectWorkbook(string $filePath, PDO $db): array
{
    project_u_ready($db);
    $definitions = project_import_definitions();
    $spreadsheet = IOFactory::load($filePath);
    $projectSheet = $spreadsheet->getSheetByName($definitions['projects']['sheet']) ?: $spreadsheet->getActiveSheet();
    $rows=project_import_sheet_rows($projectSheet,$definitions['projects']);
    if (!$rows) throw new InvalidArgumentException('ไม่พบข้อมูลโครงการในไฟล์');
    $masters=[]; $activityNames=[]; $projectRows=0; $activityRows=0;
    foreach ($rows as $row) {
        try { $code=project_validate_code(project_import_required($row,'project_id','รหัสโครงการ')); }
        catch (InvalidArgumentException $e) { project_import_error($row,$e->getMessage()); }
        $key=mb_strtolower($code,'UTF-8');
        if (project_import_is_activity_row($row)) {
            if (!isset($masters[$key])) project_import_error($row,'ต้องมีแถวโครงการหลักของรหัสนี้ก่อนแถวกิจกรรม');
            project_import_validate_activity_row($row);
            $nameKey=mb_strtolower(trim((string)$row['activity_name']),'UTF-8');
            if (isset($activityNames[$key][$nameKey])) project_import_error($row,'ชื่อกิจกรรมซ้ำกับแถว '.$activityNames[$key][$nameKey]);
            $activityNames[$key][$nameKey]=$row['__row']; $activityRows++;
        } else {
            if (isset($masters[$key])) project_import_error($row,'รหัสโครงการหลักซ้ำกับแถว '.$masters[$key]);
            $masters[$key]=$row['__row']; $projectRows++;
        }
    }

    $db->beginTransaction();
    try {
        $codes=[]; $budgetCount=0; $sortOrders=[];
        foreach ($rows as $row) {
            if (!project_import_is_activity_row($row)) {
                $code=project_import_project($db,$row); $key=mb_strtolower($code,'UTF-8'); $codes[$key]=$code;
                $budgetCount+=project_import_master_budget($db,$code,$row);
                $root=project_u_require_root($db,$code);
                $sortOrders[$key]=(int)project_u_query($db,"SELECT COALESCE(MAX(sort_order),-1)+1 FROM annual_project_report_items WHERE parent_item_id=? AND row_type='activity'",[$root])->fetchColumn();
            } else {
                $requested=project_validate_code((string)$row['project_id']); $key=mb_strtolower($requested,'UTF-8'); $code=$codes[$key]??$requested;
                project_u_merge_activity($db,$code,(string)$row['activity_name'],(string)$row['google_drive_url'],$sortOrders[$key]++);
            }
        }
        $db->commit();
        return [
            'recordCount' => count($rows),
            'rowKeys' => array_values($codes),
            'counts' => ['projects'=>$projectRows,'activities'=>$activityRows,'budgets'=>$budgetCount],
        ];
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        throw $e;
    }
}
