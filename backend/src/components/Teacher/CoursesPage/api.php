<?php
// กำหนด Headers สำหรับการทำงานแบบ API (รองรับ CORS สำหรับ React)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// จัดการกับ Preflight Request ของเบราว์เซอร์
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. ตั้งค่าการเชื่อมต่อฐานข้อมูล (เปลี่ยนข้อมูลตามจริง)
$host = "db";
$dbname = "MYSQL_DATABASE"; 
$username = "MYSQL_USER";   
$password = "MYSQL_PASSWORD";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", "root", "MYSQL_ROOT_PASSWORD");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e2) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database connection failed"]);
        exit();
    }
}
// รับค่า action เพื่อกำหนดว่าจะทำอะไร
$action = $_GET['action'] ?? '';

switch ($action) {
    // ==========================================
    // API: ดึงรายชื่อวิชาทั้งหมด
    // ==========================================
    case 'get_courses':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                // ดึงรายวิชา ไม่ต้องใช้ Section ในหน้าเว็บ
                $sql = "
                    SELECT 
                        s.subject_id AS id, 
                        s.subject_code AS code, 
                        s.subject_name_th AS name, 
                        s.credit AS credits,
                        (SELECT COUNT(enrollment_id) FROM enrollment WHERE subject_id = s.subject_id) AS students,
                        (SELECT COUNT(clo_id) FROM clo WHERE subject_id = s.subject_id) AS cloCount,
                        '1/2567' AS semester
                    FROM subject s
                ";
                $stmt = $pdo->query($sql);
                $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($courses as &$course) {
                    $course['id'] = (int)$course['id'];
                    $course['credits'] = (int)$course['credits'];
                    $course['students'] = (int)$course['students'];
                    $course['cloCount'] = (int)$course['cloCount'];
                }

                echo json_encode(["status" => "success", "data" => $courses]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        
        break;

    // ==========================================
    // API: ดึงรายชื่อนักศึกษาและคะแนนตามรหัสวิชา
    // ==========================================
    case 'get_students':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $course_id = $_GET['course_id'] ?? 0;
            try {
                // ดึงเฉพาะ ชื่อ รหัส นศ. และ เกรด
                $sql = "
                    SELECT 
                        en.enrollment_id AS id,
                        st.student_code AS studentId,
                        CONCAT(st.title, st.first_name_th, ' ', st.last_name_th) AS name,
                        en.grade
                    FROM enrollment en
                    JOIN student st ON en.student_id = st.student_id
                    WHERE en.subject_id = ?
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$course_id]);
                $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($students as &$student) {
                    $student['id'] = (int)$student['id'];
                }

                echo json_encode(["status" => "success", "data" => $students]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;

    // ==========================================
    // API: อัปเดตคะแนนและเกรดของนักศึกษา
    // ==========================================
   case 'update_grade':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid input data"]);
                exit();
            }

            try {
                // อัปเดตเฉพาะคอลัมน์ grade
                $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':id' => $input['id'],
                    ':grade' => $input['grade']
                ]);

                echo json_encode(["status" => "success", "message" => "Grade updated successfully"]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;

    // ==========================================
    // API: กรณีไม่พบ Action
    // ==========================================
    default:
    {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "API endpoint not found"]);
        break;
}
}
?>