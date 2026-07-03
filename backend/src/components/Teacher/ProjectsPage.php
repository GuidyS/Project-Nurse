<?php
// Dispatcher ของ ?page=projectspage — แยกตาม HTTP method ไปยังไฟล์ CRUD ในโฟลเดอร์ ProjectsPage/
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':    require __DIR__ . '/ProjectsPage/get_projects.php';   break;
    case 'POST':   require __DIR__ . '/ProjectsPage/add_project.php';    break;
    case 'PUT':    require __DIR__ . '/ProjectsPage/update_project.php'; break;
    case 'DELETE': require __DIR__ . '/ProjectsPage/delete_project.php'; break;
    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
