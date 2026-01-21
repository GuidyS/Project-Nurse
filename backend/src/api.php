<?php

    // ส่วนตั้งค่า CORS (อนุญาตให้ Frontend เข้าถึงได้)
    // ----------------------------------------------------------------
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    $page = isset($_GET['page']) ? $_GET['page'] : '';

    switch ($page) {
        case 'profile':
            require_once 'components/ProfilePage/api.php';
            break;
        case 'student':
            require_once 'components/StudentPage/api.php';
            break;
        
        default:
            http_response_code(404);
            return json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>