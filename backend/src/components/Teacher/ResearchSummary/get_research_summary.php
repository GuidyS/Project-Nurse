<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
header("Content-Type: application/json; charset=UTF-8");

$years = [2566, 2567, 2568, 2569, 2570];

$faculty = [
    ['faculty_id' => 1001, 'name' => 'ผศ.ดร.พิชาภรณ์ จันทนกุล', 'note' => 'รับผิดชอบหลักสูตร'],
    ['faculty_id' => 1002, 'name' => 'ผศ.ดร.วัฒนีย์ ปานจินดา', 'note' => 'รับผิดชอบหลักสูตร'],
    ['faculty_id' => 1003, 'name' => 'ผศ.ดร.สุสารี ประคินกิจ', 'note' => 'รับผิดชอบหลักสูตร'],
    ['faculty_id' => 1004, 'name' => 'ดร.สุวรรณา เชียงขุนทด', 'note' => ''],
    ['faculty_id' => 1005, 'name' => 'ผศ.ดร.ชนิดา มัททวางกูร', 'note' => ''],
    ['faculty_id' => 1006, 'name' => 'อาจารย์สุกฤตา ตะการีย์', 'note' => ''],
    ['faculty_id' => 1007, 'name' => 'อาจารย์รัฐกานต์ ขำเขียว', 'note' => ''],
    ['faculty_id' => 1008, 'name' => 'อาจารย์ชัยสิทธิ์ ทันศึก', 'note' => ''],
];

$publications = [
    [
        'id' => 1,
        'title' => 'ผลลัพธ์การใช้นวัตกรรมนุ่มนิ่มอโรม่าคลายเครียดในนักศึกษาพยาบาลชั้นปีที่ 1-4 มหาวิทยาลัยสยาม',
        'journal' => 'วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม',
        'publication_date' => '2023-03-15',
        'buddhist_year' => 2566,
        'publication_type' => 'research',
        'database_level' => 'TCI 2',
        'authors' => [
            ['faculty_id' => 1006, 'name' => 'อาจารย์สุกฤตา ตะการีย์', 'role' => 'corresponding'],
            ['faculty_id' => 1001, 'name' => 'ผศ.ดร.พิชาภรณ์ จันทนกุล', 'role' => 'co_author'],
        ],
    ],
    [
        'id' => 2,
        'title' => 'คุณภาพของผู้นำทางการพยาบาลสำหรับโรงพยาบาลดึงดูดใจ ตามการรับรู้ของผู้บริหารการพยาบาลระดับต้น',
        'journal' => 'วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม',
        'publication_date' => '2023-04-20',
        'buddhist_year' => 2566,
        'publication_type' => 'research',
        'database_level' => 'TCI 2',
        'authors' => [
            ['faculty_id' => 1002, 'name' => 'ผศ.ดร.วัฒนีย์ ปานจินดา', 'role' => 'co_author'],
        ],
    ],
    [
        'id' => 3,
        'title' => 'การรับรู้ทักษะการเรียนรู้ ความมั่นใจ การประยุกต์ใช้ความรู้และความพึงพอใจของนักศึกษาพยาบาลต่อการฝึกปฏิบัติออนไลน์',
        'journal' => 'วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม',
        'publication_date' => '2023-09-10',
        'buddhist_year' => 2566,
        'publication_type' => 'research',
        'database_level' => 'TCI 2',
        'authors' => [
            ['faculty_id' => 1004, 'name' => 'ดร.สุวรรณา เชียงขุนทด', 'role' => 'first_author'],
        ],
    ],
    [
        'id' => 4,
        'title' => 'A Review Article: Fall Incidents and Interior Architecture - Influence of Executive Function in Normal Ageing',
        'journal' => 'Journal of Architectural/Planning Research and Studies',
        'publication_date' => '2023-02-01',
        'buddhist_year' => 2566,
        'publication_type' => 'academic',
        'database_level' => 'TCI 1',
        'authors' => [
            ['faculty_id' => 1004, 'name' => 'ดร.สุวรรณา เชียงขุนทด', 'role' => 'co_author'],
        ],
    ],
    [
        'id' => 5,
        'title' => 'ปัจจัยที่มีความสัมพันธ์กับความวิตกกังวลในการรับวัคซีนป้องกันโควิด 19',
        'journal' => 'วารสารวิจัยสุขภาพและการพยาบาล',
        'publication_date' => '2024-03-20',
        'buddhist_year' => 2567,
        'publication_type' => 'research',
        'database_level' => 'TCI 1',
        'authors' => [
            ['faculty_id' => 1006, 'name' => 'อาจารย์สุกฤตา ตะการีย์', 'role' => 'first_author'],
            ['faculty_id' => 1003, 'name' => 'ผศ.ดร.สุสารี ประคินกิจ', 'role' => 'co_author'],
        ],
    ],
    [
        'id' => 6,
        'title' => 'รัฐกานต์ ขำเขียว และคณะ: ปัจจัยทำนายพฤติกรรมจัดการสุขภาพแบบมีส่วนร่วมในชุมชนริมคลองภาษีเจริญ',
        'journal' => 'วารสารสุขภาพกับการจัดการสุขภาพ',
        'publication_date' => '2024-10-15',
        'buddhist_year' => 2567,
        'publication_type' => 'research',
        'database_level' => 'TCI 1',
        'authors' => [
            ['faculty_id' => 1007, 'name' => 'อาจารย์รัฐกานต์ ขำเขียว', 'role' => 'first_author'],
        ],
    ],
    [
        'id' => 7,
        'title' => 'บทความวิชาการด้านการพยาบาลระยะคลอด ฉบับปรับปรุง',
        'journal' => 'ตำราการพยาบาล',
        'publication_date' => '2026-05-05',
        'buddhist_year' => 2569,
        'publication_type' => 'textbook',
        'database_level' => 'ตำรา',
        'authors' => [
            ['faculty_id' => 1005, 'name' => 'ผศ.ดร.ชนิดา มัททวางกูร', 'role' => 'co_author'],
        ],
    ],
    [
        'id' => 8,
        'title' => 'แนวทางการพัฒนาระบบสุขภาพชุมชนโดยอาจารย์พยาบาล',
        'journal' => 'วารสารวิจัยสุขภาพและการพยาบาล',
        'publication_date' => '2026-02-11',
        'buddhist_year' => 2569,
        'publication_type' => 'research',
        'database_level' => 'TCI 1',
        'authors' => [
            ['faculty_id' => 1008, 'name' => 'อาจารย์ชัยสิทธิ์ ทันศึก', 'role' => 'corresponding'],
        ],
    ],
];

echo json_encode([
    'status' => 'success',
    'data' => [
        'years' => $years,
        'faculty' => $faculty,
        'publications' => $publications,
        'journals' => array_values(array_unique(array_map(fn($item) => $item['journal'], $publications))),
        'rules' => [
            'academic_year' => '1 สิงหาคม - 31 กรกฎาคม',
            'calendar_year' => '1 มกราคม - 31 ธันวาคม',
            'kpi_roles' => ['first_author', 'corresponding'],
        ],
    ],
], JSON_UNESCAPED_UNICODE);
