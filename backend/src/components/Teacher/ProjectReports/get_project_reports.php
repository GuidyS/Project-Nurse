<?php
require_once __DIR__ . '/../ProjectShared/project_helpers.php';
$db=project_db();project_require_auth($db,['PROJECT_REPORTS_VIEW']);
try {
    $projects=project_u_rows($db,"SELECT p.id,p.project_id,p.project_name_th,p.academic_year,p.project_type FROM project p JOIN project_report_links l ON l.project_id=p.project_id ORDER BY p.created_at DESC,p.id DESC");
    $projects=array_values(array_filter($projects,fn($p)=>!project_u_code_pending($db,(string)$p['project_id']) && project_u_period($db,(int)$p['academic_year'])!=='review'));
    foreach ($projects as &$p) {
        $p['project_id']=(string)$p['project_id'];$snapshot=project_u_snapshot($db,(int)$p['academic_year']);
        $p['name']=$snapshot['catalogue'][$p['project_id']]['project_name_th'] ?? $p['project_name_th'];
        $p['name']=trim((string)$p['name']) ?: 'โครงการ #'.$p['project_id'];unset($p['project_name_th']);
    } unset($p);
    $requested=project_request_code();$selected=null;
    if ($requested!==null) {
        $canonical=project_u_project($db,$requested)['project_id'];
        foreach ($projects as $p) if ($p['project_id']===$canonical) $selected=$p;
        if ($selected===null) throw new ProjectConflict('โครงการนี้ยังรอตรวจจับคู่และกระทบยอด');
    } elseif ($projects) $selected=$projects[0];
    $stats=['totalBudget'=>null,'totalProposed'=>null,'totalSpent'=>null,'remaining'=>null];$budget=[];$details=null;$period='open';
    if ($selected) {
        $year=(int)$selected['academic_year'];$bundle=project_u_bundle($db,$year);$period=$bundle['periodStatus'];
        foreach ($bundle['rows'] as $row) if ($row['project_id']===$selected['project_id'] && $row['rowType']==='project') {
            $stats=['totalBudget'=>$row['proposedTotal'],'totalProposed'=>$row['proposedTotal'],'totalSpent'=>$row['actualTotal'],'remaining'=>$row['proposedTotal']===null||$row['actualTotal']===null?null:$row['proposedTotal']-$row['actualTotal']];
            $budget[]=['month'=>(string)$year,'budget'=>$stats['totalProposed'],'spent'=>$stats['totalSpent']];
        }
        $details=project_u_details($db,$selected['project_id']);
    }
    project_json(['status'=>'success','data'=>['projects'=>$projects,'selectedProjectId'=>$selected['project_id'] ?? null,'stats'=>$stats,'budgetData'=>$budget,'details'=>$details,'periodStatus'=>$period,'source'=>'unified_projects']]);
} catch (Throwable $e) {project_json(['status'=>'error','message'=>$e->getMessage()],project_error_status($e));}
