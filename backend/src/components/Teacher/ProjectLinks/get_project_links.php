<?php
if (session_status() === PHP_SESSION_NONE) session_start();

// ค้นหาไฟล์ config อัตโนมัติ
$possible_paths = [
    __DIR__ . '/config/config.php',
    __DIR__ . '/../config/config.php',
    __DIR__ . '/../../config/config.php'
];
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        break;
    }
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    $db = new Connect();

    $stmt = $db->query("SELECT project_id AS id, project_name_th AS name, mapping_json FROM project ORDER BY project_id ASC");
    $projects_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = [];
    $matrix = [];

    foreach ($projects_raw as $row) {
        $pid = $row['id'];
        $projects[] = ['id' => $pid, 'name' => $row['name']];

        if (!empty($row['mapping_json'])) {
            $decoded = json_decode($row['mapping_json'], true);
            $matrix[$pid] = [
                'plos' => $decoded['plos'] ?? [],
                'ylos' => $decoded['ylos'] ?? [],
                'clos' => $decoded['clos'] ?? []
            ];
        } else {
            $matrix[$pid] = ['plos' => [], 'ylos' => [], 'clos' => []];
        }
    }

    // --- Mockup ข้อมูลชุดตัวเลือกเป้าหมายแบบมีคำอธิบายประกอบ ---
    $plos = [
        ['code' => 'PLO1', 'description' => 'PLO1: ประยุกต์ใช้ความรู้ด้านวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศในการแก้ปัญหา'],
        ['code' => 'PLO2', 'description' => 'PLO2: ออกแบบและพัฒนาซอฟต์แวร์ตามหลักวิศวกรรมซอฟต์แวร์ที่เป็นมาตรฐาน'],
        ['code' => 'PLO3', 'description' => 'PLO3: สื่อสารและทำงานร่วมกับผู้อื่นในสภาพแวดล้อมที่หลากหลายได้อย่างมีประสิทธิภาพ'],
        ['code' => 'PLO4', 'description' => 'PLO4: มีจรรยาบรรณวิชาชีพและความรับผิดชอบต่อสังคม'],
        ['code' => 'PLO5', 'description' => 'PLO5: ใฝ่รู้และสามารถเรียนรู้เทคโนโลยีใหม่ๆ ด้วยตนเองอย่างต่อเนื่อง']
    ];

    $ylos = [
        ['code' => 'YLO1', 'description' => 'YLO1: สร้างพื้นฐานการคิดเชิงคำนวณและการเขียนโปรแกรมเบื้องต้น'],
        ['code' => 'YLO2', 'description' => 'YLO2: พัฒนาแอปพลิเคชันขนาดเล็กและจัดการระบบฐานข้อมูลได้'],
        ['code' => 'YLO3', 'description' => 'YLO3: ประยุกต์เทคโนโลยีขั้นสูงในการแก้โจทย์ปัญหาเชิงอุตสาหกรรม'],
        ['code' => 'YLO4', 'description' => 'YLO4: สร้างสรรค์งานวิจัยหรือนวัตกรรมซอฟต์แวร์พร้อมใช้']
    ];

    $clos = [
        ['code' => 'CLO1', 'description' => 'CLO1: อธิบายสถาปัตยกรรมและโครงสร้างของเทคโนโลยีที่ใช้ในโครงการได้'],
        ['code' => 'CLO2', 'description' => 'CLO2: พัฒนาและติดตั้งระบบตามข้อกำหนดของโครงงานวิชาชีพ'],
        ['code' => 'CLO3', 'description' => 'CLO3: วิเคราะห์ ประเมินผล และทดสอบประสิทธิภาพของระบบที่สร้างขึ้น'],
        ['code' => 'CLO4', 'description' => 'CLO4: นำเสนอผลงานและจัดทำเอกสารประกอบทางเทคนิคได้อย่างถูกต้อง']
    ];

    echo json_encode([
        "status" => "success",
        "data" => [
            "projects" => $projects,
            "plos" => $plos,
            "ylos" => $ylos,
            "clos" => $clos,
            "links" => empty($matrix) ? new stdClass() : $matrix
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>