<?php
header("Content-Type: application/json; charset=UTF-8");

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
// รับค่า action เพื่อกำหนดว่าจะทำอะไร (ตรวจสอบทั้ง action ตรงๆ และ page จาก Router)
$action = $_GET['action'] ?? $_GET['page'] ?? '';

switch ($action) {
    // ==========================================
    // API: ดึงรายชื่อวิชาทั้งหมด
    // ==========================================
    case 'get_courses':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                
                $user_id = $_SESSION['user_id'] ?? null;
                if (!$user_id) {
                    http_response_code(401);
                    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
                    exit();
                }

                // 1. ดึงรายชื่ออาจารย์ทั้งหมดมาทำ Lookup
                $sql_faculty = "SELECT faculty_id as id, CONCAT(IFNULL(title,''), ' ', first_name_th, ' ', last_name_th) as name FROM faculty";
                $stmt_faculty = $pdo->query($sql_faculty);
                $faculties = $stmt_faculty->fetchAll(PDO::FETCH_ASSOC);
                
                $facultyMap = [];
                foreach ($faculties as $f) {
                    $facultyMap[$f['id']] = $f['name'];
                }

                // 2. ดึงจาก JSON หลักสูตรว่าใครสอนวิชาไหนบ้าง
                $stmt_fw = $pdo->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
                $row_fw = $stmt_fw->fetch(PDO::FETCH_ASSOC);
                $mappingData = $row_fw ? json_decode($row_fw['mapping_json'], true) : [];

                // 3. ดึงรายวิชาทั้งหมดในระบบที่มีสถานะ Active
                $sql = "
                    SELECT 
                        s.subject_id AS id, 
                        s.subject_code AS code, 
                        s.subject_name_th AS name, 
                        s.credit AS credits,
                        (SELECT COUNT(enrollment_id) FROM enrollment WHERE subject_id = s.subject_id) AS students,
                        0 AS cloCount,
                        '1/2567' AS semester
                    FROM subject s
                    WHERE s.is_active = 1
                    ORDER BY s.subject_code ASC
                ";
                $stmt = $pdo->query($sql);
                $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($courses as &$course) {
                    $code = $course['code'];
                    $instructorId = $mappingData['subject_mappings'][$code]['instructor_id'] ?? null;
                    $instructorName = $instructorId ? ($facultyMap[$instructorId] ?? 'ไม่ทราบชื่ออาจารย์') : null;

                    $course['id'] = (int)$course['id'];
                    $course['credits'] = (int)$course['credits'];
                    $course['students'] = (int)$course['students'];
                    $course['cloCount'] = (int)$course['cloCount'];
                    $course['instructor_id'] = $instructorId ? (string)$instructorId : null;
                    $course['instructor'] = $instructorName;
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
                // ดึงเฉพาะ ชื่อ รหัส นศ. และเกรด
                $sql = "
                    SELECT 
                        en.enrollment_id AS id,
                        st.student_id AS studentId,
                        CONCAT(st.title, st.first_name_th, ' ', st.last_name_th) AS name,
                        en.grade
                    FROM enrollment en
                    JOIN student st ON en.student_id = st.student_id
                    WHERE en.subject_id = ?
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$course_id]);
                $students_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $students = [];
                foreach ($students_raw as $st) {
                    $students[] = [
                        "id" => (int)$st['id'],
                        "studentId" => $st['studentId'],
                        "name" => $st['name'],
                        "midterm" => null,
                        "final" => null,
                        "assignment" => null,
                        "grade" => $st['grade'] ?? '-'
                    ];
                }

                echo json_encode(["status" => "success", "data" => $students]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;

    // ==========================================
    // API: อัปเดตเกรดของนักศึกษา
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
                // ค้นหาว่า id ที่ส่งมามีอยู่ใน enrollment_id หรือไม่
                $stmt = $pdo->prepare("SELECT enrollment_id FROM enrollment WHERE enrollment_id = ?");
                $stmt->execute([$input['id']]);
                $enrollment_id = $stmt->fetchColumn();

                if ($enrollment_id) {
                    $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([
                        ':id' => $enrollment_id,
                        ':grade' => $input['grade']
                    ]);
                } else {
                    $subject_id = $input['subject_id'] ?? null;
                    if ($subject_id) {
                        // ตรวจสอบเผื่อว่ามีแถวลงทะเบียนด้วย student_id และ subject_id แล้ว
                        $stmt = $pdo->prepare("SELECT enrollment_id FROM enrollment WHERE student_id = ? AND subject_id = ?");
                        $stmt->execute([$input['id'], $subject_id]);
                        $enrollment_id = $stmt->fetchColumn();

                        if ($enrollment_id) {
                            $sql = "UPDATE enrollment SET grade = :grade WHERE enrollment_id = :id";
                            $stmt = $pdo->prepare($sql);
                            $stmt->execute([
                                ':id' => $enrollment_id,
                                ':grade' => $input['grade']
                            ]);
                        } else {
                            // ทำการเพิ่มแถวลงทะเบียนนักศึกษาจริงอัตโนมัติ
                            $sql = "INSERT INTO enrollment (student_id, subject_id, grade, status, academic_year, semester, section) 
                                    VALUES (:student_id, :subject_id, :grade, 'Active', 2567, 1, 1)";
                            $stmt = $pdo->prepare($sql);
                            $stmt->execute([
                                ':student_id' => $input['id'],
                                ':subject_id' => $subject_id,
                                ':grade' => $input['grade']
                            ]);
                        }
                    }
                }

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