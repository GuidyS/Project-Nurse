<?php
    // ตั้งค่า CORS (ต้องอยู่บรรทัดแรกๆ ก่อน logic อื่น)
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    // --- เพิ่มส่วนนี้เข้าไป ---
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $page = isset($_GET['page']) ? $_GET['page'] : '';

    switch ($page) {
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
        case 'student':
            require_once 'components/StudentPage/api.php';
        case 'CLOPage':
            require_once 'components/CLOPage/api.php';
        case 'CoursesPage':
            require_once 'components/CoursesPage/api.php';
        case 'ProjectsPage':
            require_once 'components/ProjectsPage/api.php';
        case 'NotificationPage':
            require_once 'components/NotificationPage/api.php';
            break;
        
        default:
            http_response_code(404);
            echo json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>