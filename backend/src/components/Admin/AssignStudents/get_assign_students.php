<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/assign_students_helpers.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // หน้านี้เป็นของผู้ดูแลระบบเท่านั้น
    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "เฉพาะผู้ดูแลระบบเท่านั้นที่มอบหมายนักศึกษาได้"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $type = assignStudentsResolveType($_GET['advisor_type'] ?? 'advisor');
    [$typeSql, $typeParams] = assignStudentsTypeCondition($type);

    // 1) รายชื่ออาจารย์ + จำนวนนักศึกษาที่ถืออยู่แล้วในประเภทนี้
    $sqlTeachers = "
        SELECT f.faculty_id AS id,
               CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th) AS name,
               (SELECT COUNT(*) FROM student_advisor_mapping sam
                 WHERE sam.faculty_id = f.faculty_id AND $typeSql) AS assigned_count
        FROM faculty f
        ORDER BY f.first_name_th ASC
    ";
    $stmt = $db->prepare($sqlTeachers);
    $stmt->execute($typeParams);
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($teachers as &$t) {
        $t['id'] = (string)$t['id'];
        $t['name'] = trim($t['name']);
        $t['assigned_count'] = (int)$t['assigned_count'];
    }
    unset($t);

    // 2) รายชื่อนักศึกษาทั้งหมด + อาจารย์ที่ถืออยู่ในประเภทนี้ (ถ้ามี)
    $sqlStudents = "
        SELECT s.student_id AS id,
               s.student_id AS student_code,
               CONCAT(IFNULL(s.title,''), s.first_name_th, ' ', s.last_name_th) AS name,
               s.gender,
               s.year_level,
               sam.faculty_id AS assigned_faculty_id,
               CONCAT(IFNULL(f.title,''), ' ', f.first_name_th, ' ', f.last_name_th) AS assigned_faculty_name
        FROM student s
        LEFT JOIN student_advisor_mapping sam
               ON sam.student_id = s.student_id AND $typeSql
        LEFT JOIN faculty f ON f.faculty_id = sam.faculty_id
        ORDER BY s.student_id ASC
    ";
    $stmt = $db->prepare($sqlStudents);
    $stmt->execute($typeParams);
    $students = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $students[] = [
            'id' => (string)$row['id'],
            'student_code' => (string)$row['student_code'],
            'name' => trim((string)$row['name']),
            'gender' => $row['gender'],
            'year_level' => $row['year_level'] === null ? null : (int)$row['year_level'],
            'assigned_faculty_id' => $row['assigned_faculty_id'] === null ? null : (string)$row['assigned_faculty_id'],
            'assigned_faculty_name' => $row['assigned_faculty_name'] ? trim($row['assigned_faculty_name']) : null,
        ];
    }

    // 3) ชั้นปีที่มีอยู่จริง เอาไปทำ dropdown
    $years = $db->query("SELECT DISTINCT year_level FROM student WHERE year_level IS NOT NULL ORDER BY year_level")
                ->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "status" => "success",
        "data" => [
            "advisor_type" => $type['key'],
            "type_label" => $type['label'],
            "limit" => $type['limit'],
            "types" => array_map(
                static fn($key, $meta) => ['value' => $key, 'label' => $meta['label'], 'limit' => $meta['limit']],
                array_keys(assignStudentsTypes()),
                array_values(assignStudentsTypes())
            ),
            "teachers" => $teachers,
            "students" => $students,
            "year_levels" => array_map('intval', $years),
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
