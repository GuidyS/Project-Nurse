<?php
// ส่วนตั้งค่า CORS (อนุญาตให้ Frontend เข้าถึงได้)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// รองรับ preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$page = isset($_GET['page']) ? $_GET['page'] : '';

switch ($page) {
    case 'Login':
        require_once 'components/Login/Login.php';
        break;
    case 'Login-Register':
        require_once 'components/Login-Register/login-register.php';
        break;
    case 'profile':
        require_once 'components/ProfilePage/Profilepage.php';
        break;
    case 'student':
        require_once 'components/StudentPage/students.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "API endpoint is not found!"]);
        break;
}
?>