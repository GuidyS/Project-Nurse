<?php
function project_merge_queue(PDO $db, int $year): array {
    $projects=project_u_rows($db,'SELECT p.id,p.project_id,p.project_name_th,p.academic_year,p.responsible_faculty_id,p.project_type,l.report_item_id FROM project p LEFT JOIN project_report_links l ON l.project_id=p.project_id WHERE p.academic_year=? ORDER BY p.id',[$year]);
    $reports=project_u_rows($db,"SELECT i.* FROM annual_project_report_items i LEFT JOIN project_report_links l ON l.report_item_id=i.id WHERE i.academic_year=? AND i.row_type='project' AND l.project_id IS NULL ORDER BY i.id",[$year]);
    foreach ($reports as &$r) {
        $r['budgets']=(object)project_u_budget($db,(int)$r['id']); $r['activities']=project_u_activities($db,(int)$r['id']);
        $r['documents']=project_u_rows($db,'SELECT d.* FROM annual_project_report_documents d JOIN annual_project_report_items i ON i.id=d.report_item_id WHERE i.id=? OR i.parent_item_id=?',[$r['id'],$r['id']]);
    }
    $orphans=project_u_rows($db,"SELECT i.* FROM annual_project_report_items i LEFT JOIN annual_project_report_items parent ON parent.id=i.parent_item_id WHERE i.academic_year=? AND i.row_type='activity' AND (parent.id IS NULL OR parent.row_type<>'project') ORDER BY i.id",[$year]);
    foreach ($orphans as &$a) {$a['budgets']=(object)project_u_budget($db,(int)$a['id']); $a['documents']=project_u_rows($db,'SELECT * FROM annual_project_report_documents WHERE report_item_id=?',[$a['id']]);} unset($a);
    $legacy=project_u_rows($db,"SELECT a.source_id,a.project_id,a.payload_json FROM project_merge_audit a LEFT JOIN project p ON p.project_id=a.project_id WHERE a.operation='original' AND a.source_type='budget' AND COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(a.payload_json,'$.fiscal_year')) AS UNSIGNED),p.academic_year)=? AND NOT EXISTS(SELECT 1 FROM project_merge_audit r WHERE r.operation='reviewed' AND r.source_type='budget' AND r.source_id=a.source_id)",[$year]);
    foreach ($legacy as &$b) {$b['original']=json_decode($b['payload_json'],true);unset($b['payload_json']);}
    return ['projects'=>$projects,'reports'=>$reports,'orphan_activities'=>$orphans,'legacy_budgets'=>$legacy,'pending'=>project_u_pending($db,$year),
        'periodStatus'=>project_u_query($db,'SELECT status FROM project_report_periods WHERE academic_year=?',[$year])->fetchColumn() ?: 'open',
        'faculty'=>project_u_rows($db,"SELECT faculty_id,CONCAT_WS(' ',title,first_name_th,last_name_th) AS name FROM faculty ORDER BY faculty_id"),'sources'=>project_u_sources()];
}
function project_merge_commit(PDO $db,array $input,int $user): string {
    $year=project_u_year($input['academic_year'] ?? null);project_u_lock_year($db,$year);
    $code=project_validate_code($input['project_id'] ?? null);
    $p=project_u_query($db,'SELECT * FROM project WHERE project_id=? FOR UPDATE',[$code])->fetch(PDO::FETCH_ASSOC);
    $name=trim((string)($input['project_name_th'] ?? ''));$faculty=(int)($input['responsible_faculty_id'] ?? 0);
    if ($name==='' || mb_strlen($name)>255) throw new InvalidArgumentException('กรุณาระบุชื่อโครงการไม่เกิน 255 ตัวอักษร');
    if (!project_u_query($db,'SELECT faculty_id FROM faculty WHERE faculty_id=?',[$faculty])->fetchColumn()) throw new InvalidArgumentException('กรุณาจับคู่ผู้รับผิดชอบกับอาจารย์ในระบบ');
    if ($p) {
        $code=(string)$p['project_id'];
        if ((int)$p['academic_year']!==$year) throw new ProjectConflict('รหัสนี้เป็นของปีอื่น กรุณาใช้รหัสโครงการใหม่สำหรับปีนี้');
        project_u_archive($db,'project',(string)$p['id'],$code,$p,$user);
        project_u_query($db,'UPDATE project SET project_name_th=?,responsible_faculty_id=? WHERE project_id=?',[$name,$faculty,$code]);
    } else {
        $type=$input['project_type'] ?? 'other';
        if (!in_array($type,['academic_service','culture','other','teaching','research','quality_assurance'],true)) throw new InvalidArgumentException('ประเภทโครงการไม่ถูกต้อง');
        project_u_query($db,"INSERT INTO project(project_id,project_name_th,responsible_faculty_id,academic_year,project_type,status) VALUES (?,?,?,?,?,'active')",[$code,$name,$faculty,$year,$type]);
    }
    $root=project_u_root($db,$code);$requested=(int)($input['report_item_id'] ?? 0);
    if ($root!==null && $requested && $root!==$requested) throw new ProjectConflict('โครงการนี้เชื่อมกับรายงานอื่นแล้ว');
    if ($root===null && $requested) {
        $item=project_u_query($db,"SELECT * FROM annual_project_report_items WHERE id=? AND row_type='project' FOR UPDATE",[$requested])->fetch(PDO::FETCH_ASSOC);
        if (!$item || (int)$item['academic_year']!==$year) throw new ProjectConflict('รายงานต้นฉบับไม่ตรงกับปีที่เลือก');
        if (project_u_query($db,'SELECT project_id FROM project_report_links WHERE report_item_id=?',[$requested])->fetchColumn() !== false) throw new ProjectConflict('รายงานนี้ถูกจับคู่แล้ว');
        project_u_archive($db,'report',(string)$requested,$code,['root'=>$item,'budgets'=>project_u_budget($db,$requested),'activities'=>project_u_activities($db,$requested),
            'documents'=>project_u_rows($db,'SELECT d.* FROM annual_project_report_documents d JOIN annual_project_report_items i ON i.id=d.report_item_id WHERE i.id=? OR i.parent_item_id=?',[$requested,$requested])],$user);
        project_u_query($db,'INSERT INTO project_report_links(project_id,report_item_id) VALUES (?,?)',[$code,$requested]);$root=$requested;
    }
    if ($root===null) $root=project_u_link_new($db,$code);
    foreach (($input['attach_activity_ids'] ?? []) as $activityId) {
        $activityId=(int)$activityId;
        $activity=project_u_query($db,"SELECT i.* FROM annual_project_report_items i LEFT JOIN annual_project_report_items parent ON parent.id=i.parent_item_id WHERE i.id=? AND i.academic_year=? AND i.row_type='activity' AND (parent.id IS NULL OR parent.row_type<>'project') FOR UPDATE",[$activityId,$year])->fetch(PDO::FETCH_ASSOC);
        if (!$activity) throw new ProjectConflict('กิจกรรมที่เลือกไม่อยู่ในคิวตรวจ หรือถูกจับคู่แล้ว');
        project_u_archive($db,'activity',(string)$activityId,$code,['item'=>$activity,'budgets'=>project_u_budget($db,$activityId),'documents'=>project_u_rows($db,'SELECT * FROM annual_project_report_documents WHERE report_item_id=?',[$activityId])],$user);
        project_u_query($db,'UPDATE annual_project_report_items SET parent_item_id=? WHERE id=?',[$root,$activityId]);
    }
    project_u_save_details($db,$code,$input);
    foreach (($input['legacy_decisions'] ?? []) as $decision) {
        $sourceId=(string)($decision['source_id'] ?? '');
        $original=project_u_query($db,"SELECT payload_json FROM project_merge_audit WHERE operation='original' AND source_type='budget' AND source_id=? FOR UPDATE",[$sourceId])->fetchColumn();
        if ($original===false) throw new ProjectConflict('ไม่พบยอดต้นฉบับที่กำลังตรวจ');
        if (project_u_query($db,"SELECT id FROM project_merge_audit WHERE operation='reviewed' AND source_type='budget' AND source_id=?",[$sourceId])->fetchColumn()) continue;
        $original=json_decode($original,true);$target=project_validate_code(trim((string)($decision['target_project_id'] ?? '')) !== '' ? $decision['target_project_id'] : $code);
        $targetProject=project_u_guard($db,$target);$target=$targetProject['project_id'];
        $sourceYear=$original['fiscal_year'] ?? $year;
        if ((int)$sourceYear!== (int)$targetProject['academic_year']) throw new ProjectConflict('ยอดต่างปีต้องตรวจย้ายไปโครงการของปีนั้น');
        if (!($decision['confirm_actual'] ?? false)) throw new InvalidArgumentException('ต้องยืนยันยอดงบใช้จริงที่เลือกก่อนกระทบยอด');
        $choice=$decision['decision'] ?? '';
        if ($choice==='proposed') {
            $targetBudget=project_u_budget($db,project_u_require_root($db,$target));
            if ($original['legacy_amount']===null || project_u_total($targetBudget,'proposed')!==project_u_cents($original['legacy_amount'])) {
                throw new ProjectConflict('ยอดงบเสนอที่เลือกต้องตรงกับยอดเดิมเมื่อเลือกย้ายเป็นงบเสนอ หากเลือกยอดอื่นให้เก็บยอดเดิมเป็นประวัติพร้อมเหตุผล');
            }
        } elseif ($choice==='history') {
            if (trim((string)($decision['reason'] ?? ''))==='') throw new InvalidArgumentException('กรุณาระบุเหตุผลที่เก็บยอดเดิมเฉพาะในประวัติ');
        } else throw new InvalidArgumentException('กรุณาเลือกความหมายของยอดเดิมทีละรายการ');
        project_u_archive($db,'budget',$sourceId,$target,['original'=>$original,'decision'=>$decision,'resolved_budgets'=>project_u_budget($db,project_u_require_root($db,$target))],$user,'reviewed');
    }
    // Preserve original document IDs in the archive; migrate each URL exactly once.
    $documents=project_u_rows($db,'SELECT d.* FROM annual_project_report_documents d JOIN annual_project_report_items i ON i.id=d.report_item_id WHERE i.id=? OR i.parent_item_id=?',[$root,$root]);
    foreach ($documents as $d) {
        $date=$input['document_dates'][(string)$d['id']] ?? substr((string)$d['created_at'],0,10);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$date) || !strtotime($date)) throw new InvalidArgumentException('กรุณาระบุวันที่บันทึกเอกสารเดิมที่ยังไม่มีวันที่');
        $url=$input['document_urls'][(string)$d['id']] ?? $d['url'];
        if (!filter_var($url,FILTER_VALIDATE_URL) || !in_array(strtolower((string)parse_url($url,PHP_URL_SCHEME)),['http','https'],true)) throw new InvalidArgumentException('กรุณาตรวจลิงก์เอกสารเดิม');
        project_u_query($db,"INSERT IGNORE INTO project_documents(project_id,name,project,type,date,status,file_path,report_item_id,report_document_type,legacy_report_document_id) VALUES (?,?,?,?,?,'available',?,?,?,?)",
            [$code,$d['label'] ?: 'เอกสารรายงาน',$name,$d['document_type']==='approved_budget'?'financial':'summary',$date,$url,$d['report_item_id'],project_u_document_purpose($d['document_type']),$d['id']]);
    }
    project_u_query($db,"UPDATE project_documents SET report_item_id=?,report_document_type=CASE WHEN type='summary' THEN 'summary_report' ELSE report_document_type END WHERE project_id=? AND report_item_id IS NULL",[$root,$code]);
    project_u_archive($db,'report',(string)$root,$code,['confirmed'=>true],$user,'reviewed');
    return $code;
}
function project_merge_finalize(PDO $db): void {
    $pending=(int)$db->query("SELECT COUNT(*) FROM project_merge_audit a WHERE a.operation='original' AND a.source_type='budget' AND NOT EXISTS(SELECT 1 FROM project_merge_audit r WHERE r.operation='reviewed' AND r.source_type='budget' AND r.source_id=a.source_id)")->fetchColumn();
    $unlinked=(int)$db->query('SELECT COUNT(*) FROM project p LEFT JOIN project_report_links l ON l.project_id=p.project_id WHERE l.project_id IS NULL')->fetchColumn()
        +(int)$db->query('SELECT COUNT(*) FROM annual_project_report_items i LEFT JOIN project_report_links l ON l.report_item_id=COALESCE(i.parent_item_id,i.id) WHERE l.project_id IS NULL')->fetchColumn();
    if ($pending || $unlinked) throw new ProjectConflict('ยังมีรายการรอตรวจ ไม่สามารถจบการย้ายได้');
    $exists=(int)$db->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='project_budget_years' AND COLUMN_NAME='budget_allocated'")->fetchColumn();
    if ($exists) $db->exec('ALTER TABLE project_budget_years DROP COLUMN budget_allocated');
}
