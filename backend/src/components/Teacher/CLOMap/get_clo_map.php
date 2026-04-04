<?php
session_start();
// อนุญาตให้ React (Frontend) ข้ามโดเมนมาดึงข้อมูลได้
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; // เปลี่ยน Path ให้ตรงกับที่คุณเก็บไฟล์นี้ไว้
requireLogin(); // เรียกฟังก์ชันตรวจ Cookie


$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

try {
    //  ดึงรายชื่อวิชาทั้งหมดที่กำลังเปิดสอนจากตาราง subjects
    $sql_subjects = "SELECT subject_code as code, subject_name_th as name FROM subjects WHERE is_active = 1 ORDER BY subject_code ASC";
    $stmt_subjects = $pdo->prepare($sql_subjects);
    $stmt_subjects->execute();
    $courses = $stmt_subjects->fetchAll(PDO::FETCH_ASSOC);

    //  ดึงโครงสร้าง JSON จากตาราง curriculum_framework
    $sql_framework = "SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1";
    $stmt_framework = $pdo->query($sql_framework);
    $row_framework = $stmt_framework->fetch(PDO::FETCH_ASSOC);

    $plos = [];
    $cloMap = [];

    if ($row_framework && !empty($row_framework['mapping_json'])) {
        $data = json_decode($row_framework['mapping_json'], true);
        
        //  ดึงชื่อหัวข้อ PLO ทั้งหมดมาทำเป็น Header ของตาราง (เช่น ['PLO1', 'PLO2', 'PLO3'])
        if (isset($data['plos']) && is_array($data['plos'])) {
            foreach ($data['plos'] as $plo) {
                $plos[] = $plo['id']; // เก็บเฉพาะ ID ไปแสดงผล
            }
        }

        //  สร้างข้อมูล Mapping (cloMap) เพื่อบอกว่าวิชาไหนติ๊กช่องไหนไว้บ้าง
        // โดยเราจะกวาดข้อมูล PLO ที่ผูกไว้ ทั้งจากระดับวิชา (course_plos) และระดับย่อย (clos) มารวมกัน
        if (isset($data['subject_mappings'])) {
            foreach ($courses as $course) {
                $code = $course['code'];
                $mappedPlos = [];

                if (isset($data['subject_mappings'][$code])) {
                    $subjectData = $data['subject_mappings'][$code];

                    // ก. ดึง PLO ที่ถูกบันทึกมาจากหน้านี้โดยตรง (ตาราง Mapping ภาพรวม)
                    if (isset($subjectData['course_plos'])) {
                        $mappedPlos = array_merge($mappedPlos, $subjectData['course_plos']);
                    }

                    // ข. ดึง PLO ที่ซ่อนอยู่ใน CLO รายข้อ (กรณีที่อาจารย์ไปกรอกในหน้า CLOPage) มารวมด้วย
                    if (isset($subjectData['clos']) && is_array($subjectData['clos'])) {
                        foreach ($subjectData['clos'] as $clo) {
                            if (isset($clo['mapped_plos']) && is_array($clo['mapped_plos'])) {
                                $mappedPlos = array_merge($mappedPlos, $clo['mapped_plos']);
                            }
                        }
                    }
                }
                // ลบค่า PLO ที่ซ้ำกันออก แล้วยัดใส่ array ของวิชานั้นๆ
                $cloMap[$code] = array_values(array_unique($mappedPlos));
            }
        }
    }

    //  ส่งข้อมูลทั้ง 3 ก้อนกลับไปให้ React
    echo json_encode([
        "status" => "success", 
        "data" => [
            "courses" => $courses,
            "plos" => $plos,
            "cloMap" => empty($cloMap) ? new stdClass() : $cloMap // ส่ง object ว่างถ้าไม่มีข้อมูล
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>