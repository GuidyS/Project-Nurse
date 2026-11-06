<?php
require_once __DIR__ . '/../../Teacher/ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../../config/academic_calendar.php';
$db=project_db();$auth=project_require_auth($db);project_require_admin_write($auth);
try {
    $year=project_u_year($_GET['year'] ?? currentAcademicYear(null,$db));
    $bundle=project_u_bundle($db,$year);$all=$bundle['rows'];
    $search=mb_strtolower(trim((string)($_GET['search'] ?? '')),'UTF-8');
    $strategy=$_GET['strategy'] ?? 'ทั้งหมด';$person=$_GET['responsible'] ?? 'ทั้งหมด';$codes=[];
    foreach ($all as $r) {
        $hay=mb_strtolower(implode(' ',[$r['project_id'],$r['projectName'],$r['responsiblePerson'],$r['strategy'],$r['kpi'] ?? '']),'UTF-8');
        if (($search==='' || str_contains($hay,$search)) && ($strategy==='ทั้งหมด' || $r['strategy']===$strategy) && ($person==='ทั้งหมด' || $r['responsiblePerson']===$person)) $codes[$r['project_id']]=true;
    }
    $filtered=array_values(array_filter($all,fn($r)=>isset($codes[$r['project_id']])));
    $data=project_u_summarize($filtered,$year,$bundle['periodStatus']);
    $years=$db->query('SELECT academic_year FROM project_report_periods UNION SELECT academic_year FROM project WHERE academic_year IS NOT NULL ORDER BY academic_year DESC')->fetchAll(PDO::FETCH_COLUMN);
    $data['availableFilters']=['academicYears'=>array_map('strval',academicYearOptions($years,currentAcademicYear(null,$db))),
        'strategies'=>array_values(array_unique(array_column($all,'strategy'))),'responsiblePeople'=>array_values(array_filter(array_unique(array_column($all,'responsiblePerson'))))];
    $data['meta']=['source'=>'unified_projects','pending'=>project_u_pending($db,$year)];
    project_json(['status'=>'success','data'=>$data]);
} catch (Throwable $e) {project_json(['status'=>'error','message'=>$e->getMessage()],project_error_status($e));}
