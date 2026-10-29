<?php
// Shared project/report domain. All mutations run inside the caller's transaction.
class ProjectConflict extends RuntimeException {}

function project_u_query(PDO $db, string $sql, array $params = []): PDOStatement {
    $stmt = $db->prepare($sql); $stmt->execute($params); return $stmt;
}
function project_u_rows(PDO $db, string $sql, array $params = []): array {
    return project_u_query($db, $sql, $params)->fetchAll(PDO::FETCH_ASSOC);
}
function project_u_sources(): array {
    return ['university'=>'มหาวิทยาลัยสยาม','thonburiHospital'=>'โรงพยาบาลธนบุรี',
        'nursingFaculty'=>'คณะพยาบาลศาสตร์','external'=>'หน่วยงานภายนอก','unspecified'=>'ยังไม่ระบุแหล่งเงิน'];
}
function project_u_activity_code(mixed $value): string {
    if (!is_string($value) && !is_int($value)) throw new InvalidArgumentException('กรุณาระบุรหัสกิจกรรมเป็นข้อความ');
    $code=trim((string)$value);
    if ($code==='' || mb_strlen($code,'UTF-8')>100 || !preg_match('/^[A-Za-z0-9\x{0E01}-\x{0E3A}\x{0E40}-\x{0E59} ._-]+$/uD',$code)
        || !preg_match('/[A-Za-z0-9\x{0E01}-\x{0E2E}\x{0E50}-\x{0E59}]/u',$code)) {
        throw new InvalidArgumentException('รหัสกิจกรรมยาวไม่เกิน 100 ตัว รองรับไทย อังกฤษ ตัวเลข ขีด จุด ขีดล่าง และช่องว่าง');
    }
    return $code;
}
function project_u_ready(PDO $db): void {
    if (!(int)$db->query("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='project_report_links'")->fetchColumn()) {
        throw new ProjectConflict('กรุณารัน migration 2026-10-26-unified-projects.sql ก่อนใช้งาน');
    }
    if (!(int)$db->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='annual_project_report_items' AND COLUMN_NAME='activity_code'")->fetchColumn()) {
        throw new ProjectConflict('กรุณารัน migration 2026-10-27-add-project-activity-code.sql ก่อนใช้งาน');
    }
}
function project_u_year(mixed $value): int {
    $year = filter_var($value, FILTER_VALIDATE_INT);
    if ($year === false || $year < 2500 || $year > 2700) throw new InvalidArgumentException('ปีการศึกษาต้องอยู่ระหว่าง 2500–2700');
    return $year;
}
function project_u_period(PDO $db,int $year): string {
    return project_u_query($db,'SELECT status FROM project_report_periods WHERE academic_year=?',[$year])->fetchColumn() ?: 'open';
}
function project_u_activate(PDO $db,int $year): void {
    project_u_lock_year($db,$year);
    if (array_sum(project_u_pending($db,$year))) throw new ProjectConflict('ยังมีรายการรอตรวจ ไม่สามารถเปิดใช้รายงานปีนี้ได้');
    foreach (project_u_rows($db,'SELECT project_id FROM project WHERE academic_year=?',[$year]) as $p) if (project_u_code_pending($db,(string)$p['project_id'])) throw new ProjectConflict('ยังมียอดต่างปีของโครงการนี้รอตรวจ');
    project_u_query($db,"UPDATE project_report_periods SET status='open' WHERE academic_year=?",[$year]);
}
function project_u_lock_year(PDO $db, int $year): void {
    if (!$db->inTransaction()) throw new LogicException('Project writes require a transaction');
    project_u_query($db, 'INSERT IGNORE INTO project_report_periods(academic_year) VALUES (?)', [$year]);
    $status = project_u_query($db, 'SELECT status FROM project_report_periods WHERE academic_year=? FOR UPDATE', [$year])->fetchColumn();
    if ($status === 'closed') throw new ProjectConflict('รายงานปีนี้ปิดรอบแล้ว ไม่สามารถแก้ไขได้');
}
function project_u_project(PDO $db, string $code): array {
    $row = project_u_query($db, 'SELECT * FROM project WHERE project_id=?', [$code])->fetch(PDO::FETCH_ASSOC);
    if (!$row) throw new ProjectConflict('ไม่พบโครงการ');
    $row['project_id'] = (string)$row['project_id']; return $row;
}
function project_u_guard(PDO $db, string $code): array {
    $project = project_u_project($db, $code);
    project_u_lock_year($db, project_u_year($project['academic_year'])); return $project;
}
function project_u_root(PDO $db, string $code): ?int {
    $id = project_u_query($db, 'SELECT report_item_id FROM project_report_links WHERE project_id=?', [$code])->fetchColumn();
    return $id === false ? null : (int)$id;
}
function project_u_code_pending(PDO $db, string $code): bool {
    return (bool)project_u_query($db,"SELECT COUNT(*) FROM project_merge_audit a WHERE a.operation='original' AND a.source_type='budget' AND a.project_id=? AND NOT EXISTS(SELECT 1 FROM project_merge_audit r WHERE r.operation='reviewed' AND r.source_type='budget' AND r.source_id=a.source_id)",[$code])->fetchColumn();
}
function project_u_require_root(PDO $db, string $code): int {
    $id = project_u_root($db, $code);
    if ($id === null) throw new ProjectConflict('โครงการนี้รอตรวจจับคู่และกระทบยอดข้อมูลเดิม');
    return $id;
}
function project_u_link_new(PDO $db, string $code): int {
    $p = project_u_guard($db, $code);
    if (project_u_root($db, $code) !== null) throw new ProjectConflict('โครงการนี้เชื่อมรายงานแล้ว');
    project_u_query($db, "INSERT INTO annual_project_report_items(academic_year,project_code,project_name,strategy,row_type) VALUES (?,?,?,?,'project')",
        [$p['academic_year'],$p['project_id'],$p['project_name_th'] ?? '',$p['strategy']]);
    $id = (int)$db->lastInsertId();
    project_u_query($db, 'INSERT INTO project_report_links(project_id,report_item_id) VALUES (?,?)', [$p['project_id'],$id]);
    return $id;
}
function project_u_cents(mixed $value): ?int {
    if ($value === null || $value === '') return null;
    if (is_float($value)) { if (!is_finite($value) || abs($value-round($value,2))>max(1e-9,abs($value)*PHP_FLOAT_EPSILON*2)) throw new InvalidArgumentException('ยอดเงินมีทศนิยมไม่เกิน 2 ตำแหน่ง'); $value=number_format($value,2,'.',''); }
    if ((!is_string($value) && !is_int($value) && !is_float($value)) || !preg_match('/^\d{1,13}(?:\.\d{1,2})?$/D', (string)$value)) {
        throw new InvalidArgumentException('ยอดเงินต้องไม่ติดลบ มีทศนิยมไม่เกิน 2 ตำแหน่ง');
    }
    [$whole,$fraction] = array_pad(explode('.', (string)$value, 2), 2, '');
    return (int)$whole * 100 + (int)str_pad($fraction, 2, '0');
}
function project_u_decimal(?int $cents): ?string { return $cents===null ? null : intdiv($cents,100).'.'.str_pad((string)($cents%100),2,'0',STR_PAD_LEFT); }
function project_u_number(?int $cents): ?float { return $cents === null ? null : $cents / 100; }
function project_u_budget(PDO $db, int $item): array {
    $result = [];
    foreach (project_u_rows($db, 'SELECT source_key,budget_type,SUM(amount) AS amount,MAX(note) AS note FROM annual_project_report_budgets WHERE report_item_id=? GROUP BY source_key,budget_type', [$item]) as $row) {
        $result[$row['source_key']][$row['budget_type']] = (float)$row['amount'];
        if ($row['note'] !== null) $result[$row['source_key']]['note'] = $row['note'];
    }
    return $result;
}
function project_u_total(array $budget, string $type): ?int {
    $sum = null;
    foreach ($budget as $cell) if (array_key_exists($type, $cell) && $cell[$type] !== null && $cell[$type] !== '') {
        $sum = ($sum ?? 0) + project_u_cents($cell[$type]);
        if ($sum > 999999999999999) throw new InvalidArgumentException('ยอดรวมเงินเกินขอบเขตที่จัดเก็บได้');
    }
    return $sum;
}
function project_u_normalize_budget(array $budget): array {
    $clean = [];
    foreach ($budget as $source=>$cell) {
        if (!array_key_exists($source, project_u_sources()) || !is_array($cell)) throw new InvalidArgumentException('แหล่งเงินไม่ถูกต้อง');
        foreach (['proposed','actual'] as $type) {
            $value = project_u_cents($cell[$type] ?? null);
            if ($value !== null) $clean[$source][$type] = project_u_number($value);
        }
        if (isset($clean[$source])) $clean[$source]['note'] = trim((string)($cell['note'] ?? ''));
    }
    return $clean;
}
function project_u_validate_activity_budgets(array $root, array $activities): void {
    foreach (project_u_sources() as $source=>$label) foreach (['proposed','actual'] as $type) {
        $sum = 0;
        foreach ($activities as $activity) $sum += project_u_cents($activity['budgets'][$source][$type] ?? null) ?? 0;
        $cap = project_u_cents($root[$source][$type] ?? null);
        if ($sum > ($cap ?? 0)) throw new ProjectConflict("งบกิจกรรมเกินยอดโครงการ: {$label} / " . ($type === 'proposed' ? 'งบเสนอ' : 'งบใช้จริง'));
    }
}
function project_u_write_budget(PDO $db, int $item, array $budget): void {
    project_u_query($db, 'DELETE FROM annual_project_report_budgets WHERE report_item_id=?', [$item]);
    foreach ($budget as $source=>$cell) foreach (['proposed','actual'] as $type) {
        $cents = project_u_cents($cell[$type] ?? null);
        if ($cents !== null) project_u_query($db, 'INSERT INTO annual_project_report_budgets(report_item_id,budget_type,source_key,source_label,amount,note) VALUES (?,?,?,?,?,?)',
            [$item,$type,$source,project_u_sources()[$source],project_u_decimal($cents),$cell['note'] ?? null]);
    }
}
function project_u_sync_cache(PDO $db, string $code): void {
    $p = project_u_project($db, $code); $root = project_u_require_root($db, $code); $budget = project_u_budget($db,$root);
    project_u_query($db, 'INSERT INTO project_budget_years(project_id,fiscal_year,budget_proposed,budget_spent) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE budget_proposed=VALUES(budget_proposed),budget_spent=VALUES(budget_spent)',
        [$p['project_id'],$p['academic_year'],project_u_decimal(project_u_total($budget,'proposed')),project_u_decimal(project_u_total($budget,'actual'))]);
}
function project_u_activities(PDO $db, int $root): array {
    $items = project_u_rows($db, "SELECT id,activity_code,activity_name,responsible_person,plan_name,objective,kpi,sort_order FROM annual_project_report_items WHERE parent_item_id=? AND row_type='activity' ORDER BY sort_order,id",[$root]);
    foreach ($items as &$item) { $item['id']=(int)$item['id']; $item['budgets']=project_u_budget($db,$item['id']); }
    return $items;
}
function project_u_save_flat_budget(PDO $db, string $code, array $input): void {
    $root = project_u_require_root($db,$code); $old = project_u_budget($db,$root);
    if (!array_key_exists('budget_proposed',$input) && !array_key_exists('budget_spent',$input)) return;
    $proposed = array_key_exists('budget_proposed',$input) ? project_u_cents($input['budget_proposed']) : project_u_total($old,'proposed');
    $actual = array_key_exists('budget_spent',$input) ? project_u_cents($input['budget_spent']) : project_u_total($old,'actual');
    $sourceInput=trim((string)($input['budget_source'] ?? ''));
    $note=array_key_exists('budget_note',$input) ? trim((string)$input['budget_note']) : (count($old)===1 ? ($old[array_key_first($old)]['note']??'') : '');
    $sameTotals=$proposed===project_u_total($old,'proposed') && $actual===project_u_total($old,'actual');
    if (count($old)>1) {
        if ($sameTotals && $sourceInput==='' && $note==='') return;
        throw new ProjectConflict('กรุณาแก้งบที่เมนูกิจกรรมและงบแยกแหล่ง เพื่อรักษารายละเอียดแหล่งเงิน');
    }
    $source=count($old) ? array_key_first($old) : 'unspecified';
    if ($sourceInput!=='') {
        if (array_key_exists($sourceInput,project_u_sources())) $source=$sourceInput;
        elseif (($matched=array_search($sourceInput,project_u_sources(),true))!==false) $source=$matched;
        else $note=trim($sourceInput.($note!=='' ? ' · '.$note : ''));
    }
    if ($sameTotals && $source===(array_key_first($old)??'unspecified') && $note===($old[$source]['note']??'')) return;
    $budget = project_u_normalize_budget([$source=>['proposed'=>project_u_number($proposed),'actual'=>project_u_number($actual),'note'=>$note]]);
    project_u_validate_activity_budgets($budget,project_u_activities($db,$root));
    project_u_write_budget($db,$root,$budget); project_u_sync_cache($db,$code);
}
function project_u_metadata(PDO $db, string $code, array $input): void {
    $root=project_u_require_root($db,$code);
    $fields=[]; $params=[];
    foreach (['plan_name','objective','kpi'] as $field) if (array_key_exists($field,$input)) { $fields[]="{$field}=?"; $params[]=trim((string)$input[$field]); }
    if (array_key_exists('sort_order',$input)) { $order=filter_var($input['sort_order'],FILTER_VALIDATE_INT); if ($order===false || $order<0 || $order>2147483647) throw new InvalidArgumentException('ลำดับรายงานต้องเป็นจำนวนเต็มที่ไม่ติดลบ'); $fields[]='sort_order=?';$params[]=$order; }
    if ($fields) { $params[]=$root; project_u_query($db,'UPDATE annual_project_report_items SET '.implode(',',$fields).' WHERE id=?',$params); }
    if (array_key_exists('strategy',$input)) project_u_query($db,'UPDATE project SET strategy=? WHERE project_id=?',[trim((string)$input['strategy']),$code]);
}
function project_u_item_code(PDO $db, int $item): string {
    $row=project_u_query($db,'SELECT l.project_id FROM annual_project_report_items i JOIN project_report_links l ON l.report_item_id=COALESCE(i.parent_item_id,i.id) WHERE i.id=?',[$item])->fetchColumn();
    if ($row===false) throw new ProjectConflict('รายการนี้ยังไม่ผ่านการจับคู่'); return (string)$row;
}
function project_u_document_purpose(?string $purpose): string {
    // Read historical document categories without requiring a database migration.
    return $purpose === 'approved_budget' ? 'budget_document' : ($purpose ?: 'general');
}
function project_u_documents(array $documents): array {
    foreach ($documents as &$document) {
        $document['report_document_type'] = project_u_document_purpose($document['report_document_type'] ?? null);
        unset($document['status']);
    }
    return $documents;
}
function project_u_report_row(array $row): array {
    // Closed-year snapshots retain their amounts and attachments, without workflow state.
    $row['documents'] = project_u_documents($row['documents'] ?? []);
    $row['budgetDocumentUrl'] = $row['budgetDocumentUrl'] ?? $row['approvedBudgetUrl'] ?? null;
    unset($row['approvalStatus'], $row['approvedBudgetUrl']);
    foreach ($row['documents'] as $doc) {
        if ($doc['report_document_type'] === 'budget_document') $row['budgetDocumentUrl'] = $doc['file_path'];
        elseif ($doc['report_document_type'] === 'summary_report') $row['summaryReportUrl'] = $doc['file_path'];
    }
    $budget = !empty($row['budgetDocumentUrl']); $summary = !empty($row['summaryReportUrl']);
    $row['documentStatus'] = ['label' => $budget && $summary ? 'เอกสารครบ' : ($budget ? 'มีเอกสารงบประมาณ' : ($summary ? 'มีสรุปโครงการ' : 'รอดำเนินการ')),
        'code' => $budget && $summary ? 'complete' : ($budget ? 'budget_only' : ($summary ? 'summary_only' : 'missing'))];
    return $row;
}
function project_u_document_link(PDO $db, string $code, int $document, array $input=[]): void {
    $root=project_u_require_root($db,$code);
    $old=project_u_query($db,'SELECT report_item_id,report_document_type FROM project_documents WHERE id=? AND project_id=?',[$document,$code])->fetch(PDO::FETCH_ASSOC);
    if (!$old) throw new ProjectConflict('ไม่พบเอกสารในโครงการนี้');
    $item=isset($input['report_item_id']) ? (int)$input['report_item_id'] : (int)($old['report_item_id'] ?? $root);
    $resolved=project_u_item_code($db,$item);
    $canonical=project_u_project($db,$code)['project_id'];
    if ($resolved!==$canonical) throw new ProjectConflict('เอกสารและกิจกรรมต้องเป็นของโครงการเดียวกัน');
    $purpose=$input['report_document_type'] ?? ($old['report_document_type']!=='general' ? $old['report_document_type'] : (($input['type'] ?? '')==='summary' ? 'summary_report' : 'general'));
    $purpose=project_u_document_purpose($purpose);
    if (!in_array($purpose,['general','budget_document','summary_report'],true)) throw new InvalidArgumentException('ประเภทเอกสารรายงานไม่ถูกต้อง');
    project_u_query($db,'UPDATE project_documents SET project_id=?,report_item_id=?,report_document_type=? WHERE id=? AND project_id=?',[$canonical,$item,$purpose,$document,$canonical]);
}
function project_u_save_details(PDO $db, string $code, array $input): void {
    project_u_guard($db,$code); $root=project_u_require_root($db,$code);
    $budget=project_u_normalize_budget($input['budgets'] ?? []);
    $existing=project_u_activities($db,$root); $byId=[]; $existingCodes=[];
    foreach ($existing as $a) { $byId[$a['id']]=$a; if (trim((string)($a['activity_code'] ?? ''))!=='') $existingCodes[mb_strtolower((string)$a['activity_code'],'UTF-8')]=$a['id']; }
    $activities=[]; $activityCodes=[];
    foreach (($input['activities'] ?? []) as $index=>$a) {
        $id=(int)($a['id'] ?? 0);
        if ($id && !isset($byId[$id])) throw new ProjectConflict('กิจกรรมไม่ใช่ของโครงการนี้');
        $name=trim((string)($a['activity_name'] ?? ''));
        if ($name==='') throw new InvalidArgumentException('กรุณาระบุชื่อกิจกรรม');
        if ($id) {
            $activityCode=(string)($byId[$id]['activity_code'] ?? '');
            if ($activityCode==='') $activityCode='LEGACY-'.$id;
            if (isset($a['activity_code']) && trim((string)$a['activity_code'])!=='' && strcasecmp(project_u_activity_code($a['activity_code']),$activityCode)!==0) {
                throw new ProjectConflict('รหัสกิจกรรมแก้ไขไม่ได้หลังสร้าง');
            }
        } else $activityCode=project_u_activity_code($a['activity_code'] ?? null);
        $activityKey=mb_strtolower($activityCode,'UTF-8');
        if (isset($activityCodes[$activityKey]) || (!$id && isset($existingCodes[$activityKey]))) throw new ProjectConflict('รหัสกิจกรรมซ้ำภายในโครงการ');
        $activityCodes[$activityKey]=$id ?: true;
        $a=['id'=>$id,'activity_code'=>$activityCode,'activity_name'=>$name,'responsible_person'=>trim((string)($a['responsible_person'] ?? '')),'sort_order'=>$index,'budgets'=>project_u_normalize_budget($a['budgets'] ?? [])];
        foreach (['plan_name','objective','kpi'] as $field) $a[$field]=trim((string)(($input['activities'][$index][$field] ?? null) ?? ($byId[$id][$field] ?? '')));
        $activities[]=$a; unset($byId[$id]);
    }
    $deleted=array_map('intval',$input['deleted_activity_ids'] ?? []);
    foreach ($byId as $id=>$a) if (!in_array($id,$deleted,true)) $activities[]=$a;
    foreach ($deleted as $id) {
        if (!isset($byId[$id])) throw new ProjectConflict('กิจกรรมที่ลบไม่ถูกต้อง');
        $used=(int)project_u_query($db,'SELECT COUNT(*) FROM project_documents WHERE report_item_id=?',[$id])->fetchColumn();
        if ($used) throw new ProjectConflict('กิจกรรมมีเอกสาร จึงลบไม่ได้');
    }
    project_u_validate_activity_budgets($budget,$activities);
    project_u_metadata($db,$code,$input);
    project_u_write_budget($db,$root,$budget);
    foreach ($activities as $a) {
        $id=$a['id'];
        if (!$id) {
            $p=project_u_project($db,$code);
            project_u_query($db,"INSERT INTO annual_project_report_items(academic_year,project_name,activity_name,activity_code,responsible_person,row_type,parent_item_id,sort_order) VALUES (?,?,?,?,?,'activity',?,?)",[$p['academic_year'],$a['activity_name'],$a['activity_name'],$a['activity_code'],$a['responsible_person'],$root,$a['sort_order']]);
            $id=(int)$db->lastInsertId();
        } else project_u_query($db,'UPDATE annual_project_report_items SET activity_code=COALESCE(activity_code,?),activity_name=?,project_name=?,responsible_person=?,sort_order=? WHERE id=?',[$a['activity_code'],$a['activity_name'],$a['activity_name'],$a['responsible_person'],$a['sort_order'],$id]);
        project_u_query($db,'UPDATE annual_project_report_items SET plan_name=?,objective=?,kpi=? WHERE id=?',[$a['plan_name']??'',$a['objective']??'',$a['kpi']??'',$id]);
        project_u_write_budget($db,$id,$a['budgets']);
    }
    foreach ($deleted as $id) project_u_query($db,'DELETE FROM annual_project_report_items WHERE id=? AND parent_item_id=?',[$id,$root]);
    project_u_sync_cache($db,$code);
}
function project_u_snapshot(PDO $db, int $year): ?array {
    $json=project_u_query($db,'SELECT snapshot_json FROM project_report_snapshots WHERE academic_year=?',[$year])->fetchColumn();
    return $json===false ? null : json_decode($json,true,512,JSON_THROW_ON_ERROR);
}
function project_u_catalogue(PDO $db, array $projects, bool $live=false): array {
    $snapshots=[];
    foreach ($projects as &$p) {
        unset($p['description']);
        $code=(string)$p['project_id']; $p['project_id']=$code; $year=(int)$p['academic_year']; $p['fiscal_year']=$year;
        if (!array_key_exists($year,$snapshots)) $snapshots[$year]=project_u_snapshot($db,$year);
        if ($snapshots[$year]!==null && isset($snapshots[$year]['catalogue'][$code])) { $p=array_merge($p,$snapshots[$year]['catalogue'][$code]); unset($p['description']); $p['documents']=project_u_documents($p['documents'] ?? []); $p['read_only']=true; continue; }
        $root=project_u_root($db,$code); $p['report_item_id']=$root; $p['merge_pending']=$root===null || project_u_code_pending($db,$code) || (!$live && project_u_period($db,$year)==='review'); $p['read_only']=false;
        $b=$p['merge_pending'] ? [] : project_u_budget($db,$root);
        $p['budget_proposed']=$p['budget']=project_u_number(project_u_total($b,'proposed'));
        $p['budget_spent']=$p['spent']=project_u_number(project_u_total($b,'actual'));
        $p['multiple_budget_sources']=count($b)>1;
        $p['budget_source']=count($b)===1 ? array_key_first($b) : '';
        $p['budget_note']=json_encode(['source'=>implode(', ',array_map(fn($key)=>project_u_sources()[$key],array_keys($b))),'note'=>implode(' · ',array_filter(array_column($b,'note')))],JSON_UNESCAPED_UNICODE);
        if ($root!==null) {
            $meta=project_u_query($db,'SELECT plan_name,objective,kpi,sort_order FROM annual_project_report_items WHERE id=?',[$root])->fetch(PDO::FETCH_ASSOC);
            $p=array_merge($p,$meta?:[]);
        }
    }
    return $projects;
}
function project_u_bundle(PDO $db, int $year, bool $live=false): array {
    if (!$live && ($snapshot=project_u_snapshot($db,$year))!==null) return project_u_summarize(array_map('project_u_report_row',$snapshot['bundle']['rows']),$year,'closed');
    if (!$live && project_u_period($db,$year)==='review') return project_u_summarize([],$year,'review');
    $items=project_u_rows($db,"SELECT i.*,p.project_id,p.project_name_th,p.strategy AS master_strategy,CONCAT_WS(' ',f.title,f.first_name_th,f.last_name_th) AS faculty_name FROM project_report_links l JOIN project p ON p.project_id=l.project_id JOIN annual_project_report_items root ON root.id=l.report_item_id JOIN annual_project_report_items i ON i.id=l.report_item_id OR i.parent_item_id=l.report_item_id LEFT JOIN faculty f ON f.faculty_id=p.responsible_faculty_id WHERE p.academic_year=? ORDER BY root.sort_order,p.id,(i.id=l.report_item_id) DESC,i.sort_order,i.id",[$year]);
    $rows=[];
    foreach ($items as $i) {
        if (project_u_code_pending($db,(string)$i['project_id'])) continue;
        $isRoot=$i['row_type']==='project'; $id=(int)$i['id']; $budgets=project_u_budget($db,$id); $proposed=[]; $actual=[];
        foreach ($budgets as $source=>$cell) {
            if (isset($cell['proposed'])) $proposed[$source]=['amount'=>$cell['proposed'],'note'=>$cell['note']??''];
            if (isset($cell['actual'])) $actual[$source]=['amount'=>$cell['actual'],'note'=>$cell['note']??''];
        }
        $documents=project_u_rows($db,'SELECT id,name,date,file_path,report_document_type FROM project_documents WHERE report_item_id=? ORDER BY id',[$id]);
        $row=['id'=>(string)$id,'project_id'=>(string)$i['project_id'],'academicYear'=>(string)$year,'strategy'=>$i['master_strategy'] ?: 'ไม่ระบุยุทธศาสตร์','planName'=>$i['plan_name'],'objective'=>$i['objective'],'kpi'=>$i['kpi'],
            'projectCode'=>$isRoot ? (string)$i['project_id'] : null,'parentProjectCode'=>$isRoot ? null : (string)$i['project_id'],
            'projectName'=>$isRoot ? (trim((string)$i['project_name_th']) ?: 'โครงการ #'.$i['project_id']) : $i['activity_name'],
            'activityName'=>$i['activity_name'],'responsiblePerson'=>$isRoot ? $i['faculty_name'] : $i['responsible_person'],'rowType'=>$i['row_type'],
            'proposedBudget'=>(object)$proposed,'actualBudget'=>(object)$actual,'proposedTotal'=>project_u_number(project_u_total($budgets,'proposed')),'actualTotal'=>project_u_number(project_u_total($budgets,'actual')),'documents'=>$documents];
        $rows[]=project_u_report_row($row);
    }
    return project_u_summarize($rows,$year,'open');
}
function project_u_summarize(array $rows, int $year, string $status): array {
    $roots=array_values(array_filter($rows,fn($r)=>$r['rowType']==='project'));
    $sum=function(array $set,string $key): ?float {
        if (!$set) return 0.0;
        $total=0; foreach ($set as $r) { if ($r[$key]===null) return null; $total+=project_u_cents($r[$key]); } return $total/100;
    };
    $p=$status==='review' ? null : $sum($roots,'proposedTotal'); $a=$status==='review' ? null : $sum($roots,'actualTotal');
    $strategies=[]; foreach (array_unique(array_column($rows,'strategy')) as $strategy) {
        $all=array_values(array_filter($rows,fn($r)=>$r['strategy']===$strategy)); $set=array_values(array_filter($all,fn($r)=>$r['rowType']==='project'));
        $strategies[]=['strategy'=>$strategy,'projects'=>count($set),'activities'=>count($all)-count($set),'proposedTotal'=>$sum($set,'proposedTotal'),'actualTotal'=>$sum($set,'actualTotal'),'documents'=>count(array_filter($set,fn($r)=>$r['documentStatus']['code']==='complete'))];
    }
    $breakdown=[]; foreach (project_u_sources() as $source=>$label) {
        $bp=null;$ba=null;foreach ($roots as $r) { $pc=((array)$r['proposedBudget'])[$source]['amount']??null; $ac=((array)$r['actualBudget'])[$source]['amount']??null; if ($pc!==null) $bp=($bp??0)+project_u_cents($pc); if ($ac!==null) $ba=($ba??0)+project_u_cents($ac); } $bp=project_u_number($bp);$ba=project_u_number($ba);
        $breakdown[]=['key'=>$source,'label'=>$label,'proposedTotal'=>$bp,'actualTotal'=>$ba];
    }
    return ['academicYear'=>(string)$year,'periodStatus'=>$status,'rows'=>$rows,'budgetSources'=>array_map(fn($key,$label)=>['key'=>$key,'label'=>$label],array_keys(project_u_sources()),project_u_sources()),
        'summary'=>['totalProjects'=>count($roots),'totalActivities'=>count($rows)-count($roots),'proposedTotal'=>$p,'actualTotal'=>$a,'balance'=>$p===null||$a===null?null:$p-$a,'completeDocuments'=>count(array_filter($roots,fn($r)=>$r['documentStatus']['code']==='complete'))],
        'strategySummaries'=>$strategies,'budgetBreakdown'=>$breakdown];
}
function project_u_details(PDO $db,string $code): array {
    $p=project_u_project($db,$code); $snapshot=project_u_snapshot($db,(int)$p['academic_year']);
    if ($snapshot!==null && isset($snapshot['details'][$p['project_id']])) return array_replace($snapshot['details'][$p['project_id']],['read_only'=>true,'documents'=>project_u_documents($snapshot['details'][$p['project_id']]['documents'] ?? [])]);
    $root=project_u_require_root($db,$p['project_id']);
    $meta=project_u_query($db,'SELECT plan_name,objective,kpi,sort_order FROM annual_project_report_items WHERE id=?',[$root])->fetch(PDO::FETCH_ASSOC);
    return ['project_id'=>$p['project_id'],'report_item_id'=>$root,'academic_year'=>(int)$p['academic_year'],'strategy'=>$p['strategy']??'','project_name_th'=>$p['project_name_th'],'read_only'=>false,
        'budgets'=>(object)project_u_budget($db,$root),'activities'=>project_u_activities($db,$root),'sources'=>project_u_sources(),'documents'=>project_u_documents(project_u_rows($db,'SELECT id,name,date,file_path,report_item_id,report_document_type FROM project_documents WHERE project_id=? ORDER BY report_item_id,id',[$p['project_id']]))]+($meta?:[]);
}
function project_u_pending(PDO $db,int $year): array {
    $projects=(int)project_u_query($db,'SELECT COUNT(*) FROM project p LEFT JOIN project_report_links l ON l.project_id=p.project_id WHERE p.academic_year=? AND l.project_id IS NULL',[$year])->fetchColumn();
    $items=(int)project_u_query($db,"SELECT COUNT(*) FROM annual_project_report_items i LEFT JOIN project_report_links l ON l.report_item_id=COALESCE(i.parent_item_id,i.id) WHERE i.academic_year=? AND l.project_id IS NULL",[$year])->fetchColumn();
    $budgets=(int)project_u_query($db,"SELECT COUNT(*) FROM project_merge_audit a LEFT JOIN project p ON p.project_id=a.project_id WHERE a.operation='original' AND a.source_type='budget' AND COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(a.payload_json,'$.fiscal_year')) AS UNSIGNED),p.academic_year)=? AND NOT EXISTS(SELECT 1 FROM project_merge_audit r WHERE r.operation='reviewed' AND r.source_type='budget' AND r.source_id=a.source_id)",[$year])->fetchColumn();
    return ['projects'=>$projects,'report_items'=>$items,'legacy_budgets'=>$budgets];
}
function project_u_archive(PDO $db,string $type,string $id,string $code,array $payload,int $user,string $operation='original'): void {
    project_u_query($db,'INSERT IGNORE INTO project_merge_audit(operation,source_type,source_id,project_id,payload_json,user_id) VALUES (?,?,?,?,?,?)',[$operation,$type,$id,$code,json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$user]);
}
function project_u_close(PDO $db,int $year,int $user): void {
    project_u_lock_year($db,$year);
    if (array_sum(project_u_pending($db,$year))) throw new ProjectConflict('ยังมีรายการรอจับคู่หรือกระทบยอด ไม่สามารถปิดรอบได้');
    foreach (project_u_rows($db,'SELECT project_id FROM project WHERE academic_year=?',[$year]) as $p) if (project_u_code_pending($db,(string)$p['project_id'])) throw new ProjectConflict('โครงการในปีนี้ยังมียอดเดิมต่างปีรอตรวจย้าย');
    $bundle=project_u_bundle($db,$year,true); $catalogue=[]; $details=[];
    $projects=project_u_rows($db,"SELECT p.*,CONCAT_WS(' ',f.title,f.first_name_th,f.last_name_th) AS responsible_name FROM project p LEFT JOIN faculty f ON f.faculty_id=p.responsible_faculty_id WHERE p.academic_year=?",[$year]);
    foreach (project_u_catalogue($db,$projects,true) as $p) {
        $p['documents']=project_u_rows($db,'SELECT * FROM project_documents WHERE project_id=?',[$p['project_id']]);
        $p['member_details']=project_u_rows($db,"SELECT f.faculty_id AS id,f.faculty_id,CONCAT_WS(' ',f.title,f.first_name_th,f.last_name_th) AS name,'faculty' AS type,'ผู้ร่วมโครงการ' AS role FROM project_faculty_members m JOIN faculty f ON f.faculty_id=m.faculty_id WHERE m.project_id=?",[$p['project_id']]);
        $p['member_faculty_ids']=array_map('intval',array_column($p['member_details'],'faculty_id'));
        $p['members']=count($p['member_faculty_ids'])+($p['responsible_faculty_id']?1:0);
        if ($p['responsible_faculty_id']) array_unshift($p['member_details'],['id'=>(int)$p['responsible_faculty_id'],'faculty_id'=>(int)$p['responsible_faculty_id'],'name'=>$p['responsible_name'],'type'=>'faculty','role'=>'ผู้ดำเนินโครงการ']);
        $p['plos']=project_u_query($db,"SELECT outcome_code FROM project_outcome_links WHERE project_id=? AND outcome_type='plo'",[$p['project_id']])->fetchAll(PDO::FETCH_COLUMN);
        $p['read_only']=true; $catalogue[$p['project_id']]=$p; $details[$p['project_id']]=project_u_details($db,$p['project_id']);
    }
    $bundle['periodStatus']='closed';
    project_u_query($db,'INSERT INTO project_report_snapshots(academic_year,snapshot_json) VALUES (?,?)',[$year,json_encode(['bundle'=>$bundle,'catalogue'=>(object)$catalogue,'details'=>(object)$details],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)]);
    project_u_query($db,"UPDATE project_report_periods SET status='closed',closed_by=?,closed_at=CURRENT_TIMESTAMP WHERE academic_year=?",[$user,$year]);
}
