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
            case 'export-data':
                require_once 'components/Admin/export-data.php'; 
                break;
            case 'get-import-history':
                require_once 'components/Admin/get_import_history.php'; // ชื่อไฟล์จากที่คุณส่งมา
                break;

            /* -------- Teacher -------- */

            // CLOManagement
            case 'get_clo_management':
                require_once 'components/Teacher/CLOManagement/get_clo_management.php';
                break;
            case 'save_clo_management':
                require_once 'components/Teacher/CLOManagement/save_clo_management.php';
                break;

            // CLOMap
            case 'get-clo-map':
                require_once 'components/Teacher/CLOMap/get_clo_map.php';
                break;
            case 'save-clo-map':
                require_once 'components/Teacher/CLOMap/save_clo_map.php';
                break;

            // MyCourses                
            case 'get_teacher_courses_overview':
                require_once 'components/Teacher/MyCourses/get_teacher_courses_overview.php';
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

                
            case 'sidebar':
                require_once 'components/sidebar.php';
                break;

        default:
            http_response_code(404);
            echo json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>