<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();

    $data = [
        "stats" => [],
        "retention" => [],
        "retentionByYearLevel" => [],
        "recentDropouts" => [],
        "financial" => ["projects" => []],
        "grades" => [],
    ];

    $sql_status = "SELECT status, COUNT(*) as count FROM student GROUP BY status";
    $student_statuses = $db->query($sql_status)->fetchAll(PDO::FETCH_ASSOC);

    $studying = 0;
    $graduated = 0;
    $dropped = 0;

    foreach ($student_statuses as $row) {
        if ($row['status'] === 'Studying') {
            $studying = (int)$row['count'];
        } elseif ($row['status'] === 'Graduated') {
            $graduated = (int)$row['count'];
        } else {
            $dropped += (int)$row['count'];
        }

        $status_th = $row['status'] === 'Studying' ? 'กำลังศึกษา'
            : ($row['status'] === 'Graduated' ? 'สำเร็จการศึกษา' : 'พ้นสภาพ/ลาออก');

        $data['retention'][] = [
            "name" => $status_th,
            "value" => (int)$row['count'],
        ];
    }

    $total_students = $studying + $graduated + $dropped;
    $retention_rate = $total_students > 0
        ? round(($studying + $graduated) / $total_students * 100, 1)
        : 0;
    $graduation_rate = $total_students > 0
        ? round($graduated / $total_students * 100, 1)
        : 0;

    $stmt_fac = $db->query("SELECT COUNT(*) FROM faculty");
    $total_faculty = (int)$stmt_fac->fetchColumn();

    $sql_grades = "SELECT grade, COUNT(*) as count FROM assessments WHERE grade IS NOT NULL AND grade != '-' GROUP BY grade ORDER BY grade ASC";
    try {
        $data['grades'] = $db->query($sql_grades)->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $data['grades'] = [];
    }

    $sql_project = "SELECT project_name_th as name, budget FROM project ORDER BY budget DESC LIMIT 5";
    try {
        $data['financial']['projects'] = $db->query($sql_project)->fetchAll(PDO::FETCH_ASSOC);
        $total_budget = (float)$db->query("SELECT COALESCE(SUM(budget), 0) FROM project")->fetchColumn();
    } catch (Exception $e) {
        $data['financial']['projects'] = [];
        $total_budget = 0;
    }

    $sql_year = "SELECT IFNULL(year_level, 0) as year_level, COUNT(*) as total,
                        SUM(CASE WHEN status = 'Studying' THEN 1 ELSE 0 END) as retained
                 FROM student GROUP BY year_level ORDER BY year_level ASC";
    foreach ($db->query($sql_year)->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $level = (int)$row['year_level'];
        $total = (int)$row['total'];
        $retained = (int)$row['retained'];
        $data['retentionByYearLevel'][] = [
            "level" => $level > 0 ? "ชั้นปีที่ {$level}" : "ไม่ระบุชั้นปี",
            "total" => $total,
            "retained" => $retained,
            "rate" => $total > 0 ? round($retained / $total * 100, 1) : 0,
        ];
    }

    $sql_dropout = "SELECT student_id as studentId,
                           CONCAT(IFNULL(first_name_th,''), ' ', IFNULL(last_name_th,'')) as name,
                           IFNULL(year_level, '-') as year,
                           status as reason
                    FROM student
                    WHERE status NOT IN ('Studying', 'Graduated')
                    ORDER BY student_id DESC
                    LIMIT 10";
    $data['recentDropouts'] = $db->query($sql_dropout)->fetchAll(PDO::FETCH_ASSOC);

    $data['stats'] = [
        "total_students" => $studying,
        "total_enrolled" => $total_students,
        "retention_rate" => $retention_rate,
        "graduation_rate" => $graduation_rate,
        "total_faculty" => $total_faculty,
        "total_budget" => $total_budget,
        "dropped" => $dropped,
        "graduated" => $graduated,
    ];

    echo json_encode(["status" => "success", "data" => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
