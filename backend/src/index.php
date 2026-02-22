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
                break;
            case 'transcript':
                require_once 'components/Transcript/transcript-api.php';
                break;

            case 'sidebar':
            // 1. ตรวจสอบความปลอดภัย (ตัวอย่างการดึง user_id)
            // หากระบบคุณใช้ session_start() ไว้ที่หัวไฟล์ index.php อยู่แล้ว 
            // ก็สามารถใช้ $_SESSION['user_id'] ได้เลย
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

            if ($user_id) {
                // 2. เรียกใช้ไฟล์ sidebar.php 
                // Path นี้ต้องตรงกับโฟลเดอร์ที่คุณเก็บไฟล์ sidebar.php ไว้จริง
                require_once 'components/sidebar.php'; 
            } else {
                http_response_code(401);
                echo json_encode(["message" => "กรุณาระบุ User ID"]);
            }
            break;
        
        default:
            http_response_code(404);
            echo json_encode(["error" => "API endpoint is not found!"]);
            break;
    }

?>