<?php
require_once __DIR__ . '/../../Teacher/ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../Teacher/ProjectShared/project_merge_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
$db=project_db();
$auth=project_require_auth($db,['PROJECT_VIEW','PROJECT_REPORTS_VIEW']);
$page=$_GET['page'] ?? '';
try {
    if ($page==='project-merge-queue') {
        project_require_admin_write($auth);
        $year=project_u_year($_GET['year'] ?? null);
        $data=project_merge_queue($db,$year);
        $data['years']=array_map('intval',$db->query('SELECT academic_year FROM project_report_periods UNION SELECT academic_year FROM project WHERE academic_year IS NOT NULL UNION SELECT academic_year FROM annual_project_report_items ORDER BY academic_year DESC')->fetchAll(PDO::FETCH_COLUMN));
        project_json(['status'=>'success','data'=>$data]);exit;
    }
    if ($page==='get-project-details') {
        $code=project_validate_code($_GET['project_id'] ?? null);
        $p=project_u_project($db,$code);
        if ((int)$auth['role_id']!==1 && (project_u_code_pending($db,$code) || project_u_period($db,(int)$p['academic_year'])==='review')) throw new ProjectConflict('โครงการนี้รอยืนยันย้ายข้อมูลรายปี');
        project_json(['status'=>'success','data'=>project_u_details($db,$code)]);exit;
    }
    if ($_SERVER['REQUEST_METHOD']!=='POST') {project_json(['status'=>'error','message'=>'Method not allowed'],405);exit;}
    project_require_admin_write($auth);$input=project_payload();
    if ($page==='finalize-project-merge') {
        project_merge_finalize($db);logAudit($db,$auth['user_id'],'update','project_merge','จบการย้ายงบเดิมและถอดคอลัมน์ที่เลิกใช้');
    } else {
        $db->beginTransaction();
        if ($page==='commit-project-merge') $code=project_merge_commit($db,$input,$auth['user_id']);
        elseif ($page==='save-project-details') {
            // A stale activity dialog must never overwrite the master project's strategy.
            unset($input['strategy']);
            $code=project_validate_code($input['project_id'] ?? null);project_u_save_details($db,$code,$input);
        } elseif ($page==='activate-project-year') project_u_activate($db,project_u_year($input['academic_year'] ?? null));
        elseif ($page==='close-project-year') project_u_close($db,project_u_year($input['academic_year'] ?? null),$auth['user_id']);
        else throw new InvalidArgumentException('Unknown project action');
        $db->commit();logAudit($db,$auth['user_id'],'update','project_reports',$page . (isset($code)?' / '.$code:''));
    }
    project_json(['status'=>'success','message'=>'บันทึกสำเร็จ','project_id'=>$code ?? null]);
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    project_json(['status'=>'error','message'=>$e instanceof PDOException?'ไม่สามารถบันทึกข้อมูล กรุณาตรวจรหัสซ้ำและความสัมพันธ์':$e->getMessage()],project_error_status($e));
}
