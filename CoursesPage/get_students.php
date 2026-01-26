<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
//"Database Connection String" (สตริงการเชื่อมต่อฐานข้อมูล) = จะเป็นตัวเชื่อมระหว่างโคด PHP กับ MySQL
$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$course_id = $_GET['course_id'] ?? 0;

$sql = "SELECT en.enrollment_id AS id, st.student_code AS studentId,
        CONCAT(st.title, st.first_name_th, ' ', st.last_name_th) AS name, en.grade
        FROM enrollment en JOIN student st ON en.student_id = st.student_id
        WHERE en.subject_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$course_id]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($students as &$student) {
    $student['id'] = (int)$student['id'];
    $student['grade'] = $student['grade'] ?: "-";
}
echo json_encode(["status" => "success", "data" => $students]);
?>