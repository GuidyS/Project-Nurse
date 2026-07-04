<?php
    // ตั้งค่า CORS (ต้องอยู่บรรทัดแรกๆ ก่อน logic อื่น)
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");

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
            case 'profile':
                require_once 'components/ProfilePage/api.php';
                break;
            case 'get-notifications':
                require_once 'components/NotificationPage/get_notifications.php';
                break;
            case 'get-notification-students':
                require_once 'components/NotificationPage/get_students.php';
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

            case 'upload':
                require_once 'components/Admin/get-import-history.php';
                break;
            case 'get-users':
                require_once 'components/Admin/get-users.php';
                break;
            case 'manage-user':
                require_once 'components/Admin/manage-user.php';
                break;
            case 'manage-role':
                require_once 'components/Admin/manage-role.php';
                break;
            case 'get-audit-logs':
                require_once 'components/Admin/get-audit-logs.php';
                break;
            case 'get-approval-requests':
                require_once 'components/Admin/get-approval-requests.php';
                break;
            case 'approve-request':
                require_once 'components/Admin/approve-request.php';
                break;
            case 'reject-request':
                require_once 'components/Admin/reject-request.php';
                break;
            case 'export-data':
                require_once 'components/Admin/export-data.php'; 
                break;
            case 'get-import-history':
                require_once 'components/Admin/get-import-history.php'; // ชื่อไฟล์จากที่คุณส่งมา
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
                
            // AdviseNotes
            case 'get-advise-notes':
                require_once 'components/Teacher/AdviseNotes/get_advise_notes.php';
                break;
            case 'save-advise-note':
                require_once 'components/Teacher/AdviseNotes/save_advise_note.php';
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

            // MyProjects
            case 'get-my-projects':
                require_once 'components/Teacher/MyProjects/get_my_projects.php';
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

            // CourseReports
            case 'get-report-filters':
                require_once 'components/Teacher/CourseReports/get_report_filters.php';
                break;
            case 'get-course-report':
                require_once 'components/Teacher/CourseReports/get_course_report.php';
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

            // Students
            case 'get-teacher-students':
                require_once 'components/Teacher/Students/get_students.php';
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
                require_once 'components/Teacher/evidence/download_file.php';
                break;

            // FiveYearSummary
            case 'get-five-year-summary':
                require_once 'components/Teacher/FiveYearSummary/get_five_year_summary.php';
                break;

            // Grades
            case 'get-grading-data':
                require_once 'components/Teacher/Grades/get_grading_data.php';
                break;
            case 'save-grading-data':
                require_once 'components/Teacher/Grades/save_grading_data.php';
                break;

            // MyCourses
            case 'get-teacher-courses-overview':
                require_once 'components/Teacher/MyCourses/get_teacher_courses_overview.php';
                break;

            // PracticalStudents (นักศึกษาฝึกปฏิบัติ)
            case 'get-practical-students':
                require_once 'components/Teacher/PracticalStudents/get_practical_students.php';
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

            // ProjectLinks
            case 'get-project-links':
                require_once 'components/Teacher/ProjectLinks/get_project_links';
                break;
            case 'create-project-links':
                require_once 'components/Teacher/ProjectLinks/save_project_links.php';
                break;

            // ProjectReports
            case 'get-project-reports':
                require_once 'components/Teacher/ProjectReports/get_project_links.php';
                break;

            // ScheduleTasks
            case 'create_schedule_task':
                require_once 'components/Teacher/ScheduleTasks/create_schedule_task.php';
                break;
            case 'get-schedule-tasks':
                require_once 'components/Teacher/ScheduleTasks/get_schedule_tasks.php';
                break;
            case 'update_schedule_task':
                require_once 'components/Teacher/ScheduleTasks/update_schedule_task.php';
                break;
            case 'delete_schedule_task':
                require_once 'components/Teacher/ScheduleTasks/delete_schedule_task.php';
                break;
            case 'update_task_status':
                require_once 'components/Teacher/ScheduleTasks/update_task_status.php';
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

            // CLOManagement
            case 'transcript-api':
                require_once 'components/Student/transcript-api.php';
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
