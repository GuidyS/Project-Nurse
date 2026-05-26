<?php
session_start();
require_once '/../../config/config.php';

try {
    $db = new Connect();
    $student_id = $_SESSION['username']; // ใช้รหัสนักศึกษาจากระบบ Login

    // Query เพื่อ Join ข้อมูลวิชาและเกรด
    // (หมายเหตุ: ปรับชื่อตาราง 'grades' ตามที่คุณตั้งจริงใน DB)
    $sql = "SELECT s.subject_code AS code, s.subject_name_th AS name,
                   s.credit AS credits, g.grade_letter AS grade, g.grade_point,
                   g.semester, g.year
            FROM grades g
            JOIN subject s ON g.subject_id = s.subject_id
            WHERE g.student_id = :student_id
            ORDER BY g.year DESC, g.semester DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([':student_id' => $student_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $results
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}