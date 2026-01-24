<?php

    require_once __DIR__ . '/../../config/config.php';

    // 1. เพิ่ม CORS Headers เพื่อให้ React (คนละ Port) คุยกับ PHP ได้
    header("Access-Control-Allow-Origin: http://localhost:5173"); // หรือ http://localhost:3000 ตาม Port React ของคุณ
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json; charset=UTF-8");

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        exit(0);
    }

    // เริ่ม Session
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    class Auth {

        function Login() {
            if(isset($_POST['login'])) {
                $username = $_POST['username'];
                $password = $_POST['password'];

                $db = new Connect;

                $sql = "SELECT users.*, 
                                student.title AS student_title,
                                student.first_name_th AS student_first_name,
                                student.last_name_th AS student_last_name,
                                faculty.title AS faculty_title,
                                faculty.first_name_th AS faculty_first_name,
                                faculty.last_name_th AS faculty_last_name
                        FROM users 
                        LEFT JOIN student ON users.username = student.student_code
                        LEFT JOIN faculty ON users.username = faculty.faculty_id
                        WHERE users.username = :username";

                $stmt = $db->prepare($sql);
                $stmt->execute(['username' => $username]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if($user) {
                    if(password_verify($password, $user['password_hash'])) {
                        
                        $_SESSION['user_id'] = $user['user_id'];
                        $_SESSION['username'] = $user['username'];
                        $_SESSION['role_id'] = $user['role_id'];

                        if ($user['role_id'] == 4) {
                            $_SESSION['name'] = $user['student_title'] . $user['student_first_name'] . ' ' . $user['student_last_name'];
                        } else {
                            $_SESSION['name'] = $user['faculty_title'] . $user['faculty_first_name'] . ' ' . $user['faculty_last_name'];
                        }

                        // [เปลี่ยน] ส่ง JSON กลับไปบอก React ว่าสำเร็จ พร้อม Role
                        echo json_encode([
                            "status" => "success",
                            "message" => "Login successful",
                            "role_id" => $user['role_id'],
                            "user" => [
                                "username" => $user['username'],
                                "name" => $_SESSION['name']
                            ]
                        ]);
                        exit();
                    }
                }

                // [เปลี่ยน] ส่ง JSON Error
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"]);
                exit();
            }
        }

        function Register() {
            if (isset($_POST['register'])) {
                $username = $_POST['username'];
                $password_raw = $_POST['password'];
                $password = password_hash($password_raw, PASSWORD_DEFAULT);
                $role_input = $_POST['role'];

                $role = 0;
                if ($role_input === 'super-admin') $role = 1;
                elseif ($role_input === 'admin') $role = 2;
                elseif ($role_input === 'teacher') $role = 3;
                elseif ($role_input === 'student') $role = 4;

                if ($role == 0) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Role ไม่ถูกต้อง"]);
                    exit();
                }

                $db = new Connect;

                // เช็ค Username ซ้ำ
                $checkUserStmt = $db->prepare("SELECT user_id FROM users WHERE username = :username");
                $checkUserStmt->execute(['username' => $username]);

                if ($checkUserStmt->rowCount() > 0) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Username นี้ถูกใช้งานแล้ว"]);
                    exit();
                }

                // เช็คว่ามีในระบบจริงไหม
                $table_to_check = ($role == 4) ? "student" : "faculty";
                $column_to_check = ($role == 4) ? "student_code" : "faculty_id";

                $checkDbStmt = $db->prepare("SELECT $column_to_check FROM $table_to_check WHERE $column_to_check = :id");
                $checkDbStmt->execute(['id' => $username]);

                if ($checkDbStmt->rowCount() == 0) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "ไม่พบรหัส $username ในฐานข้อมูล $table_to_check"]);
                    exit();
                }

                try {
                    $insertStmt = $db->prepare("INSERT INTO users (username, password_hash, role_id) VALUES (:username, :password, :role)");
                    $result = $insertStmt->execute([
                        'username' => $username,
                        'password' => $password,
                        'role' => $role
                    ]);

                    if ($result) {
                        $new_user_id = $db->lastInsertId();
                        $updateLinkSql = "UPDATE $table_to_check SET user_id = :uid WHERE $column_to_check = :code";
                        $updateStmt = $db->prepare($updateLinkSql);
                        $updateStmt->execute(['uid' => $new_user_id, 'code' => $username]);

                        echo json_encode(["status" => "success", "message" => "Registration successful"]);
                        exit();
                    }
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
                    exit();
                }
            }
        }

        function Logout() {
            // ล้างค่า Session ทั้งหมด
            session_unset();
            session_destroy();

            // ส่ง JSON กลับไปบอกว่าสำเร็จ
            echo json_encode(["status" => "success", "message" => "Logout successful"]);
            exit();
        }
    }

    $Auth = new Auth;
    
    if(isset($_POST['login'])) {
        $Auth->Login();
    } elseif(isset($_POST['register'])) {
        $Auth->Register();
    } elseif(isset($_POST['logout'])) {
        $Auth->Logout();
    }
?>