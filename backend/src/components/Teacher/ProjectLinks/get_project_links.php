<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();

    // 1. ดึงโครงการและข้อมูล mapping_json จากตาราง project
    // หมายเหตุ: ใช้ project_name_th แทน project_name ตามโครงสร้างตารางใหม่
    $stmt = $db->query("SELECT project_id AS id, project_name_th AS name, mapping_json FROM project ORDER BY project_id ASC");
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = [];
    $matrix = [];

    // 2. จัดรูปแบบข้อมูลให้ตรงกับที่หน้าบ้าน (ProjectLinks.tsx) ต้องการ
    foreach ($projects_raw as $row) {
        $pid = $row['id'];
        $projects[] = ['id' => $pid, 'name' => $row['name']];

        // การเชื่อมโยงเก็บใน mapping_json.links (แยก namespace ไม่ชนกับ meta ของโครงการ)
        if (!empty($row['mapping_json'])) {
            $decoded = json_decode($row['mapping_json'], true) ?: [];
            $links = $decoded['links'] ?? $decoded; // fallback ข้อมูลเก่าที่เก็บแบบแบน
            $matrix[$pid] = [
                'plos' => $links['plos'] ?? [],
                'ylos' => $links['ylos'] ?? [],
                'clos' => $links['clos'] ?? []
            ];
        } else {
            $matrix[$pid] = ['plos' => [], 'ylos' => [], 'clos' => []];
        }
    }

    // 3. รายชื่อ PLO จากโครงสร้างหลักสูตรจริง (curriculum_framework) — YLO/CLO ใช้ชุดมาตรฐาน
    $plos = [];
    $fw = $db->query("SELECT mapping_json FROM curriculum_framework WHERE is_active = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if ($fw && !empty($fw['mapping_json'])) {
        $fw_data = json_decode($fw['mapping_json'], true) ?: [];
        foreach (($fw_data['plos'] ?? []) as $p) {
            if (!empty($p['plo_id'])) $plos[] = $p['plo_id'];
        }
    }
    if (empty($plos)) $plos = ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'];
    $ylos = ['YLO1', 'YLO2', 'YLO3', 'YLO4'];
    $clos = ['CLO1', 'CLO2', 'CLO3', 'CLO4', 'CLO5'];

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "plos" => $plos,
            "ylos" => $ylos,
            "clos" => $clos,
            "links" => empty($matrix) ? new stdClass() : $matrix
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>