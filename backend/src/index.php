<?php
    // ตั้งค่า CORS (ต้องอยู่บรรทัดแรกๆ ก่อน logic อื่น)
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    // --- เพิ่มส่วนนี้เข้าไป ---
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
            require_once 'components/ProfilePage/ProfilePage.php';
            break;
        case 'student':
            require_once 'components/StudentPage/api.php';
            break;
        case 'transcript':
            require_once 'components/Transcript/transcript-api.php';
            break;
        
        default:
            http_response_code(404);
            echo json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>