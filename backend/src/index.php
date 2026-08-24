<?php
    // ตั้งค่า CORS (ต้องอยู่บรรทัดแรกๆ ก่อน logic อื่น)
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($requestOrigin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$requestOrigin}");
        header("Vary: Origin");
    }
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    // --- เพิ่มส่วนนี้เข้าไป ---
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $page = isset($_GET['page']) ? $_GET['page'] : '';

    switch ($page) {

            // Auth
            case 'register':
                require_once 'components/Auth/register.php';
                break;
            case 'login':
                require_once 'components/Auth/login.php';
                break;
            case 'reset-password':
                require_once 'components/Auth/reset-password.php';
                break;
            case 'change-password':
                require_once 'components/Auth/change-password.php';
                break;
            case 'profile':
                require_once 'components/ProfilePage/api.php';
                break;

            // NotificationPage
            case 'get-notifications':
                require_once 'components/NotificationPage/get_notifications.php';
                break;
            case 'get-notification-students':
                require_once 'components/NotificationPage/get_student_notifications.php';
                break;
            case 'send-notification':
                require_once 'components/NotificationPage/send_notification.php';
                break;
            case 'get-notification-settings':
                require_once 'components/NotificationPage/get_settings.php';
                break;
            case 'save-notification-settings':
                require_once 'components/NotificationPage/save_settings.php';
                break;
            case 'mark-notification-read':
                require_once 'components/NotificationPage/mark_read.php';
                break;
            case 'delete-notification':
                require_once 'components/NotificationPage/delete_notification.php';
                break;

            /* -------- Admin -------- */

            case 'get-users':
                require_once 'components/Admin/ManageUsers/get-users.php';
                break;
            case 'manage-user':
                require_once 'components/Admin/ManageUsers/manage-user.php';
                break;
            case 'generate-user-accounts':
                require_once 'components/Admin/ManageUsers/generate-user-accounts.php';
                break;
            case 'manage-role':
                require_once 'components/Admin/ManageUsers/manage-role.php';
                break;
            case 'get-audit-logs':
                require_once 'components/Admin/AuditLogs/get-audit-logs.php';
                break;
            case 'get-approval-requests':
                require_once 'components/Admin/Approvals/get-approval-requests.php';
                break;
            case 'create-approval-request':
                require_once 'components/Admin/Approvals/create-approval-request.php';
                break;
            case 'approve-request':
                require_once 'components/Admin/Approvals/approve-request.php';
                break;
            case 'reject-request':
                require_once 'components/Admin/Approvals/reject-request.php';
                break;
            case 'export-data':
                require_once 'components/Admin/ExportData/export-data.php'; 
                break;
            case 'import-data':
                require_once 'components/Admin/ImportData/import-data.php'; 
                break;
            case 'get-import-history':
                require_once 'components/Admin/ImportData/get-import-history.php';
                break;
            case 'admin-reports':
                require_once 'components/Admin/Reports/get-reports.php';
                break;
            case 'schema-audit':
                require_once 'components/Admin/SchemaAudit/schema_audit.php';
                break;
            case 'approve-budget':
                require_once 'components/Admin/Reports/approve-budget.php';
                break;
            case 'performance':
                require_once 'components/Performance.php';
                break;
            case 'projectspage':
                require_once 'components/Teacher/ProjectsPage.php';
                break;
            case 'teacher-dashboard':
                require_once 'components/Teacher/Dashboard/get_dashboard_stats.php';
                break;
            case 'teacher-courses':
                require_once 'components/Teacher/CoursesPage/api.php';
                break;

            /* -------- Teacher -------- */

            // Advises
            case 'get-advises':
                require_once 'components/Teacher/Advises/get_advises.php';
                break;
            case 'get-student-plo-mapping':
                require_once 'components/Teacher/Advises/get_student_plo_mapping.php';
                break;
            case 'save-student-plo-mapping':
                require_once 'components/Teacher/Advises/save_student_plo_mapping.php';
                break;
            case 'send-advisor-message':
                require_once 'components/Teacher/Advises/send_advisor_message.php';
                break;

            // AdvisorNotifications (การแจ้งเตือนของอาจารย์)
            case 'get-advisor-notifications':
                require_once 'components/Teacher/AdvisorNotifications/get_notifications.php';
                break;
            case 'update-notification-read':
                require_once 'components/Teacher/AdvisorNotifications/update_notification_read.php';
                break;

            // AssignInstructors
            case 'get-assign-data':
                require_once 'components/Teacher/AssignInstructors/get_assign_data.php';
                break;
            case 'save-assign-instructor':
                require_once 'components/Teacher/AssignInstructors/save_assign_instructor.php';
                break;

            // CLOManagement
            case 'get-clo-management':
                require_once 'components/Teacher/CLOManagement/get_clo_management.php';
                break;
            case 'save-clo-management':
                require_once 'components/Teacher/CLOManagement/save_clo_management.php';
                break;

            // CLOMap
            case 'get-clo-map':
                require_once 'components/Teacher/CLOMap/get_clo_map.php';
                break;
            case 'save-clo-map':
                require_once 'components/Teacher/CLOMap/save_clo_map.php';
                break;

            // CLOPage
            case 'get-subjects':
                require_once 'components/Teacher/CLOPage/get_subjects.php';
                break;
            case 'get-clos':
                require_once 'components/Teacher/CLOPage/get_clos.php';
                break;
            case 'add-clo':
                require_once 'components/Teacher/CLOPage/addclo.php';
                break;
            case 'update-clo':
                require_once 'components/Teacher/CLOPage/update_clo.php';
                break;
            case 'delete-clo':
                require_once 'components/Teacher/CLOPage/delete_clo.php';
                break;
            case 'save-ylo-matrix':
                require_once 'components/Teacher/CLOPage/save_ylo_matrix.php';
                break;
            case 'save-sub-plo-catalog':
                require_once 'components/Teacher/CLOPage/save_sub_plo_catalog.php';
                break;
            case 'migrate-mapping-json-to-tables':
                require_once 'components/Teacher/CLOPage/migrate_mapping_json_to_tables.php';
                break;

            // CoursesReports
            case 'get-course-report':
                require_once 'components/Teacher/CourseReports/get_course_report.php';
                break;
            case 'get-report-filters':
                require_once 'components/Teacher/CourseReports/get_report_filters.php';
                break;

            // CoursesPage
            case 'get-my-courses':
                require_once 'components/Teacher/CoursesPage/get_my_courses.php';
                break;
            case 'get-course-students':
                require_once 'components/Teacher/CoursesPage/get_course_students.php';
                break;
            case 'update-grade':
                require_once 'components/Teacher/CoursesPage/update_grade.php';
                break;

            // CourseStudents
            case 'get-course-students-clo':
                require_once 'components/Teacher/CourseStudents/get_course_students_clo.php';
                break;
            case 'save-student-clo-scores':
                require_once 'components/Teacher/CourseStudents/save_student_clo_scores.php';
                break;

            // Document
            case 'get-documents':
                require_once 'components/Teacher/Documents/get_documents.php';
                break;
            case 'upload-document':
                require_once 'components/Teacher/Documents/upload_document.php';
                break;
            case 'delete-document':
                require_once 'components/Teacher/Documents/delete_document.php';
                break;
            case 'download-document':
                require_once 'components/Teacher/Documents/download_document.php';
                break;

            // Evidence
            case 'get-evidence':
                require_once 'components/Teacher/Evidence/get_evidence.php';
                break;
            case 'upload-evidence':
                require_once 'components/Teacher/Evidence/upload_evidence.php';
                break;
            case 'verify-evidence':
                require_once 'components/Teacher/Evidence/verify_evidence.php';
                break;
            case 'delete-evidence':
                require_once 'components/Teacher/Evidence/delete_evidence.php';
                break;
            case 'download-file':
                require_once 'components/Teacher/Evidence/download_file.php';
                break;

            // FiveYearSummary
            case 'get-five-year-summary':
                require_once 'components/Teacher/FiveYearSummary/get_five_year_summary.php';
                break;

            // Grades
            case 'get-grading-data':
                require_once 'components/Teacher/grading/get_grading_data.php';
                break;
            case 'save-grading-data':
                require_once 'components/Teacher/grading/save_grading_data.php';
                break;

            // Dashboard
            case 'teacher-dashboard':
                require_once 'components/Teacher/Dashboard/get_dashboard_stats.php';
                break;

            // DeanDashboard
            case 'get-dean-dashboard':
                require_once 'components/Teacher/DeanDashboard/get_dean_dashboard.php';
                break;

            // Retention
            case 'get-retention':
                require_once 'components/Teacher/Retention/get_retention.php';
                break;

            // PLOYLOReport
            case 'get-plo-ylo-report':
                require_once 'components/Teacher/PLOYLOReport/get_plo_ylo_report.php';
                break;

            // AdviseNotes
            case 'get-advise-notes':
                require_once 'components/Teacher/AdviseNotes/get_advise_notes.php';
                break;
            case 'save-advise-note':
                require_once 'components/Teacher/AdviseNotes/save_advise_note.php';
                break;
            case 'get-advise-students':
                require_once 'components/Teacher/AdviseNotes/get_advise_students.php';
                break;

            // MyCourses
            case 'get-teacher-courses-overview':
                require_once 'components/Teacher/MyCourses/get_teacher_courses_overview.php';
                break;

            // Performance
            case 'get-performance':
                require_once 'components/Teacher/Performance/get_performance.php';
                break;  
            case 'save-performance':
                require_once 'components/Teacher/Performance/save_performance.php';
                break;  

            // PracticalStudents (นักศึกษาฝึกปฏิบัติ)
            case 'get-practical-students':
                require_once 'components/Teacher/PracticalStudents/get_practical_students.php';
                break;  
                              
            // MyProjects
            case 'get-my-projects':
                require_once 'components/Teacher/MyProjects/get_my_projects.php';
                break;
            case 'get-my-project-faculty-options':
                require_once 'components/Teacher/MyProjects/get_my_project_faculty_options.php';
                break;
            case 'create-my-project':
                require_once 'components/Teacher/MyProjects/create_my_project.php';
                break;
            case 'update-my-project':
                require_once 'components/Teacher/MyProjects/update_my_project.php';
                break;
            case 'upload-my-project-file':
                require_once 'components/Teacher/MyProjects/upload_my_project_file.php';
                break;

            // ProjectPage
            case 'add-project':
                require_once 'components/Teacher/ProjectsPage/add_project.php';
                break;
            case 'delete-project':
                require_once 'components/Teacher/ProjectsPage/delete_project.php';
                break;
            case 'get-project':
                require_once 'components/Teacher/ProjectsPage/get_projects.php';
                break;
            case 'update-project':
                require_once 'components/Teacher/ProjectsPage/update_project.php';
                break;

            // ProjectDocs
            case 'get-project-docs':
                require_once 'components/Teacher/ProjectDocs/get_project_docs.php';
                break;
            case 'create-project-doc':
                require_once 'components/Teacher/ProjectDocs/create_project_doc.php';
                break;
            case 'upload-project-file':
                require_once 'components/Teacher/ProjectDocs/upload_project_file.php';
                break;

            // ProjectLinks
            case 'get-project-links':
                require_once 'components/Teacher/ProjectLinks/get_project_links.php';
                break;
            case 'create-project-links':
                require_once 'components/Teacher/ProjectLinks/save_project_links.php';
                break;
            case 'save-project-links':
                require_once 'components/Teacher/ProjectLinks/save_project_links.php';
                break;

            // ProjectReports
            case 'get-project-reports':
                require_once 'components/Teacher/ProjectReports/get_project_reports.php';
                break;

            // ScheduleTasks
            case 'create-schedule-task':
                require_once 'components/Teacher/ScheduleTasks/create_schedule_task.php';
                break;
            case 'get-schedule-tasks':
                require_once 'components/Teacher/ScheduleTasks/get_schedule_tasks.php';
                break;
            case 'update-task-status':
                require_once 'components/Teacher/ScheduleTasks/update_task_status.php';
                break;

            // Students
            case 'get-teacher-students':
                require_once 'components/Teacher/Students/get_students.php';
                break;

            // TransferRequests
            case 'create-transfer-request':
                require_once 'components/Teacher/TransferRequests/create_transfer_request.php';
                break;
            case 'get-transfer-requests':
                require_once 'components/Teacher/TransferRequests/get_transfer_requests.php';
                break;
            case 'update-transfer-status':
                require_once 'components/Teacher/TransferRequests/update_transfer_status.php';
                break;

            /* -------- Student -------- */

            // Transcript
            case 'transcript-api':
                require_once 'components/Student/Transcript/transcript_api.php';
                break;

            // Portfolio
            case 'get-portfolio':
                require_once 'components/Student/Portfolio/get_portfolio.php';
                break;
            case 'get-portfolio-detail':
                require_once 'components/Student/Portfolio/get_portfolio_detail.php';
                break;
            case 'save-portfolio':
                require_once 'components/Student/Portfolio/save_portfolio.php';
                break;
            case 'delete-portfolio':
                require_once 'components/Student/Portfolio/delete_portfolio.php';
                break;
                
            case 'sidebar':
                require_once 'components/sidebar.php';
                break;

        default:
            http_response_code(404);
            echo json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>
