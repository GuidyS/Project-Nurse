<?php
// 1. ตั้งค่า Headers สำหรับการเชื่อมต่อกับ React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. ตั้งค่าฐานข้อมูล (ใช้ค่าตาม docker-compose.yml ของคุณ)
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

$action = $_GET['action'] ?? '';

switch ($action) {
    // === 1. ดึงรายชื่อวิชาทั้งหมด ===
    case 'get_courses':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                $sql = "SELECT 
                            s.subject_id AS id, 
                            s.subject_code AS code, 
                            s.subject_name_th AS name, 
                            s.credit AS credits,
                            (SELECT COUNT(enrollment_id) FROM enrollment WHERE subject_id = s.subject_id) AS students,
                            (SELECT COUNT(clo_id) FROM clo WHERE subject_id = s.subject_id) AS cloCount,
                            '1/2567' AS semester,
                            '1' AS section
                        FROM subject s";
                $stmt = $pdo->query($sql);
                $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // แปลงค่าให้เป็นตัวเลขตามที่ React ต้องการ
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

    // === 2. ดึงรายชื่อนักศึกษาตามวิชา ===
    case 'get_students':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $course_id = $_GET['course_id'] ?? 0;
            try {
                $sql = "SELECT 
                            en.enrollment_id AS id,
                            st.student_code AS studentId,
                            CONCAT(st.title, st.first_name_th, ' ', st.last_name_th) AS name,
                            en.grade
                        FROM enrollment en
                        JOIN student st ON en.student_id = st.student_id
                        WHERE en.subject_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$course_id]);
                $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($students as &$student) {
                    $student['id'] = (int)$student['id'];
                    $student['grade'] = $student['grade'] ?: "-"; // ถ้าไม่มีเกรดให้เป็น "-"
                }
                echo json_encode(["status" => "success", "data" => $students]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;

    // === 3. อัปเดตเกรด ===
    case 'update_grade':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            if (!$input || !isset($input['id'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid input data"]);
                exit();
            }
            try {
                $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':id' => $input['id'],
                    ':grade' => $input['grade'] === "-" ? null : $input['grade'] // ถ้าเป็น "-" ให้บันทึกเป็น NULL
                ]);
                echo json_encode(["status" => "success", "message" => "Grade updated"]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;
}
?>